"""Secret scanning — hardcoded keys, tokens, credentials committed to the repo."""

import os
import re
from ..core import BaseCheck, Category, Severity, ScanContext

# (label, compiled pattern, severity)
PATTERNS = [
    ("AWS access key", re.compile(r"AKIA[0-9A-Z]{16}"), "high"),
    ("Google API key", re.compile(r"AIza[0-9A-Za-z_\-]{35}"), "high"),
    ("Stripe live secret key", re.compile(r"sk_live_[0-9A-Za-z]{20,}"), "critical"),
    ("Stripe live publishable", re.compile(r"pk_live_[0-9A-Za-z]{20,}"), "medium"),
    ("Generic private key block", re.compile(r"-----BEGIN (?:RSA |EC )?PRIVATE KEY-----"), "critical"),
    ("Bearer/JWT token", re.compile(r"eyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}"), "high"),
    ("Slack token", re.compile(r"xox[baprs]-[0-9A-Za-z\-]{10,}"), "high"),
    ("Hardcoded password assignment", re.compile(r"(?i)(password|passwd|secret)\s*[:=]\s*['\"][^'\"]{6,}['\"]"), "medium"),
]

SKIP_DIRS = {".git", "node_modules", "dist", "build", ".next", "coverage"}
SCAN_EXT = {".js", ".jsx", ".ts", ".tsx", ".json", ".yaml", ".yml", ".env", ".html", ".md", ".sh"}


class SecretScan(BaseCheck):
    id = "secrets.scan"
    name = "Committed secret scan"
    category = Category.SECRETS

    def run(self, ctx: ScanContext):
        findings = []
        for root, dirs, files in os.walk(ctx.repo_path):
            dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
            for fn in files:
                ext = os.path.splitext(fn)[1].lower()
                if ext not in SCAN_EXT and not fn.startswith(".env"):
                    continue
                path = os.path.join(root, fn)
                try:
                    with open(path, "r", encoding="utf-8", errors="ignore") as fh:
                        for i, line in enumerate(fh, 1):
                            for label, pat, sev in PATTERNS:
                                m = pat.search(line)
                                if m:
                                    rel = os.path.relpath(path, ctx.repo_path)
                                    findings.append(self.finding(
                                        title=f"Possible {label} in source",
                                        severity=sev, category=self.category,
                                        description="A value matching a known secret format is committed to the repo.",
                                        location=f"{rel}:{i}",
                                        evidence=m.group(0)[:60],
                                        confidence="medium",
                                        recommendation="Rotate the credential, remove it from git history, and load it from an untracked .env instead.",
                                    ))
                except OSError:
                    continue
        return findings
