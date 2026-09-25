const db = require('../storage/db');
const tarotCards = require('../data/tarotDeck.json');

// Memory cache for active rooms
const activeRooms = {};

function getOrCreateSession(sessionId, booking = null) {
  let session = db.getSession(sessionId);

  if (!session) {
    // Generate initial shuffled 78-card deck
    const deck = tarotCards.map(c => ({
      cardId: c.id,
      orientation: Math.random() > 0.3 ? 'upright' : 'reversed'
    }));

    session = {
      sessionId,
      bookingId: booking ? booking.id : null,
      clientName: booking ? booking.clientName : "Seeker",
      readingFocus: booking ? booking.focus : "General Guidance",
      currentStep: 1, // 1: Connect, 2: Shuffle, 3: Spread, 4: Select, 5: Reveal, 6: Interpret, 7: Summary
      clientReady: false,
      adminReady: false,
      isShuffling: false,
      deck,
      selectedCards: [], // [{ cardId, category: 'Life'|'Love'|'Career', orientation: 'upright'|'reversed', revealed: false }]
      adminNotes: {
        life: "",
        love: "",
        career: "",
        summary: ""
      },
      participants: {
        admin: null,
        client: null
      },
      webrtcActive: false
    };
    db.saveSession(sessionId, session);
  }

  // Keep in active memory
  activeRooms[sessionId] = session;
  return session;
}

function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    // Randomize orientation on shuffle
    shuffled[i].orientation = Math.random() > 0.3 ? 'upright' : 'reversed';
  }
  return shuffled;
}

