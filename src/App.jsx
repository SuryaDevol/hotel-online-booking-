import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import {
  selectAllHotels,
  addHotel,
  updateHotel,
  deleteHotel,
  resetToInitialHotels,
} from './features/hotels/hotelsSlice';

// Subcomponents
import Navbar from './components/Navbar';
import StatsOverview from './components/StatsOverview';
import SearchAndFilters from './components/SearchAndFilters';
import HotelList from './components/HotelList';
import Pagination from './components/Pagination';
import HotelForm from './components/HotelForm';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import HotelMapModal from './components/HotelMapModal';
import Toast from './components/Toast';

export default function App() {
  const dispatch = useDispatch();
  const hotels = useSelector(selectAllHotels);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modal Dialogs State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [deletingHotel, setDeletingHotel] = useState(null);
  const [mapViewingHotel, setMapViewingHotel] = useState(null);

  // Toast Feedback State
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Extract unique locations for the dropdown filter
  const availableLocations = useMemo(() => {
    const locSet = new Set();
    hotels.forEach((hotel) => {
      if (hotel.location) {
        locSet.add(hotel.location.trim());
      }
    });
    return Array.from(locSet).sort();
  }, [hotels]);

  // Combined Search, Filter & Sort Pipeline
  const filteredAndSortedHotels = useMemo(() => {
    let result = [...hotels];

    // 1. Search Query Filter (name OR location, case-insensitive)
    if (searchQuery.trim() !== '') {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter(
        (hotel) =>
          (hotel.name && hotel.name.toLowerCase().includes(query)) ||
          (hotel.location && hotel.location.toLowerCase().includes(query))
      );
    }

    // 2. Location Dropdown Filter
    if (selectedLocation !== 'all') {
      result = result.filter(
        (hotel) => hotel.location && hotel.location.toLowerCase() === selectedLocation.toLowerCase()
      );
    }

    // 3. Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }

    return result;
  }, [hotels, searchQuery, selectedLocation, sortBy]);

  // Pagination Calculations
  const totalItems = filteredAndSortedHotels.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Automatically adjust current page if total pages shrinks
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Slice hotels for current page
  const paginatedHotels = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedHotels.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedHotels, currentPage, itemsPerPage]);

  // Reset all filters and search
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedLocation('all');
    setSortBy('default');
    setCurrentPage(1);
    showToast('Filters cleared', 'success');
  };

  // CRUD Handlers
  const handleOpenAddModal = () => {
    setEditingHotel(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (hotel) => {
    setEditingHotel(hotel);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (formData) => {
    if (editingHotel) {
      dispatch(updateHotel(formData));
      showToast(`"${formData.name}" updated successfully!`, 'success');
    } else {
      dispatch(addHotel(formData));
      showToast(`"${formData.name}" added to portfolio!`, 'success');
      // Jump to first page to see the newly added item (prepended)
      setCurrentPage(1);
    }
    setIsFormOpen(false);
    setEditingHotel(null);
  };

  const handleConfirmDelete = (id) => {
    const hotelToDelete = hotels.find((h) => h.id === id);
    const hotelName = hotelToDelete ? hotelToDelete.name : 'Hotel';
    dispatch(deleteHotel(id));
    showToast(`"${hotelName}" was deleted.`, 'danger');
    setDeletingHotel(null);
  };

  const handleResetDemoData = () => {
    dispatch(resetToInitialHotels());
    setSearchQuery('');
    setSelectedLocation('all');
    setSortBy('default');
    setCurrentPage(1);
    showToast('Demo dataset restored to initial state!', 'success');
  };

  return (
    <div className="dashboard-app">
      {/* Client-side Metadata for Interview Demonstration */}
      <Helmet>
        <title>GrandStay | Hotel Management Dashboard</title>
        <meta
          name="description"
          content="Enterprise-grade administrative dashboard for hotel inventory, pricing, geographic coordinates, and property analytics."
        />
        <meta property="og:title" content="GrandStay Hotel Management Dashboard" />
        <meta property="og:description" content="Manage hotel listings, pricing, and locations with Redux Toolkit." />
      </Helmet>

      {/* Header & Brand Navbar */}
      <Navbar
        onOpenAddModal={handleOpenAddModal}
        onResetData={handleResetDemoData}
        totalCount={hotels.length}
      />

      {/* Main Content Area */}
      <main className="dashboard-main-content">
        <div className="dashboard-container">
          {/* Key Metric Overview Cards */}
          <StatsOverview hotels={hotels} />

          {/* Search, Filter, Sort & View Controls */}
          <SearchAndFilters
            searchQuery={searchQuery}
            onSearchChange={(query) => {
              setSearchQuery(query);
              setCurrentPage(1); // Reset to page 1 on search
            }}
            selectedLocation={selectedLocation}
            onLocationChange={(loc) => {
              setSelectedLocation(loc);
              setCurrentPage(1); // Reset to page 1 on filter
            }}
            availableLocations={availableLocations}
            sortBy={sortBy}
            onSortChange={setSortBy}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={(num) => {
              setItemsPerPage(num);
              setCurrentPage(1);
            }}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onResetFilters={handleResetFilters}
            totalResults={totalItems}
          />

          {/* Hotel Records Display (Cards or Table) */}
          <HotelList
            hotels={paginatedHotels}
            totalMatching={totalItems}
            totalInStore={hotels.length}
            viewMode={viewMode}
            onEdit={handleOpenEditModal}
            onDelete={setDeletingHotel}
            onViewMap={setMapViewingHotel}
            onResetFilters={handleResetFilters}
            onOpenAddModal={handleOpenAddModal}
          />

          {/* Pagination Controls */}
          {totalItems > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
            />
          )}
        </div>
      </main>

      {/* Add / Edit Hotel Modal */}
      <HotelForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingHotel(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingHotel}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingHotel)}
        onClose={() => setDeletingHotel(null)}
        onConfirm={handleConfirmDelete}
        hotel={deletingHotel}
      />

      {/* Interactive Map Modal */}
      <HotelMapModal
        isOpen={Boolean(mapViewingHotel)}
        onClose={() => setMapViewingHotel(null)}
        hotel={mapViewingHotel}
      />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="dashboard-container footer-content">
          <p>© 2026 GrandStay Admin Portfolio Suite &bull; Technical Interview Task</p>
          <p className="footer-meta">
            Built with React, Vite, Redux Toolkit &amp; Plain CSS
          </p>
        </div>
      </footer>
    </div>
  );
}
