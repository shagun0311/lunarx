/**
 * LUNARX Mission Control Navigation Sidebar
 * Refined, narrow, collapsible sidebar with clean icons, concise labels,
 * and full theme integration.
 */

import React from 'react';
import { 
  LayoutDashboard, 
  Globe2, 
  SunMedium, 
  Radio, 
  Mountain, 
  GitCompare, 
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  Info,
  Palette
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { PWAInstallButton } from '../pwa/PWAInstallButton';

export type ActiveTab = 
  | 'overview' 
  | 'explorer' 
  | 'solar' 
  | 'comms' 
  | 'terrain' 
  | 'comparison' 
  | 'earth-vs-moon';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'explorer', label: 'Explorer', icon: Globe2 },
  { id: 'solar', label: 'Solar', icon: SunMedium },
  { id: 'comms', label: 'Comms', icon: Radio },
  { id: 'terrain', label: 'Terrain', icon: Mountain },
  { id: 'comparison', label: 'Compare', icon: GitCompare },
  { id: 'earth-vs-moon', label: 'Earth vs Moon', icon: ArrowLeftRight }
];

interface MissionSidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  className?: string;
}

export const MissionSidebar: React.FC<MissionSidebarProps> = ({
  activeTab,
  onSelectTab,
  className = ''
}) => {
  const { settings, updateSetting, openPersonalisationStudio } = useTheme();
  const isCollapsed = !settings.sidebarExpanded;

  const toggleCollapsed = () => {
    updateSetting('sidebarExpanded', !settings.sidebarExpanded);
  };

  const isCompact = settings.density === 'compact';
  const isSpacious = settings.density === 'spacious';

  return (
    <aside 
      className={`border-r flex flex-col justify-between py-3 select-none h-full transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16 px-1.5' : 'w-48 px-2'
      } ${className}`}
      style={{
        backgroundColor: 'var(--bg-sidebar)',
        borderColor: 'var(--border-color)',
        color: 'var(--text-primary)'
      }}
    >
      {/* Top Header & Navigation Links */}
      <div className="space-y-4">
        {/* Toggle Collapse Button & Title */}
        <div 
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-2'} pb-2 border-b`}
          style={{ borderColor: 'var(--border-color)' }}
        >
          {!isCollapsed && (
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold opacity-60">
              MODULES
            </span>
          )}
          <button
            onClick={toggleCollapsed}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className="p-1 rounded opacity-60 hover:opacity-100 hover:bg-slate-800/40 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className={`space-y-1 ${isCompact ? 'space-y-0.5' : isSpacious ? 'space-y-1.5' : 'space-y-1'}`}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-2.5 rounded transition-all group ${
                  isCompact ? 'py-1.5 px-2 text-[11px]' : isSpacious ? 'py-2.5 px-3 text-xs' : 'py-2 px-2.5 text-xs'
                } ${
                  isActive
                    ? 'font-medium shadow-sm'
                    : 'opacity-70 hover:opacity-100 hover:bg-slate-800/25'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                style={isActive ? {
                  backgroundColor: `${settings.accentColor}18`,
                  color: settings.accentColor,
                  borderLeft: `3px solid ${settings.accentColor}`
                } : { borderLeft: '3px solid transparent' }}
              >
                <Icon 
                  className="w-4 h-4 shrink-0 transition-colors"
                  style={isActive ? { color: settings.accentColor } : {}}
                />

                {!isCollapsed && (
                  <span className="font-mono tracking-tight truncate">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Settings & Protocol Note */}
      <div 
        className="pt-2 border-t space-y-2"
        style={{ borderColor: 'var(--border-color)' }}
      >
        {/* PWA Install Button (renders full in expanded sidebar, compact in collapsed) */}
        <PWAInstallButton variant={isCollapsed ? 'compact' : 'full'} />

        {/* Personalisation Studio Under Settings Button */}
        <button
          onClick={openPersonalisationStudio}
          title="Open Personalisation Studio (Themes, Accents, Density)"
          className={`w-full flex items-center gap-2 py-2 px-2 rounded-lg border text-xs font-mono transition-all hover:scale-101 ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          style={{
            backgroundColor: `${settings.accentColor}12`,
            borderColor: `${settings.accentColor}35`,
            color: settings.accentColor
          }}
        >
          <Palette className="w-4 h-4 shrink-0" />
          {!isCollapsed && (
            <div className="flex flex-col text-left leading-tight truncate">
              <span className="font-bold text-[11px]">SETTINGS</span>
              <span className="text-[9px] opacity-70">Personalisation Studio</span>
            </div>
          )}
        </button>

        {!isCollapsed && (
          <div className="px-2 pt-1">
            <div className="flex items-center gap-1.5 text-[10px] font-mono opacity-60 mb-0.5">
              <Info className="w-3 h-3 shrink-0" style={{ color: settings.accentColor }} />
              <span>LRO LOLA / LROC</span>
            </div>
            <p className="text-[9px] opacity-40 font-mono leading-tight">
              DE440 EPHEMERIS
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
