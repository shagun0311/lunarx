"""
Solar Illumination Router: /api/v1/solar/illumination
"""

from fastapi import APIRouter, Query
from backend.models.schemas import SolarIlluminationResponse
from backend.services.ephemeris_engine import ephemeris_engine

router = APIRouter(prefix="/solar", tags=["Solar Intelligence"])

@router.get("/illumination", response_model=SolarIlluminationResponse)
def get_solar_illumination(
    lat_deg: float = Query(..., ge=-90.0, le=90.0, description="Lunar latitude in decimal degrees"),
    lng_deg: float = Query(..., ge=-180.0, le=180.0, description="Lunar longitude in decimal degrees"),
    epoch_iso: str = Query(..., description="Target epoch in ISO 8601 UTC"),
    elevation_datum_m: float = Query(0.0, description="Surface elevation relative to 1737.4 km sphere")
):
    """
    Computes solar elevation angle, azimuth, incident flux, and cold-trap PSR probability.
    """
    data, metadata = ephemeris_engine.calculate_solar_illumination(
        lat_deg=lat_deg,
        lng_deg=lng_deg,
        epoch_iso=epoch_iso,
        elevation_datum_m=elevation_datum_m
    )
    
    return SolarIlluminationResponse(
        lat_deg=data["lat_deg"],
        lng_deg=data["lng_deg"],
        epoch_iso=data["epoch_iso"],
        solar_elevation_deg=data["solar_elevation_deg"],
        solar_azimuth_deg=data["solar_azimuth_deg"],
        is_illuminated=data["is_illuminated"],
        incident_solar_flux_wm2=data["incident_solar_flux_wm2"],
        is_potential_psr=data["is_potential_psr"],
        metadata=metadata
    )
