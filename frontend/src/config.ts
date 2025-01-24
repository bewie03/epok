declare global {
  interface Window {
    env: {
      NODE_ENV: string;
      REACT_APP_API_URL?: string;
      REACT_APP_RAFFLE_WALLET_ADDRESS?: string;
    }
  }
}

// API URL for the backend
export const API_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8000'
  : 'https://epok-raffle-backend.herokuapp.com';  // Heroku backend URL in production

// Required EPOK amount for raffle entry
export const REQUIRED_EPOK_AMOUNT = 1000;

// Cardano network (mainnet or testnet)
export const CARDANO_NETWORK = 'mainnet';

// Raffle wallet address
export const RAFFLE_WALLET_ADDRESS = process.env.REACT_APP_RAFFLE_WALLET_ADDRESS;
