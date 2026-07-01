"""Dependency audit — known-vulnerable npm packages via `npm audit --json`."""

import json
import os
import subprocess
from ..core import BaseCheck, Category, ScanContext

SEV_MAP = {"info": "info", "low": "low", "moderate": "medium", "high": "high", "critical": "critical"}


class DependencyAudit(BaseCheck):
    id = "deps.npm_audit"
    name = "npm dependency audit"
    category = Category.DEPENDENCIES

    def run(self, ctx: ScanContext):
        if not os.path.exists(os.path.join(ctx.repo_path, "package.json")):
            return []
        try:
            proc = subprocess.run(
                ["npm", "audit", "--json"],
                cwd=ctx.repo_path, capture_output=True, text=True, timeout=180,
                shell=(os.name == "nt"),
            )
        except (FileNotFoundError, subprocess.TimeoutExpired) as e:
            return [self.finding("npm audit could not run", "info", category=self.category,
                                 description=f"Install deps first (`npm install`) or ensure npm is on PATH. ({e})",
                                 confidence="high")]
        out = proc.stdout or ""
        try:
            data = json.loads(out)
        except json.JSONDecodeError:
            return [self.finding("npm audit returned no parseable output", "info",
                                 category=self.category, confidence="low")]

        findings = []
        # npm v7+ schema: data["vulnerabilities"][pkg]
        vulns = data.get("vulnerabilities", {})
        for pkg, info in vulns.items():
            sev = SEV_MAP.get(info.get("severity", "info"), "info")
            via = info.get("via", [])
            titles = [v.get("title") for v in via if isinstance(v, dict) and v.get("title")]
            desc = "; ".join(titles[:3]) or "Vulnerable transitive/direct dependency."
            findings.append(self.finding(
                title=f"Vulnerable dependency: {pkg}",
                severity=sev, category=self.category,
                description=desc,
                location=f"package.json → {pkg}",
                recommendation="Run `npm audit fix`, or bump to a patched version. Review breaking changes.",
                confidence="high",
            ))
        return findings
