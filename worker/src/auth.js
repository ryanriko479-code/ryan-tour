// ==========================================================
// auth.js — admin authentication for the Worker.
//
// There is no user-facing password database: ADMIN_CREDENTIALS is a
// short, hand-maintained list of admin logins, stored as a Worker
// secret (never committed, never in the repo). Passwords are never
// stored in plaintext — only their SHA-256 hash — and are hashed
// again on every login attempt for comparison. See
// scripts/hash-password.mjs to generate a hash for a new password.
//
// Guests are NOT covered by this file. Guest "login" stays the
// lightweight, no-password, client-side identify-by-email flow the
// app already has — only admin actions need real verification,
// because only admin actions can mutate data across every guest's
// bookings.
// ==========================================================

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

class AuthError extends Error {
  constructor(message, status = 401) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Constant-time-ish string compare — avoids short-circuiting on first mismatch. */
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function base64url(bytes) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function base64urlToBytes(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(str.length + ((4 - (str.length % 4)) % 4), '=');
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

async function hmacKey(secret) {
  return crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

async function sign(payloadObj, secret) {
  const payload = base64url(new TextEncoder().encode(JSON.stringify(payloadObj)));
  const key = await hmacKey(secret);
  const sigBytes = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload)));
  return `${payload}.${base64url(sigBytes)}`;
}

async function verify(token, secret) {
  const [payload, sig] = token.split('.');
  if (!payload || !sig) throw new AuthError('Malformed token');
  const key = await hmacKey(secret);
  const valid = await crypto.subtle.verify('HMAC', key, base64urlToBytes(sig), new TextEncoder().encode(payload));
  if (!valid) throw new AuthError('Invalid token signature');
  const decoded = JSON.parse(new TextDecoder().decode(base64urlToBytes(payload)));
  if (!decoded.exp || decoded.exp < Date.now()) throw new AuthError('Session expired');
  return decoded;
}

/**
 * @param {{email:string, password:string}} credentials
 * @param {object} env Worker environment (needs ADMIN_CREDENTIALS, SESSION_SECRET)
 * @returns {Promise<{token:string, user:{name:string, email:string, role:'admin'}}>}
 */
export async function loginAdmin({ email, password }, env) {
  if (!email || !password) throw new AuthError('Email and password are required', 400);

  let admins;
  try {
    admins = JSON.parse(env.ADMIN_CREDENTIALS || '[]');
  } catch {
    throw new AuthError('Server misconfigured: ADMIN_CREDENTIALS is not valid JSON', 500);
  }

  const match = admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
  // Hash the attempt even on a missing-email match, so response timing
  // doesn't reveal which emails exist.
  const attemptHash = await sha256Hex(password);
  if (!match || !safeEqual(attemptHash, match.passwordHash)) {
    throw new AuthError('Invalid email or password');
  }

  const exp = Date.now() + TOKEN_TTL_MS;
  const token = await sign({ email: match.email, role: 'admin', exp }, env.SESSION_SECRET);
  return { token, user: { name: match.name || 'Admin', email: match.email, role: 'admin' } };
}

/**
 * Reads the Authorization header, verifies the session token, and
 * returns the decoded admin identity. Throws AuthError (401) if
 * missing/invalid/expired — callers should catch and respond 401.
 */
export async function requireAdmin(request, env) {
  const header = request.headers.get('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new AuthError('Missing Authorization header');
  const decoded = await verify(token, env.SESSION_SECRET);
  if (decoded.role !== 'admin') throw new AuthError('Admin role required', 403);
  return decoded;
}

export { AuthError };
