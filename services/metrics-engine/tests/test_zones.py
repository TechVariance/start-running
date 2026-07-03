"""Zonas configuráveis (PC-4 / RF-3.9) — 3/5/7 modelos, 5 âncoras."""

from __future__ import annotations

import pytest

from conftest import make_series
from metrics_engine.zones.engine import resolve_boundaries, time_in_zone


class TestResolveBoundaries:
    def test_5_zonas_por_lthr(self, profile):
        bounds = resolve_boundaries(5, "pct_lthr", profile)
        assert [b.zone for b in bounds] == [1, 2, 3, 4, 5]
        assert [b.label for b in bounds][3] == "Limiar"
        z4 = bounds[3]
        assert z4.lower == pytest.approx(170 * 0.96, abs=0.1)
        assert z4.upper == pytest.approx(170 * 1.03, abs=0.1)
        assert bounds[-1].upper is None  # última zona aberta

    def test_karvonen_usa_fc_de_reserva(self, profile):
        bounds = resolve_boundaries(5, "karvonen_pct_hrr", profile)
        # 50% FCR com rep=50 e máx=190: 50 + 0.5*140 = 120
        assert bounds[0].lower == pytest.approx(120.0)

    def test_pace_invertido_lower_e_o_mais_lento(self, profile):
        bounds = resolve_boundaries(5, "pct_threshold_pace", profile)
        z4 = bounds[3]
        # Zona de limiar começa a 96% da velocidade de limiar: pace 255/0.96
        assert z4.lower == pytest.approx(255.0 / 0.96, abs=0.1)
        assert z4.upper == pytest.approx(255.0 / 1.03, abs=0.1)
        assert z4.lower > z4.upper  # pace: menor = mais rápido

    def test_modelos_3_e_7(self, profile):
        assert len(resolve_boundaries(3, "pct_hrmax", profile)) == 3
        assert len(resolve_boundaries(7, "pct_lthr", profile)) == 7

    def test_ancora_sem_dado_no_perfil_e_erro_claro(self, profile):
        profile.lthr = None
        with pytest.raises(ValueError, match="lthr"):
            resolve_boundaries(5, "pct_lthr", profile)

    def test_modelo_invalido(self, profile):
        with pytest.raises(ValueError):
            resolve_boundaries(4, "pct_lthr", profile)


class TestTimeInZone:
    def test_fc_constante_cai_em_uma_zona_so(self, profile):
        series = make_series(n=600, hr=160.0)  # 160/170 = 94% LTHR -> zona 3
        bounds = resolve_boundaries(5, "pct_lthr", profile)
        tiz = time_in_zone(series, bounds, anchor="pct_lthr")
        assert tiz[3] == pytest.approx(599.0, abs=1)
        assert tiz[1] == tiz[2] == tiz[4] == tiz[5] == 0.0

    def test_soma_igual_ao_tempo_util(self, profile):
        series = make_series(n=600, hr=160.0)
        bounds = resolve_boundaries(5, "pct_lthr", profile)
        tiz = time_in_zone(series, bounds, anchor="pct_lthr")
        assert sum(tiz.values()) == pytest.approx(599.0, abs=1)

    def test_amostras_em_gap_sao_excluidas(self, profile):
        from metrics_engine.quality.cleaning import clean

        series = make_series(n=600, hr=160.0)
        series.df.loc[300:, "elapsed_s"] += 120.0  # pausa de 2 min
        cleaned, _ = clean(series)
        bounds = resolve_boundaries(5, "pct_lthr", profile)
        tiz = time_in_zone(cleaned, bounds, anchor="pct_lthr")
        # os 120 s de pausa não entram em nenhuma zona
        assert sum(tiz.values()) == pytest.approx(598.0, abs=2)

    def test_mudar_modelo_recomputa_sem_reparse(self, profile):
        series = make_series(n=600, hr=160.0)
        tiz5 = time_in_zone(series, resolve_boundaries(5, "pct_lthr", profile))
        tiz3 = time_in_zone(series, resolve_boundaries(3, "pct_lthr", profile))
        assert set(tiz5) == {1, 2, 3, 4, 5}
        assert set(tiz3) == {1, 2, 3}
        assert sum(tiz3.values()) == pytest.approx(sum(tiz5.values()), abs=1)

    def test_pace_como_ancora(self, profile):
        from metrics_engine.metrics.layer1 import enrich

        series = make_series(n=600, speed_m_s=1000.0 / 255.0)  # exatamente no limiar
        enrich(series)
        bounds = resolve_boundaries(5, "pct_threshold_pace", profile)
        tiz = time_in_zone(series, bounds, anchor="pct_threshold_pace")
        assert tiz[4] == pytest.approx(598.0, abs=2)  # zona de limiar

    def test_serie_sem_canal_da_zero(self, profile):
        series = make_series(hr=None)
        bounds = resolve_boundaries(5, "pct_lthr", profile)
        tiz = time_in_zone(series, bounds, anchor="pct_lthr")
        assert all(v == 0.0 for v in tiz.values())
