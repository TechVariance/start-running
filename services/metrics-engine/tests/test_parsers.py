"""Parsers: detecção de formato, série canônica e riqueza (RF-2.4)."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest

from conftest import START, gpx_bytes, tcx_bytes
from metrics_engine.parsers import detect_format, parse
from metrics_engine.parsers.fit import records_to_series


def _fit_header_bytes() -> bytes:
    # Header FIT de 14 bytes: tamanho, versão, ".FIT" nos bytes 8-12.
    return bytes([14, 0x10, 0x54, 0x08, 0, 0, 0, 0]) + b".FIT" + b"\x00\x00"


class TestDetectFormat:
    def test_fit_pela_assinatura_do_header(self):
        assert detect_format(_fit_header_bytes()) == "fit"

    def test_tcx_e_gpx_pelo_xml(self):
        assert detect_format(tcx_bytes()) == "tcx"
        assert detect_format(gpx_bytes([(0.0, 0.0, None, None)])) == "gpx"

    def test_desconhecido_levanta_erro(self):
        with pytest.raises(ValueError):
            detect_format(b"not a workout file")


class TestFitRecords:
    def test_converte_records_em_serie_canonica(self):
        semicircle = 2**31 / 180.0
        records = [
            {
                "timestamp": START + timedelta(seconds=i),
                "position_lat": -23.55 * semicircle,
                "position_long": -46.63 * semicircle,
                "distance": 3.2 * i,
                "heart_rate": 140 + i,
                "cadence": 172,
                "enhanced_altitude": 760.0,
            }
            for i in range(10)
        ]
        series = records_to_series(records, hr_sensor="chest_strap")
        assert series.raw_format == "fit"
        assert series.richness_rank == 3
        assert len(series.df) == 10
        assert series.df["lat"].iloc[0] == pytest.approx(-23.55, abs=1e-6)
        assert series.df["distance_m"].iloc[-1] == pytest.approx(28.8)
        assert series.df["hr"].iloc[-1] == 149
        assert series.started_at == START

    def test_sem_records_levanta_erro(self):
        with pytest.raises(ValueError):
            records_to_series([])

    def test_timestamp_ingenuo_vira_utc(self):
        records = [{"timestamp": datetime(2026, 7, 1, 7, 0), "heart_rate": 120}]
        series = records_to_series(records)
        assert series.started_at.tzinfo == timezone.utc


class TestTcx:
    def test_parse_com_distancia_e_fc(self):
        series = parse(tcx_bytes(n=30, speed_m_s=3.0, hr=150))
        assert series.raw_format == "tcx"
        assert series.richness_rank == 2
        assert series.device == "Forerunner 265"
        assert series.hr_sensor == "optical"
        assert series.df["distance_m"].iloc[-1] == pytest.approx(435.0)
        assert series.df["hr"].notna().all()


class TestGpx:
    def test_distancia_derivada_por_haversine(self):
        # 5 pontos andando para o norte ~11.1 m por passo de 0.0001 grau.
        points = [(0.0001 * i, 0.0, 10.0, 140) for i in range(5)]
        series = parse(gpx_bytes(points))
        assert series.raw_format == "gpx"
        assert series.richness_rank == 1
        total = series.df["distance_m"].iloc[-1]
        assert total == pytest.approx(4 * 11.1, rel=0.02)
        assert series.hr_sensor == "optical"

    def test_sem_fc_sensor_none(self):
        points = [(0.0001 * i, 0.0, None, None) for i in range(3)]
        series = parse(gpx_bytes(points))
        assert series.hr_sensor == "none"
        assert not series.has_channel("hr")
