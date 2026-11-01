/**
 * LUNARX Earth vs Moon View
 * Comparative physical, environmental, and terrain benchmark interface contrasting
 * Earth terrestrial characteristics with Lunar conditions.
 * Features interactive gravity and weight/jump physics calculator.
 */

import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  Globe, 
  Moon, 
  Scale, 
  Flame, 
  ShieldAlert, 
  Wind, 
  Activity, 
  Clock, 
  Zap,
  Calculator
} from 'lucide-react';

export const EarthVsMoonView: React.FC = () => {
  const [earthMassKg, setEarthMassKg] = useState<number>(85); // 85kg astronaut with EVA suit
  const [equipmentType, setEquipmentType] = useState<string>('eva-astronaut');

  const presetMasses: Record<string, { label: string; mass: number }> = {
    'eva-astronaut': { label: 'Astronaut in Artemis xEMU Suit (85kg person + 55kg suit)', mass: 140 },
    'lunar-rover': { label: 'Lunar Terrain Vehicle (LTV Rover)', mass: 1850 },
    'apollo-lm': { label: 'Apollo 11 Lunar Module (Descent Stage)', mass: 10334 },
    'starship-hls': { label: 'Artemis Starship HLS (Dry Mass)', mass: 85000 }
  };

  const currentMass = earthMassKg;
  // Earth gravity g = 9.807 m/s², Moon gravity g = 1.622 m/s²
  const earthWeightN = Math.round(currentMass * 9.807);
  const moonWeightN = Math.round(currentMass * 1.622);
  const moonApparentKg = Math.round(currentMass * (1.622 / 9.807));

  // Jump height calculation for a human leg impulse of h0 = 0.5m on Earth
  const earthJumpHeightM = 0.5;
  const moonJumpHeightM = Number((earthJumpHeightM * (9.807 / 1.622)).toFixed(2)); // ~3.02m
  const moonHangTimeSec = Number((2 * Math.sqrt(2 * moonJumpHeightM / 1.622)).toFixed(2)); // ~3.8s

  const environmentalComparisons = [
    {
      category: 'Surface Gravity',
      earth: '9.81 m/s² (1.00 g)',
      moon: '1.62 m/s² (0.165 g)',
      delta: '83.5% lighter on Moon',
      implication: 'Enables massive landers to touch down without parachutes using small throttleable engines; increases astronaut jump height by ~6x.'
    },
    {
      category: 'Atmospheric Pressure',
      earth: '101.325 kPa (1.0 atm at sea level)',
      moon: '< 10⁻¹² torr (Hard Ultra-Vacuum)',
      delta: '14 orders of magnitude lower',
      implication: 'Zero aerodynamic drag or atmospheric braking. Requires pressurized habitats, space suits, and active cooling (sublimators).'
    },
    {
      category: 'Diurnal Cycle (Day/Night)',
      earth: '24 hours (12h day / 12h night)',
      moon: '708.7 hours (29.53 Earth days)',
      delta: '29.5x longer day/night cycle',
      implication: 'Requires massive 354-hour continuous battery or regenerative fuel-cell reserves for equatorial sites, or positioning on high polar peaks.'
    },
    {
      category: 'Surface Temperature Extremes',
      earth: '-89.2°C to +56.7°C (Δ146°C)',
      moon: '-180°C to +121°C (Δ301°C, <40K in PSRs)',
      delta: 'Twice the temperature swing',
      implication: 'Extreme thermal fatigue on hardware. Radiators must handle boiling heat at noon and cryogenic chill through two weeks of night.'
    },
    {
      category: 'Space Radiation Environment',
      earth: '~1 mSv/year (Shielded by magnetosphere)',
      moon: '380 - 450 mSv/year (GCR & SPE unshielded)',
      delta: 'Over 400x higher radiation',
      implication: 'Galactic Cosmic Rays (GCR) and Solar Particle Events (SPE) mandate regolith berm shielding (≥2m) or lava tube shelters.'
    },
    {
      category: 'Escape Velocity',
      earth: '11.186 km/s (40,270 km/h)',
      moon: '2.380 km/s (8,568 km/h)',
      delta: '4.7x lower escape velocity',
      implication: 'Single-Stage-To-Orbit (SSTO) ascent is practical from the lunar surface back to orbit or Gateway with minimal propellant mass fraction.'
    },
    {
      category: 'Soil & Regolith Composition',
      earth: 'Hydrated organic loam / weathered sand',
      moon: 'Sharp glassy micro-breccia (Regolith)',
      delta: 'Unweathered jagged abrasive particles',
      implication: 'Lunar regolith is abrasive like ground glass, electrostatically charged, and damages suit joints, airlock seals, and optical visors.'
    },
    {
      category: 'Magnetic Field',
      earth: '30,000 – 60,000 nT (Global Dipole)',
      moon: '< 5 nT (Localized crustal swirls only)',
      delta: 'Virtually no global magnetic shield',
      implication: 'Solar wind ions impinge directly onto the regolith, implanting solar protons, helium-3, and driving space weathering.'
    }
  ];

  return (
    <div className="space-y-4 pb-8">
      {/* Header Banner */}
      <div className="bg-[#080d1b] border border-slate-800 rounded-lg p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-base font-bold font-mono text-white">EARTH VS MOON: PLANETARY COMPARATIVE BENCHMARK</h2>
              <p className="text-xs text-slate-400 font-sans">
                Contrasting physical dynamics, gravity, vacuum thermodynamics, and regolith characteristics
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 self-start sm:self-auto">
            PHYSICS BENCHMARK MODEL
          </span>
        </div>

        {/* Side by Side Planet Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3 bg-[#0a1024] border border-blue-500/40 rounded-lg space-y-1.5">
            <div className="flex items-center gap-2 text-blue-400 font-bold">
              <Globe className="w-4 h-4" />
              <span>TERRESTRIAL BASELINE (EARTH)</span>
            </div>
            <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
              Equatorial radius 6,378 km • Dense N₂/O₂ atmosphere • 1-g gravitational well • Protective geomagnetic dipole field.
            </p>
          </div>

          <div className="p-3 bg-[#0a1024] border border-cyan-500/40 rounded-lg space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-300 font-bold">
              <Moon className="w-4 h-4" />
              <span>LUNAR ENVIRONMENT (MOON)</span>
            </div>
            <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
              Mean radius 1,737.4 km (27% Earth) • 0.166-g gravity • Ultra-vacuum • 708.7-hour synodic day • Unfiltered cosmic radiation.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Gravity & Weight Physics Calculator */}
      <div className="bg-[#080d1b] border border-slate-800 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
              INTERACTIVE LUNAR GRAVITATIONAL DYNAMICS CALCULATOR
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">g_moon = 1.622 m/s²</span>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-slate-400 text-[11px]">Payload Preset:</span>
          {Object.entries(presetMasses).map(([key, item]) => (
            <button
              key={key}
              onClick={() => {
                setEquipmentType(key);
                setEarthMassKg(item.mass);
              }}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                equipmentType === key
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/60 font-semibold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label.split('(')[0].trim()}
            </button>
          ))}
        </div>

        {/* Mass Slider */}
        <div className="space-y-1 font-mono text-xs">
          <div className="flex justify-between text-slate-300">
            <span>Payload Mass (Invariant):</span>
            <span className="text-cyan-300 font-bold">{currentMass.toLocaleString()} kg</span>
          </div>
          <input
            type="range"
            min="10"
            max="100000"
            step="10"
            value={earthMassKg}
            onChange={(e) => {
              setEarthMassKg(parseFloat(e.target.value));
              setEquipmentType('custom');
            }}
            className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Calculator Output Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-3 bg-[#050811] rounded border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Earth Weight</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold text-blue-300">{earthWeightN.toLocaleString()}</span>
              <span className="text-slate-400">N</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">9.807 m/s² standard</span>
          </div>

          <div className="p-3 bg-[#050811] rounded border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Lunar Weight</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold text-cyan-300">{moonWeightN.toLocaleString()}</span>
              <span className="text-slate-400">N</span>
            </div>
            <span className="text-[10px] text-cyan-400 mt-1 block">Felt as {moonApparentKg.toLocaleString()} kgf</span>
          </div>

          <div className="p-3 bg-[#050811] rounded border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Max Human Jump</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold text-amber-300">{moonJumpHeightM}</span>
              <span className="text-slate-400">meters</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">vs 0.50m on Earth</span>
          </div>

          <div className="p-3 bg-[#050811] rounded border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Jump Hang Time</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold text-purple-300">{moonHangTimeSec}</span>
              <span className="text-slate-400">seconds</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">In aerial descent</span>
          </div>
        </div>
      </div>

      {/* Environmental Comparison Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {environmentalComparisons.map((item, idx) => (
          <div key={idx} className="bg-[#080d1b] border border-slate-800 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="text-xs font-mono font-bold text-slate-200">
                {item.category}
              </span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800">
                {item.delta}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#050811] p-2 rounded">
              <div>
                <span className="text-[9px] text-blue-400 block uppercase">Earth Terrestrial</span>
                <span className="text-slate-200 font-semibold">{item.earth}</span>
              </div>
              <div>
                <span className="text-[9px] text-cyan-400 block uppercase">Moon Surface</span>
                <span className="text-white font-semibold">{item.moon}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              <strong className="text-slate-300 font-mono">Mission Impact: </strong>{item.implication}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
