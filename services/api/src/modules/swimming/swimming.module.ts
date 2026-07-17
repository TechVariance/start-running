import { Module } from '@nestjs/common';

// Módulo 19 — Natação (spec Natação/Musculação, ADR-0007).
// Ingestão pelo MESMO pipeline canônico (FIT com mensagens length via
// conector Garmin/HealthKit — doc 08; registro manual RF-19.2); métricas
// (SWOLF, pace/100m, CSS, sTSS) vêm do metrics-engine (metrics/swim.py);
// zonas por %CSS no motor PC-4. Carga entra no daily_load unificado (PC-6).
@Module({})
export class SwimmingModule {}
