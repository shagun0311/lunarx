/**
 * LUNARX Mission Control Header
 * Clean, spacious, observatory-grade header with telemetry clocks,
 * real-time lunar phase indicators, target quick-selector, and Personalisation Studio.
 */

import React, { useState, useEffect } from 'react';
import { 
  Rocket, 
  Clock, 
  Server, 
  Settings, 
  ShieldCheck, 
  Moon, 
  Palette, 
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { LunarSite, MissionTimeState, BackendStatus } from '../../types/lunar';
import { LUNAR_LANDING_SITES } from '../../data/lunarSites';
import { useTheme } from '../../context/ThemeContext';
import { LunarPhaseIcon, getLunarPhaseFromProgress } from '../common/LunarPhaseIcon';
import { PWAInstallButton } from '../pwa/PWAInstallButton';

interface MissionHeaderProps {
  selectedSite: LunarSite;
  onSelectSite: (site: LunarSite) => void;
  timeState: MissionTimeState;
  backendStatus: BackendStatus;
  onOpenBackendSettings: () => void;
}

export const MissionHeader: React.FC<MissionHeaderProps> = ({
  selectedSite,
  onSelectSite,
  timeState,
  backendStatus,
  onOpenBackendSettings
}) => {
  const [utcTime, setUtcTime] = useState<string>('');
  const { settings, openPersonalisationStudio } = useTheme();

  const phaseInfo = getLunarPhaseFromProgress(timeState.lunarDayProgressPct);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header 
      className="w-full border-b px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 z-30 select-none transition-colors"
      style={{
        backgroundColor: 'var(--bg-header)',
        borderColor: 'var(--border-color)',
        color: 'var(--text-primary)'
      }}
    >
      {/* Brand & Quick Target Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div 
            className="w-7 h-7 rounded-lg flex items-center justify-center border shadow-sm transition-colors"
            style={{ 
              backgroundColor: `${settings.accentColor}25`, 
              borderColor: `${settings.accentColor}60` 
            }}
          >
            <Moon className="w-4 h-4" style={{ color: settings.accentColor }} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-bold tracking-wider text-base font-mono">
                LUNAR<span style={{ color: settings.accentColor }}>X</span>
              </span>
              <span 
                className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded border"
                style={{
                  backgroundColor: `${settings.accentColor}18`,
                  color: settings.accentColor,
                  borderColor: `${settings.accentColor}40`
                }}
              >
                STUDIO
              </span>
            </div>
          </div>
        </div>

        <div className="hidden md:block h-5 w-[1px] opacity-40" style={{ backgroundColor: 'var(--border-color)' }}></div>

        {/* Target Site Dropdown */}
        <div className="relative group hidden sm:block">
          <div className="relative">
            <select
              value={selectedSite.id}
              onChange={(e) => {
                const found = LUNAR_LANDING_SITES.find(s => s.id === e.target.value);
                if (found) onSelectSite(found);
              }}
              className="appearance-none border text-xs font-mono rounded pl-2.5 pr-7 py-1 focus:outline-none cursor-pointer transition-colors"
              style={{
                backgroundColor: 'var(--bg-input)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
            >
              {LUNAR_LANDING_SITES.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 opacity-50 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Clocks, Ephemeris & Real-Time Lunar Phase Indicator */}
      <div className="hidden lg:flex items-center gap-5 text-xs font-mono">
        {/* Real-time Lunar Phase Indicator */}
        <div 
          className="flex items-center gap-2 px-2.5 py-1 rounded-full border transition-all"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)'
          }}
          title={phaseInfo.description}
        >
          <LunarPhaseIcon progressPct={timeState.lunarDayProgressPct} size={16} />
          <span className="text-[11px] font-medium" style={{ color: settings.accentColor }}>
            {phaseInfo.phase}
          </span>
          <span className="text-[10px] opacity-60">
            ({phaseInfo.illuminationPct}%)
          </span>
        </div>

        <div className="flex items-center gap-1.5 opacity-80">
          <Clock className="w-3.5 h-3.5 opacity-60" />
          <span className="text-[11px] opacity-60">UTC:</span>
          <span className="font-medium">{utcTime || 'SYNCING...'}</span>
        </div>

        <div className="flex items-center gap-1.5 opacity-80">
          <Rocket className="w-3.5 h-3.5" style={{ color: settings.accentColor }} />
          <span className="text-[11px] opacity-60">MET:</span>
          <span className="font-medium">{timeState.metString}</span>
        </div>
      </div>

      {/* Right Controls: Personalisation Studio, PWA Install & Backend Status */}
      <div className="flex items-center gap-2">
        {/* PWA Install Button */}
        <PWAInstallButton variant="compact" />

        {/* Personalisation Studio Trigger Button */}
        <button
          onClick={openPersonalisationStudio}
          title="Open Personalisation Studio (Themes, Colors, Density, Display)"
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg border font-mono text-xs font-semibold shadow-sm transition-all hover:scale-102"
          style={{
            backgroundColor: `${settings.accentColor}20`,
            borderColor: `${settings.accentColor}60`,
            color: settings.accentColor
          }}
        >
          <Palette className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">STUDIO</span>
        </button>

        {/* Backend Status indicator */}
        <button
          onClick={onOpenBackendSettings}
          title="Configure Python FastAPI Scientific Backend"
          className="flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-mono transition-colors"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-secondary)'
          }}
        >
          <Server className={`w-3.5 h-3.5 ${backendStatus.connected ? 'text-emerald-400' : 'text-amber-400'}`} />
          <span className="text-[11px] font-medium hidden sm:inline">
            {backendStatus.connected ? 'FastAPI Online' : 'Client Ephemeris'}
          </span>
          <Settings className="w-3.5 h-3.5 opacity-60 hover:opacity-100" />
        </button>

        <div 
          className="hidden xl:flex items-center gap-1.5 px-2 py-1 rounded border text-[10px] font-mono opacity-80"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)'
          }}
        >
          <ShieldCheck className="w-3 h-3" style={{ color: settings.accentColor }} />
          <span>LRO LOLA</span>
        </div>
      </div>
    </header>
  );
};
