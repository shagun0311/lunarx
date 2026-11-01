/**
 * LUNARX Theme & Personalisation Context
 * Manages 4 themes, custom accent colors, interface density, font scaling,
 * animations, moon visualization modes, and persistent localStorage sync.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeId = 'midnight-space' | 'lunar-aurora' | 'cosmic-violet' | 'lunar-light';
export type AccentColor = '#00E5FF' | '#38BDF8' | '#10B981' | '#F59E0B' | '#A855F7' | '#E2E8F0';
export type DashboardDensity = 'spacious' | 'balanced' | 'compact';
export type FontSize = 'small' | 'medium' | 'large';
export type MoonVisualMode = 'realistic' | 'enhanced' | 'minimal';
export type DataPanelAppearance = 'minimal' | 'detailed';

export interface ThemeSettings {
  theme: ThemeId;
  accentColor: AccentColor;
  density: DashboardDensity;
  fontSize: FontSize;
  sidebarExpanded: boolean;
  animationsEnabled: boolean;
  moonVisualMode: MoonVisualMode;
  timelineExpanded: boolean;
  dataPanelAppearance: DataPanelAppearance;
}

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  theme: 'midnight-space',
  accentColor: '#00E5FF',
  density: 'balanced',
  fontSize: 'medium',
  sidebarExpanded: true,
  animationsEnabled: true,
  moonVisualMode: 'realistic',
  timelineExpanded: false,
  dataPanelAppearance: 'minimal'
};

export const ACCENT_SWATCHES: { color: AccentColor; name: string; hex: string }[] = [
  { color: '#00E5FF', name: 'Lunar Cyan', hex: '#00E5FF' },
  { color: '#38BDF8', name: 'Earth Blue', hex: '#38BDF8' },
  { color: '#10B981', name: 'Aurora Teal', hex: '#10B981' },
  { color: '#F59E0B', name: 'Solar Amber', hex: '#F59E0B' },
  { color: '#A855F7', name: 'Cosmic Violet', hex: '#A855F7' },
  { color: '#E2E8F0', name: 'Pearl Silver', hex: '#E2E8F0' }
];

export const THEME_PREVIEWS: Record<ThemeId, {
  name: string;
  subtitle: string;
  description: string;
  bgPreview: string;
  cardPreview: string;
  accentPreview: string;
  isLight: boolean;
}> = {
  'midnight-space': {
    name: 'Midnight Space',
    subtitle: 'Classic Deep Navy',
    description: 'Deep naval space void with crisp cyan telemetry and silver highlights.',
    bgPreview: '#050811',
    cardPreview: '#080d1b',
    accentPreview: '#00E5FF',
    isLight: false
  },
  'lunar-aurora': {
    name: 'Lunar Aurora',
    subtitle: 'Dark Teal & Ice Blue',
    description: 'Atmospheric polar twilight with turquoise accents and ice-blue telemetry.',
    bgPreview: '#031114',
    cardPreview: '#061d22',
    accentPreview: '#2dd4bf',
    isLight: false
  },
  'cosmic-violet': {
    name: 'Cosmic Violet',
    subtitle: 'Deep Purple & Lavender',
    description: 'Deep galactic indigo and lavender tones inspired by deep space nebulae.',
    bgPreview: '#0c0717',
    cardPreview: '#150d26',
    accentPreview: '#c084fc',
    isLight: false
  },
  'lunar-light': {
    name: 'Lunar Light',
    subtitle: 'Pearl White & Cool Grey',
    description: 'Daylight observatory palette of pristine pearl white, brushed silver, and cool slate.',
    bgPreview: '#f8fafc',
    cardPreview: '#ffffff',
    accentPreview: '#0284c7',
    isLight: true
  }
};

interface ThemeContextType {
  settings: ThemeSettings;
  updateSetting: <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => void;
  setTheme: (theme: ThemeId) => void;
  setAccentColor: (accent: AccentColor) => void;
  resetToDefaults: () => void;
  isPersonalisationStudioOpen: boolean;
  openPersonalisationStudio: () => void;
  closePersonalisationStudio: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'lunarx_personalisation_settings_v2';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ThemeSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return { ...DEFAULT_THEME_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        console.warn('Failed to load theme settings from localStorage', e);
      }
    }
    return DEFAULT_THEME_SETTINGS;
  });

  const [isPersonalisationStudioOpen, setIsPersonalisationStudioOpen] = useState<boolean>(false);

  // Sync to document element classes and CSS custom properties
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // Remove old theme classes
    root.classList.remove('theme-midnight-space', 'theme-lunar-aurora', 'theme-cosmic-violet', 'theme-lunar-light', 'dark', 'light');
    root.classList.add(`theme-${settings.theme}`);

    if (settings.theme === 'lunar-light') {
      root.classList.add('light');
    } else {
      root.classList.add('dark');
    }

    // Set dynamic custom CSS variables
    root.style.setProperty('--lunarx-accent', settings.accentColor);
    root.style.setProperty('--lunarx-font-scale', 
      settings.fontSize === 'small' ? '0.92' : settings.fontSize === 'large' ? '1.08' : '1.0'
    );

    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to persist theme settings', e);
    }
  }, [settings]);

  const updateSetting = <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const setTheme = (theme: ThemeId) => updateSetting('theme', theme);
  const setAccentColor = (accentColor: AccentColor) => updateSetting('accentColor', accentColor);

  const resetToDefaults = () => {
    setSettings(DEFAULT_THEME_SETTINGS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  return (
    <ThemeContext.Provider value={{
      settings,
      updateSetting,
      setTheme,
      setAccentColor,
      resetToDefaults,
      isPersonalisationStudioOpen,
      openPersonalisationStudio: () => setIsPersonalisationStudioOpen(true),
      closePersonalisationStudio: () => setIsPersonalisationStudioOpen(false)
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
