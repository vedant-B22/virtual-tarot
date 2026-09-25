import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Globe,
  Sparkles,
  Copy,
  ArrowRight,
  Heart,
  Briefcase,
  Compass,
  Sun,
  ShieldCheck,
  Upload,
  QrCode,
  Shield
} from 'lucide-react';
import { FoundersBanner } from './FoundersBanner';
import { BACKEND_URL } from '../utils/apiConfig';

interface BookingCalendarProps {
  onJoinSession: (sessionId: string, clientName: string) => void;
}

const FOCUS_AREAS = [
  {
    id: "Life & Destiny",
    label: "Life & Destiny",
    price: 130,
    desc: "Clarity on life direction, karmic crossroads, personal power & soul trajectory",
    icon: Compass,
    accent: "from-[#0d2818]/80 to-[#05130b]/90 border-emerald-500/30 text-emerald-400"
  },
  {
    id: "Love & Sacred Union",
    label: "Love & Sacred Union",
    price: 150,
    desc: "Soulmate alignment, heart truth, emotional healing & relational destiny",
    icon: Heart,
    accent: "from-[#2f0d1b]/80 to-[#14050c]/90 border-rose-500/30 text-rose-400"
  },
  {
    id: "Career & Prosperity",
    label: "Career & Prosperity",
    price: 120,
    desc: "Vocation clarity, wealth breakthroughs, leadership timing & enterprise expansion",
    icon: Briefcase,
    accent: "from-[#2c1d06]/80 to-[#140c03]/90 border-amber-500/30 text-amber-400"
  },
  {
    id: "Spiritual Awakening",
    label: "Spiritual Awakening",
    price: 100,
    desc: "Higher consciousness, intuition channeling, shadow integration & esoteric release",
    icon: Sun,
    accent: "from-[#1d0b2e]/80 to-[#0c0414]/90 border-purple-500/30 text-purple-400"
  }
];

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

