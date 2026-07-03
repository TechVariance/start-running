"""Camada 1 (RF-3.2) — splits, pace, GAP e agregados."""

from __future__ import annotations

import pytest

from conftest import make_series
from metrics_engine.metrics.layer1 import compute, enrich, minetti_cost


def test_agregados_de_treino_constante():
    # 30 min a 5:00/km = 6 km
    series = make_series(n=1800, speed_m_s=1000.0 / 300.0, hr=150.0, cadence=170.0)
    result = compute(series)
    assert result.distance_m == pytest.approx(5996.7, abs=5)
    assert result.elapsed_s == 1799.0
    assert result.moving_s == pytest.approx(1798.0, abs=1)
    assert result.avg_pace_s_per_km == pytest.approx(300.0, abs=1)
    assert result.avg_hr == 150.0
    assert result.max_hr == 150.0
    assert result.avg_cadence_spm == 170.0


def test_splits_por_km():
    series = make_series(n=1800, speed_m_s=1000.0 / 300.0)
    result = compute(series)
    # 5.996 km -> 5 splits completos + 1 parcial
    assert len(result.splits) == 6
    assert [s.km for s in result.splits] == [1, 2, 3, 4, 5, 6]
    for split in result.splits[:5]:
        assert split.pace_s_per_km == pytest.approx(300.0, abs=2)


def test_gap_em_subida_e_mais_rapido_que_o_pace():
    # 5% de subida constante a 5:00/km reais
    series = make_series(
        n=1200,
        speed_m_s=1000.0 / 300.0,
        altitude=100.0,
        altitude_slope_m_per_s=(1000.0 / 300.0) * 0.05,
    )
    result = compute(series)
    assert result.gap_avg_s_per_km is not None
    assert result.gap_avg_s_per_km < result.avg_pace_s_per_km - 20


def test_gap_no_plano_e_igual_ao_pace():
    series = make_series(n=600, altitude=10.0)
    result = compute(series)
    assert result.gap_avg_s_per_km == pytest.approx(result.avg_pace_s_per_km, abs=2)


def test_ganho_de_elevacao():
    series = make_series(n=600, altitude=100.0, altitude_slope_m_per_s=0.05)
    result = compute(series)
    assert result.elevation_gain_m == pytest.approx(0.05 * 599, abs=2)


def test_custo_de_minetti_plano_e_36():
    assert minetti_cost(0.0) == pytest.approx(3.6)
    assert minetti_cost(0.10) > minetti_cost(0.0)  # subir custa mais
    # A faixa é limitada — grades absurdos não explodem o polinômio
    assert minetti_cost(2.0) == minetti_cost(0.30)


def test_paradas_saem_do_tempo_em_movimento():
    series = make_series(n=600)
    # para completamente por 100 s no meio (distância congelada)
    frozen = series.df.loc[299, "distance_m"]
    series.df.loc[300:399, "distance_m"] = frozen
    series.df.loc[400:, "distance_m"] -= series.df.loc[400, "distance_m"] - frozen
    result = compute(series)
    assert result.moving_s == pytest.approx(599 - 100, abs=3)


def test_serie_sem_distancia_ainda_tem_fc():
    series = make_series(hr=142.0)
    series.df["distance_m"] = None
    result = compute(series)
    assert result.distance_m is None
    assert result.avg_pace_s_per_km is None
    assert result.avg_hr == 142.0


def test_enrich_e_idempotente():
    series = make_series(n=300)
    enrich(series)
    pace_first = series.df["pace_s_per_km"].copy()
    enrich(series)
    assert series.df["pace_s_per_km"].equals(pace_first)
