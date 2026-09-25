# 🔮 Live Tarot — Real-Time Virtual Reading Sanctuary

A full-stack, real-time, two-person virtual tarot reading platform connecting a **Reader (Admin)** and a **Seeker (Client)** in a synchronized live session.

---

## 🌟 Core Highlights

1. **Client Booking Engine**
   - Interactive calendar with 14-day slot picker and real-time timezone auto-detection + converter.
   - Focus area selection (*Life & Destiny*, *Love & Relationships*, *Career & Prosperity*, *Spiritual Awakening*).
   - Generates unique session room URLs (`/session/:sessionId`).
   - Dispatches confirmation emails via SMTP (or captures them in the Admin Email Previewer).
   - Instant `.ics` calendar invitation download.

2. **Reader (Admin) Sanctuary Dashboard**
   - Protected by custom password authentication (`ADMIN_PASSWORD` in `.env`).
   - Live overview of all scheduled, upcoming, rescheduled, and completed bookings.
   - One-click **"Join as Reader 🔮"** into any client session.
   - In-app **Email Preview Inspector**: inspect every dispatched confirmation email in full HTML.
   - Manage booking slots: reschedule, cancel, or delete sessions.

3. **Synchronized 7-Step Tarot Ritual State Machine**
   - Every movement, card shuffle, flip, and note is synchronized in real time via **Socket.io**.
   - **Step 1 — Connect**: Guided 4-second breathing circle, candle flame aura, intention setting, and dual "Centered & Ready" sync.
   - **Step 2 — Shuffle**: Physics/Framer Motion deck animation simulating an overhand/riffle shuffle with realistic audio feedback.
   - **Step 3 — Spread**: The complete 78 cards smoothly fan out across the velvet altar table face-down.
   - **Step 4 — Selection**: Seeker clicks 3 cards in order, automatically docking to:
     - **1st → Life** (Current path & vital energy)
     - **2nd → Love** (Heart & relational alignment)
     - **3rd → Career** (Ambition & material prosperity)
   - **Step 5 — Reveal**: Realistic 3D perspective flip animations revealing upright/reversed orientations with celebratory particle confetti.
   - **Step 6 — Interpretation & Shared Doc**: Reader types interpretations live; text streams character-by-character to the client's screen like a collaborative document. Includes quick-insert tarot keywords.
   - **Step 7 — Session Summary Certificate**: Generates a shareable summary parchment certificate with drawn cards, orientations, keywords, and reader's synthesis. Client can print / save as PDF or copy shareable link.

4. **WebRTC Video & Audio**
   - Built-in peer-to-peer WebRTC video and audio powered by Socket.io signaling.
   - Works immediately out of the box with zero external API keys needed!
   - Camera toggle, microphone mute/unmute, and picture-in-picture floating tile.
   - Also ready for LiveKit or Daily.co embeds via `.env` configuration.

5. **Complete 78-Card Tarot Deck**
   - 22 Major Arcana + 56 Minor Arcana (Wands, Cups, Swords, Pentacles).
   - Each card contains: upright meaning, reversed meaning, elemental correspondences, Roman numerals/ranks, keywords, and ornate card designs.
   - Stored in `server/src/data/tarotDeck.json` and `client/src/data/tarotDeck.json`.

---

## 🚀 Quickstart

### 1. Install Dependencies
```bash
npm run install:all
```
*(or run `npm install` in the root, `server/`, and `client/` directories)*

### 2. Start Development Servers
```bash
npm run dev
```
This boots:
- **Backend API & WebSockets**: `http://localhost:5001`
- **Frontend Vite Client**: `http://localhost:5173`

---

## 🔑 Setting Up Your `.env` File

Copy `.env.example` to `.env` (already created for you in the project root and `server/`):

```bash
cp .env.example .env
```

Open `.env` and fill in your real credentials:

```ini
# Server Port
PORT=5001

# Admin Dashboard Password (Default is tarot2026)
ADMIN_PASSWORD=your_custom_password_here

# Real Email Delivery (SMTP / Resend / Gmail / SendGrid)
# If left empty, emails will be logged to the Admin In-App Previewer!
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM="Live Tarot Sanctuary" <your_email@gmail.com>

# Video Provider ("webrtc_p2p", "daily", or "livekit")
VIDEO_PROVIDER=webrtc_p2p

# Daily.co Configuration (Optional)
# DAILY_API_KEY=
# DAILY_DOMAIN=https://your-domain.daily.co

# LiveKit Configuration (Optional)
# LIVEKIT_URL=wss://your-project.livekit.cloud
# LIVEKIT_API_KEY=
# LIVEKIT_API_SECRET=
```

---

## 🧪 Testing the 2-Person Live Synchronized Experience

1. **Option A: Two Browser Windows (Recommended)**
   - Open Window 1: `http://localhost:5173/session/sanctuary-demo-session?role=admin` (Reader mode)
   - Open Window 2: `http://localhost:5173/session/sanctuary-demo-session?role=client` (Seeker mode)
   - Observe both screens synchronize in real-time as you click "I'm Ready", trigger shuffles, pick cards, flip them, and type live notes!

2. **Option B: Single Window Role Switcher**
   - Click the **"View: Reader / Seeker"** button in the top navigation bar to toggle between roles instantly in the same room.

---

## 📁 Project Structure

```
tarot virtual experience/
├── package.json               # Root scripts (concurrently runner)
├── .env                       # Environment configuration
├── .env.example               # Template with instructions
├── server/
│   ├── package.json           # Express, Socket.io, Nodemailer
│   └── src/
│       ├── index.js           # Server entrypoint & HTTP/Socket setup
│       ├── routes/api.js      # REST API (bookings, auth, cards, emails)
│       ├── sockets/sessionHandler.js # Real-time state machine & WebRTC
│       ├── storage/db.js      # JSON database persistence layer
│       ├── services/emailService.js  # SMTP & in-app previewer
│       └── data/
│           ├── tarotDeck.json # 78-card complete Tarot dataset
│           └── generateTarotData.js # Dataset generator script
└── client/
    ├── package.json           # React 19, Vite, Tailwind CSS, Framer Motion
    ├── vite.config.ts         # Proxy config for /api and /socket.io
    └── src/
        ├── App.tsx            # Main application router
        ├── index.css          # Tailwind styles & 3D card perspective
        ├── types/tarot.ts     # TypeScript interfaces
        ├── utils/audio.ts     # Web Audio API ambient drone & sound FX
        └── components/
            ├── BookingCalendar.tsx # Client date/slot picker & booking form
            ├── AdminDashboard.tsx  # Password-gated admin portal & email viewer
            ├── LiveSession.tsx     # 7-Step synchronized ritual altar
            ├── TarotCard.tsx       # 3D flippable card component
            └── VideoRoom.tsx       # WebRTC peer audio/video dock
```
