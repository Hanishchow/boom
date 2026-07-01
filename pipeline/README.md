# Célure AI — Pre-Engine Pipeline

The adaptive front half of the ML system: it ingests the dataset, sorts it, and routes each
record through interchangeable **4-quad + CNN** processors, then hands a stable bundle to the
**main engine** — which is **not yet designed** (build is held at that boundary on purpose).

```
 dataset (.xlsx, 50 cols)
        │  ingest.py      → typed, normalized Record
        ▼
   sorting.py             → priority order (image? completeness? severity?)
        ▼
   router.py  ── NeedProfile ──►  RoutePlan   (changes itself per record)
        │        which quads have signal? image? severe/ambiguous → escalate
        ▼
   processors.py  (interchangeable, same contract)
        ├─ Q1 acne/inflammatory ─┐
        ├─ Q2 aging/texture      │  each → 16-d embedding + readouts
        ├─ Q3 pigment/photodamage│
        ├─ Q4 barrier/sensitivity┘
        └─ CNN image branch ......→ 64-d embedding  (stub backbone → ResNet-50 later)
        ▼
   assemble → fused 128-d vector (STABLE layout regardless of route) + scalars
        ▼
 ═══ HANDOFF ═══►  MainEngine.process(EngineInput)     ◄── NOT DESIGNED YET (NullEngine stub)
```

## Why "interchangeable / changes itself"

The **router** builds a `NeedProfile` per record and emits a `RoutePlan`:

- only an image, no annotations → **image** mode (CNN only)
- annotations, no image → **tabular** mode (only the quads with signal)
- both → **hybrid** mode
- severe or multi-domain (≥2 strong quads) → **escalate**: run *all* quads + CNN
- thin signal → graceful **fallback** to the dominant quad

Every processor (quad or CNN) implements the same `Processor.process() → BranchOutput`, so
they are hot-swappable and the assembler always emits the **same 128-d fused vector** — the
future engine gets a consistent input shape no matter which path ran.

## Run

```bash
python -m pipeline.pipeline --data /path/to/Cellure_..._Dataset.xlsx --limit 25
python -m pipeline._selftest      # proves adaptivity (8/8) without the real data
```

## The hold point (main engine)

`core.py` defines `MainEngine` (abstract) + `NullEngine` (placeholder that just echoes the
assembled bundle). **Design and implement `MainEngine.process()` later** — diagnosis,
severity, routine + product/ingredient recommendations. Nothing upstream needs to change;
plug the engine into `Pipeline(engine=YourEngine())`.

## Data note (important)

The current OG dataset is **500 image references with all 50 annotation columns empty** —
it's a labeling template. The pipeline correctly routes it all to the CNN branch today. Once
dermatologist annotations are filled in, the 4 quads light up automatically (no code change).

## Extending

- **Swap the CNN backbone**: replace `CNNBranch.process()` with a real forward pass returning
  a 64-d (or resize `CNN_DIM`) embedding. Same interface.
- **Add a quad / processor**: subclass `Processor`, register it in `default_processors()`.
- **Tune routing**: `Router(active_threshold=…, strong_threshold=…, severe_threshold=…)`.
