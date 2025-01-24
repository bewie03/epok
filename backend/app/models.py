from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import random

Base = declarative_base()

class RaffleEntry(Base):
    __tablename__ = "raffle_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    wallet_address = Column(String, index=True)
    transaction_hash = Column(String, unique=True, index=True)
    ada_amount = Column(Float)
    epok_amount = Column(Float)
    tickets = Column(Integer, default=1)
    created_at = Column(DateTime, default=func.now())
    epoch_id = Column(Integer, ForeignKey('raffle_epochs.id'))
    epoch = relationship("RaffleEpoch", back_populates="entries")

class RaffleEpoch(Base):
    __tablename__ = "raffle_epochs"
    
    id = Column(Integer, primary_key=True, index=True)
    start_time = Column(DateTime, default=func.now())
    end_time = Column(DateTime)
    is_completed = Column(Boolean, default=False)
    winner_address = Column(String, nullable=True)
    prize_nft_name = Column(String, nullable=True)
    prize_nft_asset_id = Column(String, nullable=True)
    entries = relationship("RaffleEntry", back_populates="epoch")
    
    def select_winner(self):
        """Randomly select a winner based on number of tickets"""
        if not self.entries:
            return None
            
        # Create a list of wallet addresses, repeated by their ticket count
        tickets = []
        for entry in self.entries:
            tickets.extend([entry.wallet_address] * entry.tickets)
            
        if tickets:
            self.winner_address = random.choice(tickets)
            return self.winner_address
        return None

class TokenBurn(Base):
    __tablename__ = "token_burns"
    
    id = Column(Integer, primary_key=True, index=True)
    epoch_id = Column(Integer, ForeignKey('raffle_epochs.id'))
    burn_time = Column(DateTime, default=datetime.utcnow)
    total_tokens_burned = Column(Float)
    transaction_hash = Column(String, unique=True)
