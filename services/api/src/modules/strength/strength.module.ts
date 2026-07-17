import { Module } from '@nestjs/common';

// Módulo 20 — Musculação (absorve o Módulo 11; spec Natação/Musculação).
// Registro estruturado é o bruto (RNF-2.3); derivadas (tonelagem, 1RM Epley,
// strength-load na moeda comum, flag de interferência RN-20.2) vêm do
// metrics-engine (metrics/strength.py). A janela de interferência é
// restrição de agendamento do módulo training (ADR-0007 §4).
@Module({})
export class StrengthModule {}
