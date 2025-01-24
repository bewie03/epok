import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  LinearProgress,
  Grid,
  Paper,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { RAFFLE_WALLET_ADDRESS } from '../config';

interface RaffleInfoProps {
  epochData: {
    current_epoch: number;
    progress: number;
    time_remaining: {
      days: number;
      hours: number;
      minutes: number;
      seconds: number;
    };
  };
  prizeData: {
    amount: number;
  } | null;
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 8)}...${address.slice(-8)}`;
}

export default function RaffleInfo({ epochData, prizeData }: RaffleInfoProps) {
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const theme = useTheme();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(RAFFLE_WALLET_ADDRESS);
      setShowCopyTooltip(true);
      setTimeout(() => setShowCopyTooltip(false), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Paper sx={{ p: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          {prizeData && (
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Current Prize Pool
              </Typography>
              <Typography variant="h1" sx={{
                background: 'linear-gradient(to right, #3B82F6, #60A5FA)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}>
                {prizeData.amount} ADA
              </Typography>
            </Box>
          )}
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom sx={{ textAlign: 'center' }}>
              Time Until Next Draw
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: { xs: 2, sm: 4 },
              flexWrap: 'wrap'
            }}>
              <Box sx={{ textAlign: 'center', minWidth: '80px' }}>
                <Typography variant="h2" color="primary">
                  {epochData.time_remaining.days}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Days
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', minWidth: '80px' }}>
                <Typography variant="h2" color="primary">
                  {epochData.time_remaining.hours}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hours
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', minWidth: '80px' }}>
                <Typography variant="h2" color="primary">
                  {epochData.time_remaining.minutes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Minutes
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', minWidth: '80px' }}>
                <Typography variant="h2" color="primary">
                  {epochData.time_remaining.seconds}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Seconds
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body1" color="text.secondary">
                Epoch {epochData.current_epoch} Progress
              </Typography>
              <Typography variant="body2" color="primary" fontWeight="500">
                {epochData.progress.toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={Number(epochData.progress)}
              sx={{ height: 6 }}
            />
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Raffle Wallet Address
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 2,
              bgcolor: 'rgba(59, 130, 246, 0.1)',
              p: 2,
              borderRadius: 2
            }}>
              <Typography 
                variant="body2"
                sx={{ 
                  fontFamily: 'monospace',
                  flexGrow: 1,
                  color: theme.palette.primary.main
                }}
              >
                {shortenAddress(RAFFLE_WALLET_ADDRESS)}
              </Typography>
              <Tooltip 
                open={showCopyTooltip} 
                title="Copied!" 
                placement="top"
              >
                <IconButton 
                  onClick={handleCopy}
                  size="small"
                  sx={{ 
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'rgba(59, 130, 246, 0.15)'
                    }
                  }}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};
