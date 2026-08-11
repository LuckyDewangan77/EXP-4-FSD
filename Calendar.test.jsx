import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Calendar from './Calendar';

describe('Calendar Component', () => {
  it('renders events fetched from MSW mock API', async () => {
    render(<Calendar />);
    
    // Initial loading state
    expect(screen.getByText(/Loading Calendar.../i)).toBeInTheDocument();
    
    // Wait for the mocked events to appear
    await waitFor(() => {
      expect(screen.getByText('Team Sync')).toBeInTheDocument();
    });
    
    // Check if other events are rendered correctly
    expect(screen.getByText('Project Review')).toBeInTheDocument();
    expect(screen.getByText('Client Meeting')).toBeInTheDocument();
  });
});
