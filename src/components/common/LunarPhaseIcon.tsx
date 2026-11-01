/**
 * LUNARX Lunar Phase & Moon Icon Suite
 * Tasteful, scientifically grounded lunar phase visualizers, crescent illustrations,
 * elegant loading animation, and empty states.
 */

import React from 'react';

export type LunarPhaseName = 
  | 'New Moon' 
  | 'Waxing Crescent' 
  | 'First Quarter' 
  | 'Waxing Gibbous' 
  | 'Full Moon' 
  | 'Waning Gibbous' 
  | 'Last Quarter' 
  | 'Waning Crescent';

export function getLunarPhaseFromProgress(progressPct: number): {
  phase: LunarPhaseName;
  illuminationPct: number;
  description: string;
} {
  const norm = ((progressPct % 100) + 100) % 100;
  
  if (norm < 3 || norm >= 97) {
    return { phase: 'New Moon', illuminationPct: 0, description: 'Sun and Moon aligned on farside; nearside in darkness' };
  } else if (norm < 22) {
    return { phase: 'Waxing Crescent', illuminationPct: Math.round(norm * 2.2), description: 'Silver sliver visible in western post-sunset sky' };
  } else if (norm < 28) {
    return { phase: 'First Quarter', illuminationPct: 50, description: 'Eastern half of lunar disk fully illuminated' };
  } else if (norm < 47) {
    return { phase: 'Waxing Gibbous', illuminationPct: Math.round(50 + (norm - 25) * 2), description: 'Terminator advancing westward across maria' };
  } else if (norm < 53) {
    return { phase: 'Full Moon', illuminationPct: 100, description: 'Direct sub-solar noon on lunar nearside' };
  } else if (norm < 72) {
    return { phase: 'Waning Gibbous', illuminationPct: Math.round(100 - (norm - 50) * 2), description: 'Eastern limb entering lunar night' };
  } else if (norm < 78) {
    return { phase: 'Last Quarter', illuminationPct: 50, description: 'Western half of lunar disk fully illuminated' };
  } else {
    return { phase: 'Waning Crescent', illuminationPct: Math.round(50 - (norm - 75) * 2.2), description: 'Final illuminated crescent before next new cycle' };
  }
}

interface LunarPhaseIconProps {
  progressPct?: number;
  phase?: LunarPhaseName;
  size?: number;
  className?: string;
  showLabel?: boolean;
}

