import { createSlice, nanoid } from '@reduxjs/toolkit';
import { initialHotels } from './initialHotels';

/**
 * Hotels Slice
 * Centralizes all CRUD state management for hotel records using Redux Toolkit.
 * Immer is built into RTK, allowing safe direct mutations in reducers.
 */
const initialState = {
  items: initialHotels,
  status: 'idle',
  error: null,
};

export const hotelsSlice = createSlice({
  name: 'hotels',
  initialState,
  reducers: {
    /**
     * Add a newly created hotel record to the state
     */
    addHotel: {
      reducer: (state, action) => {
        // Prepend to display newest items first
        state.items.unshift(action.payload);
      },
      prepare: (hotelData) => {
        return {
          payload: {
            id: hotelData.id || `htl-${nanoid(6)}`,
            name: hotelData.name.trim(),
            location: hotelData.location.trim(),
            price: Number(hotelData.price),
            image: hotelData.image || '',
            latitude: hotelData.latitude !== '' && hotelData.latitude !== null && hotelData.latitude !== undefined
              ? Number(hotelData.latitude)
              : null,
            longitude: hotelData.longitude !== '' && hotelData.longitude !== null && hotelData.longitude !== undefined
              ? Number(hotelData.longitude)
              : null,
            rating: hotelData.rating ? Number(hotelData.rating) : 4.8,
            description: hotelData.description ? hotelData.description.trim() : '',
            createdAt: new Date().toISOString(),
          },
        };
      },
    },

    /**
     * Update an existing hotel record
     */
    updateHotel: (state, action) => {
      const { id, ...updates } = action.payload;
      const existingHotelIndex = state.items.findIndex((item) => item.id === id);

      if (existingHotelIndex !== -1) {
        state.items[existingHotelIndex] = {
          ...state.items[existingHotelIndex],
          ...updates,
          price: Number(updates.price),
          latitude: updates.latitude !== '' && updates.latitude !== null && updates.latitude !== undefined
            ? Number(updates.latitude)
            : null,
          longitude: updates.longitude !== '' && updates.longitude !== null && updates.longitude !== undefined
            ? Number(updates.longitude)
            : null,
          updatedAt: new Date().toISOString(),
        };
      }
    },

    /**
     * Delete a hotel record by ID
     */
    deleteHotel: (state, action) => {
      const targetId = action.payload;
      state.items = state.items.filter((item) => item.id !== targetId);
    },

    /**
     * Reset hotel state back to initial sample dataset (great for demo testing)
     */
    resetToInitialHotels: (state) => {
      state.items = initialHotels;
    },

    /**
     * Toggle wishlist / favorite status for a hotel
     */
    toggleFavorite: (state, action) => {
      const targetId = action.payload;
      const hotel = state.items.find((h) => h.id === targetId);
      if (hotel) {
        hotel.isFavorite = !hotel.isFavorite;
      }
    },
  },
});

export const { addHotel, updateHotel, deleteHotel, resetToInitialHotels, toggleFavorite } = hotelsSlice.actions;

// Selectors
export const selectAllHotels = (state) => state.hotels.items;
export const selectHotelById = (state, hotelId) =>
  state.hotels.items.find((hotel) => hotel.id === hotelId);

export default hotelsSlice.reducer;
