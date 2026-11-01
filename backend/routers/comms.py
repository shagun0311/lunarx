"""
Communications Visibility Router: /api/v1/comms/visibility
"""

from fastapi import APIRouter, Query
from backend.models.schemas import CommsVisibilityResponse
from backend.services.ephemeris_engine import ephemeris_engine

router = APIRouter(prefix="/comms", tags=["Earth Communications"])

@router.get("/visibility", response_model=CommsVisibilityResponse)
def get_earth_comms_visibility(
    lat_deg: float = Query(..., ge=-90.0, le=90.0, description="Lunar latitude in decimal degrees"),
    lng_deg: float = Query(..., ge=-180.0, le=180.0, description="Lunar longitude in decimal degrees"),
    epoch_iso: str = Query(..., description="Target epoch in ISO 8601 UTC"),
    min_elevation_mask_deg: float = Query(2.0, description="Local antenna elevation cutoff angle")
):
    """
    Computes Earth elevation angle, line-of-sight status, one-way light delay, and DSN ground station visibility.
    """
    data, metadata = ephemeris_engine.calculate_comms_visibility(
        lat_deg=lat_deg,
        lng_deg=lng_deg,
        epoch_iso=epoch_iso,
        min_elevation_mask_deg=min_elevation_mask_deg
    )

    return CommsVisibilityResponse(
        lat_deg=data["lat_deg"],
        lng_deg=data["lng_deg"],
        epoch_iso=data["epoch_iso"],
        earth_elevation_deg=data["earth_elevation_deg"],
        earth_azimuth_deg=data["earth_azimuth_deg"],
        visibility_status=data["visibility_status"],
        one_way_light_time_sec=data["one_way_light_time_sec"],
        dsn_stations=data["dsn_stations"],
        metadata=metadata
    )
