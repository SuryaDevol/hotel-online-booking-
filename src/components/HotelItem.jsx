import React, { useState } from 'react';
import { MapPin, Star, Edit3, Trash2, Globe, ImageOff } from 'lucide-react';

/**
 * HotelItem Component
 * Renders an individual hotel card in the grid view.
 */
export default function HotelItem({ hotel, onEdit, onDelete, onViewMap }) {
  const [imageError, setImageError] = useState(false);

  const hasCoordinates =
    hotel.latitude !== null &&
    hotel.latitude !== undefined &&
    hotel.longitude !== null &&
    hotel.longitude !== undefined;

  return (
    <article className="hotel-card" aria-labelledby={`hotel-title-${hotel.id}`}>
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
            <span className="price-amount">${hotel.price}</span>
            <span className="price-period">/ night</span>
          </div>
          {hotel.rating && (
            <div className="rating-tag">
              <Star size={13} className="star-icon" fill="currentColor" />
              <span>{hotel.rating}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Details Section */}
      <div className="hotel-card-body">
        <div className="hotel-card-header">
          <h3 id={`hotel-title-${hotel.id}`} className="hotel-name">
            {hotel.name}
          </h3>
          <div className="hotel-location">
            <MapPin size={15} className="location-pin-icon" />
            <span>{hotel.location}</span>
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

        {/* Card Actions Footer */}
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
