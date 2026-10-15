import { describe, it, expect } from 'vitest';
import hotelsReducer, {
  addHotel,
  updateHotel,
  deleteHotel,
  resetToInitialHotels,
  selectAllHotels,
  selectHotelById,
} from './hotelsSlice';
import { initialHotels } from './initialHotels';

describe('hotelsSlice Reducer & Actions', () => {
  const getInitialState = () => ({
    items: [...initialHotels],
    status: 'idle',
    error: null,
  });

  it('should return initial state when passed empty action', () => {
    const result = hotelsReducer(undefined, { type: 'unknown' });
    expect(result.items.length).toBe(initialHotels.length);
  });

  it('should handle addHotel by prepending new hotel record', () => {
    const state = getInitialState();
    const newHotelInput = {
      name: 'The Ritz Test Palace',
      location: 'Milan, Italy',
      price: 420,
      image: '',
      latitude: 45.4642,
      longitude: 9.19,
      rating: 4.9,
      description: 'Elegant boutique luxury',
    };

    const action = addHotel(newHotelInput);
    const updatedState = hotelsReducer(state, action);

    expect(updatedState.items.length).toBe(state.items.length + 1);
    expect(updatedState.items[0].name).toBe('The Ritz Test Palace');
    expect(updatedState.items[0].price).toBe(420);
    expect(updatedState.items[0].latitude).toBe(45.4642);
    expect(updatedState.items[0].id).toBeDefined();
  });

  it('should handle updateHotel by modifying existing hotel', () => {
    const state = getInitialState();
    const targetHotel = state.items[0];

    const updatePayload = {
      id: targetHotel.id,
      name: 'Updated Luxury Palace',
      location: 'Paris, France',
      price: 599,
      latitude: 48.8566,
      longitude: 2.3522,
      rating: 5.0,
      description: 'Renovated ultra-luxury',
    };

    const updatedState = hotelsReducer(state, updateHotel(updatePayload));
    const modified = updatedState.items.find((h) => h.id === targetHotel.id);

    expect(modified.name).toBe('Updated Luxury Palace');
    expect(modified.price).toBe(599);
    expect(modified.updatedAt).toBeDefined();
  });

  it('should handle deleteHotel by removing the target record', () => {
    const state = getInitialState();
    const targetId = state.items[0].id;

    const updatedState = hotelsReducer(state, deleteHotel(targetId));

    expect(updatedState.items.length).toBe(state.items.length - 1);
    expect(updatedState.items.find((h) => h.id === targetId)).toBeUndefined();
  });

  it('should handle resetToInitialHotels', () => {
    const emptyState = { items: [], status: 'idle', error: null };
    const resetState = hotelsReducer(emptyState, resetToInitialHotels());

    expect(resetState.items.length).toBe(initialHotels.length);
  });

  it('should select all hotels and select by ID correctly', () => {
    const rootState = { hotels: getInitialState() };
    const all = selectAllHotels(rootState);
    expect(all.length).toBe(initialHotels.length);

    const first = selectHotelById(rootState, initialHotels[0].id);
    expect(first.name).toBe(initialHotels[0].name);
  });
});
