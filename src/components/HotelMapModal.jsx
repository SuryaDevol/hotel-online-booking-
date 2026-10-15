import React, { useEffect, useState } from 'react';
import { X, MapPin, Globe, ExternalLink, Navigation, Compass } from 'lucide-react';
import { calculateDistanceKm, formatDistance } from '../utils/geo';

/**
 * HotelMapModal Component
 * Visualizes geographic coordinates of a hotel on OpenStreetMap.
 * Features live user GPS distance calculation, Turn-by-Turn navigation link, and map embedding.
 */
export default function HotelMapModal({ isOpen, onClose, hotel, userLocation, onDetectUserLocation }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !hotel) return null;

  const lat = hotel.latitude;
  const lng = hotel.longitude;
  const hasCoords = lat !== null && lat !== undefined && lng !== null && lng !== undefined;

  // Calculate distance if user location is available
  const distanceKm =
    hasCoords && userLocation
      ? calculateDistanceKm(userLocation.latitude, userLocation.longitude, lat, lng)
      : null;

  // OpenStreetMap embed URL with bounding box around coordinates
  const delta = 0.03;
  const bbox = hasCoords
    ? `${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}`
    : '';
  const osmEmbedUrl = hasCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`
    : '';

  const osmExternalUrl = hasCoords
    ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=14/${lat}/${lng}`
    : '#';

  const directionsUrl = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : '#';

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="map-modal-title"
    >
      <div className="modal-card modal-lg" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h2 id="map-modal-title" className="modal-title">
              {hotel.name} — Interactive Location Map
            </h2>
            <div className="modal-map-meta">
              <span className="map-meta-item">
                <MapPin size={14} className="text-primary" /> {hotel.location}
              </span>
              {hasCoords && (
                <span className="map-meta-item">
                  <Globe size={14} /> Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}
                </span>
              )}
              {distanceKm !== null && (
                <span className="map-meta-item map-distance-highlight">
                  <Compass size={14} /> {formatDistance(distanceKm)} from your location
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close map dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Map Body */}
        <div className="modal-body-map">
          {hasCoords ? (
            <div className="osm-map-container">
              <iframe
                title={`Map of ${hotel.name}`}
                width="100%"
                height="420"
                style={{ border: 0, borderRadius: '12px' }}
                src={osmEmbedUrl}
                loading="lazy"
              />
              <div className="osm-attribution-bar">
                <div className="osm-links-left">
                  <span>Map data &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors</span>
                </div>
                <div className="osm-links-right">
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-secondary directions-btn"
                  >
                    <Navigation size={13} /> Get Turn-by-Turn Directions
                  </a>
                  <a
                    href={osmExternalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="osm-external-link"
                  >
                    Open in Full Map <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="map-empty-state">
              <Globe size={40} className="text-muted" />
              <h3>No Geographic Coordinates Available</h3>
              <p>This property does not have latitude and longitude values configured.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          {!userLocation && onDetectUserLocation && (
            <button
              type="button"
              className="btn btn-secondary mr-auto"
              onClick={onDetectUserLocation}
            >
              <Compass size={15} /> Find Distance from My Location
            </button>
          )}
          <button
            type="button"
            className="btn btn-primary"
            onClick={onClose}
          >
            Close Map
          </button>
        </div>
      </div>
    </div>
  );
}
