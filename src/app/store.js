import { configureStore } from '@reduxjs/toolkit';
import hotelsReducer from '../features/hotels/hotelsSlice';
import bookingsReducer from '../features/bookings/bookingsSlice';

/**
 * Central Redux Store
 * Configured using Redux Toolkit's configureStore.
 * Combines hotels and bookings state slices.
 */
export const store = configureStore({
  reducer: {
    hotels: hotelsReducer,
    bookings: bookingsReducer,
  },
});
