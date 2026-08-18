// ==========================================================
// router.js — hash parsing, navigation, change subscription
// ==========================================================

const listeners = new Set();

export function parseHash() {
  return location.hash.replace(/^#\/?/, '') || 'home';
}

export function currentRoute() {
  return parseHash();
}

/** Programmatic navigation — pushes a new hash. */
export function navigate(route) {
  location.hash = '#/' + route;
}

/**
 * Subscribe to route changes. Returns an unsubscribe function.
 * @param {(route:string) => void} callback
 */
export function onRouteChange(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

window.addEventListener('hashchange', () => {
  const route = parseHash();
  listeners.forEach((cb) => cb(route));
});
