# Célure AI — Security Pipeline

A modular, extensible security-testing base for Célure AI. It ships a working core
(findings model, scoped context, reporting) plus four base checks, and is designed so
you add engines by dropping in new checks — not by editing the runner.

> **Scope & authorization.** Static checks read the local repo. *Dynamic* checks only run
> against a `target_url` whose host is in `scope_hosts` (an explicit allow-list). Never
> point dynamic checks at infrastructure you don't own or aren't authorized to test.

## Run

```bash
# static only (repo scan)
python -m security.pipeline --repo . --out security/reports

# include dynamic checks against an AUTHORIZED target
python -m security.pipeline --repo . \
  --target https://your-app.example.com --scope your-app.example.com \
  --out security/reports

# gate CI on severity
python -m security.pipeline --repo . --fail-on high
```

Outputs `security/reports/report.json` and `report.md`.
Optional flags: `--only <ids>`, `--skip <ids>`, `--config config.local.yaml`.

## Built-in checks

| id | what it finds | type |
|----|----------------|------|
| `secrets.scan` | committed API keys, Stripe live keys, private keys, JWTs, passwords | static |
| `deps.npm_audit` | known-vulnerable npm dependencies (`npm audit`) | static |
| `static.web` | XSS (`dangerouslySetInnerHTML`, `eval`), `innerHTML`, insecure `http://`, tokens in web storage, PII logging | static |
| `headers.security` | missing CSP/HSTS/X-Frame-Options/etc., server info leaks | dynamic |

## Add an engine (the whole point of the base)

Drop a file in `security/checks/` — it auto-registers and the pipeline picks it up:

```python
# security/checks/access_control.py
from ..core import BaseCheck, Category, ScanContext

class AccessControl(BaseCheck):
    id = "auth.idor"
    name = "IDOR / broken object-level authorization"
    category = Category.AUTH
    dynamic = True                      # set True if it hits the network

    def run(self, ctx: ScanContext):
        if not ctx.target_url or not ctx.in_scope(<host>):
            return []
        # ... probe, then:
        return [self.finding("Object accessible across users", "high",
                             location="/api/skin-profile/{id}",
                             recommendation="Enforce owner checks server-side.")]
```

That's the contract: set `id`/`name`/`category`, implement `run(ctx) -> [Finding]`, use
`self.finding(...)`. Return `[]` when out of scope. A check that raises is isolated —
it's logged in the report and never kills the run.

## Roadmap (engines to add as Célure moves off Base44)

Prioritized for a health/PII + payments product:

1. **Auth & access control** — session handling, IDOR on skin-profiles/history, role checks.
2. **File-upload security** — selfie uploads: type/size validation, content sniffing, storage ACLs.
3. **Payment** — Stripe webhook signature verification, price/amount tampering, PCI surface.
4. **Privacy/PII** — data-at-rest, retention, the consent + deletion flows, PII in logs (see current `analyze-skin` finding).
5. **API abuse** — rate limiting, auth on every endpoint, mass-assignment on entities.
6. **Supply chain** — lockfile integrity, SBOM, CI secret scanning.

## Current baseline

`python -m security.pipeline --repo .` → 2 low findings (PII in a backend log line;
a vendored UI library pattern). Existing app-side controls: `ConsentGate`,
`DataDeletion`, `AuditLog` entity, backend image validation.
