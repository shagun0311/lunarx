import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X, CheckCircle, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useTheme } from '../../context/ThemeContext';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  variant = 'compact',
  className = '' 
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showAndroidInfo, setShowAndroidInfo] = useState(false);
  const { settings } = useTheme();

  // If already running in standalone PWA mode, suppress install button
  if (isInstalled) {
    return null;
  }

  // Native Chromium / Android / Edge / Chrome prompt
  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      setShowAndroidInfo(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        title="Install LunarX on your device (iOS, Android, Tablet, Desktop)"
        className={`flex items-center gap-1.5 rounded-lg border font-mono text-xs font-semibold shadow-sm transition-all hover:scale-102 active:scale-98 ${
          variant === 'compact' ? 'px-2.5 py-1' : 'px-3 py-1.5 w-full justify-center'
        } ${className}`}
        style={{
          backgroundColor: `${settings.accentColor}18`,
          borderColor: `${settings.accentColor}50`,
          color: settings.accentColor
        }}
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span className={variant === 'compact' ? 'hidden sm:inline' : 'inline'}>
          INSTALL APP
        </span>
      </button>

      {/* iOS Safari Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div 
            className="w-full max-w-sm rounded-2xl border p-5 shadow-2xl space-y-4 font-sans text-slate-100"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
            }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${settings.accentColor}25` }}
                >
                  <Smartphone className="w-4 h-4" style={{ color: settings.accentColor }} />
                </div>
                <div>
                  <h3 className="font-bold text-sm font-mono">Install LunarX on iOS</h3>
                  <p className="text-[11px] text-slate-400">iPhone & iPad Safari instructions</p>
                </div>
              </div>
              <button 
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-2.5 rounded-xl border bg-slate-900/40" style={{ borderColor: 'var(--border-color)' }}>
                <div className="w-6 h-6 rounded-full bg-cyan-950 flex items-center justify-center text-cyan-400 font-bold shrink-0 text-xs">
                  1
                </div>
                <div>
                  <p className="font-semibold text-slate-200">Tap the Share Button</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    Look for the <Share2 className="w-3 h-3 text-cyan-400 inline" /> Share icon at the bottom of Safari on iPhone, or top bar on iPad.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl border bg-slate-900/40" style={{ borderColor: 'var(--border-color)' }}>
                <div className="w-6 h-6 rounded-full bg-cyan-950 flex items-center justify-center text-cyan-400 font-bold shrink-0 text-xs">
                  2
                </div>
                <div>
                  <p className="font-semibold text-slate-200">Select "Add to Home Screen"</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    Scroll down and tap <PlusSquare className="w-3 h-3 text-cyan-400 inline" /> <strong>Add to Home Screen</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl border bg-slate-900/40" style={{ borderColor: 'var(--border-color)' }}>
                <div className="w-6 h-6 rounded-full bg-cyan-950 flex items-center justify-center text-cyan-400 font-bold shrink-0 text-xs">
                  3
                </div>
                <div>
                  <p className="font-semibold text-slate-200">Confirm & Launch</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Tap <strong>Add</strong> in the top right. LunarX will appear on your home screen with its moon icon and fullscreen mission interface.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2 rounded-lg font-mono text-xs font-bold text-slate-950 transition-opacity hover:opacity-90 shadow-md"
              style={{ backgroundColor: settings.accentColor }}
            >
              GOT IT
            </button>
          </div>
        </div>
      )}

      {/* Android / Desktop Generic Help Modal (if browser hasn't fired beforeinstallprompt yet) */}
      {showAndroidInfo && !isInstallable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div 
            className="w-full max-w-sm rounded-2xl border p-5 shadow-2xl space-y-4 font-sans text-slate-100"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
            }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${settings.accentColor}25` }}
                >
                  <Download className="w-4 h-4" style={{ color: settings.accentColor }} />
                </div>
                <div>
                  <h3 className="font-bold text-sm font-mono">Install LunarX</h3>
                  <p className="text-[11px] text-slate-400">Android & Desktop Browser</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAndroidInfo(false)}
                className="p-1 rounded text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              To install LunarX, tap your browser's menu (<strong>⋮</strong> or <strong>⋯</strong> in Chrome, Brave, or Edge) and select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
            </p>

            <button
              onClick={() => setShowAndroidInfo(false)}
              className="w-full py-2 rounded-lg font-mono text-xs font-bold text-slate-950 transition-opacity hover:opacity-90 shadow-md"
              style={{ backgroundColor: settings.accentColor }}
            >
              UNDERSTOOD
            </button>
          </div>
        </div>
      )}
    </>
  );
};
