/**
 * Célure AI — end-to-end encryption for sensitive payloads (selfies + health PII).
 *
 * Model: hybrid envelope encryption.
 *   - A fresh AES-256-GCM data key encrypts the payload (fast, any size).
 *   - That data key is wrapped with the analysis service's RSA-OAEP public key.
 *   - The server stores {iv, wrappedKey, ciphertext}. Only the holder of the RSA
 *     PRIVATE key can unwrap the data key and read the payload.
 *
 * Trust boundary (be honest about it): true "the server never sees plaintext" E2EE is
 * impossible if the SERVER must run the CNN on the image. So the design is: the browser
 * encrypts before upload; the ciphertext is stored at rest encrypted; the private key
 * lives ONLY in the isolated analysis service, which decrypts in-memory, runs inference,
 * and never persists plaintext. Keep the private key out of the web/API tier. For real
 * client-only E2EE (server truly blind), run inference on-device instead.
 *
 * Isomorphic ESM: uses global Web Crypto (browser + Node 20+).
 */

const subtle = globalThis.crypto.subtle;
const getRandomValues = (arr) => globalThis.crypto.getRandomValues(arr);

// ---- base64 helpers (browser + Node) ---------------------------------------
export function bytesToB64(bytes) {
  if (typeof Buffer !== 'undefined') return Buffer.from(bytes).toString('base64');
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}
export function b64ToBytes(b64) {
  if (typeof Buffer !== 'undefined') return new Uint8Array(Buffer.from(b64, 'base64'));
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

// ---- recipient (analysis service) keypair ----------------------------------
export async function generateRecipientKeypair() {
  const kp = await subtle.generateKey(
    { name: 'RSA-OAEP', modulusLength: 4096, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    true,
    ['wrapKey', 'unwrapKey', 'encrypt', 'decrypt']
  );
  const pub = await subtle.exportKey('spki', kp.publicKey);
  const priv = await subtle.exportKey('pkcs8', kp.privateKey);
  return { publicKeyB64: bytesToB64(new Uint8Array(pub)), privateKeyB64: bytesToB64(new Uint8Array(priv)) };
}

async function importPublicKey(publicKeyB64) {
  return subtle.importKey('spki', b64ToBytes(publicKeyB64),
    { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['wrapKey', 'encrypt']);
}
async function importPrivateKey(privateKeyB64) {
  return subtle.importKey('pkcs8', b64ToBytes(privateKeyB64),
    { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['unwrapKey', 'decrypt']);
}

// ---- encrypt (client side) --------------------------------------------------
/**
 * Encrypt bytes for a recipient public key. Returns a JSON-serializable envelope.
 * @param {Uint8Array} plaintext  raw bytes (e.g. selfie file bytes)
 * @param {string} publicKeyB64   recipient RSA-OAEP public key (spki, base64)
 * @param {object|null} [aad]     optional associated data bound into the tag (not encrypted)
 */
export async function encrypt(plaintext, publicKeyB64, aad = null) {
  const pub = await importPublicKey(publicKeyB64);
  const dataKey = await subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  const iv = getRandomValues(new Uint8Array(12));
  const params = { name: 'AES-GCM', iv };
  if (aad) params.additionalData = new TextEncoder().encode(JSON.stringify(aad));
  const ct = await subtle.encrypt(params, dataKey, plaintext);
  const wrapped = await subtle.wrapKey('raw', dataKey, pub, { name: 'RSA-OAEP' });
  return {
    v: 1,
    alg: 'RSA-OAEP-4096+AES-256-GCM',
    iv: bytesToB64(iv),
    wrappedKey: bytesToB64(new Uint8Array(wrapped)),
    ciphertext: bytesToB64(new Uint8Array(ct)),
    aad: aad || undefined,
  };
}

// ---- decrypt (analysis service only) ---------------------------------------
export async function decrypt(envelope, privateKeyB64) {
  const priv = await importPrivateKey(privateKeyB64);
  const dataKey = await subtle.unwrapKey(
    'raw', b64ToBytes(envelope.wrappedKey), priv, { name: 'RSA-OAEP' },
    { name: 'AES-GCM', length: 256 }, false, ['decrypt']
  );
  const params = { name: 'AES-GCM', iv: b64ToBytes(envelope.iv) };
  if (envelope.aad) params.additionalData = new TextEncoder().encode(JSON.stringify(envelope.aad));
  const pt = await subtle.decrypt(params, dataKey, b64ToBytes(envelope.ciphertext));
  return new Uint8Array(pt);
}

// convenience: encrypt a browser File/Blob (selfie) -> envelope
export async function encryptFile(file, publicKeyB64, aad = null) {
  const buf = new Uint8Array(await file.arrayBuffer());
  return encrypt(buf, publicKeyB64, aad);
}
