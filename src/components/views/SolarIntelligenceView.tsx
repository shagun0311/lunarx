/**
 * LUNARX Solar Intelligence View
 * Evaluates lunar illumination cycles, synodic solar elevation curves,
 * power generation potential, and Permanently Shadowed Region (PSR) cold traps.
 */

import React, { useMemo, useState } from 'react';
import { 
  LunarSite, 
  LunarCoordinates, 
  SiteEvaluationMetrics, 
  MissionTimeState 
} from '../../types/lunar';
import { scientificBackend } from '../../services/scientificBackend';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { 
  Sun, 
  Zap, 
  ThermometerSnowflake, 
  Clock, 
  ShieldAlert, 
  Layers, 
  Sliders,
  Info
} from 'lucide-react';

interface SolarIntelligenceViewProps {
  selectedSite: LunarSite;
  timeState: MissionTimeState;
  metrics: SiteEvaluationMetrics;
}

export const SolarIntelligenceView: React.FC<SolarIntelligenceViewProps> = ({
  selectedSite,
  timeState,
  metrics
}) => {
  const [arrayAreaM2, setArrayAreaM2] = useState<number>(60); // 60 m² lander array default
  const [cellEfficiencyPct, setCellEfficiencyPct] = useState<number>(30); // 30% Triple-junction GaInP/GaAs

  // Generate 29.5-day synodic solar curve
  const synodicCurve = useMemo(() => {
    return scientificBackend.generateSynodicSolarCycle(selectedSite.coordinates);
  }, [selectedSite]);

  // Simulated power based on user slider
  const simulatedPowerKw = useMemo(() => {
    if (metrics.solarElevationDeg <= 0) return 0;
    const flux = metrics.solarFluxWm2;
    return Number(((flux * arrayAreaM2 * (cellEfficiencyPct / 100)) / 1000).toFixed(2));
  }, [metrics, arrayAreaM2, cellEfficiencyPct]);

  return (
    <div className="space-y-4 pb-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#080d1b] border border-slate-800 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Current Solar Elevation</span>
            <Sun className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold font-mono ${metrics.solarElevationDeg > 0 ? 'text-amber-300' : 'text-slate-400'}`}>
              {metrics.solarElevationDeg > 0 ? `+${metrics.solarElevationDeg}` : metrics.solarElevationDeg}°
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-1">
            Sub-Solar Point: {timeState.subSolarCoordinates.lat}° Lat, {timeState.subSolarCoordinates.lng}° Lng
          </p>
        </div>

        <div className="bg-[#080d1b] border border-slate-800 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Annual Illumination</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-cyan-300">
              {selectedSite.annualIlluminationPct}%
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-1">
            Max Continuous Darkness: <strong className="text-amber-300">{selectedSite.maxContinuousDarknessHours}h</strong>
          </p>
        </div>

        <div className="bg-[#080d1b] border border-slate-800 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Direct Solar Flux</span>
            <Sun className="w-4 h-4 text-orange-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-orange-300">
              {metrics.solarFluxWm2}
            </span>
            <span className="text-xs font-mono text-slate-400">W/m²</span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-1">
            Lunar Solar Constant: 1,361 W/m² (1 AU)
          </p>
        </div>

        <div className="bg-[#080d1b] border border-slate-800 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">PSR Proximity</span>
            <ThermometerSnowflake className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-cyan-200">
              {selectedSite.psrProximityKm}
            </span>
            <span className="text-xs font-mono text-slate-400">km</span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-1">
            Cold Trap Temp: &lt;40K (-233°C)
          </p>
        </div>
      </div>

      {/* Main Chart: 29.5-Day Synodic Solar Elevation Cycle */}
      <div className="bg-[#080d1b] border border-slate-800 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-semibold font-mono text-white flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>SYNODIC SOLAR ELEVATION & ILLUMINATION PROFILE (708.7 HOURS)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Elevation angle relative to the local horizontal plane across one complete lunar day/night cycle.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-amber-300">
              <span className="w-2.5 h-2.5 rounded bg-amber-400"></span>
              Sunlight (&gt;0°)
            </span>
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="w-2.5 h-2.5 rounded bg-slate-700"></span>
              Night (&lt;0°)
            </span>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={synodicCurve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="solarElevationGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis 
                dataKey="day" 
                stroke="#64748b" 
                tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'JetBrains Mono' }}
                tickFormatter={(val) => `D${val}`}
              />
              <YAxis 
                stroke="#64748b" 
                tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'JetBrains Mono' }}
                unit="°"
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
                formatter={(value: any) => [`${value}°`, 'Solar Elevation']}
                labelFormatter={(label) => `Day ${label} (T+ ${(Number(label) * 24).toFixed(0)}h)`}
              />
              {/* Horizon Line at 0° */}
              <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '0° LOCAL HORIZON', fill: '#ef4444', fontSize: 10, position: 'insideTopLeft' }} />
              {/* Current Simulation Time Marker */}
              <ReferenceLine 
                x={Number((timeState.simulationHours / 24).toFixed(1))} 
                stroke="#00E5FF" 
                strokeWidth={2}
                label={{ value: 'CURRENT MET', fill: '#00E5FF', fontSize: 10, position: 'top' }} 
              />
              <Area 
                type="monotone" 
                dataKey="solarElevationDeg" 
                stroke="#f59e0b" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#solarElevationGrad)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Solar Array Power Generation Simulator & Polar Illumination Physics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Power Simulator */}
        <div className="bg-[#080d1b] border border-slate-800 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
                SURFACE SOLAR ARRAY POWER SIMULATOR
              </h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              GaInP / GaAs TRIPLE-JUNCTION
            </span>
          </div>

          {/* Power output display */}
          <div className="p-3 bg-[#050811] rounded border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Simulated Electrical Output</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-bold font-mono text-cyan-300">{simulatedPowerKw}</span>
                <span className="text-xs font-mono text-slate-400">kW</span>
              </div>
            </div>
            <div className="text-right text-xs font-mono">
              <span className="text-slate-400 block text-[10px]">BATTERY MASS REQUIREMENT</span>
              <span className="text-amber-300 font-semibold font-mono">
                {selectedSite.maxContinuousDarknessHours > 0 
                  ? `${Math.round(selectedSite.maxContinuousDarknessHours * 3.5)} kg (for ${selectedSite.maxContinuousDarknessHours}h night)`
                  : 'Minimal (Continuous Peak)'}
              </span>
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-3 text-xs font-mono">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Solar Array Area:</span>
                <span className="text-cyan-300 font-bold">{arrayAreaM2} m²</span>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                step="5"
                value={arrayAreaM2}
                onChange={(e) => setArrayAreaM2(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Photovoltaic Conversion Efficiency:</span>
                <span className="text-cyan-300 font-bold">{cellEfficiencyPct}%</span>
              </div>
              <input
                type="range"
                min="18"
                max="36"
                step="1"
                value={cellEfficiencyPct}
                onChange={(e) => setCellEfficiencyPct(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Polar Illumination & PSR Cold Trap Dynamics */}
        <div className="bg-[#080d1b] border border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <ThermometerSnowflake className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
                PERMANENTLY SHADOWED REGIONS (PSR) DYNAMICS
              </h4>
            </div>
            <span className="text-[10px] font-mono text-slate-400">OBLIQUITY: 1.54°</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Because the Moon’s spin axis is tilted only <strong>1.54°</strong> from the ecliptic normal, the Sun never rises high in the polar sky. High topography (such as <strong>{selectedSite.name}</strong>) casts shadows that span hundreds of kilometers, while crater interiors remain in perpetual darkness.
          </p>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 bg-[#050811] rounded border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Peak Elevation Advantage:</span>
              <span className="text-emerald-300 font-semibold">+{selectedSite.elevationM} m (Clears 85%+ horizon)</span>
            </div>
            <div className="p-2.5 bg-[#050811] rounded border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Cryogenic Trap Temperature:</span>
              <span className="text-cyan-300 font-semibold">35 K – 45 K (Volatiles stable for billions of yrs)</span>
            </div>
            <div className="p-2.5 bg-[#050811] rounded border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Volatile Harvesting Window:</span>
              <span className="text-amber-300 font-semibold">{selectedSite.psrProximityKm < 5 ? 'Immediate Rover Access' : 'Extended Traverse Required'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
