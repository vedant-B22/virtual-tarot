import React from 'react';
import { motion } from 'framer-motion';
import type { TarotCardData, CardCategory } from '../types/tarot';
import { Sparkles, Compass, Flame, Droplets, Wind, Mountain, Moon, Sun, Star } from 'lucide-react';

interface TarotCardProps {
  card?: TarotCardData | null;
  orientation?: 'upright' | 'reversed';
  category?: CardCategory;
  isRevealed?: boolean;
  isFlipping?: boolean;
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

  // Sizing configurations
  const sizeStyles = {
    sm: { width: '100px', height: '160px', text: 'text-xs', icon: 14 },
    md: { width: '160px', height: '260px', text: 'text-sm', icon: 18 },
    lg: { width: '220px', height: '360px', text: 'text-base', icon: 24 }
  }[size];

  // Category glow colors
  const getCategoryBadge = () => {
    if (!category) return null;
    const config = {
      Life: { bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-emerald-500/20', icon: '🌱' },
      Love: { bg: 'bg-pink-500/20 text-pink-300 border-pink-500/50 shadow-pink-500/20', icon: '💖' },
      Career: { bg: 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-amber-500/20', icon: '👑' }
    }[category];

    return (
      <div className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wider uppercase border shadow-lg backdrop-blur-md flex items-center gap-1.5 ${config.bg}`}>
        <span>{config.icon}</span>
        <span>{category}</span>
      </div>
    );
  };

  const getElementIcon = (element?: string) => {
    if (!element) return <Sparkles size={14} className="text-amber-400" />;
    if (element.includes('Fire')) return <Flame size={14} className="text-orange-400" />;
    if (element.includes('Water')) return <Droplets size={14} className="text-cyan-400" />;
    if (element.includes('Air')) return <Wind size={14} className="text-sky-300" />;
    if (element.includes('Earth')) return <Mountain size={14} className="text-emerald-400" />;
    return <Sparkles size={14} className="text-amber-400" />;
  };

  return (
    <div className={`flex flex-col items-center gap-2 select-none ${className}`}>
      {highlightCategory && category && (
        <div className="transition-all duration-300">
          {getCategoryBadge()}
        </div>
      )}

      <div
        onClick={interactive ? onClick : undefined}
        style={{ width: sizeStyles.width, height: sizeStyles.height }}
        className={`relative perspective-1000 ${interactive ? 'cursor-pointer' : ''}`}
      >
        <motion.div
          animate={{ rotateY: isRevealed ? 0 : 180 }}
          transition={{ duration: 0.7, type: 'spring', damping: 18 }}
          className="w-full h-full transform-style-3d relative rounded-xl shadow-2xl transition-all"
        >
          {/* ================= CARD FRONT (Face Up) ================= */}
          <div
            className={`absolute inset-0 w-full h-full backface-hidden rounded-xl overflow-hidden border-2 border-amber-400/60 bg-gradient-to-b from-[#1c162e] via-[#120f20] to-[#0a0814] p-2 flex flex-col justify-between shadow-lg shadow-purple-950/50`}
          >
            {/* Ornate Gold Border & Filigree */}
            <div className="absolute inset-1 rounded-lg border border-amber-400/20 pointer-events-none" />
            <div className="absolute top-1 left-1 text-amber-400/40 text-[9px]">✦</div>
            <div className="absolute top-1 right-1 text-amber-400/40 text-[9px]">✦</div>
            <div className="absolute bottom-1 left-1 text-amber-400/40 text-[9px]">✦</div>
            <div className="absolute bottom-1 right-1 text-amber-400/40 text-[9px]">✦</div>

            {/* Header: Roman numeral or rank + Element */}
            <div className="flex items-center justify-between px-1 z-10">
              <span className="font-serif font-bold text-amber-300 text-xs tracking-widest">
                {card?.roman || card?.rank || '★'}
              </span>
              <div className="flex items-center gap-1 opacity-80">
                {getElementIcon(card?.element)}
              </div>
            </div>

            {/* Card Illustration Artwork */}
            <div className={`relative flex-1 my-1.5 rounded border border-amber-500/20 overflow-hidden flex items-center justify-center bg-gradient-to-b from-purple-900/30 to-black/60 ${isReversed ? 'rotate-180' : ''}`}>
              {/* Radial mystic halo */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(217,119,6,0.15)_0%,_transparent_70%)]" />

              {/* Mystical SVG Art Motif */}
              <div className="relative z-10 flex flex-col items-center justify-center p-2 text-center">
                {card?.arcana === 'major' ? (
                  <div className="relative">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border border-amber-400/40 flex items-center justify-center bg-amber-400/5 shadow-inner">
                      {card.number !== undefined && card.number % 3 === 0 ? (
                        <Sun className="w-10 h-10 md:w-12 md:h-12 text-amber-400 animate-pulse-slow" />
                      ) : card.number !== undefined && card.number % 3 === 1 ? (
                        <Moon className="w-10 h-10 md:w-12 md:h-12 text-indigo-300 animate-pulse-slow" />
                      ) : (
                        <Star className="w-10 h-10 md:w-12 md:h-12 text-purple-300 animate-pulse-slow" />
                      )}
                    </div>
                    <div className="absolute -inset-2 border border-dashed border-amber-400/20 rounded-full animate-spin-slow pointer-events-none" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 md:w-18 md:h-18 rounded-full border border-purple-400/30 flex items-center justify-center bg-purple-500/10">
                      {card?.suitKey === 'wands' && <Flame className="w-8 h-8 text-orange-400" />}
                      {card?.suitKey === 'cups' && <Droplets className="w-8 h-8 text-cyan-400" />}
                      {card?.suitKey === 'swords' && <Compass className="w-8 h-8 text-purple-400" />}
                      {card?.suitKey === 'pentacles' && <Star className="w-8 h-8 text-yellow-400" />}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer: Card Name and Orientation status */}
            <div className="text-center z-10 px-0.5">
              <div className="font-serif font-semibold text-amber-100 leading-tight text-xs md:text-sm line-clamp-1 drop-shadow">
                {card?.name || 'Arcana'}
              </div>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <span className={`text-[10px] uppercase tracking-wider font-medium px-1.5 py-0.2 rounded ${
                  isReversed
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {isReversed ? 'Reversed ↺' : 'Upright ↑'}
                </span>
              </div>
            </div>
          </div>

          {/* ================= CARD BACK (Face Down) ================= */}
          <div
            className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-xl overflow-hidden border-2 border-amber-500/50 bg-gradient-to-br from-[#1b1033] via-[#0d071a] to-[#251240] p-2 flex flex-col items-center justify-center shadow-xl shadow-purple-950/60`}
          >
            {/* Intricate Card Back Pattern */}
            <div className="absolute inset-1.5 rounded-lg border border-amber-400/30 flex flex-col items-center justify-center overflow-hidden">
              {/* Sacred Geometric Pattern */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#facc15_1px,transparent_1px)] [background-size:10px_10px]" />
              
              {/* Central Cosmic Emblem */}
              <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full border border-amber-400/40 flex items-center justify-center bg-black/40 shadow-inner">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-amber-300/30 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-amber-300/80 animate-pulse" />
                </div>
              </div>

              {/* Corner Symbols */}
              <div className="absolute top-2 left-2 text-amber-400/50 text-[10px]">✧</div>
              <div className="absolute top-2 right-2 text-amber-400/50 text-[10px]">✧</div>
              <div className="absolute bottom-2 left-2 text-amber-400/50 text-[10px]">✧</div>
              <div className="absolute bottom-2 right-2 text-amber-400/50 text-[10px]">✧</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
