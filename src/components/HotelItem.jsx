import React, { useState } from 'react';
import { MapPin, Star, Edit3, Trash2, Globe, ImageOff, Heart, CreditCard, Compass } from 'lucide-react';
import { formatDistance } from '../utils/geo';

/**
 * HotelItem Component
 * Renders an individual hotel card in the grid view.
 * Features:
 * - Direct "Book Now" CTA with Payment Gateway flow
 * - Live GPS Distance badge from user's location
 * - Interactive Wishlist / Favorite toggle
 * - Prices formatted in Indian Rupees (₹ INR)
 */
export default function HotelItem({
  hotel,
  index = 0,
  distanceKm = null,
  onEdit,
  onDelete,
  onViewMap,
  onBook,
  onToggleFavorite,
}) {
  const [imageError, setImageError] = useState(false);

  const hasCoordinates =
    hotel.latitude !== null &&
    hotel.latitude !== undefined &&
    hotel.longitude !== null &&
    hotel.longitude !== undefined;

  const formattedPrice = Number(hotel.price).toLocaleString('en-IN');
  const distanceFormatted = formatDistance(distanceKm);

  return (
    <article
      className="hotel-card animated-card"
      style={{ animationDelay: `${index * 75}ms` }}
      aria-labelledby={`hotel-title-${hotel.id}`}
    >
      {/* Thumbnail Section */}
      <div className="hotel-card-media">
        {hotel.image && !imageError ? (
          <img
            src={hotel.image}
            alt={hotel.name}
            className="hotel-card-img"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="hotel-img-placeholder" aria-label="No image available">
            <ImageOff size={32} />
            <span>No Image Preview</span>
          </div>
        )}

        <div className="card-media-overlay">
          <div className="price-tag">
            <span className="price-currency">₹</span>
            <span className="price-amount">{formattedPrice}</span>
            <span className="price-period">/ night</span>
          </div>

          <div className="card-overlay-actions">
            {hotel.rating && (
              <div className="rating-tag">
                <Star size={13} className="star-icon" fill="currentColor" />
                <span>{hotel.rating}</span>
              </div>
            )}
            <button
              type="button"
              className={`favorite-btn ${hotel.isFavorite ? 'favorited' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleFavorite) onToggleFavorite(hotel.id);
              }}
              title={hotel.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-label={`Favorite ${hotel.name}`}
            >
              <Heart size={15} fill={hotel.isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>

      {/* Card Details Section */}
      <div className="hotel-card-body">
        <div className="hotel-card-header">
          <h3 id={`hotel-title-${hotel.id}`} className="hotel-name">
            {hotel.name}
          </h3>
          <div className="hotel-location-row">
            <div className="hotel-location">
              <MapPin size={15} className="location-pin-icon" />
              <span>{hotel.location}</span>
            </div>
            {distanceFormatted && (
              <span className="hotel-distance-pill">
                <Compass size={12} /> {distanceFormatted}
              </span>
            )}
          </div>
        </div>

        {hotel.description && (
          <p className="hotel-description">{hotel.description}</p>
        )}

        {/* Coordinates Pill */}
        <div className="hotel-coordinates-row">
          {hasCoordinates ? (
            <button
              type="button"
              className="coord-badge coord-interactive"
              onClick={() => onViewMap(hotel)}
              title="Click to view hotel on interactive map"
            >
              <Globe size={13} />
              <span>
                {hotel.latitude.toFixed(4)}, {hotel.longitude.toFixed(4)}
              </span>
            </button>
          ) : (
            <span className="coord-badge coord-empty">
              <Globe size={13} />
              <span>Coordinates not set</span>
            </span>
          )}
        </div>

        {/* Primary Booking CTA */}
        <div className="hotel-booking-cta-row">
          <button
            type="button"
            className="btn btn-primary btn-full btn-book-now"
            onClick={() => onBook && onBook(hotel)}
            aria-label={`Book stay at ${hotel.name}`}
          >
            <CreditCard size={15} />
            <span>Book Now</span>
          </button>
        </div>

        {/* Card Admin Actions Footer */}
        <div className="hotel-card-footer">
          {hasCoordinates && (
            <button
              type="button"
              className="btn btn-sm btn-ghost view-map-btn"
              onClick={() => onViewMap(hotel)}
              aria-label={`View ${hotel.name} on map`}
            >
              <Globe size={14} />
              <span>Map</span>
            </button>
          )}

          <div className="card-action-group">
            <button
              type="button"
              className="btn btn-sm btn-secondary edit-btn"
              onClick={() => onEdit(hotel)}
              aria-label={`Edit ${hotel.name}`}
            >
              <Edit3 size={14} />
              <span>Edit</span>
            </button>
            <button
              type="button"
              className="btn btn-sm btn-danger-outline delete-btn"
              onClick={() => onDelete(hotel)}
              aria-label={`Delete ${hotel.name}`}
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
