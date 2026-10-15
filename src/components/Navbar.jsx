import React from 'react';
import { Plus, Hotel, RotateCcw, CalendarCheck, Sun, Moon } from 'lucide-react';

/**
 * Navbar Component
 * Header navigation with brand identity, bookings launcher, theme toggle, and quick actions.
 */
export default function Navbar({
  onOpenAddModal,
  onResetData,
  onOpenBookings,
  bookingsCount = 0,
  theme = 'light',
  onToggleTheme,
}) {
  return (
    <header className="dashboard-navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="navbar-logo-badge">
            <Hotel className="navbar-icon" size={24} />
          </div>
          <div>
            <div className="brand-title-wrap">
              <h1 className="navbar-title">GrandStay</h1>
              <span className="navbar-badge">Luxury &bull; India</span>
            </div>
            <p className="navbar-subtitle">
              Hotel Portfolio, Location Intelligence &amp; Instant Booking Suite
            </p>
          </div>
        </div>

        <div className="navbar-actions">
          {/* Theme Toggle */}
          <button
            type="button"
            className="btn-theme-toggle"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Luxury Theme'}
            aria-label="Toggle color theme"
          >
            {theme === 'dark' ? <Sun size={18} className="theme-sun-icon" /> : <Moon size={18} />}
          </button>

          {/* My Bookings Button */}
          <button
            type="button"
            className="btn btn-secondary btn-sm btn-bookings-nav"
            onClick={onOpenBookings}
            title="View confirmed bookings and download invoices"
          >
            <CalendarCheck size={16} />
            <span className="btn-text">My Bookings</span>
            {bookingsCount > 0 && (
              <span className="bookings-counter-badge">{bookingsCount}</span>
            )}
          </button>

          {/* Reset Demo Data */}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onResetData}
            title="Reset to default sample hotels"
          >
            <RotateCcw size={15} />
            <span className="btn-text">Reset Demo</span>
          </button>

          {/* Primary Add Hotel CTA */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenAddModal}
            aria-label="Add new hotel"
          >
            <Plus size={18} />
            <span>Add Hotel</span>
          </button>
        </div>
      </div>
    </header>
  );
}
