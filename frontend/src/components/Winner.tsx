import React from 'react';
import { Paper, Typography, Container, Box } from '@mui/material';

interface WinnerProps {
  winnerAddress: string | null;
  prizeNftName: string;
  epochEnd: string;
}

const Winner: React.FC<WinnerProps> = ({ winnerAddress, prizeNftName, epochEnd }) => {
  if (!winnerAddress) {
    return null;
  }

  return (
    <Container maxWidth="md">
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          my: 2, 
          background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
          color: 'white'
        }}
      >
        <Typography variant="h4" gutterBottom align="center">
          🎉 Latest Winner 🎉
        </Typography>
        
        <Box sx={{ textAlign: 'center', my: 2 }}>
          <Typography variant="h6" gutterBottom>
            Winning Address:
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              wordBreak: 'break-all',
              bgcolor: 'rgba(255,255,255,0.1)',
              p: 2,
              borderRadius: 1
            }}
          >
            {winnerAddress}
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center', my: 2 }}>
          <Typography variant="h6" gutterBottom>
            Prize Won:
          </Typography>
          <Typography variant="h5">
            {prizeNftName}
          </Typography>
        </Box>

        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Raffle ended: {new Date(epochEnd).toLocaleString()}
        </Typography>
      </Paper>
    </Container>
  );
};

export default Winner;
