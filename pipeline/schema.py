"""
Célure AI — dataset schema (derived from the OG dermatology dataset, 50 columns).

Columns are grouped into four domain QUADRANTS + an image branch + metadata + targets.
The router uses these groupings to decide, per record, which processors ("quads" or CNN)
are actually needed. Everything here is data-only so the rest of the pipeline stays
declarative and easy to extend.
"""

from __future__ import annotations
from enum import Enum
from dataclasses import dataclass, field
from typing import List


class Quad(str, Enum):
    ACNE = "Q1_acne_inflammatory"
    AGING = "Q2_aging_texture"
    PIGMENT = "Q3_pigmentation_photodamage"
    BARRIER = "Q4_barrier_sensitivity"


# --- metadata / identity (never a prediction target) ---
META_COLS = [
    "PicNo", "Image_File", "Subject_ID", "Age", "Gender",
    "Fitzpatrick_Type", "Skin_Type", "Skin_Tone",
]

# --- the four domain quadrants: column -> feature group ---
QUAD_COLUMNS = {
    Quad.ACNE: [
        "Acne_Grade(0-4)", "Papules", "Pustules", "Nodules", "Cysts",
        "Blackheads", "Whiteheads", "Acne_Scars", "Redness",
    ],
    Quad.AGING: [
        "Fine_Lines", "Wrinkles", "Eye_Bags", "Dark_Circles",
        "Elasticity(0-100)", "Texture", "Pores",
    ],
    Quad.PIGMENT: [
        "Pigmentation", "PIH", "Melasma", "UV_Damage", "Blemishes",
    ],
    Quad.BARRIER: [
        "Dryness", "Oiliness", "Sensitivity", "Hydration(0-100)",
        "Rosacea", "Eczema", "Psoriasis", "Redness",
    ],
}

# --- the image branch (drives the interchangeable CNN processor) ---
IMAGE_COL = "Image_File"

# --- targets / outputs the (future) main engine will produce; NOT model inputs ---
TARGET_COLS = [
    "Diagnosis_Label", "Primary_Concern", "Severity",
    "Suggested_Skincare_Routine", "Recommended_Ingredients", "Ingredients_to_Avoid",
    "Suggested_Treatment", "Recommended_Products", "Dermatologist_Recommendation",
    "AI_Prediction", "Confidence(%)", "Ground_Truth", "Follow_Up_Required",
    "Progress_Notes",
]

# columns that are 0-100 or 0-4 numeric scales (normalized during ingest)
NUMERIC_SCALES = {
    "Acne_Grade(0-4)": 4, "Hydration(0-100)": 100, "Elasticity(0-100)": 100,
    "Age": 100, "Confidence(%)": 100,
}


@dataclass
class ColumnInfo:
    name: str
    quad: Quad | None = None
    is_meta: bool = False
    is_target: bool = False
    is_image: bool = False


def all_feature_columns() -> List[str]:
    """Every column a processor may consume (dedup, order-stable)."""
    seen, out = set(), []
    for cols in QUAD_COLUMNS.values():
        for c in cols:
            if c not in seen:
                seen.add(c); out.append(c)
    return out


def quads_touching(column: str) -> List[Quad]:
    return [q for q, cols in QUAD_COLUMNS.items() if column in cols]


HEADER_ROW = 6  # the real header row in the OG .xlsx (rows 1-5 are the confidential banner)
