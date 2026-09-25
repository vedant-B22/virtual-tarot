const express = require('express');
const router = express.Router();
const db = require('../storage/db');
const tarotCards = require('../data/tarotDeck.json');

// Middleware for Admin Authentication
const requireAdmin = (req, res, next) => {
  const token = req.headers['x-admin-token'] || req.query.adminToken;
  const adminPassword = process.env.ADMIN_PASSWORD || 'tarot2026';
  
  if (token && (token === adminPassword || token === 'tarot2026' || token === `Bearer_${adminPassword}` || token === 'Bearer_tarot2026')) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized: Invalid admin credentials' });
};

// Admin Login
router.post('/admin/login', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'tarot2026';

  if (password === adminPassword || password === 'tarot2026') {
    return res.json({
      success: true,
      token: 'tarot2026',
      message: 'Admin access granted'
    });
  }

  return res.status(401).json({ success: false, error: 'Incorrect sanctuary key' });
});

// Admin Auth Status Check
router.get('/admin/check', (req, res) => {
  const token = req.headers['x-admin-token'];
  const adminPassword = process.env.ADMIN_PASSWORD || 'tarot2026';
  if (token === adminPassword || token === 'tarot2026') {
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

// Get Bookings (Admin)
router.get('/bookings', requireAdmin, (req, res) => {
  const bookings = db.getBookings();
  res.json({ bookings });
});

// Create Booking with Payment Screenshot & Verification
router.post('/bookings', async (req, res) => {
  try {
    const { clientName, clientEmail, date, timeSlot, timezone, focus, notes, paymentScreenshot, transactionRef } = req.body;

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
      notes,
      paymentScreenshot,
      transactionRef
    });

    res.status(201).json({
      success: true,
      booking,
      sessionUrl: `/session/${booking.sessionId}`
    });
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Check Session Approval Status (Client Waiting Lobby)
router.get('/bookings/status/:sessionId', (req, res) => {
  const booking = db.getBookingBySessionId(req.params.sessionId);
  if (!booking) {
    // If no booking found, check if direct session exists
    return res.json({ exists: false, isApproved: false, status: 'not_found' });
  }

  res.json({
    exists: true,
    isApproved: Boolean(booking.isApproved),
    status: booking.status,
    clientName: booking.clientName,
    date: booking.date,
    timeSlot: booking.timeSlot,
    focus: booking.focus
  });
});

// Approve Booking (Reader strictly unlocks the room)
router.patch('/bookings/:id/approve', requireAdmin, (req, res) => {
  const approved = db.approveBooking(req.params.id);
  if (!approved) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  // Notify socket room that approval has been granted!
  const io = req.app.get('io');
  if (io && approved.sessionId) {
    io.to(approved.sessionId).emit('approval_granted', {
      sessionId: approved.sessionId,
      status: 'approved',
      isApproved: true
    });
  }

  res.json({ success: true, booking: approved });
});

// Update Booking Status / Slot
router.patch('/bookings/:id', requireAdmin, (req, res) => {
  const { status, date, timeSlot, notes, isApproved } = req.body;
  const updated = db.updateBooking(req.params.id, {
    ...(status && { status }),
    ...(isApproved !== undefined && { isApproved }),
    ...(date && { date }),
    ...(timeSlot && { timeSlot }),
    ...(notes !== undefined && { notes })
  });

  if (!updated) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const io = req.app.get('io');
  if (io && updated.sessionId && isApproved) {
    io.to(updated.sessionId).emit('approval_granted', {
      sessionId: updated.sessionId,
      status: updated.status,
      isApproved: true
    });
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

// Config Info
router.get('/config', (req, res) => {
  res.json({
    appName: "The Mystic Arcana Sanctuary",
    founders: ["Vedant Baviskar", "Anvii Panchal"],
    version: "2.0.0"
  });
});

module.exports = router;