export const BookingCalendar: React.FC<BookingCalendarProps> = ({ onJoinSession }) => {
  const [bookingStep, setBookingStep] = useState<'details' | 'payment' | 'completed'>('details');
  const [availableDates, setAvailableDates] = useState<Array<{ dateStr: string; dayName: string; dayNumber: string; monthName: string }>>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('04:00 PM');
  const [timezone, setTimezone] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [focusArea, setFocusArea] = useState<string>('Life & Destiny');
  const [notes, setNotes] = useState<string>('');

  // Payment State
  const [paymentScreenshot, setPaymentScreenshot] = useState<string | null>(null);
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Result state
  const [createdBooking, setCreatedBooking] = useState<{
    id: string;
    sessionId: string;
    clientName: string;
    clientEmail: string;
    date: string;
    timeSlot: string;
    timezone: string;
    focus: string;
    status: string;
  } | null>(null);

  const [copiedLink, setCopiedLink] = useState(false);

  const selectedFocusAreaObj = FOCUS_AREAS.find((f) => f.id === focusArea) || FOCUS_AREAS[0];
  const selectedPrice = selectedFocusAreaObj.price;

  useEffect(() => {
    try {
      const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimezone(userTz || 'UTC');
    } catch {
      setTimezone('UTC');
    }

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

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail || !selectedDate || !selectedTime) {
      alert('Please fill all required seeker fields.');
      return;
    }
    setBookingStep('payment');
    window.scrollTo({ top: 320, behavior: 'smooth' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, JPEG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          setPaymentScreenshot(compressed);
        } else {
          setPaymentScreenshot(reader.result as string);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFinalSubmit = async () => {
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
          notes,
          paymentScreenshot,
          transactionRef,
          amount: selectedPrice
        })
      });

      const data = await res.json();
      if (res.ok && data.booking) {
        setCreatedBooking(data.booking);
        setBookingStep('completed');
        window.scrollTo({ top: 200, behavior: 'smooth' });
      } else {
        alert(data.error || 'Failed to submit sanctuary booking.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error connecting to sanctuary.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText('9226634637-2@ybl');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const copySessionUrl = () => {
    if (!createdBooking) return;
    const url = `${window.location.origin}/session/${createdBooking.sessionId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* 1. Grand Founders Conclave Showcase */}
      <FoundersBanner />

      {/* ================= STEP 3: SUBMITTED & AWAITING READER BLESSING ================= */}
      {bookingStep === 'completed' && createdBooking && (
        <div className="bg-gradient-to-b from-[#160714]/95 via-[#0c0413]/95 to-[#050209]/98 border border-[#c5a059]/40 rounded-3xl p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.95)] text-center max-w-2xl mx-auto relative overflow-hidden backdrop-blur-2xl">
          <div className="absolute top-3 left-4 text-[#c5a059]/60 text-xs">❖</div>
          <div className="absolute top-3 right-4 text-[#c5a059]/60 text-xs">❖</div>

          {/* Sealed Gate Emblem */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2a0614] via-[#1a0724] to-[#07020d] border border-[#c5a059] text-[#fde047] flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(197,160,89,0.35)]">
            <Shield size={38} className="animate-pulse text-[#e5c158]" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-black/60 border border-[#c5a059]/30 text-[#e5c158] text-[11px] font-cinzel tracking-widest uppercase mb-2">
            <span>Payment Submitted • Sanctuary Consecration in Progress</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-gothic-title font-bold text-[#f7eedc] mb-2 tracking-wide">
            Sanctuary Chamber Sealed
          </h2>

          <p className="text-xs sm:text-sm text-[#baa890] font-serif leading-relaxed mb-6 max-w-lg mx-auto">
            Your sacred request has been transmitted. <strong className="text-[#f7eedc]">Reader Vedant Baviskar & Anvii Panchal</strong> will verify your payment offering in the Reader Sanctum before granting entrance to your live chamber.
          </p>

          {/* Booking Summary Box */}
          <div className="bg-[#090510]/80 border border-[#c5a059]/25 rounded-2xl p-5 mb-6 text-left space-y-3 font-serif">
            <div className="flex justify-between items-center pb-2 border-b border-[#c5a059]/15 text-xs sm:text-sm">
              <span className="text-[#baa890] flex items-center gap-1.5 font-cinzel">
                <CalendarIcon size={14} className="text-[#c5a059]" /> Reserved Date & Time
              </span>
              <span className="font-bold text-[#f7eedc]">
                {createdBooking.date} at {createdBooking.timeSlot}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-[#c5a059]/15 text-xs sm:text-sm">
              <span className="text-[#baa890] flex items-center gap-1.5 font-cinzel">
                <Globe size={14} className="text-[#c5a059]" /> Timezone
              </span>
              <span className="text-[#baa890]">{createdBooking.timezone}</span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-[#baa890] flex items-center gap-1.5 font-cinzel">
                <Compass size={14} className="text-[#c5a059]" /> Inquiry Focus & Offering
              </span>
              <span className="font-bold text-[#e5c158]">{createdBooking.focus} (₹{selectedPrice})</span>
            </div>
          </div>

          {/* Copyable Link */}
          <div className="bg-black/70 border border-[#c5a059]/25 rounded-xl p-3 mb-6 flex items-center justify-between gap-2 text-xs">
            <span className="text-[#e5c158] truncate font-mono text-[11px]">
              {window.location.origin}/session/{createdBooking.sessionId}
            </span>
            <button
              onClick={copySessionUrl}
              className="px-3.5 py-1.5 rounded-lg bg-[#c5a059]/20 hover:bg-[#c5a059]/30 text-[#f7eedc] border border-[#c5a059]/40 font-cinzel font-semibold flex items-center gap-1 transition shrink-0"
            >
              <Copy size={13} />
              <span>{copiedLink ? 'Copied!' : 'Copy Chamber Link'}</span>
            </button>
          </div>

          {/* Enter Waiting Chamber Button */}
          <button
            onClick={() => onJoinSession(createdBooking.sessionId, createdBooking.clientName)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#2f0714] via-[#4d1024] to-[#1c0827] hover:from-[#3f0a1b] hover:to-[#2b0c3c] text-[#f7eedc] font-cinzel font-bold text-xs uppercase tracking-[0.2em] border border-[#c5a059]/70 shadow-[0_0_35px_rgba(197,160,89,0.35)] transition flex items-center justify-center gap-2 group hover:scale-[1.01]"
          >
            <ShieldCheck size={18} className="text-[#e5c158]" />
            <span>Enter Sanctuary Waiting Chamber</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-[11px] text-[#8e8274] italic mt-3 font-serif">
            * The sanctuary doors will open automatically the moment the reader approves your verification.
          </p>
        </div>
      )}

      {/* ================= STEP 2: CONSECRATED OFFERING & SCREENSHOT UPLOAD ================= */}
      {bookingStep === 'payment' && (
        <div className="bg-gradient-to-b from-[#160714]/95 via-[#0c0413]/95 to-[#050209]/98 border border-[#c5a059]/40 rounded-3xl p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.95)] max-w-2xl mx-auto relative overflow-hidden backdrop-blur-2xl">
          <div className="absolute top-3 left-4 text-[#c5a059]/60 text-xs">❖</div>
          <div className="absolute top-3 right-4 text-[#c5a059]/60 text-xs">❖</div>

          {/* Header with Pricing Banner */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/60 border border-[#c5a059]/30 text-[#e5c158] text-[11px] font-cinzel uppercase tracking-[0.2em] mb-2">
              <QrCode size={13} className="text-[#e5c158]" />
              <span>Step 2 of 2: Consecrated Offering</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-gothic-title font-bold text-[#f7eedc] tracking-wide">
              Scan QR & Upload Verification
            </h2>

            {/* Prominent Exact Price Badge */}
            <div className="my-3 inline-flex items-center gap-3 px-6 py-2.5 rounded-2xl bg-[#0a0512] border border-[#c5a059]/70 text-[#f7eedc] shadow-[0_0_30px_rgba(197,160,89,0.3)]">
              <span className="text-[11px] uppercase font-cinzel tracking-wider text-[#baa890]">Exact Offering:</span>
              <span className="text-2xl sm:text-3xl font-bold font-gothic-title text-[#e5c158] drop-shadow-[0_0_10px_rgba(250,204,21,0.7)]">
                ₹{selectedPrice}
              </span>
              <span className="text-xs text-[#baa890]">({focusArea})</span>
            </div>

            <p className="text-xs sm:text-sm text-[#baa890] font-serif mt-1">
              Scan the sacred QR code below via PhonePe, GPay, Paytm or any UPI app, complete the exact offering of <strong className="text-[#e5c158]">₹{selectedPrice}</strong>, then upload the confirmation screenshot below.
            </p>
          </div>

          {/* Payment QR Code Showcase */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-black/60 border border-[#c5a059]/30 shadow-xl mb-6 relative">
            {/* The Actual User Uploaded Payment QR */}
            <div className="relative p-2 rounded-2xl bg-white shadow-2xl border-2 border-[#c5a059]">
              <img
                src="/payment-qr.jpg"
                alt="Sanctuary Payment QR Code"
                className="w-52 h-auto sm:w-60 rounded-xl object-contain shadow-inner"
              />
            </div>

            {/* UPI ID Copy Block */}
            <div className="mt-4 flex items-center gap-2 bg-[#12071d] px-4 py-2 rounded-xl border border-[#c5a059]/30 text-xs sm:text-sm font-mono text-[#e5c158]">
              <span>UPI ID: <strong className="text-[#f7eedc]">9226634637-2@ybl</strong></span>
              <button
                type="button"
                onClick={copyUpiId}
                className="p-1 hover:bg-[#c5a059]/20 rounded text-[#c5a059] transition"
                title="Copy UPI ID"
              >
                <Copy size={14} />
              </button>
              {copiedUpi && <span className="text-[10px] text-emerald-400 font-cinzel">Copied!</span>}
            </div>
            <div className="text-[11px] text-[#8e8274] font-cinzel mt-1">
              Punjab National Bank • Pay exact offering: <strong className="text-[#e5c158]">₹{selectedPrice}</strong>
            </div>
          </div>

          {/* Screenshot Upload Zone */}
          <div className="space-y-4 mb-6">
            <label className="block text-xs uppercase tracking-[0.15em] text-[#c5a059] font-cinzel font-bold">
              Upload Payment Confirmation Screenshot (Optional)
            </label>

            {paymentScreenshot ? (
              <div className="relative p-3 rounded-2xl bg-black/60 border border-emerald-500/50 flex flex-col items-center">
                <img
                  src={paymentScreenshot}
                  alt="Uploaded Payment Confirmation"
                  className="max-h-64 rounded-xl object-contain border border-[#c5a059]/30 shadow-lg mb-2"
                />
                <button
                  type="button"
                  onClick={() => setPaymentScreenshot(null)}
                  className="text-xs text-rose-400 hover:text-rose-300 font-cinzel underline mt-1"
                >
                  Change Screenshot
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-[#c5a059]/40 hover:border-[#c5a059] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-[#090510]/60 hover:bg-[#150a24]/50 transition group">
                <Upload size={30} className="text-[#c5a059] group-hover:scale-110 transition-transform mb-2" />
                <span className="font-cinzel text-xs font-bold text-[#f7eedc] uppercase tracking-wider">
                  Select Payment Screenshot (Optional)
                </span>
                <span className="text-[11px] text-[#8e8274] mt-1 font-serif">
                  Optional: Attach payment receipt or enter your UPI reference number below
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#c5a059] font-cinzel font-medium mb-1">
                Transaction ID / UTR Number (Optional)
              </label>
              <input
                type="text"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="e.g. 12-digit UPI reference number"
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-[#c5a059]/25 text-[#f7eedc] placeholder-[#8e8274]/50 font-mono text-xs focus:outline-none focus:border-[#c5a059]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setBookingStep('details')}
              className="px-5 py-3.5 rounded-xl bg-black/60 text-[#baa890] hover:text-[#f7eedc] border border-[#c5a059]/25 font-cinzel text-xs uppercase transition"
            >
              ← Back to Slot
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFinalSubmit}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#2f0714] via-[#4d1024] to-[#1c0827] hover:from-[#3f0a1b] hover:to-[#2b0c3c] text-[#f7eedc] font-cinzel font-bold text-xs uppercase tracking-[0.2em] border border-[#c5a059]/70 shadow-[0_0_25px_rgba(197,160,89,0.35)] transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              <Sparkles size={16} className="text-[#e5c158]" />
              <span>{isSubmitting ? 'Transmitting Offering...' : `Confirm & Transmit ₹${selectedPrice} Offering`}</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 1: SELECT SLOT & SEEKER DETAILS ================= */}
      {bookingStep === 'details' && (
        <form onSubmit={handleProceedToPayment} className="space-y-7">
          {/* Section 1: Choose Date */}
          <div className="bg-gradient-to-b from-[#120610]/90 via-[#0a0412]/90 to-[#050209]/95 border border-[#c5a059]/25 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-2 left-4 text-[#c5a059]/40 text-xs">❖</div>
            <div className="absolute top-2 right-4 text-[#c5a059]/40 text-xs">❖</div>

            <div className="flex items-center justify-between mb-4">
              <label className="text-xs sm:text-sm font-cinzel font-bold uppercase tracking-[0.15em] text-[#f7eedc] flex items-center gap-2">
                <CalendarIcon size={16} className="text-[#c5a059]" /> 1. Select Divination Date
              </label>
              <span className="text-[11px] text-[#baa890] font-cinzel">Upcoming 14 Days</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {availableDates.map((item) => {
                const isSelected = selectedDate === item.dateStr;
                return (
                  <button
                    key={item.dateStr}
                    type="button"
                    onClick={() => setSelectedDate(item.dateStr)}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#2a0614] to-[#140520] border-[#c5a059] text-[#f7eedc] shadow-[0_0_20px_rgba(197,160,89,0.35)]'
                        : 'bg-black/40 border-[#c5a059]/15 text-[#baa890] hover:border-[#c5a059]/50 hover:bg-[#12071d]/60'
                    }`}
                  >
                    <span className="text-[10px] uppercase tracking-wider font-cinzel opacity-75">{item.dayName}</span>
                    <span className="text-lg font-bold font-gothic-title my-0.5">{item.dayNumber}</span>
                    <span className="text-[10px] opacity-75">{item.monthName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Choose Time Slot & Timezone */}
          <div className="bg-gradient-to-b from-[#120610]/90 via-[#0a0412]/90 to-[#050209]/95 border border-[#c5a059]/25 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-2 left-4 text-[#c5a059]/40 text-xs">❖</div>
            <div className="absolute top-2 right-4 text-[#c5a059]/40 text-xs">❖</div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <label className="text-xs sm:text-sm font-cinzel font-bold uppercase tracking-[0.15em] text-[#f7eedc] flex items-center gap-2">
                <Clock size={16} className="text-[#c5a059]" /> 2. Select Consecrated Time Slot
              </label>

              {/* Timezone Selector */}
              <div className="flex items-center gap-2 bg-black/60 px-3.5 py-1.5 rounded-xl border border-[#c5a059]/20 text-xs">
                <Globe size={14} className="text-[#c5a059]" />
                <span className="text-[#baa890] font-cinzel">Timezone:</span>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="bg-transparent text-[#f7eedc] font-medium focus:outline-none cursor-pointer"
                >
                  <option value={timezone} className="bg-[#12071d] text-[#baa890]">{timezone} (Detected)</option>
                  <option value="Asia/Kolkata" className="bg-[#12071d] text-[#baa890]">Asia/Kolkata (IST)</option>
                  <option value="America/New_York" className="bg-[#12071d] text-[#baa890]">America/New York (EST)</option>
                  <option value="America/Los_Angeles" className="bg-[#12071d] text-[#baa890]">America/Los Angeles (PST)</option>
                  <option value="Europe/London" className="bg-[#12071d] text-[#baa890]">Europe/London (GMT)</option>
                  <option value="Europe/Paris" className="bg-[#12071d] text-[#baa890]">Europe/Paris (CET)</option>
                  <option value="Asia/Dubai" className="bg-[#12071d] text-[#baa890]">Asia/Dubai (GST)</option>
                  <option value="Australia/Sydney" className="bg-[#12071d] text-[#baa890]">Australia/Sydney (AEST)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TIME_SLOTS.map((time) => {
                const isSelected = selectedTime === time;
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`py-3 px-4 rounded-xl border font-cinzel font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#2a0614] to-[#140520] border-[#c5a059] text-[#f7eedc] shadow-[0_0_15px_rgba(197,160,89,0.35)]'
                        : 'bg-black/40 border-[#c5a059]/15 text-[#baa890] hover:border-[#c5a059]/40 hover:bg-black/60'
                    }`}
                  >
                    <span>{time}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Focus Area with Clear Pricing */}
          <div className="bg-gradient-to-b from-[#120610]/90 via-[#0a0412]/90 to-[#050209]/95 border border-[#c5a059]/25 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-2 left-4 text-[#c5a059]/40 text-xs">❖</div>
            <div className="absolute top-2 right-4 text-[#c5a059]/40 text-xs">❖</div>

            <div className="flex items-center justify-between mb-4">
              <label className="text-xs sm:text-sm font-cinzel font-bold uppercase tracking-[0.15em] text-[#f7eedc] flex items-center gap-2">
                <Compass size={16} className="text-[#c5a059]" /> 3. Reading Focus & Sacred Offering
              </label>
              <span className="text-[11px] text-[#c5a059] font-cinzel font-semibold">Sanctuary Rates</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              {FOCUS_AREAS.map((f) => {
                const isSelected = focusArea === f.id;
                const IconComp = f.icon;
                return (
                  <div
                    key={f.id}
                    onClick={() => setFocusArea(f.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-4 relative overflow-hidden ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#240612]/90 to-[#12041c]/90 border-[#c5a059] shadow-[0_0_20px_rgba(197,160,89,0.3)]'
                        : 'bg-black/50 border-[#c5a059]/20 hover:border-[#c5a059]/40 hover:bg-black/70'
                    }`}
                  >
                    <div className={`p-3 rounded-xl bg-black/60 border border-[#c5a059]/30 ${f.accent} shrink-0`}>
                      <IconComp size={22} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-cinzel font-bold text-sm text-[#f7eedc]">{f.label}</h4>
                        <span className="px-3 py-0.5 rounded-full text-xs font-cinzel font-bold bg-[#140610] text-[#e5c158] border border-[#c5a059]/50 shadow-[0_0_10px_rgba(197,160,89,0.25)] shrink-0">
                          ₹{f.price}
                        </span>
                      </div>
                      <p className="text-xs text-[#baa890] font-serif leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#c5a059] font-cinzel font-medium mb-1.5">
                Personal Intention or Questions for Reader Vedant & Anvii (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What transition or question is in your heart? The readers will attune to this intention during your ritual."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-[#c5a059]/20 text-[#f7eedc] placeholder-[#8e8274]/50 focus:outline-none focus:border-[#c5a059] transition text-sm resize-none font-serif leading-relaxed"
              />
            </div>
          </div>

          {/* Section 4: Seeker Identification */}
          <div className="bg-gradient-to-b from-[#120610]/90 via-[#0a0412]/90 to-[#050209]/95 border border-[#c5a059]/25 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-2 left-4 text-[#c5a059]/40 text-xs">❖</div>
            <div className="absolute top-2 right-4 text-[#c5a059]/40 text-xs">❖</div>

            <label className="text-xs sm:text-sm font-cinzel font-bold uppercase tracking-[0.15em] text-[#f7eedc] flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-[#c5a059]" /> 4. Seeker Details
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#c5a059] font-cinzel font-medium mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-[#c5a059]/25 text-[#f7eedc] placeholder-[#8e8274]/40 font-serif text-sm focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#c5a059] font-cinzel font-medium mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="e.g. eleanor@sanctuary.com"
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-[#c5a059]/25 text-[#f7eedc] placeholder-[#8e8274]/40 font-serif text-sm focus:outline-none focus:border-[#c5a059]"
                />
              </div>
            </div>
          </div>

          {/* Submit & Move to Step 2 Button */}
          <div className="text-center pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto px-12 py-4 rounded-2xl bg-gradient-to-r from-[#2f0714] via-[#4d1024] to-[#1c0827] hover:from-[#3f0a1b] hover:to-[#2b0c3c] text-[#f7eedc] font-cinzel font-bold text-xs uppercase tracking-[0.2em] border border-[#c5a059]/70 shadow-[0_0_35px_rgba(197,160,89,0.35)] transition hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 mx-auto group"
            >
              <span>Proceed to Sacred Offering (₹{selectedPrice})</span>
              <ArrowRight size={17} className="group-hover:translate-x-1.5 transition-transform" />
            </button>
            <p className="text-[11px] text-[#8e8274] font-cinzel mt-2 tracking-wider">
              Step 1 of 2 • Slot Reserved for 15 Minutes
            </p>
          </div>
        </form>
      )}
    </div>
  );
};