export const LunarPhaseIcon: React.FC<LunarPhaseIconProps> = ({
  progressPct = 50,
  phase,
  size = 20,
  className = '',
  showLabel = false
}) => {
  const phaseInfo = phase ? { phase, illuminationPct: 50 } : getLunarPhaseFromProgress(progressPct);
  const activePhase = phaseInfo.phase;

  // Render SVG disk with accurate shadow terminator curve
  const r = size / 2;
  const strokeColor = 'rgba(255, 255, 255, 0.4)';
  const litColor = '#e2e8f0'; // Pearl silver
  const darkColor = 'rgba(15, 23, 42, 0.95)';

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 24 24" className="shrink-0 overflow-visible">
        {/* Outer Halo */}
        <circle cx="12" cy="12" r="11" fill={darkColor} stroke={strokeColor} strokeWidth="1" />
        
        {/* Phase-specific shaded overlay */}
        {activePhase === 'New Moon' && (
          <circle cx="12" cy="12" r="10.5" fill="rgba(30, 41, 59, 0.9)" />
        )}

        {activePhase === 'Waxing Crescent' && (
          <path d="M 12 1.5 A 10.5 10.5 0 0 1 12 22.5 A 6 10.5 0 0 0 12 1.5" fill={litColor} />
        )}

        {activePhase === 'First Quarter' && (
          <path d="M 12 1.5 A 10.5 10.5 0 0 1 12 22.5 Z" fill={litColor} />
        )}

        {activePhase === 'Waxing Gibbous' && (
          <>
            <circle cx="12" cy="12" r="10.5" fill={litColor} />
            <path d="M 12 1.5 A 10.5 10.5 0 0 0 12 22.5 A 6 10.5 0 0 1 12 1.5" fill={darkColor} />
          </>
        )}

        {activePhase === 'Full Moon' && (
          <>
            <circle cx="12" cy="12" r="10.5" fill={litColor} />
            {/* Subtle crater details on full disk */}
            <circle cx="10" cy="8" r="2" fill="rgba(148, 163, 184, 0.35)" />
            <circle cx="15" cy="13" r="2.8" fill="rgba(148, 163, 184, 0.35)" />
            <circle cx="9" cy="15" r="1.5" fill="rgba(148, 163, 184, 0.3)" />
          </>
        )}

        {activePhase === 'Waning Gibbous' && (
          <>
            <circle cx="12" cy="12" r="10.5" fill={litColor} />
            <path d="M 12 1.5 A 10.5 10.5 0 0 1 12 22.5 A 6 10.5 0 0 0 12 1.5" fill={darkColor} />
          </>
        )}

        {activePhase === 'Last Quarter' && (
          <path d="M 12 1.5 A 10.5 10.5 0 0 0 12 22.5 Z" fill={litColor} />
        )}

        {activePhase === 'Waning Crescent' && (
          <path d="M 12 1.5 A 10.5 10.5 0 0 0 12 22.5 A 6 10.5 0 0 1 12 1.5" fill={litColor} />
        )}
      </svg>

      {showLabel && (
        <span className="text-xs font-mono font-medium tracking-tight">
          {activePhase}
        </span>
      )}
    </div>
  );
};

/**
 * Elegant Moon Loading Indicator
 */
export const MoonLoader: React.FC<{ label?: string }> = ({ label = 'Acquiring Lunar Ephemerides...' }) => (
  <div className="flex flex-col items-center justify-center p-8 space-y-3 select-none">
    <div className="relative w-12 h-12 flex items-center justify-center">
      {/* Outer Pulse Orbit */}
      <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-ping opacity-25"></div>
      {/* Middle Orbit Track */}
      <div className="absolute inset-0 rounded-full border border-dashed border-slate-600/60 animate-spin" style={{ animationDuration: '8s' }}></div>
      {/* Core Glowing Moon Disk */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 shadow-lg shadow-cyan-500/20 flex items-center justify-center relative overflow-hidden">
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-slate-900/40"></div>
        <div className="absolute bottom-1 left-2 w-2 h-2 rounded-full bg-slate-500/30"></div>
      </div>
    </div>
    <span className="text-xs font-mono text-slate-400 tracking-wider uppercase">
      {label}
    </span>
  </div>
);

/**
 * Tasteful Lunar Empty State Illustration
 */
export const LunarEmptyState: React.FC<{
  title: string;
  description: string;
  actionButton?: React.ReactNode;
}> = ({ title, description, actionButton }) => (
  <div className="flex flex-col items-center justify-center text-center p-8 rounded-xl border border-slate-800/60 bg-[#070b16]/60 max-w-md mx-auto space-y-3">
    <div className="w-16 h-16 rounded-full bg-[#0d162a] border border-cyan-500/30 flex items-center justify-center relative">
      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-400 to-slate-200 opacity-90 relative overflow-hidden shadow-inner">
        <div className="absolute top-1 right-1 w-6 h-6 rounded-full bg-[#0d162a] opacity-80"></div>
      </div>
      {/* Subtle orbiting satellite dot */}
      <div className="absolute -top-1 right-2 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
    </div>
    <h4 className="text-sm font-mono font-semibold text-white tracking-wide uppercase">
      {title}
    </h4>
    <p className="text-xs text-slate-400 font-sans leading-relaxed">
      {description}
    </p>
    {actionButton && (
      <div className="pt-1">
        {actionButton}
      </div>
    )}
  </div>
);
