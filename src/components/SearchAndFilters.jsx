import React from 'react';
import { Search, X, LayoutGrid, Table, ArrowUpDown, Heart, Compass } from 'lucide-react';

/**
 * SearchAndFilters Component
 * Houses the search bar, GPS near me button, location dropdown, sort selector,
 * favorites filter toggle, layout switch, and items per page selector.
 */
export default function SearchAndFilters({
  searchQuery,
  onSearchChange,
  selectedLocation,
  onLocationChange,
  availableLocations,
  sortBy,
  onSortChange,
  itemsPerPage,
  onItemsPerPageChange,
  viewMode,
  onViewModeChange,
  onResetFilters,
  totalResults,
  favoritesOnly = false,
  onToggleFavoritesOnly,
  userLocation = null,
  onDetectUserLocation,
}) {
  const isFiltered =
    searchQuery.trim() !== '' ||
    selectedLocation !== 'all' ||
    sortBy !== 'default' ||
    favoritesOnly;

  return (
    <div className="filters-container">
      {/* Search Input Bar Row */}
      <div className="search-bar-row">
        <div className="search-input-wrapper">
          <Search className="search-input-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search hotels by name or location (e.g., Mumbai, Paris, Taj)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search hotels by name or location"
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
              aria-label="Clear search query"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* GPS Locate Me Button */}
        <button
          type="button"
          className={`btn btn-secondary btn-locate-me ${userLocation ? 'location-active' : ''}`}
          onClick={onDetectUserLocation}
          title={userLocation ? 'Your GPS location is active' : 'Detect my location to see distances'}
        >
          <Compass size={16} className={userLocation ? 'icon-spin-subtle' : ''} />
          <span className="btn-text">{userLocation ? 'Location Active' : 'Near Me'}</span>
        </button>

        {/* Favorites Quick Filter */}
        <button
          type="button"
          className={`btn btn-secondary btn-fav-filter ${favoritesOnly ? 'active' : ''}`}
          onClick={onToggleFavoritesOnly}
          title="Filter Wishlist / Favorited hotels"
        >
          <Heart size={16} fill={favoritesOnly ? 'currentColor' : 'none'} />
          <span className="btn-text">Favorites</span>
        </button>

        {/* View Mode Toggle: Grid Cards vs Table View */}
        <div className="view-mode-toggle" role="group" aria-label="Layout View Toggle">
          <button
            type="button"
            className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => onViewModeChange('grid')}
            title="Grid Cards View"
            aria-label="Grid Cards View"
          >
            <LayoutGrid size={18} />
          </button>
          <button
            type="button"
            className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => onViewModeChange('table')}
            title="Data Table View"
            aria-label="Data Table View"
          >
            <Table size={18} />
          </button>
        </div>
      </div>

      {/* Control Dropdowns Row */}
      <div className="controls-row">
        {/* Location Filter */}
        <div className="filter-group">
          <label htmlFor="location-filter" className="filter-label">
            Location:
          </label>
          <select
            id="location-filter"
            className="filter-select"
            value={selectedLocation}
            onChange={(e) => onLocationChange(e.target.value)}
          >
            <option value="all">All Locations (Global)</option>
            {availableLocations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Selector */}
        <div className="filter-group">
          <label htmlFor="sort-by" className="filter-label">
            <ArrowUpDown size={14} className="label-icon" /> Sort By:
          </label>
          <select
            id="sort-by"
            className="filter-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="default">Default Order</option>
            {userLocation && (
              <option value="distance-asc">Nearest First (Live Distance 📍)</option>
            )}
            <option value="price-asc">Price: Low to High (₹ &rarr; ₹₹₹)</option>
            <option value="price-desc">Price: High to Low (₹₹₹ &rarr; ₹)</option>
            <option value="name-asc">Hotel Name: A &rarr; Z</option>
            <option value="name-desc">Hotel Name: Z &rarr; A</option>
          </select>
        </div>

        {/* Items Per Page */}
        <div className="filter-group">
          <label htmlFor="items-per-page" className="filter-label">
            Show:
          </label>
          <select
            id="items-per-page"
            className="filter-select items-select"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          >
            <option value={4}>4 per page</option>
            <option value={6}>6 per page</option>
            <option value={8}>8 per page</option>
            <option value={12}>12 per page</option>
          </select>
        </div>

        {/* Reset Filters Shortcut */}
        {isFiltered && (
          <button
            type="button"
            className="btn btn-ghost btn-sm reset-filter-btn"
            onClick={onResetFilters}
          >
            <X size={14} /> Clear Filters
          </button>
        )}

        <div className="results-count-badge">
          <span>
            {totalResults} {totalResults === 1 ? 'property' : 'properties'} found
          </span>
        </div>
      </div>
    </div>
  );
}
