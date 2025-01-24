from fastapi import FastAPI, APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
from . import models
from .database import get_db
import os
from dotenv import load_dotenv
from datetime import datetime
import random
from blockfrost import BlockFrostApi

load_dotenv()

REQUIRED_EPOK_AMOUNT = 1000  # Amount of EPOK tokens required
RAFFLE_WALLET_ADDRESS = os.getenv("RAFFLE_WALLET_ADDRESS")  # Your raffle wallet address
EPOK_POLICY_ID = os.getenv("EPOK_POLICY_ID")  # EPOK token policy ID

api = BlockFrostApi(
    project_id=os.environ.get('BLOCKFROST_PROJECT_ID')
)

router = APIRouter()

@router.post("/webhook")
async def handle_webhook(request: Request, db: Session = Depends(get_db)):
    # Verify webhook secret
    webhook_secret = request.headers.get("webhook-secret")
    if webhook_secret != os.getenv("BLOCKFROST_WEBHOOK_SECRET"):
        raise HTTPException(status_code=401, detail="Invalid webhook secret")

    # Parse webhook payload
    payload = await request.json()
    
    try:
        tx = payload["payload"]
        sender_addr = tx["inputs"][0]["address"]
        
        # Check if this is a transaction to our raffle wallet
        if not any(output["address"] == RAFFLE_WALLET_ADDRESS for output in tx["outputs"]):
            return {"status": "ignored", "reason": "not to raffle wallet"}

        # Get current epoch
        current_epoch = db.query(models.RaffleEpoch)\
            .filter(models.RaffleEpoch.end_time > datetime.utcnow())\
            .filter(models.RaffleEpoch.is_completed == False)\
            .first()
        
        if not current_epoch:
            return {"status": "error", "reason": "no active raffle epoch"}

        # Check for the required EPOK amount
        required_amount = int(os.getenv("REQUIRED_EPOK_AMOUNT", "1000"))
        
        for output in tx["outputs"]:
            if output["address"] == RAFFLE_WALLET_ADDRESS:
                amount = int(output.get("amount", [{"quantity": "0"}])[0].get("quantity", "0"))
                if amount >= required_amount:
                    # Add entry to raffle
                    entry = models.RaffleEntry(
                        wallet_address=sender_addr,
                        transaction_hash=tx["hash"],
                        ada_amount=5.0,  # Fixed amount
                        epok_amount=amount,
                        tickets=1,
                        epoch_id=current_epoch.id
                    )
                    
                    db.add(entry)
                    db.commit()
                    
                    # Get total entries for this wallet
                    total_entries = db.query(models.RaffleEntry)\
                        .filter(models.RaffleEntry.wallet_address == sender_addr)\
                        .filter(models.RaffleEntry.epoch_id == current_epoch.id)\
                        .count()
                    
                    return {
                        "status": "success",
                        "message": f"Added raffle entry for {sender_addr}",
                        "total_tickets": total_entries
                    }
        
        return {"status": "ignored", "reason": "insufficient EPOK amount"}
                    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/transaction-webhook")
async def handle_transaction_webhook(request: Request, db: Session = Depends(get_db)):
    # Verify webhook secret
    webhook_secret = request.headers.get("webhook-secret")
    if webhook_secret != os.getenv("BLOCKFROST_WEBHOOK_SECRET"):
        raise HTTPException(status_code=401, detail="Invalid webhook secret")

    # Parse webhook payload
    payload = await request.json()
    
    try:
        tx_hash = payload["tx_hash"]
        return await handle_transaction_webhook(tx_hash, db)
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

