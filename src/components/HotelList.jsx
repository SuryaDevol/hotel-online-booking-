import React from 'react';
import HotelItem from './HotelItem';
import HotelTable from './HotelTable';
import { SearchX, Building, Plus, RefreshCw } from 'lucide-react';

/**
 * HotelList Component
 * Controls the rendering between Grid and Table views and handles empty states gracefully.
 */
export default function HotelList({
  hotels,
  totalMatching,
  totalInStore,
  viewMode,
  onEdit,
  onDelete,
  onViewMap,
  onResetFilters,
  onOpenAddModal,
}) {
  // Empty state handling
  if (totalMatching === 0) {
    if (totalInStore === 0) {
      return (
        <section className="empty-state-card" aria-label="No hotels available">
          <div className="empty-state-icon-wrap">
            <Building size={48} className="empty-icon" />
          </div>
          <h2 className="empty-state-title">No Hotels in Portfolio</h2>
          <p className="empty-state-text">
            Your hotel directory is currently empty. Add your first property or restore sample data to get started.
          </p>
          <div className="empty-state-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={onOpenAddModal}
            >
              <Plus size={16} /> Add Your First Hotel
            </button>
          </div>
        </section>
      );
    }

    return (
      <section className="empty-state-card" aria-label="No matching hotels">
        <div className="empty-state-icon-wrap">
          <SearchX size={48} className="empty-icon" />
        </div>
        <h2 className="empty-state-title">No Matching Properties Found</h2>
        <p className="empty-state-text">
          We couldn't find any hotels matching your current search query or location filter. Try refining your keywords or clearing the active filters.
        </p>
        <div className="empty-state-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onResetFilters}
          >
            <RefreshCw size={16} /> Reset All Filters
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="hotel-list-section" aria-label="Hotel list">
      {viewMode === 'grid' ? (
        <div className="hotels-grid">
          {hotels.map((hotel) => (
            <HotelItem
              key={hotel.id}
              hotel={hotel}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewMap={onViewMap}
            />
          ))}
        </div>
      ) : (
        <HotelTable
          hotels={hotels}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewMap={onViewMap}
        />
      )}
    </section>
  );
}
