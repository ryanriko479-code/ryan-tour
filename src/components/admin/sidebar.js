// ==========================================================
// sidebar.js — admin sidebar navigation (pure function)
// ==========================================================

const TABS = [
  ['overview', 'Overview'],
  ['bookings', 'Bookings'],
  ['packages', 'Packages'],
  ['accommodations', 'Accommodations'],
  ['settings', 'Settings'],
];

/** @param {string} activeSub current admin sub-route, e.g. "bookings" */
export function renderAdminSidebar(activeSub) {
  return `
  <div class="dash-sidebar glass">
    ${TABS.map(([r, l]) => `<a href="#/admin/${r}" class="${activeSub === r ? 'active' : ''}">${l}</a>`).join('')}
  </div>`;
}