async def handle_transaction_webhook(tx_hash: str, db: Session):
    """Handle incoming transaction webhook from Blockfrost"""
    try:
        # Get transaction details
        tx = api.transaction(tx_hash)
        
        # Get UTXOs for this transaction
        utxos = api.transaction_utxos(tx_hash)
        
        # Check if this transaction is to our raffle wallet
        valid_entries = []
        for output in utxos.outputs:
            if output.address == RAFFLE_WALLET_ADDRESS:
                # Check for EPOK tokens
                for asset in output.amount:
                    if asset.unit == EPOK_POLICY_ID:
                        if int(asset.quantity) >= REQUIRED_EPOK_AMOUNT:
                            # Valid entry found
                            valid_entries.append({
                                'wallet_address': tx.inputs[0].address,  # Sender's address
                                'ada_amount': output.amount[0].quantity,  # ADA amount
                                'epok_amount': asset.quantity,
                                'transaction_hash': tx_hash
                            })
        
        # Add valid entries to database
        current_epoch = get_or_create_current_epoch(db)
        for entry in valid_entries:
            new_entry = models.RaffleEntry(
                epoch_id=current_epoch.id,
                wallet_address=entry['wallet_address'],
                ada_amount=entry['ada_amount'],
                epok_amount=entry['epok_amount'],
                transaction_hash=entry['transaction_hash'],
                tickets=1  # Can modify this based on amount sent
            )
            db.add(new_entry)
        
        db.commit()
        return {"status": "success", "entries_added": len(valid_entries)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing transaction: {str(e)}")

def get_or_create_current_epoch(db: Session):
    """Get current epoch from Cardano network"""
    try:
        latest_epoch = api.epoch_latest()
        current_epoch = db.query(models.RaffleEpoch)\
            .filter(models.RaffleEpoch.epoch_number == latest_epoch.epoch)\
            .first()
        
        if not current_epoch:
            current_epoch = models.RaffleEpoch(
                epoch_number=latest_epoch.epoch,
                start_time=latest_epoch.start_time,
                end_time=latest_epoch.end_time,
                is_completed=False
            )
            db.add(current_epoch)
            db.commit()
        
        return current_epoch
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting epoch: {str(e)}")

@router.get("/entries")
async def get_entries(db: Session = Depends(get_db)):
    """Get all current raffle entries for active epoch"""
    current_epoch = db.query(models.RaffleEpoch)\
        .filter(models.RaffleEpoch.end_time > datetime.utcnow())\
        .filter(models.RaffleEpoch.is_completed == False)\
        .first()
    
    if not current_epoch:
        return {"entries": [], "count": 0}
    
    entries = db.query(models.RaffleEntry)\
        .filter(models.RaffleEntry.epoch_id == current_epoch.id)\
        .all()
    
    return {
        "entries": [
            {
                "wallet_address": entry.wallet_address,
                "tickets": entry.tickets,
                "transaction_hash": entry.transaction_hash
            }
            for entry in entries
        ],
        "count": len(entries)
    }

@router.post("/draw-winner")
async def draw_winner(db: Session = Depends(get_db)):
    """Draw a winner for the current epoch"""
    current_epoch = db.query(models.RaffleEpoch)\
        .filter(models.RaffleEpoch.end_time > datetime.utcnow())\
        .filter(models.RaffleEpoch.is_completed == False)\
        .first()
    
    if not current_epoch:
        raise HTTPException(status_code=400, detail="No active raffle epoch")
    
    entries = db.query(models.RaffleEntry)\
        .filter(models.RaffleEntry.epoch_id == current_epoch.id)\
        .all()
    
    if not entries:
        raise HTTPException(status_code=400, detail="No entries in current epoch")
    
    # Create weighted list based on number of tickets
    weighted_addresses = []
    for entry in entries:
        weighted_addresses.extend([entry.wallet_address] * entry.tickets)
    
    # Select random winner
    winner = random.choice(weighted_addresses)
    
    # Update epoch
    current_epoch.is_completed = True
    current_epoch.winner_address = winner
    db.commit()
    
    return {
        "status": "success",
        "winner": winner,
        "total_entries": len(weighted_addresses)
    }

@router.post("/epochs/new")
async def create_epoch(end_time: datetime, db: Session = Depends(get_db)):
    """Create a new raffle epoch"""
    epoch = models.RaffleEpoch(
        end_time=end_time
    )
    db.add(epoch)
    db.commit()
    
    return {
        "status": "success",
        "epoch_id": epoch.id,
        "end_time": end_time
    }

app = FastAPI()
app.include_router(router)
