const nodemailer = require('nodemailer');
const db = require('../storage/db');

let transporter = null;

function initTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      console.log('✅ Real SMTP Email Transporter configured.');
    } catch (e) {
      console.error('Failed to initialize SMTP transporter:', e);
      transporter = null;
    }
  } else {
    console.log('ℹ️ SMTP credentials not set in .env. Emails will be logged to in-app preview log.');
    transporter = null;
  }
}

async function sendBookingConfirmation({ booking, baseUrl }) {
  initTransporter();

  const sessionLink = `${baseUrl || 'http://localhost:5173'}/session/${booking.sessionId}`;
  const subject = `Your Live Tarot Reading is Confirmed 🔮 — ${booking.date} at ${booking.timeSlot}`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Georgia', serif; background-color: #0b0914; color: #f1ecff; padding: 24px; margin: 0; }
        .card { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #181329 0%, #100c1e 100%); border: 1px solid #7c3aed; border-radius: 12px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .header { text-align: center; border-bottom: 1px solid #3b2d5e; padding-bottom: 20px; }
        .title { color: #facc15; font-size: 26px; letter-spacing: 2px; margin: 0; }
        .subtitle { color: #a78bfa; font-style: italic; font-size: 14px; margin-top: 6px; }
        .details { margin: 24px 0; background: rgba(0,0,0,0.3); border-radius: 8px; padding: 18px; border-left: 3px solid #facc15; }
        .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 15px; }
        .label { color: #9ca3af; }
        .val { color: #fff; font-weight: bold; }
        .btn-container { text-align: center; margin: 32px 0 20px; }
        .btn { background: linear-gradient(90deg, #d97706, #9333ea); color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 30px; font-weight: bold; letter-spacing: 1px; display: inline-block; box-shadow: 0 0 20px rgba(217, 119, 6, 0.4); }
        .ritual-steps { background: rgba(124, 58, 237, 0.1); border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 13px; line-height: 1.6; color: #ddd6fe; }
        .footer { font-size: 12px; text-align: center; color: #6b7280; margin-top: 24px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1 class="title">LIVE TAROT SANCTUARY</h1>
          <p class="subtitle">Your Sacred Connection Has Been Formed</p>
        </div>

        <p>Greetings <strong>${booking.clientName}</strong>,</p>
        <p>Your upcoming virtual tarot reading session has been scheduled. Prepare your heart and mind to receive guidance from the cards.</p>

        <div class="details">
          <div class="row"><span class="label">Date:</span> <span class="val">${booking.date}</span></div>
          <div class="row"><span class="label">Time:</span> <span class="val">${booking.timeSlot}</span></div>
          <div class="row"><span class="label">Timezone:</span> <span class="val">${booking.timezone}</span></div>
          <div class="row"><span class="label">Focus of Inquiry:</span> <span class="val">${booking.focus}</span></div>
          ${booking.notes ? `<div class="row"><span class="label">Your Intentions:</span> <span class="val">${booking.notes}</span></div>` : ''}
        </div>

        <div class="ritual-steps">
          <strong>🌿 How to Prepare for Your Session:</strong><br>
          • Find a quiet, peaceful space with minimal distractions.<br>
          • Take 3 deep breaths and reflect on what answers your soul seeks.<br>
          • You will join a real-time room to shuffle and choose 3 cards: Life, Love, and Career.
        </div>

        <div class="btn-container">
          <a href="${sessionLink}" class="btn">ENTER LIVE SESSION ROOM</a>
        </div>
        <p style="text-align: center; font-size: 13px; color: #9ca3af;">
          Direct Room Link: <a href="${sessionLink}" style="color: #a78bfa;">${sessionLink}</a>
        </p>

        <div class="footer">
          Live Tarot Virtual Reading Sanctuary • All readings are confidential & live
        </div>
      </div>
    </body>
    </html>
  `;

  // Always log to in-memory/DB preview log so user can see it right inside Admin dashboard!
  db.logEmail({
    recipient: booking.clientEmail,
    clientName: booking.clientName,
    subject,
    sessionLink,
    date: booking.date,
    timeSlot: booking.timeSlot,
    html: htmlContent
  });

  if (transporter) {
    try {
      const fromAddr = process.env.SMTP_FROM || `"Live Tarot Sanctuary" <${process.env.SMTP_USER}>`;
      const info = await transporter.sendMail({
        from: fromAddr,
        to: booking.clientEmail,
        subject,
        html: htmlContent
      });
      console.log(`📧 Real confirmation email sent to ${booking.clientEmail}: ${info.messageId}`);
      return { success: true, mode: 'smtp', messageId: info.messageId };
    } catch (err) {
      console.error('⚠️ Failed to send SMTP email (logged to app preview instead):', err.message);
      return { success: true, mode: 'preview_only', warning: err.message };
    }
  } else {
    console.log(`📬 [Mock Email Service] Confirmation email logged for ${booking.clientEmail}. Link: ${sessionLink}`);
    return { success: true, mode: 'preview_only' };
  }
}

module.exports = {
  sendBookingConfirmation
};
