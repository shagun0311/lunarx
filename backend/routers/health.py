"""
Health Check Router: /api/v1/health
"""

from datetime import datetime, timezone
from fastapi import APIRouter
from backend.models.schemas import HealthResponse, DataSourceMetadata, CalculationStatus
from backend.services.horizons_service import horizons_service
from backend.services.spice_service import spice_service
from backend.config import settings

router = APIRouter(prefix="", tags=["Health"])

@router.get("/health", response_model=HealthResponse)
def get_health_status():
    """
    Returns API health status, active ephemeris engine, and connectivity diagnostics.
    """
    spice_ok = spice_service.is_operational()
    horizons_ok = horizons_service.is_service_reachable()
    
    if spice_ok:
        engine_name = "NASA NAIF SPICE Toolkit (DE440)"
        status = CalculationStatus.VALIDATED_SPICE_KERNEL
    elif horizons_ok:
        engine_name = "NASA JPL Horizons Web Service"
        status = CalculationStatus.VALIDATED_NASA_HORIZONS
    else:
        engine_name = "LUNARX Analytical Celestial Engine (DE440 Standalone)"
        status = CalculationStatus.ANALYTICAL_CELESTIAL_FALLBACK

    metadata = DataSourceMetadata(
        source_name=engine_name,
        calculation_status=status,
        is_flight_validated=spice_ok or horizons_ok,
        reference_frame="MOON_ME",
        citation="LUNARX Scientific Backend Infrastructure",
        calculation_timestamp_utc=datetime.now(timezone.utc).isoformat()
    )

    return HealthResponse(
        status="online",
        version=settings.VERSION,
        spice_available=spice_ok,
        horizons_reachable=horizons_ok,
        active_engine=engine_name,
        metadata=metadata
    )