function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    let currentSessionId = null;
    let currentUserRole = null;

    // Join Session Room
    socket.on('join_session', ({ sessionId, role, name }) => {
      currentSessionId = sessionId;
      currentUserRole = role;

      socket.join(sessionId);

      const booking = db.getBookingBySessionId(sessionId);
      const session = getOrCreateSession(sessionId, booking);

      // Track presence
      if (role === 'admin') {
        session.participants.admin = { socketId: socket.id, name: name || "Reader (Admin)", online: true };
      } else {
        session.participants.client = { socketId: socket.id, name: name || session.clientName || "Seeker", online: true };
      }

      db.saveSession(sessionId, session);

      // Send current state to joiner
      socket.emit('session_state', session);

      // Broadcast presence update to room
      io.to(sessionId).emit('presence_update', session.participants);
      io.to(sessionId).emit('system_message', {
        text: `${role === 'admin' ? '🔮 Reader' : '✨ ' + (session.clientName || 'Seeker')} entered the sanctuary.`,
        timestamp: new Date().toISOString()
      });

      console.log(`[Socket] ${socket.id} (${role}) joined session: ${sessionId}`);
    });

    // Client/Admin Ready Toggle (Step 1)
    socket.on('set_ready', ({ isReady }) => {
      if (!currentSessionId) return;
      const session = activeRooms[currentSessionId];
      if (!session) return;

      if (currentUserRole === 'admin') {
        session.adminReady = isReady;
      } else {
        session.clientReady = isReady;
      }

      db.saveSession(currentSessionId, session);
      io.to(currentSessionId).emit('session_state', session);
    });

    // Advance or Jump Ritual Step
    socket.on('set_step', ({ step }) => {
      if (!currentSessionId) return;
      const session = activeRooms[currentSessionId];
      if (!session) return;

      session.currentStep = Math.max(1, Math.min(7, step));
      db.saveSession(currentSessionId, session);
      io.to(currentSessionId).emit('session_state', session);

      const stepNames = ["Connect", "Shuffle", "Spread", "Selection", "Reveal", "Interpretation", "Summary"];
      io.to(currentSessionId).emit('system_message', {
        text: `Ritual advanced to Step ${session.currentStep}: ${stepNames[session.currentStep - 1]}`,
        timestamp: new Date().toISOString()
      });
    });

    // Trigger Deck Shuffle (Step 2)
    socket.on('trigger_shuffle', () => {
      if (!currentSessionId) return;
      const session = activeRooms[currentSessionId];
      if (!session) return;

      session.isShuffling = true;
      db.saveSession(currentSessionId, session);
      io.to(currentSessionId).emit('shuffle_started');
      io.to(currentSessionId).emit('session_state', session);

      setTimeout(() => {
        session.deck = shuffleDeck(session.deck);
        session.isShuffling = false;
        db.saveSession(currentSessionId, session);
        io.to(currentSessionId).emit('shuffle_ended', { deck: session.deck });
        io.to(currentSessionId).emit('session_state', session);
      }, 6500);
    });

    // Pick Card from Spread (Step 4)
    socket.on('select_card', ({ cardIndex }) => {
      if (!currentSessionId) return;
      const session = activeRooms[currentSessionId];
      if (!session) return;

      if (session.selectedCards.length >= 3) return;

      const card = session.deck[cardIndex];
      if (!card) return;

      // Check if already selected
      const alreadyPicked = session.selectedCards.some(sc => sc.cardId === card.cardId);
      if (alreadyPicked) return;

      const categories = ['Life', 'Love', 'Career'];
      const assignedCategory = categories[session.selectedCards.length];

      const pickedEntry = {
        cardId: card.cardId,
        category: assignedCategory,
        orientation: card.orientation,
        revealed: false,
        pickedIndex: cardIndex,
        pickedAt: new Date().toISOString()
      };

      session.selectedCards.push(pickedEntry);
      db.saveSession(currentSessionId, session);

      io.to(currentSessionId).emit('card_selected', pickedEntry);
      io.to(currentSessionId).emit('session_state', session);

      // If all 3 picked, auto-advance to Reveal step after a short magical pause
      if (session.selectedCards.length === 3) {
        setTimeout(() => {
          if (session.currentStep === 4) {
            session.currentStep = 5;
            db.saveSession(currentSessionId, session);
            io.to(currentSessionId).emit('session_state', session);
          }
        }, 1200);
      }
    });

    // Reveal Single Card (Step 5)
    socket.on('reveal_card', ({ category }) => {
      if (!currentSessionId) return;
      const session = activeRooms[currentSessionId];
      if (!session) return;

      const target = session.selectedCards.find(c => c.category === category);
      if (target) {
        target.revealed = true;
        db.saveSession(currentSessionId, session);
        io.to(currentSessionId).emit('card_revealed', target);
        io.to(currentSessionId).emit('session_state', session);

        // Check if all cards revealed
        const allRevealed = session.selectedCards.length === 3 && session.selectedCards.every(c => c.revealed);
        if (allRevealed && session.currentStep === 5) {
          setTimeout(() => {
            session.currentStep = 6; // Move to live interpretation
            db.saveSession(currentSessionId, session);
            io.to(currentSessionId).emit('session_state', session);
          }, 1500);
        }
      }
    });

    // Reveal All Cards Shortcut (Admin)
    socket.on('reveal_all_cards', () => {
      if (!currentSessionId) return;
      const session = activeRooms[currentSessionId];
      if (!session) return;

      session.selectedCards.forEach(c => { c.revealed = true; });
      session.currentStep = 6; // Move to interpretation
      db.saveSession(currentSessionId, session);
      io.to(currentSessionId).emit('session_state', session);
    });

    // Live Notes Update (Step 6) - collaborative real-time writing
    socket.on('update_notes', ({ field, text }) => {
      if (!currentSessionId) return;
      const session = activeRooms[currentSessionId];
      if (!session) return;

      if (session.adminNotes[field] !== undefined) {
        session.adminNotes[field] = text;
        db.saveSession(currentSessionId, session);
        // Broadcast note change to everyone else in room immediately
        socket.to(currentSessionId).emit('notes_updated', { field, text });
      }
    });

    // Reset Ritual (Admin)
    socket.on('reset_ritual', () => {
      if (!currentSessionId) return;
      const session = activeRooms[currentSessionId];
      if (!session) return;

      session.currentStep = 1;
      session.clientReady = false;
      session.adminReady = false;
      session.selectedCards = [];
      session.deck = shuffleDeck(session.deck);
      db.saveSession(currentSessionId, session);

      io.to(currentSessionId).emit('session_state', session);
      io.to(currentSessionId).emit('system_message', {
        text: "The sacred deck has been gathered. The ritual has been reset.",
        timestamp: new Date().toISOString()
      });
    });

    // WebRTC Peer-to-Peer Video/Audio Signaling
    socket.on('webrtc_signal', ({ signal, to }) => {
      if (to) {
        io.to(to).emit('webrtc_signal', {
          signal,
          from: socket.id,
          role: currentUserRole
        });
      } else if (currentSessionId) {
        socket.to(currentSessionId).emit('webrtc_signal', {
          signal,
          from: socket.id,
          role: currentUserRole
        });
      }
    });

    socket.on('media_state_change', ({ audioEnabled, videoEnabled }) => {
      if (currentSessionId) {
        socket.to(currentSessionId).emit('remote_media_state', {
          role: currentUserRole,
          audioEnabled,
          videoEnabled
        });
      }
    });

    // Handle Disconnect
    socket.on('disconnect', () => {
      if (currentSessionId && activeRooms[currentSessionId]) {
        const session = activeRooms[currentSessionId];
        if (currentUserRole === 'admin' && session.participants.admin) {
          session.participants.admin.online = false;
        } else if (session.participants.client) {
          session.participants.client.online = false;
        }
        db.saveSession(currentSessionId, session);
        io.to(currentSessionId).emit('presence_update', session.participants);
      }
      console.log(`[Socket] Disconnected: ${socket.id}`);
    });
  });
}

module.exports = { setupSocketHandlers };
