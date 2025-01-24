# Epok Raffle System

A Cardano-based raffle system using Epok tokens and NFT prizes, built with React and FastAPI.

## Project Structure
```
/
├── backend/           # FastAPI backend
│   ├── app/          # Application code
│   ├── alembic/      # Database migrations
│   └── tests/        # Backend tests
├── frontend/         # React frontend
│   ├── src/         # Source files
│   ├── public/      # Static files
│   └── tests/       # Frontend tests
└── requirements.txt  # Python dependencies
```

## Setup Instructions

### Backend Setup
1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
Create a `.env` file in the backend directory with:
```
DATABASE_URL=postgresql://user:password@localhost:5432/epok_raffle
BLOCKFROST_PROJECT_ID=your_blockfrost_project_id
RAFFLE_WALLET_ADDRESS=your_cardano_wallet_address
```

### Frontend Setup
1. Install Node.js dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm start
```

## Features
- Automated raffle system running every epoch (5 days)
- Entry requirement: 5 ADA + Epok tokens
- NFT prizes for winners
- Token burning mechanism
- Real-time updates via React frontend
- Secure transaction validation using Blockfrost API
- PostgreSQL database for participant tracking
