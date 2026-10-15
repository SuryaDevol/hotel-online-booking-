import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HotelForm from './HotelForm';

describe('HotelForm Component', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <HotelForm isOpen={false} onClose={vi.fn()} onSubmit={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders form inputs when isOpen is true', () => {
    render(<HotelForm isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/Hotel Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Price Per Night/i)).toBeInTheDocument();
  });

  it('validates required fields and shows error messages when submitted empty', () => {
    const handleSubmit = vi.fn();
    render(<HotelForm isOpen={true} onClose={vi.fn()} onSubmit={handleSubmit} />);

    const submitBtn = screen.getByRole('button', { name: /Create Hotel Property/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Hotel name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Location \(city\/address\) is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Nightly price is required/i)).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('validates latitude bounds between -90 and 90', () => {
    const handleSubmit = vi.fn();
    render(<HotelForm isOpen={true} onClose={vi.fn()} onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText(/Hotel Name/i), {
      target: { value: 'Valid Hotel' },
    });
    fireEvent.change(screen.getByLabelText(/Location/i), {
      target: { value: 'London, UK' },
    });
    fireEvent.change(screen.getByLabelText(/Price Per Night/i), {
      target: { value: '250' },
    });
    fireEvent.change(screen.getByLabelText(/Latitude/i), {
      target: { value: '150' }, // Invalid > 90
    });

    const submitBtn = screen.getByRole('button', { name: /Create Hotel Property/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Latitude must be between -90 and 90/i)).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with correct payload when valid data is provided', () => {
    const handleSubmit = vi.fn();
    const handleClose = vi.fn();

    render(
      <HotelForm isOpen={true} onClose={handleClose} onSubmit={handleSubmit} />
    );

    fireEvent.change(screen.getByLabelText(/Hotel Name/i), {
      target: { value: 'Grand Kensington Hotel' },
    });
    fireEvent.change(screen.getByLabelText(/Location/i), {
      target: { value: 'London, UK' },
    });
    fireEvent.change(screen.getByLabelText(/Price Per Night/i), {
      target: { value: '350' },
    });
    fireEvent.change(screen.getByLabelText(/Latitude/i), {
      target: { value: '51.5074' },
    });
    fireEvent.change(screen.getByLabelText(/Longitude/i), {
      target: { value: '-0.1278' },
    });

    const submitBtn = screen.getByRole('button', { name: /Create Hotel Property/i });
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Grand Kensington Hotel',
        location: 'London, UK',
        price: 350,
        latitude: 51.5074,
        longitude: -0.1278,
      })
    );
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
