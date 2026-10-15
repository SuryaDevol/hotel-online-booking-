import { createSlice } from '@reduxjs/toolkit';

const initialBookings = [
  {
    id: "BK-884102",
    hotelId: "htl-1",
    hotelName: "The Taj Mahal Palace",
    location: "Mumbai, India",
    guestName: "Arjun Sharma",
    guestEmail: "arjun.sharma@example.com",
    guestPhone: "+91 98765 43210",
    checkIn: "2026-10-20",
    checkOut: "2026-10-23",
    nights: 3,
    guests: 2,
    roomType: "Luxury Sea View Suite",
    basePrice: 24500,
    discountAmount: 4900,
    taxes: 12348,
    totalAmount: 80948,
    paymentMethod: "UPI (Google Pay)",
    transactionId: "TXN-9982410",
    status: "Confirmed",
    createdAt: new Date().toISOString(),
  }
];

export const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: {
    items: initialBookings,
    activeBookingModalHotel: null,
    isBookingsDrawerOpen: false,
    lastInvoice: null,
  },
  reducers: {
    openBookingModal: (state, action) => {
      state.activeBookingModalHotel = action.payload;
    },
    closeBookingModal: (state) => {
      state.activeBookingModalHotel = null;
    },
    openBookingsDrawer: (state) => {
      state.isBookingsDrawerOpen = true;
    },
    closeBookingsDrawer: (state) => {
      state.isBookingsDrawerOpen = false;
    },
    addBooking: (state, action) => {
      state.items.unshift(action.payload);
      state.lastInvoice = action.payload;
    },
    cancelBooking: (state, action) => {
      const id = action.payload;
      const booking = state.items.find((b) => b.id === id);
      if (booking) {
        booking.status = 'Cancelled';
      }
    },
    setBookings: (state, action) => {
      state.items = action.payload;
    },
    setLastInvoice: (state, action) => {
      state.lastInvoice = action.payload;
    },
  },
});

export const {
  openBookingModal,
  closeBookingModal,
  openBookingsDrawer,
  closeBookingsDrawer,
  addBooking,
  cancelBooking,
  setBookings,
  setLastInvoice,
} = bookingsSlice.actions;

export const selectAllBookings = (state) => state.bookings.items;
export const selectActiveBookingModalHotel = (state) => state.bookings.activeBookingModalHotel;
export const selectIsBookingsDrawerOpen = (state) => state.bookings.isBookingsDrawerOpen;
export const selectLastInvoice = (state) => state.bookings.lastInvoice;

export default bookingsSlice.reducer;
