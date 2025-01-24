import React, { useEffect, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Container } from '@mui/material';
import RaffleInfo from './components/RaffleInfo';
import ParticipantList from './components/ParticipantList';
import Winner from './components/Winner';
import { RaffleStatus } from './components/RaffleStatus';
import axios from 'axios';
import { API_URL, REQUIRED_EPOK_AMOUNT, RAFFLE_WALLET_ADDRESS } from './config';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const API_BASE_URL = API_URL;

function App() {
  const [epochData, setEpochData] = useState<any>(null);
  const [prizeData, setPrizeData] = useState<any>(null);
  const [participants, setParticipants] = useState<any>({ participants: [], total_entries: 0 });
  const [winner, setWinner] = useState<any>(null);

  const calculateTimeRemaining = (endTime: string) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return "Raffle Ended";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${days}d:${hours}h:${minutes}m:${seconds}s`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [epochResponse, prizeResponse, participantsResponse, winnerResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/current-epoch`),
          axios.get(`${API_BASE_URL}/api/current-prize`),
          axios.get(`${API_BASE_URL}/api/participants`),
          axios.get(`${API_BASE_URL}/api/latest-winner`),
        ]);

        setEpochData(epochResponse.data);
        setPrizeData(prizeResponse.data);
        setParticipants(participantsResponse.data);
        setWinner(winnerResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">
            Epok Raffle
          </Typography>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        {winner?.winner_address && (
          <Winner
            winnerAddress={winner.winner_address}
            prizeNftName={winner.prize_nft_name}
            epochEnd={winner.epoch_end}
          />
        )}
        <div className="current-raffle">
          <h2>Current Raffle</h2>
          <div className="epoch-info">
            <p>Current Epoch: {epochData?.epoch}</p>
            <p>Progress: {epochData?.progress}%</p>
            <p>Time Remaining: {calculateTimeRemaining(epochData?.end_time)}</p>
          </div>
        </div>
        {epochData && prizeData && (
          <RaffleInfo
            walletAddress="addr1..." // Replace with your actual wallet address
            epochEnd={String(epochData.epoch_end)}
            prizeInfo={{
              name: String(prizeData.name),
              imageUrl: String(prizeData.image_url),
            }}
          />
        )}
        <div className="raffle-instructions">
          <h3>How to Enter:</h3>
          <div className="wallet-info">
            <p>Send at least {REQUIRED_EPOK_AMOUNT} EPOK tokens to:</p>
            <code className="wallet-address">{RAFFLE_WALLET_ADDRESS}</code>
          </div>
          <div className="requirements">
            <h4>Requirements:</h4>
            <ul>
              <li>Minimum {REQUIRED_EPOK_AMOUNT} EPOK tokens</li>
              <li>Must send to the exact wallet address above</li>
              <li>Entry is automatic once transaction is confirmed</li>
            </ul>
          </div>
        </div>
        <ParticipantList 
          participants={participants.participants} 
          totalTickets={participants.total_entries}
        />
        <RaffleStatus />
      </Container>
    </ThemeProvider>
  );
}

export default App;
