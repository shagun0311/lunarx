"""
LUNARX Scientific Backend Configuration
Defines endpoints, NASA Horizons parameters, SPICE kernel directories, and calculation flags.
"""

import os
from typing import List

class Settings:
    PROJECT_NAME: str = "LUNARX Scientific Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # NASA JPL Horizons System API
    # https://ssd-api.jpl.nasa.gov/doc/horizons.html
    HORIZONS_API_BASE_URL: str = os.getenv(
        "NASA_HORIZONS_API_URL", 
        "https://ssd.jpl.nasa.gov/api/horizons.api"
    )
    
    # Target and Observer Ephemeris Identifiers
    MOON_BODY_ID: str = "301"       # Moon Center
    EARTH_BODY_ID: str = "399"      # Earth Center
    SUN_BODY_ID: str = "10"         # Sun Center
    
    # SPICE Kernels Path (if local .bsp, .tpc, .tls kernels are mounted)
    SPICE_KERNELS_DIR: str = os.getenv("SPICE_KERNELS_DIR", "./data/spice_kernels")
    ENABLE_SPICE_IF_AVAILABLE: bool = os.getenv("ENABLE_SPICE", "true").lower() == "true"
    
    # LOLA PDS Gridded Elevation Data Path
    LOLA_DATA_DIR: str = os.getenv("LOLA_DATA_DIR", "./data/lola")
    
    # CORS Configuration
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*"
    ]
    
    # Cache Timeout in seconds
    EPHEMERIS_CACHE_TTL: int = 300

settings = Settings()
