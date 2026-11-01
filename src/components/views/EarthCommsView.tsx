/**
 * LUNARX Earth Communications View
 * Evaluates Direct-to-Earth (DTE) Line-of-Sight, Earth elevation angle over
 * lunar libration cycles, Deep Space Network (DSN) tracking, and link budgets.
 */

import React, { useMemo } from 'react';
import { 
  LunarSite, 
  SiteEvaluationMetrics, 
  MissionTimeState 
} from '../../types/lunar';
import { scientificBackend } from '../../services/scientificBackend';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { 
  Radio, 
  Globe, 
  Antenna, 
  Wifi, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert,
  Signal
} from 'lucide-react';

interface EarthCommsViewProps {
  selectedSite: LunarSite;
  timeState: MissionTimeState;
  metrics: SiteEvaluationMetrics;
}

export const EarthCommsView: React.FC<EarthCommsViewProps> = ({
  selectedSite,
  timeState,
  metrics
}) => {
  // Generate 56-day double libration cycle
  const librationData = useMemo(() => {
    return scientificBackend.generateEarthLibrationCurve(selectedSite.coordinates);
  }, [selectedSite]);

  const isDirectLos = metrics.earthVisibility === 'Direct Line of Sight';
  const isNearHorizon = metrics.earthVisibility === 'Near Horizon Grazing';

  return (
    <div className="space-y-4 pb-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#080d1b] border border-slate-800 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Earth Look-Angle</span>
            <Globe className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold font-mono ${metrics.earthElevationDeg > 0 ? 'text-blue-300' : 'text-rose-400'}`}>
              {metrics.earthElevationDeg > 0 ? `+${metrics.earthElevationDeg}` : metrics.earthElevationDeg}°
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-1">
            {metrics.earthElevationDeg > 0 ? 'Above Local Lunar Horizon' : 'Sub-Horizon (Occulted)'}
          </p>
        </div>

        <div className="bg-[#080d1b] border border-slate-800 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Direct-to-Earth Link</span>
            <Radio className={`w-4 h-4 ${isDirectLos ? 'text-emerald-400' : isNearHorizon ? 'text-amber-400' : 'text-rose-400'}`} />
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-lg font-bold font-mono ${isDirectLos ? 'text-emerald-300' : isNearHorizon ? 'text-amber-300' : 'text-rose-400'}`}>
              {metrics.earthVisibility.toUpperCase()}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-1">
            Signal: <strong className="text-white">{metrics.commSignalStrengthDbm} dBm</strong>
          </p>
        </div>

        <div className="bg-[#080d1b] border border-slate-800 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Light-Time Latency</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-cyan-300">
              {metrics.dteLatencySec}
            </span>
            <span className="text-xs font-mono text-slate-400">s (1-way)</span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-1">
            Round-trip delay: {(metrics.dteLatencySec * 2).toFixed(2)} seconds
          </p>
        </div>

        <div className="bg-[#080d1b] border border-slate-800 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Libration Coverage</span>
            <Signal className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-purple-300">
              {selectedSite.earthVisibilityPct}%
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-1">
            Mean Elevation: {selectedSite.meanEarthElevationDeg}°
          </p>
        </div>
      </div>

      {/* Main Chart: 56-Day Earth Elevation Libration Cycle */}
      <div className="bg-[#080d1b] border border-slate-800 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-semibold font-mono text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>EARTH ELEVATION ANGLE OVER LUNAR LIBRATION CYCLES (56 DAYS)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Shows how Earth’s apparent position oscillates due to optical and physical libration (±7.9° lng, ±6.7° lat).
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-emerald-400"></span>
              Direct LOS (&gt;0°)
            </span>
            <span className="text-rose-400 flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-rose-500"></span>
              Occulted (&lt;0°)
            </span>
          </div>
        </div>

        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={librationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                formatter={(value: any) => [`${value}°`, 'Earth Look-Angle']}
                labelFormatter={(label) => `Day ${label}`}
              />
              <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '0° HORIZON CUTOFF', fill: '#ef4444', fontSize: 10 }} />
              <Line 
                type="monotone" 
                dataKey="earthElevationDeg" 
                stroke="#38bdf8" 
                strokeWidth={2.5}
                dot={{ r: 2, fill: '#0284c7' }}
                activeDot={{ r: 5, fill: '#38bdf8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Deep Space Network (DSN) & Communication Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* DSN Ground Stations Handover */}
        <div className="bg-[#080d1b] border border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Antenna className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
                DSN GROUND STATIONS
              </h4>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">34m / 70m DISHES</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 bg-[#050811] rounded border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-white font-semibold block">Goldstone (California, USA)</span>
                <span className="text-[10px] text-slate-500">DSS-14, DSS-24, DSS-26</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px]">
                ACTIVE
              </span>
            </div>

            <div className="p-2.5 bg-[#050811] rounded border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-white font-semibold block">Madrid (Spain)</span>
                <span className="text-[10px] text-slate-500">DSS-63, DSS-65, DSS-56</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 text-[10px]">
                STANDBY
              </span>
            </div>

            <div className="p-2.5 bg-[#050811] rounded border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-white font-semibold block">Canberra (Australia)</span>
                <span className="text-[10px] text-slate-500">DSS-43, DSS-34, DSS-36</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px]">
                UPCOMING
              </span>
            </div>
          </div>
        </div>

        {/* Link Budget Analysis */}
        <div className="bg-[#080d1b] border border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
                LINK BUDGET SIMULATION
              </h4>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Ka-Band (26 GHz)</span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Carrier Frequency:</span>
              <span className="text-slate-200">26.5 GHz (Ka-Band)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Free Space Path Loss:</span>
              <span className="text-rose-400">-212.4 dB</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Lander Antenna Gain:</span>
              <span className="text-cyan-300">+34.2 dBi (0.8m steerable)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Ground Station G/T:</span>
              <span className="text-cyan-300">+48.5 dB/K (DSN 34m)</span>
            </div>
            <div className="flex justify-between py-1 pt-2">
              <span className="text-slate-300 font-semibold">Max Downlink Bitrate:</span>
              <span className="text-emerald-400 font-bold">120 Mbps (HD Video Ready)</span>
            </div>
          </div>
        </div>

        {/* Farside & Lunar Orbit Relay Requirements */}
        <div className="bg-[#080d1b] border border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-purple-400" />
              <h4 className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
                RELAY SATELLITE (GATEWAY)
              </h4>
            </div>
            <span className="text-[10px] font-mono text-purple-400">NRHO ORBIT</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            For sites on the lunar limb or farside (e.g., <strong>Von Kármán</strong> in South Pole-Aitken Basin), Earth direct line of sight is obstructed. Communications rely on lunar orbiters (Gateway in Near-Rectilinear Halo Orbit or Queqiao relay at Earth-Moon L2).
          </p>

          <div className="p-2.5 bg-[#050811] rounded border border-slate-800 text-xs font-mono space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Direct Earth LOS Feasible:</span>
              <span className={selectedSite.earthVisibilityPct > 50 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {selectedSite.earthVisibilityPct > 50 ? 'YES' : 'REQUIRES ORBITAL RELAY'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Gateway Pass Duration:</span>
              <span className="text-purple-300 font-semibold">~6.5 days per 7-day orbit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
