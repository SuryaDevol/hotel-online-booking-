import { describe, it, expect } from 'vitest';
import { calculateDistanceKm, formatDistance } from './geo';

describe('Geo utilities', () => {
  it('calculates distance accurately using Haversine formula', () => {
    // Mumbai (18.9220, 72.8347) to Delhi (28.6139, 77.2090) ~ 1148 km
    const dist = calculateDistanceKm(18.922, 72.8347, 28.6139, 77.209);
    expect(dist).toBeGreaterThan(1100);
    expect(dist).toBeLessThan(1200);
  });

  it('handles null or missing coordinates gracefully', () => {
    expect(calculateDistanceKm(null, 72.83, 28.61, 77.2)).toBeNull();
    expect(calculateDistanceKm(18.92, null, 28.61, 77.2)).toBeNull();
    expect(calculateDistanceKm(18.92, 72.83, null, 77.2)).toBeNull();
  });

  it('formats distance nicely for users', () => {
    expect(formatDistance(0.45)).toBe('450 m away');
    expect(formatDistance(4.24)).toBe('4.2 km away');
    expect(formatDistance(1250)).toBe('1,250 km away');
    expect(formatDistance(null)).toBeNull();
  });
});
