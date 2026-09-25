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
import { DeckShuffleAnimation } from './DeckShuffleAnimation';
import { BACKEND_URL } from '../utils/apiConfig';

interface BookingCalendarProps {
  onJoinSession: (sessionId: string, clientName: string) => void;
}

const FOCUS_AREAS = [
  {
    id: "Life & Destiny",
    label: "Life & Destiny",
    price: 130,
    desc: "Clarity on life path, destiny timeline, personal growth & soul purpose",
    icon: Compass,
    color: "text-emerald-400",
    badgeColor: "bg-emerald-950/80 text-emerald-200 border-emerald-500/50"
  },
  {
    id: "Love & Sacred Union",
    label: "Love & Sacred Union",
    price: 150,
    desc: "Soulmate connections, twin flame alignment, heart healing & relational truth",
    icon: Heart,
    color: "text-rose-400",
    badgeColor: "bg-rose-950/80 text-rose-200 border-rose-500/50"
  },
  {
    id: "Career & Prosperity",
    label: "Career & Prosperity",
    price: 120,
    desc: "Vocation clarity, financial breakthroughs, promotions & business ventures",
    icon: Briefcase,
    color: "text-amber-400",
    badgeColor: "bg-amber-950/80 text-amber-200 border-amber-500/50"
  },
  {
    id: "Spiritual Awakening",
    label: "Spiritual Awakening",
    price: 100,
    desc: "Higher consciousness, intuition channeling, shadow work & karmic release",
    icon: Sun,
    color: "text-purple-400",
    badgeColor: "bg-purple-950/80 text-purple-200 border-purple-500/50"
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

  // Step 1: Validate details and move to payment QR
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail || !selectedDate || !selectedTime) {
      alert('Please fill all required seeker fields.');
      return;
    }
    setBookingStep('payment');
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  // Handle Payment Screenshot Upload with fast client-side canvas compression
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

  // Step 2: Submit final booking with payment screenshot
  const handleFinalSubmit = async () => {
    if (!paymentScreenshot) {
      alert('Please upload your payment confirmation screenshot so Reader Vedant can verify and unlock your session.');
      return;
    }

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
      {/* 1. Grand Founders Showcase (Prominent at top) */}
      <FoundersBanner />

      {/* 2. Interactive 3D Deck Shuffling Altar (Pre-reading connection) */}
      {bookingStep === 'details' && (
        <div className="w-full my-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#200511]/90 via-[#0e0317]/95 to-[#06020c]/98 border-2 border-[#d4af37]/60 shadow-[0_0_50px_rgba(212,175,55,0.2)] text-center relative overflow-hidden">
          <div className="absolute top-2 left-4 text-[#d4af37]/50 text-sm">❖</div>
          <div className="absolute top-2 right-4 text-[#d4af37]/50 text-sm">❖</div>
          <div className="text-center relative z-10 mb-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/60 border border-[#d4af37]/40 text-[#fef08a] text-xs font-cinzel uppercase tracking-widest mb-1.5 shadow-inner">
              <Sparkles size={12} className="text-[#facc15] animate-pulse" />
              <span>Interactive 3D Divination Altar</span>
              <Sparkles size={12} className="text-[#facc15] animate-pulse" />
            </div>
            <h3 className="text-xl sm:text-3xl font-gothic-title font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#fef08a] via-[#f3e5ab] to-[#d4af37]">
              Attune Your Energy: Shuffle the 78 Arcana
            </h3>
            <p className="text-xs text-[#e2d5b8]/80 font-serif italic max-w-md mx-auto mt-1">
              Focus on your heart&apos;s inquiry and click below to watch the physical 3D cut, riffle, and bridge cascade.
            </p>
          </div>

          <DeckShuffleAnimation />
        </div>
      )}

      {/* ================= STEP 3: SUBMITTED & AWAITING READER APPROVAL ================= */}
      {bookingStep === 'completed' && createdBooking && (
        <div className="bg-gradient-to-b from-[#2d0511] via-[#15041c] to-[#07020e] border-2 border-[#d4af37]/80 rounded-3xl p-6 sm:p-10 shadow-[0_0_60px_rgba(212,175,55,0.3)] text-center max-w-2xl mx-auto relative overflow-hidden">
          <div className="absolute top-3 left-4 text-[#d4af37]/60 text-sm">❖</div>
          <div className="absolute top-3 right-4 text-[#d4af37]/60 text-sm">❖</div>

          {/* Hourglass / Sealed Gate Icon */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#7f1d1d] via-[#581c87] to-[#1c1917] border-2 border-[#d4af37] text-[#fef08a] flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(212,175,55,0.5)]">
            <Shield size={40} className="animate-pulse text-[#fde047]" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-[#d4af37]/40 text-[#fef08a] text-xs font-cinzel uppercase tracking-widest mb-2">
            <span>Payment Submitted • Awaiting Sanctuary Blessing</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-gothic-title font-bold text-[#fef08a] mb-2 drop-shadow">
            Sanctuary Gates Sealed
          </h2>

          <p className="text-sm text-[#eedec5]/90 font-serif leading-relaxed mb-6">
            Your sacred request has been consecrated. <strong className="text-[#fef08a]">Reader Vedant Baviskar & Anvii Panchal</strong> will verify your payment screenshot in the Reader Sanctum before granting entrance to your live chamber.
          </p>

          {/* Booking Summary Box */}
          <div className="bg-black/70 border border-[#d4af37]/35 rounded-2xl p-5 mb-6 text-left space-y-3 font-serif">
            <div className="flex justify-between items-center pb-2 border-b border-[#d4af37]/20 text-xs sm:text-sm">
              <span className="text-[#c4b5fd] flex items-center gap-1.5 font-cinzel">
                <CalendarIcon size={14} className="text-[#d4af37]" /> Date & Time
              </span>
              <span className="font-bold text-[#fef08a]">
                {createdBooking.date} at {createdBooking.timeSlot}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-[#d4af37]/20 text-xs sm:text-sm">
              <span className="text-[#c4b5fd] flex items-center gap-1.5 font-cinzel">
                <Globe size={14} className="text-[#d4af37]" /> Timezone
              </span>
              <span className="text-[#eedec5]">{createdBooking.timezone}</span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-[#c4b5fd] flex items-center gap-1.5 font-cinzel">
                <Compass size={14} className="text-[#d4af37]" /> Inquiry Focus & Offering
              </span>
              <span className="font-bold text-[#fde047]">{createdBooking.focus} (₹{selectedPrice})</span>
            </div>
          </div>

          {/* Copyable Link */}
          <div className="bg-black/80 border border-[#d4af37]/40 rounded-xl p-3 mb-6 flex items-center justify-between gap-2 text-xs">
            <span className="text-[#fde047] truncate font-mono">
              {window.location.origin}/session/{createdBooking.sessionId}
            </span>
            <button
              onClick={copySessionUrl}
              className="px-3.5 py-1.5 rounded-lg bg-[#d4af37]/20 hover:bg-[#d4af37]/30 text-[#fde047] border border-[#d4af37]/40 font-cinzel font-semibold flex items-center gap-1 transition shrink-0"
            >
              <Copy size={13} />
              <span>{copiedLink ? 'Copied!' : 'Copy Chamber Link'}</span>
            </button>
          </div>

          {/* Enter Waiting Chamber Button */}
          <button
            onClick={() => onJoinSession(createdBooking.sessionId, createdBooking.clientName)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#7f1d1d] via-[#581c87] to-[#b45309] hover:from-[#991b1b] hover:to-[#d97706] text-[#fef3c7] font-cinzel font-bold text-sm tracking-widest uppercase border-2 border-[#d4af37]/70 shadow-[0_0_30px_rgba(212,175,55,0.45)] transition flex items-center justify-center gap-2 group hover:scale-[1.02]"
          >
            <ShieldCheck size={18} className="text-[#fde047]" />
            <span>Enter Sanctuary Waiting Chamber</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-[11px] text-[#9ca3af] italic mt-3">
            * The sanctuary doors will open automatically the moment the reader approves your verification.
          </p>
        </div>
      )}

      {/* ================= STEP 2: CONSECRATED PAYMENT & SCREENSHOT UPLOAD ================= */}
      {bookingStep === 'payment' && (
        <div className="bg-gradient-to-b from-[#2d0511] via-[#15041c] to-[#07020e] border-2 border-[#d4af37]/80 rounded-3xl p-6 sm:p-10 shadow-[0_0_50px_rgba(212,175,55,0.3)] max-w-2xl mx-auto relative overflow-hidden">
          <div className="absolute top-3 left-4 text-[#d4af37]/60 text-sm">❖</div>
          <div className="absolute top-3 right-4 text-[#d4af37]/60 text-sm">❖</div>

          {/* Header with Pricing Banner */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 border border-[#d4af37]/40 text-[#fef08a] text-xs font-cinzel uppercase tracking-widest mb-2">
              <QrCode size={14} className="text-[#facc15]" />
              <span>Step 2 of 2: Consecrated Offering</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-gothic-title font-bold text-[#fef08a] drop-shadow">
              Scan QR & Upload Verification
            </h2>

            {/* Prominent Exact Price Badge */}
            <div className="my-3 inline-flex items-center gap-3 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#7f1d1d] via-[#581c87] to-[#7f1d1d] border-2 border-[#d4af37] text-[#fef08a] shadow-[0_0_30px_rgba(212,175,55,0.5)]">
              <span className="text-xs uppercase font-cinzel tracking-wider text-[#eedec5]">Exact Offering:</span>
              <span className="text-2xl sm:text-3xl font-bold font-gothic-title text-[#fde047] drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]">
                ₹{selectedPrice}
              </span>
              <span className="text-xs text-[#c4b5fd]">({focusArea})</span>
            </div>

            <p className="text-xs sm:text-sm text-[#e2d5b8]/80 font-serif mt-1">
              Scan the sacred QR code below via PhonePe, GPay, Paytm or any UPI app, complete the offering of <strong className="text-[#fde047]">₹{selectedPrice}</strong>, then upload the confirmation screenshot below.
            </p>
          </div>

          {/* Payment QR Code Showcase */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-black/70 border-2 border-[#d4af37]/60 shadow-xl mb-6 relative">
            {/* The Actual User Uploaded Payment QR */}
            <div className="relative p-2 rounded-2xl bg-white shadow-2xl border-4 border-[#d4af37]">
              <img
                src="/payment-qr.jpg"
                alt="Sanctuary Payment QR Code"
                className="w-56 h-auto sm:w-64 rounded-xl object-contain shadow-inner"
              />
            </div>

            {/* UPI ID Copy Block */}
            <div className="mt-4 flex items-center gap-2 bg-[#180f2b] px-4 py-2 rounded-xl border border-[#d4af37]/40 text-xs sm:text-sm font-mono text-[#fef08a]">
              <span>UPI ID: <strong>9226634637-2@ybl</strong></span>
              <button
                type="button"
                onClick={copyUpiId}
                className="p-1 hover:bg-[#d4af37]/20 rounded text-[#d4af37] transition"
                title="Copy UPI ID"
              >
                <Copy size={14} />
              </button>
              {copiedUpi && <span className="text-[10px] text-emerald-400 font-cinzel">Copied!</span>}
            </div>
            <div className="text-[11px] text-[#9ca3af] font-cinzel mt-1">
              Punjab National Bank • Pay exact offering: <strong className="text-[#fde047]">₹{selectedPrice}</strong>
            </div>
          </div>

          {/* Screenshot Upload Zone */}
          <div className="space-y-4 mb-6">
            <label className="block text-xs uppercase tracking-wider text-[#d4af37] font-cinzel font-bold">
              Upload Payment Confirmation Screenshot *
            </label>

            {paymentScreenshot ? (
              <div className="relative p-3 rounded-2xl bg-black/60 border border-emerald-500/60 flex flex-col items-center">
                <img
                  src={paymentScreenshot}
                  alt="Uploaded Payment Confirmation"
                  className="max-h-64 rounded-xl object-contain border border-[#d4af37]/30 shadow-lg mb-2"
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
              <label className="border-2 border-dashed border-[#d4af37]/50 hover:border-[#d4af37] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-black/40 hover:bg-[#1a0f2b]/40 transition group">
                <Upload size={32} className="text-[#d4af37] group-hover:scale-110 transition-transform mb-2" />
                <span className="font-cinzel text-xs font-bold text-[#fef08a] uppercase tracking-wider">
                  Select Payment Screenshot (PNG/JPG)
                </span>
                <span className="text-[11px] text-[#9ca3af] mt-1 font-serif">
                  Must clearly show transaction amount (₹{selectedPrice}) & UPI Ref / UTR
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
              <label className="block text-xs uppercase tracking-wider text-[#d4af37] font-cinzel font-medium mb-1">
                Transaction ID / UTR Number (Optional)
              </label>
              <input
                type="text"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="e.g. 12-digit UPI reference number"
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-[#d4af37]/30 text-[#fef08a] placeholder-[#9ca3af]/40 font-mono text-xs focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setBookingStep('details')}
              className="px-5 py-3.5 rounded-xl bg-black/60 text-[#eedec5] hover:text-white border border-[#d4af37]/30 font-cinzel text-xs uppercase transition"
            >
              ← Back to Slot
            </button>

            <button
              type="button"
              disabled={isSubmitting || !paymentScreenshot}
              onClick={handleFinalSubmit}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#7f1d1d] via-[#581c87] to-[#b45309] hover:from-[#991b1b] hover:to-[#d97706] text-[#fef3c7] font-cinzel font-bold text-xs uppercase tracking-widest border-2 border-[#d4af37]/70 shadow-[0_0_25px_rgba(212,175,55,0.4)] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <Sparkles size={16} className="text-[#facc15]" />
              <span>{isSubmitting ? 'Transmitting to Sanctum...' : `Confirm & Transmit ₹${selectedPrice} Offering`}</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 1: SELECT SLOT & SEEKER DETAILS ================= */}
      {bookingStep === 'details' && (
        <form onSubmit={handleProceedToPayment} className="space-y-8">
          {/* Section 1: Choose Date */}
          <div className="bg-gradient-to-b from-[#1b0614]/90 via-[#0e0419]/90 to-[#07020e]/95 border-2 border-[#d4af37]/40 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-2 left-4 text-[#d4af37]/50 text-sm">❖</div>
            <div className="absolute top-2 right-4 text-[#d4af37]/50 text-sm">❖</div>

            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-cinzel font-bold uppercase tracking-wider text-[#fef08a] flex items-center gap-2">
                <CalendarIcon size={16} className="text-[#d4af37]" /> 1. Select Divination Date
              </label>
              <span className="text-xs text-[#d4af37]/80 font-cinzel">Upcoming 14 Days</span>
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
                        ? 'bg-gradient-to-b from-[#7f1d1d]/60 to-[#581c87]/60 border-[#d4af37] text-[#fef08a] shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                        : 'bg-black/40 border-[#d4af37]/20 text-[#eedec5] hover:border-[#d4af37]/60 hover:bg-[#1a0f2e]/60'
                    }`}
                  >
                    <span className="text-[10px] uppercase tracking-wider font-cinzel opacity-75">{item.dayName}</span>
                    <span className="text-lg font-bold font-gothic-title my-0.5">{item.dayNumber}</span>
                    <span className="text-[10px] opacity-80">{item.monthName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Choose Time Slot & Timezone */}
          <div className="bg-gradient-to-b from-[#1b0614]/90 via-[#0e0419]/90 to-[#07020e]/95 border-2 border-[#d4af37]/40 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-2 left-4 text-[#d4af37]/50 text-sm">❖</div>
            <div className="absolute top-2 right-4 text-[#d4af37]/50 text-sm">❖</div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <label className="text-sm font-cinzel font-bold uppercase tracking-wider text-[#fef08a] flex items-center gap-2">
                <Clock size={16} className="text-[#d4af37]" /> 2. Select Consecrated Time Slot
              </label>

              {/* Timezone Selector */}
              <div className="flex items-center gap-2 bg-black/60 px-3.5 py-1.5 rounded-xl border border-[#d4af37]/30 text-xs">
                <Globe size={14} className="text-[#d4af37]" />
                <span className="text-[#c4b5fd] font-cinzel">Timezone:</span>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="bg-transparent text-[#fef08a] font-medium focus:outline-none cursor-pointer"
                >
                  <option value={timezone} className="bg-[#16112a] text-[#eedec5]">{timezone} (Detected)</option>
                  <option value="Asia/Kolkata" className="bg-[#16112a] text-[#eedec5]">Asia/Kolkata (IST)</option>
                  <option value="America/New_York" className="bg-[#16112a] text-[#eedec5]">America/New York (EST)</option>
                  <option value="America/Los_Angeles" className="bg-[#16112a] text-[#eedec5]">America/Los Angeles (PST)</option>
                  <option value="Europe/London" className="bg-[#16112a] text-[#eedec5]">Europe/London (GMT)</option>
                  <option value="Europe/Paris" className="bg-[#16112a] text-[#eedec5]">Europe/Paris (CET)</option>
                  <option value="Asia/Dubai" className="bg-[#16112a] text-[#eedec5]">Asia/Dubai (GST)</option>
                  <option value="Australia/Sydney" className="bg-[#16112a] text-[#eedec5]">Australia/Sydney (AEST)</option>
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
                        ? 'bg-gradient-to-r from-[#7f1d1d]/80 to-[#b45309]/80 border-[#d4af37] text-[#fef08a] shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                        : 'bg-black/40 border-[#d4af37]/20 text-[#eedec5] hover:border-[#d4af37]/50 hover:bg-black/60'
                    }`}
                  >
                    <span>{time}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Focus Area with Clear Pricing */}
          <div className="bg-gradient-to-b from-[#1b0614]/90 via-[#0e0419]/90 to-[#07020e]/95 border-2 border-[#d4af37]/40 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-2 left-4 text-[#d4af37]/50 text-sm">❖</div>
            <div className="absolute top-2 right-4 text-[#d4af37]/50 text-sm">❖</div>

            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-cinzel font-bold uppercase tracking-wider text-[#fef08a] flex items-center gap-2">
                <Compass size={16} className="text-[#d4af37]" /> 3. Reading Focus & Sacred Offering
              </label>
              <span className="text-xs text-[#d4af37] font-cinzel font-semibold">Prices Set by Sanctum</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              {FOCUS_AREAS.map((f) => {
                const isSelected = focusArea === f.id;
                const IconComp = f.icon;
                return (
                  <div
                    key={f.id}
                    onClick={() => setFocusArea(f.id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-4 relative overflow-hidden ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#4c0519]/70 to-[#1f062b]/80 border-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.35)]'
                        : 'bg-black/50 border-[#d4af37]/25 hover:border-[#d4af37]/50 hover:bg-black/70'
                    }`}
                  >
                    <div className={`p-3 rounded-xl bg-black/70 border border-[#d4af37]/40 ${f.color} shrink-0`}>
                      <IconComp size={22} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-cinzel font-bold text-sm text-[#fef08a]">{f.label}</h4>
                        <span className="px-3 py-1 rounded-full text-xs font-cinzel font-bold bg-gradient-to-r from-[#7f1d1d] to-[#b45309] text-[#fef08a] border border-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.4)] shrink-0">
                          ₹{f.price}
                        </span>
                      </div>
                      <p className="text-xs text-[#c4b5fd]/90 font-serif leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#d4af37] font-cinzel font-medium mb-1.5">
                Personal Intention or Questions for Reader Vedant & Anvii (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What burning question or transition is occupying your mind? The reader will attune to this intention during the ritual."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-[#d4af37]/30 text-[#eedec5] placeholder-[#9ca3af]/50 focus:outline-none focus:border-[#d4af37] transition text-sm resize-none font-serif leading-relaxed"
              />
            </div>
          </div>

          {/* Section 4: Seeker Identification */}
          <div className="bg-gradient-to-b from-[#1b0614]/90 via-[#0e0419]/90 to-[#07020e]/95 border-2 border-[#d4af37]/40 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-2 left-4 text-[#d4af37]/50 text-sm">❖</div>
            <div className="absolute top-2 right-4 text-[#d4af37]/50 text-sm">❖</div>

            <label className="text-sm font-cinzel font-bold uppercase tracking-wider text-[#fef08a] flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-[#d4af37]" /> 4. Seeker Details
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#d4af37] font-cinzel font-medium mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-[#d4af37]/30 text-[#fef08a] placeholder-[#9ca3af]/40 font-serif text-sm focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#d4af37] font-cinzel font-medium mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="e.g. seeker@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-[#d4af37]/30 text-[#fef08a] placeholder-[#9ca3af]/40 font-serif text-sm focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>
          </div>

          {/* Submit & Move to Step 2 Button */}
          <div className="text-center pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto px-12 py-4 rounded-2xl bg-gradient-to-r from-[#7f1d1d] via-[#581c87] to-[#b45309] hover:from-[#991b1b] hover:to-[#d97706] text-[#fef3c7] font-cinzel font-bold text-sm tracking-widest uppercase border-2 border-[#d4af37]/80 shadow-[0_0_35px_rgba(212,175,55,0.45)] transition hover:scale-105 active:scale-95 flex items-center justify-center gap-3 mx-auto group"
            >
              <span>Proceed to Consecrated Payment (₹{selectedPrice})</span>
              <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
            </button>
            <p className="text-xs text-[#c4b5fd]/70 font-cinzel mt-2 tracking-wider">
              Step 1 of 2 • Slot Reserved for 15 Minutes
            </p>
          </div>
        </form>
      )}
    </div>
  );
};
