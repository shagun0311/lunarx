/**
 * LUNARX Type Definitions
 * Mission Planning & Lunar Landing Site Evaluation Data Types
 */

export type SiteCategory = 
  | 'Artemis Candidate' 
  | 'Apollo Historic' 
  | 'Mare Basin' 
  | 'South Pole-Aitken' 
  | 'Volatile / PSR Target'
  | 'Geological Anomaly';

export interface LunarCoordinates {
  lat: number; // -90 (South Pole) to +90 (North Pole)
  lng: number; // -180 to +180 (East positive, West negative)
}

export interface LunarSite {
  id: string;
  name: string;
  code: string;
  category: SiteCategory;
  coordinates: LunarCoordinates;
  elevationM: number; // Relative to mean lunar radius (1737.4 km)
  meanSlopeDeg: number;
  maxSlopeDeg: number;
  roughnessIndex: number; // 0 (smooth mare) to 1.0 (rugged crater rim)
  annualIlluminationPct: number; // Percent of year receiving sunlight
  maxContinuousDarknessHours: number; // Longest night period
  earthVisibilityPct: number; // Percent of libration cycle Earth is in direct LOS
  meanEarthElevationDeg: number; // Angle above local horizon
  psrProximityKm: number; // Distance to nearest Permanently Shadowed Region
  waterIceProbability: 'High' | 'Moderate' | 'Low' | 'Negligible';
  scientificValueRating: number; // 1 - 100
  trafficabilityScore: number; // 1 - 100 (rover mobility)
  landingSafetyScore: number; // 1 - 100
  description: string;
  geologicalContext: string;
  missionSignificance: string;
  recommendedMissionType: 'Crewed Artemis Base' | 'Robotic Prospector' | 'Long-duration Rover' | 'Geologic Sample Return';
}

export interface SiteEvaluationMetrics {
  solarElevationDeg: number;
  sunlightDurationHours: number;
  timeUntilSunsetHours: number;
  timeUntilSunriseHours: number;
  earthElevationDeg: number;
  earthVisibility: 'Direct Line of Sight' | 'Near Horizon Grazing' | 'Occulted (Shadow)';
  terrainSlopeDeg: number;
  terrainRoughness: number;
  surfaceTemperatureK: number;
  solarFluxWm2: number;
  powerOutputKw: number; // Simulated 100m² solar array
  dteLatencySec: number; // Direct-to-Earth one-way latency (~1.28s)
  commSignalStrengthDbm: number; // Simulated link budget
}

export interface MissionTimeState {
  epochIso: string;
  simulationHours: number; // 0 to 708.7 (Synodic lunar month)
  lunarDayProgressPct: number; // 0 - 100%
  metString: string; // Mission Elapsed Time
  subSolarCoordinates: LunarCoordinates;
  subEarthCoordinates: LunarCoordinates; // Moon-centered sub-Earth point with libration
  librationLatDeg: number;
  librationLngDeg: number;
}

export interface TopographicTransectPoint {
  distanceKm: number;
  elevationM: number;
  slopeDeg: number;
  isHazard: boolean;
}

export interface SolarCyclePoint {
  hour: number;
  day: number;
  solarElevationDeg: number;
  solarFluxWm2: number;
  isSunlit: boolean;
}

export interface EarthVisibilityPoint {
  day: number;
  earthElevationDeg: number;
  azimuthDeg: number;
  inDirectLos: boolean;
  dsnStation: 'Goldstone' | 'Madrid' | 'Canberra';
}

export type CalculationStatus = 
  | 'VALIDATED_NASA_HORIZONS'
  | 'VALIDATED_SPICE_KERNEL'
  | 'VERIFIED_LOLA_PDS'
  | 'ANALYTICAL_CELESTIAL_FALLBACK'
  | 'SIMULATED_APPROXIMATION';

export interface DataSourceMetadata {
  source_name: string;
  calculation_status: CalculationStatus;
  is_flight_validated: boolean;
  reference_frame: string;
  citation: string;
  calculation_timestamp_utc: string;
}

export interface BackendStatus {
  connected: boolean;
  url: string;
  latencyMs: number | null;
  mode: 'standalone-client' | 'fastapi-backend';
  version?: string;
  ephemerisEngine: string;
  metadata?: DataSourceMetadata;
}

