"""
Sorting stage — the "first sorting" before routing.

Orders records so the highest-value / most-complete cases flow first, and can segment
the batch by dominant quad so downstream processing (and future engine batching) is
cache- and domain-coherent.
"""

from __future__ import annotations
from typing import List, Dict
from collections import defaultdict

from .core import Record
from .router import Router
from .schema import Quad


def sort_records(records: List[Record], router: Router) -> List[Record]:
    """Priority order: has image, then completeness, then dominant intensity, then severity."""
    def key(r: Record):
        need = router.profile(r)
        dom = need.quad_intensity.get(need.dominant_quad, 0.0) if need.dominant_quad else 0.0
        severe = max(r.features.values()) if r.features else 0.0
        return (r.has_image, need.completeness, dom, severe)
    return sorted(records, key=key, reverse=True)


def segment_by_quad(records: List[Record], router: Router) -> Dict[Quad, List[Record]]:
    """Bucket records by their dominant quad (for domain-coherent batching)."""
    buckets: Dict[Quad, List[Record]] = defaultdict(list)
    for r in records:
        need = router.profile(r)
        if need.dominant_quad:
            buckets[need.dominant_quad].append(r)
    return dict(buckets)
