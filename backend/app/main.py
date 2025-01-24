from fastapi import FastAPI, HTTPException, Depends, Response, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from . import models, blockfrost_service
from .database import get_db, engine
from . import webhook_handler
from blockfrost import BlockFrostApi

# Create database tables
models.Base.metadata.create_all(bind=engine)

load_dotenv()

app = FastAPI(title="Epok Raffle API")

# Configure CORS - Allow the Vercel frontend to access our API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://epok-eight.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create API router
api_router = APIRouter(prefix="/api")

# Initialize Blockfrost client
api = BlockFrostApi(
    project_id=os.environ.get('BLOCKFROST_PROJECT_ID')
)

def get_cardano_epoch_info():
    """Get current Cardano epoch info from Blockfrost"""
    try:
        latest_epoch = api.epoch_latest()
        epoch_end = latest_epoch.end_time
        return {
            "epoch": latest_epoch.epoch,
            "start_time": latest_epoch.start_time,
            "end_time": epoch_end,
            "progress": latest_epoch.progress
        }
    except Exception as e:
        print(f"Error getting epoch info: {e}")
        return None

@api_router.get("/current-epoch")
async def get_current_epoch(db: Session = Depends(get_db)):
    """Get current epoch info synced with Cardano network"""
    cardano_epoch = get_cardano_epoch_info()
    if not cardano_epoch:
        raise HTTPException(status_code=500, detail="Could not fetch Cardano epoch info")
    
    return {
        "epoch": cardano_epoch["epoch"],
        "start_time": cardano_epoch["start_time"],
        "end_time": cardano_epoch["end_time"],
        "progress": cardano_epoch["progress"]
    }

@api_router.get("/current-prize")
async def get_current_prize(db: Session = Depends(get_db)):
    return {
        "prize_type": "ADA",
        "prize_value": "ADA"
    }

@api_router.get("/participants")
async def get_participants(db: Session = Depends(get_db)):
    current_epoch = get_or_create_current_epoch(db)
    
    entries = db.query(models.RaffleEntry)\
        .filter(models.RaffleEntry.epoch_id == current_epoch.id)\
        .all()
    
    total_entries = sum(entry.tickets for entry in entries)
    
    participants_data = []
    for entry in entries:
        participants_data.append({
            "wallet_address": entry.wallet_address,
            "tickets": entry.tickets,
            "ada_amount": entry.ada_amount,
            "transaction_hash": entry.transaction_hash,
            "created_at": entry.created_at.isoformat()
        })
    
    return {
        "participants": participants_data,
        "total_entries": total_entries
    }

@api_router.get("/entries")
async def get_entries(db: Session = Depends(get_db)):
    current_epoch = get_or_create_current_epoch(db)
    
    entries = db.query(models.RaffleEntry)\
        .filter(models.RaffleEntry.epoch_id == current_epoch.id)\
        .all()
    
    entries_data = []
    for entry in entries:
        entries_data.append({
            "wallet_address": entry.wallet_address,
            "tickets": entry.tickets,
            "transaction_hash": entry.transaction_hash,
            "created_at": entry.created_at.isoformat()
        })
    
    return {
        "entries": entries_data
    }

@api_router.get("/latest-winner")
async def get_latest_winner(db: Session = Depends(get_db)):
    """Get the most recent raffle winner"""
    latest_completed = db.query(models.RaffleEpoch)\
        .filter(models.RaffleEpoch.is_completed == True)\
        .order_by(models.RaffleEpoch.end_time.desc())\
        .first()
    
    if latest_completed and latest_completed.winner_address:
        return {
            "winner_address": latest_completed.winner_address,
            "end_time": latest_completed.end_time
        }
    return {"winner_address": None, "end_time": None}

# Include the routers
app.include_router(api_router)
app.include_router(webhook_handler.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Epok Raffle API"}

@app.options("/{rest_of_path:path}")
async def preflight_handler(rest_of_path: str):
    return {"detail": "OK"}

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
            is_completed=False
        )
        db.add(current_epoch)
        db.commit()
    
    return current_epoch

blockfrost = blockfrost_service.BlockfrostService()
