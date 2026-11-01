"""
LUNARX API Pydantic Schemas
Defines request and response structures with explicit scientific provenance metadata.
"""

from enum import Enum
from typing import List, Optional, Dict, Any

try:
    from pydantic import BaseModel, Field
    HAS_PYDANTIC = True
except ImportError:
    HAS_PYDANTIC = False
    # Lightweight fallback for bare Python 3 environments before pip install
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
        def model_dump(self) -> Dict[str, Any]:
            res = {}
            for k, v in self.__dict__.items():
                if hasattr(v, "model_dump"):
                    res[k] = v.model_dump()
                elif isinstance(v, list):
                    res[k] = [item.model_dump() if hasattr(item, "model_dump") else item for item in v]
                else:
                    res[k] = v
            return res
        def dict(self):
            return self.model_dump()

    def Field(default=..., **kwargs):
        return default

class CalculationStatus(str, Enum):
    VALIDATED_NASA_HORIZONS = "VALIDATED_NASA_HORIZONS"
    VALIDATED_SPICE_KERNEL = "VALIDATED_SPICE_KERNEL"
    VERIFIED_LOLA_PDS = "VERIFIED_LOLA_PDS"
    ANALYTICAL_CELESTIAL_FALLBACK = "ANALYTICAL_CELESTIAL_FALLBACK"
    SIMULATED_APPROXIMATION = "SIMULATED_APPROXIMATION"

class DataSourceMetadata(BaseModel):
    source_name: str = Field(..., description="Name of the scientific dataset or algorithm provider")
    calculation_status: CalculationStatus = Field(..., description="Verification tier of the calculation")
    is_flight_validated: bool = Field(False, description="Whether data has been cross-checked with certified NASA ephemerides")
    reference_frame: str = Field("MOON_ME", description="Planetary coordinate reference frame (e.g. MOON_ME or MOON_PA)")
    citation: str = Field(..., description="Formal scientific citation (e.g., JPL Horizons, LRO LOLA PDS, or DE440)")
    calculation_timestamp_utc: str = Field(..., description="ISO 8601 UTC timestamp of calculation")

# Health
class HealthResponse(BaseModel):
    status: str = Field("online", description="API service status")
    version: str = Field(..., description="Backend release version")
    spice_available: bool = Field(..., description="Whether SPICE binary toolkit is active")
    horizons_reachable: bool = Field(..., description="Whether NASA JPL Horizons API is reachable")
    active_engine: str = Field(..., description="Active celestial ephemeris engine")
    metadata: DataSourceMetadata

# Ephemeris
class EphemerisRequest(BaseModel):
    epoch_iso: str = Field(..., description="Target epoch in ISO 8601 UTC (e.g., '2026-11-01T12:00:00Z')")
    coordinate_frame: str = Field("MOON_ME", description="Mean Earth/Polar Axis (MOON_ME) or Principal Axis (MOON_PA)")

class EphemerisResponse(BaseModel):
    epoch_iso: str
    sub_solar_lat_deg: float = Field(..., description="Sub-solar point latitude on lunar ellipsoid in degrees")
    sub_solar_lng_deg: float = Field(..., description="Sub-solar point longitude on lunar ellipsoid in degrees")
    sub_earth_lat_deg: float = Field(..., description="Sub-earth point latitude (optical + physical libration in lat)")
    sub_earth_lng_deg: float = Field(..., description="Sub-earth point longitude (optical + physical libration in lng)")
    sun_distance_au: float = Field(..., description="Sun-Moon barycentric distance in Astronomical Units")
    earth_distance_km: float = Field(..., description="Earth-Moon center-to-center distance in kilometers")
    solar_constant_flux_wm2: float = Field(1361.0, description="Total solar irradiance at current lunar distance")
    metadata: DataSourceMetadata

# Solar Illumination
class SolarIlluminationRequest(BaseModel):
    lat_deg: float = Field(..., ge=-90.0, le=90.0, description="Lunar surface latitude (-90 to +90)")
    lng_deg: float = Field(..., ge=-180.0, le=180.0, description="Lunar surface longitude (-180 to +180)")
    epoch_iso: str = Field(..., description="Target epoch in ISO 8601 UTC")
    elevation_datum_m: Optional[float] = Field(0.0, description="Local surface height relative to 1737.4 km sphere")

class SolarIlluminationResponse(BaseModel):
    lat_deg: float
    lng_deg: float
    epoch_iso: str
    solar_elevation_deg: float = Field(..., description="Solar elevation angle above local horizontal plane")
    solar_azimuth_deg: float = Field(..., description="Solar azimuth angle (0=North, 90=East, 180=South, 270=West)")
    is_illuminated: bool = Field(..., description="Whether the sun center is above the local geometric horizon")
    incident_solar_flux_wm2: float = Field(..., description="Effective solar irradiance accounting for grazing angle")
    is_potential_psr: bool = Field(..., description="Flagged if site is in a high-latitude Permanently Shadowed Region")
    metadata: DataSourceMetadata

# Terrain Profile
class TerrainProfileRequest(BaseModel):
    lat_deg: float = Field(..., ge=-90.0, le=90.0)
    lng_deg: float = Field(..., ge=-180.0, le=180.0)
    transect_length_km: float = Field(20.0, ge=1.0, le=100.0, description="Length of radial transect in kilometers")
    sampling_step_m: float = Field(500.0, ge=50.0, le=2000.0, description="Resolution step along transect")
    azimuth_deg: float = Field(0.0, ge=0.0, le=360.0, description="Bearing angle for cross section (0=North)")

class TransectPoint(BaseModel):
    distance_km: float
    lat_deg: float
    lng_deg: float
    elevation_m: float
    slope_deg: float
    is_hazard: bool

class TerrainProfileResponse(BaseModel):
    center_lat_deg: float
    center_lng_deg: float
    elevation_datum_m: float
    mean_slope_deg: float
    max_slope_deg: float
    roughness_hurst_index: float
    points: List[TransectPoint]
    metadata: DataSourceMetadata

# Comms Visibility
class CommsVisibilityRequest(BaseModel):
    lat_deg: float = Field(..., ge=-90.0, le=90.0)
    lng_deg: float = Field(..., ge=-180.0, le=180.0)
    epoch_iso: str = Field(..., description="Target epoch in ISO 8601 UTC")
    min_elevation_mask_deg: float = Field(2.0, description="Minimum ground antenna elevation cutoff mask")

class DSNStationStatus(BaseModel):
    station_name: str
    location: str
    elevation_deg: float
    in_view: bool

class CommsVisibilityResponse(BaseModel):
    lat_deg: float
    lng_deg: float
    epoch_iso: str
    earth_elevation_deg: float = Field(..., description="Earth center elevation above lunar horizontal plane")
    earth_azimuth_deg: float = Field(..., description="Azimuth angle towards Earth center")
    visibility_status: str = Field(..., description="'Direct Line of Sight', 'Near Horizon Grazing', or 'Occulted'")
    one_way_light_time_sec: float = Field(..., description="Signal propagation delay based on true Euclidean distance")
    dsn_stations: List[DSNStationStatus]
    metadata: DataSourceMetadata
