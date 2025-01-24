import React, { useEffect, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { 
  CssBaseline, 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Grid, 
  Paper, 
  Box
} from '@mui/material';
import RaffleInfo from './components/RaffleInfo';
import ParticipantList from './components/ParticipantList';
import axios from 'axios';
import { API_URL } from './config';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#2196f3' },
    background: {
      default: '#0a1929',
      paper: 'rgba(19, 47, 76, 0.4)',
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: { fontSize: '2.5rem', fontWeight: 600 },
    h2: { fontSize: '2rem', fontWeight: 500 },
    h3: { fontSize: '1.5rem', fontWeight: 500 },
    h6: { fontWeight: 500 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(20px)',
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(10, 25, 41, 0.7)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
  },
});

interface PrizeData {
  amount: number;
}

interface ParticipantsData {
  participants: Array<{
    wallet_address: string;
    entry_time: string;
    ada_amount: number;
    epok_amount: number;
    tickets: number;
  }>;
  total_entries: number;
}

const EPOCH_LENGTH_DAYS = 5;
const EPOCH_START = new Date('2024-01-25T00:00:00Z'); // Set this to a known epoch start
const CURRENT_EPOCH = 535; // Current known epoch

function calculateEpochInfo() {
  const now = new Date();
  const timeDiff = now.getTime() - EPOCH_START.getTime();
  const daysSinceStart = timeDiff / (1000 * 60 * 60 * 24);
  
  // Calculate time until next epoch
  const daysIntoCurrentEpoch = daysSinceStart % EPOCH_LENGTH_DAYS;
  const daysRemaining = EPOCH_LENGTH_DAYS - daysIntoCurrentEpoch;
  
  const hoursRemaining = Math.floor((daysRemaining % 1) * 24);
  const minutesRemaining = Math.floor((hoursRemaining % 1) * 60);
  const secondsRemaining = Math.floor((minutesRemaining % 1) * 60);

  return {
    current_epoch: CURRENT_EPOCH,
    progress: (daysIntoCurrentEpoch / EPOCH_LENGTH_DAYS) * 100,
    time_remaining: `${Math.floor(daysRemaining)}d ${Math.floor(hoursRemaining)}h ${Math.floor(minutesRemaining)}m ${Math.floor(secondsRemaining)}s`
  };
}

function App() {
  const [epochData, setEpochData] = useState(calculateEpochInfo());
  const [prizeData, setPrizeData] = useState<PrizeData | null>(null);
  const [participants, setParticipants] = useState<ParticipantsData>({ 
    participants: [], 
    total_entries: 0 
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prizeResponse, participantsResponse] = await Promise.all([
          axios.get(`${API_URL}/api/current-prize`),
          axios.get(`${API_URL}/api/participants`),
        ]);

        setPrizeData(prizeResponse.data);
        setParticipants(participantsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    
    // Update epoch data every second
    const epochInterval = setInterval(() => {
      setEpochData(calculateEpochInfo());
    }, 1000);

    // Fetch other data every 30 seconds
    const dataInterval = setInterval(fetchData, 30000);
    
    return () => {
      clearInterval(epochInterval);
      clearInterval(dataInterval);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a1929 0%, #1a3b5d 100%)',
        backgroundAttachment: 'fixed',
      }}>
        <AppBar position="sticky">
          <Toolbar>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Epok Raffle
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <RaffleInfo epochData={epochData} prizeData={prizeData} />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h3" gutterBottom>
                  Current Prize Pool
                </Typography>
                {prizeData && (
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h2" color="primary" sx={{ mb: 1 }}>
                      {prizeData.amount} ADA
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      Draw in: {epochData.time_remaining}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h3" gutterBottom>
                  Current Participants
                </Typography>
                <ParticipantList participants={participants.participants} />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
