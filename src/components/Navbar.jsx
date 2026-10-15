import React from 'react';
import { Plus, Hotel, RotateCcw } from 'lucide-react';

/**
 * Navbar Component
 * Header navigation with brand identity, quick actions, and data reset option.
 */
export default function Navbar({ onOpenAddModal, onResetData, totalCount }) {
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
              <span className="navbar-badge">Admin Suite</span>
            </div>
            <p className="navbar-subtitle">
              Hotel Portfolio Management & Analytics Dashboard
            </p>
          </div>
        </div>

        <div className="navbar-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onResetData}
            title="Reset to default sample hotels"
          >
            <RotateCcw size={15} />
            <span className="btn-text">Reset Demo Data</span>
          </button>

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
