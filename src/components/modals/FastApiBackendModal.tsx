/**
 * LUNARX FastAPI Backend Connection & Architecture Modal
 * Prepares the application for connection to a Python FastAPI scientific backend.
 */

import React, { useState } from 'react';
import { 
  X, 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Code, 
  ExternalLink, 
  Terminal,
  Copy,
  Check
} from 'lucide-react';
import { BackendStatus } from '../../types/lunar';
import { scientificBackend } from '../../services/scientificBackend';

interface FastApiBackendModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: BackendStatus;
  onStatusChange: (status: BackendStatus) => void;
}

export const FastApiBackendModal: React.FC<FastApiBackendModalProps> = ({
  isOpen,
  onClose,
  status,
  onStatusChange
}) => {
  const [url, setUrl] = useState<string>(status.url);
  const [isEnabled, setIsEnabled] = useState<boolean>(status.mode === 'fastapi-backend');
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    scientificBackend.setBackendUrl(url, true);
    const ok = await scientificBackend.pingBackend();
    setTesting(false);
    if (ok) {
      setTestResult({ success: true, msg: 'FastAPI scientific backend responded successfully (200 OK).' });
      setIsEnabled(true);
    } else {
      setTestResult({
        success: false,
        msg: `Unable to reach ${url}. Standalone client celestial simulation remains active.`
      });
    }
    onStatusChange(scientificBackend.getBackendStatus());
  };

  const handleSave = () => {
    scientificBackend.setBackendUrl(url, isEnabled);
    onStatusChange(scientificBackend.getBackendStatus());
    onClose();
  };

  const samplePythonSnippet = `from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="LUNARX Scientific API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/health")
def health_check():
    return {"status": "online", "engine": "NASA SPICE DE440", "precision": "double"}

@app.get("/api/v1/solar/illumination")
def get_solar_illumination(lat: float, lng: float, epoch: str):
    # Calculate solar elevation via Skyfield / SPICE ephemerides
    return {"elevation_deg": 1.45, "flux_wm2": 1361.0, "is_psr": False}`;

  const copyCode = () => {
    navigator.clipboard.writeText(samplePythonSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="bg-[#080d1b] border border-slate-700 rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-[#0b1226]">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-semibold text-white font-mono">SCIENTIFIC BACKEND ARCHITECTURE</h3>
              <p className="text-[11px] text-slate-400 font-sans">Python FastAPI / NASA SPICE Integration Endpoint</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs font-sans">
          {/* Status banner */}
          <div className={`p-3 rounded border flex items-center justify-between ${
            status.connected
              ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
              : 'bg-amber-950/30 border-amber-800/60 text-amber-200'
          }`}>
            <div className="flex items-center gap-2">
              {status.connected ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400" />
              )}
              <div>
                <span className="font-mono font-bold block text-[11px]">
                  {status.connected ? 'FASTAPI BACKEND ONLINE' : 'CLIENT CELESTIAL SIMULATION ACTIVE'}
                </span>
                <span className="text-[10px] text-slate-300">
                  {status.connected 
                    ? `Connected to ${status.url} (Latency: ${status.latencyMs}ms)`
                    : 'Backend not detected at configured endpoint. Using High-Fidelity Client Orbital Engine.'}
                </span>
              </div>
            </div>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-black/40 border border-slate-700">
              {status.ephemerisEngine}
            </span>
          </div>

          {/* URL Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-medium text-slate-300 uppercase tracking-wider">
              FastAPI Server URL:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="http://localhost:8000"
                className="flex-1 bg-[#050811] border border-slate-700 rounded px-3 py-1.5 font-mono text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={handleTestConnection}
                disabled={testing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600/30 hover:bg-cyan-600/40 border border-cyan-500/60 text-cyan-200 rounded font-mono text-xs font-medium disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                <span>{testing ? 'Testing...' : 'Test Connection'}</span>
              </button>
            </div>
            {testResult && (
              <p className={`text-[11px] font-mono mt-1 ${testResult.success ? 'text-emerald-400' : 'text-amber-400'}`}>
                {testResult.msg}
              </p>
            )}
          </div>

          {/* Toggle Enable */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="enableFastApi"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <label htmlFor="enableFastApi" className="text-slate-300 font-mono text-[11px] cursor-pointer">
              Prefer FastAPI backend over standalone client simulation
            </label>
          </div>

          {/* Architecture Spec & Code Reference */}
          <div className="border border-slate-800 rounded bg-[#050811] p-3 space-y-2">
            <div className="flex items-center justify-between text-slate-300">
              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <Code className="w-3.5 h-3.5 text-cyan-400" />
                <span>Backend Starter: main.py (FastAPI)</span>
              </div>
              <button
                onClick={copyCode}
                className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-cyan-300 font-mono"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-2.5 bg-[#03050a] rounded text-[10px] font-mono text-slate-300 overflow-x-auto border border-slate-900 leading-relaxed">
              {samplePythonSnippet}
            </pre>
          </div>

          <div className="text-[11px] text-slate-400 leading-relaxed">
            <strong className="text-slate-200">Scientific Disclaimer:</strong> Calculations in standalone mode are based on simplified 2-body lunar orbital dynamics and public LRO LOLA topography benchmarks. Connect the Python FastAPI service with NASA SPICE toolkit for flight-grade precision.
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#090f21] flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-semibold"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
