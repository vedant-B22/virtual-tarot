import React from 'react';
import { Crown, Compass, Eye, Sparkles } from 'lucide-react';

export const FoundersBanner: React.FC = () => {
  return (
    <div className="w-full max-w-5xl mx-auto my-6 px-2 sm:px-4">
      {/* High-End Esoteric Luxury Shield Frame */}
      <div className="relative rounded-3xl p-6 sm:p-9 bg-gradient-to-b from-[#14060f]/95 via-[#0b0413]/95 to-[#050209]/98 border border-[#c5a059]/40 shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden backdrop-blur-2xl">
        {/* Antique Gold Corner Rosettes */}
        <div className="absolute top-3 left-4 text-[#c5a059]/60 text-xs pointer-events-none select-none">❖</div>
        <div className="absolute top-3 right-4 text-[#c5a059]/60 text-xs pointer-events-none select-none">❖</div>
        <div className="absolute bottom-3 left-4 text-[#c5a059]/60 text-xs pointer-events-none select-none">❖</div>
        <div className="absolute bottom-3 right-4 text-[#c5a059]/60 text-xs pointer-events-none select-none">❖</div>

        {/* Ambient Warm Candlelight Back-Glow */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-80 h-28 bg-[#c5a059]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Heraldic Header */}
        <div className="text-center relative z-10 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-black/60 border border-[#c5a059]/30 text-[#e5c158] text-[11px] font-cinzel tracking-[0.2em] uppercase mb-2 shadow-inner">
            <Sparkles size={12} className="text-[#e5c158] animate-pulse" />
            <span>The High Conclave & Keepers of the Arcana</span>
            <Sparkles size={12} className="text-[#e5c158] animate-pulse" />
          </div>

          <h2 className="text-2xl sm:text-4xl font-gothic-title font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#f7eedc] via-[#e5c158] to-[#c5a059] drop-shadow-[0_2px_12px_rgba(197,160,89,0.35)] tracking-wide">
            House of Baviskar & Panchal
          </h2>

          <p className="text-xs sm:text-sm text-[#baa890] font-serif italic max-w-xl mx-auto mt-2 leading-relaxed">
            &ldquo;As above, so below. Every card drawn is a sacred thread in the eternal tapestry of destiny.&rdquo;
          </p>
        </div>

        {/* Two Grand Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {/* Founder: Vedant Baviskar */}
          <div className="p-6 sm:p-7 rounded-2xl bg-[#090510]/80 border border-[#c5a059]/25 hover:border-[#c5a059]/60 transition-all duration-500 shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#4c0519]/15 rounded-full blur-3xl pointer-events-none" />

            {/* Regal Crest Emblem */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#2a0614] via-[#1a0724] to-[#07020d] border border-[#c5a059]/80 flex items-center justify-center shadow-[0_0_25px_rgba(197,160,89,0.3)] group-hover:scale-105 transition-transform duration-300">
                <Crown size={36} className="text-[#fde047] drop-shadow-[0_0_10px_rgba(250,204,21,0.7)]" />
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded-md bg-[#c5a059] text-black font-cinzel font-bold text-[9px] border border-black shadow">
                MAGUS
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-[10px] font-cinzel text-[#c5a059] tracking-[0.2em] uppercase font-bold">
                Grand Magus & Principal Reader
              </div>
              <h3 className="font-gothic-title font-bold text-xl sm:text-2xl text-[#f7eedc] tracking-wide">
                Vedant Baviskar
              </h3>
              <div className="text-xs text-[#d4af37]/90 font-cinzel italic">
                Founder & Sovereign Diviner
              </div>
              <p className="text-xs text-[#baa890] font-serif leading-relaxed pt-1">
                Master practitioner of the 78 esoteric Rider-Waite archetypes, astrological transits, and synchronistic timeline illumination.
              </p>
            </div>
          </div>

          {/* Co-Founder: Anvii Panchal */}
          <div className="p-6 sm:p-7 rounded-2xl bg-[#090510]/80 border border-[#c5a059]/25 hover:border-[#c5a059]/60 transition-all duration-500 shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#3b0764]/15 rounded-full blur-3xl pointer-events-none" />

            {/* Regal Crest Emblem */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#24082e] via-[#1a0724] to-[#07020d] border border-[#c5a059]/80 flex items-center justify-center shadow-[0_0_25px_rgba(197,160,89,0.3)] group-hover:scale-105 transition-transform duration-300">
                <Eye size={36} className="text-[#fde047] drop-shadow-[0_0_10px_rgba(250,204,21,0.7)]" />
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded-md bg-[#c5a059] text-black font-cinzel font-bold text-[9px] border border-black shadow">
                PRIESTESS
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-[10px] font-cinzel text-[#c5a059] tracking-[0.2em] uppercase font-bold">
                High Priestess of Intuition & Harmony
              </div>
              <h3 className="font-gothic-title font-bold text-xl sm:text-2xl text-[#f7eedc] tracking-wide">
                Anvii Panchal
              </h3>
              <div className="text-xs text-[#d4af37]/90 font-cinzel italic">
                Co-Founder & Sacred Curator
              </div>
              <p className="text-xs text-[#baa890] font-serif leading-relaxed pt-1">
                Overseeing energetic resonance, intuitive heart truth, relational soul archetypes, and harmonic sanctuary sanctification.
              </p>
            </div>
          </div>
        </div>

        {/* Sacred Covenant Badge */}
        <div className="mt-6 pt-5 border-t border-[#c5a059]/20 flex flex-wrap items-center justify-center gap-6 text-[11px] text-[#baa890] font-cinzel tracking-wider text-center">
          <span className="flex items-center gap-1.5">
            <Compass size={13} className="text-[#c5a059]" />
            Private Consecrated Sanctuary • Readings by Solemn Reader Approval
          </span>
        </div>
      </div>
    </div>
  );
};
