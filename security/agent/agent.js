/**
 * Célure AI — Active Security Agent.
 *
 * A runtime guard for the (post-Base44) backend. Where the pipeline scans code at rest,
 * this agent watches live traffic and actively decides: allow / challenge / block.
 *
 * It does three things:
 *   1) Rate limiting  — sliding-window per identity (ip + user), per route class.
 *   2) Anomaly scoring — payload size, endpoint enumeration, auth failures, method abuse.
 *   3) Auto-blocking   — identities over a threat threshold are blocked for a TTL.
 *
 * In-memory by design (zero deps) so it drops in anywhere; swap the Store for Redis in
 * production so limits/blocks are shared across instances. Wire audit events into the
 * existing AuditLog entity via the onEvent hook.
 */

const DEFAULTS = {
  windowMs: 60_000,           // rate window
  maxPerWindow: 60,           // requests per identity per window (default route class)
  routeLimits: {              // per-path-prefix overrides (sensitive routes are stricter)
    '/api/analyze-skin': 8,   // heavy CNN inference — tight
    '/api/auth': 10,          // brute-force surface
    '/api/upload': 15,
  },
  maxBodyBytes: 12 * 1024 * 1024, // 12MB (selfies); larger = suspicious
  blockThreshold: 100,        // cumulative threat score that triggers a block
  blockTtlMs: 15 * 60_000,    // 15 min auto-block
  decayMs: 5 * 60_000,        // threat score half-life
  enumerationWindow: 15,      // distinct paths in short succession => scanning
};

export class MemoryStore {
  constructor() { this.hits = new Map(); this.threat = new Map(); this.blocks = new Map(); this.paths = new Map(); }
  pushHit(key, ts, windowMs) {
    const arr = (this.hits.get(key) || []).filter((t) => ts - t < windowMs);
    arr.push(ts); this.hits.set(key, arr); return arr.length;
  }
  addThreat(key, pts, ts, decayMs) {
    const prev = this.threat.get(key) || { score: 0, ts };
    const decayed = prev.score * Math.pow(0.5, (ts - prev.ts) / decayMs);
    const score = decayed + pts;
    this.threat.set(key, { score, ts }); return score;
  }
  block(key, until) { this.blocks.set(key, until); }
  blockedUntil(key) { return this.blocks.get(key) || 0; }
  seenPath(key, path, ts, windowMs) {
    const arr = (this.paths.get(key) || []).filter((e) => ts - e.ts < windowMs);
    arr.push({ path, ts }); this.paths.set(key, arr);
    return new Set(arr.map((e) => e.path)).size;
  }
}

export class SecurityAgent {
  constructor(config = {}, store = new MemoryStore()) {
    this.cfg = { ...DEFAULTS, ...config, routeLimits: { ...DEFAULTS.routeLimits, ...(config.routeLimits || {}) } };
    this.store = store;
    this.onEvent = config.onEvent || null; // (event) => void  -> pipe to AuditLog
  }

  _now() { return (typeof performance !== 'undefined' && performance.now) ? Date.now() : Date.now(); }

  _identity(req) {
    const ip = req.ip || (req.headers && (req.headers['x-forwarded-for'] || '').split(',')[0].trim()) || 'unknown';
    const user = req.userId || (req.user && req.user.id) || 'anon';
    return `${ip}|${user}`;
  }

  _limitFor(path) {
    for (const prefix of Object.keys(this.cfg.routeLimits)) {
      if (path && path.startsWith(prefix)) return this.cfg.routeLimits[prefix];
    }
    return this.cfg.maxPerWindow;
  }

  _emit(ev) { if (this.onEvent) { try { this.onEvent(ev); } catch (_) {} } }

  /**
   * Inspect a request. Returns { action, score, reasons, retryAfterMs }.
   * action ∈ 'allow' | 'challenge' | 'block'.
   */
  inspect(req) {
    const ts = Date.now();
    const key = this._identity(req);
    const path = req.path || req.url || '';
    const reasons = [];

    // already blocked?
    const until = this.store.blockedUntil(key);
    if (until > ts) {
      this._emit({ type: 'blocked_hit', key, path, ts });
      return { action: 'block', score: this.cfg.blockThreshold, reasons: ['active-block'], retryAfterMs: until - ts };
    }

    let pts = 0;

    // 1) rate limit
    const count = this.store.pushHit(key, ts, this.cfg.windowMs);
    const limit = this._limitFor(path);
    if (count > limit) { pts += 25 + (count - limit) * 2; reasons.push(`rate:${count}/${limit}`); }

    // 2) payload anomaly
    const size = Number(req.bodySize || (req.headers && req.headers['content-length']) || 0);
    if (size > this.cfg.maxBodyBytes) { pts += 30; reasons.push(`oversize:${size}`); }

    // 3) auth failures (caller sets req.authFailed on 401s)
    if (req.authFailed) { pts += 20; reasons.push('auth-fail'); }

    // 4) enumeration / scanning
    const distinct = this.store.seenPath(key, path, ts, this.cfg.windowMs);
    if (distinct > this.cfg.enumerationWindow) { pts += 20; reasons.push(`enum:${distinct}`); }

    // 5) suspicious method/path
    if (/\.\.|\/etc\/|\/\.git|\bunion\b|<script|%00/i.test(decodeURIComponent(path))) {
      pts += 40; reasons.push('malicious-path');
    }

    const score = this.store.addThreat(key, pts, ts, this.cfg.decayMs);

    if (score >= this.cfg.blockThreshold) {
      const blockUntil = ts + this.cfg.blockTtlMs;
      this.store.block(key, blockUntil);
      this._emit({ type: 'auto_block', key, path, score, reasons, ts });
      return { action: 'block', score, reasons, retryAfterMs: this.cfg.blockTtlMs };
    }
    if (count > limit) {
      this._emit({ type: 'rate_limited', key, path, count, limit, ts });
      return { action: 'challenge', score, reasons, retryAfterMs: this.cfg.windowMs };
    }
    if (pts > 0) this._emit({ type: 'suspicious', key, path, score, reasons, ts });
    return { action: 'allow', score, reasons, retryAfterMs: 0 };
  }

  /** Express/Connect middleware. Blocks/limits before the handler runs. */
  middleware() {
    return (req, res, next) => {
      const verdict = this.inspect(req);
      res.setHeader && res.setHeader('X-Sec-Score', String(Math.round(verdict.score)));
      if (verdict.action === 'block') {
        res.statusCode = 403;
        res.setHeader && res.setHeader('Retry-After', Math.ceil(verdict.retryAfterMs / 1000));
        return res.end(JSON.stringify({ error: 'Request blocked by security agent', reasons: verdict.reasons }));
      }
      if (verdict.action === 'challenge') {
        res.statusCode = 429;
        res.setHeader && res.setHeader('Retry-After', Math.ceil(verdict.retryAfterMs / 1000));
        return res.end(JSON.stringify({ error: 'Rate limit exceeded', retryAfterMs: verdict.retryAfterMs }));
      }
      return next();
    };
  }
}

export { DEFAULTS };
