import React from 'react';
import { Sparkles, Crown, Compass, Eye } from 'lucide-react';

export const FoundersBanner: React.FC = () => {
  return (
    <div className="w-full max-w-5xl mx-auto my-6 px-2 sm:px-4">
      {/* Ornate Gothic Vampire / Harry Potter Frame */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#24040e]/95 via-[#110319]/95 to-[#05010a]/98 border-2 border-[#d4af37]/70 shadow-[0_0_60px_rgba(212,175,55,0.3)] overflow-hidden">
        {/* Intricate Corner Filigree */}
        <div className="absolute top-2 left-3 text-[#d4af37]/60 text-sm pointer-events-none">❖</div>
        <div className="absolute top-2 right-3 text-[#d4af37]/60 text-sm pointer-events-none">❖</div>
        <div className="absolute bottom-2 left-3 text-[#d4af37]/60 text-sm pointer-events-none">❖</div>
        <div className="absolute bottom-2 right-3 text-[#d4af37]/60 text-sm pointer-events-none">❖</div>

        {/* Ambient Backlight Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-28 bg-[#d4af37]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Title Header */}
        <div className="text-center relative z-10 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-[#d4af37]/50 text-[#fef08a] text-xs font-cinzel tracking-widest uppercase mb-2 shadow-inner">
            <Sparkles size={13} className="text-[#facc15] animate-pulse" />
            <span>The Sacred Order of the Arcana</span>
            <Sparkles size={13} className="text-[#facc15] animate-pulse" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-gothic-title font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#fef08a] via-[#f3e5ab] to-[#d4af37] drop-shadow-[0_2px_15px_rgba(212,175,55,0.6)]">
            Guardians & Grand Founders
          </h2>
          <p className="text-xs sm:text-sm text-[#e2d5b8]/80 font-serif italic max-w-lg mx-auto mt-1">
            &ldquo;As above, so below. Every card drawn is a sacred thread in the tapestry of destiny.&rdquo;
          </p>
        </div>

        {/* Two Founders Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {/* Founder: Vedant Baviskar */}
          <div className="p-6 rounded-2xl bg-black/60 border-2 border-[#d4af37]/40 hover:border-[#d4af37] transition-all duration-300 shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#7f1d1d]/20 rounded-full blur-2xl pointer-events-none" />

            {/* Wax Seal Portrait Emblem */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#7f1d1d] via-[#581c87] to-[#1c1917] border-2 border-[#d4af37] flex items-center justify-center shadow-[0_0_25px_rgba(212,175,55,0.45)] group-hover:scale-105 transition-transform duration-300">
                <Crown size={36} className="text-[#fde047] drop-shadow-[0_0_12px_rgba(250,204,21,0.85)]" />
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#d4af37] text-black font-cinzel font-bold text-[10px] flex items-center justify-center border border-black shadow">
                I
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-cinzel text-[#d4af37] tracking-widest uppercase font-semibold">
                Grand Magus & Keeper of Arcana
              </div>
              <h3 className="font-gothic-title font-bold text-xl sm:text-2xl text-[#fef08a] tracking-wide">
                Vedant Baviskar
              </h3>
              <div className="text-xs text-[#d8b4fe] font-cinzel font-semibold">
                Founder & Principal Reader
              </div>
              <p className="text-xs text-[#eedec5]/90 font-serif leading-relaxed pt-1">
                Master practitioner of the 78 Rider-Waite esoteric archetypes, astrological alignments, and synchronistic timeline channeling.
              </p>
            </div>
          </div>

          {/* Co-Founder: Anvii Panchal */}
          <div className="p-6 rounded-2xl bg-black/60 border-2 border-[#d4af37]/40 hover:border-[#d4af37] transition-all duration-300 shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#831843]/20 rounded-full blur-2xl pointer-events-none" />

            {/* Wax Seal Portrait Emblem */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#831843] via-[#4c1d95] to-[#1c1917] border-2 border-[#d4af37] flex items-center justify-center shadow-[0_0_25px_rgba(212,175,55,0.45)] group-hover:scale-105 transition-transform duration-300">
                <Eye size={36} className="text-[#fde047] drop-shadow-[0_0_12px_rgba(250,204,21,0.85)]" />
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#d4af37] text-black font-cinzel font-bold text-[10px] flex items-center justify-center border border-black shadow">
                II
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-cinzel text-[#d4af37] tracking-widest uppercase font-semibold">
                High Priestess of Intuition & Harmony
              </div>
              <h3 className="font-gothic-title font-bold text-xl sm:text-2xl text-[#fef08a] tracking-wide">
                Anvii Panchal
              </h3>
              <div className="text-xs text-[#f472b6] font-cinzel font-semibold">
                Co-Founder & Sacred Curator
              </div>
              <p className="text-xs text-[#eedec5]/90 font-serif leading-relaxed pt-1">
                Overseeing sacred sanctuary atmosphere, energetic grounding, intuitive heart resonance, and relational soul alignments.
              </p>
            </div>
          </div>
        </div>

        {/* Sacred Covenant Badge */}
        <div className="mt-6 pt-4 border-t border-[#d4af37]/25 flex flex-wrap items-center justify-center gap-6 text-[11px] text-[#d4af37]/90 font-cinzel tracking-wider text-center">
          <span className="flex items-center gap-1.5">
            <Compass size={13} className="text-amber-400" />
            Consecrated Readings by Invitation & Reader Approval
          </span>
          <span>•</span>
          <span>78 Authentic Rider-Waite Mysteries</span>
          <span>•</span>
          <span>Real-Time Bi-Directional Virtual Chamber</span>
        </div>
      </div>
    </div>
  );
};
