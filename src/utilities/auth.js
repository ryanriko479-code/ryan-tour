// ==========================================================
// auth.js — mock login, in-memory session management, role checks
// Session lives only in memory (per architecture Phase 1) — it resets
// on reload. Replace with JWT/token-based auth in Phase 2.
// ==========================================================

let currentUser = null; // { name, email, role: 'guest' | 'admin' }

export function getUser() {
  return currentUser;
}

export function isLoggedIn() {
  return currentUser !== null;
}

export function isGuest() {
  return currentUser?.role === 'guest';
}

export function isAdmin() {
  return currentUser?.role === 'admin';
}

/**
 * Mock login — in a real backend this would verify credentials against
 * the API. Here any non-empty email logs the guest in.
 */
export function login({ name, email, role = 'guest' }) {
  currentUser = { name, email, role };
  return currentUser;
}

export function loginAsDemoGuest() {
  return login({ name: 'Sarah Mwangi', email: 'sarah@example.com', role: 'guest' });
}

export function loginAsDemoAdmin() {
  return login({ name: 'Admin User', email: 'admin@ryantours.com', role: 'admin' });
}

export function register({ name, email }) {
  return login({ name, email, role: 'guest' });
}

export function logout() {
  currentUser = null;
}
