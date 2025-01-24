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
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    is_completed = Column(Boolean, default=False)
    winner_address = Column(String, nullable=True)
    entries = relationship("RaffleEntry", back_populates="epoch")
    
    def calculate_progress(self):
        """Calculate the progress percentage of the current epoch"""
        now = datetime.utcnow()
        if now < self.start_time:
            return 0
        if now > self.end_time:
            return 100
            
        total_duration = (self.end_time - self.start_time).total_seconds()
        elapsed_duration = (now - self.start_time).total_seconds()
        return min(100, max(0, (elapsed_duration / total_duration) * 100))
    
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
