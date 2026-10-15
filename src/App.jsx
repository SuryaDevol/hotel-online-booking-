import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import {
  selectAllHotels,
  addHotel,
  updateHotel,
  deleteHotel,
  resetToInitialHotels,
  toggleFavorite,
} from './features/hotels/hotelsSlice';

import {
  selectAllBookings,
  selectActiveBookingModalHotel,
  selectIsBookingsDrawerOpen,
  openBookingModal,
  closeBookingModal,
  openBookingsDrawer,
  closeBookingsDrawer,
  addBooking,
  cancelBooking,
} from './features/bookings/bookingsSlice';

import { calculateDistanceKm } from './utils/geo';

// Subcomponents
import Navbar from './components/Navbar';
import StatsOverview from './components/StatsOverview';
import SearchAndFilters from './components/SearchAndFilters';
import HotelList from './components/HotelList';
import Pagination from './components/Pagination';
import HotelForm from './components/HotelForm';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import HotelMapModal from './components/HotelMapModal';
import BookingModal from './components/BookingModal';
import BookingsDrawer from './components/BookingsDrawer';
import Toast from './components/Toast';

export default function App() {
  const dispatch = useDispatch();
  const hotels = useSelector(selectAllHotels);
  const bookings = useSelector(selectAllBookings);
  const activeBookingHotel = useSelector(selectActiveBookingModalHotel);
  const isBookingsDrawerOpen = useSelector(selectIsBookingsDrawerOpen);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // Live Location & Theme State
  const [userLocation, setUserLocation] = useState(null);
  const [theme, setTheme] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem('grandstay_theme') || 'light';
      }
    } catch {
      // ignore
    }
    return 'light';
  });

  // Modal Dialogs State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [deletingHotel, setDeletingHotel] = useState(null);
  const [mapViewingHotel, setMapViewingHotel] = useState(null);

  // Toast Feedback State
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // Sync theme to root and local storage
  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('grandstay_theme', nextTheme);
      }
    } catch {
      // ignore
    }
    showToast(`Switched to ${nextTheme === 'dark' ? 'Dark Luxury' : 'Light Classic'} theme`);
  };

  // Live GPS Location Detection
  const handleDetectUserLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      showToast('Geolocation is not supported by your browser', 'warning');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setUserLocation(coords);
        showToast('📍 Live GPS coordinates detected! Distances computed.', 'success');
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        // Fallback demo location: Mumbai (Gateway of India)
        setUserLocation({ latitude: 18.922, longitude: 72.8347 });
        showToast('📍 Using Mumbai demo coordinates for proximity distances', 'success');
      },
      { timeout: 8000 }
    );
  }, [showToast]);

  // Compute live distances for all hotels from user location
  const distancesMap = useMemo(() => {
    const map = {};
    if (!userLocation) return map;

    hotels.forEach((hotel) => {
      if (hotel.latitude !== null && hotel.longitude !== null) {
        const dist = calculateDistanceKm(
          userLocation.latitude,
          userLocation.longitude,
          hotel.latitude,
          hotel.longitude
        );
        map[hotel.id] = dist;
      }
    });
    return map;
  }, [hotels, userLocation]);

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

    // 3. Favorites / Wishlist Filter
    if (favoritesOnly) {
      result = result.filter((hotel) => Boolean(hotel.isFavorite));
    }

    // 4. Sorting
    if (sortBy === 'distance-asc' && userLocation) {
      result.sort((a, b) => {
        const distA = distancesMap[a.id] !== undefined ? distancesMap[a.id] : 999999;
        const distB = distancesMap[b.id] !== undefined ? distancesMap[b.id] : 999999;
        return distA - distB;
      });
    } else if (sortBy === 'price-asc') {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }

    return result;
  }, [hotels, searchQuery, selectedLocation, favoritesOnly, sortBy, userLocation, distancesMap]);

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
    setFavoritesOnly(false);
    setCurrentPage(1);
    showToast('Filters cleared', 'success');
  };

  // Hotel CRUD Handlers
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
    setFavoritesOnly(false);
    setCurrentPage(1);
    showToast('Demo dataset restored to initial state!', 'success');
  };

  const handleToggleFavorite = (hotelId) => {
    dispatch(toggleFavorite(hotelId));
    const hotel = hotels.find((h) => h.id === hotelId);
    if (hotel) {
      const isNowFav = !hotel.isFavorite;
      showToast(isNowFav ? `Added "${hotel.name}" to favorites` : `Removed "${hotel.name}" from favorites`);
    }
  };

  // Booking & Payment Handlers
  const handleOpenBooking = (hotel) => {
    dispatch(openBookingModal(hotel));
  };

  const handleBookingCompleted = (confirmedBooking) => {
    dispatch(addBooking(confirmedBooking));
    showToast(`🎉 Reservation ${confirmedBooking.id} confirmed and paid!`, 'success');
  };

  const handleCancelBooking = (bookingId) => {
    dispatch(cancelBooking(bookingId));
    showToast(`Reservation ${bookingId} was cancelled. Refund initialized.`, 'warning');
  };

  return (
    <div className={`dashboard-app ${theme === 'dark' ? 'dark-theme' : ''}`} data-theme={theme}>
      {/* Client-side Metadata */}
      <Helmet>
        <title>GrandStay | Luxury Hotels & Instant Booking</title>
        <meta
          name="description"
          content="Enterprise-grade administrative dashboard and instant booking suite with Indian Rupee (₹ INR) payments and location intelligence."
        />
        <meta property="og:title" content="GrandStay Luxury Hotel Management & Booking" />
      </Helmet>

      {/* Header & Brand Navbar */}
      <Navbar
        onOpenAddModal={handleOpenAddModal}
        onResetData={handleResetDemoData}
        onOpenBookings={() => dispatch(openBookingsDrawer())}
        bookingsCount={bookings.length}
        theme={theme}
        onToggleTheme={handleToggleTheme}
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
              setCurrentPage(1);
            }}
            selectedLocation={selectedLocation}
            onLocationChange={(loc) => {
              setSelectedLocation(loc);
              setCurrentPage(1);
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
            favoritesOnly={favoritesOnly}
            onToggleFavoritesOnly={() => {
              setFavoritesOnly(!favoritesOnly);
              setCurrentPage(1);
            }}
            userLocation={userLocation}
            onDetectUserLocation={handleDetectUserLocation}
          />

          {/* Hotel Records Display (Cards or Table) */}
          <HotelList
            hotels={paginatedHotels}
            totalMatching={totalItems}
            totalInStore={hotels.length}
            viewMode={viewMode}
            distancesMap={distancesMap}
            onEdit={handleOpenEditModal}
            onDelete={setDeletingHotel}
            onViewMap={setMapViewingHotel}
            onResetFilters={handleResetFilters}
            onOpenAddModal={handleOpenAddModal}
            onBook={handleOpenBooking}
            onToggleFavorite={handleToggleFavorite}
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

      {/* Interactive Map Modal with Live Distance */}
      <HotelMapModal
        isOpen={Boolean(mapViewingHotel)}
        onClose={() => setMapViewingHotel(null)}
        hotel={mapViewingHotel}
        userLocation={userLocation}
        onDetectUserLocation={handleDetectUserLocation}
      />

      {/* Booking & FastPay Gateway Modal */}
      <BookingModal
        isOpen={Boolean(activeBookingHotel)}
        onClose={() => dispatch(closeBookingModal())}
        hotel={activeBookingHotel}
        onBookingComplete={handleBookingCompleted}
      />

      {/* My Bookings & Invoices Drawer */}
      <BookingsDrawer
        isOpen={isBookingsDrawerOpen}
        onClose={() => dispatch(closeBookingsDrawer())}
        bookings={bookings}
        onCancelBooking={handleCancelBooking}
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
          <p>&copy; 2026 GrandStay Luxury Hospitality Suite &bull; Fullstack Frontend &amp; Backend</p>
          <p className="footer-meta">
            FastPay Indian Payment Gateway &bull; GPS Location Intelligence &bull; React 18 &amp; Redux Toolkit
          </p>
        </div>
      </footer>
    </div>
  );
}
