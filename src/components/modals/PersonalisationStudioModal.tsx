/**
 * LUNARX Personalisation Studio Modal
 * Complete interface customization suite with live preview, 4 curated themes,
 * accent swatches, density & typography controls, 3D visualization options,
 * and persistent storage.
 */

import React, { useState } from 'react';
import { 
  X, 
  Palette, 
  Sun, 
  Moon, 
  Sparkles, 
  Check, 
  RotateCcw, 
  Eye, 
  Layers, 
  Sliders, 
  Type, 
  LayoutGrid, 
  Monitor, 
  Zap,
  CheckCircle2,
  SlidersHorizontal,
  Compass
} from 'lucide-react';
import { 
  useTheme, 
  ThemeId, 
  AccentColor, 
  DashboardDensity, 
  FontSize, 
  MoonVisualMode, 
  DataPanelAppearance,
  THEME_PREVIEWS, 
  ACCENT_SWATCHES 
} from '../../context/ThemeContext';
import { LunarPhaseIcon } from '../common/LunarPhaseIcon';

export const PersonalisationStudioModal: React.FC = () => {
  const { 
    settings, 
    updateSetting, 
    setTheme, 
    setAccentColor, 
    resetToDefaults,
    isPersonalisationStudioOpen, 
    closePersonalisationStudio 
  } = useTheme();

  const [activeTab, setActiveTab] = useState<'themes' | 'appearance' | 'display'>('themes');

  if (!isPersonalisationStudioOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md select-none animate-fadeIn">
      <div 
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-colors"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)'
        }}
      >
        {/* Studio Top Header */}
        <div 
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-header)' }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: `${settings.accentColor}25`, border: `1px solid ${settings.accentColor}50` }}
            >
              <Palette className="w-5 h-5" style={{ color: settings.accentColor }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-mono tracking-tight uppercase">
                  Personalisation Studio
                </h2>
                <span 
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold"
                  style={{ backgroundColor: `${settings.accentColor}20`, color: settings.accentColor }}
                >
                  LIVE PREVIEW
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Tailor interface themes, mission control density, accents, and visualization fidelity
              </p>
            </div>
          </div>

          <button
            onClick={closePersonalisationStudio}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div 
          className="flex border-b px-6 gap-6 text-xs font-mono"
          style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card-subtle)' }}
        >
          <button
            onClick={() => setActiveTab('themes')}
            className={`py-3 border-b-2 font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'themes'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
            style={activeTab === 'themes' ? { borderColor: settings.accentColor, color: settings.accentColor } : {}}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1. Core Themes</span>
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`py-3 border-b-2 font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'appearance'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
            style={activeTab === 'appearance' ? { borderColor: settings.accentColor, color: settings.accentColor } : {}}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>2. Accents & Layout</span>
          </button>

          <button
            onClick={() => setActiveTab('display')}
            className={`py-3 border-b-2 font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'display'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
            style={activeTab === 'display' ? { borderColor: settings.accentColor, color: settings.accentColor } : {}}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>3. 3D Moon & Scientific Data</span>
          </button>
        </div>

        {/* Body Content Area with Live Preview */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (Left) */}
          <div className="lg:col-span-7 space-y-6">
            {/* TAB 1: THEMES */}
            {activeTab === 'themes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-300">
                    Select Interface Palette
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">4 Observatory Themes</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(Object.keys(THEME_PREVIEWS) as ThemeId[]).map((themeKey) => {
                    const theme = THEME_PREVIEWS[themeKey];
                    const isSelected = settings.theme === themeKey;

                    return (
                      <button
                        key={themeKey}
                        onClick={() => setTheme(themeKey)}
                        className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden group flex flex-col justify-between h-32 ${
                          isSelected
                            ? 'shadow-lg ring-1'
                            : 'hover:border-slate-600'
                        }`}
                        style={{
                          backgroundColor: theme.cardPreview,
                          borderColor: isSelected ? settings.accentColor : 'rgba(71, 85, 105, 0.4)',
                          boxShadow: isSelected ? `0 0 16px ${settings.accentColor}25` : undefined
                        }}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span 
                              className="font-mono text-xs font-bold"
                              style={{ color: theme.isLight ? '#0f172a' : '#f8fafc' }}
                            >
                              {theme.name}
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4" style={{ color: settings.accentColor }} />
                            )}
                          </div>
                          <span 
                            className="text-[10px] font-mono block mb-1.5"
                            style={{ color: theme.accentPreview }}
                          >
                            {theme.subtitle}
                          </span>
                          <p 
                            className="text-[11px] font-sans leading-tight line-clamp-2"
                            style={{ color: theme.isLight ? '#475569' : '#94a3b8' }}
                          >
                            {theme.description}
                          </p>
                        </div>

                        {/* Palette Dots */}
                        <div className="flex items-center gap-1.5 pt-2">
                          <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: theme.bgPreview }}></span>
                          <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: theme.cardPreview }}></span>
                          <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: theme.accentPreview }}></span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: ACCENTS & LAYOUT */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                {/* Accent Color Swatches */}
                <div className="space-y-2.5">
                  <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-300">
                    Accent Color Swatch
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                    {ACCENT_SWATCHES.map((swatch) => {
                      const isSelected = settings.accentColor === swatch.color;
                      return (
                        <button
                          key={swatch.color}
                          onClick={() => setAccentColor(swatch.color)}
                          className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                            isSelected ? 'scale-105 shadow-md' : 'hover:scale-102 opacity-80 hover:opacity-100'
                          }`}
                          style={{
                            borderColor: isSelected ? swatch.color : 'rgba(71, 85, 105, 0.4)',
                            backgroundColor: 'var(--bg-card-subtle)'
                          }}
                        >
                          <span 
                            className="w-5 h-5 rounded-full shadow-inner flex items-center justify-center"
                            style={{ backgroundColor: swatch.color }}
                          >
                            {isSelected && <Check className="w-3 h-3 text-black stroke-[3]" />}
                          </span>
                          <span className="text-[10px] font-mono tracking-tighter truncate">
                            {swatch.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dashboard Density */}
                <div className="space-y-2">
                  <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-300">
                    Dashboard Density
                  </h3>
                  <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                    {(['spacious', 'balanced', 'compact'] as DashboardDensity[]).map((d) => (
                      <button
                        key={d}
                        onClick={() => updateSetting('density', d)}
                        className={`py-2 px-3 rounded-lg border uppercase tracking-wider font-semibold transition-all ${
                          settings.density === d
                            ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                            : 'border-slate-800 bg-[#070b16] text-slate-400 hover:text-slate-200'
                        }`}
                        style={settings.density === d ? { borderColor: settings.accentColor, color: settings.accentColor } : {}}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Scaling */}
                <div className="space-y-2">
                  <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-300">
                    Typography Size
                  </h3>
                  <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                    {(['small', 'medium', 'large'] as FontSize[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => updateSetting('fontSize', s)}
                        className={`py-2 px-3 rounded-lg border uppercase tracking-wider font-semibold transition-all ${
                          settings.fontSize === s
                            ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                            : 'border-slate-800 bg-[#070b16] text-slate-400 hover:text-slate-200'
                        }`}
                        style={settings.fontSize === s ? { borderColor: settings.accentColor, color: settings.accentColor } : {}}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sidebar Default State & Animations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono pt-2">
                  <label className="flex items-center justify-between p-3 rounded-lg border cursor-pointer" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card-subtle)' }}>
                    <span>Sidebar Expanded</span>
                    <input
                      type="checkbox"
                      checked={settings.sidebarExpanded}
                      onChange={(e) => updateSetting('sidebarExpanded', e.target.checked)}
                      className="rounded accent-cyan-400"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-lg border cursor-pointer" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card-subtle)' }}>
                    <span>Interface Animations</span>
                    <input
                      type="checkbox"
                      checked={settings.animationsEnabled}
                      onChange={(e) => updateSetting('animationsEnabled', e.target.checked)}
                      className="rounded accent-cyan-400"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* TAB 3: 3D MOON & DATA CONTROLS */}
            {activeTab === 'display' && (
              <div className="space-y-6">
                {/* 3D Moon Visualizer Style */}
                <div className="space-y-2">
                  <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-300">
                    3D Moon Visualizer Fidelity
                  </h3>
                  <div className="grid grid-cols-3 gap-2.5 text-xs font-mono">
                    {(['realistic', 'enhanced', 'minimal'] as MoonVisualMode[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => updateSetting('moonVisualMode', mode)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          settings.moonVisualMode === mode
                            ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                            : 'border-slate-800 bg-[#070b16] text-slate-400 hover:text-slate-200'
                        }`}
                        style={settings.moonVisualMode === mode ? { borderColor: settings.accentColor, color: settings.accentColor } : {}}
                      >
                        <span className="font-bold uppercase block text-xs mb-1">{mode}</span>
                        <span className="text-[10px] text-slate-400 font-sans block leading-tight">
                          {mode === 'realistic' ? 'Physically based LOLA bump & shadows' : mode === 'enhanced' ? 'High-contrast maria & rim beacon highlights' : 'Clean monochrome architectural sphere'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timeline Controls Mode */}
                <div className="space-y-2">
                  <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-300">
                    Timeline Default Appearance
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
                    <button
                      onClick={() => updateSetting('timelineExpanded', false)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        !settings.timelineExpanded
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                          : 'border-slate-800 bg-[#070b16] text-slate-400'
                      }`}
                      style={!settings.timelineExpanded ? { borderColor: settings.accentColor, color: settings.accentColor } : {}}
                    >
                      <span className="font-bold block uppercase text-xs mb-0.5">Compact (Recommended)</span>
                      <span className="text-[10px] text-slate-400 font-sans block">Sleek mini bar with expandable scrub</span>
                    </button>

                    <button
                      onClick={() => updateSetting('timelineExpanded', true)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        settings.timelineExpanded
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                          : 'border-slate-800 bg-[#070b16] text-slate-400'
                      }`}
                      style={settings.timelineExpanded ? { borderColor: settings.accentColor, color: settings.accentColor } : {}}
                    >
                      <span className="font-bold block uppercase text-xs mb-0.5">Expanded</span>
                      <span className="text-[10px] text-slate-400 font-sans block">Always reveal full scrub slider & phase tags</span>
                    </button>
                  </div>
                </div>

                {/* Data Panels Default */}
                <div className="space-y-2">
                  <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-300">
                    Telemetry Panels Initial State
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
                    <button
                      onClick={() => updateSetting('dataPanelAppearance', 'minimal')}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        settings.dataPanelAppearance === 'minimal'
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                          : 'border-slate-800 bg-[#070b16] text-slate-400'
                      }`}
                      style={settings.dataPanelAppearance === 'minimal' ? { borderColor: settings.accentColor, color: settings.accentColor } : {}}
                    >
                      <span className="font-bold block uppercase text-xs mb-0.5">Essential (4 Metrics)</span>
                      <span className="text-[10px] text-slate-400 font-sans block">Solar elevation, sunset, comms, slope</span>
                    </button>

                    <button
                      onClick={() => updateSetting('dataPanelAppearance', 'detailed')}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        settings.dataPanelAppearance === 'detailed'
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                          : 'border-slate-800 bg-[#070b16] text-slate-400'
                      }`}
                      style={settings.dataPanelAppearance === 'detailed' ? { borderColor: settings.accentColor, color: settings.accentColor } : {}}
                    >
                      <span className="font-bold block uppercase text-xs mb-0.5">Comprehensive Suite</span>
                      <span className="text-[10px] text-slate-400 font-sans block">Auto-expand thermal, latency & array kW</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Live Preview Column (Right) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Real-Time Theme Preview</span>
                </span>
                <LunarPhaseIcon progressPct={50} size={18} showLabel />
              </div>

              {/* Mock Dashboard Window with Current Live Styles */}
              <div 
                className="rounded-xl border p-4 shadow-xl space-y-3 transition-colors relative overflow-hidden"
                style={{
                  backgroundColor: 'var(--bg-app)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              >
                {/* Header Mock */}
                <div 
                  className="flex items-center justify-between pb-2 border-b"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <div className="flex items-center gap-2">
                    <span 
                      className="font-bold font-mono text-sm tracking-wider"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      LUNAR<span style={{ color: settings.accentColor }}>X</span>
                    </span>
                    <span 
                      className="text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold"
                      style={{ backgroundColor: `${settings.accentColor}20`, color: settings.accentColor }}
                    >
                      OBSERVATORY
                    </span>
                  </div>
                  <span className="text-[10px] font-mono opacity-60">MET+ 14d 08h</span>
                </div>

                {/* Target Mock Card */}
                <div 
                  className="p-3 rounded-lg border transition-all"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <span className="text-[9px] font-mono uppercase opacity-60 block">Target Site</span>
                  <span className="text-sm font-bold font-mono block text-white" style={{ color: 'var(--text-primary)' }}>
                    Shackleton Crater Rim
                  </span>
                  <span className="text-[10px] font-mono" style={{ color: settings.accentColor }}>
                    89.9° S, 0.0° E • ARTEMIS BASE
                  </span>
                </div>

                {/* Metrics Mock Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div 
                    className="p-2.5 rounded border"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
                  >
                    <span className="text-[9px] opacity-60 block">SOLAR ELEVATION</span>
                    <span className="text-lg font-bold" style={{ color: settings.accentColor }}>+1.85°</span>
                  </div>
                  <div 
                    className="p-2.5 rounded border"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
                  >
                    <span className="text-[9px] opacity-60 block">EARTH LOOK</span>
                    <span className="text-lg font-bold text-emerald-400">DIRECT LOS</span>
                  </div>
                </div>

                {/* Mock Button */}
                <button
                  className="w-full py-1.5 rounded font-mono text-xs font-bold text-slate-950 transition-opacity hover:opacity-90 shadow-sm"
                  style={{ backgroundColor: settings.accentColor }}
                >
                  ACQUIRE TELEMETRY
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div 
              className="pt-4 border-t flex items-center justify-between"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <button
                onClick={resetToDefaults}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Defaults</span>
              </button>

              <button
                onClick={closePersonalisationStudio}
                className="px-5 py-2 rounded-lg font-mono text-xs font-bold text-slate-950 transition-opacity hover:opacity-90 shadow-lg"
                style={{ backgroundColor: settings.accentColor }}
              >
                Apply & Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
