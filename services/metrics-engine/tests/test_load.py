"""Carga interna (RF-3.3–3.5): TRIMP/rTSS/hrTSS/sRPE + CTL/ATL/TSB/ACWR."""

from __future__ import annotations

from datetime import date, timedelta

import pytest

from conftest import make_series
from metrics_engine.metrics.load import (
    SessionLoad,
    daily_load_series,
    hrtss,
    rtss,
    session_load,
    srpe_load,
    trimp_banister,
)
from metrics_engine.models import AthleteProfile


class TestSessionLoads:
    def test_uma_hora_no_lthr_vale_100_hrtss(self, profile):
        assert hrtss(3600.0, 170.0, profile) == pytest.approx(100.0)

    def test_uma_hora_no_pace_de_limiar_vale_100_rtss(self, profile):
        assert rtss(3600.0, 255.0, profile) == pytest.approx(100.0)

    def test_intensidade_maior_pesa_quadraticamente(self, profile):
        easy = hrtss(3600.0, 136.0, profile)  # 80% LTHR
        hard = hrtss(3600.0, 170.0, profile)
        assert hard / easy == pytest.approx(1 / 0.8**2, rel=0.01)

    def test_trimp_cresce_com_a_intensidade(self, profile):
        easy = trimp_banister(make_series(n=3600, hr=120.0), profile)
        hard = trimp_banister(make_series(n=3600, hr=170.0), profile)
        assert easy is not None and hard is not None
        assert hard > easy * 2

    def test_trimp_feminino_usa_coeficiente_proprio(self, profile):
        female = AthleteProfile(athlete_id="a", sex="female", hr_rest=50, hr_max=190)
        series = make_series(n=1800, hr=150.0)
        assert trimp_banister(series, female) != trimp_banister(series, profile)

    def test_srpe_e_rpe_vezes_minutos(self):
        assert srpe_load(7.0, 3600.0) == pytest.approx(420.0)

    def test_sem_fc_e_sem_limiar_nao_ha_carga_fantasma(self):
        profile = AthleteProfile(athlete_id="a")
        series = make_series(hr=None, hr_sensor="none")
        load = session_load(series, profile, elapsed_s=1800.0)
        assert load.trimp is None
        assert load.hrtss is None
        assert load.rtss is None
        assert load.best is None

    def test_degradacao_elegante_escolhe_a_melhor(self, profile):
        # hrTSS > rTSS > TRIMP > sRPE
        full = SessionLoad(trimp=80.0, rtss=90.0, hrtss=95.0, srpe_load=400.0)
        assert full.best == ("hrtss", 95.0)
        assert SessionLoad(trimp=80.0, srpe_load=400.0).best == ("trimp", 80.0)
        assert SessionLoad(srpe_load=400.0).best == ("srpe_load", 400.0)

    def test_sessao_completa_produz_todas_as_cargas(self, profile):
        series = make_series(n=3600, hr=155.0)
        from metrics_engine.metrics.layer1 import compute

        layer1 = compute(series)
        load = session_load(
            series,
            profile,
            avg_hr=layer1.avg_hr,
            moving_s=layer1.moving_s,
            gap_avg_s_per_km=layer1.gap_avg_s_per_km,
            srpe=6.0,
        )
        assert load.trimp and load.rtss and load.hrtss and load.srpe_load
        assert load.best[0] == "hrtss"


class TestDailyLoadSeries:
    def test_vazio(self):
        assert daily_load_series([]) == []

    def test_carga_constante_converge_ctl_para_a_carga(self):
        day0 = date(2026, 1, 1)
        sessions = [(day0 + timedelta(days=i), 100.0) for i in range(300)]
        series = daily_load_series(sessions)
        last = series[-1]
        assert last.ctl == pytest.approx(100.0, abs=1)
        assert last.atl == pytest.approx(100.0, abs=1)
        assert last.tsb == pytest.approx(0.0, abs=1)
        assert last.acwr == pytest.approx(1.0, abs=0.05)
        assert not last.acwr_alert

    def test_pico_subito_dispara_alerta_acwr(self):
        day0 = date(2026, 1, 1)
        sessions = [(day0 + timedelta(days=i), 50.0) for i in range(28)]
        sessions += [(day0 + timedelta(days=28 + i), 150.0) for i in range(7)]
        series = daily_load_series(sessions)
        last = series[-1]
        assert last.acwr > 1.3
        assert last.acwr_alert

    def test_dias_sem_treino_entram_como_zero(self):
        day0 = date(2026, 1, 1)
        series = daily_load_series([(day0, 100.0), (day0 + timedelta(days=3), 100.0)])
        assert len(series) == 4
        assert series[1].daily_load == 0.0
        assert series[1].atl < series[0].atl  # fadiga decai no descanso

    def test_duas_sessoes_no_dia_somam(self):
        day0 = date(2026, 1, 1)
        series = daily_load_series([(day0, 60.0), (day0, 40.0)])
        assert series[0].daily_load == 100.0

    def test_recomputo_e_deterministico(self):
        day0 = date(2026, 1, 1)
        sessions = [(day0 + timedelta(days=i), 80.0 + i) for i in range(60)]
        assert daily_load_series(sessions) == daily_load_series(sessions)

    def test_tsb_usa_o_dia_anterior(self):
        """TSB do dia é a forma ao acordar — treino de hoje ainda não conta."""
        day0 = date(2026, 1, 1)
        series = daily_load_series([(day0, 100.0)])
        assert series[0].tsb == 0.0  # CTL e ATL de ontem eram 0
