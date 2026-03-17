import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App Component', () => {
  it('renders the main application', () => {
    render(<App />);
    // Check if the main heading or a specific element exists
    // Adjust this based on your actual App component content
    const heading = screen.getByText(/Gemstone/i);
    expect(heading).toBeDefined();
  });
});
