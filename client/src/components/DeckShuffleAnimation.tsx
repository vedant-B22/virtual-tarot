import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wand2, Flame } from 'lucide-react';
import { audioEngine } from '../utils/audio';

interface DeckShuffleAnimationProps {
  isShuffling?: boolean;
  onShuffleTrigger?: () => void;
  canTrigger?: boolean;
}

type ShuffleStage =
  | 'idle'
  | 'ascend'
  | 'split'
  | 'riffle'
  | 'bridge'
  | 'fan'
  | 'consecrated';

const ROMAN_NUMERALS = [
  '0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
  'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'
];

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

    // Chapter 1: Ascension & Levitation
    setStage('ascend');
    audioEngine.playShuffle();

    // Chapter 2: The Aerial Triple Split
    const tSplit = setTimeout(() => {
      setStage('split');
      setProgressPercent(20);
      audioEngine.playShuffle();
    }, 1100);

    // Chapter 3: Mid-Air High-Speed 3D Riffle
    const tRiffle = setTimeout(() => {
      setStage('riffle');
      setProgressPercent(42);

      let flickCounter = 0;
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = setInterval(() => {
        flickCounter++;
        if (flickCounter <= 16) {
          audioEngine.playFlip();
        } else if (audioIntervalRef.current) {
          clearInterval(audioIntervalRef.current);
          audioIntervalRef.current = null;
        }
      }, 100);
    }, 2200);

    // Chapter 4: The 3D Magician's Waterfall Bridge
    const tBridge = setTimeout(() => {
      setStage('bridge');
      setProgressPercent(68);
      audioEngine.playShuffle();
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
        audioIntervalRef.current = null;
      }
    }, 3800);

    // Chapter 5: The 180° Celestial Rainbow Fan
    const tFan = setTimeout(() => {
      setStage('fan');
      setProgressPercent(88);
      audioEngine.playChime(528);
    }, 4900);

    // Chapter 6: Touchdown & Consecration
    const tTouchdown = setTimeout(() => {
      setStage('consecrated');
      setProgressPercent(100);
      audioEngine.playChime(587);
    }, 6000);

    // Reset to idle
    const tReset = setTimeout(() => {
      setStage('idle');
      setInternalAnimating(false);
      setProgressPercent(0);
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
        audioIntervalRef.current = null;
      }
    }, 7200);

    return () => {
      clearTimeout(tSplit);
      clearTimeout(tRiffle);
      clearTimeout(tBridge);
      clearTimeout(tFan);
      clearTimeout(tTouchdown);
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

  // 22 Physical Major Arcana Card Entities
  const totalCards = 22;
  const cards = Array.from({ length: totalCards }, (_, i) => i);
  const half = Math.floor(totalCards / 2);

  // Compute 3D physics transforms for each individual card
  const getCardStyle = (index: number) => {
    const isEven = index % 2 === 0;
    const progress = index / totalCards;
    const angle = (progress - 0.5) * Math.PI * 0.95; // for fan arc

    if (stage === 'idle') {
      // Resting on the altar with realistic card stack thickness
      const offset = (index - half) * 0.4;
      return {
        x: offset,
        y: offset,
        z: index * 2.8,
        rotateX: 18,
        rotateY: 0,
        rotateZ: (index - half) * 0.15,
        scale: 1,
        opacity: 1
      };
    }

    if (stage === 'ascend') {
      // Floating 75px up in golden levitation aura
      return {
        x: (index - half) * 0.6,
        y: -75 - index * 1.4,
        z: 90 + index * 4,
        rotateX: 28,
        rotateY: (index - half) * 1.5,
        rotateZ: (index - half) * 0.4,
        scale: 1.05,
        opacity: 1
      };
    }

    if (stage === 'split') {
      // 3 Packets in mid-air: Left Wing, Center Core, Right Wing
      const packet = index < 8 ? 'left' : index < 14 ? 'center' : 'right';

      if (packet === 'left') {
        const stackIdx = index;
        return {
          x: -145 + stackIdx * 2,
          y: -50 - stackIdx * 3,
          z: 70 + stackIdx * 6,
          rotateX: 30,
          rotateY: 26,
          rotateZ: -16,
          scale: 1.03,
          opacity: 1
        };
      }

      if (packet === 'center') {
        const stackIdx = index - 8;
        return {
          x: (stackIdx - 3) * 3,
          y: -95 - stackIdx * 2,
          z: 110 + stackIdx * 8,
          rotateX: 35,
          rotateY: 0,
          rotateZ: (stackIdx - 3) * 2,
          scale: 1.08,
          opacity: 1
        };
      }

      // Right packet
      const stackIdx = index - 14;
      return {
        x: 145 - stackIdx * 2,
        y: -50 - stackIdx * 3,
        z: 70 + stackIdx * 6,
        rotateX: 30,
        rotateY: -26,
        rotateZ: 16,
        scale: 1.03,
        opacity: 1
      };
    }

    if (stage === 'riffle') {
      // Alternating mid-air riffle weave toward center axis
      const stagger = (index / totalCards) * 16;
      const flyX = isEven ? -18 - stagger : 18 + stagger;
      const wave = Math.sin(index * 0.9) * 25;

      return {
        x: flyX + wave,
        y: -75 + (index - half) * 4.2,
        z: 110 + index * 5.5,
        rotateX: 22 + Math.sin(index) * 16,
        rotateY: isEven ? 18 : -18,
        rotateZ: (index - half) * 2.2,
        scale: 1.04,
        opacity: 1
      };
    }

    if (stage === 'bridge') {
      // 3D Magician's Waterfall Bridge arching high in the air
      const centerDist = Math.abs(index - half);
      const bridgeArch = Math.cos((centerDist / half) * (Math.PI / 2)) * 90;

      return {
        x: (index - half) * 2.4,
        y: -110 + bridgeArch,
        z: 140 - centerDist * 10,
        rotateX: 48 - bridgeArch * 0.4,
        rotateY: 0,
        rotateZ: (index - half) * 1.6,
        scale: 1.06,
        opacity: 1
      };
    }

    if (stage === 'fan') {
      // 180° Celestial Rainbow Sunburst Fan
      const fanRadius = 160;
      const fanX = Math.sin(angle) * fanRadius;
      const fanY = -60 - Math.cos(angle) * 75;
      const fanRotZ = (angle * 180) / Math.PI;

      return {
        x: fanX,
        y: fanY,
        z: 120 + index * 2.5,
        rotateX: 20,
        rotateY: 0,
        rotateZ: fanRotZ,
        scale: 0.98,
        opacity: 1
      };
    }

    if (stage === 'consecrated') {
      // Unified stack smoothly settling on the altar
      return {
        x: (index - half) * 0.2,
        y: (index - half) * 0.2,
        z: index * 2.6,
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
      <div className="absolute -inset-20 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.22)_0%,rgba(127,29,29,0.25)_40%,transparent_75%)] rounded-full blur-3xl pointer-events-none" />

      {/* Rotating Ancient Astrological Zodiac Floor Inlay */}
      <div className="absolute w-[440px] h-[440px] sm:w-[560px] sm:h-[560px] rounded-full border border-[#c5a059]/25 flex items-center justify-center pointer-events-none animate-spin-slow">
        <div className="absolute inset-5 rounded-full border border-dashed border-[#c5a059]/20" />
        <div className="absolute inset-16 rounded-full border border-[#c5a059]/15" />
        <span className="absolute top-2 text-[#e5c158]/80 text-[11px] font-cinzel tracking-[0.25em]">
          ✦ 🜂 IGNIS • WILL ✦
        </span>
        <span className="absolute bottom-2 text-[#e5c158]/80 text-[11px] font-cinzel tracking-[0.25em]">
          ✦ 🜄 AQUA • TRUTH ✦
        </span>
        <span className="absolute left-2 text-[#e5c158]/80 text-[11px] font-cinzel tracking-[0.25em]">
          ✦ 🜁 AER • MIND ✦
        </span>
        <span className="absolute right-2 text-[#e5c158]/80 text-[11px] font-cinzel tracking-[0.25em]">
          ✦ 🜃 TERRA • DESTINY ✦
        </span>
      </div>

      {/* 3D Altar Stage */}
      <div
        className="relative w-72 h-80 sm:w-[460px] sm:h-[400px] flex items-center justify-center my-4"
        style={{ perspective: '1600px', transformStyle: 'preserve-3d' }}
      >
        {/* Obsidian Stone Pedestal Shadow */}
        <div className="absolute w-72 h-36 sm:w-96 sm:h-44 rounded-[100%] bg-black/95 blur-2xl translate-y-40 border border-[#c5a059]/25 pointer-events-none shadow-[0_0_90px_rgba(0,0,0,0.95)]" />

        {/* Shockwave Burst upon Touchdown */}
        <AnimatePresence>
          {stage === 'consecrated' && (
            <motion.div
              initial={{ scale: 0.1, opacity: 1 }}
              animate={{ scale: 2.8, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute w-64 h-64 rounded-full border-2 border-[#e5c158] bg-gradient-to-r from-[#e5c158]/30 to-transparent pointer-events-none z-50 shadow-[0_0_60px_rgba(212,175,55,0.8)]"
            />
          )}
        </AnimatePresence>

        {/* 22 Levitating Physical 3D Tarot Cards */}
        {cards.map((idx) => {
          const s = getCardStyle(idx);
          const numeral = ROMAN_NUMERALS[idx] || `${idx}`;

          return (
            <motion.div
              key={`tarot-card-entity-${idx}`}
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
                duration: isCurrentlyShuffling ? 0.9 : 0.6,
                ease: 'easeInOut'
              }}
              style={{
                transformStyle: 'preserve-3d',
                zIndex: Math.round(s.z + 140)
              }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            >
              {/* Museum-Grade Luxury Tarot Card Back */}
              <div
                className={`w-[138px] h-[225px] sm:w-[160px] sm:h-[260px] rounded-2xl border transition-all duration-300 p-2.5 flex flex-col items-center justify-between relative overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.92)] ${
                  isCurrentlyShuffling
                    ? 'border-[#e5c158] shadow-[0_0_35px_rgba(212,175,55,0.6)] bg-gradient-to-b from-[#2d0716] via-[#160624] to-[#07020d]'
                    : 'border-[#c5a059]/65 shadow-[0_12px_32px_rgba(0,0,0,0.85)] bg-gradient-to-b from-[#200511] via-[#11041d] to-[#05010a]'
                }`}
              >
                {/* 24k Gold Foil Inset Hairlines */}
                <div className="absolute inset-1.5 rounded-xl border border-[#c5a059]/35 pointer-events-none" />
                <div className="absolute inset-2.5 rounded-lg border border-[#c5a059]/20 pointer-events-none" />

                {/* Corner Renaissance Rosettes */}
                <span className="absolute top-2 left-2 text-[#c5a059]/80 text-[10px] leading-none">❖</span>
                <span className="absolute top-2 right-2 text-[#c5a059]/80 text-[10px] leading-none">❖</span>
                <span className="absolute bottom-2 left-2 text-[#c5a059]/80 text-[10px] leading-none">❖</span>
                <span className="absolute bottom-2 right-2 text-[#c5a059]/80 text-[10px] leading-none">❖</span>

                {/* Top Card Inscription with Unique Roman Numeral */}
                <div className="w-full flex items-center justify-between px-1.5 pt-0.5 text-[8.5px] font-cinzel text-[#e5c158] z-10 font-bold tracking-widest uppercase">
                  <span>✦ ARCANA</span>
                  <span className="text-[10px] font-gothic-title">{numeral}</span>
                  <span>✦</span>
                </div>

                {/* Central Embossed Sacred Astrological Seal */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-[#c5a059] bg-gradient-to-tr from-[#3a0614] via-[#1d0726] to-[#09020e] flex items-center justify-center shadow-[0_0_25px_rgba(197,160,89,0.5)] my-auto relative">
                  <div className="absolute inset-1 rounded-full border border-dashed border-[#c5a059]/50 animate-spin-slow" />
                  <div className="text-xl sm:text-2xl text-[#fde047] drop-shadow-[0_0_12px_rgba(250,204,21,0.9)]">
                    ☼
                  </div>
                </div>

                {/* Bottom Latin Sanctum Seal */}
                <div className="text-[8.5px] font-cinzel tracking-[0.2em] text-[#e5c158]/90 font-bold z-10 uppercase text-center pb-0.5">
                  THE ARCANE DIARIES
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Central Luminous Stardust Orb during Riffle & Fan */}
        <AnimatePresence>
          {isCurrentlyShuffling && (
            <motion.div
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: [0.85, 1.3, 0.9] }}
              exit={{ opacity: 0, scale: 0.4 }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute z-50 flex items-center justify-center pointer-events-none -translate-y-8"
            >
              <div className="w-28 h-28 rounded-full bg-gradient-to-r from-[#d4af37]/35 via-[#7f1d1d]/45 to-[#581c87]/35 blur-xl border border-[#d4af37]/75 flex items-center justify-center shadow-[0_0_80px_rgba(212,175,55,0.9)]">
                <Sparkles className="w-14 h-14 text-[#fde047] animate-spin drop-shadow-[0_0_15px_rgba(250,204,21,1)]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Real-time Ritual Chapter Banner */}
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
              ? '✦ I • Elevating 22 Major Arcana into Mid-Air...'
              : stage === 'split'
              ? '✦ II • Dividing into Orbital Triple Wings...'
              : stage === 'riffle'
              ? '✦ III • High-Speed 3D Mid-Air Riffle & Interlock...'
              : stage === 'bridge'
              ? '✦ IV • The Magician’s 3D Waterfall Bridge Arch...'
              : stage === 'fan'
              ? '✦ V • 180° Celestial Rainbow Sunburst Fan...'
              : stage === 'consecrated'
              ? '✦ VI • Arcana Reunited & Consecrated by Sacred Will ✦'
              : '✦ The Consecrated 78-Card Tarot Deck is Ready'}
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
          <span>{isCurrentlyShuffling ? 'Weaving the Arcana...' : 'Invoke the Sacred Shuffle'}</span>
          <Flame size={17} className="text-[#f59e0b] animate-pulse" />
        </button>

        <span className="text-[11px] text-[#baa890] font-serif italic mt-3 text-center tracking-wide">
          {isCurrentlyShuffling
            ? 'Watch the cards levitate, divide into orbital wings, riffle in 3D, and fan across the cosmos'
            : 'Click to witness the cards physically levitate, riffle, waterfall-bridge, and fan in 3D mid-air'}
        </span>
      </div>
    </div>
  );
};
