import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Chip,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';

interface Participant {
  wallet_address: string;
  entry_time: string;
  ada_amount: number;
  epok_amount: number;
  tickets: number;
}

interface ParticipantListProps {
  participants: Participant[];
}

const ParticipantList: React.FC<ParticipantListProps> = ({ participants }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const totalTickets = participants?.reduce((sum, p) => sum + p.tickets, 0) || 0;
  
  const formatAddress = (address: string) => 
    `${address.slice(0, 8)}...${address.slice(-8)}`;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!participants || participants.length === 0) {
    return (
      <Box sx={{ 
        textAlign: 'center', 
        py: 4,
        color: 'text.secondary'
      }}>
        <Typography variant="h6">
          No participants yet. Be the first to enter!
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="subtitle1" color="text.secondary">
          Total Entries:
        </Typography>
        <Chip 
          label={totalTickets}
          color="primary"
          sx={{ 
            fontSize: '1.1rem',
            height: 'auto',
            padding: '8px 12px'
          }}
        />
      </Box>

      <TableContainer component={Paper} sx={{ 
        background: 'rgba(19, 47, 76, 0.4)',
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Wallet Address</TableCell>
              {!isMobile && <TableCell>Entry Time</TableCell>}
              <TableCell align="right">ADA</TableCell>
              <TableCell align="right">EPOK</TableCell>
              <TableCell align="right">Tickets</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {participants.map((participant, index) => (
              <TableRow 
                key={index}
                sx={{ 
                  '&:last-child td, &:last-child th': { border: 0 },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                <TableCell 
                  component="th" 
                  scope="row"
                  sx={{ 
                    fontFamily: 'monospace',
                    fontSize: '0.875rem'
                  }}
                >
                  {formatAddress(participant.wallet_address)}
                </TableCell>
                {!isMobile && (
                  <TableCell sx={{ color: 'text.secondary' }}>
                    {formatDate(participant.entry_time)}
                  </TableCell>
                )}
                <TableCell align="right">{participant.ada_amount.toLocaleString()}</TableCell>
                <TableCell align="right">{participant.epok_amount.toLocaleString()}</TableCell>
                <TableCell align="right">
                  <Chip
                    label={participant.tickets}
                    size="small"
                    color="primary"
                    sx={{ 
                      minWidth: 60,
                      backgroundColor: 'rgba(33, 150, 243, 0.1)'
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ParticipantList;
