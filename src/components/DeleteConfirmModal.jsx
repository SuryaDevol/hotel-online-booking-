import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

/**
 * DeleteConfirmModal Component
 * Accessible confirmation dialog preventing accidental deletion of records.
 */
export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, hotel }) {
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

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div className="modal-card modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="delete-modal-content">
          <div className="delete-icon-badge">
            <AlertTriangle size={28} className="warning-icon" />
          </div>

          <h2 id="delete-dialog-title" className="delete-title">
            Confirm Property Deletion
          </h2>

          <p className="delete-description">
            Are you sure you want to delete{' '}
            <strong className="delete-hotel-name">"{hotel.name}"</strong>?
          </p>

          <p className="delete-subtext">
            This action will remove the record from your current Redux session state.
          </p>

          <div className="modal-actions-stacked">
            <button
              type="button"
              className="btn btn-danger btn-full"
              onClick={() => {
                onConfirm(hotel.id);
                onClose();
              }}
            >
              <Trash2 size={16} /> Yes, Delete Hotel
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-full"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
