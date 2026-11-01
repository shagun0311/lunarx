"""
Ephemeris Router: /api/v1/ephemeris
"""

from fastapi import APIRouter, Query
from backend.models.schemas import EphemerisResponse
from backend.services.ephemeris_engine import ephemeris_engine

router = APIRouter(prefix="", tags=["Ephemeris"])

@router.get("/ephemeris", response_model=EphemerisResponse)
def get_lunar_ephemeris(
    epoch_iso: str = Query(..., description="Target epoch in ISO 8601 UTC (e.g. '2026-11-01T12:00:00Z')"),
    coordinate_frame: str = Query("MOON_ME", description="Planetary coordinate frame: MOON_ME or MOON_PA")
):
    """
    Computes sub-solar coordinates, sub-Earth libration, and celestial distances.
    """
    data, metadata = ephemeris_engine.get_ephemeris(epoch_iso)
    
    return EphemerisResponse(
        epoch_iso=epoch_iso,
        sub_solar_lat_deg=data["sub_solar_lat_deg"],
        sub_solar_lng_deg=data["sub_solar_lng_deg"],
        sub_earth_lat_deg=data["sub_earth_lat_deg"],
        sub_earth_lng_deg=data["sub_earth_lng_deg"],
        sun_distance_au=data["sun_distance_au"],
        earth_distance_km=data["earth_distance_km"],
        solar_constant_flux_wm2=data.get("solar_constant_flux_wm2", 1361.0),
        metadata=metadata
    )
