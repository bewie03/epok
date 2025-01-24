import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  IconButton,
  Snackbar,
  Button,
  Chip,
  LinearProgress
} from '@mui/material';
import { ContentCopy } from '@mui/icons-material';
import { RAFFLE_WALLET_ADDRESS } from '../config';

interface RaffleInfoProps {
  epochData: any;
  prizeData: any;
}

const RaffleInfo: React.FC<RaffleInfoProps> = ({ epochData, prizeData }) => {
  const [showCopySuccess, setShowCopySuccess] = React.useState(false);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(RAFFLE_WALLET_ADDRESS);
      setShowCopySuccess(true);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h3" gutterBottom>
            Current Raffle Status
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Current Epoch: {epochData?.current_epoch}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Epoch Progress
              </Typography>
              <Typography variant="body2" color="primary">
                {epochData?.progress.toFixed(2) || '0'}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={Number(epochData?.progress) || 0}
              sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                },
              }} 
            />
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ 
            p: 2, 
            bgcolor: 'background.default', 
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Raffle Wallet Address
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: 'monospace',
                  flexGrow: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {RAFFLE_WALLET_ADDRESS}
              </Typography>
              <IconButton
                onClick={handleCopyAddress}
                size="small"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <ContentCopy fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            flexWrap: 'wrap',
            justifyContent: 'center',
            mt: 2 
          }}>
            <Chip
              label={`Time Remaining: ${epochData?.time_remaining || 'Loading...'}`}
              color="primary"
              sx={{ 
                height: 'auto',
                padding: '8px 12px',
                '& .MuiChip-label': {
                  fontSize: '1rem',
                },
              }}
            />
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={showCopySuccess}
        autoHideDuration={2000}
        onClose={() => setShowCopySuccess(false)}
        message="Address copied to clipboard"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Paper>
  );
};

export default RaffleInfo;
