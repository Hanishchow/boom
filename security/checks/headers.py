"""HTTP security headers — dynamic check against the deployed app.

DYNAMIC + SCOPED: only runs when a target_url is configured AND its host is in
scope_hosts (authorized-targets allow-list). Uses stdlib urllib only.
"""

import urllib.request
import urllib.error
from urllib.parse import urlparse
from ..core import BaseCheck, Category, ScanContext

# header -> (severity if missing, recommendation)
EXPECTED = {
    "content-security-policy": ("high", "Add a strict CSP to mitigate XSS/data injection."),
    "strict-transport-security": ("medium", "Add HSTS (max-age>=15552000; includeSubDomains)."),
    "x-content-type-options": ("low", "Set `X-Content-Type-Options: nosniff`."),
    "x-frame-options": ("medium", "Set `X-Frame-Options: DENY` or a frame-ancestors CSP to stop clickjacking."),
    "referrer-policy": ("low", "Set `Referrer-Policy: strict-origin-when-cross-origin`."),
    "permissions-policy": ("low", "Restrict powerful features (camera, geolocation) via Permissions-Policy."),
}


class SecurityHeaders(BaseCheck):
    id = "headers.security"
    name = "HTTP security headers"
    category = Category.HEADERS
    dynamic = True

    def run(self, ctx: ScanContext):
        if not ctx.target_url:
            return []
        host = urlparse(ctx.target_url).hostname or ""
        if not ctx.in_scope(host):
            return [self.finding(
                "Skipped headers check — target not in scope", "info",
                category=self.category,
                description=f"{host} is not in scope_hosts. Add it to authorize dynamic testing.",
                confidence="high")]
        try:
            req = urllib.request.Request(ctx.target_url, method="GET",
                                         headers={"User-Agent": "celure-sec/1.0"})
            with urllib.request.urlopen(req, timeout=ctx.timeout) as resp:
                headers = {k.lower(): v for k, v in resp.headers.items()}
        except (urllib.error.URLError, OSError, ValueError) as e:
            return [self.finding("Could not reach target for header check", "info",
                                 category=self.category, description=str(e), confidence="high")]

        findings = []
        for h, (sev, rec) in EXPECTED.items():
            if h not in headers:
                findings.append(self.finding(
                    title=f"Missing security header: {h}",
                    severity=sev, category=self.category,
                    description=f"Response from {ctx.target_url} does not set `{h}`.",
                    location=ctx.target_url, recommendation=rec, confidence="high",
                ))
        # Info leaks
        for leak in ("server", "x-powered-by"):
            if leak in headers:
                findings.append(self.finding(
                    title=f"Information disclosure via `{leak}` header",
                    severity="low", category=self.category,
                    description="Reveals server/framework details useful to an attacker.",
                    location=ctx.target_url, evidence=f"{leak}: {headers[leak]}"[:120],
                    recommendation=f"Suppress the `{leak}` header.", confidence="high",
                ))
        return findings
