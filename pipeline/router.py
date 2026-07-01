"""
Adaptive router — the part that "changes itself based on needs".

Per record it builds a NeedProfile from the quad signals + image availability, then emits
a RoutePlan choosing which interchangeable processors to run and in which mode. It escalates
(runs more branches) when a case is severe or ambiguous, and falls back gracefully when
signal is thin. This is what makes the same pipeline behave differently per record.
"""

from __future__ import annotations
from typing import Dict
import numpy as np

from .core import Record, NeedProfile, RoutePlan
from .schema import Quad, QUAD_COLUMNS


class Router:
    def __init__(self, active_threshold=0.20, strong_threshold=0.60,
                 min_coverage=0.34, severe_threshold=0.80):
        self.active_threshold = active_threshold
        self.strong_threshold = strong_threshold
        self.min_coverage = min_coverage
        self.severe_threshold = severe_threshold

    def _quad_intensity(self, record: Record) -> Dict[Quad, float]:
        out = {}
        for q, cols in QUAD_COLUMNS.items():
            vals = [record.features[c] for c in cols if c in record.features]
            out[q] = float(np.mean(vals)) if vals else 0.0
        return out

    def profile(self, record: Record) -> NeedProfile:
        intensity = self._quad_intensity(record)
        active = [q for q, v in intensity.items() if v >= self.active_threshold]
        strong = [q for q, v in intensity.items() if v >= self.strong_threshold]
        severe = any(
            record.features.get(c, 0.0) >= self.severe_threshold
            for cols in QUAD_COLUMNS.values() for c in cols
        )
        all_cols = {c for cols in QUAD_COLUMNS.values() for c in cols}
        completeness = len([c for c in all_cols if c in record.features]) / max(1, len(all_cols))
        dominant = max(intensity, key=intensity.get) if any(intensity.values()) else None
        escalate = len(strong) >= 2 or severe
        return NeedProfile(
            active_quads=active or ([dominant] if dominant else []),
            quad_intensity=intensity, has_image=record.has_image,
            completeness=completeness, dominant_quad=dominant, escalate=escalate,
        )

    def plan(self, record: Record, need: NeedProfile) -> RoutePlan:
        procs = []
        # escalation self-adjusts the pipeline: run ALL quads when severe/ambiguous
        quads = list(Quad) if need.escalate else need.active_quads
        proc_ids = [q.value for q in quads]

        if need.has_image:
            procs.append("cnn_image")
        procs.extend(proc_ids)

        if need.has_image and proc_ids:
            mode, reason = "hybrid", "image + active quads"
        elif need.has_image:
            mode, reason = "image", "image only (no strong tabular signal)"
        elif proc_ids:
            mode, reason = "tabular", "tabular quads only (no image)"
        else:
            # nothing to go on — fall back to the dominant quad so we still hand off something
            if need.dominant_quad:
                procs.append(need.dominant_quad.value)
            mode, reason = "tabular", "fallback: dominant quad"

        if need.escalate:
            reason += " [ESCALATED]"
        # dedupe, keep order
        seen, ordered = set(), []
        for p in procs:
            if p not in seen:
                seen.add(p); ordered.append(p)
        return RoutePlan(processors=ordered, mode=mode, reason=reason)
