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
      default: '#111827',
      paper: '#1F2937'
    },
    text: {
      primary: '#F9FAFB',
      secondary: '#9CA3AF'
    }
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    h1: { fontSize: '2.5rem', fontWeight: 600 },
    h2: { fontSize: '2rem', fontWeight: 600 },
    h3: { fontSize: '1.5rem', fontWeight: 600 },
    h6: { fontWeight: 500 },
    body1: { fontSize: '1rem', lineHeight: 1.5 },
    body2: { fontSize: '0.875rem', lineHeight: 1.5 }
  },
  shape: {
    borderRadius: 8
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1F2937',
          borderRadius: 12,
          border: '1px solid rgba(156, 163, 175, 0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#111827',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(156, 163, 175, 0.1)',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderRadius: 4,
        },
        bar: {
          borderRadius: 4,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 6,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
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

const EPOCH_START = new Date('2025-01-20T08:44:00+11:00');
const EPOCH_END = new Date('2025-01-25T08:44:00+11:00');
const CURRENT_EPOCH = 535;

function calculateEpochInfo(): EpochData {
  const now = new Date();
  const timeDiff = EPOCH_END.getTime() - now.getTime();
  const totalSeconds = Math.floor(timeDiff / 1000);
  
  // Handle case where we're past the end time
  if (totalSeconds < 0) {
    return {
      current_epoch: CURRENT_EPOCH,
      progress: 100,
      time_remaining: {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      }
    };
  }
  
  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  const epochLength = EPOCH_END.getTime() - EPOCH_START.getTime();
  const timeElapsed = now.getTime() - EPOCH_START.getTime();
  const progress = (timeElapsed / epochLength) * 100;

  return {
    current_epoch: CURRENT_EPOCH,
    progress: Math.min(Math.max(progress, 0), 100), // Clamp between 0-100
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
        bgcolor: 'background.default'
      }}>
        <AppBar position="sticky">
          <Container maxWidth="lg">
            <Toolbar sx={{ px: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
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
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
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
