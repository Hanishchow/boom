# Active Security Agent + E2EE

Runtime defenses for Célure AI's own backend (post-Base44). Two ESM modules, zero deps,
Web Crypto + in-memory. Tested in `security/_selftest.mjs` (`node security/_selftest.mjs`).

## Active Security Agent (`security/agent/`)

Watches live traffic and decides **allow / challenge / block** per request:

- **Rate limiting** — sliding window per identity (`ip|user`), with tighter per-route caps
  (e.g. `/api/analyze-skin` → 8/min since CNN inference is expensive).
- **Anomaly scoring** — oversize payloads, endpoint enumeration/scanning, auth failures,
  path traversal / injection markers (`../`, `union`, `<script`, `%00`).
- **Auto-blocking** — a decaying threat score; identities past the threshold are blocked
  for a TTL. Score decays (half-life) so honest users recover.

```js
import { SecurityAgent } from './security/agent/index.js';

const agent = new SecurityAgent({
  routeLimits: { '/api/analyze-skin': 8, '/api/auth': 10 },
  onEvent: (ev) => AuditLog.create(ev),   // pipe into your existing AuditLog entity
});

app.use(agent.middleware());              // Express/Connect: blocks/limits before handlers
// or, framework-free:
const verdict = agent.inspect({ ip, userId, path, bodySize, authFailed });
if (verdict.action !== 'allow') deny(verdict);
```

Production: swap `MemoryStore` for a Redis-backed store so limits/blocks are shared across
instances. The class takes a `store` as its 2nd constructor arg — implement the same methods.

## End-to-end encryption (`security/e2ee/`)

Hybrid envelope encryption so selfies/PII are encrypted in the browser and only the
analysis service can read them:

```js
import { generateRecipientKeypair, encryptFile, decrypt } from './security/e2ee/index.js';

// once, offline: create the analysis service keypair. PUBLIC key ships to the client;
// PRIVATE key lives ONLY in the isolated analysis service (never the web/API tier).
const { publicKeyB64, privateKeyB64 } = await generateRecipientKeypair();

// client, before upload:
const envelope = await encryptFile(selfieFile, publicKeyB64, { userId, kind: 'selfie' });
// -> { iv, wrappedKey, ciphertext, aad }  — safe to send/store; server can't read it.

// analysis service, in-memory only:
const bytes = await decrypt(envelope, privateKeyB64);   // run CNN, never persist plaintext
```

- **AES-256-GCM** for the payload (authenticated — tampering is rejected), data key
  **wrapped with RSA-OAEP-4096**. `aad` binds context (userId/kind) into the tag.
- **Trust boundary — read this.** True "server never sees plaintext" E2EE is impossible if
  the server must run the CNN on the image. This design gives E2EE-grade protection in
  transit and at rest, and confines plaintext to the isolated analysis service. For a
  server that is *truly* blind, run inference on-device instead.

## Roadmap
- Redis store + distributed blocklist; CAPTCHA/step-up on `challenge`.
- Key rotation + per-tenant recipient keys; consider envelope keys in a KMS/HSM.
- Feed agent events into the pipeline's report for a unified security view.
