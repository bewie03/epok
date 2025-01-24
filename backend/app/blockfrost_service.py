from blockfrost import BlockFrostApi, ApiUrls
import os
from dotenv import load_dotenv
from datetime import datetime
from sqlalchemy.orm import Session
from . import models

load_dotenv()

class BlockfrostService:
    def __init__(self):
        project_id = os.getenv("BLOCKFROST_PROJECT_ID")
        self.api = BlockFrostApi(
            project_id=project_id,
            base_url=ApiUrls.mainnet.value
        )
        self.raffle_address = os.getenv("RAFFLE_WALLET_ADDRESS")
        self.epok_policy_id = os.getenv("EPOK_POLICY_ID")

    async def process_transaction(self, tx_hash: str, db: Session, current_epoch: models.RaffleEpoch):
        """Process a transaction and add entries to the raffle"""
        try:
            tx = await self.api.transaction(tx_hash)
            utxos = await self.api.transaction_utxos(tx_hash)
            
            # Process outputs sent to raffle address
            for output in utxos.outputs:
                if output.address == self.raffle_address:
                    ada_amount = 0
                    epok_amount = 0
                    
                    for amount in output.amount:
                        if amount.unit == "lovelace":
                            ada_amount = amount.quantity / 1_000_000  # Convert lovelace to ADA
                        elif amount.unit == self.epok_policy_id:
                            epok_amount = amount.quantity
                    
                    # Validate both ADA and EPOK requirements
                    if ada_amount >= 5 and epok_amount >= 1000:
                        num_tickets = int(ada_amount // 5)
                        
                        # Create entry in database
                        entry = models.RaffleEntry(
                            wallet_address=tx.inputs[0].address,  # Sender's address
                            transaction_hash=tx_hash,
                            ada_amount=ada_amount,
                            epok_amount=epok_amount,
                            tickets=num_tickets,
                            epoch_id=current_epoch.id
                        )
                        
                        db.add(entry)
                        db.commit()
                        
                        return {
                            "valid": True,
                            "tickets": num_tickets,
                            "ada_amount": ada_amount,
                            "epok_amount": epok_amount
                        }
            
            return {"valid": False, "error": "Transaction must include 5 ADA and 1000 EPOK tokens"}
        except Exception as e:
            return {"valid": False, "error": str(e)}
