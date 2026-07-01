"""Self-test: proves the pipeline adapts its route per record (image / tabular / hybrid /
escalated) and always hands off a stable fused vector. Run: python -m pipeline._selftest"""

from .core import Record
from .router import Router
from .pipeline import Pipeline, FUSED_DIM


def mk(pic, image=None, feats=None):
    return Record(pic_no=pic, image_file=image, features=feats or {})


def main():
    pipe = Pipeline()
    P = lambda name, ok: print(f"{'PASS' if ok else 'FAIL'}  {name}")

    # 1) image only, no tabular -> mode 'image', cnn only
    r = pipe.process_record(mk(1, image="IMG_1.jpg"))
    s = r["input_summary"]
    P("image-only -> image mode", s["mode"] == "image" and s["processors"] == ["cnn_image"])

    # 2) single-quad tabular, no image -> 'tabular', that quad only
    acne = {"Acne_Grade(0-4)": 0.75, "Papules": 0.6, "Pustules": 0.5, "Redness": 0.4}
    r = pipe.process_record(mk(2, feats=acne))
    s = r["input_summary"]
    P("tabular single-quad -> tabular mode", s["mode"] == "tabular")
    P("dominant quad = acne", s["dominant_quad"] == "Q1_acne_inflammatory")

    # 3) image + strong multi-quad -> 'hybrid' + escalation runs ALL quads + cnn
    multi = {"Acne_Grade(0-4)": 0.9, "Pustules": 0.8, "Wrinkles": 0.7, "Elasticity(0-100)": 0.8,
             "Melasma": 0.85, "UV_Damage": 0.7, "Oiliness": 0.7, "Sensitivity": 0.6}
    r = pipe.process_record(mk(3, image="IMG_3.jpg", feats=multi))
    s = r["input_summary"]
    P("hybrid mode", s["mode"] == "hybrid")
    P("escalation runs all 4 quads + cnn", len(s["processors"]) == 5 and "cnn_image" in s["processors"])
    P("escalated flag set", s["scalars"]["escalated"] == 1.0)

    # 4) fused vector always stable width regardless of route
    widths = {pipe.process_record(mk(i, image=("x.jpg" if i % 2 else None),
              feats=({"Dryness": 0.5} if i % 3 else {})))["input_summary"]["fused_dim"]
              for i in range(6)}
    P(f"fused vector stable ({FUSED_DIM})", widths == {FUSED_DIM})

    # 5) handoff always reaches the (stub) engine
    P("handoff ok", r["handoff_ok"] is True)


if __name__ == "__main__":
    main()
