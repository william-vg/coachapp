import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the CoachApp brand name', () => {
  render(<App />);
  // The auth page (Login) is shown when not authenticated — it contains the brand heading
  const brandElements = screen.getAllByText(/CoachApp/i);
  expect(brandElements.length).toBeGreaterThan(0);
});
