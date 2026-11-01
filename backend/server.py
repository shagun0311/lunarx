"""
LUNARX Zero-Dependency Standalone Python Server
Uses only Python 3 standard library (no pip dependencies required).
Implements the full /api/v1 contract so scientists and developers can immediately
launch and test the backend with: `python3 backend/server.py`
"""

import sys
import os
import json
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime, timezone

# Add parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.services.ephemeris_engine import ephemeris_engine
from backend.services.lola_service import lola_service
from backend.services.horizons_service import horizons_service
from backend.services.spice_service import spice_service
from backend.models.schemas import CalculationStatus, DataSourceMetadata

PORT = 8000

class LunarXApiHandler(BaseHTTPRequestHandler):
    def _set_cors_headers(self, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_cors_headers(200)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        def get_q(param, default=None):
            return query.get(param, [default])[0]

        now_utc = datetime.now(timezone.utc).isoformat()

        try:
            # 1. /api/v1/health
            if path in ["/api/v1/health", "/health"]:
                spice_ok = spice_service.is_operational()
                horizons_ok = horizons_service.is_service_reachable()
                engine_name = "NASA JPL Horizons Web Service" if horizons_ok else "LUNARX Analytical Celestial Engine"
                
                resp = {
                    "status": "online",
                    "version": "1.0.0",
                    "spice_available": spice_ok,
                    "horizons_reachable": horizons_ok,
                    "active_engine": engine_name,
                    "metadata": {
                        "source_name": engine_name,
                        "calculation_status": CalculationStatus.VALIDATED_NASA_HORIZONS.value if horizons_ok else CalculationStatus.ANALYTICAL_CELESTIAL_FALLBACK.value,
                        "is_flight_validated": horizons_ok,
                        "reference_frame": "MOON_ME",
                        "citation": "LUNARX Scientific Backend Infrastructure",
                        "calculation_timestamp_utc": now_utc
                    }
                }
                self._set_cors_headers(200)
                self.wfile.write(json.dumps(resp).encode("utf-8"))
                return

            # 2. /api/v1/ephemeris
            elif path == "/api/v1/ephemeris":
                epoch_iso = get_q("epoch_iso", now_utc)
                data, meta = ephemeris_engine.get_ephemeris(epoch_iso)
                resp = {
                    "epoch_iso": epoch_iso,
                    **data,
                    "metadata": meta.model_dump()
                }
                self._set_cors_headers(200)
                self.wfile.write(json.dumps(resp).encode("utf-8"))
                return

            # 3. /api/v1/solar/illumination
            elif path == "/api/v1/solar/illumination":
                lat = float(get_q("lat_deg", "0.0"))
                lng = float(get_q("lng_deg", "0.0"))
                epoch_iso = get_q("epoch_iso", now_utc)
                elev = float(get_q("elevation_datum_m", "0.0"))
                
                data, meta = ephemeris_engine.calculate_solar_illumination(lat, lng, epoch_iso, elev)
                resp = {
                    **data,
                    "metadata": meta.model_dump()
                }
                self._set_cors_headers(200)
                self.wfile.write(json.dumps(resp).encode("utf-8"))
                return

            # 4. /api/v1/terrain/profile
            elif path == "/api/v1/terrain/profile":
                lat = float(get_q("lat_deg", "-89.9"))
                lng = float(get_q("lng_deg", "0.0"))
                length_km = float(get_q("transect_length_km", "20.0"))
                step_m = float(get_q("sampling_step_m", "500.0"))
                azimuth = float(get_q("azimuth_deg", "0.0"))

                data, meta = lola_service.generate_transect_profile(lat, lng, length_km, step_m, azimuth)
                resp = {
                    **data,
                    "points": [p.model_dump() for p in data["points"]],
                    "metadata": meta.model_dump()
                }
                self._set_cors_headers(200)
                self.wfile.write(json.dumps(resp).encode("utf-8"))
                return

            # 5. /api/v1/comms/visibility
            elif path == "/api/v1/comms/visibility":
                lat = float(get_q("lat_deg", "-89.9"))
                lng = float(get_q("lng_deg", "0.0"))
                epoch_iso = get_q("epoch_iso", now_utc)
                mask = float(get_q("min_elevation_mask_deg", "2.0"))

                data, meta = ephemeris_engine.calculate_comms_visibility(lat, lng, epoch_iso, mask)
                resp = {
                    **data,
                    "dsn_stations": [s.model_dump() for s in data["dsn_stations"]],
                    "metadata": meta.model_dump()
                }
                self._set_cors_headers(200)
                self.wfile.write(json.dumps(resp).encode("utf-8"))
                return

            # Root info
            elif path == "/":
                resp = {
                    "service": "LUNARX Scientific Backend",
                    "status": "operational",
                    "endpoints": [
                        "/api/v1/health",
                        "/api/v1/ephemeris",
                        "/api/v1/solar/illumination",
                        "/api/v1/terrain/profile",
                        "/api/v1/comms/visibility"
                    ]
                }
                self._set_cors_headers(200)
                self.wfile.write(json.dumps(resp).encode("utf-8"))
                return

            else:
                self._set_cors_headers(404)
                self.wfile.write(json.dumps({"error": f"Endpoint not found: {path}"}).encode("utf-8"))

        except Exception as e:
            self._set_cors_headers(500)
            self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))

    def log_message(self, format, *args):
        # Clean server logging
        sys.stderr.write(f"[LUNARX-API] {self.address_string()} - {format % args}\n")

def run():
    server_address = ("0.0.0.0", PORT)
    httpd = HTTPServer(server_address, LunarXApiHandler)
    print(f"🚀 LUNARX Scientific Backend serving on http://0.0.0.0:{PORT}")
    print(f"Endpoints available: /api/v1/health, /api/v1/ephemeris, /api/v1/solar/illumination, /api/v1/terrain/profile, /api/v1/comms/visibility")
    httpd.serve_forever()

if __name__ == "__main__":
    run()
