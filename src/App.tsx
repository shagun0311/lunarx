/**
 * LUNARX - Lunar Landing Site Evaluation & Mission Planning Platform
 * Professional NASA-inspired mission control interface.
 * Built with React, TypeScript, Three.js, and Recharts.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  LunarSite, 
  LunarCoordinates, 
  MissionTimeState, 
  BackendStatus 
} from './types/lunar';
import { LUNAR_LANDING_SITES } from './data/lunarSites';
import { scientificBackend } from './services/scientificBackend';

// Layout & Navigation Components
import { MissionHeader } from './components/layout/MissionHeader';
import { MissionSidebar, ActiveTab } from './components/layout/MissionSidebar';
import { TimelineBar } from './components/timeline/TimelineBar';
import { FastApiBackendModal } from './components/modals/FastApiBackendModal';
import { PersonalisationStudioModal } from './components/modals/PersonalisationStudioModal';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';

// Theme Context
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Views
import { MissionOverviewView } from './components/views/MissionOverviewView';
import { LunarExplorerView } from './components/views/LunarExplorerView';
import { SolarIntelligenceView } from './components/views/SolarIntelligenceView';
import { EarthCommsView } from './components/views/EarthCommsView';
import { TerrainAnalysisView } from './components/views/TerrainAnalysisView';
import { SiteComparisonView } from './components/views/SiteComparisonView';
import { EarthVsMoonView } from './components/views/EarthVsMoonView';

import { Menu, X } from 'lucide-react';

function LunarXAppContent() {
  const { settings } = useTheme();

  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  // Selected Target Landing Site
  const [selectedSite, setSelectedSite] = useState<LunarSite>(LUNAR_LANDING_SITES[0]); // Shackleton Rim default
  const [customCoordinates, setCustomCoordinates] = useState<LunarCoordinates | null>(null);

  // Simulation Time (hours from 0 to 708.734)
  // Default to 120 hours (early day / sunrise active at polar rims)
  const [simulationHours, setSimulationHours] = useState<number>(120);

  // Backend Status & Modal
  const [backendStatus, setBackendStatus] = useState<BackendStatus>(scientificBackend.getBackendStatus());
  const [isBackendModalOpen, setIsBackendModalOpen] = useState<boolean>(false);

  // Calculate dynamic mission time state
  const timeState: MissionTimeState = useMemo(() => {
    return scientificBackend.calculateMissionTimeState(simulationHours);
  }, [simulationHours]);

  // Evaluate site metrics based on target & time
  const metrics = useMemo(() => {
    const target = customCoordinates || selectedSite;
    return scientificBackend.evaluateLocation(target, timeState);
  }, [selectedSite, customCoordinates, timeState]);

  // Periodic health check for Python FastAPI backend
  useEffect(() => {
    scientificBackend.pingBackend().then(() => {
      setBackendStatus(scientificBackend.getBackendStatus());
    });
  }, []);

  const handleSelectSite = (site: LunarSite) => {
    setSelectedSite(site);
    setCustomCoordinates(null); // Clear custom pin when selecting a curated site
  };

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsMobileNavOpen(false);
  };

  return (
    <div 
      className={`flex flex-col h-screen h-[100dvh] w-screen overflow-hidden font-sans transition-colors ${
        !settings.animationsEnabled ? 'animations-disabled' : ''
      } ${settings.theme !== 'lunar-light' ? 'lunar-subtle-stars' : ''}`}
      style={{
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-primary)'
      }}
    >
      {/* Top Mission Control Header */}
      <MissionHeader
        selectedSite={selectedSite}
        onSelectSite={handleSelectSite}
        timeState={timeState}
        backendStatus={backendStatus}
        onOpenBackendSettings={() => setIsBackendModalOpen(true)}
      />

      {/* Main App Body: Sidebar + Dynamic Content View */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Mobile Navigation Toggle Button */}
        <div className="md:hidden absolute top-2 right-3 z-40">
          <button
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="p-1.5 rounded border transition-colors"
            style={{
              backgroundColor: 'var(--bg-header)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
          >
            {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden md:block shrink-0 h-full">
          <MissionSidebar activeTab={activeTab} onSelectTab={handleTabChange} />
        </div>

        {/* Mobile Sidebar Drawer Overlay */}
        {isMobileNavOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div 
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsMobileNavOpen(false)}
            />
            <div 
              className="relative w-72 max-w-[85vw] h-full z-50 shadow-2xl transition-colors"
              style={{ backgroundColor: 'var(--bg-sidebar)' }}
            >
              <MissionSidebar activeTab={activeTab} onSelectTab={handleTabChange} />
            </div>
          </div>
        )}

        {/* Central Scrollable Scientific Workspace */}
        <main 
          className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 transition-colors"
          style={{ backgroundColor: 'var(--bg-app)' }}
        >
          {activeTab === 'overview' && (
            <MissionOverviewView
              selectedSite={selectedSite}
              onSelectSite={handleSelectSite}
              metrics={metrics}
              timeState={timeState}
              customCoordinates={customCoordinates}
              onNavigateToTab={handleTabChange}
            />
          )}

          {activeTab === 'explorer' && (
            <LunarExplorerView
              selectedSite={selectedSite}
              onSelectSite={handleSelectSite}
              customCoordinates={customCoordinates}
              onSetCustomCoordinates={setCustomCoordinates}
              timeState={timeState}
              metrics={metrics}
            />
          )}

          {activeTab === 'solar' && (
            <SolarIntelligenceView
              selectedSite={selectedSite}
              timeState={timeState}
              metrics={metrics}
            />
          )}

          {activeTab === 'comms' && (
            <EarthCommsView
              selectedSite={selectedSite}
              timeState={timeState}
              metrics={metrics}
            />
          )}

          {activeTab === 'terrain' && (
            <TerrainAnalysisView
              selectedSite={selectedSite}
              metrics={metrics}
            />
          )}

          {activeTab === 'comparison' && (
            <SiteComparisonView
              initialSiteA={selectedSite}
              onSelectSite={handleSelectSite}
            />
          )}

          {activeTab === 'earth-vs-moon' && (
            <EarthVsMoonView />
          )}
        </main>
      </div>

      {/* Bottom Mission Timeline Slider */}
      <TimelineBar
        timeState={timeState}
        onTimeChange={setSimulationHours}
      />

      {/* Python FastAPI Backend Settings Modal */}
      <FastApiBackendModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
        status={backendStatus}
        onStatusChange={setBackendStatus}
      />

      {/* Personalisation Studio Modal */}
      <PersonalisationStudioModal />

      {/* PWA Offline Connectivity Indicator */}
      <OfflineIndicator />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LunarXAppContent />
    </ThemeProvider>
  );
}
