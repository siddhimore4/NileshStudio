import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getDb,
  registerOrLoginCustomer,
  getCustomerByPhone,
  updateCustomer,
  getAllCategories,
  getGalleryItems,
  getSlotAvailability,
  createBooking,
  getBookingsByCustomer,
  cancelCustomerBooking,
  getAllBookingsAdmin,
  updateBookingStatusAdmin,
  rescheduleBookingAdmin,
  blockSlotAdmin,
  unblockSlotAdmin,
  getScheduleByDateAdmin,
  SERVICE_PRICING,
  calculatePricing,
  verifyPaymentAdmin,
  rejectPaymentAdmin,
  markPaidAfterShootAdmin,
  getStudioPaymentSettings,
  updateStudioPaymentSettings
} from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize database on server start
await getDb();
console.log('Database loaded and ready.');

// Serve separate standalone Business Portal at /business (for studio owner)
const businessPortalDir = path.join(__dirname, '..', 'business-portal');
app.use('/business', express.static(businessPortalDir));

// Serve public static assets (images, logos, media)
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

// Serve customer app production build if available
const distDir = path.join(__dirname, '..', 'dist');
app.use(express.static(distDir));

// --- CUSTOMER APP API ENDPOINTS ---

// 1. Customer Registration / Login (No OTP, phone + name based, optional email)
app.post('/api/auth/register-or-login', (req, res) => {
  try {
    const { fullName, phoneNumber, email } = req.body;
    if (!fullName || !phoneNumber) {
      return res.status(400).json({ error: 'Full name and phone number are required.' });
    }
    const customer = registerOrLoginCustomer({ fullName, phoneNumber, email });
    res.json({ success: true, customer });
  } catch (err) {
    console.error('Error in register-or-login:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Fetch Customer by Phone
app.get('/api/auth/customer/:phoneNumber', (req, res) => {
  try {
    const customer = getCustomerByPhone(req.params.phoneNumber);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found.' });
    }
    res.json({ success: true, customer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Update Customer Profile
app.put('/api/auth/customer/:id', (req, res) => {
  try {
    const { fullName, email } = req.body;
    if (!fullName) {
      return res.status(400).json({ error: 'Full name is required.' });
    }
    const customer = updateCustomer(req.params.id, { fullName, email });
    res.json({ success: true, customer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Get Categories with Subcategories
app.get('/api/categories', (req, res) => {
  try {
    const categories = getAllCategories();
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Get Gallery Thumbnails
app.get('/api/gallery', (req, res) => {
  try {
    const { categoryId, subcategoryId } = req.query;
    if (!categoryId) {
      return res.status(400).json({ error: 'categoryId parameter is required.' });
    }
    const items = getGalleryItems(categoryId, subcategoryId || null);
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Get Real-time Slot Availability for a Date
app.get('/api/slots/availability', (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'date query parameter is required (YYYY-MM-DD).' });
    }
    const slots = getSlotAvailability(date);
    res.json({ success: true, date, slots });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Create New Booking (with real-time concurrency lock)
app.post('/api/bookings', (req, res) => {
  try {
    const booking = createBooking(req.body);
    res.status(201).json({ success: true, booking });
  } catch (err) {
    console.error('Error creating booking:', err.message);
    const statusCode = err.status || 500;
    res.status(statusCode).json({ error: err.message });
  }
});

// 8. Get Bookings for a Customer (Private customer history only)
app.get('/api/bookings/customer/:customerId', (req, res) => {
  try {
    const { phone } = req.query;
    const bookings = getBookingsByCustomer(req.params.customerId, phone || null);
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Customer Cancels Pending Booking
app.patch('/api/bookings/:id/cancel', (req, res) => {
  try {
    const { customerId } = req.body;
    if (!customerId) {
      return res.status(400).json({ error: 'customerId is required to verify ownership.' });
    }
    const cancelled = cancelCustomerBooking(req.params.id, customerId);
    res.json({ success: true, booking: cancelled });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message });
  }
});

// --- STANDALONE BUSINESS OWNER PORTAL API ENDPOINTS ---
// (Completely separate from customer flow)

app.get('/api/business/bookings', (req, res) => {
  try {
    const { status, date, search } = req.query;
    const bookings = getAllBookingsAdmin({ status, date, search });
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/business/bookings/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const updated = updateBookingStatusAdmin(req.params.id, status);
    res.json({ success: true, booking: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Reschedule booking to a new date and time
app.patch('/api/business/bookings/:id/reschedule', (req, res) => {
  try {
    const { newDate, newTimeSlot } = req.body;
    const updated = rescheduleBookingAdmin(req.params.id, newDate, newTimeSlot);
    res.json({ success: true, booking: updated });
  } catch (err) {
    const status = err.status || 400;
    res.status(status).json({ error: err.message });
  }
});

// View full day schedule with bookings and blocks
app.get('/api/business/schedule', (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'date query parameter is required' });
    }
    const schedule = getScheduleByDateAdmin(date);
    res.json({ success: true, date, schedule });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Studio Owner blocks a time slot
app.post('/api/business/slots/block', (req, res) => {
  try {
    const { date, timeSlot, reason } = req.body;
    const result = blockSlotAdmin(date, timeSlot, reason);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Studio Owner unblocks a time slot
app.post('/api/business/slots/unblock', (req, res) => {
  try {
    const { date, timeSlot } = req.body;
    const result = unblockSlotAdmin(date, timeSlot);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- PAYMENT API ENDPOINTS ---

// Public: Get Studio UPI Payment Settings (UPI ID, Payee Name, QR Code)
app.get('/api/payment/settings', (req, res) => {
  try {
    const settings = getStudioPaymentSettings();
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public: Calculate Pricing and 20% discount breakdown
app.get('/api/payment/pricing', (req, res) => {
  try {
    const { categoryId, subcategoryId, paymentMethod } = req.query;
    if (!categoryId) {
      return res.status(400).json({ error: 'categoryId is required' });
    }
    const pricing = calculatePricing(categoryId, subcategoryId || null, paymentMethod || 'pay_advance');
    res.json({ success: true, pricing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Business Portal: Upload / Update Studio UPI QR Code and UPI ID
app.post('/api/business/payment/settings', (req, res) => {
  try {
    const { qrCodeUrl, upiId, upiName } = req.body;
    const updated = updateStudioPaymentSettings({ qrCodeUrl, upiId, upiName });
    res.json({ success: true, settings: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Business Portal: Verify & Approve advance payment (mark as 'Paid')
app.patch('/api/business/bookings/:id/payment/verify', (req, res) => {
  try {
    const { verifiedBy } = req.body;
    const updated = verifyPaymentAdmin(req.params.id, verifiedBy || 'Studio Owner');
    res.json({ success: true, booking: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Business Portal: Reject payment submission
app.patch('/api/business/bookings/:id/payment/reject', (req, res) => {
  try {
    const { reason, verifiedBy } = req.body;
    const updated = rejectPaymentAdmin(req.params.id, reason, verifiedBy || 'Studio Owner');
    res.json({ success: true, booking: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Business Portal: Mark 'Pay After Shoot' as Paid
app.patch('/api/business/bookings/:id/payment/mark-paid', (req, res) => {
  try {
    const { verifiedBy } = req.body;
    const updated = markPaidAfterShootAdmin(req.params.id, verifiedBy || 'Studio Owner');
    res.json({ success: true, booking: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/business/stats', (req, res) => {
  try {
    const all = getAllBookingsAdmin({});
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const paidBookings = all.filter(b => b.payment_status === 'Paid');
    const totalRevenue = paidBookings.reduce((sum, b) => sum + (Number(b.final_payable_amount) || 0), 0);

    const stats = {
      total: all.length,
      pending: all.filter(b => b.status === 'Pending').length,
      confirmed: all.filter(b => b.status === 'Confirmed').length,
      completed: all.filter(b => b.status === 'Completed').length,
      cancelled: all.filter(b => b.status === 'Cancelled').length,
      todayCount: all.filter(b => b.booking_date === todayStr).length,
      // Payment Stats
      paymentsPendingVerification: all.filter(b => b.payment_status === 'Verification Pending').length,
      paymentsPaid: paidBookings.length,
      paymentsPayAfterShoot: all.filter(b => b.payment_status === 'Pay After Shoot').length,
      paymentsRejected: all.filter(b => b.payment_status === 'Payment Rejected').length,
      totalRevenue
    };
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SPA Fallback for client-side routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  res.sendFile(path.join(distDir, 'index.html'));
});

// Start Express Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Nilesh Studio API Server listening on port ${PORT}`);
});
