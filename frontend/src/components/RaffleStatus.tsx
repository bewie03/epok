import React, { useEffect, useState } from 'react';
import { 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  CircularProgress,
  Box
} from '@mui/material';
import { API_URL } from '../config';

interface RaffleEntry {
  wallet_address: string;
  tickets: number;
  transaction_hash: string;
}

interface RaffleData {
  entries: RaffleEntry[];
  count: number;
}

export const RaffleStatus: React.FC = () => {
  const [raffleData, setRaffleData] = useState<RaffleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRaffleData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/entries`);
        if (!response.ok) {
          throw new Error('Failed to fetch raffle data');
        }
        const data = await response.json();
        setRaffleData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRaffleData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchRaffleData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 2, m: 2, bgcolor: '#fff3f3' }}>
        <Typography color="error">Error: {error}</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, m: 2 }}>
      <Typography variant="h5" gutterBottom>
        Current Raffle Status
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Total Entries: {raffleData?.count || 0}
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Wallet Address</TableCell>
              <TableCell align="right">Tickets</TableCell>
              <TableCell>Transaction Hash</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {raffleData?.entries.map((entry, index) => (
              <TableRow key={entry.transaction_hash}>
                <TableCell>
                  {entry.wallet_address.slice(0, 10)}...{entry.wallet_address.slice(-8)}
                </TableCell>
                <TableCell align="right">{entry.tickets}</TableCell>
                <TableCell>
                  <a 
                    href={`https://cardanoscan.io/transaction/${entry.transaction_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {entry.transaction_hash.slice(0, 8)}...
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};
