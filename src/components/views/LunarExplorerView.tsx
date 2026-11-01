/**
 * LUNARX Lunar Explorer View
 * Large interactive 3D Moon visualizer with custom latitude/longitude inputs,
 * location search bar, surface raycast inspection, and landing site targeting.
 */

import React, { useState } from 'react';
import { 
  LunarSite, 
  LunarCoordinates, 
  SiteEvaluationMetrics, 
  MissionTimeState 
} from '../../types/lunar';
import { LUNAR_LANDING_SITES } from '../../data/lunarSites';
import { LunarGlobe3D } from '../explorer/LunarGlobe3D';
import { 
  Search, 
  Compass, 
  MapPin, 
  Crosshair, 
  Send, 
  Info, 
  CheckCircle2, 
  AlertCircle,
  Maximize2,
  Navigation
} from 'lucide-react';
import { scientificBackend } from '../../services/scientificBackend';

interface LunarExplorerViewProps {
  selectedSite: LunarSite;
  onSelectSite: (site: LunarSite) => void;
  customCoordinates: LunarCoordinates | null;
  onSetCustomCoordinates: (coords: LunarCoordinates | null) => void;
  timeState: MissionTimeState;
  metrics: SiteEvaluationMetrics;
}

export const LunarExplorerView: React.FC<LunarExplorerViewProps> = ({
  selectedSite,
  onSelectSite,
  customCoordinates,
  onSetCustomCoordinates,
  timeState,
  metrics
}) => {
  // Input fields for custom coordinates
  const [inputLat, setInputLat] = useState<string>(
    customCoordinates ? String(customCoordinates.lat) : String(selectedSite.coordinates.lat)
  );
  const [inputLng, setInputLng] = useState<string>(
    customCoordinates ? String(customCoordinates.lng) : String(selectedSite.coordinates.lng)
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inputError, setInputError] = useState<string | null>(null);

  // Surface clicked coordinates inspection
  const [clickedCoords, setClickedCoords] = useState<LunarCoordinates | null>(null);
  const [clickedMetrics, setClickedMetrics] = useState<SiteEvaluationMetrics | null>(null);

  // Handle Search
  const searchResults = searchQuery.trim() === ''
    ? []
    : LUNAR_LANDING_SITES.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Validate and submit custom coordinates
  const handleApplyCoordinates = (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);
    const lat = parseFloat(inputLat);
    const lng = parseFloat(inputLng);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setInputError('Latitude must be a valid number between -90.0° and +90.0°');
      return;
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      setInputError('Longitude must be a valid number between -180.0° and +180.0°');
      return;
    }

    const coords: LunarCoordinates = { lat: Number(lat.toFixed(3)), lng: Number(lng.toFixed(3)) };
    onSetCustomCoordinates(coords);
    
    // Evaluate clicked metrics
    const evalResult = scientificBackend.evaluateLocation(coords, timeState);
    setClickedCoords(coords);
    setClickedMetrics(evalResult);
  };

  // Click on 3D surface
  const handleSurfaceClick = (coords: LunarCoordinates) => {
    setInputLat(String(coords.lat));
    setInputLng(String(coords.lng));
    onSetCustomCoordinates(coords);
    const evalResult = scientificBackend.evaluateLocation(coords, timeState);
    setClickedCoords(coords);
    setClickedMetrics(evalResult);
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Top Controls Toolbar: Search & Coordinates Input */}
      <div className="bg-[#080d1b] border border-slate-800 rounded-lg p-3.5 shadow-lg flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search lunar crater, mare, Apollo or Artemis site..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#050811] border border-slate-700 hover:border-slate-600 focus:border-cyan-400 rounded pl-9 pr-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none placeholder:text-slate-500"
          />
          {/* Search Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-[#0b1226] border border-slate-700 rounded shadow-2xl z-30 max-h-56 overflow-y-auto divide-y divide-slate-800">
              {searchResults.map(site => (
                <button
                  key={site.id}
                  onClick={() => {
                    onSelectSite(site);
                    setInputLat(String(site.coordinates.lat));
                    setInputLng(String(site.coordinates.lng));
                    setSearchQuery('');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-[#121c3b] flex items-center justify-between text-xs font-mono group"
                >
                  <div>
                    <span className="font-semibold text-slate-200 group-hover:text-cyan-300">{site.name}</span>
                    <span className="text-[10px] text-slate-400 block">{site.category} • {site.code}</span>
                  </div>
                  <span className="text-[10px] text-cyan-400">
                    {site.coordinates.lat}°, {site.coordinates.lng}°
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Custom Coordinates Form */}
        <form onSubmit={handleApplyCoordinates} className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-[#050811] border border-slate-700 rounded px-2 py-1">
            <span className="text-slate-400 text-[10px]">LAT:</span>
            <input
              type="number"
              step="any"
              min="-90"
              max="90"
              placeholder="-89.9"
              value={inputLat}
              onChange={(e) => setInputLat(e.target.value)}
              className="w-20 bg-transparent text-slate-100 font-mono text-xs focus:outline-none"
            />
            <span className="text-slate-500 text-[10px]">°</span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#050811] border border-slate-700 rounded px-2 py-1">
            <span className="text-slate-400 text-[10px]">LNG:</span>
            <input
              type="number"
              step="any"
              min="-180"
              max="180"
              placeholder="0.0"
              value={inputLng}
              onChange={(e) => setInputLng(e.target.value)}
              className="w-20 bg-transparent text-slate-100 font-mono text-xs focus:outline-none"
            />
            <span className="text-slate-500 text-[10px]">°</span>
          </div>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded transition-colors"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>PIN TARGET</span>
          </button>

          {customCoordinates && (
            <button
              type="button"
              onClick={() => onSetCustomCoordinates(null)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded text-[10px]"
            >
              Clear Pin
            </button>
          )}
        </form>
      </div>

      {inputError && (
        <div className="p-2.5 bg-rose-950/40 border border-rose-800 rounded text-rose-300 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{inputError}</span>
        </div>
      )}

      {/* Main 3D Interactive Moon Stage */}
      <div className="bg-[#070b16] border border-slate-800 rounded-lg overflow-hidden relative shadow-2xl h-[560px]">
        <LunarGlobe3D
          selectedSite={selectedSite}
          customCoordinates={customCoordinates}
          timeState={timeState}
          onSelectSite={onSelectSite}
          onCoordinatesClick={handleSurfaceClick}
          className="h-full"
        />

        {/* Selected / Custom Target HUD Overlay (Top-Left inside 3D Canvas) */}
        <div className="absolute top-4 left-4 z-20 pointer-events-none max-w-sm">
          <div className="bg-[#090f20]/90 border border-slate-700/80 rounded-lg p-3 shadow-xl backdrop-blur-sm space-y-1.5 pointer-events-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1">
              <span className="text-[10px] font-mono uppercase text-cyan-400 font-semibold tracking-wider flex items-center gap-1.5">
                <Navigation className="w-3 h-3 text-cyan-400" />
                {customCoordinates ? 'CUSTOM PIN TARGET' : 'TARGETED SITE'}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {customCoordinates ? 'USER DEFINED' : selectedSite.code}
              </span>
            </div>

            <div className="text-sm font-bold font-mono text-white">
              {customCoordinates ? `Point (${customCoordinates.lat}°, ${customCoordinates.lng}°)` : selectedSite.name}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1 text-slate-300">
              <div>
                <span className="text-[9px] text-slate-500 block">SOLAR ELEVATION</span>
                <span className={metrics.solarElevationDeg > 0 ? 'text-amber-300 font-semibold' : 'text-slate-400'}>
                  {metrics.solarElevationDeg > 0 ? `+${metrics.solarElevationDeg}` : metrics.solarElevationDeg}°
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block">EARTH ELEVATION</span>
                <span className={metrics.earthElevationDeg > 0 ? 'text-blue-300 font-semibold' : 'text-rose-400'}>
                  {metrics.earthElevationDeg > 0 ? `+${metrics.earthElevationDeg}` : metrics.earthElevationDeg}°
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block">EST. SLOPE</span>
                <span className="text-emerald-300 font-semibold">{metrics.terrainSlopeDeg}° avg</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block">EARTH COMM</span>
                <span className="text-cyan-300 font-semibold">{metrics.earthVisibility}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Landing Coordinates Quick Jump */}
      <div className="bg-[#080d1b] border border-slate-800 rounded-lg p-4">
        <h4 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
          QUICK GEOGRAPHIC COORDINATE PRESETS
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs font-mono">
          {[
            { label: 'Lunar South Pole', lat: -89.9, lng: 0.0 },
            { label: 'Lunar North Pole', lat: 89.9, lng: 0.0 },
            { label: 'Equator Prime Meridian', lat: 0.0, lng: 0.0 },
            { label: 'Oceanus Procellarum', lat: 14.2, lng: -56.8 },
            { label: 'Mare Tranquillitatis', lat: 0.67, lng: 23.47 },
            { label: 'Farside Aitken Basin', lat: -45.5, lng: 176.2 }
          ].map(preset => (
            <button
              key={preset.label}
              onClick={() => {
                setInputLat(String(preset.lat));
                setInputLng(String(preset.lng));
                onSetCustomCoordinates({ lat: preset.lat, lng: preset.lng });
              }}
              className="p-2 bg-[#0c142b] hover:bg-[#132047] border border-slate-800 hover:border-cyan-500/50 rounded text-left transition-colors"
            >
              <span className="text-slate-200 block truncate">{preset.label}</span>
              <span className="text-[10px] text-cyan-400 block mt-0.5">
                {preset.lat}°, {preset.lng}°
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
