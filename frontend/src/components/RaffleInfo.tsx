import React from 'react';
import { Box, Typography, Paper, Container } from '@mui/material';
import Countdown from 'react-countdown';

interface RaffleInfoProps {
  walletAddress: string;
  epochEnd: string;
  prizeInfo: {
    name: string;
    imageUrl: string;
  };
}

const RaffleInfo: React.FC<RaffleInfoProps> = ({ walletAddress, epochEnd, prizeInfo }) => {
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, my: 2 }}>
        <Typography variant="h4" gutterBottom>
          Current Raffle
        </Typography>
        
        <Box sx={{ my: 2 }}>
          <Typography variant="h6">Time Remaining:</Typography>
          <Countdown date={new Date(epochEnd)} />
        </Box>

        <Box sx={{ my: 2 }}>
          <Typography variant="h6">Send Entries To:</Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              wordBreak: 'break-all',
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1
            }}
          >
            {walletAddress}
          </Typography>
        </Box>

        <Box sx={{ my: 2 }}>
          <Typography variant="h6">Current Prize:</Typography>
          <Box sx={{ textAlign: 'center', my: 2 }}>
            <img 
              src={prizeInfo.imageUrl} 
              alt={prizeInfo.name}
              style={{ 
                maxWidth: '100%',
                maxHeight: '300px',
                objectFit: 'contain'
              }}
            />
            <Typography variant="h5" sx={{ mt: 1 }}>
              {prizeInfo.name}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ my: 2, bgcolor: 'primary.light', p: 2, borderRadius: 1 }}>
          <Typography variant="h6" color="white">Entry Requirements:</Typography>
          <Typography variant="body1" color="white">
            • 5 ADA
          </Typography>
          <Typography variant="body1" color="white">
            • Required Epok tokens
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default RaffleInfo;
