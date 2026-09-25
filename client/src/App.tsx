import { useState, useEffect } from 'react';
import { BookingCalendar } from './components/BookingCalendar';
import { AdminDashboard } from './components/AdminDashboard';
import { LiveSession } from './components/LiveSession';
import { Sparkles, Calendar, Shield, Moon } from 'lucide-react';

export function App() {
  const [activeView, setActiveView] = useState<'booking' | 'admin' | 'session'>('booking');
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [sessionRole, setSessionRole] = useState<'admin' | 'client'>('client');
  const [userName, setUserName] = useState<string>('Seeker');

  // Check URL pathname or query parameters for direct session access e.g. /session/:sessionId
  useEffect(() => {
    const handleUrlRouting = () => {
      const path = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      const querySession = searchParams.get('session');
      const queryRole = searchParams.get('role');

      if (path.startsWith('/session/')) {
        const idFromPath = path.replace('/session/', '').split('/')[0];
        if (idFromPath) {
          setCurrentSessionId(idFromPath);
          setSessionRole(queryRole === 'admin' ? 'admin' : 'client');
          setActiveView('session');
          return;
        }
      }

      if (querySession) {
        setCurrentSessionId(querySession);
        setSessionRole(queryRole === 'admin' ? 'admin' : 'client');
        setActiveView('session');
      }
    };

    handleUrlRouting();
    window.addEventListener('popstate', handleUrlRouting);
    return () => window.removeEventListener('popstate', handleUrlRouting);
  }, []);

  const navigateToSession = (sessionId: string, clientName = 'Seeker', role: 'admin' | 'client' = 'client') => {
    setCurrentSessionId(sessionId);
    setUserName(clientName);
    setSessionRole(role);
    setActiveView('session');
    window.history.pushState({}, '', `/session/${sessionId}?role=${role}`);
  };

  const handleExitSession = () => {
    setActiveView('booking');
    setCurrentSessionId('');
    window.history.pushState({}, '', '/');
  };

  // If in live session mode, render full immersive session view
  if (activeView === 'session' && currentSessionId) {
    return (
      <LiveSession
        sessionId={currentSessionId}
        initialRole={sessionRole}
        userName={userName}
        onExitSession={handleExitSession}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#08070e] text-[#f1ecff] flex flex-col font-sans selection:bg-purple-500/30 selection:text-amber-200">
      {/* Mystical Background Lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-purple-900/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[140px]" />
      </div>

      {/* Main Top Header */}
      <header className="relative z-20 border-b border-purple-500/20 bg-[#0e091b]/80 backdrop-blur-md px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo */}
          <div
            onClick={() => {
              setActiveView('booking');
              window.history.pushState({}, '', '/');
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Sparkles size={20} className="text-amber-200" />
            </div>
            <div>
              <div className="font-serif font-bold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-purple-100 to-amber-200">
                LIVE TAROT
              </div>
              <div className="text-[10px] tracking-widest text-purple-400 uppercase font-medium">
                Virtual Sanctuary & Readings
              </div>
            </div>
          </div>

          {/* Navigation Pill */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-purple-950/40 border border-purple-500/20 text-xs">
            <button
              onClick={() => {
                setActiveView('booking');
                window.history.pushState({}, '', '/');
              }}
              className={`px-4 py-2 rounded-xl font-medium transition flex items-center gap-1.5 ${
                activeView === 'booking'
                  ? 'bg-amber-500 text-purple-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-purple-300 hover:text-white hover:bg-purple-900/40'
              }`}
            >
              <Calendar size={14} />
              <span>Book Reading</span>
            </button>

            <button
              onClick={() => setActiveView('admin')}
              className={`px-4 py-2 rounded-xl font-medium transition flex items-center gap-1.5 ${
                activeView === 'admin'
                  ? 'bg-amber-500 text-purple-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-purple-300 hover:text-white hover:bg-purple-900/40'
              }`}
            >
              <Shield size={14} />
              <span>Reader Dashboard</span>
            </button>

            <button
              onClick={() => navigateToSession('sanctuary-demo-session', 'Elena Vance', 'client')}
              className="px-3.5 py-2 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 border border-purple-500/30 transition flex items-center gap-1.5"
              title="Launch instant live synced test room"
            >
              <Sparkles size={13} className="text-amber-400" />
              <span>Instant Test Room</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1">
        {activeView === 'booking' && (
          <BookingCalendar
            onJoinSession={(sessionId, name) => navigateToSession(sessionId, name, 'client')}
          />
        )}

        {activeView === 'admin' && (
          <AdminDashboard
            onJoinSessionAsAdmin={(sessionId) => navigateToSession(sessionId, 'Reader', 'admin')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-purple-500/20 bg-[#0a0715] py-6 px-4 text-center text-xs text-purple-400/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Moon size={14} className="text-amber-400" />
            <span>Live Tarot Sanctuary — Real-Time Synced Virtual Arcana Readings</span>
          </div>
          <div>
            Built with React, WebSockets (Socket.io), WebRTC, Framer Motion & Tailwind CSS
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
