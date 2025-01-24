import React, { useEffect, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Container } from '@mui/material';
import RaffleInfo from './components/RaffleInfo';
import ParticipantList from './components/ParticipantList';
import Winner from './components/Winner';
import { RaffleStatus } from './components/RaffleStatus';
import axios from 'axios';
import { API_URL } from './config';

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
        {epochData && prizeData && (
          <RaffleInfo
            walletAddress="addr1..." // Replace with your actual wallet address
            epochEnd={epochData.epoch_end}
            prizeInfo={{
              name: prizeData.name,
              imageUrl: prizeData.image_url,
            }}
          />
        )}
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
