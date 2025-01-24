declare global {
  interface Window {
    env: {
      NODE_ENV: string;
      REACT_APP_API_URL?: string;
      REACT_APP_RAFFLE_WALLET_ADDRESS?: string;
    }
  }
}

const isDevelopment = process.env.NODE_ENV === 'development';

// API URL for the backend
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Required EPOK amount for raffle entry
export const REQUIRED_EPOK_AMOUNT = 1000;

// Cardano network (mainnet or testnet)
export const CARDANO_NETWORK = 'mainnet';

// Raffle wallet address
export const RAFFLE_WALLET_ADDRESS = process.env.REACT_APP_RAFFLE_WALLET_ADDRESS;
