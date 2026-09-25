import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Flame, Layers, Wand2 } from 'lucide-react';
import { audioEngine } from '../utils/audio';

interface DeckShuffleAnimationProps {
  isShuffling?: boolean;
  onShuffleTrigger?: () => void;
  canTrigger?: boolean;
}

export const DeckShuffleAnimation: React.FC<DeckShuffleAnimationProps> = ({
  isShuffling: externalIsShuffling,
  onShuffleTrigger,
  canTrigger = true
}) => {
  const [internalShuffling, setInternalShuffling] = useState(false);
  const isShuffling = externalIsShuffling !== undefined ? externalIsShuffling : internalShuffling;

  // Multi-step realistic 3D shuffle choreography
  const [shuffleStep, setShuffleStep] = useState<'idle' | 'lift' | 'cut' | 'riffle' | 'bridge' | 'fan'>('idle');

  const triggerShuffle = () => {
    if (isShuffling) return;

    if (onShuffleTrigger) {
      onShuffleTrigger();
    } else {
      setInternalShuffling(true);
      audioEngine.playShuffle();
      setTimeout(() => {
        setInternalShuffling(false);
        audioEngine.playChime(587);
      }, 3200);
    }
  };

  useEffect(() => {
    if (isShuffling) {
      audioEngine.playShuffle();
      setShuffleStep('lift');

      const t1 = setTimeout(() => setShuffleStep('cut'), 400);
      const t2 = setTimeout(() => setShuffleStep('riffle'), 1000);
      const t3 = setTimeout(() => setShuffleStep('bridge'), 2100);
      const t4 = setTimeout(() => setShuffleStep('fan'), 2700);
      const t5 = setTimeout(() => setShuffleStep('idle'), 3200);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
        clearTimeout(t5);
      };
    } else {
      setShuffleStep('idle');
    }
  }, [isShuffling]);

  // Card items for realistic physical deck feel (8 on left, 8 on right)
  const leftCards = [0, 1, 2, 3, 4, 5, 6, 7];
  const rightCards = [0, 1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="flex flex-col items-center justify-center my-6 relative select-none w-full max-w-2xl mx-auto">
      {/* Cinematic Vignette & Atmospheric Radial Glow */}
      <div className="absolute -inset-16 bg-[radial-gradient(circle_at_center,rgba(180,83,9,0.18)_0%,rgba(126,34,206,0.15)_35%,rgba(76,5,25,0.2)_65%,transparent_80%)] rounded-full blur-3xl pointer-events-none" />

      {/* Rotating Mystic Alchemical Runes Circle */}
      <div className="absolute w-[360px] h-[360px] sm:w-[440px] sm:h-[440px] rounded-full border border-[#d4af37]/20 flex items-center justify-center pointer-events-none animate-spin-slow">
        <div className="absolute inset-2 rounded-full border border-dashed border-[#d4af37]/25" />
        <span className="absolute top-1 text-[#d4af37]/70 text-xs font-cinzel">🜂 IGNIS</span>
        <span className="absolute bottom-1 text-[#d4af37]/70 text-xs font-cinzel">🜄 AQUA</span>
        <span className="absolute left-2 text-[#d4af37]/70 text-xs font-cinzel">🜁 AER</span>
        <span className="absolute right-2 text-[#d4af37]/70 text-xs font-cinzel">🜃 TERRA</span>
      </div>

      {/* 3D Altar Table Surface for the Shuffling Deck */}
      <div className="relative w-80 h-72 sm:w-96 sm:h-80 flex items-center justify-center perspective-1000 my-4">
        {/* Left Half Pack */}
        <div className="absolute">
          {leftCards.map((idx) => {
            let anim = {
              x: (idx - 4) * 0.8,
              y: (idx - 4) * 0.8,
              rotateZ: (idx - 4) * 0.4,
              rotateY: 0,
              rotateX: 0,
              scale: 1
            };

            if (shuffleStep === 'lift') {
              anim = {
                x: 0,
                y: -30 - idx * 2,
                rotateZ: 0,
                rotateY: 0,
                rotateX: 10,
                scale: 1.05
              };
            } else if (shuffleStep === 'cut') {
              // Smooth 3D Arc Separation to the Left
              anim = {
                x: -95 - idx * 3,
                y: -15 + idx * 2,
                rotateZ: -16,
                rotateY: 28,
                rotateX: 12,
                scale: 0.98
              };
            } else if (shuffleStep === 'riffle') {
              // Fluttering and interleaving 3D cards
              anim = {
                x: -15 + (idx % 2 === 0 ? -10 : 0),
                y: -idx * 4,
                rotateZ: -6 + idx * 1.2,
                rotateY: 8,
                rotateX: 15,
                scale: 1
              };
            } else if (shuffleStep === 'bridge') {
              // The Magician's 3D Bridge bend
              anim = {
                x: 0,
                y: -45 + Math.abs(idx - 4) * 5,
                rotateZ: (idx - 4) * 1.5,
                rotateY: 0,
                rotateX: 30,
                scale: 1.08
              };
            } else if (shuffleStep === 'fan') {
              // Beautiful golden fan
              anim = {
                x: (idx - 4) * 18,
                y: -Math.cos(((idx - 4) * Math.PI) / 8) * 15,
                rotateZ: (idx - 4) * 5,
                rotateY: 0,
                rotateX: 0,
                scale: 1.02
              };
            }

            return (
              <motion.div
                key={`left-card-${idx}`}
                animate={anim}
                transition={{
                  duration: shuffleStep === 'riffle' ? 0.35 + idx * 0.05 : 0.45,
                  ease: 'easeInOut'
                }}
                className="absolute left-[-70px] top-[-115px] sm:left-[-85px] sm:top-[-135px]"
                style={{ zIndex: 10 + idx }}
              >
                {/* Authentic Velvet & Gold Card Back */}
                <div className="w-[140px] h-[230px] sm:w-[165px] sm:h-[270px] rounded-2xl border-2 border-[#d4af37]/80 bg-gradient-to-b from-[#2b0814] via-[#14061a] to-[#08020d] p-2 flex flex-col items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.85)] relative overflow-hidden transition-all">
                  {/* Ornate Gold Border & Filigree */}
                  <div className="absolute inset-1.5 rounded-xl border border-[#d4af37]/40 pointer-events-none" />
                  <div className="absolute top-2 left-2 text-[#d4af37]/70 text-[10px]">❖</div>
                  <div className="absolute top-2 right-2 text-[#d4af37]/70 text-[10px]">❖</div>
                  <div className="absolute bottom-2 left-2 text-[#d4af37]/70 text-[10px]">❖</div>
                  <div className="absolute bottom-2 right-2 text-[#d4af37]/70 text-[10px]">❖</div>

                  {/* Mystic Header */}
                  <div className="w-full flex items-center justify-between px-1 text-[9px] font-cinzel text-[#d4af37]/80 z-10">
                    <span>✦ 78</span>
                    <span>ARCANA ✦</span>
                  </div>

                  {/* Sacred Central Wax Seal / Eye Rune */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-[#d4af37]/70 bg-gradient-to-tr from-[#6b0f1a] via-[#3b0764] to-[#1e0735] flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)] my-auto relative">
                    <div className="absolute inset-1 rounded-full border border-dashed border-[#d4af37]/40 animate-spin-slow" />
                    <span className="text-xl sm:text-2xl text-[#fef08a] drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]">
                      🜂
                    </span>
                  </div>

                  {/* Bottom Emblem */}
                  <div className="text-[9px] font-cinzel tracking-widest text-[#d4af37]/80 z-10">
                    SACRED ORDER
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Right Half Pack */}
        <div className="absolute">
          {rightCards.map((idx) => {
            let anim = {
              x: (idx - 4) * -0.8,
              y: (idx - 4) * -0.8,
              rotateZ: (idx - 4) * -0.4,
              rotateY: 0,
              rotateX: 0,
              scale: 1
            };

            if (shuffleStep === 'lift') {
              anim = {
                x: 0,
                y: -30 - idx * 2,
                rotateZ: 0,
                rotateY: 0,
                rotateX: 10,
                scale: 1.05
              };
            } else if (shuffleStep === 'cut') {
              // Smooth 3D Arc Separation to the Right
              anim = {
                x: 95 + idx * 3,
                y: -15 + idx * 2,
                rotateZ: 16,
                rotateY: -28,
                rotateX: 12,
                scale: 0.98
              };
            } else if (shuffleStep === 'riffle') {
              // Fluttering and interleaving from right
              anim = {
                x: 15 + (idx % 2 === 0 ? 10 : 0),
                y: -idx * 4 - 2,
                rotateZ: 6 - idx * 1.2,
                rotateY: -8,
                rotateX: 15,
                scale: 1
              };
            } else if (shuffleStep === 'bridge') {
              // The Magician's 3D Bridge bend
              anim = {
                x: 0,
                y: -45 + Math.abs(idx - 4) * 5,
                rotateZ: (idx - 4) * -1.5,
                rotateY: 0,
                rotateX: 30,
                scale: 1.08
              };
            } else if (shuffleStep === 'fan') {
              // Beautiful golden fan
              anim = {
                x: (idx - 4) * -18,
                y: -Math.cos(((idx - 4) * Math.PI) / 8) * 15,
                rotateZ: (idx - 4) * -5,
                rotateY: 0,
                rotateX: 0,
                scale: 1.02
              };
            }

            return (
              <motion.div
                key={`right-card-${idx}`}
                animate={anim}
                transition={{
                  duration: shuffleStep === 'riffle' ? 0.35 + (7 - idx) * 0.05 : 0.45,
                  ease: 'easeInOut'
                }}
                className="absolute left-[-70px] top-[-115px] sm:left-[-85px] sm:top-[-135px]"
                style={{ zIndex: 30 + idx }}
              >
                {/* Authentic Velvet & Gold Card Back */}
                <div className="w-[140px] h-[230px] sm:w-[165px] sm:h-[270px] rounded-2xl border-2 border-[#d4af37]/80 bg-gradient-to-b from-[#2b0814] via-[#14061a] to-[#08020d] p-2 flex flex-col items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.85)] relative overflow-hidden transition-all">
                  <div className="absolute inset-1.5 rounded-xl border border-[#d4af37]/40 pointer-events-none" />
                  <div className="absolute top-2 left-2 text-[#d4af37]/70 text-[10px]">❖</div>
                  <div className="absolute top-2 right-2 text-[#d4af37]/70 text-[10px]">❖</div>
                  <div className="absolute bottom-2 left-2 text-[#d4af37]/70 text-[10px]">❖</div>
                  <div className="absolute bottom-2 right-2 text-[#d4af37]/70 text-[10px]">❖</div>

                  <div className="w-full flex items-center justify-between px-1 text-[9px] font-cinzel text-[#d4af37]/80 z-10">
                    <span>✦ 78</span>
                    <span>ARCANA ✦</span>
                  </div>

                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-[#d4af37]/70 bg-gradient-to-tr from-[#6b0f1a] via-[#3b0764] to-[#1e0735] flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)] my-auto relative">
                    <div className="absolute inset-1 rounded-full border border-dashed border-[#d4af37]/40 animate-spin-slow" />
                    <span className="text-xl sm:text-2xl text-[#fef08a] drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]">
                      🜂
                    </span>
                  </div>

                  <div className="text-[9px] font-cinzel tracking-widest text-[#d4af37]/80 z-10">
                    SACRED ORDER
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Shuffling Particle Sparks / Energy Orb */}
        <AnimatePresence>
          {isShuffling && (
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: [1, 1.3, 1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="absolute z-50 flex flex-col items-center justify-center pointer-events-none"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-amber-500/30 to-purple-600/30 blur-md border-2 border-[#d4af37] flex items-center justify-center shadow-[0_0_40px_rgba(212,175,55,0.8)]">
                <Sparkles className="w-10 h-10 text-[#fef08a] animate-spin" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Shuffling Status Pill */}
      <div className="my-2 text-center">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-[#d4af37]/40 text-[#fef08a] text-xs font-cinzel tracking-widest uppercase shadow-inner">
          <Wand2 size={13} className="text-[#facc15] animate-pulse" />
          <span>
            {shuffleStep === 'cut'
              ? 'Splitting Deck into Left & Right Packs...'
              : shuffleStep === 'riffle'
              ? 'Riffling and Interleaving 78 Archetypes...'
              : shuffleStep === 'bridge'
              ? 'Cascading 3D Bridge & Waterflowing...'
              : shuffleStep === 'fan'
              ? 'Harmonizing Elemental Energy...'
              : isShuffling
              ? 'Cosmic Shuffle in Motion...'
              : 'Deck Consecrated & Ready for Shuffling'}
          </span>
        </span>
      </div>

      {/* Interactive Trigger Button */}
      <div className="mt-3 z-20 flex flex-col items-center">
        <button
          onClick={triggerShuffle}
          disabled={!canTrigger || isShuffling}
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#7f1d1d] via-[#581c87] to-[#b45309] hover:from-[#991b1b] hover:to-[#d97706] text-[#fef3c7] font-cinzel font-bold text-xs uppercase tracking-widest border-2 border-[#d4af37]/70 shadow-[0_0_30px_rgba(212,175,55,0.45)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-3 hover:scale-105 active:scale-95 group"
        >
          <Layers
            size={18}
            className={`text-[#facc15] transition-transform duration-700 ${
              isShuffling ? 'rotate-180 animate-spin' : 'group-hover:rotate-180'
            }`}
          />
          <span>{isShuffling ? 'Weaving the 78 Arcana...' : 'Invoke 3D Deck Shuffle'}</span>
          <Flame size={16} className="text-[#fb923c] animate-pulse" />
        </button>

        <span className="text-[11px] text-[#e2d5b8]/70 font-cinzel tracking-wider mt-2.5 text-center">
          {isShuffling
            ? 'The 78 cards are dividing, riffling, and bridging in real time across the sanctuary altar'
            : 'Click to witness the sacred 3D cut, riffle, and bridge cascade'}
        </span>
      </div>
    </div>
  );
};
