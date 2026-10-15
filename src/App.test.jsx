import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { configureStore } from '@reduxjs/toolkit';
import hotelsReducer from './features/hotels/hotelsSlice';
import App from './App';

function renderAppWithStore() {
  const store = configureStore({
    reducer: {
      hotels: hotelsReducer,
    },
  });

  return render(
    <HelmetProvider>
      <Provider store={store}>
        <App />
      </Provider>
    </HelmetProvider>
  );
}

describe('App Integration Tests', () => {
  it('renders initial dashboard with header, stats, and hotel cards', () => {
    renderAppWithStore();

    expect(screen.getByText('GrandStay')).toBeInTheDocument();
    expect(screen.getByText('Total Properties')).toBeInTheDocument();
    expect(screen.getByText('The Taj Mahal Palace')).toBeInTheDocument();
  });

  it('filters hotels by search query', () => {
    renderAppWithStore();

    const searchInput = screen.getByPlaceholderText(/Search hotels by name or location/i);
    fireEvent.change(searchInput, { target: { value: 'Tokyo' } });

    expect(screen.getByText('Sakura Bay Palace')).toBeInTheDocument();
    expect(screen.queryByText('The Taj Mahal Palace')).not.toBeInTheDocument();
  });

  it('filters hotels by location dropdown', () => {
    renderAppWithStore();

    const locationSelect = screen.getByLabelText(/Location:/i);
    fireEvent.change(locationSelect, { target: { value: 'Paris, France' } });

    expect(screen.getByText('The Grand Elysée Hotel')).toBeInTheDocument();
    expect(screen.queryByText('The Taj Mahal Palace')).not.toBeInTheDocument();
  });

  it('allows adding a new hotel through modal form', () => {
    renderAppWithStore();

    // Click "Add Hotel" button in header
    const addHotelBtn = screen.getByRole('button', { name: /Add new hotel/i });
    fireEvent.click(addHotelBtn);

    // Modal should be open
    expect(screen.getByText('Add New Hotel Property')).toBeInTheDocument();

    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/Hotel Name/i), {
      target: { value: 'Kyoto Zen Sanctuary' },
    });
    fireEvent.change(screen.getByLabelText(/Location \(City, Country\)/i), {
      target: { value: 'Kyoto, Japan' },
    });
    fireEvent.change(screen.getByLabelText(/Price Per Night/i), {
      target: { value: '310' },
    });

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /Create Hotel Property/i });
    fireEvent.click(submitBtn);

    // New hotel should appear in the document
    expect(screen.getByText('Kyoto Zen Sanctuary')).toBeInTheDocument();
  });

  it('shows delete confirmation dialog and deletes hotel upon confirmation', () => {
    renderAppWithStore();

    // Find first delete button
    const deleteButtons = screen.getAllByRole('button', { name: /^Delete /i });
    fireEvent.click(deleteButtons[0]);

    // Confirmation dialog should be visible
    expect(screen.getByText('Confirm Property Deletion')).toBeInTheDocument();

    // Click confirm delete
    const confirmBtn = screen.getByRole('button', { name: /Yes, Delete Hotel/i });
    fireEvent.click(confirmBtn);

    // Toast or deletion reflection
    expect(screen.getByText(/was deleted/i)).toBeInTheDocument();
  });
});
