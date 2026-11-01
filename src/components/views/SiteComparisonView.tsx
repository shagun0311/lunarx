/**
 * LUNARX Site Comparison View
 * Allows scientists and mission planners to select any two lunar sites side-by-side
 * and compare their illumination, communications, terrain slope, water ice potential,
 * and scientific return.
 */

import React, { useState, useMemo } from 'react';
import { LunarSite } from '../../types/lunar';
import { LUNAR_LANDING_SITES } from '../../data/lunarSites';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Legend, 
  Tooltip 
} from 'recharts';
import { 
  GitCompare, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Sun, 
  Globe, 
  Mountain, 
  Droplet, 
  Zap,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface SiteComparisonViewProps {
  initialSiteA?: LunarSite;
  initialSiteB?: LunarSite;
  onSelectSite?: (site: LunarSite) => void;
}

export const SiteComparisonView: React.FC<SiteComparisonViewProps> = ({
  initialSiteA,
  initialSiteB,
  onSelectSite
}) => {
  const [siteAId, setSiteAId] = useState<string>(initialSiteA?.id || LUNAR_LANDING_SITES[0].id); // Shackleton
  const [siteBId, setSiteBId] = useState<string>(initialSiteB?.id || LUNAR_LANDING_SITES[1].id); // Malapert Mountain

  const siteA = useMemo(() => LUNAR_LANDING_SITES.find(s => s.id === siteAId) || LUNAR_LANDING_SITES[0], [siteAId]);
  const siteB = useMemo(() => LUNAR_LANDING_SITES.find(s => s.id === siteBId) || LUNAR_LANDING_SITES[1], [siteBId]);

  // Radar chart comparison data (normalized 0 - 100)
  const radarData = useMemo(() => {
    return [
      {
        axis: 'Solar Illum.',
        siteA: siteA.annualIlluminationPct,
        siteB: siteB.annualIlluminationPct,
      },
      {
        axis: 'Earth LOS',
        siteA: siteA.earthVisibilityPct,
        siteB: siteB.earthVisibilityPct,
      },
      {
        axis: 'Terrain Flatness',
        siteA: Math.max(10, Math.round(100 - siteA.meanSlopeDeg * 5)),
        siteB: Math.max(10, Math.round(100 - siteB.meanSlopeDeg * 5)),
      },
      {
        axis: 'Science Return',
        siteA: siteA.scientificValueRating,
        siteB: siteB.scientificValueRating,
      },
      {
        axis: 'Rover Mobility',
        siteA: siteA.trafficabilityScore,
        siteB: siteB.trafficabilityScore,
      },
      {
        axis: 'Landing Safety',
        siteA: siteA.landingSafetyScore,
        siteB: siteB.landingSafetyScore,
      }
    ];
  }, [siteA, siteB]);

  // Delta comparison metrics
  const comparisonMetrics = [
    {
      label: 'Geographic Latitude',
      valA: `${siteA.coordinates.lat}°`,
      valB: `${siteB.coordinates.lat}°`,
      winner: Math.abs(siteA.coordinates.lat) > Math.abs(siteB.coordinates.lat) ? 'A' : 'B',
      note: 'Higher latitude = Closer to South Pole volatiles'
    },
    {
      label: 'Elevation (Datum)',
      valA: `${siteA.elevationM > 0 ? '+' : ''}${siteA.elevationM} m`,
      valB: `${siteB.elevationM > 0 ? '+' : ''}${siteB.elevationM} m`,
      winner: siteA.elevationM > siteB.elevationM ? 'A' : 'B',
      note: 'Higher elevation = Superior line-of-sight & solar grazing'
    },
    {
      label: 'Mean Regional Slope',
      valA: `${siteA.meanSlopeDeg}°`,
      valB: `${siteB.meanSlopeDeg}°`,
      winner: siteA.meanSlopeDeg < siteB.meanSlopeDeg ? 'A' : 'B',
      note: 'Gentler slope = Safer landing & easier rover traversing'
    },
    {
      label: 'Annual Illumination',
      valA: `${siteA.annualIlluminationPct}%`,
      valB: `${siteB.annualIlluminationPct}%`,
      winner: siteA.annualIlluminationPct > siteB.annualIlluminationPct ? 'A' : 'B',
      note: 'Higher illumination = Uninterrupted solar power'
    },
    {
      label: 'Max Continuous Darkness',
      valA: `${siteA.maxContinuousDarknessHours} hrs`,
      valB: `${siteB.maxContinuousDarknessHours} hrs`,
      winner: siteA.maxContinuousDarknessHours < siteB.maxContinuousDarknessHours ? 'A' : 'B',
      note: 'Shorter darkness = Lower battery storage requirements'
    },
    {
      label: 'Direct Earth LOS Visibility',
      valA: `${siteA.earthVisibilityPct}%`,
      valB: `${siteB.earthVisibilityPct}%`,
      winner: siteA.earthVisibilityPct > siteB.earthVisibilityPct ? 'A' : 'B',
      note: 'Continuous Earth visibility minimizes relay satellite reliance'
    },
    {
      label: 'Water Ice Volatiles',
      valA: `${siteA.waterIceProbability} (${siteA.psrProximityKm} km to PSR)`,
      valB: `${siteB.waterIceProbability} (${siteB.psrProximityKm} km to PSR)`,
      winner: siteA.psrProximityKm < siteB.psrProximityKm ? 'A' : 'B',
      note: 'Closer proximity to cryogenic PSR cold-trap deposits'
    },
    {
      label: 'Landing Safety Score',
      valA: `${siteA.landingSafetyScore} / 100`,
      valB: `${siteB.landingSafetyScore} / 100`,
      winner: siteA.landingSafetyScore > siteB.landingSafetyScore ? 'A' : 'B',
      note: 'Composite slope and roughness safety envelope'
    }
  ];

  return (
    <div className="space-y-4 pb-8">
      {/* Selector Header Bar */}
      <div className="bg-[#080d1b] border border-slate-800 rounded-lg p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-base font-bold font-mono text-white">LUNAR LANDING SITE TRADE STUDY</h2>
              <p className="text-xs text-slate-400 font-sans">Multi-criteria comparative analysis between two target sites</p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 self-start sm:self-auto">
            TRADE STUDY ARCHITECTURE
          </span>
        </div>

        {/* Two Selector Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Site A Selector */}
          <div className="p-3 bg-[#0a1024] border border-cyan-500/40 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                TARGET ALPHA (SITE A)
              </span>
              <span className="text-[10px] font-mono text-slate-400">{siteA.code}</span>
            </div>
            <select
              value={siteAId}
              onChange={(e) => setSiteAId(e.target.value)}
              className="w-full bg-[#050811] border border-slate-700 hover:border-cyan-400 text-slate-200 text-xs font-mono rounded px-3 py-2 focus:outline-none"
            >
              {LUNAR_LANDING_SITES.map(s => (
                <option key={s.id} value={s.id} disabled={s.id === siteBId}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-300 font-sans line-clamp-2">
              {siteA.description}
            </p>
          </div>

          {/* Site B Selector */}
          <div className="p-3 bg-[#0a1024] border border-amber-500/40 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                TARGET BRAVO (SITE B)
              </span>
              <span className="text-[10px] font-mono text-slate-400">{siteB.code}</span>
            </div>
            <select
              value={siteBId}
              onChange={(e) => setSiteBId(e.target.value)}
              className="w-full bg-[#050811] border border-slate-700 hover:border-amber-400 text-slate-200 text-xs font-mono rounded px-3 py-2 focus:outline-none"
            >
              {LUNAR_LANDING_SITES.map(s => (
                <option key={s.id} value={s.id} disabled={s.id === siteAId}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-300 font-sans line-clamp-2">
              {siteB.description}
            </p>
          </div>
        </div>
      </div>

      {/* Main Comparison Grid: Radar Chart + Trade Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Radar Chart */}
        <div className="lg:col-span-5 bg-[#080d1b] border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-mono font-semibold text-white uppercase tracking-wider mb-1">
              MULTI-AXIS MISSION CAPABILITY RADAR
            </h3>
            <p className="text-[11px] text-slate-400 font-sans">
              Normalized score (0-100) across six key mission operational parameters.
            </p>
          </div>

          <div className="w-full h-80 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis 
                  dataKey="axis" 
                  stroke="#94a3b8" 
                  tick={{ fontSize: 10, fill: '#cbd5e1', fontFamily: 'JetBrains Mono' }}
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  stroke="#475569" 
                  tick={{ fontSize: 9, fill: '#64748b' }}
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
                />
                <Legend 
                  wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                />
                <Radar 
                  name={siteA.name} 
                  dataKey="siteA" 
                  stroke="#00E5FF" 
                  fill="#00E5FF" 
                  fillOpacity={0.35} 
                />
                <Radar 
                  name={siteB.name} 
                  dataKey="siteB" 
                  stroke="#F59E0B" 
                  fill="#F59E0B" 
                  fillOpacity={0.35} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[10px] font-mono text-slate-500 text-center border-t border-slate-800/80 pt-2">
            Higher values indicate superior mission performance
          </div>
        </div>

        {/* Detailed Comparative Table */}
        <div className="lg:col-span-7 bg-[#080d1b] border border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
              QUANTITATIVE DELTA ANALYSIS
            </h3>
            <span className="text-[10px] font-mono text-slate-400">SIDE-BY-SIDE METRICS</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400 bg-[#050811]">
                  <th className="py-2 px-2.5">Parameter</th>
                  <th className="py-2 px-2.5 text-cyan-300">{siteA.code} (Site A)</th>
                  <th className="py-2 px-2.5 text-amber-300">{siteB.code} (Site B)</th>
                  <th className="py-2 px-2.5 text-center">Advantage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {comparisonMetrics.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#0c142b] transition-colors">
                    <td className="py-2 px-2.5">
                      <span className="font-semibold text-slate-200 block">{item.label}</span>
                      <span className="text-[9px] text-slate-500 font-sans block">{item.note}</span>
                    </td>
                    <td className={`py-2 px-2.5 font-bold ${item.winner === 'A' ? 'text-cyan-300' : 'text-slate-400'}`}>
                      {item.valA}
                    </td>
                    <td className={`py-2 px-2.5 font-bold ${item.winner === 'B' ? 'text-amber-300' : 'text-slate-400'}`}>
                      {item.valB}
                    </td>
                    <td className="py-2 px-2.5 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                        item.winner === 'A'
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                          : 'bg-amber-950 text-amber-300 border-amber-800'
                      }`}>
                        Site {item.winner}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mission Recommendation Synthesis */}
      <div className="bg-[#080d1b] border border-slate-800 rounded-lg p-4">
        <h4 className="text-xs font-mono font-semibold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>EVALUATION SUMMARY & MISSION ARCHITECTURE FIT</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans text-slate-300">
          <div className="p-3 bg-[#050811] rounded border border-cyan-900/40 space-y-1">
            <span className="font-mono font-bold text-cyan-400 block text-xs">
              Site A Recommendation: {siteA.name}
            </span>
            <p className="text-[11px] leading-relaxed text-slate-300">
              Optimal for <strong>{siteA.recommendedMissionType}</strong>. {siteA.missionSignificance}
            </p>
          </div>
          <div className="p-3 bg-[#050811] rounded border border-amber-900/40 space-y-1">
            <span className="font-mono font-bold text-amber-400 block text-xs">
              Site B Recommendation: {siteB.name}
            </span>
            <p className="text-[11px] leading-relaxed text-slate-300">
              Optimal for <strong>{siteB.recommendedMissionType}</strong>. {siteB.missionSignificance}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
