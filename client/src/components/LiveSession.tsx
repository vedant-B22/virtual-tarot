import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { SessionState, CardCategory, TarotCardData } from '../types/tarot';
import { TarotCard } from './TarotCard';
import { DeckShuffleAnimation } from './DeckShuffleAnimation';
import { VideoRoom } from './VideoRoom';
import { audioEngine } from '../utils/audio';
import { BACKEND_URL } from '../utils/apiConfig';
import tarotDeckData from '../data/tarotDeck.json';
import {
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Shield,
  Eye,
  Download,
  Share2,
  ArrowRight,
  Flame,
  Heart,
  Briefcase,
  Compass
} from 'lucide-react';

interface LiveSessionProps {
  sessionId: string;
  initialRole?: 'admin' | 'client';
  userName?: string;
  onExitSession?: () => void;
}

const typedTarotCards = tarotDeckData as TarotCardData[];

export const LiveSession: React.FC<LiveSessionProps> = ({
  sessionId,
  initialRole = 'client',
  userName = 'Seeker',
  onExitSession
}) => {
  const [role, setRole] = useState<'admin' | 'client'>(initialRole);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [session, setSession] = useState<SessionState | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [systemAlert, setSystemAlert] = useState<string | null>(null);
  const [localNotes, setLocalNotes] = useState({
    life: '',
    love: '',
    career: '',
    summary: ''
  });
  const [activeNoteTab, setActiveNoteTab] = useState<'life' | 'love' | 'career' | 'summary'>('life');

  // Breathing circle state for Step 1
  const [breathingText, setBreathingText] = useState('Inhale peace...');

  // Setup Socket Connection
  useEffect(() => {
    const s = io(BACKEND_URL || undefined, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10
    });

    s.on('connect', () => {
      console.log('Socket connected:', s.id);
      s.emit('join_session', {
        sessionId,
        role,
        name: role === 'admin' ? 'Reader (Admin)' : userName
      });
    });

    s.on('session_state', (state: SessionState) => {
      setSession(state);
      setLocalNotes(state.adminNotes || { life: '', love: '', career: '', summary: '' });
    });

    s.on('system_message', ({ text }: { text: string }) => {
      setSystemAlert(text);
      setTimeout(() => setSystemAlert(null), 4000);
    });

    s.on('shuffle_started', () => {
      audioEngine.playShuffle();
    });

    s.on('card_selected', () => {
      audioEngine.playChime(587);
    });

    s.on('card_revealed', () => {
      audioEngine.playFlip();
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#facc15', '#a855f7', '#ec4899', '#38bdf8']
      });
    });

    s.on('notes_updated', ({ field, text }: { field: 'life' | 'love' | 'career' | 'summary'; text: string }) => {
      setLocalNotes((prev) => ({ ...prev, [field]: text }));
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [sessionId, role, userName]);

  // Breathing cycle animation timer for Step 1
  useEffect(() => {
    if (session?.currentStep === 1) {
      const interval = setInterval(() => {
        setBreathingText((prev) => {
          if (prev.includes('Inhale')) return 'Hold still...';
          if (prev.includes('Hold')) return 'Exhale surrender...';
          return 'Inhale peace...';
        });
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [session?.currentStep]);

  // Helper to find card details from json dataset
  const getCardDetails = (cardId: string) => {
    return typedTarotCards.find((c) => c.id === cardId) || null;
  };

  // Sound toggle
  const toggleSound = () => {
    const newState = audioEngine.toggleAmbient();
    setIsAudioPlaying(newState);
  };

  // Actions
  const handleToggleReady = () => {
    const isReady = role === 'admin' ? !session?.adminReady : !session?.clientReady;
    socket?.emit('set_ready', { isReady });
    audioEngine.playChime(440);
  };

  const handleTriggerShuffle = () => {
    socket?.emit('trigger_shuffle');
  };

  const handleSelectCard = (index: number) => {
    if (session?.currentStep !== 4) return;
    if ((session.selectedCards?.length || 0) >= 3) return;
    socket?.emit('select_card', { cardIndex: index });
  };

  const handleRevealCard = (category: CardCategory) => {
    socket?.emit('reveal_card', { category });
  };

  const handleRevealAll = () => {
    socket?.emit('reveal_all_cards');
  };

  const handleAdvanceStep = (targetStep: number) => {
    socket?.emit('set_step', { step: targetStep });
    if (targetStep === 7) {
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#facc15', '#a855f7', '#ec4899', '#10b981']
      });
    }
  };

  const handleResetRitual = () => {
    if (confirm('Reset the sacred ritual back to the beginning?')) {
      socket?.emit('reset_ritual');
    }
  };

  // Sync admin notes typing
  const handleNotesChange = (field: 'life' | 'love' | 'career' | 'summary', text: string) => {
    setLocalNotes((prev) => ({ ...prev, [field]: text }));
    socket?.emit('update_notes', { field, text });
  };

  // Quick insert keywords for reader
  const handleInsertKeywords = (cardData: TarotCardData | null, field: 'life' | 'love' | 'career') => {
    if (!cardData) return;
    const addition = `\n[Keywords: ${cardData.keywords.join(', ')}]\nCore insight: ${cardData.upright}`;
    const updated = (localNotes[field] || '') + addition;
    handleNotesChange(field, updated);
  };

  const currentStep = session?.currentStep || 1;
  const otherParticipantOnline = role === 'admin'
    ? Boolean(session?.participants?.client?.online)
    : Boolean(session?.participants?.admin?.online);

  return (
    <div className="min-h-screen bg-[#080611] text-purple-100 flex flex-col relative select-none overflow-x-hidden">
      {/* Mystical Background Stars & Ambient Aura */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/15 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute inset-0 bg-[radial-gradient(#a855f7_0.6px,transparent_0.6px)] [background-size:24px_24px] opacity-15" />
      </div>

      {/* ================= TOP NAVIGATION / STATUS BAR ================= */}
      <header className="relative z-20 border-b border-purple-500/20 bg-[#0d091a]/80 backdrop-blur-md px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Sanctuary Brand & Focus */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Sparkles size={18} className="text-amber-200 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-amber-200 tracking-wide text-base">
                  Live Tarot Sanctuary
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-900/60 border border-purple-500/30 text-purple-300">
                  Room: {sessionId.slice(0, 12)}
                </span>
              </div>
              <div className="text-xs text-purple-400">
                Seeker: <strong className="text-purple-200">{session?.clientName || userName}</strong> • Focus: <span className="text-amber-300 font-medium">{session?.readingFocus}</span>
              </div>
            </div>
          </div>

          {/* Stepper Bar (1 to 7) */}
          <div className="hidden lg:flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full border border-purple-500/20 text-xs">
            {['Connect', 'Shuffle', 'Spread', 'Select', 'Reveal', 'Interpret', 'Summary'].map((stepName, i) => {
              const stepNumber = i + 1;
              const isPast = currentStep > stepNumber;
              const isCurrent = currentStep === stepNumber;

              return (
                <div key={stepName} className="flex items-center">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition ${
                      isCurrent
                        ? 'bg-amber-500 text-purple-950 font-bold shadow-md shadow-amber-500/30'
                        : isPast
                        ? 'bg-purple-900/40 text-purple-300'
                        : 'text-purple-500 opacity-60'
                    }`}
                  >
                    {stepNumber}. {stepName}
                  </span>
                  {i < 6 && <ChevronRight size={12} className="text-purple-600 mx-0.5" />}
                </div>
              );
            })}
          </div>

          {/* Controls: Audio, Presence, Role Toggle & Exit */}
          <div className="flex items-center gap-2">
            {/* Ambient Sound Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition ${
                isAudioPlaying
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-purple-950/40 text-purple-400 border-purple-500/20 hover:text-purple-200'
              }`}
              title={isAudioPlaying ? 'Mute Ambient Music' : 'Play Mystical Ambient Music'}
            >
              {isAudioPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span className="hidden sm:inline">{isAudioPlaying ? 'Ambient On' : 'Ambient Off'}</span>
            </button>

            {/* Presence indicators */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-950/50 border border-purple-500/20 text-xs">
              <span className={`w-2 h-2 rounded-full ${session?.participants?.admin?.online ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-[11px] text-purple-300">Reader</span>
              <span className="text-purple-600">|</span>
              <span className={`w-2 h-2 rounded-full ${session?.participants?.client?.online ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-[11px] text-purple-300">Seeker</span>
            </div>

            {/* Test Role Switcher */}
            <button
              onClick={() => {
                const nextRole = role === 'admin' ? 'client' : 'admin';
                setRole(nextRole);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 text-purple-300 border border-purple-500/30 text-xs font-medium transition"
              title="Switch role for demo testing"
            >
              View: <strong className="text-amber-300">{role === 'admin' ? 'Reader' : 'Seeker'}</strong>
            </button>

            {onExitSession && (
              <button
                onClick={onExitSession}
                className="px-2.5 py-1.5 rounded-xl bg-purple-950/40 hover:bg-rose-950/40 text-purple-400 hover:text-rose-300 border border-purple-500/20 text-xs transition"
              >
                Exit
              </button>
            )}
          </div>
        </div>
      </header>

      {/* System Banner notification */}
      {systemAlert && (
        <div className="relative z-30 bg-gradient-to-r from-purple-900/90 via-amber-900/90 to-purple-900/90 border-b border-amber-500/30 text-center py-2 px-4 text-xs font-medium text-amber-200 animate-pulse">
          ✨ {systemAlert}
        </div>
      )}

      {/* ================= ADMIN CONTROLS BAR (Only visible to reader) ================= */}
      {role === 'admin' && (
        <div className="relative z-20 bg-amber-950/20 border-b border-amber-500/20 px-4 py-2">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-amber-300 font-semibold uppercase tracking-wider">
              <Shield size={14} className="text-amber-400" />
              <span>Reader Master Controls:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-purple-400">Jump Step:</span>
              {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                <button
                  key={s}
                  onClick={() => handleAdvanceStep(s)}
                  className={`w-6 h-6 rounded-lg text-xs font-bold transition ${
                    currentStep === s
                      ? 'bg-amber-400 text-purple-950'
                      : 'bg-purple-950/60 text-purple-300 hover:bg-purple-800'
                  }`}
                >
                  {s}
                </button>
              ))}

              {currentStep === 5 && (
                <button
                  onClick={handleRevealAll}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-medium text-[11px] transition ml-2"
                >
                  Reveal All Cards
                </button>
              )}

              <button
                onClick={handleResetRitual}
                className="px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-600/30 font-medium text-[11px] transition ml-2 flex items-center gap-1"
              >
                <RotateCcw size={11} />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MAIN INTERACTIVE TAROT RITUAL ALTAR ================= */}
      <main className="flex-1 relative z-10 flex flex-col items-center justify-center p-4 sm:p-8 max-w-7xl mx-auto w-full">
        {/* ================= STEP 1: CONNECT ================= */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center text-center max-w-xl mx-auto py-8"
          >
            {/* Meditative Breathing Circle & Candle Motif */}
            <div className="relative w-44 h-44 sm:w-56 sm:h-56 mb-8 flex items-center justify-center">
              {/* Outer pulsing ring */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-400/40 animate-spin-slow" />
              <div className="absolute -inset-3 rounded-full bg-purple-600/10 blur-xl animate-pulse-slow" />

              {/* Breathing expanding circle */}
              <motion.div
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-purple-900/50 via-amber-500/20 to-purple-800/40 border border-amber-400/50 flex flex-col items-center justify-center shadow-2xl"
              >
                <Flame size={36} className="text-amber-400 animate-pulse mb-1 drop-shadow-[0_0_12px_rgba(250,204,21,0.8)]" />
                <span className="text-xs font-serif tracking-widest text-amber-200">
                  {breathingText}
                </span>
              </motion.div>
            </div>

            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-amber-200 mb-3">
              Step 1: Set Your Sacred Intention
            </h2>
            <p className="text-purple-300/80 text-sm sm:text-base leading-relaxed mb-6">
              Take a slow, deep breath. Release all noise of the day. Connect your awareness to your question regarding{' '}
              <strong className="text-amber-300 font-semibold">{session?.readingFocus}</strong>.
            </p>

            {/* Participant Ready Statuses */}
            <div className="flex items-center gap-6 mb-8 bg-purple-950/40 px-6 py-3 rounded-2xl border border-purple-500/30">
              <div className="flex items-center gap-2 text-xs">
                <span className={`w-3 h-3 rounded-full ${session?.clientReady ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' : 'bg-purple-700'}`} />
                <span className={session?.clientReady ? 'text-emerald-300 font-medium' : 'text-purple-400'}>
                  Seeker {session?.clientReady ? 'Centered' : 'Centering...'}
                </span>
              </div>
              <div className="h-4 w-px bg-purple-500/30" />
              <div className="flex items-center gap-2 text-xs">
                <span className={`w-3 h-3 rounded-full ${session?.adminReady ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' : 'bg-purple-700'}`} />
                <span className={session?.adminReady ? 'text-emerald-300 font-medium' : 'text-purple-400'}>
                  Reader {session?.adminReady ? 'Centered' : 'Centering...'}
                </span>
              </div>
            </div>

            {/* Ready Button */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleToggleReady}
                className={`px-8 py-4 rounded-2xl font-semibold text-sm tracking-wide transition shadow-xl flex items-center justify-center gap-2 ${
                  (role === 'admin' ? session?.adminReady : session?.clientReady)
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                    : 'bg-gradient-to-r from-amber-500 via-purple-600 to-amber-600 text-white shadow-amber-500/25 hover:brightness-110'
                }`}
              >
                <CheckCircle2 size={18} />
                <span>
                  {(role === 'admin' ? session?.adminReady : session?.clientReady)
                    ? "I am Centered & Ready ✓"
                    : "I'm Ready to Connect"}
                </span>
              </button>

              {(session?.clientReady || role === 'admin') && (
                <button
                  onClick={() => handleAdvanceStep(2)}
                  className="px-6 py-4 rounded-2xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/40 text-sm font-semibold transition flex items-center justify-center gap-2"
                >
                  <span>Begin Deck Shuffle</span>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* ================= STEP 2: SHUFFLE ================= */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto py-4"
          >
            <div className="mb-2">
              <span className="text-xs uppercase tracking-widest text-[#d4af37] font-cinzel font-bold">
                Step 2: Sacred Split & Riffle Shuffle
              </span>
              <h2 className="text-2xl sm:text-4xl font-gothic-title font-bold text-[#fef08a] mt-1 drop-shadow">
                Infuse the 78 Arcana with Your Will
              </h2>
              <p className="text-xs sm:text-sm text-[#e2d5b8]/80 mt-1 max-w-lg mx-auto font-serif">
                Watch the sacred deck divide, riffle, and interlock in real-time across both screens.
              </p>
            </div>

            {/* 3D Physics Split & Riffle Deck Shuffle Animation */}
            <DeckShuffleAnimation
              isShuffling={Boolean(session?.isShuffling)}
              onShuffleTrigger={handleTriggerShuffle}
              canTrigger={true}
            />

            {/* Proceed to Spread */}
            <div className="mt-4">
              <button
                onClick={() => handleAdvanceStep(3)}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#9a3412] to-[#b45309] hover:from-[#c2410c] hover:to-[#d97706] text-[#fef3c7] font-cinzel font-bold text-xs uppercase tracking-widest border border-[#d4af37]/60 shadow-[0_0_20px_rgba(212,175,55,0.3)] transition flex items-center gap-2 hover:scale-105"
              >
                <span>Spread the 78 Cards Across Altar</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ================= STEP 3 & STEP 4: SPREAD & SELECTION ================= */}
        {(currentStep === 3 || currentStep === 4) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full flex flex-col items-center py-2"
          >
            {/* Header info */}
            <div className="text-center mb-4">
              <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
                {currentStep === 3 ? 'Step 3: The Spread' : 'Step 4: Draw Your Trinity'}
              </span>
              <h2 className="text-xl sm:text-3xl font-serif font-bold text-amber-200 mt-1">
                {currentStep === 3
                  ? 'The 78 Cards Fanned Across the Sacred Altar'
                  : `Draw Card ${(session?.selectedCards?.length || 0) + 1} of 3: ${
                      (session?.selectedCards?.length || 0) === 0
                        ? '1st → Life (Current Path & Energy)'
                        : (session?.selectedCards?.length || 0) === 1
                        ? '2nd → Love (Heart & Sacred Connections)'
                        : '3rd → Career (Purpose & Prosperity)'
                    }`}
              </h2>
              <p className="text-xs text-purple-300/80 mt-1">
                {currentStep === 3
                  ? 'All 78 cards are spread face-down. Click proceed when ready to begin selection.'
                  : 'Click on any 3 cards from the spread below. Each card will float to its designated pedestal.'}
              </p>
            </div>

            {/* 3 Altar Pedestals (Life, Love, Career) */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 my-4 w-full max-w-2xl mx-auto">
              {(['Life', 'Love', 'Career'] as CardCategory[]).map((category, idx) => {
                const picked = session?.selectedCards?.find((c) => c.category === category);
                const cardDetails = picked ? getCardDetails(picked.cardId) : null;
                const isNextSlot = (session?.selectedCards?.length || 0) === idx && currentStep === 4;

                return (
                  <div
                    key={category}
                    className={`rounded-2xl border-2 p-2.5 sm:p-4 flex flex-col items-center justify-center transition-all duration-300 min-h-[220px] sm:min-h-[280px] ${
                      picked
                        ? category === 'Life'
                          ? 'border-emerald-500/60 bg-emerald-950/20 shadow-lg shadow-emerald-500/10'
                          : category === 'Love'
                          ? 'border-pink-500/60 bg-pink-950/20 shadow-lg shadow-pink-500/10'
                          : 'border-amber-500/60 bg-amber-950/20 shadow-lg shadow-amber-500/10'
                        : isNextSlot
                        ? 'border-amber-400 border-dashed bg-purple-950/30 animate-pulse'
                        : 'border-purple-500/20 border-dashed bg-purple-950/10'
                    }`}
                  >
                    {picked ? (
                      <TarotCard
                        card={cardDetails}
                        orientation={picked.orientation}
                        category={category}
                        isRevealed={picked.revealed}
                        size="sm"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-2">
                        <div
                          className={`w-12 h-12 rounded-full border flex items-center justify-center mb-2 ${
                            category === 'Life'
                              ? 'border-emerald-400/40 text-emerald-400 bg-emerald-500/10'
                              : category === 'Love'
                              ? 'border-pink-400/40 text-pink-400 bg-pink-500/10'
                              : 'border-amber-400/40 text-amber-400 bg-amber-500/10'
                          }`}
                        >
                          {category === 'Life' && <Compass size={20} />}
                          {category === 'Love' && <Heart size={20} />}
                          {category === 'Career' && <Briefcase size={20} />}
                        </div>
                        <span className="font-serif font-bold text-sm text-purple-200">
                          {idx + 1}. {category}
                        </span>
                        <span className="text-[10px] text-purple-400 mt-0.5">
                          {isNextSlot ? 'Waiting for pick...' : 'Empty Slot'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Advance Button from Step 3 to 4 */}
            {currentStep === 3 && (
              <div className="my-3">
                <button
                  onClick={() => handleAdvanceStep(4)}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-purple-600 to-amber-600 text-white font-semibold text-sm shadow-xl shadow-amber-500/20 flex items-center gap-2"
                >
                  <Sparkles size={16} />
                  <span>Begin 3-Card Selection Ritual</span>
                </button>
              </div>
            )}

            {/* The 78-Card Fanned Spread Canvas */}
            <div className="w-full mt-4 bg-[#0a0715]/70 border border-purple-500/30 rounded-3xl p-4 sm:p-6 backdrop-blur-md">
              <div className="flex items-center justify-between mb-3 px-2">
                <span className="text-xs text-purple-400 uppercase tracking-wider font-medium">
                  Altar Cloth: 78 Arcana Cards
                </span>
                <span className="text-xs text-amber-300 font-medium">
                  {session?.selectedCards?.length || 0} of 3 picked
                </span>
              </div>

              {/* Scrollable / Fanned interactive card rows */}
              <div className="max-h-64 sm:max-h-80 overflow-y-auto overflow-x-hidden p-2">
                <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                  {(session?.deck || []).map((deckItem, index) => {
                    const isPicked = session?.selectedCards?.some((sc) => sc.cardId === deckItem.cardId);

                    return (
                      <motion.div
                        key={deckItem.cardId + index}
                        whileHover={!isPicked && currentStep === 4 ? { scale: 1.15, y: -10, zIndex: 30 } : {}}
                        onClick={() => handleSelectCard(index)}
                        className={`transition-all duration-200 ${
                          isPicked
                            ? 'opacity-20 pointer-events-none scale-90'
                            : currentStep === 4
                            ? 'cursor-pointer hover:shadow-lg hover:shadow-amber-500/30'
                            : 'cursor-default'
                        }`}
                      >
                        {/* Mini Card Back */}
                        <div className="w-10 h-16 sm:w-14 sm:h-22 rounded-md border border-amber-500/40 bg-gradient-to-br from-[#1b1033] to-[#0a0614] flex items-center justify-center p-1 shadow-md">
                          <div className="w-full h-full rounded border border-amber-400/20 flex items-center justify-center">
                            <span className="text-amber-400/60 text-[9px]">✦</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= STEP 5: REVEAL ================= */}
        {currentStep === 5 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full flex flex-col items-center py-4"
          >
            <div className="text-center mb-6">
              <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
                Step 5: The Unveiling
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-amber-200 mt-1">
                Reveal the Chosen Cards
              </h2>
              <p className="text-xs sm:text-sm text-purple-300/80 mt-1">
                Click each card to perform a 3D flip and reveal its archetype and orientation.
              </p>
            </div>

            {/* 3 Big Altar Cards in Reveal Position */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 my-6 w-full max-w-4xl mx-auto">
              {(['Life', 'Love', 'Career'] as CardCategory[]).map((category) => {
                const picked = session?.selectedCards?.find((c) => c.category === category);
                const cardData = picked ? getCardDetails(picked.cardId) : null;

                return (
                  <div key={category} className="flex flex-col items-center">
                    <TarotCard
                      card={cardData}
                      orientation={picked?.orientation}
                      category={category}
                      isRevealed={picked?.revealed}
                      interactive={!picked?.revealed}
                      onClick={() => handleRevealCard(category)}
                      size="lg"
                    />

                    {!picked?.revealed && (
                      <button
                        onClick={() => handleRevealCard(category)}
                        className="mt-3 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Eye size={13} />
                        <span>Flip & Reveal</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Reveal Controls */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleRevealAll}
                className="px-6 py-3 rounded-xl bg-amber-500 text-purple-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/30 hover:brightness-110 transition"
              >
                Reveal All 3 Cards Now
              </button>

              <button
                onClick={() => handleAdvanceStep(6)}
                className="px-6 py-3 rounded-xl bg-purple-900/50 hover:bg-purple-800 text-purple-200 border border-purple-500/40 text-sm font-semibold transition flex items-center gap-2"
              >
                <span>Proceed to Interpretation</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ================= STEP 6: INTERPRETATION ================= */}
        {currentStep === 6 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full flex flex-col py-2"
          >
            <div className="text-center mb-6">
              <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
                Step 6: Live Channeled Interpretation
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amber-200 mt-1">
                Reading the Arcana for {session?.clientName}
              </h2>
              <p className="text-xs text-purple-300/80 mt-1">
                {role === 'admin'
                  ? 'Type your interpretations live below. The seeker sees your notes synchronize character-by-character in real time.'
                  : 'Your reader is channeling and typing your card interpretations in real-time below.'}
              </p>
            </div>

            {/* Top: 3 Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 max-w-4xl mx-auto w-full">
              {(['Life', 'Love', 'Career'] as CardCategory[]).map((category) => {
                const picked = session?.selectedCards?.find((c) => c.category === category);
                const cardData = picked ? getCardDetails(picked.cardId) : null;
                const isSelectedTab = activeNoteTab === category.toLowerCase();

                return (
                  <div
                    key={category}
                    onClick={() => setActiveNoteTab(category.toLowerCase() as 'life' | 'love' | 'career')}
                    className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col items-center ${
                      isSelectedTab
                        ? 'border-amber-400 bg-purple-900/30 shadow-lg shadow-amber-500/10'
                        : 'border-purple-500/20 bg-[#120e24] hover:border-purple-500/40'
                    }`}
                  >
                    <TarotCard
                      card={cardData}
                      orientation={picked?.orientation}
                      category={category}
                      isRevealed={true}
                      size="sm"
                    />

                    <div className="mt-2 text-center w-full">
                      <div className="font-serif font-bold text-sm text-purple-100">
                        {cardData?.name}
                      </div>
                      <div className="text-[11px] text-amber-300 font-medium">
                        {picked?.orientation === 'reversed' ? 'Reversed' : 'Upright'}
                      </div>
                      <div className="text-[10px] text-purple-400 mt-1 line-clamp-1">
                        {cardData?.keywords?.slice(0, 3).join(', ')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom: Collaborative Live Notes & Shared Doc View */}
            <div className="max-w-4xl mx-auto w-full bg-[#120e24] border border-purple-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl">
              {/* Note Category Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-500/20 pb-3 mb-4">
                <div className="flex gap-2">
                  {(['life', 'love', 'career', 'summary'] as const).map((tab) => {
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveNoteTab(tab)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
                          activeNoteTab === tab
                            ? 'bg-amber-500 text-purple-950 shadow-md'
                            : 'bg-purple-950/40 text-purple-300 hover:bg-purple-900/50'
                        }`}
                      >
                        {tab === 'summary' ? 'Final Synthesis' : `${tab} Card`}
                      </button>
                    );
                  })}
                </div>

                {role === 'admin' && activeNoteTab !== 'summary' && (
                  <button
                    onClick={() => {
                      const picked = session?.selectedCards?.find((c) => c.category.toLowerCase() === activeNoteTab);
                      const cardData = picked ? getCardDetails(picked.cardId) : null;
                      handleInsertKeywords(cardData, activeNoteTab as 'life' | 'love' | 'career');
                    }}
                    className="px-3 py-1 rounded-lg bg-purple-900/40 hover:bg-purple-800 text-amber-300 border border-purple-500/30 text-xs font-medium transition"
                  >
                    + Insert Card Meanings
                  </button>
                )}
              </div>

              {/* Card Reference details for currently active tab */}
              {activeNoteTab !== 'summary' && (() => {
                const picked = session?.selectedCards?.find((c) => c.category.toLowerCase() === activeNoteTab);
                const cardData = picked ? getCardDetails(picked.cardId) : null;
                const isReversed = picked?.orientation === 'reversed';

                return (
                  <div className="bg-purple-950/40 border border-purple-500/20 rounded-xl p-3.5 mb-4 text-xs text-purple-200">
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-amber-300 font-serif text-sm">
                        {cardData?.name} ({isReversed ? 'Reversed' : 'Upright'})
                      </strong>
                      <span className="text-purple-400 text-[11px]">Keywords: {cardData?.keywords?.join(' • ')}</span>
                    </div>
                    <p className="text-purple-300/90 leading-relaxed text-[12px]">
                      {isReversed ? cardData?.reversed : cardData?.upright}
                    </p>
                  </div>
                );
              })()}

              {/* Live Collaborative Text Area */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-purple-300 font-medium mb-1.5 flex items-center justify-between">
                  <span>
                    {role === 'admin' ? 'Reader Live Interpretation Notes' : 'Live Reader Channeling (Real-Time)'}
                  </span>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Synced via WebSockets
                  </span>
                </label>

                {role === 'admin' ? (
                  <textarea
                    rows={5}
                    value={localNotes[activeNoteTab]}
                    onChange={(e) => handleNotesChange(activeNoteTab, e.target.value)}
                    placeholder={`Type your live interpretation for the ${activeNoteTab} position...`}
                    className="w-full px-4 py-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-purple-100 placeholder-purple-500/50 text-sm focus:outline-none focus:border-amber-400 transition resize-none leading-relaxed font-serif"
                  />
                ) : (
                  <div className="min-h-[120px] px-4 py-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-purple-100 text-sm font-serif leading-relaxed whitespace-pre-wrap">
                    {localNotes[activeNoteTab] ? (
                      localNotes[activeNoteTab]
                    ) : (
                      <span className="text-purple-500 italic">
                        The reader is reflecting on your cards and will type guidance here...
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Advance to Final Summary Button */}
              <div className="flex justify-end pt-5 mt-4 border-t border-purple-500/20">
                <button
                  onClick={() => handleAdvanceStep(7)}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-purple-600 to-amber-600 hover:brightness-110 text-white font-semibold text-sm shadow-xl shadow-amber-500/25 flex items-center gap-2"
                >
                  <Sparkles size={16} />
                  <span>Generate Final Reading Summary & Certificate</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= STEP 7: SESSION SUMMARY ================= */}
        {currentStep === 7 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl mx-auto py-4"
          >
            {/* Parchment Certificate Card */}
            <div
              id="reading-summary-certificate"
              className="bg-gradient-to-b from-[#1c1533] via-[#140e26] to-[#0c0817] border-2 border-amber-400/60 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-purple-950/80 relative overflow-hidden"
            >
              {/* Ornate Gold Border lines */}
              <div className="absolute inset-2 rounded-2xl border border-amber-400/20 pointer-events-none" />

              {/* Header */}
              <div className="text-center pb-6 border-b border-purple-500/20 mb-8">
                <div className="inline-flex items-center gap-2 text-amber-400 text-xs uppercase tracking-widest font-semibold mb-2">
                  <span>✦</span> Sacred Arcana Certificate <span>✦</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-purple-100 to-amber-200 tracking-tight">
                  Your Sacred Reading Summary
                </h1>
                <p className="text-xs sm:text-sm text-purple-300 mt-2">
                  Prepared for <strong className="text-amber-300">{session?.clientName}</strong> on{' '}
                  {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • Inquiry: {session?.readingFocus}
                </p>
              </div>

              {/* 3 Drawn Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                {(['Life', 'Love', 'Career'] as CardCategory[]).map((category) => {
                  const picked = session?.selectedCards?.find((c) => c.category === category);
                  const cardData = picked ? getCardDetails(picked.cardId) : null;
                  const isReversed = picked?.orientation === 'reversed';
                  const noteContent = localNotes[category.toLowerCase() as 'life' | 'love' | 'career'];

                  return (
                    <div
                      key={category}
                      className="bg-purple-950/30 border border-purple-500/30 rounded-2xl p-4 flex flex-col items-center"
                    >
                      <TarotCard
                        card={cardData}
                        orientation={picked?.orientation}
                        category={category}
                        isRevealed={true}
                        size="md"
                      />

                      <div className="w-full mt-4 pt-3 border-t border-purple-500/20 text-xs">
                        <div className="font-semibold text-purple-100 mb-1 text-center font-serif text-sm">
                          {cardData?.name} ({isReversed ? 'Reversed' : 'Upright'})
                        </div>
                        <p className="text-purple-300/80 text-[11px] mb-2 text-center">
                          {cardData?.keywords?.join(', ')}
                        </p>
                        {noteContent && (
                          <div className="bg-black/30 p-2.5 rounded-lg border border-purple-500/20 text-[11px] font-serif text-purple-200 whitespace-pre-wrap">
                            {noteContent}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Overall Synthesis */}
              {localNotes.summary && (
                <div className="bg-purple-950/40 border border-amber-500/30 rounded-2xl p-6 mb-8">
                  <h3 className="font-serif font-bold text-amber-200 text-lg mb-2 flex items-center gap-2">
                    <Sparkles size={18} className="text-amber-400" /> Reader&apos;s Synthesis & Benediction
                  </h3>
                  <p className="text-sm font-serif text-purple-100 leading-relaxed whitespace-pre-wrap">
                    {localNotes.summary}
                  </p>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-purple-500/20 text-xs text-purple-400">
                <span>Sanctuary Session ID: {sessionId}</span>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-purple-900/40 hover:bg-purple-800 text-purple-200 border border-purple-500/30 flex items-center gap-1.5 transition font-medium"
                  >
                    <Download size={14} />
                    <span>Print / Save PDF</span>
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Session summary link copied to clipboard!');
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 transition font-medium"
                  >
                    <Share2 size={14} />
                    <span>Shareable Reading Link</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Floating WebRTC Video Call Tile */}
      <VideoRoom
        socket={socket}
        sessionId={sessionId}
        role={role}
        userName={role === 'admin' ? 'Reader' : userName}
        otherParticipantOnline={otherParticipantOnline}
      />
    </div>
  );
};
