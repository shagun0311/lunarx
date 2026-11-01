"""
LUNARX Scientific Backend Unit Tests
Validates ephemeris calculations, LOLA elevation transects, and provenance metadata.
"""

import unittest
from datetime import datetime, timezone

from backend.services.ephemeris_engine import ephemeris_engine
from backend.services.lola_service import lola_service
from backend.services.horizons_service import horizons_service
from backend.models.schemas import CalculationStatus

class TestLunarXScientificBackend(unittest.TestCase):
    def setUp(self):
        self.test_epoch = "2026-11-01T12:00:00Z"
        self.shackleton_lat = -89.9
        self.shackleton_lng = 0.0

    def test_ephemeris_calculation(self):
        data, meta = ephemeris_engine.get_ephemeris(self.test_epoch)
        self.assertIn("sub_solar_lat_deg", data)
        self.assertIn("sub_solar_lng_deg", data)
        self.assertIn("sub_earth_lat_deg", data)
        self.assertIn("sub_earth_lng_deg", data)
        self.assertIsNotNone(meta.calculation_status)
        self.assertTrue(len(meta.citation) > 0)

    def test_solar_illumination(self):
        data, meta = ephemeris_engine.calculate_solar_illumination(
            lat_deg=self.shackleton_lat,
            lng_deg=self.shackleton_lng,
            epoch_iso=self.test_epoch,
            elevation_datum_m=1150.0
        )
        self.assertIn("solar_elevation_deg", data)
        self.assertIn("incident_solar_flux_wm2", data)
        self.assertIsInstance(data["is_illuminated"], bool)
        self.assertIsInstance(data["is_potential_psr"], bool)

    def test_lola_terrain_profile(self):
        data, meta = lola_service.generate_transect_profile(
            lat_deg=self.shackleton_lat,
            lng_deg=self.shackleton_lng,
            transect_length_km=20.0,
            sampling_step_m=500.0
        )
        self.assertEqual(meta.calculation_status, CalculationStatus.VERIFIED_LOLA_PDS)
        self.assertTrue(meta.is_flight_validated)
        self.assertEqual(len(data["points"]), 41)
        self.assertGreater(data["max_slope_deg"], 0)

    def test_comms_visibility(self):
        data, meta = ephemeris_engine.calculate_comms_visibility(
            lat_deg=self.shackleton_lat,
            lng_deg=self.shackleton_lng,
            epoch_iso=self.test_epoch
        )
        self.assertIn(data["visibility_status"], ["Direct Line of Sight", "Near Horizon Grazing", "Occulted"])
        self.assertGreater(data["one_way_light_time_sec"], 1.0)
        self.assertEqual(len(data["dsn_stations"]), 3)

if __name__ == "__main__":
    unittest.main()
