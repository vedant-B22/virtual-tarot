import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wand2, Flame } from 'lucide-react';
import { audioEngine } from '../utils/audio';

interface DeckShuffleAnimationProps {
  isShuffling?: boolean;
  onShuffleTrigger?: () => void;
  canTrigger?: boolean;
}

type ShuffleStage = 'idle' | 'ascend' | 'split' | 'riffle' | 'cascade' | 'consecrated';

export const DeckShuffleAnimation: React.FC<DeckShuffleAnimationProps> = ({
  isShuffling: externalIsShuffling,
  onShuffleTrigger,
  canTrigger = true
}) => {
  const [internalAnimating, setInternalAnimating] = useState(false);
  const [stage, setStage] = useState<ShuffleStage>('idle');
  const [progressPercent, setProgressPercent] = useState(0);
  const audioIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Synchronize when external isShuffling becomes true
  useEffect(() => {
    if (externalIsShuffling && !internalAnimating) {
      startShuffleSequence();
    }
  }, [externalIsShuffling]);

  const startShuffleSequence = () => {
    if (internalAnimating) return;
    setInternalAnimating(true);
    setProgressPercent(0);

    // Initial ascension
    setStage('ascend');
    audioEngine.playShuffle();

    // Sound effects cadence
    let flipCount = 0;
    if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    audioIntervalRef.current = setInterval(() => {
      flipCount++;
      if (flipCount >= 4 && flipCount <= 14) {
        audioEngine.playFlip();
      }
    }, 180);

    // Timeline steps:
    // 0.8s: Split into two wings
    const tSplit = setTimeout(() => {
      setStage('split');
      setProgressPercent(25);
    }, 850);

    // 1.8s: Riffle & Interlace in mid-air
    const tRiffle = setTimeout(() => {
      setStage('riffle');
      setProgressPercent(55);
      audioEngine.playShuffle();
    }, 1800);

    // 3.1s: Magician's Waterfall Bridge
    const tCascade = setTimeout(() => {
      setStage('cascade');
      setProgressPercent(80);
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
        audioIntervalRef.current = null;
      }
    }, 3100);

    // 4.1s: Consecrated & settled back on the altar
    const tFinish = setTimeout(() => {
      setStage('consecrated');
      setProgressPercent(100);
      audioEngine.playChime(587);
    }, 4100);

    // 5.0s: Reset back to ready state
    const tReset = setTimeout(() => {
      setStage('idle');
      setInternalAnimating(false);
      setProgressPercent(0);
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
        audioIntervalRef.current = null;
      }
    }, 5200);

    return () => {
      clearTimeout(tSplit);
      clearTimeout(tRiffle);
      clearTimeout(tCascade);
      clearTimeout(tFinish);
      clearTimeout(tReset);
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  };

  const handleShuffleClick = () => {
    if (internalAnimating) return;
    startShuffleSequence();
    if (onShuffleTrigger) {
      onShuffleTrigger();
    }
  };

  // 20 physical card representations for dense 3D visual presence
  const totalCards = 20;
  const cards = Array.from({ length: totalCards }, (_, i) => i);

  // Compute 3D physics coordinates for each card
  const getCardStyle = (index: number) => {
    const isEven = index % 2 === 0;
    const half = Math.floor(totalCards / 2);
    const stackPos = index < half ? index : index - half;

    if (stage === 'idle') {
      // Neatly squared consecrated deck on the velvet altar
      const offset = (index - half) * 0.45;
      return {
        x: offset,
        y: offset,
        z: index * 2.8,
        rotateX: 18,
        rotateY: 0,
        rotateZ: (index - half) * 0.2,
        scale: 1,
        opacity: 1
      };
    }

    if (stage === 'ascend') {
      // Deck levitating 70px above the altar in golden light
      return {
        x: (index - half) * 0.8,
        y: -65 - index * 1.5,
        z: 80 + index * 4,
        rotateX: 25,
        rotateY: (index - half) * 1.2,
        rotateZ: 0,
        scale: 1.05,
        opacity: 1
      };
    }

    if (stage === 'split') {
      // Deck separates cleanly into Left Wing and Right Wing
      const isLeft = index < half;
      const wingX = isLeft ? -130 : 130;
      const wingRotZ = isLeft ? -15 : 15;
      const wingRotY = isLeft ? 22 : -22;
      return {
        x: wingX + (stackPos - half / 2) * 1.5,
        y: -50 - stackPos * 2.5,
        z: 60 + stackPos * 6,
        rotateX: 30,
        rotateY: wingRotY,
        rotateZ: wingRotZ,
        scale: 1.02,
        opacity: 1
      };
    }

    if (stage === 'riffle') {
      // Rapid interleaving riffle stream toward center axis
      const stagger = (index / totalCards) * 18;
      const interleaveX = (isEven ? -22 - stagger : 22 + stagger) * 0.7;
      return {
        x: interleaveX,
        y: -75 + (index - half) * 4.5,
        z: 110 + index * 5,
        rotateX: 20 + Math.sin(index) * 15,
        rotateY: isEven ? 16 : -16,
        rotateZ: (index - half) * 2.5,
        scale: 1.04,
        opacity: 1
      };
    }

    if (stage === 'cascade') {
      // The Grand Magician's Waterfall Bridge arching in 3D perspective
      const centerDist = Math.abs(index - half);
      const bridgeArch = Math.cos((centerDist / half) * (Math.PI / 2)) * 80;
      return {
        x: (index - half) * 2.2,
        y: -95 + bridgeArch,
        z: 130 - centerDist * 9,
        rotateX: 42 - bridgeArch * 0.35,
        rotateY: 0,
        rotateZ: (index - half) * 1.4,
        scale: 1.06,
        opacity: 1
      };
    }

    if (stage === 'consecrated') {
      // Unified deck landing smoothly back into the sacred altar
      return {
        x: (index - half) * 0.2,
        y: (index - half) * 0.2,
        z: index * 2.5,
        rotateX: 18,
        rotateY: 0,
        rotateZ: 0,
        scale: 1,
        opacity: 1
      };
    }

    return { x: 0, y: 0, z: 0, rotateX: 0, rotateY: 0, rotateZ: 0, scale: 1, opacity: 1 };
  };

  const isCurrentlyShuffling = internalAnimating || Boolean(externalIsShuffling);

  return (
    <div className="w-full flex flex-col items-center justify-center my-6 relative select-none">
      {/* Altar Ambiance Glow */}
      <div className="absolute -inset-16 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.18)_0%,rgba(127,29,29,0.22)_40%,transparent_75%)] rounded-full blur-3xl pointer-events-none" />

      {/* Ancient Astrological Wheel Floor Inlay */}
      <div className="absolute w-[420px] h-[420px] sm:w-[520px] sm:h-[520px] rounded-full border border-[#c5a059]/20 flex items-center justify-center pointer-events-none animate-spin-slow">
        <div className="absolute inset-4 rounded-full border border-dashed border-[#c5a059]/15" />
        <div className="absolute inset-16 rounded-full border border-[#c5a059]/10" />
        <span className="absolute top-2 text-[#e5c158]/80 text-[11px] font-cinzel tracking-[0.25em]">
          ✦ I • THE SACRED WILL ✦
        </span>
        <span className="absolute bottom-2 text-[#e5c158]/80 text-[11px] font-cinzel tracking-[0.25em]">
          ✦ XXI • THE COSMIC RETURN ✦
        </span>
        <span className="absolute left-2 text-[#e5c158]/80 text-[11px] font-cinzel tracking-[0.25em]">
          ✦ 0 • THE VOID FOOL ✦
        </span>
        <span className="absolute right-2 text-[#e5c158]/80 text-[11px] font-cinzel tracking-[0.25em]">
          ✦ X • WHEEL OF DESTINY ✦
        </span>
      </div>

      {/* 3D Altar Stage */}
      <div
        className="relative w-72 h-72 sm:w-[440px] sm:h-[360px] flex items-center justify-center my-6"
        style={{ perspective: '1600px', transformStyle: 'preserve-3d' }}
      >
        {/* Obsidian Stone Pedestal Shadow */}
        <div className="absolute w-64 h-32 sm:w-80 sm:h-40 rounded-[100%] bg-black/95 blur-2xl translate-y-36 border border-[#c5a059]/20 pointer-events-none shadow-[0_0_80px_rgba(0,0,0,0.95)]" />

        {/* Shockwave Burst upon Completion */}
        <AnimatePresence>
          {stage === 'consecrated' && (
            <motion.div
              initial={{ scale: 0.2, opacity: 0.9 }}
              animate={{ scale: 2.4, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
              className="absolute w-64 h-64 rounded-full border-2 border-[#d4af37] bg-gradient-to-r from-[#d4af37]/25 to-transparent pointer-events-none z-50 shadow-[0_0_50px_rgba(212,175,55,0.7)]"
            />
          )}
        </AnimatePresence>

        {/* 20 Levitating 3D Tarot Cards */}
        {cards.map((idx) => {
          const s = getCardStyle(idx);
          const isTopCard = idx === cards.length - 1;

          return (
            <motion.div
              key={`tarot-card-mesh-${idx}`}
              animate={{
                x: s.x,
                y: s.y,
                z: s.z,
                rotateX: s.rotateX,
                rotateY: s.rotateY,
                rotateZ: s.rotateZ,
                scale: s.scale,
                opacity: s.opacity
              }}
              transition={{
                duration: isCurrentlyShuffling ? 0.85 : 0.6,
                ease: 'easeInOut'
              }}
              style={{
                transformStyle: 'preserve-3d',
                zIndex: Math.round(s.z + 120)
              }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            >
              {/* Museum-Grade Luxury Tarot Card Back */}
              <div
                className={`w-[136px] h-[220px] sm:w-[155px] sm:h-[250px] rounded-2xl border transition-all duration-300 p-2.5 flex flex-col items-center justify-between relative overflow-hidden shadow-[0_18px_36px_rgba(0,0,0,0.9)] ${
                  isCurrentlyShuffling
                    ? 'border-[#e5c158] shadow-[0_0_30px_rgba(212,175,55,0.55)] bg-gradient-to-b from-[#2a0614] via-[#140520] to-[#07020d]'
                    : 'border-[#c5a059]/60 shadow-[0_10px_30px_rgba(0,0,0,0.85)] bg-gradient-to-b from-[#1f0510] via-[#0f041a] to-[#05010a]'
                }`}
              >
                {/* 24k Gold Foil Inset Hairlines */}
                <div className="absolute inset-1.5 rounded-xl border border-[#c5a059]/30 pointer-events-none" />
                <div className="absolute inset-2.5 rounded-lg border border-[#c5a059]/20 pointer-events-none" />

                {/* Corner Renaissance Rosettes */}
                <span className="absolute top-2 left-2 text-[#c5a059]/80 text-[10px] leading-none">❖</span>
                <span className="absolute top-2 right-2 text-[#c5a059]/80 text-[10px] leading-none">❖</span>
                <span className="absolute bottom-2 left-2 text-[#c5a059]/80 text-[10px] leading-none">❖</span>
                <span className="absolute bottom-2 right-2 text-[#c5a059]/80 text-[10px] leading-none">❖</span>

                {/* Top Card Inscription */}
                <div className="w-full flex items-center justify-between px-1.5 pt-0.5 text-[8.5px] font-cinzel text-[#e5c158]/90 z-10 font-bold tracking-widest uppercase">
                  <span>✦ THE 78</span>
                  <span>ARCANA ✦</span>
                </div>

                {/* Central Embossed Sacred Seal */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-[#c5a059] bg-gradient-to-tr from-[#3a0614] via-[#1d0726] to-[#09020e] flex items-center justify-center shadow-[0_0_25px_rgba(197,160,89,0.45)] my-auto relative">
                  <div className="absolute inset-1 rounded-full border border-dashed border-[#c5a059]/50 animate-spin-slow" />
                  <div className="text-xl sm:text-2xl text-[#fde047] drop-shadow-[0_0_12px_rgba(250,204,21,0.9)]">
                    ☼
                  </div>
                </div>

                {/* Bottom Latin Sanctum Seal */}
                <div className="text-[8.5px] font-cinzel tracking-[0.2em] text-[#e5c158]/90 font-bold z-10 uppercase text-center pb-0.5">
                  {isTopCard ? 'MASTER CONCLAVE' : 'SACRED MYSTERIES'}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Central Luminous Orb during Riffle */}
        <AnimatePresence>
          {isCurrentlyShuffling && (
            <motion.div
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: [0.8, 1.25, 0.9] }}
              exit={{ opacity: 0, scale: 0.4 }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute z-50 flex items-center justify-center pointer-events-none -translate-y-8"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#d4af37]/35 via-[#7f1d1d]/45 to-[#581c87]/35 blur-xl border border-[#d4af37]/70 flex items-center justify-center shadow-[0_0_70px_rgba(212,175,55,0.85)]">
                <Sparkles className="w-12 h-12 text-[#fde047] animate-spin drop-shadow-[0_0_15px_rgba(250,204,21,1)]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Real-time Ritual Stage Banner */}
      <div className="w-full max-w-md mx-auto text-center mt-3 mb-4">
        <motion.div
          key={stage}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-[#0a0712]/90 border border-[#c5a059]/40 text-[#f5ede0] text-xs font-cinzel tracking-[0.15em] uppercase shadow-[0_0_25px_rgba(0,0,0,0.8)] backdrop-blur-xl"
        >
          <Wand2 size={14} className="text-[#e5c158] animate-pulse" />
          <span>
            {stage === 'ascend'
              ? '✦ Elevating the 78 Arcana into Mid-Air...'
              : stage === 'split'
              ? '✦ Dividing the Deck into Dual Celestial Wings...'
              : stage === 'riffle'
              ? '✦ Interlacing Threads of Fate in 3D Mid-Air...'
              : stage === 'cascade'
              ? '✦ Cascading the Magician’s Waterfall Bridge...'
              : stage === 'consecrated'
              ? '✦ Deck Reunited & Consecrated by Sacred Will ✦'
              : '✦ The 78-Card Rider-Waite Deck is Consecrated & Ready'}
          </span>
        </motion.div>

        {/* Progress Bar during Shuffle */}
        {isCurrentlyShuffling && (
          <div className="w-64 h-1 bg-black/60 rounded-full mx-auto mt-3 overflow-hidden border border-[#c5a059]/25">
            <motion.div
              className="h-full bg-gradient-to-r from-[#c5a059] via-[#fde047] to-[#c5a059]"
              initial={{ width: '0%' }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        )}
      </div>

      {/* SINGLE BEST DIRECT INVOCATION BUTTON */}
      <div className="z-20 flex flex-col items-center">
        <button
          type="button"
          onClick={handleShuffleClick}
          disabled={!canTrigger || isCurrentlyShuffling}
          className="px-10 py-4 sm:px-14 sm:py-4.5 rounded-2xl bg-gradient-to-r from-[#3a0614] via-[#5c1328] to-[#1e0728] hover:from-[#4d091b] hover:to-[#2c0b3b] text-[#f7eedc] font-cinzel font-bold text-xs sm:text-sm tracking-[0.2em] uppercase border border-[#c5a059]/70 shadow-[0_0_40px_rgba(197,160,89,0.35)] hover:shadow-[0_0_55px_rgba(197,160,89,0.55)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-3.5 hover:scale-[1.02] active:scale-[0.98] group"
        >
          <Sparkles
            size={18}
            className={`text-[#e5c158] transition-transform duration-700 ${
              isCurrentlyShuffling ? 'rotate-180 animate-spin text-[#fde047]' : 'group-hover:rotate-45'
            }`}
          />
          <span>{isCurrentlyShuffling ? 'Weaving Sacred Arcana...' : 'Invoke the Sacred Shuffle'}</span>
          <Flame size={17} className="text-[#f59e0b] animate-pulse" />
        </button>

        <span className="text-[11px] text-[#baa890] font-serif italic mt-3 text-center tracking-wide">
          {isCurrentlyShuffling
            ? 'The sacred cards levitate, divide into dual wings, and weave into unified synchronicity'
            : 'Click to physically levitate, riffle, and waterfall-cascade the 78 cards in 3D mid-air'}
        </span>
      </div>
    </div>
  );
};
