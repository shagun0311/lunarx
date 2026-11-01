/**
 * LUNARX Mission Overview View
 * Redesigned for visual clarity, spaciousness, and commanding 3D Moon presence.
 * Features 4 prominent essential metrics, a spacious 3D lunar observatory viewport,
 * and an uncluttered candidate evaluation table.
 */

import React, { useState } from 'react';
import { 
  LunarSite, 
  LunarCoordinates, 
  SiteEvaluationMetrics, 
  MissionTimeState 
} from '../../types/lunar';
import { LUNAR_LANDING_SITES } from '../../data/lunarSites';
import { MetricCardsGrid } from '../dashboard/MetricCardsGrid';
import { LunarGlobe3D } from '../explorer/LunarGlobe3D';
import { useTheme } from '../../context/ThemeContext';
import { LunarPhaseIcon, getLunarPhaseFromProgress } from '../common/LunarPhaseIcon';
import { 
  Target, 
  ArrowUpRight, 
  Compass, 
  CheckCircle2, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface MissionOverviewViewProps {
  selectedSite: LunarSite;
  onSelectSite: (site: LunarSite) => void;
  metrics: SiteEvaluationMetrics;
  timeState: MissionTimeState;
  customCoordinates: LunarCoordinates | null;
  onNavigateToTab: (tab: any) => void;
}

export const MissionOverviewView: React.FC<MissionOverviewViewProps> = ({
  selectedSite,
  onSelectSite,
  metrics,
  timeState,
  customCoordinates,
  onNavigateToTab
}) => {
  const { settings } = useTheme();
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const phaseInfo = getLunarPhaseFromProgress(timeState.lunarDayProgressPct);

  const isCompact = settings.density === 'compact';
  const isSpacious = settings.density === 'spacious';

  const filteredSites = filterCategory === 'All'
    ? LUNAR_LANDING_SITES
    : LUNAR_LANDING_SITES.filter(s => s.category === filterCategory);

  return (
    <div className={`${isCompact ? 'space-y-4' : isSpacious ? 'space-y-8' : 'space-y-6'} pb-12 max-w-7xl mx-auto`}>
      {/* Target Site Header (Clean, spacious, authoritative) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span 
              className="text-[10px] font-mono uppercase tracking-widest font-semibold px-2 py-0.5 rounded border"
              style={{
                backgroundColor: `${settings.accentColor}18`,
                color: settings.accentColor,
                borderColor: `${settings.accentColor}40`
              }}
            >
              TARGET REGION • {selectedSite.code}
            </span>
            <span className="text-xs font-mono opacity-70">
              {selectedSite.category}
            </span>
            <div 
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            >
              <LunarPhaseIcon progressPct={timeState.lunarDayProgressPct} size={14} />
              <span style={{ color: settings.accentColor }}>{phaseInfo.phase}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-mono font-bold tracking-tight">
            {selectedSite.name}
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono opacity-80 mt-2">
            <span>
              Lat: <strong style={{ color: 'var(--text-primary)' }}>{selectedSite.coordinates.lat >= 0 ? `+${selectedSite.coordinates.lat}° N` : `${Math.abs(selectedSite.coordinates.lat)}° S`}</strong>
            </span>
            <span>
              Lng: <strong style={{ color: 'var(--text-primary)' }}>{selectedSite.coordinates.lng >= 0 ? `+${selectedSite.coordinates.lng}° E` : `${Math.abs(selectedSite.coordinates.lng)}° W`}</strong>
            </span>
            <span>
              Datum: <strong style={{ color: 'var(--text-primary)' }}>{selectedSite.elevationM > 0 ? `+${selectedSite.elevationM} m` : `${selectedSite.elevationM} m`}</strong>
            </span>
            <span style={{ color: settings.accentColor }} className="hidden md:inline">
              Mission Fit: {selectedSite.recommendedMissionType}
            </span>
          </div>
        </div>

        {/* Suitability Score Badges */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <div 
            className="px-3 py-1.5 rounded-lg border text-center transition-colors"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <span className="text-[9px] font-mono uppercase opacity-60 block">Landing Safety</span>
            <span className="text-base font-bold font-mono text-emerald-400">
              {selectedSite.landingSafetyScore}<span className="text-xs opacity-50">/100</span>
            </span>
          </div>
          <div 
            className="px-3 py-1.5 rounded-lg border text-center transition-colors"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <span className="text-[9px] font-mono uppercase opacity-60 block">Science Return</span>
            <span className="text-base font-bold font-mono" style={{ color: settings.accentColor }}>
              {selectedSite.scientificValueRating}<span className="text-xs opacity-50">/100</span>
            </span>
          </div>
          <div 
            className="px-3 py-1.5 rounded-lg border text-center transition-colors"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <span className="text-[9px] font-mono uppercase opacity-60 block">Water Ice</span>
            <span className="text-base font-bold font-mono" style={{ color: settings.accentColor }}>
              {selectedSite.waterIceProbability}
            </span>
          </div>
        </div>
      </div>

      {/* Central Hero: 3D Lunar Globe Observatory Viewport */}
      <div className="relative w-full h-[500px] sm:h-[600px] bg-[#060913] rounded-xl border border-slate-800/70 overflow-hidden shadow-2xl">
        {/* The 3D Moon Canvas */}
        <LunarGlobe3D
          selectedSite={selectedSite}
          customCoordinates={customCoordinates}
          timeState={timeState}
          onSelectSite={onSelectSite}
          className="h-full"
        />

        {/* Top-Right Jump to Full Explorer Link */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => onNavigateToTab('explorer')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#070b16]/85 hover:bg-[#0c142b] border border-slate-700/60 text-slate-200 hover:text-cyan-300 transition-colors text-xs font-mono shadow-lg backdrop-blur-sm"
          >
            <span>Full Explorer Controls</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Prominent Core 4 Metrics (with expandable detail drawer) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-0.5">
          <span className="uppercase tracking-wider font-semibold text-slate-400">
            Real-Time Surface Telemetry
          </span>
          <span className="text-slate-500 text-[11px]">
            Simulation Time: {timeState.simulationHours.toFixed(1)}h / 708.7h
          </span>
        </div>

        <MetricCardsGrid metrics={metrics} selectedSite={selectedSite} />
      </div>

      {/* Geological Context & Quick Analysis Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Geological Description */}
        <div className="lg:col-span-8 bg-[#070b16]/80 border border-slate-800/70 rounded-lg p-5 space-y-3">
          <h3 className="text-xs font-mono font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Geological & Regional Context</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
            {selectedSite.geologicalContext}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono border-t border-slate-800/60">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Cold-Trap Proximity</span>
              <span className="text-cyan-300 font-bold">{selectedSite.psrProximityKm} km to PSR</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Max Continuous Darkness</span>
              <span className="text-amber-300 font-bold">{selectedSite.maxContinuousDarknessHours} hours</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Direct Earth Visibility</span>
              <span className="text-emerald-300 font-bold">{selectedSite.earthVisibilityPct}% Libration Cycle</span>
            </div>
          </div>
        </div>

        {/* Quick Scientific Modules Navigation Cards */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-2 text-xs font-mono">
          <button
            onClick={() => onNavigateToTab('solar')}
            className="p-3.5 bg-[#070b16]/80 hover:bg-[#0c142b] border border-slate-800/70 hover:border-amber-400/40 rounded-lg text-left transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-amber-400 mb-1">
              <span className="font-semibold text-xs">Solar Curves</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
            <p className="text-[10px] text-slate-400 font-sans">29.5d synodic cycle & solar flux</p>
          </button>

          <button
            onClick={() => onNavigateToTab('terrain')}
            className="p-3.5 bg-[#070b16]/80 hover:bg-[#0c142b] border border-slate-800/70 hover:border-emerald-400/40 rounded-lg text-left transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-emerald-400 mb-1">
              <span className="font-semibold text-xs">Terrain Slope</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
            <p className="text-[10px] text-slate-400 font-sans">20km transects & hazard rating</p>
          </button>

          <button
            onClick={() => onNavigateToTab('comms')}
            className="p-3.5 bg-[#070b16]/80 hover:bg-[#0c142b] border border-slate-800/70 hover:border-blue-400/40 rounded-lg text-left transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-blue-400 mb-1">
              <span className="font-semibold text-xs">Earth Comms</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
            <p className="text-[10px] text-slate-400 font-sans">Look-angles & DSN link budget</p>
          </button>

          <button
            onClick={() => onNavigateToTab('comparison')}
            className="p-3.5 bg-[#070b16]/80 hover:bg-[#0c142b] border border-slate-800/70 hover:border-purple-400/40 rounded-lg text-left transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-purple-400 mb-1">
              <span className="font-semibold text-xs">Site Compare</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
            <p className="text-[10px] text-slate-400 font-sans">Side-by-side trade radar</p>
          </button>
        </div>
      </div>

      {/* Candidate Landing Sites Evaluation Catalog */}
      <div className="bg-[#070b16]/80 border border-slate-800/70 rounded-lg p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold font-mono text-white">
              CANDIDATE LANDING REGION DIRECTORY
            </h3>
            <p className="text-xs text-slate-400">
              Click any site to evaluate its topography, illumination, and line-of-sight
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
            {['All', 'Artemis Candidate', 'Apollo Historic', 'Volatile / PSR Target', 'Geological Anomaly'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                  filterCategory === cat
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-semibold'
                    : 'bg-slate-800/50 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Clean, Spacious Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400">
                <th className="py-2.5 px-3">Site</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Coordinates</th>
                <th className="py-2.5 px-3">Elevation</th>
                <th className="py-2.5 px-3">Slope</th>
                <th className="py-2.5 px-3">Illumination</th>
                <th className="py-2.5 px-3">Earth LOS</th>
                <th className="py-2.5 px-3 text-right">Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {filteredSites.map(site => {
                const isSelected = selectedSite.id === site.id;
                return (
                  <tr 
                    key={site.id}
                    onClick={() => onSelectSite(site)}
                    className={`hover:bg-[#0c142b] cursor-pointer transition-colors ${
                      isSelected ? 'bg-cyan-950/25 font-medium' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-cyan-400' : 'bg-slate-600'}`}></span>
                        <div>
                          <span className={`font-semibold ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                            {site.name}
                          </span>
                          <span className="text-[10px] text-slate-500 block">{site.code}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800/70 text-slate-300 border border-slate-700/60">
                        {site.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {site.coordinates.lat >= 0 ? `+${site.coordinates.lat}°` : `${site.coordinates.lat}°`}, {site.coordinates.lng >= 0 ? `+${site.coordinates.lng}°` : `${site.coordinates.lng}°`}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {site.elevationM > 0 ? `+${site.elevationM}m` : `${site.elevationM}m`}
                    </td>
                    <td className="py-3 px-3">
                      <span className={site.meanSlopeDeg <= 6 ? 'text-emerald-400' : site.meanSlopeDeg <= 10 ? 'text-amber-400' : 'text-rose-400'}>
                        {site.meanSlopeDeg}°
                      </span>
                    </td>
                    <td className="py-3 px-3 text-amber-300">
                      {site.annualIlluminationPct}%
                    </td>
                    <td className="py-3 px-3 text-blue-300">
                      {site.earthVisibilityPct}%
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSite(site);
                        }}
                        className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {isSelected ? 'ACTIVE' : 'SELECT'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
