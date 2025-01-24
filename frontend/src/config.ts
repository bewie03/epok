declare global {
  interface Window {
    env: {
      NODE_ENV: string;
      REACT_APP_API_URL?: string;
      REACT_APP_RAFFLE_WALLET_ADDRESS?: string;
      REACT_APP_EPOK_POLICY_ID?: string;
    }
  }
}

// API URL for the backend - using relative path since we're proxying through Vercel
export const API_URL = '';  // Empty string means use same domain

// Raffle Configuration
export const REQUIRED_EPOK_AMOUNT = 1000;
export const RAFFLE_WALLET_ADDRESS = process.env.REACT_APP_RAFFLE_WALLET_ADDRESS || 'addr1...';  // Replace with your actual wallet
export const EPOK_POLICY_ID = process.env.REACT_APP_EPOK_POLICY_ID || '...';  // Replace with actual policy ID

// Cardano network (mainnet or testnet)
export const CARDANO_NETWORK = 'mainnet';
