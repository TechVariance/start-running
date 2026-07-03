"""Pipeline ponta a ponta: bytes -> derivadas versionadas (doc 04)."""

from __future__ import annotations

import pytest

from conftest import tcx_bytes
from metrics_engine import METHODOLOGY_VERSION
from metrics_engine.pipeline import process_activity, process_manual_activity


def test_processa_tcx_de_ponta_a_ponta(profile):
    raw = tcx_bytes(n=720, speed_m_s=1000.0 / 300.0, hr=155)  # 1 h a 5:00/km
    result = process_activity(raw, profile, activity_id="act_1")

    assert result.methodology_version == METHODOLOGY_VERSION
    assert result.raw_sha256 is not None and len(result.raw_sha256) == 64
    assert result.layer1.distance_m == pytest.approx(11_983, abs=20)
    assert result.layer1.avg_hr == 155.0

    # carga: FC + LTHR presentes -> hrTSS é a melhor
    assert result.load.hrtss is not None
    assert result.load.best[0] == "hrtss"

    # zonas padrão resolvidas do perfil (LTHR conhecido -> pct_lthr)
    # 155/170 = 91% LTHR -> zona 3 do modelo 5
    assert result.time_in_zone[3] > 3000

    assert 0.0 < result.confidence <= 1.0
    assert not result.low_confidence


def test_idempotencia_mesma_entrada_mesma_saida(profile):
    """RNF-2.3: reprocessar nunca muda o resultado (fora o computed_at)."""
    raw = tcx_bytes(n=120)
    a = process_activity(raw, profile, activity_id="act_1")
    b = process_activity(raw, profile, activity_id="act_1")
    assert a.raw_sha256 == b.raw_sha256
    assert a.confidence == b.confidence
    assert a.load == b.load
    assert a.time_in_zone == b.time_in_zone


def test_perfil_vazio_degrada_sem_quebrar():
    """RN-1.2: sem limiar e sem FCmax ainda produz Camada 1; sem carga fantasma."""
    from metrics_engine.models import AthleteProfile

    raw = tcx_bytes(n=120, hr=140)
    result = process_activity(raw, AthleteProfile(athlete_id="novato"), activity_id="act_2")
    assert result.layer1.distance_m is not None
    assert result.load.best is None
    assert result.time_in_zone == {}


def test_srpe_acompanha_sessao_com_dispositivo(profile):
    raw = tcx_bytes(n=120)
    result = process_activity(raw, profile, activity_id="act_3", srpe=6.0)
    assert result.load.srpe_load is not None
    # com FC + LTHR a melhor continua sendo hrTSS (sRPE não sobrepõe sensor)
    assert result.load.best[0] == "hrtss"


def test_registro_manual_so_camada_4():
    result = process_manual_activity(
        activity_id="act_4", duration_s=2400.0, srpe=5.0, distance_m=6000.0
    )
    assert result.series is None
    assert result.raw_sha256 is None
    assert result.load.best == ("srpe_load", 200.0)
    assert result.layer1.avg_pace_s_per_km == pytest.approx(400.0)
    assert result.methodology_version == METHODOLOGY_VERSION
