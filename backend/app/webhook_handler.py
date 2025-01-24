from fastapi import FastAPI, APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
from . import models
from .database import get_db
import os
from dotenv import load_dotenv
from datetime import datetime
import random

load_dotenv()

app = FastAPI()

# In-memory storage for raffle entries
# raffle_entries: Set[str] = set()

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
        raffle_wallet = os.getenv("RAFFLE_WALLET_ADDRESS")
        if not any(output["address"] == raffle_wallet for output in tx["outputs"]):
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
            if output["address"] == raffle_wallet:
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

app.include_router(router)
