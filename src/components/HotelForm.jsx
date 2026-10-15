import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Image, AlertCircle, Info, Sparkles, Trash2 } from 'lucide-react';

const PRESET_SAMPLE_IMAGES = [
  { label: 'Luxury Resort', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80' },
  { label: 'Modern City Tower', url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80' },
  { label: 'Cozy Boutique', url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80' },
  { label: 'Beachside Villa', url: 'https://images.unsplash.com/photo-1570213489059-0aac6626cade?auto=format&fit=crop&w=800&q=80' },
];

/**
 * HotelForm Component
 * Handles creating a new hotel or editing an existing hotel record.
 * Form state is kept local to this component until validated and dispatched to Redux.
 */
export default function HotelForm({ isOpen, onClose, onSubmit, initialData = null }) {
  const isEditMode = Boolean(initialData && initialData.id);

  // Local Form state
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    price: '',
    image: '',
    latitude: '',
    longitude: '',
    rating: '4.8',
    description: '',
  });

  // Validation errors map
  const [errors, setErrors] = useState({});
  const [imageUploadError, setImageUploadError] = useState('');
  const fileInputRef = useRef(null);
  const firstInputRef = useRef(null);

  // Sync state when initialData changes or modal opens
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        location: initialData.location || '',
        price: initialData.price !== undefined ? String(initialData.price) : '',
        image: initialData.image || '',
        latitude: initialData.latitude !== null && initialData.latitude !== undefined ? String(initialData.latitude) : '',
        longitude: initialData.longitude !== null && initialData.longitude !== undefined ? String(initialData.longitude) : '',
        rating: initialData.rating !== undefined ? String(initialData.rating) : '4.8',
        description: initialData.description || '',
      });
    } else {
      setFormData({
        name: '',
        location: '',
        price: '',
        image: '',
        latitude: '',
        longitude: '',
        rating: '4.8',
        description: '',
      });
    }
    setErrors({});
    setImageUploadError('');

    if (isOpen) {
      // Focus first input on open
      setTimeout(() => {
        if (firstInputRef.current) {
          firstInputRef.current.focus();
        }
      }, 100);
    }
  }, [initialData, isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for field once user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Client-side image file upload & validation
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setImageUploadError('');

    if (!file) return;

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setImageUploadError('Supported image types: JPG, PNG, WEBP.');
      return;
    }

    // Validate size (max 3 MB)
    const maxSizeInBytes = 3 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setImageUploadError('Image size exceeds 3 MB limit.');
      return;
    }

    // Convert to Data URL for instant local client preview
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setFormData((prev) => ({ ...prev, image: uploadEvent.target.result }));
    };
    reader.onerror = () => {
      setImageUploadError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: '' }));
    setImageUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Validation logic
  const validateForm = () => {
    const newErrors = {};

    // 1. Hotel Name
    if (!formData.name.trim()) {
      newErrors.name = 'Hotel name is required.';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Hotel name must be at least 3 characters.';
    }

    // 2. Location
    if (!formData.location.trim()) {
      newErrors.location = 'Location (city/address) is required.';
    }

    // 3. Price
    if (formData.price === '' || formData.price === null) {
      newErrors.price = 'Nightly price is required.';
    } else {
      const priceNum = Number(formData.price);
      if (isNaN(priceNum) || priceNum <= 0) {
        newErrors.price = 'Please enter a valid price greater than ₹0.';
      }
    }

    // 4. Latitude validation (-90 to 90)
    if (formData.latitude !== '') {
      const latNum = Number(formData.latitude);
      if (isNaN(latNum)) {
        newErrors.latitude = 'Latitude must be a valid number.';
      } else if (latNum < -90 || latNum > 90) {
        newErrors.latitude = 'Latitude must be between -90 and 90 degrees.';
      }
    }

    // 5. Longitude validation (-180 to 180)
    if (formData.longitude !== '') {
      const lngNum = Number(formData.longitude);
      if (isNaN(lngNum)) {
        newErrors.longitude = 'Longitude must be a valid number.';
      } else if (lngNum < -180 || lngNum > 180) {
        newErrors.longitude = 'Longitude must be between -180 and 180 degrees.';
      }
    }

    // 6. Rating validation (1 to 5)
    if (formData.rating !== '') {
      const ratingNum = Number(formData.rating);
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        newErrors.rating = 'Rating must be between 1.0 and 5.0.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Dispatch payload
    const submissionPayload = {
      ...(isEditMode ? { id: initialData.id } : {}),
      name: formData.name.trim(),
      location: formData.location.trim(),
      price: Number(formData.price),
      image: formData.image.trim(),
      latitude: formData.latitude !== '' ? Number(formData.latitude) : null,
      longitude: formData.longitude !== '' ? Number(formData.longitude) : null,
      rating: formData.rating !== '' ? Number(formData.rating) : 4.8,
      description: formData.description.trim(),
    };

    onSubmit(submissionPayload);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="form-modal-title">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h2 id="form-modal-title" className="modal-title">
              {isEditMode ? 'Edit Hotel Property' : 'Add New Hotel Property'}
            </h2>
            <p className="modal-subtitle">
              {isEditMode
                ? 'Update property details, rates, and geographic location'
                : 'Register a new property into the dashboard portfolio'}
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="hotel-form" noValidate>
          <div className="form-body-scroll">
            {/* Primary Details Row */}
            <div className="form-row">
              <div className="form-group flex-1">
                <label htmlFor="form-hotel-name" className="form-label required">
                  Hotel Name
                </label>
                <input
                  ref={firstInputRef}
                  id="form-hotel-name"
                  name="name"
                  type="text"
                  className={`form-input ${errors.name ? 'is-invalid' : ''}`}
                  placeholder="e.g., The Ritz-Carlton Grand"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                {errors.name && (
                  <span className="form-error-msg">
                    <AlertCircle size={14} /> {errors.name}
                  </span>
                )}
              </div>

              <div className="form-group flex-1">
                <label htmlFor="form-hotel-location" className="form-label required">
                  Location (City, Country)
                </label>
                <input
                  id="form-hotel-location"
                  name="location"
                  type="text"
                  className={`form-input ${errors.location ? 'is-invalid' : ''}`}
                  placeholder="e.g., Paris, France"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
                {errors.location && (
                  <span className="form-error-msg">
                    <AlertCircle size={14} /> {errors.location}
                  </span>
                )}
              </div>
            </div>

            {/* Price and Rating Row */}
            <div className="form-row">
              <div className="form-group flex-1">
                <label htmlFor="form-hotel-price" className="form-label required">
                  Price Per Night (₹ INR)
                </label>
                <input
                  id="form-hotel-price"
                  name="price"
                  type="number"
                  min="1"
                  step="1"
                  className={`form-input ${errors.price ? 'is-invalid' : ''}`}
                  placeholder="e.g., 18500"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
                {errors.price && (
                  <span className="form-error-msg">
                    <AlertCircle size={14} /> {errors.price}
                  </span>
                )}
              </div>

              <div className="form-group flex-1">
                <label htmlFor="form-hotel-rating" className="form-label">
                  Star Rating (1.0 to 5.0)
                </label>
                <input
                  id="form-hotel-rating"
                  name="rating"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  className={`form-input ${errors.rating ? 'is-invalid' : ''}`}
                  placeholder="4.8"
                  value={formData.rating}
                  onChange={handleChange}
                />
                {errors.rating && (
                  <span className="form-error-msg">
                    <AlertCircle size={14} /> {errors.rating}
                  </span>
                )}
              </div>
            </div>

            {/* Coordinates Section */}
            <div className="form-fieldset">
              <div className="fieldset-header">
                <span className="fieldset-title">Geographic Coordinates (Optional)</span>
                <span className="fieldset-hint">Used for map pins (-90 to 90 lat, -180 to 180 lng)</span>
              </div>
              <div className="form-row">
                <div className="form-group flex-1">
                  <label htmlFor="form-hotel-latitude" className="form-label">
                    Latitude
                  </label>
                  <input
                    id="form-hotel-latitude"
                    name="latitude"
                    type="number"
                    step="any"
                    className={`form-input ${errors.latitude ? 'is-invalid' : ''}`}
                    placeholder="e.g., 48.8566"
                    value={formData.latitude}
                    onChange={handleChange}
                  />
                  {errors.latitude && (
                    <span className="form-error-msg">
                      <AlertCircle size={14} /> {errors.latitude}
                    </span>
                  )}
                </div>

                <div className="form-group flex-1">
                  <label htmlFor="form-hotel-longitude" className="form-label">
                    Longitude
                  </label>
                  <input
                    id="form-hotel-longitude"
                    name="longitude"
                    type="number"
                    step="any"
                    className={`form-input ${errors.longitude ? 'is-invalid' : ''}`}
                    placeholder="e.g., 2.3522"
                    value={formData.longitude}
                    onChange={handleChange}
                  />
                  {errors.longitude && (
                    <span className="form-error-msg">
                      <AlertCircle size={14} /> {errors.longitude}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Image Upload and Preview Section */}
            <div className="form-group">
              <label className="form-label">Hotel Image</label>

              <div className="image-field-container">
                {formData.image ? (
                  <div className="image-preview-box">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="image-preview-thumbnail"
                    />
                    <div className="image-preview-meta">
                      <span className="image-preview-status">Active Image Preview</span>
                      <button
                        type="button"
                        className="btn btn-sm btn-ghost-danger"
                        onClick={handleRemoveImage}
                      >
                        <Trash2 size={14} /> Remove Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="image-dropzone"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={28} className="dropzone-icon" />
                    <span className="dropzone-title">Click to upload image from device</span>
                    <span className="dropzone-hint">PNG, JPG, or WEBP (Max 3 MB)</span>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden-file-input"
                  onChange={handleFileChange}
                />

                {imageUploadError && (
                  <span className="form-error-msg">
                    <AlertCircle size={14} /> {imageUploadError}
                  </span>
                )}

                {/* Alternative: Image URL Input */}
                <div className="image-url-fallback">
                  <label htmlFor="form-hotel-image-url" className="form-sublabel">
                    Or paste external Image URL:
                  </label>
                  <div className="input-group">
                    <input
                      id="form-hotel-image-url"
                      name="image"
                      type="url"
                      className="form-input form-input-sm"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={formData.image.startsWith('data:') ? '' : formData.image}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Preset Suggestions */}
                <div className="preset-images-row">
                  <span className="preset-label">
                    <Sparkles size={13} /> Quick Presets:
                  </span>
                  {PRESET_SAMPLE_IMAGES.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      className="preset-chip"
                      onClick={() => setFormData((p) => ({ ...p, image: preset.url }))}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Technical Note Callout */}
                <div className="info-callout">
                  <Info size={16} className="info-callout-icon" />
                  <p className="info-callout-text">
                    <strong>Frontend Memory Notice:</strong> As this is a client-side application without a backend server or database, uploaded files are converted to browser Base64 data URLs in local memory during this session.
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="form-hotel-description" className="form-label">
                Brief Description (Optional)
              </label>
              <textarea
                id="form-hotel-description"
                name="description"
                rows={3}
                className="form-textarea"
                placeholder="Highlight luxury amenities, views, proximity to attractions..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditMode ? 'Save Changes' : 'Create Hotel Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
