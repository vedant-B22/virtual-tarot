import React, { useState, useEffect } from 'react';
import type { Booking, TarotCardData } from '../types/tarot';
import { BACKEND_URL } from '../utils/apiConfig';
import tarotDeckData from '../data/tarotDeck.json';
import {
  Shield,
  KeyRound,
  Calendar,
  Clock,
  User,
  Mail,
  Compass,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  Eye,
  Sparkles,
  Trash2,
  BookOpen,
  Image as ImageIcon,
  CheckCircle2,
  Lock,
  Search,
  ExternalLink
} from 'lucide-react';

interface AdminDashboardProps {
  onJoinSessionAsAdmin: (sessionId: string) => void;
}

const typedTarotCards = tarotDeckData as TarotCardData[];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onJoinSessionAsAdmin }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(sessionStorage.getItem('tarot_admin_token'));
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'bookings' | 'grimoire'>('bookings');

  // Payment Screenshot Modal
  const [viewingProof, setViewingProof] = useState<{ clientName: string; imgUrl: string; ref?: string } | null>(null);

  // Approving state
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Reschedule Modal state
  const [reschedulingBooking, setReschedulingBooking] = useState<Booking | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('04:00 PM');

  // Grimoire Library State
  const [grimoireSearch, setGrimoireSearch] = useState('');
  const [grimoireFilter, setGrimoireFilter] = useState<'all' | 'major' | 'wands' | 'cups' | 'swords' | 'pentacles'>('all');

  const adminToken = sessionStorage.getItem('tarot_admin_token') || 'tarot2026';

  const checkAuth = async () => {
    const token = sessionStorage.getItem('tarot_admin_token');
    if (!token) {
      setIsAuthenticated(false);
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/check`, {
        headers: { 'x-admin-token': token }
      });
      const data = await res.json();
      setIsAuthenticated(data.authenticated);
      if (data.authenticated) {
        fetchDashboardData();
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        sessionStorage.setItem('tarot_admin_token', data.token);
        setIsAuthenticated(true);
        fetchDashboardData();
      } else {
        setLoginError(data.error || 'Incorrect sanctuary key.');
      }
    } catch {
      setLoginError('Error connecting to authentication server.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('tarot_admin_token');
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem('tarot_admin_token') || 'tarot2026';
      const bookingsRes = await fetch(`${BACKEND_URL}/api/bookings`, {
        headers: { 'x-admin-token': token }
      });

      const bookingsData = await bookingsRes.json();
      if (bookingsData.bookings) {
        setBookings(bookingsData.bookings);
      }
    } catch (e) {
      console.error('Error fetching admin data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Strictly approve booking and unlock client room entry
  const handleApproveBooking = async (bookingId: string) => {
    setApprovingId(bookingId);
    try {
      const res = await fetch(`${BACKEND_URL}/api/bookings/${bookingId}/approve`, {
        method: 'PATCH',
        headers: {
          'x-admin-token': adminToken
        }
      });
      if (res.ok) {
        await fetchDashboardData();
      } else {
        alert('Could not approve booking. Please check credentials.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error approving booking.');
    } finally {
      setApprovingId(null);
    }
  };

  // Revoke approval / lock room
  const handleRevokeBooking = async (bookingId: string) => {
    if (!confirm('Lock the sanctuary chamber for this client?')) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({ isApproved: false, status: 'pending_approval' })
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: 'confirmed' | 'rescheduled' | 'cancelled' | 'completed') => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to permanently remove this booking record?')) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': adminToken }
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingBooking || !newDate || !newTime) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/bookings/${reschedulingBooking.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({
          status: 'rescheduled',
          date: newDate,
          timeSlot: newTime
        })
      });
      if (res.ok) {
        setReschedulingBooking(null);
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered Cards for Grimoire Library
  const filteredCards = typedTarotCards.filter((card) => {
    const matchesSearch =
      card.name.toLowerCase().includes(grimoireSearch.toLowerCase()) ||
      card.keywords.some((k) => k.toLowerCase().includes(grimoireSearch.toLowerCase())) ||
      card.upright.toLowerCase().includes(grimoireSearch.toLowerCase());

    if (!matchesSearch) return false;
    if (grimoireFilter === 'all') return true;
    if (grimoireFilter === 'major') return card.arcana === 'major';
    return card.suit?.toLowerCase() === grimoireFilter;
  });

  /* ================= PASSWORD LOGIN FORM ================= */
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-[#141026] border-2 border-[#d4af37]/50 rounded-3xl p-8 shadow-2xl shadow-purple-950/70 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-[#d4af37]/15 rounded-full blur-2xl pointer-events-none" />

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#9a3412] via-[#581c87] to-[#1c1917] border-2 border-[#d4af37] text-[#fef08a] flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(212,175,55,0.4)]">
            <Shield size={32} />
          </div>
          <h2 className="text-2xl font-gothic-title font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#fef08a] via-[#e2d5b8] to-[#d4af37] mb-1">
            Reader Sanctum Entry
          </h2>
          <p className="text-xs text-[#c4b5fd] font-serif mb-6">
            Enter the sacred Reader key to access client bookings, payment verifications, and room access controls.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter Reader Sanctuary Key"
                  className="w-full px-4 py-3.5 pl-10 rounded-xl bg-black/70 border border-[#d4af37]/40 text-[#fef08a] placeholder-[#9ca3af]/60 text-sm focus:outline-none focus:border-[#d4af37] transition font-serif"
                />
                <KeyRound size={16} className="absolute left-3.5 top-4 text-[#d4af37]" />
              </div>
              {loginError && (
                <p className="text-rose-400 text-xs text-left mt-2 flex items-center gap-1 font-serif">
                  <AlertTriangle size={13} /> {loginError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#9a3412] via-[#7e22ce] to-[#b45309] hover:from-[#c2410c] hover:to-[#d97706] text-[#fef3c7] font-cinzel font-bold text-xs uppercase tracking-widest border border-[#d4af37]/60 shadow-xl transition disabled:opacity-50"
            >
              {isLoggingIn ? 'Unlocking Sanctum...' : 'Enter Reader Sanctum'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ================= AUTHENTICATED DASHBOARD ================= */
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#d4af37]/30">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-[#d4af37]/40 text-[#fef08a] text-xs font-cinzel uppercase tracking-wider mb-1">
            <Sparkles size={13} className="text-[#facc15]" />
            <span>Grand Reader Master Console</span>
          </div>
          <h1 className="text-3xl font-gothic-title font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#fef08a] via-[#e2d5b8] to-[#d4af37]">
            Sanctuary Reader Dashboard
          </h1>
          <p className="text-xs text-[#c4b5fd] font-serif">
            Verify client payment screenshots, grant sanctuary room access, and access the 78-card esoteric meanings library.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-black/60 hover:bg-black/90 text-[#fef08a] border border-[#d4af37]/40 transition text-xs flex items-center gap-1.5"
            title="Refresh bookings"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-600/40 transition text-xs font-cinzel font-semibold"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-[#141026] border border-[#d4af37]/35 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-xs text-[#c4b5fd] uppercase tracking-wider font-cinzel font-semibold">Total Requests</div>
            <div className="text-2xl font-bold font-gothic-title text-[#fef08a] mt-1">{bookings.length}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-[#d4af37]/40 flex items-center justify-center text-[#fef08a]">
            <Calendar size={22} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#141026] border border-[#d4af37]/35 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-xs text-[#c4b5fd] uppercase tracking-wider font-cinzel font-semibold">Pending Payment Verification</div>
            <div className="text-2xl font-bold font-gothic-title text-amber-300 mt-1">
              {bookings.filter((b) => !b.isApproved).length}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-[#d4af37]/40 flex items-center justify-center text-amber-400">
            <Lock size={22} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#141026] border border-[#d4af37]/35 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-xs text-[#c4b5fd] uppercase tracking-wider font-cinzel font-semibold">Sanctuary Rooms Approved</div>
            <div className="text-2xl font-bold font-gothic-title text-emerald-300 mt-1">
              {bookings.filter((b) => b.isApproved).length}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <CheckCircle2 size={22} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[#d4af37]/30 pb-2">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2.5 rounded-xl text-xs font-cinzel font-bold tracking-wider uppercase transition flex items-center gap-2 ${
            activeTab === 'bookings'
              ? 'bg-gradient-to-r from-[#b45309] to-[#d97706] text-black shadow-md'
              : 'text-[#e2d5b8] hover:text-[#fef08a]'
          }`}
        >
          <Calendar size={14} /> Bookings & Payment Approvals ({bookings.length})
        </button>

        <button
          onClick={() => setActiveTab('grimoire')}
          className={`px-4 py-2.5 rounded-xl text-xs font-cinzel font-bold tracking-wider uppercase transition flex items-center gap-2 ${
            activeTab === 'grimoire'
              ? 'bg-gradient-to-r from-[#b45309] to-[#d97706] text-black shadow-md'
              : 'text-[#e2d5b8] hover:text-[#fef08a]'
          }`}
        >
          <BookOpen size={14} /> Arcana Grimoire & Meanings Library (78 Cards)
        </button>
      </div>

      {/* Tab 1: Bookings List with Payment Screenshots & Approval Gate */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="text-center py-12 bg-[#141026] rounded-2xl border border-[#d4af37]/30 text-[#c4b5fd] font-serif">
              No seeker bookings recorded yet. New requests will appear here with their payment verification screenshot.
            </div>
          ) : (
            bookings.map((b) => {
              const isApproved = Boolean(b.isApproved);

              return (
                <div
                  key={b.id}
                  className={`p-5 rounded-2xl bg-[#141026] border transition flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-xl ${
                    isApproved
                      ? 'border-emerald-500/40 hover:border-emerald-500/60'
                      : 'border-[#d4af37]/60 bg-gradient-to-r from-[#170e28] to-[#120a1f] hover:border-[#d4af37]'
                  }`}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-gothic-title font-bold text-lg text-[#fef08a] flex items-center gap-1.5">
                        <User size={16} className="text-[#d4af37]" /> {b.clientName}
                      </span>
                      <span className="text-xs text-[#c4b5fd] flex items-center gap-1">
                        <Mail size={13} /> {b.clientEmail}
                      </span>

                      {/* Approval Status Badge */}
                      <span
                        className={`text-[11px] font-cinzel uppercase tracking-wider font-bold px-3 py-1 rounded-full border flex items-center gap-1 ${
                          isApproved
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)] animate-pulse'
                        }`}
                      >
                        {isApproved ? (
                          <>
                            <CheckCircle2 size={12} /> Sanctuary Entry Approved
                          </>
                        ) : (
                          <>
                            <Lock size={12} /> Awaiting Reader Approval
                          </>
                        )}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#e2d5b8] pt-1">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar size={13} className="text-[#d4af37]" /> {b.date}
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <Clock size={13} className="text-[#d4af37]" /> {b.timeSlot}
                      </span>
                      <span className="text-[#9ca3af] text-[11px]">({b.timezone})</span>
                      <span className="flex items-center gap-1 text-[#fef08a] font-cinzel font-semibold bg-purple-950/60 px-2.5 py-0.5 rounded-lg border border-[#d4af37]/30">
                        <Compass size={12} className="text-[#d4af37]" /> {b.focus}
                      </span>
                    </div>

                    {/* Payment Screenshot & Transaction Ref Section */}
                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      {b.paymentScreenshot ? (
                        <button
                          onClick={() =>
                            setViewingProof({
                              clientName: b.clientName,
                              imgUrl: b.paymentScreenshot!,
                              ref: b.transactionRef
                            })
                          }
                          className="px-3 py-1.5 rounded-xl bg-purple-900/50 hover:bg-purple-800 text-[#fef08a] border border-[#d4af37]/40 text-xs font-cinzel flex items-center gap-2 transition shadow"
                        >
                          <ImageIcon size={14} className="text-[#d4af37]" />
                          <span>View Payment Screenshot (Proof)</span>
                          <Eye size={12} />
                        </button>
                      ) : (
                        <span className="text-xs text-[#9ca3af] italic">
                          No payment screenshot uploaded
                        </span>
                      )}

                      {b.transactionRef && (
                        <span className="text-xs font-mono bg-black/60 px-2.5 py-1 rounded-lg border border-[#d4af37]/30 text-[#fde047]">
                          UTR/Ref: <strong>{b.transactionRef}</strong>
                        </span>
                      )}
                    </div>

                    {b.notes && (
                      <p className="text-xs text-[#eedec5]/80 italic pt-1 line-clamp-2">
                        &quot;{b.notes}&quot;
                      </p>
                    )}
                  </div>

                  {/* Actions & Strict Approval Gate Button */}
                  <div className="flex flex-wrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#d4af37]/20">
                    {/* Golden Approval Button */}
                    {!isApproved ? (
                      <button
                        onClick={() => handleApproveBooking(b.id)}
                        disabled={approvingId === b.id}
                        className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:brightness-110 text-purple-950 font-cinzel font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center gap-2 transition disabled:opacity-50"
                      >
                        <KeyRound size={15} />
                        <span>{approvingId === b.id ? 'Unlocking...' : 'Approve & Unlock Room 🔑'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRevokeBooking(b.id)}
                        className="px-3 py-2 rounded-xl bg-purple-950/60 hover:bg-rose-950/60 text-purple-300 hover:text-rose-300 border border-purple-500/30 text-xs transition"
                        title="Revoke entry & re-lock room"
                      >
                        Lock Gate
                      </button>
                    )}

                    <button
                      onClick={() => onJoinSessionAsAdmin(b.sessionId)}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#9a3412] to-[#7e22ce] hover:brightness-110 text-[#fef08a] font-cinzel font-bold text-xs tracking-wider uppercase shadow-md flex items-center gap-1.5 transition border border-[#d4af37]/40"
                    >
                      <Sparkles size={14} />
                      <span>Enter as Reader 🔮</span>
                    </button>

                    <button
                      onClick={() => {
                        setReschedulingBooking(b);
                        setNewDate(b.date);
                        setNewTime(b.timeSlot);
                      }}
                      className="px-3 py-2 rounded-xl bg-black/60 hover:bg-black/90 text-[#eedec5] border border-[#d4af37]/30 text-xs font-cinzel transition"
                    >
                      Reschedule
                    </button>

                    {b.status !== 'cancelled' ? (
                      <button
                        onClick={() => updateBookingStatus(b.id, 'cancelled')}
                        className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs transition"
                        title="Cancel Booking"
                      >
                        <X size={14} />
                      </button>
                    ) : (
                      <button
                        onClick={() => updateBookingStatus(b.id, 'confirmed')}
                        className="p-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 text-xs transition"
                        title="Reactivate Booking"
                      >
                        <Check size={14} />
                      </button>
                    )}

                    <button
                      onClick={() => deleteBooking(b.id)}
                      className="p-2 rounded-xl bg-black/60 hover:bg-rose-950/60 text-[#c4b5fd] hover:text-rose-300 border border-purple-500/20 text-xs transition"
                      title="Delete Record"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Arcana Grimoire & Meanings Library (78 Cards for Reader) */}
      {activeTab === 'grimoire' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="p-4 rounded-2xl bg-[#141026] border border-[#d4af37]/35 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                value={grimoireSearch}
                onChange={(e) => setGrimoireSearch(e.target.value)}
                placeholder="Search card name, keyword or meaning..."
                className="w-full px-4 py-2.5 pl-10 rounded-xl bg-black/60 border border-[#d4af37]/40 text-[#fef08a] placeholder-[#9ca3af]/60 text-xs focus:outline-none focus:border-[#d4af37] font-serif"
              />
              <Search size={14} className="absolute left-3.5 top-3 text-[#d4af37]" />
            </div>

            <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
              {(['all', 'major', 'wands', 'cups', 'swords', 'pentacles'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setGrimoireFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-cinzel font-semibold uppercase tracking-wider transition ${
                    grimoireFilter === filter
                      ? 'bg-[#d4af37] text-black font-bold shadow'
                      : 'bg-black/50 text-[#c4b5fd] hover:bg-purple-950/60 border border-[#d4af37]/20'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Grimoire Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCards.map((card) => (
              <div
                key={card.id}
                className="p-4 rounded-2xl bg-[#141026] border border-[#d4af37]/30 hover:border-[#d4af37] transition flex gap-4 shadow-lg"
              >
                {/* Authentic Card Image */}
                <div className="w-20 h-32 rounded-lg overflow-hidden border border-[#d4af37]/50 shrink-0 bg-black/60 shadow">
                  <img
                    src={card.image}
                    alt={card.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="flex-1 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-gothic-title font-bold text-sm text-[#fef08a]">
                      {card.name}
                    </span>
                    <span className="text-[10px] uppercase font-cinzel text-[#d4af37] px-1.5 py-0.5 rounded bg-black/60 border border-[#d4af37]/30">
                      {card.arcana}
                    </span>
                  </div>

                  <div className="text-[11px] text-amber-300 font-medium">
                    Keywords: {card.keywords.slice(0, 3).join(', ')}
                  </div>

                  <div className="pt-1 space-y-1 text-[#eedec5]/90 font-serif leading-relaxed">
                    <p className="line-clamp-2">
                      <strong className="text-emerald-400">Upright:</strong> {card.upright}
                    </p>
                    <p className="line-clamp-2">
                      <strong className="text-rose-400">Reversed:</strong> {card.reversed}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Screenshot Modal */}
      {viewingProof && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141026] border-2 border-[#d4af37] rounded-3xl p-6 max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#d4af37]/30">
              <div>
                <h3 className="font-gothic-title font-bold text-[#fef08a] text-lg">
                  Payment Verification Screenshot
                </h3>
                <p className="text-xs text-[#c4b5fd]">
                  Submitted by: <strong>{viewingProof.clientName}</strong>
                  {viewingProof.ref && ` • Ref: ${viewingProof.ref}`}
                </p>
              </div>
              <button
                onClick={() => setViewingProof(null)}
                className="p-1.5 rounded-lg bg-black/60 text-[#eedec5] hover:text-white border border-[#d4af37]/30"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-auto rounded-xl bg-black/60 p-2 border border-[#d4af37]/20 flex items-center justify-center">
              <img
                src={viewingProof.imgUrl}
                alt="Payment proof screenshot"
                className="max-h-[60vh] max-w-full rounded-lg object-contain"
              />
            </div>

            <div className="flex justify-between items-center pt-4 mt-3 border-t border-[#d4af37]/30">
              <a
                href={viewingProof.imgUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#fef08a] hover:underline flex items-center gap-1 font-cinzel"
              >
                <ExternalLink size={13} /> Open Image in New Tab
              </a>

              <button
                onClick={() => setViewingProof(null)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#b45309] to-[#d97706] text-black font-cinzel font-bold text-xs"
              >
                Done Reviewing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {reschedulingBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181329] border border-[#d4af37]/40 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-gothic-title font-bold text-[#fef08a] mb-1">
              Reschedule Reading Slot
            </h3>
            <p className="text-xs text-[#c4b5fd] mb-4">
              Updating session for <strong>{reschedulingBooking.clientName}</strong>
            </p>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-[#c4b5fd] mb-1 font-cinzel">New Date</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-[#d4af37]/30 text-[#fef08a] text-sm focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-[#c4b5fd] mb-1 font-cinzel">New Time Slot</label>
                <input
                  type="text"
                  required
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  placeholder="e.g. 05:00 PM"
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-[#d4af37]/30 text-[#fef08a] text-sm focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setReschedulingBooking(null)}
                  className="px-4 py-2 rounded-xl bg-black/60 text-[#c4b5fd] text-xs font-cinzel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#b45309] to-[#d97706] text-black font-cinzel font-bold text-xs"
                >
                  Save Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
