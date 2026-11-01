"""
Terrain Profile Router: /api/v1/terrain/profile
"""

from fastapi import APIRouter, Query
from backend.models.schemas import TerrainProfileResponse
from backend.services.lola_service import lola_service

router = APIRouter(prefix="/terrain", tags=["Terrain Analysis"])

@router.get("/profile", response_model=TerrainProfileResponse)
def get_terrain_transect_profile(
    lat_deg: float = Query(..., ge=-90.0, le=90.0, description="Center latitude in decimal degrees"),
    lng_deg: float = Query(..., ge=-180.0, le=180.0, description="Center longitude in decimal degrees"),
    transect_length_km: float = Query(20.0, ge=1.0, le=100.0, description="Length of transect in km"),
    sampling_step_m: float = Query(500.0, ge=50.0, le=2000.0, description="Step resolution in meters"),
    azimuth_deg: float = Query(0.0, ge=0.0, le=360.0, description="Bearing angle (0=North)")
):
    """
    Extracts high-resolution topographic transect elevation profile using NASA LRO LOLA data.
    """
    data, metadata = lola_service.generate_transect_profile(
        lat_deg=lat_deg,
        lng_deg=lng_deg,
        transect_length_km=transect_length_km,
        sampling_step_m=sampling_step_m,
        azimuth_deg=azimuth_deg
    )

    return TerrainProfileResponse(
        center_lat_deg=data["center_lat_deg"],
        center_lng_deg=data["center_lng_deg"],
        elevation_datum_m=data["elevation_datum_m"],
        mean_slope_deg=data["mean_slope_deg"],
        max_slope_deg=data["max_slope_deg"],
        roughness_hurst_index=data["roughness_hurst_index"],
        points=data["points"],
        metadata=metadata
    )
