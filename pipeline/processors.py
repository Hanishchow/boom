"""
Interchangeable processors — the 4 quads + the CNN image branch.

All speak the same Processor contract (process -> BranchOutput), so the router can
swap them in and out per record. Each quad turns its columns into a fixed-width feature
vector + readouts; the CNN branch turns the image into an embedding.

The CNN branch here is a pluggable FEATURE EXTRACTOR with a deterministic STUB backbone.
The real ResNet-50 (or whatever the engine design calls for) drops in behind the same
interface later — the pipeline does not change.
"""

from __future__ import annotations
from typing import Dict, Any, List
import numpy as np

from .core import Processor, Record, BranchOutput
from .schema import Quad, QUAD_COLUMNS

QUAD_DIM = 16      # fixed per-quad embedding width
CNN_DIM = 64       # fixed image embedding width


class QuadProcessor(Processor):
    """A domain quadrant. Builds a stable QUAD_DIM vector from its columns' signals."""
    kind = "tabular"

    def __init__(self, quad: Quad):
        self.quad = quad
        self.id = quad.value
        self.columns = QUAD_COLUMNS[quad]

    def can_run(self, record: Record) -> bool:
        return any(c in record.features for c in self.columns)

    def process(self, record: Record, ctx: Dict[str, Any]) -> BranchOutput:
        present = [record.features.get(c) for c in self.columns]
        vals = [v for v in present if v is not None]
        # deterministic fixed-width embedding: raw signals (padded) + simple stats
        base = np.zeros(QUAD_DIM, dtype=np.float32)
        for i, c in enumerate(self.columns[:QUAD_DIM - 4]):
            base[i] = record.features.get(c, 0.0)
        if vals:
            arr = np.array(vals, dtype=np.float32)
            base[-4:] = [arr.mean(), arr.max(), arr.std(), len(vals) / len(self.columns)]
        intensity = float(np.mean(vals)) if vals else 0.0
        severity = float(np.max(vals)) if vals else 0.0
        quality = len(vals) / len(self.columns)
        return BranchOutput(
            processor_id=self.id, quad=self.quad, vector=base,
            scalars={"intensity": intensity, "severity": severity, "coverage": quality},
            quality=quality,
            notes=f"{len(vals)}/{len(self.columns)} signals",
        )


class CNNBranch(Processor):
    """Image feature branch. STUB backbone (deterministic) behind the real interface."""
    id = "cnn_image"
    quad = None
    kind = "image"
    backbone = "stub-v0 (replace with ResNet-50)"

    def can_run(self, record: Record) -> bool:
        return record.has_image

    def process(self, record: Record, ctx: Dict[str, Any]) -> BranchOutput:
        # Deterministic placeholder embedding derived from the image ref, so the pipeline
        # is testable end-to-end. Swap for a real CNN forward pass (returns CNN_DIM vector).
        seed = abs(hash(record.image_file or "")) % (2**32)
        rng = np.random.default_rng(seed)
        vec = rng.standard_normal(CNN_DIM).astype(np.float32)
        vec /= (np.linalg.norm(vec) + 1e-8)
        return BranchOutput(
            processor_id=self.id, quad=None, vector=vec,
            scalars={"image_ready": 1.0},
            quality=1.0 if record.has_image else 0.0,
            notes=f"backbone={self.backbone}",
        )


def default_processors() -> Dict[str, Processor]:
    procs: Dict[str, Processor] = {q.value: QuadProcessor(q) for q in Quad}
    cnn = CNNBranch()
    procs[cnn.id] = cnn
    return procs
