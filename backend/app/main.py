from fastapi import FastAPI, HTTPException, Depends, Response
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from . import models, blockfrost_service
from .database import get_db, engine
from . import webhook_handler

# Create database tables
models.Base.metadata.create_all(bind=engine)

load_dotenv()

app = FastAPI(title="Epok Raffle API")

def add_cors_headers(response: Response):
    response.headers["Access-Control-Allow-Origin"] = "https://epok-eight.vercel.app"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

@app.get("/")
async def root(response: Response):
    response = add_cors_headers(response)
    return {"message": "Welcome to Epok Raffle API"}

@app.get("/api/current-epoch")
async def get_current_epoch(response: Response, db: Session = Depends(get_db)):
    response = add_cors_headers(response)
    current_epoch = get_or_create_current_epoch(db)
    return {
        "epoch_start": current_epoch.start_time.isoformat(),
        "epoch_end": current_epoch.end_time.isoformat(),
        "time_remaining": (current_epoch.end_time - datetime.utcnow()).total_seconds()
    }

@app.get("/api/current-prize")
async def get_current_prize(response: Response, db: Session = Depends(get_db)):
    response = add_cors_headers(response)
    current_epoch = get_or_create_current_epoch(db)
    return {
        "prize_type": "NFT",
        "name": current_epoch.prize_nft_name,
        "asset_id": current_epoch.prize_nft_asset_id
    }

@app.get("/api/participants")
async def get_participants(response: Response, db: Session = Depends(get_db)):
    response = add_cors_headers(response)
    current_epoch = get_or_create_current_epoch(db)
    
    entries = db.query(models.RaffleEntry)\
        .filter(models.RaffleEntry.epoch_id == current_epoch.id)\
        .all()
    
    return {
        "participants": [
            {
                "wallet_address": entry.wallet_address,
                "entry_time": entry.entry_time.isoformat(),
                "ada_amount": entry.ada_amount,
                "epok_amount": entry.epok_amount,
                "tickets": entry.tickets
            }
            for entry in entries
        ],
        "total_entries": sum(entry.tickets for entry in entries)
    }

@app.get("/api/entries")
async def get_entries(response: Response, db: Session = Depends(get_db)):
    response = add_cors_headers(response)
    current_epoch = get_or_create_current_epoch(db)
    
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
        "count": sum(entry.tickets for entry in entries)
    }

@app.get("/api/latest-winner")
async def get_latest_winner(response: Response, db: Session = Depends(get_db)):
    response = add_cors_headers(response)
    latest_completed_epoch = db.query(models.RaffleEpoch)\
        .filter(models.RaffleEpoch.is_completed == True)\
        .order_by(models.RaffleEpoch.end_time.desc())\
        .first()
    
    if not latest_completed_epoch or not latest_completed_epoch.winner_wallet_address:
        return {"winner": None}
    
    return {
        "winner": {
            "wallet_address": latest_completed_epoch.winner_wallet_address,
            "prize_name": latest_completed_epoch.prize_nft_name,
            "prize_asset_id": latest_completed_epoch.prize_nft_asset_id
        }
    }

def get_or_create_current_epoch(db: Session):
    """Get current epoch or create new one if previous ended"""
    current_time = datetime.utcnow()
    
    # Check for active epoch
    current_epoch = db.query(models.RaffleEpoch)\
        .filter(models.RaffleEpoch.end_time > current_time)\
        .filter(models.RaffleEpoch.is_completed == False)\
        .first()
    
    if not current_epoch:
        # Create new epoch
        start_time = current_time
        end_time = start_time + timedelta(days=5)
        
        current_epoch = models.RaffleEpoch(
            start_time=start_time,
            end_time=end_time,
            prize_nft_name="Current NFT Prize",  # You'll update this manually
            prize_nft_asset_id="asset1..."  # You'll update this manually
        )
        db.add(current_epoch)
        db.commit()
        
        # Check if there's a completed epoch that needs winner selection
        completed_epoch = db.query(models.RaffleEpoch)\
            .filter(models.RaffleEpoch.end_time <= current_time)\
            .filter(models.RaffleEpoch.is_completed == False)\
            .first()
        
        if completed_epoch:
            # Select winner for completed epoch
            winner = completed_epoch.select_winner()
            completed_epoch.is_completed = True
            db.commit()
    
    return current_epoch

# Include the webhook router
app.include_router(webhook_handler.router)

blockfrost = blockfrost_service.BlockfrostService()
