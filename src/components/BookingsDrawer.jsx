import React from 'react';
import { X, Calendar, MapPin, Building, CreditCard, CheckCircle2, AlertCircle, Printer, Trash2 } from 'lucide-react';

export default function BookingsDrawer({ isOpen, onClose, bookings, onCancelBooking }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop drawer-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <h2 className="drawer-title">My Bookings &amp; Invoices</h2>
            <span className="drawer-subtitle">
              {bookings.length} {bookings.length === 1 ? 'reservation' : 'reservations'} found
            </span>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close bookings panel">
            <X size={20} />
          </button>
        </div>

        <div className="drawer-body">
          {bookings.length === 0 ? (
            <div className="empty-drawer-state">
              <Building size={48} className="empty-drawer-icon" />
              <h3>No Active Reservations</h3>
              <p>You haven't made any hotel reservations yet. Browse hotels and click "Book Now" to reserve your stay.</p>
            </div>
          ) : (
            <div className="bookings-list">
              {bookings.map((booking) => (
                <div key={booking.id} className="booking-ticket-card">
                  <div className="ticket-header">
                    <div>
                      <span className="ticket-id">{booking.id}</span>
                      <h4 className="ticket-hotel-name">{booking.hotelName}</h4>
                      <div className="ticket-location">
                        <MapPin size={13} /> {booking.location}
                      </div>
                    </div>
                    <span
                      className={`ticket-status-badge ${
                        booking.status === 'Confirmed' ? 'status-confirmed' : 'status-cancelled'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <div className="ticket-details-grid">
                    <div className="ticket-detail-item">
                      <Calendar size={14} className="ticket-icon" />
                      <div>
                        <span className="ticket-sublabel">Dates</span>
                        <span className="ticket-value">
                          {booking.checkIn} &rarr; {booking.checkOut} ({booking.nights} {booking.nights === 1 ? 'nt' : 'nts'})
                        </span>
                      </div>
                    </div>

                    <div className="ticket-detail-item">
                      <CreditCard size={14} className="ticket-icon" />
                      <div>
                        <span className="ticket-sublabel">Payment &amp; Amount</span>
                        <span className="ticket-value">
                          ₹{booking.totalAmount.toLocaleString('en-IN')} &bull; {booking.paymentMethod.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="ticket-footer">
                    <span className="ticket-guest-name">Guest: {booking.guestName}</span>
                    <div className="ticket-actions">
                      <button
                        type="button"
                        className="btn btn-sm btn-ghost"
                        onClick={() => window.print()}
                        title="Print Invoice"
                      >
                        <Printer size={14} /> Invoice
                      </button>
                      {booking.status === 'Confirmed' && (
                        <button
                          type="button"
                          className="btn btn-sm btn-ghost-danger"
                          onClick={() => onCancelBooking(booking.id)}
                          title="Cancel Reservation"
                        >
                          <Trash2 size={14} /> Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
