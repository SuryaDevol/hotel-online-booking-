import React from 'react';
import { Building2, DollarSign, MapPin, TrendingUp } from 'lucide-react';

/**
 * StatsOverview Component
 * Computes high-level KPI metrics from current Redux hotel state.
 */
export default function StatsOverview({ hotels }) {
  const totalHotels = hotels.length;

  const avgPrice =
    totalHotels > 0
      ? Math.round(hotels.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0) / totalHotels)
      : 0;

  const uniqueLocations = new Set(
    hotels.map((h) => {
      // Extract city part if format is "City, Country"
      const parts = h.location.split(',');
      return parts[0].trim();
    })
  ).size;

  const minPrice =
    totalHotels > 0 ? Math.min(...hotels.map((h) => Number(h.price) || 0)) : 0;
  const maxPrice =
    totalHotels > 0 ? Math.max(...hotels.map((h) => Number(h.price) || 0)) : 0;

  return (
    <section className="stats-grid" aria-label="Key Performance Indicators">
      <div className="stat-card">
        <div className="stat-icon-wrap stat-blue">
          <Building2 size={22} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Total Properties</span>
          <span className="stat-value">{totalHotels}</span>
          <span className="stat-meta">Active records in session</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrap stat-emerald">
          <DollarSign size={22} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Average Nightly Rate</span>
          <span className="stat-value">${avgPrice}</span>
          <span className="stat-meta">Across all locations</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrap stat-violet">
          <MapPin size={22} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Destinations</span>
          <span className="stat-value">{uniqueLocations}</span>
          <span className="stat-meta">Cities represented</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrap stat-amber">
          <TrendingUp size={22} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Price Range</span>
          <span className="stat-value">
            {totalHotels > 0 ? `$${minPrice} – $${maxPrice}` : 'N/A'}
          </span>
          <span className="stat-meta">Min to Max per night</span>
        </div>
      </div>
    </section>
  );
}
