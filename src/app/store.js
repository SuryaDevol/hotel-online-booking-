import { configureStore } from '@reduxjs/toolkit';
import hotelsReducer from '../features/hotels/hotelsSlice';

/**
 * Central Redux Store
 * Configured using Redux Toolkit's configureStore, which sets up
 * Redux DevTools and sensible middleware (thunk, immutability check, serializability check) automatically.
 */
export const store = configureStore({
  reducer: {
    hotels: hotelsReducer,
  },
});
