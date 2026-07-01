"""Static analysis — common client-side web vulns in the React/Vite source.

Célure AI handles selfies, PII and Stripe, so the high-value surface is XSS,
unsafe DOM injection, insecure transport, and PII leaking to logs/URLs.
"""

import os
import re
from ..core import BaseCheck, Category, ScanContext

RULES = [
    # (id, label, regex, severity, recommendation)
    ("xss.dangerous_html", "dangerouslySetInnerHTML usage",
     re.compile(r"dangerouslySetInnerHTML"), "high",
     "Sanitize HTML (e.g. DOMPurify) before injecting, or render as text."),
    ("xss.eval", "eval()/new Function() dynamic code",
     re.compile(r"\beval\s*\(|new\s+Function\s*\("), "high",
     "Remove dynamic code execution; it enables XSS/RCE via attacker-controlled input."),
    ("transport.http", "Hardcoded insecure http:// endpoint",
     re.compile(r"http://(?!localhost|127\.0\.0\.1)[A-Za-z0-9.\-]+"), "medium",
     "Use https:// for all external endpoints to prevent MITM."),
    ("dom.innerhtml", "Direct innerHTML assignment",
     re.compile(r"\.innerHTML\s*="), "medium",
     "Avoid innerHTML with untrusted data; prefer textContent or sanitized rendering."),
    ("storage.token", "Auth token in localStorage/sessionStorage",
     re.compile(r"(?:local|session)Storage\.(?:setItem)?\s*\(?\s*['\"][^'\"]*(token|jwt|secret|auth)"), "medium",
     "Tokens in web storage are readable by any XSS. Prefer httpOnly cookies where possible."),
    ("privacy.pii_log", "Possible PII/console logging",
     re.compile(r"console\.(log|debug|info)\([^)]*(email|selfie|image|password|token|user)", re.I), "low",
     "Do not log PII or secrets; strip debug logging from production builds."),
    ("secrets.env_inline", "Non-VITE env / secret referenced client-side",
     re.compile(r"import\.meta\.env\.(?!VITE_)[A-Z_]+"), "low",
     "Only VITE_ vars are exposed to the client by design; anything else won't work and hints at a secret leak."),
]

SKIP_DIRS = {".git", "node_modules", "dist", "build", "coverage"}
SCAN_EXT = {".js", ".jsx", ".ts", ".tsx", ".html"}
# The vendored shadcn/ui primitives legitimately use innerHTML-ish patterns; down-rank them.
VENDOR_HINT = os.path.join("components", "ui")


class StaticAnalysis(BaseCheck):
    id = "static.web"
    name = "Client-side static analysis"
    category = Category.STATIC

    def run(self, ctx: ScanContext):
        findings = []
        for root, dirs, files in os.walk(ctx.repo_path):
            dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
            for fn in files:
                if os.path.splitext(fn)[1].lower() not in SCAN_EXT:
                    continue
                path = os.path.join(root, fn)
                rel = os.path.relpath(path, ctx.repo_path)
                vendor = VENDOR_HINT in rel
                try:
                    with open(path, "r", encoding="utf-8", errors="ignore") as fh:
                        for i, line in enumerate(fh, 1):
                            for rid, label, pat, sev, rec in RULES:
                                m = pat.search(line)
                                if not m:
                                    continue
                                s = sev
                                conf = "medium"
                                if vendor:  # library code — lower confidence/severity
                                    conf = "low"
                                    s = "low" if sev in ("high", "medium") else sev
                                findings.append(self.finding(
                                    title=label, severity=s, category=self.category,
                                    description=f"Rule `{rid}` matched.",
                                    location=f"{rel}:{i}", evidence=line.strip()[:160],
                                    recommendation=rec, confidence=conf,
                                ))
                except OSError:
                    continue
        return findings
