const express = require('express');
const router = express.Router();
const db = require('../storage/db');
const tarotCards = require('../data/tarotDeck.json');
const { sendBookingConfirmation } = require('../services/emailService');

// Middleware for Admin Authentication
const requireAdmin = (req, res, next) => {
  const token = req.headers['x-admin-token'] || req.query.adminToken;
  const adminPassword = process.env.ADMIN_PASSWORD || 'tarot2026';
  
  if (token && (token === adminPassword || token === `Bearer_${adminPassword}`)) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized: Invalid admin credentials' });
};

// Admin Login
router.post('/admin/login', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'tarot2026';

  if (password === adminPassword) {
    return res.json({
      success: true,
      token: adminPassword,
      message: 'Admin access granted'
    });
  }

  return res.status(401).json({ success: false, error: 'Incorrect password' });
});

// Admin Auth Status Check
router.get('/admin/check', (req, res) => {
  const token = req.headers['x-admin-token'];
  const adminPassword = process.env.ADMIN_PASSWORD || 'tarot2026';
  if (token === adminPassword) {
    return res.json({ authenticated: true });
  }
  return res.json({ authenticated: false });
});

// Tarot Deck Endpoint
router.get('/cards', (req, res) => {
  res.json({
    total: tarotCards.length,
    cards: tarotCards
  });
});

router.get('/cards/:id', (req, res) => {
  const card = tarotCards.find(c => c.id === req.params.id);
  if (!card) {
    return res.status(404).json({ error: 'Card not found' });
  }
  res.json(card);
});

// Get Bookings
router.get('/bookings', (req, res) => {
  const bookings = db.getBookings();
  res.json({ bookings });
});

// Create Booking
router.post('/bookings', async (req, res) => {
  try {
    const { clientName, clientEmail, date, timeSlot, timezone, focus, notes } = req.body;

    if (!clientName || !clientEmail || !date || !timeSlot) {
      return res.status(400).json({ error: 'Missing required booking fields (name, email, date, timeSlot)' });
    }

    const booking = db.createBooking({
      clientName,
      clientEmail,
      date,
      timeSlot,
      timezone,
      focus,
      notes
    });

    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host.replace(/:\d+$/, ':5173')}`;

    // Send confirmation email / log preview
    const emailResult = await sendBookingConfirmation({ booking, baseUrl });

    res.status(201).json({
      success: true,
      booking,
      sessionUrl: `/session/${booking.sessionId}`,
      emailResult
    });
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Update Booking Status / Slot
router.patch('/bookings/:id', requireAdmin, (req, res) => {
  const { status, date, timeSlot, notes } = req.body;
  const updated = db.updateBooking(req.params.id, {
    ...(status && { status }),
    ...(date && { date }),
    ...(timeSlot && { timeSlot }),
    ...(notes !== undefined && { notes })
  });

  if (!updated) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  res.json({ success: true, booking: updated });
});

// Delete Booking
router.delete('/bookings/:id', requireAdmin, (req, res) => {
  const deleted = db.deleteBooking(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  res.json({ success: true, message: 'Booking removed' });
});

// Session Details
router.get('/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const booking = db.getBookingBySessionId(sessionId);
  const session = db.getSession(sessionId);

  res.json({
    sessionId,
    booking: booking || null,
    session: session || null
  });
});

// Email Preview Logs (for testing and admin visibility)
router.get('/emails', requireAdmin, (req, res) => {
  const logs = db.getEmailLogs();
  res.json({ emails: logs });
});

// System Config Info
router.get('/config', (req, res) => {
  res.json({
    adminPasswordConfigured: Boolean(process.env.ADMIN_PASSWORD),
    smtpConfigured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER),
    videoProvider: process.env.VIDEO_PROVIDER || 'webrtc_p2p',
    dailyDomain: process.env.DAILY_DOMAIN || null,
    appName: "Live Tarot Sanctuary",
    version: "1.0.0"
  });
});

module.exports = router;
