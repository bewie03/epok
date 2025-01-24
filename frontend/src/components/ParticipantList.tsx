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
  Chip
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
  const totalTickets = participants.reduce((sum, p) => sum + p.tickets, 0);
  const formatAddress = (address: string) => 
    `${address.slice(0, 8)}...${address.slice(-8)}`;

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6" color="primary">
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

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="subtitle1" color="primary">Wallet Address</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle1" color="primary">Entry Time</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle1" color="primary">ADA</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle1" color="primary">EPOK</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle1" color="primary">Tickets</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {participants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body1" sx={{ py: 3 }}>
                    No participants yet. Be the first to enter!
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              participants.map((participant, index) => (
                <TableRow key={index} sx={{ 
                  '&:last-child td, &:last-child th': { border: 0 },
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)'
                  }
                }}>
                  <TableCell>
                    <Typography variant="body2">
                      {formatAddress(participant.wallet_address)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(participant.entry_time).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {participant.ada_amount.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {participant.epok_amount.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip 
                      label={participant.tickets}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ParticipantList;
