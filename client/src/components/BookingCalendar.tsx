import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Globe, Sparkles, CheckCircle2, Copy, ArrowRight, Heart, Briefcase, Compass, Sun, ShieldCheck } from 'lucide-react';

import { BACKEND_URL } from '../utils/apiConfig';

interface BookingCalendarProps {
  onJoinSession: (sessionId: string, clientName: string) => void;
}

const TIME_SLOTS = [
  "10:00 AM",
  "11:30 AM",
  "01:00 PM",
  "02:30 PM",
  "04:00 PM",
  "05:30 PM",
  "07:00 PM",
  "08:30 PM"
];

const FOCUS_AREAS = [
  { id: "Life & Destiny", label: "Life & Destiny", desc: "Clarity on life path, personal growth & inner energy", icon: Compass, color: "text-emerald-400" },
  { id: "Love & Relationships", label: "Love & Relationships", desc: "Soul connections, heart healing & relational alignment", icon: Heart, color: "text-pink-400" },
  { id: "Career & Prosperity", label: "Career & Prosperity", desc: "Work decisions, financial expansion & creative projects", icon: Briefcase, color: "text-amber-400" },
  { id: "Spiritual Awakening", label: "Spiritual Awakening", desc: "Higher guidance, intuition, shadow work & karmic lessons", icon: Sun, color: "text-purple-400" }
];

