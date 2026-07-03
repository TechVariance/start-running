"""Qualidade do dado (PC-5) — regras do doc 04 §2.1."""

from __future__ import annotations

import pandas as pd

from conftest import make_series
from metrics_engine.models import QualityFlag
from metrics_engine.quality.cleaning import clean


def test_serie_perfeita_tem_confianca_maxima():
    series = make_series(hr_sensor="chest_strap")
    cleaned, report = clean(series)
    assert report.confidence == 1.0
    assert (cleaned.df["quality_flags"] == 0).all()


def test_nao_muta_a_serie_de_entrada():
    series = make_series()
    series.df.loc[100, "hr"] = 300.0
    original = series.df["hr"].copy()
    clean(series)
    pd.testing.assert_series_equal(series.df["hr"], original)


def test_spike_de_fc_fora_da_faixa_e_removido_e_interpolado():
    series = make_series(hr=150.0)
    series.df.loc[100, "hr"] = 250.0  # acima de 230 bpm
    cleaned, report = clean(series)
    flags = cleaned.df["quality_flags"].astype(int)
    assert flags.iloc[100] & int(QualityFlag.SPIKE_REMOVED)
    assert flags.iloc[100] & int(QualityFlag.INTERPOLATED)
    assert cleaned.df["hr"].iloc[100] == 150.0  # vizinhos são 150
    assert report.confidence < 1.0


def test_salto_impossivel_de_fc_e_removido():
    series = make_series(hr=150.0)
    series.df.loc[200, "hr"] = 195.0  # +45 bpm em 1 s
    cleaned, _ = clean(series)
    assert cleaned.df["quality_flags"].iloc[200] & int(QualityFlag.SPIKE_REMOVED)
    assert cleaned.df["hr"].iloc[200] == 150.0


def test_buraco_longo_de_fc_vira_gap_sem_interpolar():
    series = make_series(hr=150.0)
    series.df.loc[100:130, "hr"] = None  # 31 s sem FC
    cleaned, _ = clean(series)
    flags = cleaned.df["quality_flags"].iloc[100:131].astype(int)
    assert (flags & int(QualityFlag.GAP)).all()
    assert cleaned.df["hr"].iloc[100:131].isna().all()


def test_pausa_de_gravacao_maior_que_10s_marca_gap():
    series = make_series(n=300)
    series.df.loc[150:, "elapsed_s"] += 60.0  # pausa de 60 s no meio
    cleaned, report = clean(series)
    assert cleaned.df["quality_flags"].iloc[150] & int(QualityFlag.GAP)
    assert report.notes["gap_seconds"] >= 60.0


def test_drift_de_gps_e_suavizado_e_sinalizado():
    series = make_series(n=60)
    series.df["lat"] = [0.00003 * i for i in range(60)]  # ~3.3 m/s ao norte
    series.df["lon"] = 0.0
    series.df.loc[30, "lat"] += 0.01  # teleporte de ~1.1 km
    cleaned, _ = clean(series)
    flags = cleaned.df["quality_flags"].astype(int)
    assert (flags & int(QualityFlag.GPS_DRIFT)).any()
    assert abs(cleaned.df["lat"].iloc[30] - 0.00003 * 30) < 0.001


def test_fc_optica_reduz_confianca():
    chest, _ = make_series(hr_sensor="chest_strap"), None
    _, report_chest = clean(chest)
    optical = make_series(hr_sensor="optical")
    _, report_optical = clean(optical)
    assert report_optical.confidence < report_chest.confidence


def test_amostragem_esparsa_reduz_confianca():
    dense = make_series(dt_s=1.0)
    sparse = make_series(dt_s=8.0, n=100)
    _, report_dense = clean(dense)
    _, report_sparse = clean(sparse)
    assert report_sparse.confidence < report_dense.confidence


def test_sessao_suja_cai_abaixo_do_limiar_de_confianca():
    """Muito dado interpolado/spike -> confidence < 0.6 (UI sinaliza, RNF-7.1)."""
    series = make_series(n=200, hr=150.0, hr_sensor="optical")
    for i in range(0, 200, 2):  # metade da sessão com spikes
        series.df.loc[i, "hr"] = 250.0
    _, report = clean(series)
    assert report.confidence < 0.6
