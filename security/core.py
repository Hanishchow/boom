"""
Célure AI — security pipeline core.

The stable base that engines/checks are built on. You add new checks by subclassing
BaseCheck anywhere under security/checks/ — they auto-register and the pipeline picks
them up. Everything below is intentionally dependency-free (stdlib only) so the base
stays portable; individual checks may pull in more.
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field, asdict
from enum import Enum
from typing import List, Optional, Dict, Any, Callable


class Severity(str, Enum):
    INFO = "info"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

    @property
    def rank(self) -> int:
        return {"info": 0, "low": 1, "medium": 2, "high": 3, "critical": 4}[self.value]


class Category(str, Enum):
    SECRETS = "secrets"
    DEPENDENCIES = "dependencies"
    STATIC = "static-analysis"
    HEADERS = "http-headers"
    AUTH = "auth-access-control"
    INPUT = "input-validation"
    PRIVACY = "data-privacy"
    PAYMENT = "payment"
    CONFIG = "configuration"
    OTHER = "other"


@dataclass
class Finding:
    """One security observation. Checks emit these."""
    check_id: str
    title: str
    severity: Severity
    category: Category
    description: str = ""
    location: str = ""            # file:line or URL
    evidence: str = ""            # the matched snippet / response header, truncated
    recommendation: str = ""
    references: List[str] = field(default_factory=list)
    confidence: str = "medium"    # low | medium | high

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d["severity"] = self.severity.value
        d["category"] = self.category.value
        return d


@dataclass
class ScanContext:
    """Everything a check needs to do its work. Passed to every check.run()."""
    repo_path: str = "."
    target_url: Optional[str] = None       # deployed app; None disables dynamic checks
    scope_hosts: List[str] = field(default_factory=list)  # allow-list for dynamic tests
    auth: Dict[str, Any] = field(default_factory=dict)     # tokens/cookies for authed tests
    config: Dict[str, Any] = field(default_factory=dict)
    timeout: int = 15

    def in_scope(self, host: str) -> bool:
        """Dynamic checks MUST call this before touching a host. Authorized targets only."""
        host = (host or "").lower().strip()
        return any(host == h or host.endswith("." + h) for h in self.scope_hosts)


# ---- Check base class + auto-registration -----------------------------------

_REGISTRY: List[type] = []


class BaseCheck:
    """Subclass this to add a check/engine. It self-registers on definition.

    Minimal contract: set id/name/category, implement run(ctx) -> list[Finding].
    Keep checks independent and side-effect-free against production unless the
    target host is explicitly in ctx.scope_hosts.
    """
    id: str = "base"
    name: str = "Base Check"
    category: Category = Category.OTHER
    # If True, the check reaches out over the network and is skipped unless a
    # target_url in scope is configured.
    dynamic: bool = False

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        if getattr(cls, "id", None) and cls.id != "base":
            _REGISTRY.append(cls)

    def run(self, ctx: ScanContext) -> List[Finding]:  # pragma: no cover - interface
        raise NotImplementedError

    # convenience for subclasses
    def finding(self, title, severity, description="", **kw) -> Finding:
        kw.setdefault("category", self.category)          # checks may override; default = own category
        kw["category"] = Category(kw["category"])          # accept enum or str
        return Finding(check_id=self.id, title=title, severity=Severity(severity),
                       description=description, **kw)


def all_checks() -> List[type]:
    return list(_REGISTRY)


# ---- Reporting --------------------------------------------------------------

class Report:
    def __init__(self):
        self.findings: List[Finding] = []
        self.started = time.time()
        self.check_runs: List[Dict[str, Any]] = []

    def add(self, findings: List[Finding]):
        self.findings.extend(findings or [])

    def note_run(self, check_id: str, ok: bool, count: int, error: str = ""):
        self.check_runs.append({"check": check_id, "ok": ok, "findings": count, "error": error})

    def sorted_findings(self) -> List[Finding]:
        return sorted(self.findings, key=lambda f: -f.severity.rank)

    def counts(self) -> Dict[str, int]:
        c = {s.value: 0 for s in Severity}
        for f in self.findings:
            c[f.severity.value] += 1
        return c

    def to_json(self) -> Dict[str, Any]:
        return {
            "duration_s": round(time.time() - self.started, 2),
            "counts": self.counts(),
            "runs": self.check_runs,
            "findings": [f.to_dict() for f in self.sorted_findings()],
        }

    def to_markdown(self) -> str:
        c = self.counts()
        lines = ["# Célure AI — Security Report", ""]
        lines.append(f"- critical: {c['critical']}  high: {c['high']}  "
                     f"medium: {c['medium']}  low: {c['low']}  info: {c['info']}")
        lines.append("")
        for f in self.sorted_findings():
            lines.append(f"## [{f.severity.value.upper()}] {f.title}")
            lines.append(f"- **check**: `{f.check_id}` · **category**: {f.category.value} "
                         f"· **confidence**: {f.confidence}")
            if f.location:
                lines.append(f"- **where**: `{f.location}`")
            if f.description:
                lines.append(f"- {f.description}")
            if f.evidence:
                lines.append(f"- evidence: `{f.evidence[:200]}`")
            if f.recommendation:
                lines.append(f"- **fix**: {f.recommendation}")
            lines.append("")
        if not self.findings:
            lines.append("_No findings._")
        return "\n".join(lines)
