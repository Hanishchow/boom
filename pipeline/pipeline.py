"""
Orchestrator — ingest -> sort -> route -> process (interchangeable quads/CNN) -> assemble
-> HANDOFF to the main engine (NullEngine stub; real engine design pending).

The assembler always produces a fixed-width fused vector (stable layout regardless of which
processors ran), so whatever engine is designed later gets a consistent input shape.

CLI:
    python -m pipeline.pipeline --data /path/to/Cellure_..._Dataset.xlsx --limit 20
"""

from __future__ import annotations
import argparse
import sys
from typing import List, Dict, Any
import numpy as np

from .core import Record, EngineInput, MainEngine, NullEngine, BranchOutput
from .schema import Quad
from .ingest import load_records
from .router import Router
from .sorting import sort_records
from .processors import default_processors, QUAD_DIM, CNN_DIM

# stable fused layout: Q1 Q2 Q3 Q4 (16 each) + CNN (64) = 128
QUAD_ORDER = list(Quad)
FUSED_DIM = QUAD_DIM * len(QUAD_ORDER) + CNN_DIM


class Pipeline:
    def __init__(self, engine: MainEngine = None, router: Router = None, processors=None):
        self.engine = engine or NullEngine()
        self.router = router or Router()
        self.processors = processors or default_processors()

    def _assemble(self, record, need, plan, branches: List[BranchOutput]) -> EngineInput:
        fused = np.zeros(FUSED_DIM, dtype=np.float32)
        by_id = {b.processor_id: b for b in branches}
        for i, q in enumerate(QUAD_ORDER):
            b = by_id.get(q.value)
            if b is not None:
                fused[i * QUAD_DIM:(i + 1) * QUAD_DIM] = b.vector[:QUAD_DIM]
        cnn = by_id.get("cnn_image")
        if cnn is not None:
            fused[QUAD_DIM * len(QUAD_ORDER):] = cnn.vector[:CNN_DIM]

        sev = [b.scalars.get("severity", 0.0) for b in branches if b.quad]
        inten = [b.scalars.get("intensity", 0.0) for b in branches if b.quad]
        scalars = {
            "max_severity": float(max(sev)) if sev else 0.0,
            "mean_intensity": float(np.mean(inten)) if inten else 0.0,
            "n_branches": float(len(branches)),
            "has_image": 1.0 if need.has_image else 0.0,
            "escalated": 1.0 if need.escalate else 0.0,
        }
        return EngineInput(record=record, need=need, plan=plan, branches=branches,
                           fused_vector=fused, fused_scalars=scalars)

    def process_record(self, record: Record) -> Dict[str, Any]:
        need = self.router.profile(record)
        plan = self.router.plan(record, need)
        branches: List[BranchOutput] = []
        for pid in plan.processors:
            proc = self.processors.get(pid)
            if proc and proc.can_run(record):
                branches.append(proc.process(record, ctx={"plan": plan}))
        engine_input = self._assemble(record, need, plan, branches)
        # >>> HANDOFF to the main engine (stub today) >>>
        return self.engine.process(engine_input)

    def run(self, path: str, limit: int = None) -> List[Dict[str, Any]]:
        records = load_records(path)
        records = sort_records(records, self.router)
        if limit:
            records = records[:limit]
        return [self.process_record(r) for r in records]


def main(argv=None):
    ap = argparse.ArgumentParser(description="Célure AI — pre-engine pipeline")
    ap.add_argument("--data", required=True, help="path to the dataset .xlsx/.csv")
    ap.add_argument("--limit", type=int, default=None)
    args = ap.parse_args(argv)

    pipe = Pipeline()
    results = pipe.run(args.data, limit=args.limit)

    # routing stats — show the pipeline adapting per record
    modes, procs = {}, {}
    for r in results:
        s = r["input_summary"]
        modes[s["mode"]] = modes.get(s["mode"], 0) + 1
        for p in s["processors"]:
            procs[p] = procs.get(p, 0) + 1
    print(f"[cellure-pipeline] processed {len(results)} records  (fused_dim={FUSED_DIM})")
    print("  route modes:", modes)
    print("  processor usage:", procs)
    if results:
        print("  sample handoff:", results[0]["input_summary"])
        print("  engine:", results[0]["engine"])
    return 0


if __name__ == "__main__":
    sys.exit(main())
