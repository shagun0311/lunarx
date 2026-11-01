# LUNARX Scientific Backend Architecture

Scientific ephemeris, topography, and communications backend for the **LUNARX** lunar landing site evaluation platform.

---

## 1. Modular Directory Structure

```
/backend
├── config.py                 # Configuration, NASA API endpoints, CORS settings
├── main.py                   # FastAPI application entrypoint with Swagger & ReDoc
├── requirements.txt          # Python package requirements (FastAPI, Skyfield, Astropy, etc.)
├── server.py                 # Zero-dependency Python 3 standard library server (port 8000)
├── models/
│   ├── __init__.py
│   └── schemas.py            # Pydantic models with explicit DataSourceMetadata
├── services/
│   ├── __init__.py
│   ├── horizons_service.py   # NASA JPL Horizons System API integration client
│   ├── spice_service.py      # NASA NAIF SPICE toolkit bridge (de440/pck00010 kernels)
│   ├── lola_service.py       # NASA LRO LOLA PDS topography processing module
│   └── ephemeris_engine.py   # Unified coordinator for solar, libration & look-angles
└── routers/
    ├── __init__.py
    ├── health.py             # GET /api/v1/health
    ├── ephemeris.py          # GET /api/v1/ephemeris
    ├── solar.py              # GET /api/v1/solar/illumination
    ├── terrain.py            # GET /api/v1/terrain/profile
    └── comms.py              # GET /api/v1/comms/visibility
```

---

## 2. API Endpoints Specification

### 1. Health & Diagnostics: `GET /api/v1/health`
Checks backend engine status, NASA JPL Horizons connectivity, and active SPICE kernels.

### 2. Celestial Ephemeris: `GET /api/v1/ephemeris`
- **Parameters**: `epoch_iso` (ISO 8601 UTC timestamp), `coordinate_frame` (`MOON_ME` or `MOON_PA`).
- **Returns**: Sub-solar coordinates, sub-Earth libration angles in latitude and longitude, Earth/Sun distances, and total solar flux irradiance ($W/m^2$).

### 3. Solar Illumination: `GET /api/v1/solar/illumination`
- **Parameters**: `lat_deg`, `lng_deg`, `epoch_iso`, `elevation_datum_m`.
- **Returns**: Local solar elevation angle ($h$), azimuth ($\theta$), effective incident flux, and Permanently Shadowed Region (PSR) cold-trap determination.

### 4. Terrain Topography: `GET /api/v1/terrain/profile`
- **Parameters**: `lat_deg`, `lng_deg`, `transect_length_km`, `sampling_step_m`, `azimuth_deg`.
- **Returns**: LRO LOLA elevation cross-section, regional mean and max slopes, Hurst roughness index, and lander touchdown tip-over hazard flags.

### 5. Earth Communications: `GET /api/v1/comms/visibility`
- **Parameters**: `lat_deg`, `lng_deg`, `epoch_iso`, `min_elevation_mask_deg`.
- **Returns**: Earth center look-angle elevation, Line-of-Sight status (*Direct LOS*, *Near Horizon Grazing*, or *Occulted*), one-way light delay, and Deep Space Network (DSN) ground stations tracking visibility (Goldstone, Madrid, Canberra).

---

## 3. Scientific Provenance & Calculation Tiers

Every API response embeds a `metadata` payload declaring its exact validation tier:
- `VALIDATED_NASA_HORIZONS`: Direct live ephemeris from NASA JPL Horizons On-Line API.
- `VALIDATED_SPICE_KERNEL`: Calculated via native NASA NAIF SPICE kernels (DE440).
- `VERIFIED_LOLA_PDS`: Sampled from published NASA LRO LOLA Gridded Data Records (PDS Geosciences).
- `ANALYTICAL_CELESTIAL_FALLBACK`: Verified analytical Keplerian models (DE440 reference parameters).
- `SIMULATED_APPROXIMATION`: Synthesized reference statistical models (for uncataloged coordinates).

---

## 4. Running the Backend

### Option A: Standard FastAPI / Uvicorn (Recommended)
```bash
pip install -r backend/requirements.txt
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive OpenAPI documentation will be accessible at: `http://localhost:8000/docs`

### Option B: Standalone Zero-Dependency Python Runner
```bash
python3 backend/server.py
```
Serves all 5 `/api/v1/*` endpoints directly on port 8000 using only Python's standard library.
