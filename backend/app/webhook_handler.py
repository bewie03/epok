from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
from . import models
from .database import get_db
from blockfrost import BlockFrostApi
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()
router = APIRouter()

# Get our configuration
RAFFLE_WALLET = os.getenv("RAFFLE_WALLET_ADDRESS")
REQUIRED_ADA = 5
REQUIRED_EPOK = float(os.getenv("REQUIRED_EPOK_AMOUNT", "1000"))
EPOK_POLICY_ID = os.getenv("EPOK_POLICY_ID")
EPOK_ASSET_NAME = os.getenv("EPOK_ASSET_NAME")  # This should be the hex-encoded asset name
FULL_ASSET_ID = f"{EPOK_POLICY_ID}{EPOK_ASSET_NAME}"  # Combine policy ID and hex asset name
blockfrost_api = BlockFrostApi(project_id=os.getenv("BLOCKFROST_PROJECT_ID"))

@router.post("/webhook/transaction")
async def handle_transaction(request: Request, db: Session = Depends(get_db)):
    """Handle incoming transactions from Blockfrost webhook"""
    data = await request.json()
    tx_hash = data.get("tx_hash")
    
    if not tx_hash:
        raise HTTPException(status_code=400, detail="No transaction hash provided")
    
    try:
        # Get transaction details from Blockfrost
        tx = await blockfrost_api.transaction_utxos(tx_hash)
        
        # Look for outputs to our raffle wallet
        for output in tx.outputs:
            if output.address == RAFFLE_WALLET:
                # Found payment to our wallet, check amounts
                ada_amount = 0
                epok_amount = 0
                
                # Check each token in the output
                for amount in output.amount:
                    if amount.unit == "lovelace":  # This is ADA
                        ada_amount = amount.quantity / 1_000_000  # Convert lovelace to ADA
                    elif amount.unit == FULL_ASSET_ID:  # This is our specific Epok token
                        epok_amount = amount.quantity
                
                # Verify exactly 5 ADA and required Epok amount
                if ada_amount == REQUIRED_ADA and epok_amount >= REQUIRED_EPOK:
                    # Get sender's address from the first input
                    sender_address = tx.inputs[0].address
                    
                    # Check if sender already has entries
                    current_epoch = db.query(models.RaffleEpoch)\
                        .filter(models.RaffleEpoch.end_time > datetime.utcnow())\
                        .filter(models.RaffleEpoch.is_completed == False)\
                        .first()
                    
                    if not current_epoch:
                        raise HTTPException(status_code=400, detail="No active epoch")
                    
                    # Add new entry (1 ticket)
                    entry = models.RaffleEntry(
                        wallet_address=sender_address,
                        transaction_hash=tx_hash,
                        ada_amount=ada_amount,
                        epok_amount=epok_amount,
                        tickets=1,
                        epoch_id=current_epoch.id
                    )
                    
                    db.add(entry)
                    db.commit()
                    
                    return {
                        "status": "success",
                        "message": "Added 1 ticket for wallet",
                        "wallet": sender_address,
                        "tickets": 1
                    }
                
                # If amounts don't match, ignore this transaction
                return {
                    "status": "ignored",
                    "message": "Invalid amounts",
                    "ada_received": ada_amount,
                    "epok_received": epok_amount
                }
        
        # If we get here, no output was to our wallet
        return {
            "status": "ignored",
            "message": "No payment to raffle wallet"
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
