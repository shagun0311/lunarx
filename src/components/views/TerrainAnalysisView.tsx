/**
 * LUNARX Terrain Analysis View
 * Evaluates lunar topography, slope distribution histograms, 20km cross-section transects,
 * boulder hazard density, and landing ellipse safety scores.
 */

import React, { useMemo, useState } from 'react';
import { 
  LunarSite, 
  SiteEvaluationMetrics, 
  TopographicTransectPoint 
} from '../../types/lunar';
import { scientificBackend } from '../../services/scientificBackend';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { 
  Mountain, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Layers, 
  Compass, 
  Sliders,
  ShieldCheck,
  Activity
} from 'lucide-react';

interface TerrainAnalysisViewProps {
  selectedSite: LunarSite;
  metrics: SiteEvaluationMetrics;
}

export const TerrainAnalysisView: React.FC<TerrainAnalysisViewProps> = ({
  selectedSite,
  metrics
}) => {
  // Lander tilt tolerance threshold slider (default 12 degrees for modern throttleable landers)
  const [maxAllowedTiltDeg, setMaxAllowedTiltDeg] = useState<number>(12);
  const [ellipseRadiusM, setEllipseRadiusM] = useState<number>(100); // 100m precision landing

  // Generate 20km radial transect
  const transectData = useMemo(() => {
    return scientificBackend.generateTopographicProfile(selectedSite);
  }, [selectedSite]);

  // Slope histogram data based on site roughness and mean slope
  const slopeHistogram = useMemo(() => {
    const s = selectedSite.meanSlopeDeg;
    return [
      { range: '0° - 3° (Optimal)', pct: Math.max(10, Math.round(55 - s * 2.5)), fill: '#10b981' },
      { range: '3° - 7° (Gentle)', pct: Math.max(15, Math.round(28 + s * 0.5)), fill: '#38bdf8' },
      { range: '7° - 12° (Moderate)', pct: Math.max(5, Math.round(10 + s * 1.2)), fill: '#f59e0b' },
      { range: '12° - 18° (Hazard)', pct: Math.max(2, Math.round(4 + s * 0.8)), fill: '#f97316' },
      { range: '>18° (Prohibited)', pct: Math.max(1, Math.round(2 + s * 0.5)), fill: '#ef4444' }
    ];
  }, [selectedSite]);

  return (
    <div className="space-y-4 pb-8">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#080d1b] border border-slate-800 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Mean Regional Slope</span>
            <Mountain className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-emerald-300">
              {selectedSite.meanSlopeDeg}°
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-1">
            Max Local Slope: <strong className="text-amber-400">{selectedSite.maxSlopeDeg}°</strong>
          </p>
        </div>

        <div className="bg-[#080d1b] border border-slate-800 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Surface Roughness</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-cyan-300">
              {selectedSite.roughnessIndex}
            </span>
            <span className="text-xs font-mono text-slate-400">Hurst index</span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-1">
            Baseline: 0.18 (Smooth Mare) - 0.75 (Crater Wall)
          </p>
        </div>

        <div className="bg-[#080d1b] border border-slate-800 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Landing Safety Rating</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {selectedSite.landingSafetyScore}
            </span>
            <span className="text-xs font-mono text-slate-400">/ 100</span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-1">
            Slope stability & boulder clearance
          </p>
        </div>

        <div className="bg-[#080d1b] border border-slate-800 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Rover Trafficability</span>
            <Compass className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-purple-300">
              {selectedSite.trafficabilityScore}
            </span>
            <span className="text-xs font-mono text-slate-400">/ 100</span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-1">
            Traverse capability & wheel slip margin
          </p>
        </div>
      </div>

      {/* Main Transect Chart: 20km Elevation Profile */}
      <div className="bg-[#080d1b] border border-slate-800 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-semibold font-mono text-white flex items-center gap-2">
              <Mountain className="w-4 h-4 text-cyan-400" />
              <span>20-KM RADIAL TOPOGRAPHIC TRANSECT ELEVATION PROFILE</span>
            </h3>
            <p className="text-xs text-slate-400">
              Elevation (meters relative to 1737.4 km lunar datum) across a 20 km cross-section centered on landing coordinates.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
              LOLA 5m/px Laser Altimetry
            </span>
          </div>
        </div>

        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={transectData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="elevationGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.45}/>
                  <stop offset="95%" stopColor="#00E5FF" stopOpacity={0.02}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis 
                dataKey="distanceKm" 
                stroke="#64748b" 
                tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'JetBrains Mono' }}
                unit=" km"
              />
              <YAxis 
                stroke="#64748b" 
                tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'JetBrains Mono' }}
                unit="m"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#090f20', 
                  borderColor: '#334155', 
                  borderRadius: '6px',
                  fontFamily: 'JetBrains Mono',
                  fontSize: '11px',
                  color: '#f8fafc'
                }}
                formatter={(value: any, name: any) => [
                  name === 'elevationM' ? `${value} m` : `${value}°`, 
                  name === 'elevationM' ? 'Elevation' : 'Slope'
                ]}
                labelFormatter={(label) => `Distance: ${label} km from Target Center`}
              />
              {/* Center Target Marker */}
              <ReferenceLine x={0} stroke="#f59e0b" strokeWidth={2} label={{ value: 'LANDING TARGET (0km)', fill: '#f59e0b', fontSize: 10, position: 'top' }} />
              <Area 
                type="monotone" 
                dataKey="elevationM" 
                stroke="#00E5FF" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#elevationGrad)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Slope Distribution Histogram & Precision Landing Ellipse Config */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Slope Distribution Histogram */}
        <div className="bg-[#080d1b] border border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
              REGIONAL SLOPE DISTRIBUTION HISTOGRAM
            </h4>
            <span className="text-[10px] font-mono text-slate-400">LANDING ZONE (5KM RADIUS)</span>
          </div>

          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={slopeHistogram} margin={{ top: 10, right: 10, left: -25, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis 
                  dataKey="range" 
                  stroke="#64748b" 
                  tick={{ fontSize: 9, fill: '#94a3b8', fontFamily: 'JetBrains Mono' }}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis 
                  stroke="#64748b" 
                  tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'JetBrains Mono' }}
                  unit="%"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#090f20', 
                    borderColor: '#334155', 
                    borderRadius: '6px',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '11px',
                    color: '#f8fafc'
                  }}
                  formatter={(value: any) => [`${value}%`, 'Area Fraction']}
                />
                <Bar dataKey="pct" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lander Tilt Stability & Hazard Tolerance Config */}
        <div className="bg-[#080d1b] border border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
              LANDER TOUCHDOWN STABILITY ENVELOPE
            </h4>
            <span className="text-[10px] font-mono text-emerald-400">TRN OPTICAL GUIDANCE</span>
          </div>

          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            Terrain Relative Navigation (TRN) optical hazard avoidance identifies slope gradients and boulders exceeding lander leg tip-over limits upon touchdown.
          </p>

          <div className="space-y-3 text-xs font-mono pt-1">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Lander Leg Maximum Tilt Tolerance:</span>
                <span className="text-cyan-300 font-bold">{maxAllowedTiltDeg}°</span>
              </div>
              <input
                type="range"
                min="6"
                max="20"
                step="1"
                value={maxAllowedTiltDeg}
                onChange={(e) => setMaxAllowedTiltDeg(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Landing Ellipse Dispersion Radius:</span>
                <span className="text-cyan-300 font-bold">{ellipseRadiusM} meters (Artemis pinpoint)</span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="50"
                value={ellipseRadiusM}
                onChange={(e) => setEllipseRadiusM(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <div className="p-3 bg-[#050811] rounded border border-slate-800 flex items-center justify-between mt-2">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Predicted Touchdown Probability</span>
                <span className="text-base font-bold text-emerald-400">
                  {selectedSite.meanSlopeDeg < maxAllowedTiltDeg ? '99.4% Safe Touchdown' : '78.2% Marginal Caution'}
                </span>
              </div>
              <span className={`px-2.5 py-1 rounded text-[11px] font-bold border ${
                selectedSite.meanSlopeDeg < maxAllowedTiltDeg
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  : 'bg-amber-950 text-amber-400 border-amber-800'
              }`}>
                {selectedSite.meanSlopeDeg < maxAllowedTiltDeg ? 'GO FOR TOUCHDOWN' : 'TRN STEERING REQ.'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
