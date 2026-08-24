// ==========================================================
// auth.js — session state.
//
// Guests are a lightweight, CLIENT-SIDE pseudo-login: no password,
// no server account — just the name/email a visitor types into a
// booking form, kept around so "My bookings" has something to filter
// by. This matches how booking.js/register.js already work; nothing
// here changes that.
//
// Admins are real: POST /auth/login on the Worker checks the email
// + password against a hashed admin list and returns a signed
// session token (see api.js `login()`). That token is what gates
// `isAdmin()` — there's no client-side admin shortcut anymore.
//
// Session persists in localStorage so a refresh doesn't log you out.
// ==========================================================

const STORAGE_KEY = 'rt_session';

function readSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSession(session) {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage unavailable (private browsing, etc.) — session just won't persist
  }
}

/** @returns {{name:string, email:string, role:'guest'|'admin'}|null} */
export function getUser() {
  return readSession()?.user || null;
}

/** Signed session token from the Worker. Null for guests — they never had one. */
export function getToken() {
  return readSession()?.token || null;
}

export function isLoggedIn() {
  return !!getUser();
}

export function isGuest() {
  return getUser()?.role === 'guest';
}

export function isAdmin() {
  return getUser()?.role === 'admin' && !!getToken();
}

/** Client-side guest pseudo-login — no server call, no password. */
export function login({ name, email, role = 'guest' }) {
  const user = { name, email, role };
  writeSession({ user, token: null });
  return user;
}

/** Call after a successful POST /auth/login — stores the real admin session. */
export function loginWithSession(user, token) {
  writeSession({ user, token });
  return user;
}

export function loginAsDemoGuest() {
  return login({ name: 'Demo Guest', email: 'demo.guest@example.com', role: 'guest' });
}

/** Guest self-registration — same as login(), no server account (yet). */
export function register({ name, email }) {
  return login({ name, email, role: 'guest' });
}

export function logout() {
  writeSession(null);
}