"""Musculação (Módulo 20): tonelagem, 1RM Epley, carga comum e interferência."""

from __future__ import annotations

import pytest

from metrics_engine.metrics.strength import (
    StrengthExerciseLog,
    StrengthSet,
    compute,
    epley_1rm,
)


def squat(sets: int = 4, reps: int = 5, weight: float = 100.0, rpe: float | None = 8.0):
    return StrengthExerciseLog(
        exercise_id="back_squat",
        muscle_groups=["quads", "glutes"],
        sets=[StrengthSet(reps=reps, weight_kg=weight, rpe=rpe) for _ in range(sets)],
    )


def pullup(sets: int = 3, reps: int = 8):
    return StrengthExerciseLog(
        exercise_id="pullup",
        muscle_groups=["back", "arms"],
        sets=[StrengthSet(reps=reps) for _ in range(sets)],  # peso do corpo
    )


class TestEpley:
    def test_formula(self):
        assert epley_1rm(100.0, 5) == pytest.approx(116.7)
        assert epley_1rm(100.0, 1) == pytest.approx(103.3)

    def test_invalido(self):
        with pytest.raises(ValueError):
            epley_1rm(100.0, 0)


class TestCompute:
    def test_tonelagem_e_series_por_grupo(self):
        m = compute([squat(), pullup()], duration_s=2700.0)
        assert m.tonnage_kg == pytest.approx(4 * 5 * 100.0)  # peso do corpo não soma
        assert m.sets_by_muscle_group["quads"] == 4
        assert m.sets_by_muscle_group["back"] == 3
        assert m.estimated_1rm_by_exercise["back_squat"] == pytest.approx(116.7)
        assert "pullup" not in m.estimated_1rm_by_exercise  # sem carga externa

    def test_carga_na_moeda_comum_por_srpe(self):
        m = compute([squat()], duration_s=3600.0, srpe=7.0)
        assert m.strength_load == pytest.approx(420.0)  # RPE × minutos

    def test_sem_srpe_usa_media_dos_rpes_por_serie(self):
        m = compute([squat(rpe=8.0)], duration_s=1800.0)
        assert m.strength_load == pytest.approx(8.0 * 30.0)

    def test_sessao_pesada_de_mmii_dispara_interferencia(self):
        heavy = compute([squat(sets=6, rpe=8.0)], duration_s=3600.0)
        assert heavy.heavy_lower_body  # RN-20.2

    def test_sessao_leve_ou_superior_nao_dispara(self):
        light = compute([squat(sets=6, rpe=5.0)], duration_s=3600.0)
        upper = compute([pullup(sets=8)], duration_s=3600.0, srpe=8.0)
        assert not light.heavy_lower_body
        assert not upper.heavy_lower_body
