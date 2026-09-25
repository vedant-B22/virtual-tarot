import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TarotCard } from './TarotCard';
import { Sparkles, Flame, Layers } from 'lucide-react';

interface DeckShuffleAnimationProps {
  isShuffling: boolean;
  onShuffleTrigger: () => void;
  canTrigger: boolean;
}

export const DeckShuffleAnimation: React.FC<DeckShuffleAnimationProps> = ({
  isShuffling,
  onShuffleTrigger,
  canTrigger
}) => {
  const [shufflePhase, setShufflePhase] = useState<'idle' | 'split' | 'riffle' | 'bridge'>('idle');

  useEffect(() => {
    if (isShuffling) {
      setShufflePhase('split');
      const t1 = setTimeout(() => setShufflePhase('riffle'), 450);
      const t2 = setTimeout(() => setShufflePhase('bridge'), 1100);
      const t3 = setTimeout(() => setShufflePhase('idle'), 1800);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    } else {
      setShufflePhase('idle');
    }
  }, [isShuffling]);

  return (
    <div className="flex flex-col items-center justify-center my-6 relative select-none">
      {/* Background Mystical Aura & Runes */}
      <div className="absolute -inset-10 bg-radial from-amber-500/10 via-purple-900/15 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* Orbiting Arcane Runes during shuffle */}
      <AnimatePresence>
        {isShuffling && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.1, rotate: 360 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 2, ease: "linear", repeat: Infinity }}
            className="absolute w-80 h-80 rounded-full border border-dashed border-[#d4af37]/30 flex items-center justify-center pointer-events-none"
          >
            <span className="absolute top-0 text-[#d4af37] text-sm">🜂</span>
            <span className="absolute bottom-0 text-[#d4af37] text-sm">🜄</span>
            <span className="absolute left-0 text-[#d4af37] text-sm">🜁</span>
            <span className="absolute right-0 text-[#d4af37] text-sm">🜃</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Altar Table Surface for the Deck */}
      <div className="relative w-80 h-72 sm:w-96 sm:h-80 flex items-center justify-center perspective-1000">
        {/* Left Cut Pile */}
        <div className="absolute">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={`left-${i}`}
              animate={
                shufflePhase === 'split'
                  ? {
                      x: -65 - i * 2,
                      y: -10 + i * 2,
                      rotateZ: -14,
                      rotateY: 22,
                      scale: 0.98
                    }
                  : shufflePhase === 'riffle'
                  ? {
                      x: [-65, -15, 0],
                      y: [0, -25, 0],
                      rotateZ: [-14, -4, 0],
                      rotateY: [15, 0],
                      transition: { duration: 0.6, delay: i * 0.07 }
                    }
                  : shufflePhase === 'bridge'
                  ? {
                      x: 0,
                      y: [0, -35, 0],
                      rotateX: [0, 20, 0],
                      scale: [1, 1.05, 1],
                      transition: { duration: 0.5 }
                    }
                  : {
                      x: (i - 2) * 1.5,
                      y: (i - 2) * 1.5,
                      rotateZ: (i - 2) * 0.8
                    }
              }
              transition={{ duration: 0.45, ease: 'easeInOut' }}
              className="absolute left-[-80px] top-[-135px]"
              style={{ zIndex: 10 + i }}
            >
              <TarotCard isRevealed={false} size="md" />
            </motion.div>
          ))}
        </div>

        {/* Right Cut Pile */}
        <div className="absolute">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={`right-${i}`}
              animate={
                shufflePhase === 'split'
                  ? {
                      x: 65 + i * 2,
                      y: -10 + i * 2,
                      rotateZ: 14,
                      rotateY: -22,
                      scale: 0.98
                    }
                  : shufflePhase === 'riffle'
                  ? {
                      x: [65, 15, 0],
                      y: [0, -20, 0],
                      rotateZ: [14, 4, 0],
                      rotateY: [-15, 0],
                      transition: { duration: 0.6, delay: (4 - i) * 0.07 }
                    }
                  : shufflePhase === 'bridge'
                  ? {
                      x: 0,
                      y: [0, -35, 0],
                      rotateX: [0, 20, 0],
                      scale: [1, 1.05, 1],
                      transition: { duration: 0.5 }
                    }
                  : {
                      x: (i - 2) * -1.5,
                      y: (i - 2) * -1.5,
                      rotateZ: (i - 2) * -0.8
                    }
              }
              transition={{ duration: 0.45, ease: 'easeInOut' }}
              className="absolute left-[-80px] top-[-135px]"
              style={{ zIndex: 20 + i }}
            >
              <TarotCard isRevealed={false} size="md" />
            </motion.div>
          ))}
        </div>

        {/* Shuffling Particle Sparks / Energy Orb */}
        {isShuffling && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: [1, 1.2, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="absolute z-40 flex flex-col items-center justify-center pointer-events-none"
          >
            <div className="w-16 h-16 rounded-full bg-[#d4af37]/25 blur-md border border-[#d4af37] flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.7)]">
              <Sparkles className="w-8 h-8 text-[#f3e5ab] animate-spin-slow" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Interactive Trigger Button */}
      <div className="mt-4 z-20 flex flex-col items-center">
        <button
          onClick={onShuffleTrigger}
          disabled={!canTrigger || isShuffling}
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#9a3412] via-[#7e22ce] to-[#b45309] hover:from-[#c2410c] hover:to-[#d97706] text-[#fef3c7] font-cinzel font-bold text-sm tracking-widest uppercase border border-[#d4af37]/60 shadow-[0_0_25px_rgba(212,175,55,0.35)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-3 hover:scale-105 active:scale-95 group"
        >
          <Layers size={18} className="text-[#facc15] group-hover:rotate-180 transition-transform duration-700" />
          <span>{isShuffling ? 'Weaving the Cosmic Arcana...' : 'Invoke Deck Shuffle'}</span>
          <Flame size={16} className="text-[#fb923c] animate-pulse" />
        </button>

        <span className="text-[11px] text-[#c4b5fd]/70 font-cinzel tracking-wider mt-2.5">
          {isShuffling ? 'The cards are dividing, riffling & aligning energy in real time' : 'Click to split and riffle the 78 cards across both screens'}
        </span>
      </div>
    </div>
  );
};
