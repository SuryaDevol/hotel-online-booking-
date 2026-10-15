import http from 'node:http';

const PORT = process.env.PORT || 5050;

// In-memory database of bookings for session
let bookings = [
  {
    id: "BK-884102",
    hotelId: "htl-1",
    hotelName: "The Taj Mahal Palace",
    location: "Mumbai, India",
    guestName: "Arjun Sharma",
    guestEmail: "arjun.sharma@example.com",
    guestPhone: "+91 98765 43210",
    checkIn: "2026-10-20",
    checkOut: "2026-10-23",
    nights: 3,
    guests: 2,
    roomType: "Luxury Sea View Suite",
    basePrice: 24500,
    discountAmount: 4900,
    taxes: 12348,
    totalAmount: 80948,
    paymentMethod: "UPI (Google Pay)",
    transactionId: "TXN-9982410",
    status: "Confirmed",
    createdAt: new Date().toISOString(),
  }
];

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  setCorsHeaders(res);

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    // 1. Health Check
    if (pathname === '/api/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', service: 'GrandStay Hotel API', time: new Date().toISOString() }));
      return;
    }

    // 2. Payment Gateway: Create Order
    if (pathname === '/api/payment/create-order' && req.method === 'POST') {
      const data = await parseJsonBody(req);
      const amount = Number(data.amount) || 1000;
      const orderId = `order_inr_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          success: true,
          orderId,
          amount,
          currency: 'INR',
          key: 'rzp_test_grandstay_suite',
          receipt: `rcpt_${Date.now()}`,
          message: 'Payment order initialized successfully',
        })
      );
      return;
    }

    // 3. Payment Gateway: Verify & Capture Payment
    if (pathname === '/api/payment/verify' && req.method === 'POST') {
      const data = await parseJsonBody(req);
      const paymentId = `pay_${Date.now()}_${Math.floor(Math.random() * 89999 + 10000)}`;

      // Simulate instantaneous bank gateway approval
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          success: true,
          paymentId,
          orderId: data.orderId || 'order_unknown',
          method: data.method || 'UPI',
          status: 'captured',
          verifiedAt: new Date().toISOString(),
          message: 'Payment authorized and captured successfully via 256-bit encryption',
        })
      );
      return;
    }

    // 4. Bookings: List All Bookings
    if (pathname === '/api/bookings' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, count: bookings.length, bookings }));
      return;
    }

    // 5. Bookings: Create New Booking
    if (pathname === '/api/bookings' && req.method === 'POST') {
      const bookingData = await parseJsonBody(req);
      const newBooking = {
        id: `BK-${Math.floor(100000 + Math.random() * 900000)}`,
        ...bookingData,
        status: 'Confirmed',
        createdAt: new Date().toISOString(),
      };
      bookings.unshift(newBooking);

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, booking: newBooking }));
      return;
    }

    // 404 Route handler
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found', path: pathname }));
  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error', details: error.message }));
  }
});

server.listen(PORT, () => {
  console.log(`GrandStay Backend API Server listening on port ${PORT}`);
  console.log(`Endpoints available:`);
  console.log(`  GET  /api/health`);
  console.log(`  POST /api/payment/create-order`);
  console.log(`  POST /api/payment/verify`);
  console.log(`  GET  /api/bookings`);
  console.log(`  POST /api/bookings`);
});
