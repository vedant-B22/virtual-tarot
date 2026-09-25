const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial state template
const initialData = {
  bookings: [
    {
      id: "booking-demo-01",
      sessionId: "sanctuary-demo-session",
      clientName: "Elena Vance",
      clientEmail: "elena.vance@example.com",
      date: new Date().toISOString().split('T')[0],
      timeSlot: "03:30 PM",
      timezone: "America/New_York (EST)",
      focus: "Career & Finances",
      notes: "Contemplating a pivot toward creative entrepreneurship. Seeking guidance on timing.",
      status: "confirmed",
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      id: "booking-demo-02",
      sessionId: "mystic-arcana-live",
      clientName: "Marcus Sterling",
      clientEmail: "marcus.s@example.com",
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      timeSlot: "05:00 PM",
      timezone: "Europe/London (GMT)",
      focus: "Love & Relationships",
      notes: "Looking for clarity around an old connection resurfacing.",
      status: "confirmed",
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
    }
  ],
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
    const sessionId = `tarot-${uuidv4().slice(0, 8)}`;
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
      status: "confirmed",
      createdAt: new Date().toISOString()
    };

    if (!data.bookings) data.bookings = [];
    data.bookings.unshift(newBooking);
    writeDb(data);
    return newBooking;
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
  },

  logEmail: (emailRecord) => {
    const data = readDb();
    if (!data.emailLogs) data.emailLogs = [];
    data.emailLogs.unshift({
      id: `email-${Date.now()}`,
      ...emailRecord,
      timestamp: new Date().toISOString()
    });
    if (data.emailLogs.length > 50) {
      data.emailLogs = data.emailLogs.slice(0, 50);
    }
    writeDb(data);
  },

  getEmailLogs: () => {
    const data = readDb();
    return data.emailLogs || [];
  }
};

module.exports = db;