export const BookingCalendar: React.FC<BookingCalendarProps> = ({ onJoinSession }) => {
  // Generate next 14 available dates
  const [availableDates, setAvailableDates] = useState<Array<{ dateStr: string; dayName: string; dayNumber: string; monthName: string }>>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('04:00 PM');
  const [timezone, setTimezone] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [focusArea, setFocusArea] = useState<string>('Life & Destiny');
  const [notes, setNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<{
    id: string;
    sessionId: string;
    clientName: string;
    clientEmail: string;
    date: string;
    timeSlot: string;
    timezone: string;
    focus: string;
  } | null>(null);

  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    // Detect local timezone
    try {
      const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimezone(userTz || 'UTC');
    } catch {
      setTimezone('UTC');
    }

    // Generate upcoming dates
    const dates = [];
    const now = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = d.toLocaleDateString('en-US', { day: 'numeric' });
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      dates.push({ dateStr, dayName, dayNumber, monthName });
    }
    setAvailableDates(dates);
    if (dates.length > 0) {
      setSelectedDate(dates[0].dateStr);
    }
  }, []);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail || !selectedDate || !selectedTime) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          clientEmail,
          date: selectedDate,
          timeSlot: selectedTime,
          timezone,
          focus: focusArea,
          notes
        })
      });

      const data = await res.json();
      if (res.ok && data.booking) {
        setConfirmedBooking(data.booking);
      } else {
        alert(data.error || 'Failed to complete booking. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error connecting to booking server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copySessionUrl = () => {
    if (!confirmedBooking) return;
    const url = `${window.location.origin}/session/${confirmedBooking.sessionId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Download iCalendar event (.ics)
  const downloadIcs = () => {
    if (!confirmedBooking) return;
    const sessionUrl = `${window.location.origin}/session/${confirmedBooking.sessionId}`;
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Live Tarot Sanctuary//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:🔮 Live Tarot Reading with Sanctuary Reader
DESCRIPTION:Your live virtual tarot session for ${confirmedBooking.focus}.\\nJoin room: ${sessionUrl}
LOCATION:${sessionUrl}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `tarot-reading-${confirmedBooking.sessionId}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Intro Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium uppercase tracking-widest mb-3">
          <Sparkles size={14} className="text-amber-400" />
          <span>Real-Time Virtual Sanctuary</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-purple-200 to-amber-100 tracking-tight mb-3">
          Book Your Live Tarot Experience
        </h1>
        <p className="text-purple-300/80 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          Step into a live, synced 2-person ritual with your reader. Connect with the 78 sacred cards, shuffle in real-time, draw your Life, Love, and Career trinity, and receive channeled live wisdom.
        </p>
      </div>

      {confirmedBooking ? (
        /* ================= CONFIRMATION SCREEN ================= */
        <div className="bg-gradient-to-b from-[#1b142f] to-[#100d1e] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-purple-950/70 text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={36} />
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amber-200 mb-2">
            Your Sanctuary Slot is Confirmed
          </h2>
          <p className="text-purple-300/80 text-sm mb-6">
            A confirmation notification has been registered for <strong className="text-amber-300">{confirmedBooking.clientEmail}</strong>.
          </p>

          <div className="bg-purple-950/40 border border-purple-500/30 rounded-2xl p-5 mb-6 text-left space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-purple-500/20 text-sm">
              <span className="text-purple-400 flex items-center gap-1.5">
                <CalendarIcon size={15} /> Date & Time
              </span>
              <span className="font-semibold text-purple-100">
                {confirmedBooking.date} at {confirmedBooking.timeSlot}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-purple-500/20 text-sm">
              <span className="text-purple-400 flex items-center gap-1.5">
                <Globe size={15} /> Timezone
              </span>
              <span className="text-purple-200">{confirmedBooking.timezone}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-purple-400 flex items-center gap-1.5">
                <Compass size={15} /> Inquiry Focus
              </span>
              <span className="font-semibold text-amber-300">{confirmedBooking.focus}</span>
            </div>
          </div>

          <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-3 mb-6 flex items-center justify-between gap-2 text-xs">
            <span className="text-amber-200 truncate font-mono">
              {window.location.origin}/session/{confirmedBooking.sessionId}
            </span>
            <button
              onClick={copySessionUrl}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1 font-medium transition shrink-0"
            >
              <Copy size={13} />
              <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => onJoinSession(confirmedBooking.sessionId, confirmedBooking.clientName)}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-purple-600 to-amber-600 text-white font-semibold text-sm tracking-wide shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition flex items-center justify-center gap-2 group"
            >
              <Sparkles size={16} />
              <span>Enter Sanctuary Room Now</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={downloadIcs}
              className="px-5 py-3.5 rounded-xl bg-purple-900/40 hover:bg-purple-900/60 text-purple-200 border border-purple-500/40 font-medium text-sm transition flex items-center justify-center gap-2"
            >
              <CalendarIcon size={16} />
              <span>Add to Calendar (.ics)</span>
            </button>
          </div>
        </div>
      ) : (
        /* ================= BOOKING FORM ================= */
        <form onSubmit={handleBookingSubmit} className="space-y-8">
          {/* Section 1: Choose Date */}
          <div className="bg-[#141026]/90 border border-purple-500/30 rounded-2xl p-5 sm:p-6 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                <CalendarIcon size={16} /> 1. Select Your Date
              </label>
              <span className="text-xs text-purple-400">Available slots next 14 days</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {availableDates.map((item) => {
                const isSelected = selectedDate === item.dateStr;
                return (
                  <button
                    key={item.dateStr}
                    type="button"
                    onClick={() => setSelectedDate(item.dateStr)}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-gradient-to-b from-amber-500/30 to-purple-600/30 border-amber-400 text-amber-100 shadow-lg shadow-amber-500/20'
                        : 'bg-purple-950/20 border-purple-500/20 text-purple-300 hover:border-purple-400/50 hover:bg-purple-900/30'
                    }`}
                  >
                    <span className="text-[11px] uppercase tracking-wider opacity-70">{item.dayName}</span>
                    <span className="text-lg font-bold font-serif my-0.5">{item.dayNumber}</span>
                    <span className="text-[10px] opacity-80">{item.monthName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Choose Time Slot & Timezone */}
          <div className="bg-[#141026]/90 border border-purple-500/30 rounded-2xl p-5 sm:p-6 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <label className="text-sm font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                <Clock size={16} /> 2. Select Live Reading Slot
              </label>

              {/* Timezone Selector */}
              <div className="flex items-center gap-2 bg-purple-950/50 px-3 py-1.5 rounded-xl border border-purple-500/30 text-xs">
                <Globe size={14} className="text-purple-400" />
                <span className="text-purple-300">Timezone:</span>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="bg-transparent text-amber-300 font-medium focus:outline-none cursor-pointer"
                >
                  <option value={timezone} className="bg-[#16112a] text-purple-200">{timezone} (Detected)</option>
                  <option value="America/New_York" className="bg-[#16112a] text-purple-200">America/New York (EST/EDT)</option>
                  <option value="America/Los_Angeles" className="bg-[#16112a] text-purple-200">America/Los Angeles (PST/PDT)</option>
                  <option value="America/Chicago" className="bg-[#16112a] text-purple-200">America/Chicago (CST/CDT)</option>
                  <option value="Europe/London" className="bg-[#16112a] text-purple-200">Europe/London (GMT/BST)</option>
                  <option value="Europe/Paris" className="bg-[#16112a] text-purple-200">Europe/Paris (CET/CEST)</option>
                  <option value="Asia/Kolkata" className="bg-[#16112a] text-purple-200">Asia/Kolkata (IST)</option>
                  <option value="Asia/Tokyo" className="bg-[#16112a] text-purple-200">Asia/Tokyo (JST)</option>
                  <option value="Australia/Sydney" className="bg-[#16112a] text-purple-200">Australia/Sydney (AEST)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {TIME_SLOTS.map((time) => {
                const isSelected = selectedTime === time;
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`py-3 px-4 rounded-xl border font-medium text-sm transition flex items-center justify-center gap-2 ${
                      isSelected
                        ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-md shadow-amber-500/20'
                        : 'bg-purple-950/20 border-purple-500/20 text-purple-200 hover:border-purple-400/50 hover:bg-purple-900/30'
                    }`}
                  >
                    <span>{time}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Focus Area */}
          <div className="bg-[#141026]/90 border border-purple-500/30 rounded-2xl p-5 sm:p-6 backdrop-blur-md">
            <label className="text-sm font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-2 mb-4">
              <Compass size={16} /> 3. Reading Focus & Intention
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {FOCUS_AREAS.map((f) => {
                const isSelected = focusArea === f.id;
                const IconComp = f.icon;
                return (
                  <div
                    key={f.id}
                    onClick={() => setFocusArea(f.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition flex items-start gap-3.5 ${
                      isSelected
                        ? 'bg-purple-900/30 border-amber-400/80 shadow-md shadow-amber-500/10'
                        : 'bg-purple-950/20 border-purple-500/20 hover:border-purple-400/40 hover:bg-purple-900/20'
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg bg-black/40 border border-purple-500/30 ${f.color}`}>
                      <IconComp size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-purple-100 mb-0.5">{f.label}</h4>
                      <p className="text-xs text-purple-400 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-purple-300 mb-1.5 font-medium">
                Personal Intention or Specific Questions (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What situation is currently occupying your mind? What guidance do you hope the cards will illuminate today?"
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-purple-100 placeholder-purple-500/60 focus:outline-none focus:border-amber-400 transition text-sm resize-none"
              />
            </div>
          </div>

          {/* Section 4: Seeker Contact Details */}
          <div className="bg-[#141026]/90 border border-purple-500/30 rounded-2xl p-5 sm:p-6 backdrop-blur-md">
            <label className="text-sm font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-2 mb-4">
              <ShieldCheck size={16} /> 4. Your Seeker Information
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-purple-300 mb-1 font-medium">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Maya Chen"
                  className="w-full px-4 py-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-purple-100 placeholder-purple-500/60 focus:outline-none focus:border-amber-400 transition text-sm"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-purple-300 mb-1 font-medium">
                  Email Address * (For Confirmation & Session Link)
                </label>
                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="e.g. maya@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-purple-100 placeholder-purple-500/60 focus:outline-none focus:border-amber-400 transition text-sm"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !clientName || !clientEmail}
              className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-purple-600 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-semibold text-base tracking-wide shadow-xl shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 mx-auto"
            >
              <Sparkles size={18} />
              <span>{isSubmitting ? 'Resonating with the Deck...' : 'Confirm Reading Slot & Create Sanctuary Room'}</span>
            </button>
            <p className="text-[12px] text-purple-400/70 mt-3">
              🔒 Instant confirmation. You can test or enter the live room at any time.
            </p>
          </div>
        </form>
      )}
    </div>
  );
};
