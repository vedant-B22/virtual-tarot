const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial state template (Empty bookings for clean real environment)
const initialData = {
  bookings: [],
  sessions: {},
  emailLogs: []
};

function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error("Error reading db.json, returning fallback:", err);
    return initialData;
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("Error writing db.json:", err);
  }
}

// Database helper functions
const db = {
  getBookings: () => {
    const data = readDb();
    return data.bookings || [];
  },

  getBookingById: (id) => {
    const data = readDb();
    return (data.bookings || []).find(b => b.id === id);
  },

  getBookingBySessionId: (sessionId) => {
    const data = readDb();
    return (data.bookings || []).find(b => b.sessionId === sessionId);
  },

  createBooking: (bookingData) => {
    const data = readDb();
    const sessionId = `sanctuary-${uuidv4().slice(0, 8)}`;
    const newBooking = {
      id: `booking-${uuidv4().slice(0, 8)}`,
      sessionId,
      clientName: bookingData.clientName,
      clientEmail: bookingData.clientEmail,
      date: bookingData.date,
      timeSlot: bookingData.timeSlot,
      timezone: bookingData.timezone || "Local Time",
      focus: bookingData.focus || "General Guidance",
      notes: bookingData.notes || "",
      status: "pending_approval", // Strict gate: client cannot enter until reader approves!
      isApproved: false,
      paymentScreenshot: bookingData.paymentScreenshot || null,
      transactionRef: bookingData.transactionRef || "",
      createdAt: new Date().toISOString()
    };

    if (!data.bookings) data.bookings = [];
    data.bookings.unshift(newBooking);
    writeDb(data);
    return newBooking;
  },

  approveBooking: (id) => {
    const data = readDb();
    const booking = (data.bookings || []).find(b => b.id === id);
    if (!booking) return null;

    booking.status = "approved";
    booking.isApproved = true;
    booking.approvedAt = new Date().toISOString();
    writeDb(data);
    return booking;
  },

  updateBooking: (id, updates) => {
    const data = readDb();
    const index = (data.bookings || []).findIndex(b => b.id === id);
    if (index === -1) return null;

    data.bookings[index] = {
      ...data.bookings[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    writeDb(data);
    return data.bookings[index];
  },

  deleteBooking: (id) => {
    const data = readDb();
    const index = (data.bookings || []).findIndex(b => b.id === id);
    if (index === -1) return false;

    data.bookings.splice(index, 1);
    writeDb(data);
    return true;
  },

  getSession: (sessionId) => {
    const data = readDb();
    return (data.sessions && data.sessions[sessionId]) || null;
  },

  saveSession: (sessionId, sessionData) => {
    const data = readDb();
    if (!data.sessions) data.sessions = {};
    data.sessions[sessionId] = {
      ...sessionData,
      updatedAt: new Date().toISOString()
    };
    writeDb(data);
    return data.sessions[sessionId];
  }
};

module.exports = db;
