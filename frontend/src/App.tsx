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
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText 
} from '@mui/material';
import { Circle as CircleIcon } from '@mui/icons-material';
import RaffleInfo from './components/RaffleInfo';
import ParticipantList from './components/ParticipantList';
import axios from 'axios';
import { API_URL, REQUIRED_EPOK_AMOUNT, RAFFLE_WALLET_ADDRESS } from './config';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3',
    },
    background: {
      default: '#0a1929',
      paper: '#132f4c',
    },
  },
  typography: {
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          padding: '24px',
          borderRadius: '12px',
        },
      },
    },
  },
});

const API_BASE_URL = API_URL;

function App() {
  const [epochData, setEpochData] = useState<any>(null);
  const [prizeData, setPrizeData] = useState<any>(null);
  const [participants, setParticipants] = useState<any>({ participants: [], total_entries: 0 });

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
        const [epochResponse, prizeResponse, participantsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/current-epoch`),
          axios.get(`${API_BASE_URL}/api/current-prize`),
          axios.get(`${API_BASE_URL}/api/participants`),
        ]);

        setEpochData(epochResponse.data);
        setPrizeData(prizeResponse.data);
        setParticipants(participantsResponse.data);
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
      <AppBar position="static" sx={{ mb: 4, background: 'transparent', boxShadow: 'none' }}>
        <Toolbar>
          <Typography variant="h1" component="h1" sx={{ flexGrow: 1 }}>
            Epok Raffle
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ mb: 4, background: 'rgba(19, 47, 76, 0.4)', backdropFilter: 'blur(10px)' }}>
              <Typography variant="h2" gutterBottom>
                Current Raffle
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6" color="primary">
                    Progress
                  </Typography>
                  <Typography variant="h3">
                    {epochData?.progress || 0}%
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6" color="primary">
                    Time Remaining
                  </Typography>
                  <Typography variant="h3">
                    {epochData ? calculateTimeRemaining(epochData.end_time) : 'Loading...'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <Paper elevation={3} sx={{ mb: 4, background: 'rgba(19, 47, 76, 0.4)', backdropFilter: 'blur(10px)' }}>
              <Typography variant="h2" gutterBottom>
                How to Enter
              </Typography>
              <Typography variant="h6" color="primary" gutterBottom>
                Requirements
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={`Send at least ${REQUIRED_EPOK_AMOUNT} EPOK tokens`}
                    secondary="Must be sent in a single transaction"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Send to the exact wallet address below"
                    secondary={RAFFLE_WALLET_ADDRESS}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Entry is automatic"
                    secondary="Your entry will be confirmed once the transaction is verified"
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            {epochData && prizeData && (
              <RaffleInfo
                walletAddress={RAFFLE_WALLET_ADDRESS}
                epochEnd={String(epochData.epoch_end)}
                prizeInfo={{
                  name: String(prizeData.name),
                  imageUrl: String(prizeData.image_url),
                }}
              />
            )}
          </Grid>

          <Grid item xs={12}>
            <Paper elevation={3} sx={{ background: 'rgba(19, 47, 76, 0.4)', backdropFilter: 'blur(10px)' }}>
              <Typography variant="h2" gutterBottom>
                Current Participants
              </Typography>
              <ParticipantList participants={participants} />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

export default App;
