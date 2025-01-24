import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    // Check for the presence of the app title
    const titleElement = screen.getByText(/Raffle/i);
    expect(titleElement).toBeInTheDocument();
  });
});
