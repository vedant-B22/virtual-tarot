import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Flame, Layers, Wand2, Compass, Wind } from 'lucide-react';
import { audioEngine } from '../utils/audio';

interface DeckShuffleAnimationProps {
  isShuffling?: boolean;
  onShuffleTrigger?: () => void;
  canTrigger?: boolean;
}

type ShuffleStyle = 'vortex' | 'stream' | 'cascade' | 'wheel';

export const DeckShuffleAnimation: React.FC<DeckShuffleAnimationProps> = ({
  isShuffling: externalIsShuffling,
  onShuffleTrigger,
  canTrigger = true
}) => {
  const [internalShuffling, setInternalShuffling] = useState(false);
  const isShuffling = externalIsShuffling !== undefined ? externalIsShuffling : internalShuffling;

  // Selected magical style
  const [activeStyle, setActiveStyle] = useState<ShuffleStyle>('vortex');

  // Animation sub-stage
  const [choreographyStep, setChoreographyStep] = useState<
    'idle' | 'ascend' | 'dance' | 'bridge' | 'converge'
  >('idle');

  const triggerShuffle = (style?: ShuffleStyle) => {
    if (isShuffling) return;
    if (style) setActiveStyle(style);

    if (onShuffleTrigger) {
      onShuffleTrigger();
    } else {
      setInternalShuffling(true);
      audioEngine.playShuffle();
      setTimeout(() => {
        setInternalShuffling(false);
        audioEngine.playChime(587);
      }, 4200);
    }
  };

  useEffect(() => {
    if (isShuffling) {
      audioEngine.playShuffle();
      setChoreographyStep('ascend');

      const t1 = setTimeout(() => {
        setChoreographyStep('dance');
        audioEngine.playShuffle();
      }, 800);

      const t2 = setTimeout(() => {
        setChoreographyStep('bridge');
        audioEngine.playChime(440);
      }, 2200);

      const t3 = setTimeout(() => {
        setChoreographyStep('converge');
        audioEngine.playFlip();
      }, 3400);

      const t4 = setTimeout(() => {
        setChoreographyStep('idle');
      }, 4200);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    } else {
      setChoreographyStep('idle');
    }
  }, [isShuffling]);

  // 18 distinct physical card entities for hyper-realistic 3D presence
  const cards = Array.from({ length: 18 }, (_, i) => i);

  // Compute 3D transform for each card based on the current magical choreography
  const getCardTransform = (idx: number) => {
    const total = cards.length;
    const progress = idx / total;
    const angle = progress * Math.PI * 2;

    if (choreographyStep === 'idle') {
      return {
        x: (idx - 9) * 0.4,
        y: (idx - 9) * 0.4,
        z: idx * 2.5,
        rotateX: 15,
        rotateY: 0,
        rotateZ: (idx - 9) * 0.25,
        scale: 1
      };
    }

    if (choreographyStep === 'ascend') {
      // Levitating into the air with golden aura
      return {
        x: (idx - 9) * 2,
        y: -50 - idx * 3.5,
        z: 80 + idx * 8,
        rotateX: 25,
        rotateY: (idx - 9) * 3,
        rotateZ: (idx - 9) * 1.5,
        scale: 1.05
      };
    }

    if (choreographyStep === 'dance') {
      if (activeStyle === 'vortex') {
        // Magical 3D Spiral Helix / Vortex in mid-air
        const radius = 130 + Math.sin(idx) * 25;
        const height = (idx - 9) * 16;
        return {
          x: Math.cos(angle * 2) * radius,
          y: -80 + height,
          z: Math.sin(angle * 2) * 160,
          rotateX: 20 + Math.sin(angle) * 30,
          rotateY: (angle * 180) / Math.PI + 90,
          rotateZ: idx * 8,
          scale: 0.95 + Math.sin(idx) * 0.1
        };
      }

      if (activeStyle === 'stream') {
        // Triple Pack Aerial Stream: 3 floating packs with cards shooting across
        const pack = idx % 3;
        const packX = pack === 0 ? -120 : pack === 1 ? 0 : 120;
        const packY = pack === 1 ? -90 : -40;
        const shoot = idx > 9 ? Math.sin(idx * 2) * 80 : 0;
        return {
          x: packX + shoot,
          y: packY - (idx % 6) * 6,
          z: (idx % 6) * 20,
          rotateX: 30,
          rotateY: pack === 0 ? 35 : pack === 2 ? -35 : 0,
          rotateZ: pack === 0 ? -15 : pack === 2 ? 15 : 0,
          scale: 0.96
        };
      }

      if (activeStyle === 'cascade') {
        // High-speed interleaving riffle stream
        const isLeft = idx % 2 === 0;
        return {
          x: isLeft ? -90 + (idx * 6) : 90 - (idx * 6),
          y: -40 - (idx * 4),
          z: idx * 10,
          rotateX: 25,
          rotateY: isLeft ? 28 : -28,
          rotateZ: isLeft ? -12 : 12,
          scale: 1
        };
      }

      // Wheel style: 360-degree floating sunburst circle
      const r = 140;
      return {
        x: Math.cos(angle) * r,
        y: -60 + Math.sin(angle) * 35,
        z: Math.sin(angle) * 90,
        rotateX: 20,
        rotateY: (angle * 180) / Math.PI,
        rotateZ: (angle * 180) / Math.PI - 90,
        scale: 0.92
      };
    }

    if (choreographyStep === 'bridge') {
      // The Grand Magician's 3D Bridge bend and waterfall snap
      const centerDist = Math.abs(idx - 9);
      const bend = Math.cos((centerDist / 9) * (Math.PI / 2)) * 65;
      return {
        x: (idx - 9) * 3,
        y: -85 + bend,
        z: 120 - centerDist * 8,
        rotateX: 45 - bend * 0.4,
        rotateY: 0,
        rotateZ: (idx - 9) * 2,
        scale: 1.08
      };
    }

    if (choreographyStep === 'converge') {
      // Snapping together with sonic bloom
      return {
        x: (idx - 9) * 0.2,
        y: (idx - 9) * 0.2,
        z: idx * 2.8,
        rotateX: 15,
        rotateY: 0,
        rotateZ: 0,
        scale: 1
      };
    }

    return { x: 0, y: 0, z: 0, rotateX: 0, rotateY: 0, rotateZ: 0, scale: 1 };
  };

  return (
    <div className="flex flex-col items-center justify-center my-4 relative select-none w-full max-w-4xl mx-auto">
      {/* Mystical Theatrical Atmosphere Background */}
      <div className="absolute -inset-20 bg-[radial-gradient(ellipse_at_center,rgba(180,83,9,0.2)_0%,rgba(88,28,135,0.22)_35%,rgba(76,5,25,0.28)_60%,transparent_85%)] rounded-full blur-3xl pointer-events-none" />

      {/* Orbiting Arcane Alchemy Glyphs */}
      <div className="absolute w-[440px] h-[440px] sm:w-[540px] sm:h-[540px] rounded-full border-2 border-dashed border-[#d4af37]/25 flex items-center justify-center pointer-events-none animate-spin-slow">
        <div className="absolute inset-4 rounded-full border border-[#d4af37]/20" />
        <span className="absolute top-2 text-[#fde047] text-sm font-cinzel tracking-widest drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]">
          🜂 IGNIS (FIRE)
        </span>
        <span className="absolute bottom-2 text-[#67e8f9] text-sm font-cinzel tracking-widest drop-shadow-[0_0_8px_rgba(103,232,249,0.8)]">
          🜄 AQUA (WATER)
        </span>
        <span className="absolute left-2 text-[#fef08a] text-sm font-cinzel tracking-widest drop-shadow-[0_0_8px_rgba(254,240,138,0.8)]">
          🜁 AER (AIR)
        </span>
        <span className="absolute right-2 text-[#86efac] text-sm font-cinzel tracking-widest drop-shadow-[0_0_8px_rgba(134,239,172,0.8)]">
          🜃 TERRA (EARTH)
        </span>
      </div>

      {/* 3D Altar Stage */}
      <div
        className="relative w-80 h-80 sm:w-[480px] sm:h-[360px] flex items-center justify-center perspective-1000 my-6"
        style={{ perspective: '1600px', transformStyle: 'preserve-3d' }}
      >
        {/* Stone / Velvet Pedestal Shadow */}
        <div className="absolute w-72 h-36 sm:w-96 sm:h-44 rounded-[100%] bg-black/90 blur-xl translate-y-36 border border-[#d4af37]/20 pointer-events-none shadow-[0_0_60px_rgba(0,0,0,0.9)]" />

        {/* 18 Levitating 3D Cards */}
        {cards.map((idx) => {
          const t = getCardTransform(idx);
          const isTopCard = idx === cards.length - 1;

          return (
            <motion.div
              key={`tarot-card-${idx}`}
              animate={{
                x: t.x,
                y: t.y,
                z: t.z,
                rotateX: t.rotateX,
                rotateY: t.rotateY,
                rotateZ: t.rotateZ,
                scale: t.scale
              }}
              transition={{
                duration: choreographyStep === 'dance' ? 0.9 : 0.6,
                ease: choreographyStep === 'dance' ? 'easeInOut' : 'easeOut'
              }}
              style={{
                transformStyle: 'preserve-3d',
                zIndex: Math.round(t.z + 100)
              }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            >
              {/* Ornate Velvet & Gold Tarot Card Mesh */}
              <div
                className={`w-[130px] h-[210px] sm:w-[155px] sm:h-[250px] rounded-2xl border-2 transition-all duration-300 p-2 flex flex-col items-center justify-between shadow-[0_15px_35px_rgba(0,0,0,0.9)] relative overflow-hidden ${
                  isShuffling
                    ? 'border-[#d4af37] shadow-[0_0_25px_rgba(212,175,55,0.6)] bg-gradient-to-b from-[#380614] via-[#1a0524] to-[#09020f]'
                    : 'border-[#d4af37]/70 bg-gradient-to-b from-[#260510] via-[#12031a] to-[#07010c]'
                }`}
              >
                {/* Gold Leaf Filigree Inset */}
                <div className="absolute inset-1 rounded-xl border border-[#d4af37]/40 pointer-events-none" />
                <div className="absolute top-1.5 left-1.5 text-[#d4af37]/80 text-[10px]">❖</div>
                <div className="absolute top-1.5 right-1.5 text-[#d4af37]/80 text-[10px]">❖</div>
                <div className="absolute bottom-1.5 left-1.5 text-[#d4af37]/80 text-[10px]">❖</div>
                <div className="absolute bottom-1.5 right-1.5 text-[#d4af37]/80 text-[10px]">❖</div>

                {/* Card Top Title */}
                <div className="w-full flex items-center justify-between px-1 text-[9px] font-cinzel text-[#d4af37] z-10 font-bold">
                  <span>✦ 78</span>
                  <span>ARCANA ✦</span>
                </div>

                {/* Central Mystic Seal / Wax Crest */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-[#d4af37] bg-gradient-to-tr from-[#7f1d1d] via-[#4c0519] to-[#120208] flex items-center justify-center shadow-[0_0_25px_rgba(212,175,55,0.5)] my-auto relative">
                  <div className="absolute inset-1 rounded-full border border-dashed border-[#d4af37]/60 animate-spin-slow" />
                  <span className="text-xl sm:text-2xl text-[#fef08a] drop-shadow-[0_0_10px_rgba(250,204,21,0.9)]">
                    🜂
                  </span>
                </div>

                {/* Bottom Latin Seal */}
                <div className="text-[9px] font-cinzel tracking-widest text-[#d4af37] font-bold z-10 uppercase">
                  {isTopCard ? 'MASTER DECK' : 'SACRED ORDER'}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Central Magical Energy Nucleus during Shuffling */}
        <AnimatePresence>
          {isShuffling && (
            <motion.div
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: [1, 1.4, 1] }}
              exit={{ opacity: 0, scale: 0.3 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute z-50 flex flex-col items-center justify-center pointer-events-none -translate-y-6"
            >
              <div className="w-28 h-28 rounded-full bg-gradient-to-r from-[#d4af37]/30 via-[#7f1d1d]/40 to-[#581c87]/30 blur-xl border-2 border-[#d4af37] flex items-center justify-center shadow-[0_0_60px_rgba(212,175,55,0.9)]">
                <Sparkles className="w-14 h-14 text-[#fef08a] animate-spin drop-shadow-[0_0_15px_rgba(250,204,21,1)]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dynamic Magical State Subtitle */}
      <div className="my-2 text-center">
        <motion.div
          key={choreographyStep}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-black/80 border-2 border-[#d4af37]/60 text-[#fef08a] text-xs font-cinzel tracking-widest uppercase shadow-[0_0_20px_rgba(212,175,55,0.3)]"
        >
          <Wand2 size={14} className="text-[#facc15] animate-pulse" />
          <span>
            {choreographyStep === 'ascend'
              ? '✦ Levitating 78 Cards into Mid-Air Sanctum...'
              : choreographyStep === 'dance' && activeStyle === 'vortex'
              ? '✦ Weaving the 3D Arcane Spiral Helix...'
              : choreographyStep === 'dance' && activeStyle === 'stream'
              ? '✦ Channelling the Triple Aerial Card Stream...'
              : choreographyStep === 'dance' && activeStyle === 'cascade'
              ? '✦ Riffling the Dragon-Scale Cascades...'
              : choreographyStep === 'dance'
              ? '✦ Spinning the 360° Sunburst Wheel...'
              : choreographyStep === 'bridge'
              ? '✦ Arching the 3D Magician’s Waterfall Bridge...'
              : choreographyStep === 'converge'
              ? '✦ Consecrating Deck Convergence...'
              : '✦ The 78-Card Rider-Waite Deck is Consecrated & Ready'}
          </span>
        </motion.div>
      </div>

      {/* Magical Shuffle Style Selectors */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
        {[
          { id: 'vortex', label: 'Spiral Vortex', icon: Wind },
          { id: 'stream', label: 'Triple Stream', icon: Layers },
          { id: 'cascade', label: 'Waterfall Cascade', icon: Compass },
          { id: 'wheel', label: '360° Wheel', icon: Sparkles }
        ].map((style) => {
          const IconComp = style.icon;
          const isCurrent = activeStyle === style.id;
          return (
            <button
              key={style.id}
              type="button"
              disabled={isShuffling}
              onClick={() => {
                setActiveStyle(style.id as ShuffleStyle);
                triggerShuffle(style.id as ShuffleStyle);
              }}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-cinzel font-semibold tracking-wider uppercase transition flex items-center gap-1.5 ${
                isCurrent
                  ? 'bg-gradient-to-r from-[#7f1d1d] to-[#b45309] text-[#fef08a] border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                  : 'bg-black/60 border-[#d4af37]/30 text-[#eedec5] hover:border-[#d4af37]/60 hover:text-white'
              }`}
            >
              <IconComp size={13} className="text-[#facc15]" />
              <span>{style.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Invoke Shuffle Button */}
      <div className="mt-5 z-20 flex flex-col items-center">
        <button
          onClick={() => triggerShuffle()}
          disabled={!canTrigger || isShuffling}
          className="px-10 py-4 rounded-2xl bg-gradient-to-r from-[#7f1d1d] via-[#581c87] to-[#b45309] hover:from-[#991b1b] hover:to-[#d97706] text-[#fef3c7] font-cinzel font-bold text-sm tracking-widest uppercase border-2 border-[#d4af37] shadow-[0_0_40px_rgba(212,175,55,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-3 hover:scale-105 active:scale-95 group"
        >
          <Layers
            size={20}
            className={`text-[#facc15] transition-transform duration-700 ${
              isShuffling ? 'rotate-180 animate-spin' : 'group-hover:rotate-180'
            }`}
          />
          <span>{isShuffling ? 'Weaving Sacred Arcana...' : 'Invoke Magical 3D Shuffle'}</span>
          <Flame size={18} className="text-[#fb923c] animate-pulse" />
        </button>

        <span className="text-xs text-[#e2d5b8]/75 font-serif italic mt-2.5 text-center">
          {isShuffling
            ? 'Watch the cards levitate, divide into the celestial vortex, and interlock in 3D space'
            : 'Click to witness the cards levitate and shuffle in authentic 3D magical choreography'}
        </span>
      </div>
    </div>
  );
};
