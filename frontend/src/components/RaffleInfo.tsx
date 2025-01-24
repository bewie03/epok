import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  LinearProgress,
  Grid,
  Paper,
  IconButton,
  Tooltip,
  Stack
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
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Prize
            </Typography>
            <Stack direction="row" spacing={4} alignItems="center" justifyContent="center">
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3">
                  1 EPOK NFT
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom sx={{ textAlign: 'center' }}>
              Time Until Next Draw
            </Typography>
            <Stack 
              direction="row" 
              spacing={{ xs: 2, sm: 4 }} 
              justifyContent="center"
              sx={{ mb: 3 }}
            >
              <Box sx={{ textAlign: 'center', minWidth: '80px' }}>
                <Typography variant="h2">
                  {epochData.time_remaining.days}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Days
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', minWidth: '80px' }}>
                <Typography variant="h2">
                  {epochData.time_remaining.hours}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hours
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', minWidth: '80px' }}>
                <Typography variant="h2">
                  {epochData.time_remaining.minutes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Minutes
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', minWidth: '80px' }}>
                <Typography variant="h2">
                  {epochData.time_remaining.seconds}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Seconds
                </Typography>
              </Box>
            </Stack>
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
            <Typography variant="h6" color="text.secondary" gutterBottom>
              How to Enter
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" paragraph>
                1. Send any amount of ADA to the raffle wallet address below
              </Typography>
              <Typography variant="body1" paragraph>
                2. For every 50 ADA sent, you receive 1 EPOK token and 1 raffle ticket
              </Typography>
              <Typography variant="body1" paragraph>
                3. Winners are drawn at the end of each epoch
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Raffle Wallet Address
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 2,
              bgcolor: 'rgba(59, 130, 246, 0.1)',
              p: 2,
              borderRadius: 1
            }}>
              <Typography 
                variant="body2"
                sx={{ 
                  fontFamily: 'monospace',
                  flexGrow: 1,
                  color: 'text.primary'
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
                      bgcolor: 'rgba(59, 130, 246, 0.15)'
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
