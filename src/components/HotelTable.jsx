import React, { useState } from 'react';
import { MapPin, Star, Edit3, Trash2, Globe, ImageOff, CreditCard, Heart } from 'lucide-react';

/**
 * Table Thumbnail helper to catch image errors gracefully
 */
function TableThumbnail({ src, alt }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className="table-thumb-placeholder">
        <ImageOff size={16} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="table-thumb"
      loading="lazy"
      onError={() => setError(true)}
    />
  );
}

/**
 * HotelTable Component
 * Renders hotel records in an administrative tabular layout with Indian Rupee (₹ INR) formatting,
 * direct Book Now CTA, and favorites toggle.
 */
export default function HotelTable({ hotels, onEdit, onDelete, onViewMap, onBook, onToggleFavorite }) {
  return (
    <div className="table-responsive-wrapper animated-fade">
      <table className="hotel-data-table">
        <thead>
          <tr>
            <th scope="col" style={{ width: '40px' }}>Fav</th>
            <th scope="col" style={{ width: '60px' }}>Preview</th>
            <th scope="col">Hotel Name</th>
            <th scope="col">Location</th>
            <th scope="col">Price / Night</th>
            <th scope="col">Coordinates</th>
            <th scope="col">Rating</th>
            <th scope="col" style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {hotels.map((hotel, index) => {
            const hasCoordinates =
              hotel.latitude !== null &&
              hotel.latitude !== undefined &&
              hotel.longitude !== null &&
              hotel.longitude !== undefined;

            return (
              <tr
                key={hotel.id}
                className="table-row animated-row"
                style={{ animationDelay: `${index * 45}ms` }}
              >
                <td>
                  <button
                    type="button"
                    className={`btn-icon-table-fav ${hotel.isFavorite ? 'favorited' : ''}`}
                    onClick={() => onToggleFavorite && onToggleFavorite(hotel.id)}
                    title={hotel.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    aria-label={`Favorite ${hotel.name}`}
                  >
                    <Heart size={14} fill={hotel.isFavorite ? 'currentColor' : 'none'} />
                  </button>
                </td>
                <td>
                  <TableThumbnail src={hotel.image} alt={hotel.name} />
                </td>
                <td className="table-cell-title">
                  <div className="table-hotel-name">{hotel.name}</div>
                  {hotel.description && (
                    <div className="table-hotel-desc">{hotel.description}</div>
                  )}
                </td>
                <td>
                  <div className="table-location-wrap">
                    <MapPin size={14} className="location-pin-icon" />
                    <span>{hotel.location}</span>
                  </div>
                </td>
                <td>
                  <span className="table-price-badge">
                    ₹{Number(hotel.price).toLocaleString('en-IN')}
                  </span>
                </td>
                <td>
                  {hasCoordinates ? (
                    <button
                      type="button"
                      className="table-coord-btn"
                      onClick={() => onViewMap(hotel)}
                      title="View on Map"
                    >
                      <Globe size={13} />
                      <span>
                        {hotel.latitude.toFixed(2)}, {hotel.longitude.toFixed(2)}
                      </span>
                    </button>
                  ) : (
                    <span className="text-muted table-no-coords">—</span>
                  )}
                </td>
                <td>
                  {hotel.rating ? (
                    <div className="table-rating-badge">
                      <Star size={13} fill="currentColor" />
                      <span>{hotel.rating}</span>
                    </div>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td>
                  <div className="table-actions-cell">
                    <button
                      type="button"
                      className="btn btn-sm btn-primary table-btn-book"
                      onClick={() => onBook && onBook(hotel)}
                      title={`Book ${hotel.name}`}
                    >
                      <CreditCard size={13} /> Book
                    </button>
                    {hasCoordinates && (
                      <button
                        type="button"
                        className="btn-icon-action btn-map-action"
                        onClick={() => onViewMap(hotel)}
                        title={`View ${hotel.name} on map`}
                        aria-label={`View ${hotel.name} on map`}
                      >
                        <Globe size={15} />
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-icon-action btn-edit-action"
                      onClick={() => onEdit(hotel)}
                      title={`Edit ${hotel.name}`}
                      aria-label={`Edit ${hotel.name}`}
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      type="button"
                      className="btn-icon-action btn-delete-action"
                      onClick={() => onDelete(hotel)}
                      title={`Delete ${hotel.name}`}
                      aria-label={`Delete ${hotel.name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
