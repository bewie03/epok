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
    primary: { main: '#3B82F6' },
    background: {
      default: '#0F172A',
      paper: '#1E293B',
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#94A3B8'
    }
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    h1: { fontSize: '2.5rem', fontWeight: 600, letterSpacing: '-0.025em' },
    h2: { fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.025em' },
    h3: { fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.025em' },
    h6: { fontWeight: 500, letterSpacing: '-0.025em' },
    body1: { fontSize: '1rem', lineHeight: 1.5 },
    body2: { fontSize: '0.875rem', lineHeight: 1.5 }
  },
  shape: {
    borderRadius: 12
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#1E293B',
          borderRadius: 16,
          border: '1px solid rgba(148, 163, 184, 0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          backgroundImage: 'none',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
          backdropFilter: 'blur(8px)',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderRadius: 8,
        },
        bar: {
          borderRadius: 8,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

interface PrizeData {
  amount: number;
}

interface ParticipantsData {
  participants: {
    wallet_address: string;
    entry_time: string;
    ada_amount: number;
    epok_amount: number;
    tickets: number;
  }[];
  total_entries: number;
}

interface EpochData {
  current_epoch: number;
  progress: number;
  time_remaining: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}

const EPOCH_LENGTH_DAYS = 5;
const EPOCH_START = new Date('2024-01-25T00:00:00Z');
const CURRENT_EPOCH = 535;

function calculateEpochInfo(): EpochData {
  const now = new Date();
  const timeDiff = now.getTime() - EPOCH_START.getTime();
  const totalSeconds = Math.floor(timeDiff / 1000);
  
  const secondsInEpoch = EPOCH_LENGTH_DAYS * 24 * 60 * 60;
  const secondsIntoCurrentEpoch = totalSeconds % secondsInEpoch;
  const secondsRemaining = secondsInEpoch - secondsIntoCurrentEpoch;
  
  const days = Math.floor(secondsRemaining / (24 * 60 * 60));
  const hours = Math.floor((secondsRemaining % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((secondsRemaining % (60 * 60)) / 60);
  const seconds = secondsRemaining % 60;

  return {
    current_epoch: CURRENT_EPOCH,
    progress: (secondsIntoCurrentEpoch / secondsInEpoch) * 100,
    time_remaining: {
      days,
      hours,
      minutes,
      seconds
    }
  };
}

function App() {
  const [epochData, setEpochData] = useState<EpochData>(calculateEpochInfo());
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
        background: 'radial-gradient(circle at top, #1E293B 0%, #0F172A 100%)',
      }}>
        <AppBar position="sticky">
          <Container maxWidth="lg">
            <Toolbar sx={{ px: 0 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600,
                background: 'linear-gradient(to right, #3B82F6, #60A5FA)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Epok Raffle
              </Typography>
            </Toolbar>
          </Container>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <RaffleInfo epochData={epochData} prizeData={prizeData} />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ 
                p: 3, 
                height: '100%',
                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.9) 0%, rgba(30, 41, 59, 0.6) 100%)',
                backdropFilter: 'blur(8px)',
              }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  color: theme.palette.text.primary,
                  mb: 3
                }}>
                  Participants
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
