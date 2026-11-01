"""
LUNARX Scientific Backend Application Entrypoint
FastAPI web service integrating NASA Horizons, SPICE, and LOLA datasets.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.routers import health, ephemeris, solar, terrain, comms

app = FastAPI(
    title="LUNARX Scientific Ephemeris & Topography Backend",
    description="Scientific API providing lunar ephemerides, solar illumination angles, LOLA topography, and Earth communications line-of-sight.",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration for cross-origin frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers under /api/v1
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(ephemeris.router, prefix=settings.API_V1_STR)
app.include_router(solar.router, prefix=settings.API_V1_STR)
app.include_router(terrain.router, prefix=settings.API_V1_STR)
app.include_router(comms.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "service": "LUNARX Scientific Backend",
        "version": settings.VERSION,
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
