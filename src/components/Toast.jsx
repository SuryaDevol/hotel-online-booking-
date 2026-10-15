import React, { useEffect } from 'react';

/**
 * Toast Notification Component
 * Provides transient, accessible visual feedback when CRUD actions complete.
 */
export default function Toast({ message, type = 'success', onClose, duration = 3500 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const bgStyle =
    type === 'danger'
      ? 'var(--color-danger-bg)'
      : type === 'warning'
      ? 'var(--color-warning-bg)'
      : 'var(--color-success-bg)';

  const textStyle =
    type === 'danger'
      ? 'var(--color-danger-text)'
      : type === 'warning'
      ? 'var(--color-warning-text)'
      : 'var(--color-success-text)';

  const borderStyle =
    type === 'danger'
      ? 'var(--color-danger-border)'
      : type === 'warning'
      ? 'var(--color-warning-border)'
      : 'var(--color-success-border)';

  return (
    <div
      role="status"
      aria-live="polite"
      className="toast-notification"
      style={{
        backgroundColor: bgStyle,
        color: textStyle,
        borderColor: borderStyle,
      }}
    >
      <div className="toast-icon">
        {type === 'danger' ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        )}
      </div>
      <span className="toast-message">{message}</span>
      <button
        type="button"
        className="toast-close-btn"
        onClick={onClose}
        aria-label="Close notification"
      >
        &times;
      </button>
    </div>
  );
}
