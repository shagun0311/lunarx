/**
 * LUNARX Mission Timeline Controller
 * Refined, collapsible timeline controller.
 * Preserves all simulation functionality, scrub controls, speed presets, and phase jumps.
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Calendar, 
  Sun, 
  Moon, 
  Clock, 
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { MissionTimeState } from '../../types/lunar';
import { useTheme } from '../../context/ThemeContext';

interface TimelineBarProps {
  timeState: MissionTimeState;
  onTimeChange: (simulationHours: number) => void;
  className?: string;
}

const SYNODIC_MONTH_HOURS = 708.734;

export const TimelineBar: React.FC<TimelineBarProps> = ({
  timeState,
  onTimeChange,
  className = ''
}) => {
  const { settings, updateSetting } = useTheme();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(10); // hours per second
  const isExpanded = settings.timelineExpanded;
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const toggleExpanded = () => {
    updateSetting('timelineExpanded', !settings.timelineExpanded);
  };

  // Animation Loop for Time Progression
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      lastTimeRef.current = null;
      return;
    }

    const loop = (timestamp: number) => {
      if (lastTimeRef.current !== null) {
        const deltaSec = (timestamp - lastTimeRef.current) / 1000;
        const addedHours = deltaSec * playbackSpeed;
        const newHours = (timeState.simulationHours + addedHours) % SYNODIC_MONTH_HOURS;
        onTimeChange(newHours);
      }
      lastTimeRef.current = timestamp;
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, playbackSpeed, timeState.simulationHours, onTimeChange]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hours = parseFloat(e.target.value);
    onTimeChange(hours);
  };

  const jumpToPhase = (hours: number) => {
    onTimeChange(hours);
  };

  return (
    <div className={`w-full bg-[#060a14] border-t border-slate-800/70 z-20 select-none shadow-lg transition-all ${className}`}>
      {/* Primary Compact Bar (Always Visible) */}
      <div className="px-4 py-2 flex items-center justify-between gap-3 text-xs font-mono">
        {/* Play/Pause & Time Indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause Simulation' : 'Run Lunar Day Simulation'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3 h-3 fill-current" />
                <span className="hidden sm:inline">PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span className="hidden sm:inline">SIMULATE</span>
              </>
            )}
          </button>

          <button
            onClick={() => onTimeChange(0)}
            title="Reset to Day 0"
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          {/* Quick Lunar Hour Telemetry */}
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-slate-400">Hour:</span>
            <span className="text-white font-bold">{timeState.simulationHours.toFixed(1)}h</span>
            <span className="text-slate-500 hidden md:inline">
              (Day {(timeState.simulationHours / 24).toFixed(1)} / 29.5d)
            </span>
            <span className="text-amber-400/90 font-semibold hidden lg:inline">
              • {timeState.lunarDayProgressPct}%
            </span>
          </div>
        </div>

        {/* Center Target Epoch Display */}
        <div className="hidden sm:flex items-center gap-2 text-slate-400 text-[11px]">
          <Calendar className="w-3 h-3 text-cyan-400/80" />
          <span className="text-slate-300 font-semibold">{timeState.epochIso.slice(0, 10)} {timeState.epochIso.slice(11, 16)}Z</span>
        </div>

        {/* Toggle Expand / Collapse Details Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleExpanded}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] transition-colors"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)'
            }}
          >
            <span>{isExpanded ? 'Hide Controls' : 'Timeline Controls'}</span>
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Expandable Extended Scrub Slider & Phase Markers */}
      {isExpanded && (
        <div className="px-4 pb-3 pt-1 border-t border-slate-800/40 space-y-2 animate-fadeIn">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Speed Presets */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400 text-[11px]">Sim Speed:</span>
              <div className="flex items-center bg-[#0b1222] border border-slate-700/70 rounded p-0.5 text-[10px]">
                {[1, 10, 30].map(speed => (
                  <button
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      playbackSpeed === speed
                        ? 'bg-cyan-500/30 text-cyan-300 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {speed}h/s
                  </button>
                ))}
              </div>
            </div>

            {/* Scrub Slider */}
            <div className="flex-1 w-full max-w-2xl px-2 py-1">
              <input
                type="range"
                min="0"
                max={SYNODIC_MONTH_HOURS}
                step="0.5"
                value={timeState.simulationHours}
                onChange={handleSliderChange}
                className="w-full h-3.5 sm:h-2 bg-slate-800 rounded appearance-none cursor-pointer touch-pan-x"
                style={{ accentColor: settings.accentColor }}
              />

              {/* Astronomical Phase Markers */}
              <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1 flex-wrap gap-1">
                <button onClick={() => jumpToPhase(0)} className="hover:text-cyan-400 py-1 transition-colors">
                  New (0h)
                </button>
                <button onClick={() => jumpToPhase(177)} className="hover:text-cyan-400 py-1 transition-colors hidden sm:inline">
                  1st Qtr (177h)
                </button>
                <button onClick={() => jumpToPhase(354)} className="hover:text-amber-400 py-1 transition-colors font-medium text-amber-300">
                  Full / Noon (354h)
                </button>
                <button onClick={() => jumpToPhase(531)} className="hover:text-cyan-400 py-1 transition-colors hidden sm:inline">
                  3rd Qtr (531h)
                </button>
                <button onClick={() => jumpToPhase(708)} className="hover:text-cyan-400 py-1 transition-colors">
                  End (708.7h)
                </button>
              </div>
            </div>

            {/* Mission Elapsed Time */}
            <div className="text-right text-[11px] font-mono text-cyan-300/90 hidden md:block">
              {timeState.metString}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
