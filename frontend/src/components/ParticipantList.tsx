import React from 'react';
import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Typography,
  Container
} from '@mui/material';

interface Participant {
  walletAddress: string;
  entryTime: string;
  adaAmount: number;
  epokAmount: number;
  tickets: number;
}

interface ParticipantListProps {
  participants: Participant[];
  totalTickets: number;
}

const ParticipantList: React.FC<ParticipantListProps> = ({ participants, totalTickets }) => {
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, my: 2 }}>
        <Typography variant="h5" gutterBottom>
          Current Participants ({participants.length}) - Total Tickets: {totalTickets}
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Wallet Address</TableCell>
                <TableCell align="right">Entry Time</TableCell>
                <TableCell align="right">ADA</TableCell>
                <TableCell align="right">EPOK</TableCell>
                <TableCell align="right">Tickets</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {participants.map((participant, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {participant.walletAddress.slice(0, 8)}...
                    {participant.walletAddress.slice(-8)}
                  </TableCell>
                  <TableCell align="right">
                    {new Date(participant.entryTime).toLocaleString()}
                  </TableCell>
                  <TableCell align="right">{participant.adaAmount}</TableCell>
                  <TableCell align="right">{participant.epokAmount}</TableCell>
                  <TableCell align="right">{participant.tickets}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default ParticipantList;
