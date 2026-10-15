import React, { useEffect, useState } from 'react';
import { X, MapPin, Globe, ExternalLink } from 'lucide-react';

/**
 * HotelMapModal Component
 * Visualizes the geographic coordinates of a hotel on OpenStreetMap.
 * Uses an interactive OpenStreetMap frame with marker coordinates and direct map link.
 */
export default function HotelMapModal({ isOpen, onClose, hotel }) {
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
              {hotel.name} — Location Map
            </h2>
            <div className="modal-map-meta">
              <span className="map-meta-item">
                <MapPin size={14} /> {hotel.location}
              </span>
              {hasCoords && (
                <span className="map-meta-item">
                  <Globe size={14} /> Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}
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
                style={{ border: 0, borderRadius: '8px' }}
                src={osmEmbedUrl}
                loading="lazy"
              />
              <div className="osm-attribution-bar">
                <span>Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors</span>
                <a
                  href={osmExternalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="osm-external-link"
                >
                  Open in OpenStreetMap <ExternalLink size={13} />
                </a>
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
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Close Map
          </button>
        </div>
      </div>
    </div>
  );
}
