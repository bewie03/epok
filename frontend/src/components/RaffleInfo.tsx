import React from 'react';
import { Box, Typography, Paper, Card, CardMedia, CardContent } from '@mui/material';
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
    <Paper elevation={3} sx={{ 
      height: '100%', 
      background: 'rgba(19, 47, 76, 0.4)', 
      backdropFilter: 'blur(10px)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Typography variant="h2" gutterBottom>
        Prize
      </Typography>
      
      <Card sx={{ 
        flexGrow: 1, 
        background: 'transparent',
        boxShadow: 'none'
      }}>
        <CardMedia
          component="img"
          image={prizeInfo.imageUrl}
          alt={prizeInfo.name}
          sx={{ 
            height: 300,
            objectFit: 'contain',
            borderRadius: '8px',
            mb: 2
          }}
        />
        <CardContent sx={{ p: 0 }}>
          <Typography variant="h3" gutterBottom>
            {prizeInfo.name}
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              Time Until Draw
            </Typography>
            <Typography variant="h3">
              <Countdown 
                date={new Date(epochEnd)}
                renderer={({ days, hours, minutes, seconds }) => (
                  <span>{days}d {hours}h {minutes}m {seconds}s</span>
                )}
              />
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Paper>
  );
};

export default RaffleInfo;
