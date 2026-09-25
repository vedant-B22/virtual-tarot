import React, { useState, useEffect } from 'react';
import type { Booking } from '../types/tarot';
import { Shield, KeyRound, Calendar, Clock, User, Mail, Compass, Check, X, AlertTriangle, ExternalLink, RefreshCw, Eye, Sparkles, Trash2 } from 'lucide-react';

interface AdminDashboardProps {
  onJoinSessionAsAdmin: (sessionId: string) => void;
}

interface EmailLog {
  id: string;
  recipient: string;
  clientName: string;
  subject: string;
  sessionLink: string;
  date: string;
  timeSlot: string;
  timestamp: string;
  html: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onJoinSessionAsAdmin }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(sessionStorage.getItem('tarot_admin_token'));
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'bookings' | 'emails'>('bookings');

  // Reschedule Modal state
  const [reschedulingBooking, setReschedulingBooking] = useState<Booking | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('04:00 PM');

  // Email Viewer Modal
  const [previewEmail, setPreviewEmail] = useState<EmailLog | null>(null);

  const adminToken = sessionStorage.getItem('tarot_admin_token') || 'tarot2026';

  const checkAuth = async () => {
    const token = sessionStorage.getItem('tarot_admin_token');
    if (!token) {
      setIsAuthenticated(false);
      return;
    }
    try {
      const res = await fetch('/api/admin/check', {
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
      const res = await fetch('/api/admin/login', {
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
        setLoginError(data.error || 'Incorrect password.');
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
      const [bookingsRes, emailsRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/emails', { headers: { 'x-admin-token': token } })
      ]);

      const bookingsData = await bookingsRes.json();
      if (bookingsData.bookings) {
        setBookings(bookingsData.bookings);
      }

      if (emailsRes.ok) {
        const emailsData = await emailsRes.json();
        if (emailsData.emails) {
          setEmailLogs(emailsData.emails);
        }
      }
    } catch (e) {
      console.error("Error fetching admin data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: 'confirmed' | 'rescheduled' | 'cancelled' | 'completed') => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
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
    if (!confirm('Are you sure you want to remove this booking?')) return;
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
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
      const res = await fetch(`/api/bookings/${reschedulingBooking.id}`, {
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

  /* ================= PASSWORD LOGIN FORM ================= */
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-[#141026] border border-purple-500/40 rounded-3xl p-8 shadow-2xl shadow-purple-950/70 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center mx-auto mb-4">
            <Shield size={32} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-amber-200 mb-1">
            Reader Sanctuary Login
          </h2>
          <p className="text-xs text-purple-400 mb-6">
            Enter the Tarot Admin secret password to access session management.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Admin Password (default: tarot2026)"
                  className="w-full px-4 py-3 pl-10 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-100 placeholder-purple-500/50 text-sm focus:outline-none focus:border-amber-400 transition"
                />
                <KeyRound size={16} className="absolute left-3.5 top-3.5 text-purple-400" />
              </div>
              {loginError && (
                <p className="text-rose-400 text-xs text-left mt-2 flex items-center gap-1">
                  <AlertTriangle size={13} /> {loginError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-purple-600 to-amber-600 text-white font-semibold text-sm tracking-wide shadow-lg shadow-amber-500/20 hover:brightness-110 transition disabled:opacity-50"
            >
              {isLoggingIn ? 'Verifying...' : 'Unlock Reader Sanctuary'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-purple-500/20 text-[11px] text-purple-400/80">
            Default test password: <code className="text-amber-300 bg-purple-950/60 px-1.5 py-0.5 rounded">tarot2026</code> (configured in <code className="text-purple-300">.env</code>)
          </div>
        </div>
      </div>
    );
  }

  /* ================= AUTHENTICATED DASHBOARD ================= */
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-purple-500/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium uppercase tracking-wider mb-1">
            <Sparkles size={13} />
            <span>Tarot Master Console</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-amber-100">
            Reader Management Dashboard
          </h1>
          <p className="text-xs text-purple-400">
            Monitor client bookings, enter live reading rooms, accept or reschedule sessions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-purple-900/40 hover:bg-purple-900/70 text-purple-200 border border-purple-500/30 transition text-xs flex items-center gap-1.5"
            title="Refresh bookings"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-600/30 transition text-xs font-medium"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-[#141026] border border-purple-500/30 flex items-center justify-between">
          <div>
            <div className="text-xs text-purple-400 uppercase tracking-wider font-medium">Total Bookings</div>
            <div className="text-2xl font-bold font-serif text-amber-200 mt-1">{bookings.length}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Calendar size={22} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#141026] border border-purple-500/30 flex items-center justify-between">
          <div>
            <div className="text-xs text-purple-400 uppercase tracking-wider font-medium">Upcoming Sessions</div>
            <div className="text-2xl font-bold font-serif text-emerald-300 mt-1">
              {bookings.filter(b => b.status === 'confirmed' || b.status === 'rescheduled').length}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sparkles size={22} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#141026] border border-purple-500/30 flex items-center justify-between">
          <div>
            <div className="text-xs text-purple-400 uppercase tracking-wider font-medium">Email Dispatch Logs</div>
            <div className="text-2xl font-bold font-serif text-purple-200 mt-1">{emailLogs.length}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Mail size={22} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-purple-500/20 pb-2">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition flex items-center gap-2 ${
            activeTab === 'bookings'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-purple-400 hover:text-purple-200'
          }`}
        >
          <Calendar size={14} /> Bookings ({bookings.length})
        </button>

        <button
          onClick={() => setActiveTab('emails')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition flex items-center gap-2 ${
            activeTab === 'emails'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-purple-400 hover:text-purple-200'
          }`}
        >
          <Mail size={14} /> Sent Email Notifications ({emailLogs.length})
        </button>
      </div>

      {/* Tab 1: Bookings List */}
      {activeTab === 'bookings' && (
        <div className="space-y-3">
          {bookings.length === 0 ? (
            <div className="text-center py-12 bg-[#141026] rounded-2xl border border-purple-500/20 text-purple-400">
              No bookings yet. Clients can book through the public booking calendar.
            </div>
          ) : (
            bookings.map((b) => (
              <div
                key={b.id}
                className="p-5 rounded-2xl bg-[#141026] border border-purple-500/30 hover:border-purple-400/50 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-serif font-bold text-base text-amber-200 flex items-center gap-1.5">
                      <User size={15} className="text-amber-400" /> {b.clientName}
                    </span>
                    <span className="text-xs text-purple-400 flex items-center gap-1">
                      <Mail size={13} /> {b.clientEmail}
                    </span>
                    <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border ${
                      b.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                      b.status === 'rescheduled' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                      b.status === 'completed' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' :
                      'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}>
                      {b.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-purple-300/90 pt-1">
                    <span className="flex items-center gap-1 font-medium text-purple-100">
                      <Calendar size={13} className="text-amber-400" /> {b.date}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-purple-100">
                      <Clock size={13} className="text-amber-400" /> {b.timeSlot}
                    </span>
                    <span className="text-purple-400 text-[11px]">({b.timezone})</span>
                    <span className="flex items-center gap-1 text-amber-300 font-medium bg-purple-950/50 px-2 py-0.5 rounded border border-purple-500/30">
                      <Compass size={12} /> {b.focus}
                    </span>
                  </div>

                  {b.notes && (
                    <p className="text-xs text-purple-400/80 italic pt-1 line-clamp-2">
                      &quot;{b.notes}&quot;
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-purple-500/20">
                  <button
                    onClick={() => onJoinSessionAsAdmin(b.sessionId)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-semibold text-xs tracking-wider uppercase shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition"
                  >
                    <Sparkles size={14} />
                    <span>Join as Reader 🔮</span>
                  </button>

                  <button
                    onClick={() => {
                      setReschedulingBooking(b);
                      setNewDate(b.date);
                      setNewTime(b.timeSlot);
                    }}
                    className="px-3 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 border border-purple-500/30 text-xs transition"
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
                    className="p-2 rounded-xl bg-purple-950/40 hover:bg-rose-950/60 text-purple-400 hover:text-rose-300 border border-purple-500/20 text-xs transition"
                    title="Delete Record"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Email Logs Viewer */}
      {activeTab === 'emails' && (
        <div className="space-y-3">
          {emailLogs.length === 0 ? (
            <div className="text-center py-12 bg-[#141026] rounded-2xl border border-purple-500/20 text-purple-400">
              No email dispatches recorded yet. Books will appear here.
            </div>
          ) : (
            emailLogs.map((e) => (
              <div
                key={e.id}
                className="p-4 rounded-2xl bg-[#141026] border border-purple-500/30 flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="font-semibold text-sm text-purple-100 flex items-center gap-2">
                    <Mail size={15} className="text-amber-400" />
                    <span>To: {e.clientName} ({e.recipient})</span>
                  </div>
                  <div className="text-xs text-purple-300">{e.subject}</div>
                  <div className="text-[11px] text-purple-400/80 font-mono">
                    Session Link: {e.sessionLink}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewEmail(e)}
                    className="px-3 py-1.5 rounded-lg bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 border border-purple-500/30 text-xs flex items-center gap-1.5 transition"
                  >
                    <Eye size={13} />
                    <span>Preview HTML</span>
                  </button>
                  <a
                    href={e.sessionLink}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 transition hover:bg-amber-500/30"
                    title="Open Room Directly"
                  >
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reschedule Modal */}
      {reschedulingBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181329] border border-purple-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-serif font-bold text-amber-200 mb-1">
              Reschedule Reading Slot
            </h3>
            <p className="text-xs text-purple-300 mb-4">
              Updating session for <strong>{reschedulingBooking.clientName}</strong>
            </p>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-purple-300 mb-1">New Date</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-100 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-purple-300 mb-1">New Time Slot</label>
                <input
                  type="text"
                  required
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  placeholder="e.g. 05:00 PM"
                  className="w-full px-3 py-2 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-100 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setReschedulingBooking(null)}
                  className="px-4 py-2 rounded-xl bg-purple-950/60 text-purple-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 text-purple-950 font-bold text-xs"
                >
                  Save Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email Preview Modal */}
      {previewEmail && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#120e22] border border-amber-500/40 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-purple-500/20">
              <div>
                <h3 className="font-serif font-bold text-amber-200 text-base">
                  Confirmation Email Preview
                </h3>
                <span className="text-xs text-purple-400">Recipient: {previewEmail.recipient}</span>
              </div>
              <button
                onClick={() => setPreviewEmail(null)}
                className="p-1.5 rounded-lg bg-purple-950/60 text-purple-300 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto rounded-xl bg-black/50 p-2 border border-purple-500/20">
              <iframe
                title="Email Preview"
                srcDoc={previewEmail.html}
                className="w-full h-[450px] rounded-lg border-0 bg-[#0b0914]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
