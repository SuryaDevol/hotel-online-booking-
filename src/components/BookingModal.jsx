import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Users,
  ShieldCheck,
  CreditCard,
  QrCode,
  Landmark,
  Building,
  CheckCircle2,
  Clock,
  Printer,
  Sparkles,
  Lock,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { createPaymentOrder, verifyPayment, createBookingOnServer } from '../services/api';

const ROOM_TYPES = [
  { id: 'deluxe', name: 'Deluxe Heritage Room', multiplier: 1, desc: 'King bed, marble bathroom, city view' },
  { id: 'suite', name: 'Executive Royal Suite', multiplier: 1.45, desc: 'Separate lounge, balcony, complimentary breakfast & butler' },
  { id: 'presidential', name: 'Presidential Signature Villa', multiplier: 2.1, desc: 'Private plunge pool, panoramic vistas & airport luxury transfers' },
];

export default function BookingModal({ isOpen, onClose, hotel, onBookingComplete }) {
  // Step: 'details' -> 'gateway' -> 'processing' -> 'success'
  const [step, setStep] = useState('details');

  // Booking Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + 2);
  const nextDateStr = nextDate.toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(todayStr);
  const [checkOut, setCheckOut] = useState(nextDateStr);
  const [guests, setGuests] = useState(2);
  const [roomType, setRoomType] = useState('deluxe');
  const [guestName, setGuestName] = useState('Priya Sharma');
  const [guestEmail, setGuestEmail] = useState('priya.sharma@example.com');
  const [guestPhone, setGuestPhone] = useState('+91 98765 43210');

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  // Payment Gateway State
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking' | 'pay_at_hotel'
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [selectedBank, setSelectedBank] = useState('hdfc');

  // Processing & Confirmation State
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [orderId, setOrderId] = useState('');
  const [paymentTimer, setPaymentTimer] = useState(300); // 5 min timer

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setStep('details');
      setCouponCode('');
      setAppliedCoupon(null);
      setCouponError('');
      setPaymentMethod('upi');
      setPaymentTimer(300);
      setConfirmedBooking(null);
    }
  }, [isOpen]);

  // Payment countdown timer
  useEffect(() => {
    if (step === 'gateway' && paymentTimer > 0) {
      const interval = setInterval(() => {
        setPaymentTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, paymentTimer]);

  if (!isOpen || !hotel) return null;

  // Nights calculation
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const diffTime = Math.max(1, checkOutDate - checkInDate);
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Price calculations
  const selectedRoomObj = ROOM_TYPES.find((r) => r.id === roomType) || ROOM_TYPES[0];
  const nightlyRate = Math.round(hotel.price * selectedRoomObj.multiplier);
  const baseTotal = nightlyRate * nights;

  let discount = 0;
  if (appliedCoupon === 'NAMLA20') {
    discount = Math.round(baseTotal * 0.2);
  } else if (appliedCoupon === 'WELCOME500') {
    discount = Math.min(baseTotal, 500);
  } else if (appliedCoupon === 'GRAND1000') {
    discount = Math.min(baseTotal, 1000);
  }

  const taxableAmount = Math.max(0, baseTotal - discount);
  const gstTax = Math.round(taxableAmount * 0.18); // 18% GST standard in India
  const grandTotal = taxableAmount + gstTax;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (code === 'NAMLA20') {
      setAppliedCoupon('NAMLA20');
    } else if (code === 'WELCOME500') {
      setAppliedCoupon('WELCOME500');
    } else if (code === 'GRAND1000') {
      setAppliedCoupon('GRAND1000');
    } else {
      setCouponError('Invalid promo code. Try NAMLA20, WELCOME500, or GRAND1000');
    }
  };

  const handleProceedToPayment = async () => {
    // Initialize order with backend
    const order = await createPaymentOrder(grandTotal, {
      hotelId: hotel.id,
      hotelName: hotel.name,
      guestName,
    });
    setOrderId(order.orderId);
    setStep('gateway');
  };

  const handleExecutePayment = async () => {
    setStep('processing');

    // Simulate authentic payment processing with gateway
    try {
      const verifyRes = await verifyPayment(orderId, paymentMethod.toUpperCase(), {
        upiId: paymentMethod === 'upi' ? upiId || 'customer@okhdfcbank' : undefined,
        cardLast4: paymentMethod === 'card' ? cardNumber.slice(-4) || '4242' : undefined,
        bank: paymentMethod === 'netbanking' ? selectedBank : undefined,
      });

      // Create confirmed reservation payload
      const bookingRecord = {
        hotelId: hotel.id,
        hotelName: hotel.name,
        location: hotel.location,
        guestName,
        guestEmail,
        guestPhone,
        checkIn,
        checkOut,
        nights,
        guests,
        roomType: selectedRoomObj.name,
        nightlyRate,
        basePrice: baseTotal,
        discountAmount: discount,
        taxes: gstTax,
        totalAmount: grandTotal,
        paymentMethod:
          paymentMethod === 'upi'
            ? 'UPI (PhonePe / GPay)'
            : paymentMethod === 'card'
            ? 'Credit/Debit Card (Visa/Mastercard/RuPay)'
            : paymentMethod === 'netbanking'
            ? `Net Banking (${selectedBank.toUpperCase()})`
            : 'Pay at Hotel (Cash / Card on Arrival)',
        transactionId: verifyRes.paymentId || `TXN-${Math.floor(1000000 + Math.random() * 9000000)}`,
        status: 'Confirmed',
      };

      const finalizedBooking = await createBookingOnServer(bookingRecord);
      setConfirmedBooking(finalizedBooking);

      if (onBookingComplete) {
        onBookingComplete(finalizedBooking);
      }

      setTimeout(() => {
        setStep('success');
      }, 1500);
    } catch (err) {
      console.error('Payment error:', err);
      setStep('gateway');
    }
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card modal-lg checkout-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header checkout-header">
          <div className="checkout-brand-title">
            <div className="checkout-secure-badge">
              <Lock size={15} />
              <span>256-Bit SSL Secured</span>
            </div>
            <h2 className="modal-title">
              {step === 'success' ? 'Booking Confirmed!' : `Reserve Your Stay — ${hotel.name}`}
            </h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="form-body-scroll checkout-body">
          {/* STEP 1: RESERVATION DETAILS */}
          {step === 'details' && (
            <div className="checkout-grid">
              <div className="checkout-form-column">
                <h3 className="checkout-section-heading">1. Guest & Stay Information</h3>

                <div className="form-row">
                  <div className="form-group flex-1">
                    <label className="form-label required">Primary Guest Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g., Rohit Verma"
                      required
                    />
                  </div>
                  <div className="form-group flex-1">
                    <label className="form-label required">Mobile Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label required">Email Address (For Tax Invoice)</label>
                  <input
                    type="email"
                    className="form-input"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="guest@example.com"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group flex-1">
                    <label className="form-label required">
                      <Calendar size={14} className="label-icon" /> Check-in Date
                    </label>
                    <input
                      type="date"
                      className="form-input"
                      min={todayStr}
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                    />
                  </div>
                  <div className="form-group flex-1">
                    <label className="form-label required">
                      <Calendar size={14} className="label-icon" /> Check-out Date
                    </label>
                    <input
                      type="date"
                      className="form-input"
                      min={checkIn}
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group flex-1">
                    <label className="form-label">
                      <Users size={14} className="label-icon" /> Guests
                    </label>
                    <select
                      className="form-input filter-select"
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                    >
                      <option value={1}>1 Guest (Solo)</option>
                      <option value={2}>2 Guests (Couple)</option>
                      <option value={3}>3 Guests</option>
                      <option value={4}>4 Guests (Family)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Select Room Category</label>
                  <div className="room-options-grid">
                    {ROOM_TYPES.map((room) => (
                      <div
                        key={room.id}
                        className={`room-option-card ${roomType === room.id ? 'active' : ''}`}
                        onClick={() => setRoomType(room.id)}
                      >
                        <div className="room-option-header">
                          <span className="room-option-title">{room.name}</span>
                          <span className="room-option-rate">
                            ₹{Math.round(hotel.price * room.multiplier).toLocaleString('en-IN')}/nt
                          </span>
                        </div>
                        <p className="room-option-desc">{room.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price Summary Column */}
              <div className="checkout-summary-column">
                <div className="order-summary-box">
                  <h3 className="summary-title">Fare Breakdown</h3>
                  <div className="summary-hotel-badge">
                    <Building size={16} />
                    <div>
                      <strong>{hotel.name}</strong>
                      <span className="summary-location">{hotel.location}</span>
                    </div>
                  </div>

                  <div className="summary-row">
                    <span>
                      ₹{nightlyRate.toLocaleString('en-IN')} × {nights} {nights === 1 ? 'Night' : 'Nights'}
                    </span>
                    <span>₹{baseTotal.toLocaleString('en-IN')}</span>
                  </div>

                  {discount > 0 && (
                    <div className="summary-row discount-row">
                      <span>Promo Discount ({appliedCoupon})</span>
                      <span>-₹{discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="summary-row">
                    <span>GST (18% Goods & Services Tax)</span>
                    <span>₹{gstTax.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="summary-divider"></div>

                  <div className="summary-total-row">
                    <span>Grand Total (INR)</span>
                    <span className="summary-grand-total">₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>

                  {/* Coupon Form */}
                  <form onSubmit={handleApplyCoupon} className="coupon-form">
                    <label className="form-sublabel">Have a Promo Coupon?</label>
                    <div className="coupon-input-group">
                      <input
                        type="text"
                        className="form-input form-input-sm"
                        placeholder="e.g. NAMLA20"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      />
                      <button type="submit" className="btn btn-sm btn-secondary">
                        Apply
                      </button>
                    </div>
                    {couponError && <span className="form-error-msg">{couponError}</span>}
                    {appliedCoupon && (
                      <span className="coupon-success-msg">
                        <Sparkles size={13} /> {appliedCoupon} applied successfully!
                      </span>
                    )}
                  </form>

                  <button
                    type="button"
                    className="btn btn-primary btn-full checkout-proceed-btn"
                    onClick={handleProceedToPayment}
                  >
                    Proceed to Payment <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PAYMENT GATEWAY */}
          {step === 'gateway' && (
            <div className="gateway-container">
              <div className="gateway-banner">
                <div>
                  <span className="gateway-label">GrandStay FastPay Gateway</span>
                  <div className="gateway-amount">₹{grandTotal.toLocaleString('en-IN')}</div>
                  <span className="gateway-order-id">Order ID: {orderId}</span>
                </div>
                <div className="gateway-timer-badge">
                  <Clock size={15} />
                  <span>Expires in {formatTimer(paymentTimer)}</span>
                </div>
              </div>

              {/* Payment Methods Nav */}
              <div className="gateway-tabs">
                <button
                  type="button"
                  className={`gateway-tab ${paymentMethod === 'upi' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('upi')}
                >
                  <QrCode size={18} />
                  <span>UPI &amp; QR Code</span>
                </button>
                <button
                  type="button"
                  className={`gateway-tab ${paymentMethod === 'card' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <CreditCard size={18} />
                  <span>Cards (Debit/Credit)</span>
                </button>
                <button
                  type="button"
                  className={`gateway-tab ${paymentMethod === 'netbanking' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('netbanking')}
                >
                  <Landmark size={18} />
                  <span>Net Banking</span>
                </button>
                <button
                  type="button"
                  className={`gateway-tab ${paymentMethod === 'pay_at_hotel' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('pay_at_hotel')}
                >
                  <Building size={18} />
                  <span>Pay at Hotel</span>
                </button>
              </div>

              {/* Tab Content: UPI */}
              {paymentMethod === 'upi' && (
                <div className="gateway-tab-content">
                  <div className="upi-content-grid">
                    <div className="upi-qr-card">
                      <div className="qr-box">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=grandstay@okhdfcbank&pn=GrandStay%20Hotels&am=${grandTotal}&cu=INR`}
                          alt="UPI Payment QR Code"
                          className="qr-image"
                        />
                        <div className="qr-scan-line"></div>
                      </div>
                      <span className="qr-hint">Scan with any UPI App</span>
                      <div className="upi-logos-row">
                        <span className="upi-app-pill">GPay</span>
                        <span className="upi-app-pill">PhonePe</span>
                        <span className="upi-app-pill">Paytm</span>
                        <span className="upi-app-pill">BHIM</span>
                      </div>
                    </div>

                    <div className="upi-id-divider">
                      <span>OR ENTER UPI ID</span>
                    </div>

                    <div className="upi-input-column">
                      <label className="form-label">Virtual Payment Address (VPA / UPI ID)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., mobilenumber@upi or name@okhdfcbank"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                      />
                      <p className="field-help-text">
                        A payment request will be sent to your UPI app for authorization.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content: Card */}
              {paymentMethod === 'card' && (
                <div className="gateway-tab-content card-tab-content">
                  <div className="card-input-grid">
                    <div className="form-group">
                      <label className="form-label">Card Number</label>
                      <div className="card-number-wrapper">
                        <input
                          type="text"
                          className="form-input"
                          maxLength={19}
                          placeholder="4532 8900 1234 5678"
                          value={cardNumber}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                            setCardNumber(val);
                          }}
                        />
                        <span className="card-brand-tag">RuPay / Visa</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Cardholder Name</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Name on card"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group flex-1">
                        <label className="form-label">Valid Thru (MM/YY)</label>
                        <input
                          type="text"
                          className="form-input"
                          maxLength={5}
                          placeholder="08/28"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                        />
                      </div>
                      <div className="form-group flex-1">
                        <label className="form-label">CVV / CVC</label>
                        <input
                          type="password"
                          className="form-input"
                          maxLength={4}
                          placeholder="•••"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content: Netbanking */}
              {paymentMethod === 'netbanking' && (
                <div className="gateway-tab-content">
                  <label className="form-label">Select Popular Indian Bank</label>
                  <div className="banks-grid">
                    {[
                      { id: 'hdfc', name: 'HDFC Bank' },
                      { id: 'sbi', name: 'State Bank of India' },
                      { id: 'icici', name: 'ICICI Bank' },
                      { id: 'axis', name: 'Axis Bank' },
                      { id: 'kotak', name: 'Kotak Mahindra' },
                      { id: 'pnb', name: 'Punjab National Bank' },
                    ].map((bank) => (
                      <div
                        key={bank.id}
                        className={`bank-pill ${selectedBank === bank.id ? 'active' : ''}`}
                        onClick={() => setSelectedBank(bank.id)}
                      >
                        <Landmark size={16} />
                        <span>{bank.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab Content: Pay at Hotel */}
              {paymentMethod === 'pay_at_hotel' && (
                <div className="gateway-tab-content">
                  <div className="pay-at-hotel-card">
                    <CheckCircle2 size={32} className="text-emerald" />
                    <h4>Zero Upfront Payment Required</h4>
                    <p>
                      Your reservation will be held guaranteed. You can complete payment via Cash, UPI, or Credit
                      Card during check-in at {hotel.name}.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="gateway-footer-row">
                <button type="button" className="btn btn-secondary" onClick={() => setStep('details')}>
                  Back
                </button>
                <button type="button" className="btn btn-primary btn-pay-now" onClick={handleExecutePayment}>
                  <ShieldCheck size={18} />
                  <span>
                    Pay ₹{grandTotal.toLocaleString('en-IN')}{' '}
                    {paymentMethod === 'pay_at_hotel' ? '(Confirm Reservation)' : 'Securely'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PROCESSING ANIMATION */}
          {step === 'processing' && (
            <div className="processing-state-wrapper">
              <div className="processing-spinner-ring">
                <div className="inner-pulse-dot"></div>
              </div>
              <h3 className="processing-title">Connecting to Bank Gateway...</h3>
              <p className="processing-subtext">
                Authorizing 256-bit encrypted transaction for ₹{grandTotal.toLocaleString('en-IN')}. Please do not
                refresh or close this tab.
              </p>
              <div className="processing-badges-row">
                <span className="security-tag">
                  <ShieldCheck size={14} /> RBI Mandated 3D Secure
                </span>
                <span className="security-tag">
                  <Lock size={14} /> End-to-End Encrypted
                </span>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS INVOICE */}
          {step === 'success' && confirmedBooking && (
            <div className="confirmation-wrapper">
              <div className="confirmation-badge-success">
                <CheckCircle2 size={48} className="success-icon" />
                <h3 className="confirmation-title">Booking &amp; Payment Successful!</h3>
                <p className="confirmation-subtitle">
                  Your reservation reference is <strong>{confirmedBooking.id}</strong>. A confirmation SMS &amp; tax
                  invoice have been dispatched.
                </p>
              </div>

              {/* Tax Invoice Box */}
              <div className="invoice-sheet" id="printable-tax-invoice">
                <div className="invoice-header">
                  <div>
                    <h4 className="invoice-brand">GrandStay Hospitality Suite</h4>
                    <span className="invoice-gst-number">GSTIN: 27AABCG1234F1Z8</span>
                  </div>
                  <div className="invoice-meta-right">
                    <span className="invoice-badge-paid">PAID &amp; CONFIRMED</span>
                    <span className="invoice-date">Date: {new Date().toLocaleDateString('en-IN')}</span>
                  </div>
                </div>

                <div className="invoice-info-grid">
                  <div>
                    <span className="invoice-label">Guest Name:</span>
                    <strong className="invoice-value">{confirmedBooking.guestName}</strong>
                  </div>
                  <div>
                    <span className="invoice-label">Hotel Property:</span>
                    <strong className="invoice-value">{confirmedBooking.hotelName}</strong>
                  </div>
                  <div>
                    <span className="invoice-label">Check-in:</span>
                    <span className="invoice-value">{confirmedBooking.checkIn}</span>
                  </div>
                  <div>
                    <span className="invoice-label">Check-out:</span>
                    <span className="invoice-value">{confirmedBooking.checkOut}</span>
                  </div>
                  <div>
                    <span className="invoice-label">Duration &amp; Room:</span>
                    <span className="invoice-value">
                      {confirmedBooking.nights} Nights &bull; {confirmedBooking.roomType}
                    </span>
                  </div>
                  <div>
                    <span className="invoice-label">Payment Mode:</span>
                    <span className="invoice-value">{confirmedBooking.paymentMethod}</span>
                  </div>
                </div>

                <div className="invoice-summary-bar">
                  <span>Total Amount Paid (Inclusive of 18% GST):</span>
                  <span className="invoice-grand-amount">₹{confirmedBooking.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="confirmation-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => window.print()}
                  title="Print or Save PDF Invoice"
                >
                  <Printer size={16} /> Print / Download Invoice
                </button>
                <button type="button" className="btn btn-primary" onClick={onClose}>
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
