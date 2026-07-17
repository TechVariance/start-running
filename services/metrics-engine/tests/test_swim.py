"""Natação (Módulo 19): CSS, SWOLF, agregados e sTSS na moeda comum."""

from __future__ import annotations

import pytest

from metrics_engine.metrics.swim import SwimLength, css_from_test, stss, summarize
from metrics_engine.models import AthleteProfile
from metrics_engine.zones.engine import resolve_boundaries


def lengths(n: int = 40, duration_s: float = 45.0, strokes: int = 18):
    return [SwimLength(index=i, stroke="free", duration_s=duration_s, strokes=strokes) for i in range(n)]


class TestCss:
    def test_teste_400_200(self):
        # T400 6:40 (400s), T200 3:05 (185s): v = 200/215 => CSS 107.5 s/100m
        assert css_from_test(400.0, 185.0) == pytest.approx(107.5)

    def test_teste_invalido(self):
        with pytest.raises(ValueError):
            css_from_test(180.0, 185.0)


class TestSummarize:
    def test_agregados_piscina_25m(self):
        # 40 piscinas de 25 m a 45 s / 18 braçadas: 1000 m, pace 1:52,5/100m
        summary = summarize(25.0, lengths())
        assert summary.distance_m == 1000.0
        assert summary.avg_pace_s_per_100m == pytest.approx(180.0)
        assert summary.avg_swolf == pytest.approx(63.0)  # 45 + 18
        assert summary.avg_strokes_per_length == 18.0
        assert summary.distance_per_stroke_m == pytest.approx(1000.0 / 720.0, abs=0.01)
        assert summary.time_by_stroke == {"free": 1800.0}

    def test_sessao_vazia(self):
        with pytest.raises(ValueError):
            summarize(25.0, [])


class TestStss:
    def test_uma_hora_no_css_vale_100(self):
        assert stss(3600.0, 105.0, 105.0) == pytest.approx(100.0)

    def test_mais_lento_que_css_vale_menos_quadraticamente(self):
        easy = stss(3600.0, 131.25, 105.0)  # 80% da velocidade CSS
        assert easy == pytest.approx(100.0 * 0.8**2, rel=0.01)

    def test_sem_css_nao_ha_carga_fantasma(self):
        assert stss(3600.0, 120.0, None) is None


class TestZonasPorCss:
    def test_ancora_pct_css_no_mesmo_motor(self):
        profile = AthleteProfile(athlete_id="a", css_s_per_100m=105.0)
        bounds = resolve_boundaries(5, "pct_css", profile)
        z4 = bounds[3]  # zona de limiar começa a 96% da velocidade CSS
        assert z4.lower == pytest.approx(105.0 / 0.96, abs=0.1)
        assert z4.upper == pytest.approx(105.0 / 1.03, abs=0.1)
        assert z4.lower > z4.upper  # pace: menor = mais rápido

    def test_sem_css_erro_claro(self):
        profile = AthleteProfile(athlete_id="a")
        with pytest.raises(ValueError, match="css_s_per_100m"):
            resolve_boundaries(5, "pct_css", profile)
