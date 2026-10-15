import { describe, it, expect } from 'vitest';
import bookingsReducer, {
  addBooking,
  cancelBooking,
  openBookingModal,
  closeBookingModal,
  openBookingsDrawer,
  closeBookingsDrawer,
  selectAllBookings,
} from './bookingsSlice';

describe('bookingsSlice Reducer & Actions', () => {
  const initialState = {
    items: [],
    activeBookingModalHotel: null,
    isBookingsDrawerOpen: false,
    lastInvoice: null,
  };

  it('handles addBooking by prepending new booking', () => {
    const booking = {
      id: 'BK-100200',
      hotelName: 'The Oberoi Udaivilas',
      guestName: 'Rohit Verma',
      totalAmount: 32000,
      status: 'Confirmed',
    };

    const nextState = bookingsReducer(initialState, addBooking(booking));
    expect(nextState.items.length).toBe(1);
    expect(nextState.items[0].id).toBe('BK-100200');
    expect(nextState.lastInvoice).toEqual(booking);
  });

  it('handles cancelBooking by changing status to Cancelled', () => {
    const stateWithBooking = {
      items: [
        {
          id: 'BK-100200',
          hotelName: 'The Oberoi Udaivilas',
          status: 'Confirmed',
        },
      ],
      activeBookingModalHotel: null,
      isBookingsDrawerOpen: false,
      lastInvoice: null,
    };

    const nextState = bookingsReducer(stateWithBooking, cancelBooking('BK-100200'));
    expect(nextState.items[0].status).toBe('Cancelled');
  });

  it('handles modal and drawer toggle actions', () => {
    const hotel = { id: 'htl-1', name: 'The Taj Mahal Palace' };
    let state = bookingsReducer(initialState, openBookingModal(hotel));
    expect(state.activeBookingModalHotel).toEqual(hotel);

    state = bookingsReducer(state, closeBookingModal());
    expect(state.activeBookingModalHotel).toBeNull();

    state = bookingsReducer(state, openBookingsDrawer());
    expect(state.isBookingsDrawerOpen).toBe(true);

    state = bookingsReducer(state, closeBookingsDrawer());
    expect(state.isBookingsDrawerOpen).toBe(false);
  });

  it('selects all bookings correctly', () => {
    const rootState = {
      bookings: {
        items: [{ id: 'BK-1' }, { id: 'BK-2' }],
      },
    };
    expect(selectAllBookings(rootState).length).toBe(2);
  });
});
