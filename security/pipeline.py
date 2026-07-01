"""
Pipeline runner + CLI.

Auto-discovers every check under security/checks/, runs the ones in scope, and
writes JSON + Markdown reports. This is the stable orchestration layer — add
capability by adding checks, not by editing this file.

Usage:
    python -m security.pipeline --repo . --out security/reports
    python -m security.pipeline --repo . --target https://app.example.base44.app \
        --scope app.example.base44.app --out security/reports
"""

from __future__ import annotations

import argparse
import importlib
import json
import os
import pkgutil
import sys
import traceback

from .core import ScanContext, Report, all_checks


def _load_config(path):
    if not path or not os.path.exists(path):
        return {}
    try:
        import yaml  # optional; only needed if you use a YAML config
        with open(path) as f:
            return yaml.safe_load(f) or {}
    except ImportError:
        # Fall back to JSON so the base stays dependency-free.
        try:
            with open(path) as f:
                return json.load(f)
        except Exception:
            return {}
    except Exception:
        return {}


def _discover_checks():
    """Import every module under security.checks so all checks self-register."""
    from . import checks
    for _, modname, _ in pkgutil.iter_modules(checks.__path__):
        importlib.import_module(f"{checks.__name__}.{modname}")


def run(ctx: ScanContext, include=None, exclude=None) -> Report:
    _discover_checks()
    report = Report()
    for cls in all_checks():
        check = cls()
        if include and check.id not in include:
            continue
        if exclude and check.id in exclude:
            continue
        if check.dynamic and not ctx.target_url:
            report.note_run(check.id, ok=True, count=0, error="skipped (no target_url)")
            continue
        try:
            found = check.run(ctx) or []
            report.add(found)
            report.note_run(check.id, ok=True, count=len(found))
        except Exception as e:  # a broken check must never kill the pipeline
            report.note_run(check.id, ok=False, count=0, error=f"{e}\n{traceback.format_exc()[-400:]}")
    return report


def main(argv=None):
    ap = argparse.ArgumentParser(description="Célure AI security pipeline")
    ap.add_argument("--repo", default=".", help="path to the app repo")
    ap.add_argument("--target", default=None, help="deployed app URL (enables dynamic checks)")
    ap.add_argument("--scope", nargs="*", default=[], help="authorized host allow-list for dynamic checks")
    ap.add_argument("--config", default=None, help="optional YAML/JSON config")
    ap.add_argument("--out", default="security/reports", help="report output dir")
    ap.add_argument("--only", nargs="*", default=None, help="run only these check ids")
    ap.add_argument("--skip", nargs="*", default=None, help="skip these check ids")
    ap.add_argument("--fail-on", default="none",
                    choices=["none", "low", "medium", "high", "critical"],
                    help="exit non-zero if a finding at/above this severity exists")
    args = ap.parse_args(argv)

    cfg = _load_config(args.config)
    ctx = ScanContext(
        repo_path=args.repo,
        target_url=args.target or cfg.get("target_url"),
        scope_hosts=args.scope or cfg.get("scope_hosts", []),
        auth=cfg.get("auth", {}),
        config=cfg,
    )

    report = run(ctx, include=args.only, exclude=args.skip)

    os.makedirs(args.out, exist_ok=True)
    with open(os.path.join(args.out, "report.json"), "w", encoding="utf-8") as f:
        json.dump(report.to_json(), f, indent=2)
    with open(os.path.join(args.out, "report.md"), "w", encoding="utf-8") as f:
        f.write(report.to_markdown())

    c = report.counts()
    print(f"[celure-sec] {sum(c.values())} findings "
          f"(critical={c['critical']} high={c['high']} medium={c['medium']} "
          f"low={c['low']} info={c['info']}) -> {args.out}/report.md")

    order = ["low", "medium", "high", "critical"]
    if args.fail_on != "none":
        threshold = order.index(args.fail_on)
        worst = max([order.index(s) for s in order if c[s] > 0], default=-1)
        if worst >= threshold:
            return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
