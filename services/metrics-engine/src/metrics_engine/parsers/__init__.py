"""Parsers de arquivo bruto → série canônica (RF-2.4).

Riqueza: FIT > TCX > GPX. O arquivo original permanece imutável no S3
(ADR-0006); parsear de novo é sempre possível e barato.
"""

from __future__ import annotations

from ..models import CanonicalSeries

__all__ = ["parse", "detect_format"]

#: Assinatura do header FIT: ".FIT" nos bytes 8–12 (FIT SDK §Header).
_FIT_MAGIC = b".FIT"


def detect_format(raw: bytes) -> str:
    """Detecta o formato do bruto pelo conteúdo, não pela extensão."""
    if len(raw) >= 12 and raw[8:12] == _FIT_MAGIC:
        return "fit"
    head = raw[:2048].lstrip()
    if head.startswith(b"<?xml") or head.startswith(b"<"):
        if b"TrainingCenterDatabase" in head:
            return "tcx"
        if b"<gpx" in head:
            return "gpx"
    raise ValueError("Formato de arquivo bruto não reconhecido (esperado FIT, TCX ou GPX)")


def parse(raw: bytes, fmt: str | None = None) -> CanonicalSeries:
    """Converte o bruto em série canônica, escolhendo o parser pelo formato."""
    fmt = fmt or detect_format(raw)
    if fmt == "fit":
        from . import fit

        return fit.parse(raw)
    if fmt == "tcx":
        from . import tcx

        return tcx.parse(raw)
    if fmt == "gpx":
        from . import gpx

        return gpx.parse(raw)
    raise ValueError(f"Formato não suportado: {fmt!r}")
