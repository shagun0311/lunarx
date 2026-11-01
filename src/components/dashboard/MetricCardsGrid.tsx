/**
 * LUNARX Metric Cards Grid
 * Displays 4 prominent essential metrics:
 * 1. Solar Elevation
 * 2. Time Until Sunset
 * 3. Earth Visibility
 * 4. Terrain Slope
 * With an expandable detail drawer for the full scientific telemetry suite.
 * Integrates theme colors, density scaling, and data panel preferences.
 */

import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Clock, 
  Sunset, 
  Sunrise, 
  Globe, 
  Radio, 
  Mountain, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Zap,
  Thermometer
} from 'lucide-react';
import { SiteEvaluationMetrics, LunarSite } from '../../types/lunar';
import { useTheme } from '../../context/ThemeContext';

interface MetricCardsGridProps {
  metrics: SiteEvaluationMetrics;
  selectedSite: LunarSite;
  className?: string;
}

export const MetricCardsGrid: React.FC<MetricCardsGridProps> = ({
  metrics,
  selectedSite,
  className = ''
}) => {
  const { settings } = useTheme();
  const [showDetailedTelemetry, setShowDetailedTelemetry] = useState<boolean>(
    settings.dataPanelAppearance === 'detailed'
  );

  useEffect(() => {
    setShowDetailedTelemetry(settings.dataPanelAppearance === 'detailed');
  }, [settings.dataPanelAppearance]);

  const isSunlit = metrics.solarElevationDeg > 0;
  const isSafeSlope = metrics.terrainSlopeDeg <= 10.0;
  const isModerateSlope = metrics.terrainSlopeDeg > 10.0 && metrics.terrainSlopeDeg <= 15.0;

  const isCompact = settings.density === 'compact';
  const isSpacious = settings.density === 'spacious';

  const cardPadding = isCompact ? 'p-3' : isSpacious ? 'p-5' : 'p-4';
  const metricTextSize = isCompact ? 'text-xl sm:text-2xl' : isSpacious ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl';

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 4 Prominent Essential Metrics Grid */}
      <div className={`grid grid-cols-2 lg:grid-cols-4 ${isCompact ? 'gap-2' : isSpacious ? 'gap-4' : 'gap-3'}`}>
        {/* 1. Solar Elevation */}
        <div 
          className={`rounded-xl border transition-all ${cardPadding} pearl-shimmer`}
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)'
          }}
        >
          <div className="flex items-center justify-between opacity-70 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Solar Elevation</span>
            <Sun className={`w-4 h-4 ${isSunlit ? 'text-amber-400' : 'opacity-40'}`} />
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span 
              className={`${metricTextSize} font-bold font-mono tracking-tight`}
              style={{ color: isSunlit ? '#f59e0b' : 'var(--text-muted)' }}
            >
              {metrics.solarElevationDeg > 0 ? `+${metrics.solarElevationDeg}` : metrics.solarElevationDeg}°
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono opacity-80">
            <span className={isSunlit ? 'text-amber-400' : 'opacity-60'}>
              {isSunlit ? 'Above Horizon' : 'Sub-Horizon'}
            </span>
            <span className="text-[10px] opacity-60">{metrics.solarFluxWm2} W/m²</span>
          </div>
        </div>

        {/* 2. Time Until Sunset */}
        <div 
          className={`rounded-xl border transition-all ${cardPadding} pearl-shimmer`}
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)'
          }}
        >
          <div className="flex items-center justify-between opacity-70 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Time to Sunset</span>
            <Sunset className="w-4 h-4 text-orange-400" />
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span 
              className={`${metricTextSize} font-bold font-mono tracking-tight`}
              style={{ color: isSunlit ? '#fb923c' : 'var(--text-muted)' }}
            >
              {isSunlit ? metrics.timeUntilSunsetHours : 0}
            </span>
            <span className="text-xs font-mono opacity-60">hrs</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono opacity-80">
            <span>{isSunlit ? `${(metrics.timeUntilSunsetHours / 24).toFixed(1)} Earth days` : 'Night Phase'}</span>
            <span className="text-[10px] opacity-60">Annual: {selectedSite.annualIlluminationPct}%</span>
          </div>
        </div>

        {/* 3. Earth Visibility */}
        <div 
          className={`rounded-xl border transition-all ${cardPadding} pearl-shimmer`}
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)'
          }}
        >
          <div className="flex items-center justify-between opacity-70 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Earth Visibility</span>
            <Radio 
              className="w-4 h-4" 
              style={{ color: metrics.earthVisibility === 'Direct Line of Sight' ? '#10b981' : '#f59e0b' }} 
            />
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className={`${isCompact ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'} font-bold font-mono tracking-tight ${
              metrics.earthVisibility === 'Direct Line of Sight'
                ? 'text-emerald-400'
                : metrics.earthVisibility === 'Near Horizon Grazing'
                  ? 'text-amber-400'
                  : 'text-rose-400'
            }`}>
              {metrics.earthVisibility === 'Direct Line of Sight' ? 'DIRECT LOS' : metrics.earthVisibility === 'Near Horizon Grazing' ? 'GRAZING' : 'OCCULTED'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono opacity-80">
            <span>Look: {metrics.earthElevationDeg > 0 ? `+${metrics.earthElevationDeg}` : metrics.earthElevationDeg}°</span>
            <span className="text-[10px] opacity-60">{metrics.commSignalStrengthDbm} dBm</span>
          </div>
        </div>

        {/* 4. Terrain Slope */}
        <div 
          className={`rounded-xl border transition-all ${cardPadding} pearl-shimmer`}
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)'
          }}
        >
          <div className="flex items-center justify-between opacity-70 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Terrain Slope</span>
            <Mountain 
              className="w-4 h-4" 
              style={{ color: isSafeSlope ? '#10b981' : isModerateSlope ? '#f59e0b' : '#f43f5e' }} 
            />
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span 
              className={`${metricTextSize} font-bold font-mono tracking-tight`}
              style={{ color: isSafeSlope ? '#10b981' : isModerateSlope ? '#f59e0b' : '#f43f5e' }}
            >
              {metrics.terrainSlopeDeg}°
            </span>
            <span className="text-xs font-mono opacity-60">mean</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className={isSafeSlope ? 'text-emerald-400' : isModerateSlope ? 'text-amber-400' : 'text-rose-400'}>
              {isSafeSlope ? 'Safe (<10°)' : isModerateSlope ? 'Caution (10-15°)' : 'Hazard (>15°)'}
            </span>
            <span className="text-[10px] opacity-60">Max: {selectedSite.maxSlopeDeg}°</span>
          </div>
        </div>
      </div>

      {/* Expandable Scientific Detail Drawer Toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowDetailedTelemetry(!showDetailedTelemetry)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-mono transition-colors opacity-80 hover:opacity-100"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-secondary)'
          }}
        >
          <span>{showDetailedTelemetry ? 'Hide Extended Telemetry' : 'Extended Scientific Telemetry (6 metrics)'}</span>
          {showDetailedTelemetry ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Detailed Scientific Metrics (Expandable) */}
      {showDetailedTelemetry && (
        <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1 animate-fadeIn`}>
          {/* Sunlight Duration */}
          <div 
            className="rounded-lg border p-2.5"
            style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)' }}
          >
            <span className="text-[9px] font-mono uppercase opacity-60 block mb-0.5">Sunlight Window</span>
            <span className="text-base font-bold font-mono" style={{ color: settings.accentColor }}>
              {metrics.sunlightDurationHours}h
            </span>
            <span className="text-[10px] opacity-60 block font-mono">
              {(metrics.sunlightDurationHours / 24).toFixed(1)} Earth days
            </span>
          </div>

          {/* Time until Sunrise */}
          <div 
            className="rounded-lg border p-2.5"
            style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)' }}
          >
            <span className="text-[9px] font-mono uppercase opacity-60 block mb-0.5">Time to Dawn</span>
            <span className="text-base font-bold font-mono text-yellow-300">
              {metrics.timeUntilSunriseHours}h
            </span>
            <span className="text-[10px] opacity-60 block font-mono">
              {metrics.timeUntilSunriseHours > 0 ? `${(metrics.timeUntilSunriseHours / 24).toFixed(1)}d night` : 'Sun Up'}
            </span>
          </div>

          {/* Earth Elevation Angle */}
          <div 
            className="rounded-lg border p-2.5"
            style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)' }}
          >
            <span className="text-[9px] font-mono uppercase opacity-60 block mb-0.5">Earth Look-Angle</span>
            <span className={`text-base font-bold font-mono ${metrics.earthElevationDeg > 0 ? 'text-blue-400' : 'text-rose-400'}`}>
              {metrics.earthElevationDeg > 0 ? `+${metrics.earthElevationDeg}` : metrics.earthElevationDeg}°
            </span>
            <span className="text-[10px] opacity-60 block font-mono">
              {metrics.earthElevationDeg > 0 ? 'Direct Sky' : 'Occulted'}
            </span>
          </div>

          {/* Surface Temperature */}
          <div 
            className="rounded-lg border p-2.5"
            style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)' }}
          >
            <span className="text-[9px] font-mono uppercase opacity-60 block mb-0.5">Surface Temp</span>
            <span className="text-base font-bold font-mono" style={{ color: settings.accentColor }}>
              {metrics.surfaceTemperatureK} K
            </span>
            <span className="text-[10px] opacity-60 block font-mono">
              ({metrics.surfaceTemperatureK - 273}°C)
            </span>
          </div>

          {/* Simulated Solar Output */}
          <div 
            className="rounded-lg border p-2.5"
            style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)' }}
          >
            <span className="text-[9px] font-mono uppercase opacity-60 block mb-0.5">Array Output (100m²)</span>
            <span className="text-base font-bold font-mono text-emerald-400">
              {metrics.powerOutputKw} kW
            </span>
            <span className="text-[10px] opacity-60 block font-mono">
              GaInP / GaAs
            </span>
          </div>

          {/* DTE Comm Latency */}
          <div 
            className="rounded-lg border p-2.5"
            style={{ backgroundColor: 'var(--bg-card-subtle)', borderColor: 'var(--border-color)' }}
          >
            <span className="text-[9px] font-mono uppercase opacity-60 block mb-0.5">Light-Time Delay</span>
            <span className="text-base font-bold font-mono text-purple-400">
              {metrics.dteLatencySec}s
            </span>
            <span className="text-[10px] opacity-60 block font-mono">
              Round-trip {(metrics.dteLatencySec * 2).toFixed(2)}s
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
