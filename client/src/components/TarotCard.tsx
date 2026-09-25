import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { TarotCardData, CardCategory } from '../types/tarot';
import { Sparkles, Flame, Droplets, Wind, Mountain } from 'lucide-react';

interface TarotCardProps {
  card?: TarotCardData | null;
  orientation?: 'upright' | 'reversed';
  category?: CardCategory;
  isRevealed?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  highlightCategory?: boolean;
  className?: string;
}

export const TarotCard: React.FC<TarotCardProps> = ({
  card,
  orientation = 'upright',
  category,
  isRevealed = true,
  onClick,
  size = 'md',
  interactive = false,
  highlightCategory = true,
  className = ''
}) => {
  const isReversed = orientation === 'reversed';
  const [imgError, setImgError] = useState(false);

  // Sizing configurations
  const sizeStyles = {
    sm: { width: '110px', height: '185px', text: 'text-[11px]' },
    md: { width: '165px', height: '280px', text: 'text-xs' },
    lg: { width: '225px', height: '380px', text: 'text-sm' }
  }[size];

  // Category glow badges (Gothic Altar Pedestals)
  const getCategoryBadge = () => {
    if (!category) return null;
    const config = {
      Life: { bg: 'bg-emerald-950/80 text-emerald-200 border-emerald-500/60 shadow-emerald-500/20', icon: '🕯️' },
      Love: { bg: 'bg-rose-950/80 text-rose-200 border-rose-500/60 shadow-rose-500/20', icon: '🍷' },
      Career: { bg: 'bg-amber-950/80 text-amber-200 border-amber-500/60 shadow-amber-500/20', icon: '⚔️' }
    }[category];

    return (
      <div className={`px-3 py-1 rounded-full text-[11px] font-cinzel font-bold tracking-widest uppercase border shadow-xl backdrop-blur-md flex items-center gap-1.5 ${config.bg}`}>
        <span>{config.icon}</span>
        <span>{category}</span>
      </div>
    );
  };

  const getElementIcon = (element?: string) => {
    if (!element) return <Sparkles size={13} className="text-amber-400" />;
    if (element.includes('Fire')) return <Flame size={13} className="text-orange-400" />;
    if (element.includes('Water')) return <Droplets size={13} className="text-cyan-400" />;
    if (element.includes('Air')) return <Wind size={13} className="text-sky-300" />;
    if (element.includes('Earth')) return <Mountain size={13} className="text-emerald-400" />;
    return <Sparkles size={13} className="text-amber-400" />;
  };

  return (
    <div className={`flex flex-col items-center gap-2.5 select-none ${className}`}>
      {highlightCategory && category && (
        <div className="transition-all duration-300">
          {getCategoryBadge()}
        </div>
      )}

      <div
        onClick={interactive ? onClick : undefined}
        style={{ width: sizeStyles.width, height: sizeStyles.height }}
        className={`relative perspective-1000 ${interactive ? 'cursor-pointer hover:scale-105 transition-transform duration-300' : ''}`}
      >
        <motion.div
          animate={{ rotateY: isRevealed ? 0 : 180 }}
          transition={{ duration: 0.8, type: 'spring', damping: 20 }}
          className="w-full h-full transform-style-3d relative rounded-2xl shadow-2xl transition-all"
        >
          {/* ================= CARD FRONT (Actual Historical Card Artwork) ================= */}
          <div
            className="absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden border-2 border-[#d4af37]/80 bg-gradient-to-b from-[#181126] via-[#0d0717] to-[#06040a] p-2 flex flex-col justify-between shadow-2xl shadow-black/80"
          >
            {/* Antique Gothic Gold Filigree Inner Frame */}
            <div className="absolute inset-1 rounded-xl border border-[#d4af37]/30 pointer-events-none" />
            <div className="absolute top-1.5 left-1.5 text-[#d4af37]/60 text-[10px]">❖</div>
            <div className="absolute top-1.5 right-1.5 text-[#d4af37]/60 text-[10px]">❖</div>
            <div className="absolute bottom-1.5 left-1.5 text-[#d4af37]/60 text-[10px]">❖</div>
            <div className="absolute bottom-1.5 right-1.5 text-[#d4af37]/60 text-[10px]">❖</div>

            {/* Header: Roman Numeral & Element */}
            <div className="flex items-center justify-between px-1.5 z-10">
              <span className="font-cinzel font-bold text-[#f3e5ab] text-xs tracking-widest drop-shadow">
                {card?.roman || card?.rank || '★'}
              </span>
              <div className="flex items-center gap-1 opacity-90 drop-shadow">
                {getElementIcon(card?.element)}
              </div>
            </div>

            {/* The Actual Tarot Card Illustration */}
            <div className={`relative flex-1 my-1 rounded-lg border border-[#d4af37]/40 overflow-hidden bg-black/60 flex items-center justify-center`}>
              {card?.image && !imgError ? (
                <img
                  src={card.image}
                  alt={card.name}
                  onError={() => setImgError(true)}
                  className={`w-full h-full object-cover transition-transform duration-500 ${
                    isReversed ? 'rotate-180' : ''
                  }`}
                  loading="lazy"
                />
              ) : (
                /* Fallback if image fails */
                <div className={`w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-b from-purple-950/40 to-black ${isReversed ? 'rotate-180' : ''}`}>
                  <div className="w-12 h-12 rounded-full border border-amber-400/40 flex items-center justify-center mb-1">
                    <Sparkles className="w-6 h-6 text-amber-300" />
                  </div>
                  <span className="font-cinzel font-bold text-xs text-amber-200">{card?.name}</span>
                </div>
              )}

              {/* Inverted watermark when card is reversed */}
              {isReversed && (
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 border border-rose-500/70 text-rose-300 text-[10px] font-cinzel font-bold uppercase tracking-wider backdrop-blur-sm pointer-events-none">
                  Reversed
                </div>
              )}
            </div>

            {/* Footer: Gothic Title & Orientation Badge */}
            <div className="text-center z-10 px-0.5">
              <div className="font-cinzel font-bold text-[#f5ebd7] leading-tight text-xs md:text-sm line-clamp-1 drop-shadow">
                {card?.name || 'Arcana'}
              </div>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <span className={`text-[10px] uppercase tracking-wider font-cinzel font-semibold px-2 py-0.5 rounded-full ${
                  isReversed
                    ? 'bg-rose-950/80 text-rose-300 border border-rose-500/50'
                    : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50'
                }`}>
                  {isReversed ? 'Reversed ↺' : 'Upright ↑'}
                </span>
              </div>
            </div>
          </div>

          {/* ================= CARD BACK (Cool Gothic Esoteric Mandala) ================= */}
          <div
            className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl overflow-hidden border-2 border-[#d4af37]/80 bg-gradient-to-br from-[#120a22] via-[#090514] to-[#1c0e35] p-2.5 flex flex-col items-center justify-center shadow-2xl shadow-black/90"
          >
            {/* Intricate Gothic Ornate Border */}
            <div className="absolute inset-1.5 rounded-xl border border-[#d4af37]/40 flex flex-col items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.08)_0%,_transparent_75%)]">
              {/* Esoteric Starfield Pattern */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:12px_12px]" />

              {/* Gothic All-Seeing Eye & Sacred Ouroboros Emblem */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-[#d4af37]/60 flex items-center justify-center bg-black/60 shadow-[0_0_20px_rgba(212,175,55,0.25)]">
                {/* Outer spinning runes ring */}
                <div className="absolute -inset-2.5 border border-dashed border-[#d4af37]/35 rounded-full animate-spin-slow pointer-events-none" />

                {/* Inner Sun / All-Seeing Mystic Seal */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-[#d4af37]/50 flex flex-col items-center justify-center bg-[#150c26]">
                  <div className="text-[#f3e5ab] text-lg sm:text-xl drop-shadow-[0_0_8px_rgba(212,175,55,0.8)] animate-pulse">
                    👁
                  </div>
                  <div className="text-[7px] font-cinzel text-[#d4af37] tracking-widest uppercase mt-0.5">
                    ARCANA
                  </div>
                </div>
              </div>

              {/* Corner Gothic Flourishes */}
              <div className="absolute top-2 left-2 text-[#d4af37]/70 text-xs font-serif">🜂</div>
              <div className="absolute top-2 right-2 text-[#d4af37]/70 text-xs font-serif">🜄</div>
              <div className="absolute bottom-2 left-2 text-[#d4af37]/70 text-xs font-serif">🜁</div>
              <div className="absolute bottom-2 right-2 text-[#d4af37]/70 text-xs font-serif">🜃</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
