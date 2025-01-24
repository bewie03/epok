declare global {
  interface Window {
    env: {
      NODE_ENV: string;
      REACT_APP_API_URL?: string;
    }
  }
}

const isDevelopment = process.env.NODE_ENV === 'development';

export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:8000' 
  : process.env.REACT_APP_API_URL || 'https://your-heroku-app.herokuapp.com';
