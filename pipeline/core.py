"""
Célure AI — pipeline core types and interfaces.

Defines the contracts every stage speaks, so processors (the 4 quads and the CNN branch)
are interchangeable, and the MAIN ENGINE plugs in behind a single stable interface.

    ingest -> Record
    sort   -> ordered/segmented Records
    route  -> NeedProfile + RoutePlan (which processors to run)
    process-> BranchOutput per processor
    assemble -> EngineInput
    >>> HANDOFF >>> MainEngine.process(EngineInput)   # NOT designed yet — see NullEngine
"""

from __future__ import annotations
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Any, Optional
import numpy as np

from .schema import Quad


@dataclass
class Record:
    """One dermatology record: metadata + raw feature values + optional image ref."""
    pic_no: Any
    image_file: Optional[str]
    meta: Dict[str, Any] = field(default_factory=dict)
    features: Dict[str, float] = field(default_factory=dict)   # normalized numeric values
    raw: Dict[str, Any] = field(default_factory=dict)          # original cell values
    targets: Dict[str, Any] = field(default_factory=dict)      # labels if present (for training)

    @property
    def has_image(self) -> bool:
        return bool(self.image_file)


@dataclass
class NeedProfile:
    """What this record actually needs — drives adaptive routing."""
    active_quads: List[Quad]                  # quads with meaningful signal
    quad_intensity: Dict[Quad, float]         # 0-1 signal strength per quad
    has_image: bool
    completeness: float                       # 0-1 fraction of feature columns present
    dominant_quad: Optional[Quad]
    escalate: bool = False                    # ambiguous/severe -> run more branches


@dataclass
class RoutePlan:
    """Which interchangeable processors to run, and in what mode."""
    processors: List[str]                     # processor ids to execute
    mode: str                                 # 'image' | 'tabular' | 'hybrid'
    reason: str = ""


@dataclass
class BranchOutput:
    """Uniform output of any processor — this is what makes quads and CNN interchangeable."""
    processor_id: str
    quad: Optional[Quad]
    vector: np.ndarray                        # feature embedding this branch produced
    scalars: Dict[str, float] = field(default_factory=dict)  # named readouts (e.g. severity)
    quality: float = 1.0                      # 0-1 confidence in this branch's output
    notes: str = ""


@dataclass
class EngineInput:
    """The assembled bundle handed to the main engine. Stable across engine designs."""
    record: Record
    need: NeedProfile
    plan: RoutePlan
    branches: List[BranchOutput]
    fused_vector: np.ndarray
    fused_scalars: Dict[str, float] = field(default_factory=dict)

    def summary(self) -> Dict[str, Any]:
        return {
            "pic_no": self.record.pic_no,
            "mode": self.plan.mode,
            "processors": [b.processor_id for b in self.branches],
            "dominant_quad": self.need.dominant_quad.value if self.need.dominant_quad else None,
            "fused_dim": int(self.fused_vector.shape[0]),
            "scalars": self.fused_scalars,
        }


# ---- interchangeable processor interface ------------------------------------

class Processor(ABC):
    """Base contract for a quad processor or the CNN branch. Subclass and register."""
    id: str = "processor"
    quad: Optional[Quad] = None
    kind: str = "tabular"                      # 'tabular' | 'image'

    @abstractmethod
    def process(self, record: Record, ctx: Dict[str, Any]) -> BranchOutput: ...

    def can_run(self, record: Record) -> bool:
        return True


# ---- MAIN ENGINE interface — DESIGN PENDING ---------------------------------

class MainEngine(ABC):
    """The decision/diagnosis engine that consumes EngineInput and produces the final
    Diagnosis/Recommendation. **Intentionally not implemented** — design is pending.
    Everything upstream is built and verified against this contract."""

    @abstractmethod
    def process(self, engine_input: EngineInput) -> Dict[str, Any]: ...


class NullEngine(MainEngine):
    """Placeholder so the pipeline runs end-to-end today. Returns the assembled bundle
    unchanged and flags that the real engine is not yet wired. DO NOT ship as the engine."""

    def process(self, engine_input: EngineInput) -> Dict[str, Any]:
        return {
            "engine": "NullEngine (main engine not yet designed)",
            "handoff_ok": True,
            "input_summary": engine_input.summary(),
            "TODO": "Design & implement MainEngine.process() to produce diagnosis + recommendations.",
        }
