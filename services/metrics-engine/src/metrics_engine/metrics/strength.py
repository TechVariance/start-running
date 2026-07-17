"""Derivadas da sessão de força (Módulo 20, RF-20.3/20.4, ADR-0007).

O registro estruturado É o bruto (não há série temporal); as derivadas são
recomputáveis e versionadas como qualquer outra. A carga entra na moeda
comum via sRPE (RPE × minutos) — PC-6.
"""

from __future__ import annotations

from dataclasses import dataclass, field

#: Grupos de membros inferiores — disparam a janela de interferência (RN-20.2).
LOWER_BODY_GROUPS = {"quads", "hamstrings", "glutes", "calves"}
#: Sessão "pesada" de MMII: RPE médio >= 7 e >= 6 séries de MMII.
HEAVY_RPE_THRESHOLD = 7.0
HEAVY_LOWER_SETS_THRESHOLD = 6


@dataclass
class StrengthSet:
    reps: int
    weight_kg: float | None = None  # ausente = peso do corpo
    rpe: float | None = None


@dataclass
class StrengthExerciseLog:
    exercise_id: str
    muscle_groups: list[str]
    sets: list[StrengthSet]


@dataclass
class StrengthMetrics:
    tonnage_kg: float
    sets_by_muscle_group: dict[str, int] = field(default_factory=dict)
    estimated_1rm_by_exercise: dict[str, float] = field(default_factory=dict)
    strength_load: float | None = None
    heavy_lower_body: bool = False


def epley_1rm(weight_kg: float, reps: int) -> float:
    """1RM estimado (Epley): peso × (1 + reps/30). Para reps=1, o próprio peso."""
    if reps < 1 or weight_kg <= 0:
        raise ValueError("Epley exige reps >= 1 e carga > 0")
    return round(weight_kg * (1 + reps / 30.0), 1)


def compute(
    exercises: list[StrengthExerciseLog],
    *,
    duration_s: float,
    srpe: float | None = None,
) -> StrengthMetrics:
    """Deriva tonelagem, séries por grupo, 1RM estimado e carga da sessão."""
    tonnage = 0.0
    sets_by_group: dict[str, int] = {}
    best_1rm: dict[str, float] = {}
    rpes: list[float] = []
    lower_sets = 0
    for exercise in exercises:
        for s in exercise.sets:
            if s.weight_kg:
                tonnage += s.reps * s.weight_kg
                estimated = epley_1rm(s.weight_kg, s.reps)
                if estimated > best_1rm.get(exercise.exercise_id, 0.0):
                    best_1rm[exercise.exercise_id] = estimated
            if s.rpe is not None:
                rpes.append(s.rpe)
            for group in exercise.muscle_groups:
                sets_by_group[group] = sets_by_group.get(group, 0) + 1
            # Uma série conta uma vez para MMII, mesmo tocando vários grupos.
            if any(g in LOWER_BODY_GROUPS for g in exercise.muscle_groups):
                lower_sets += 1

    # Carga na moeda comum: sRPE declarado > média dos RPEs por série > None.
    effective_rpe = srpe if srpe is not None else (sum(rpes) / len(rpes) if rpes else None)
    strength_load = (
        round(effective_rpe * duration_s / 60.0, 1) if effective_rpe is not None else None
    )

    heavy = (
        effective_rpe is not None
        and effective_rpe >= HEAVY_RPE_THRESHOLD
        and lower_sets >= HEAVY_LOWER_SETS_THRESHOLD
    )
    return StrengthMetrics(
        tonnage_kg=round(tonnage, 1),
        sets_by_muscle_group=sets_by_group,
        estimated_1rm_by_exercise=best_1rm,
        strength_load=strength_load,
        heavy_lower_body=heavy,
    )
