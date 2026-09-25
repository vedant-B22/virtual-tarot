import { useState, useEffect } from 'react';
import { BookingCalendar } from './components/BookingCalendar';
import { AdminDashboard } from './components/AdminDashboard';
import { LiveSession } from './components/LiveSession';
import { Calendar, Shield, Flame } from 'lucide-react';

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
    <div className="min-h-screen bg-[#05020a] text-[#eedec5] flex flex-col font-serif selection:bg-[#7f1d1d]/60 selection:text-[#fef08a] relative overflow-x-hidden">
      {/* Hogwarts / Vampire Gothic Cinematic Background with Embers & Mystical Fog */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Vampire Blood Crimson Haze */}
        <div className="absolute top-[-15%] left-[15%] w-[700px] h-[700px] bg-[#4c0519]/25 rounded-full blur-[160px]" />
        {/* Dark Occult Purple Fog */}
        <div className="absolute bottom-[-10%] right-[10%] w-[700px] h-[700px] bg-[#3b0764]/25 rounded-full blur-[170px]" />
        {/* Antique Gold Center Candlelight */}
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[550px] h-[550px] bg-[#d4af37]/8 rounded-full blur-[150px]" />

        {/* Ambient Floating Embers */}
        <div className="absolute top-[20%] left-[10%] w-1.5 h-1.5 rounded-full bg-amber-400/60 blur-[0.5px] animate-ember" style={{ animationDelay: '0s' }} />
        <div className="absolute top-[65%] left-[85%] w-2 h-2 rounded-full bg-rose-500/50 blur-[0.5px] animate-ember" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[80%] left-[25%] w-1.5 h-1.5 rounded-full bg-amber-300/70 blur-[0.5px] animate-ember" style={{ animationDelay: '3.5s' }} />
        <div className="absolute top-[35%] right-[20%] w-2 h-2 rounded-full bg-orange-500/50 blur-[0.5px] animate-ember" style={{ animationDelay: '1.2s' }} />
        <div className="absolute top-[50%] left-[45%] w-1 h-1 rounded-full bg-amber-200/80 blur-[0.5px] animate-ember" style={{ animationDelay: '4.5s' }} />
      </div>

      {/* Main Consecrated Top Header */}
      <header className="relative z-20 border-b border-[#c5a059]/25 bg-[#08040f]/95 backdrop-blur-2xl px-4 sm:px-8 py-4 shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Brand Identity */}
          <div
            onClick={() => {
              setActiveView('booking');
              window.history.pushState({}, '', '/');
            }}
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            {/* Wax Seal / Mystic Crest */}
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#2a0614] via-[#1a0724] to-[#07020d] border border-[#c5a059]/80 flex items-center justify-center shadow-[0_0_20px_rgba(197,160,89,0.3)] group-hover:scale-105 group-hover:shadow-[0_0_30px_rgba(197,160,89,0.5)] transition-all duration-300">
              <span className="text-xl text-[#f7eedc] drop-shadow-[0_0_8px_rgba(250,204,21,0.7)]">🜂</span>
            </div>
            <div>
              <div className="font-gothic-title font-bold text-2xl tracking-[0.1em] text-transparent bg-clip-text bg-gradient-to-r from-[#f7eedc] via-[#e5c158] to-[#c5a059] drop-shadow-[0_2px_10px_rgba(197,160,89,0.35)]">
                LIVE TAROT
              </div>
              <div className="text-[10.5px] tracking-[0.25em] text-[#baa890] uppercase font-cinzel font-medium">
                The Mystic Arcana Sanctuary
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#090510]/80 border border-[#c5a059]/20 shadow-inner">
            <button
              onClick={() => {
                setActiveView('booking');
                window.history.pushState({}, '', '/');
              }}
              className={`px-5 py-2 rounded-xl font-cinzel font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
                activeView === 'booking'
                  ? 'bg-gradient-to-r from-[#2f0714] via-[#4d1024] to-[#1c0827] text-[#f7eedc] border border-[#c5a059]/60 shadow-[0_0_15px_rgba(197,160,89,0.3)]'
                  : 'text-[#baa890] hover:text-[#f7eedc] hover:bg-black/40'
              }`}
            >
              <Calendar size={13} />
              <span>Book Sacred Reading</span>
            </button>

            <button
              onClick={() => setActiveView('admin')}
              className={`px-5 py-2 rounded-xl font-cinzel font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
                activeView === 'admin'
                  ? 'bg-gradient-to-r from-[#2f0714] via-[#4d1024] to-[#1c0827] text-[#f7eedc] border border-[#c5a059]/60 shadow-[0_0_15px_rgba(197,160,89,0.3)]'
                  : 'text-[#baa890] hover:text-[#f7eedc] hover:bg-black/40'
              }`}
            >
              <Shield size={13} />
              <span>Reader Sanctum</span>
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

      {/* Gothic Mystical Footer with Founders Brand */}
      <footer className="relative z-10 border-t-2 border-[#d4af37]/40 bg-[#07010e] py-8 px-4 text-[#e2d5b8]/80 shadow-[0_-10px_35px_rgba(0,0,0,0.85)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          {/* Brand & Founders Identification */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-center md:justify-start gap-2 text-[#d4af37] font-cinzel font-bold text-base tracking-wide">
              <Flame size={16} className="text-amber-500 animate-pulse" />
              <span>The Mystic Arcana Sanctuary</span>
            </div>
            <div className="text-xs text-[#c4b5fd] font-serif leading-relaxed">
              Curated under the sacred auspices of{' '}
              <strong className="text-[#fef08a] font-cinzel">Founder Vedant Baviskar</strong> &{' '}
              <strong className="text-[#fef08a] font-cinzel">Co-Founder Anvii Panchal</strong>.
            </div>
            <p className="text-[11px] text-[#9ca3af] italic">
              Dedicated to the Hermetic mysteries, authentic 78-card Rider-Waite divination & live soul guidance.
            </p>
          </div>

          {/* Sacred Seal / Encrypted Security Notice */}
          <div className="flex flex-col items-center md:items-end text-xs text-[#d4af37]/80 font-cinzel tracking-wider space-y-1">
            <div className="flex items-center gap-1.5 text-[#fde047]">
              <span>✦</span>
              <span>All Readings Confidential, Encrypted & Live</span>
              <span>✦</span>
            </div>
            <div className="text-[10px] text-[#9ca3af] tracking-widest uppercase">
              Omnia Vincit Veritas • Est. MMXXVI
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
