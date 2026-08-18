// ==========================================================
// header.js — navigation renderer (pure function, no side effects)
// ==========================================================

const NAV_ITEMS = [
  ['home', 'Home'],
  ['packages', 'Packages'],
  ['parks', 'Parks'],
  ['accommodations', 'Stays'],
  ['booking', 'Book Safari'],
];

/**
 * @param {string} activeRoute current hash route, e.g. "packages" or "admin/bookings"
 * @param {{name:string, email:string, role:string}|null} user
 */
export function renderHeader(activeRoute, user) {
  const top = activeRoute.split('/')[0];

  const userBlock = user
    ? `
    <div class="btn btn-glass btn-sm" data-nav="${user.role === 'admin' ? 'admin' : 'my-bookings'}">
      <span class="badge-role" style="background:transparent;padding:0;">●</span> ${user.name.split(' ')[0]}
    </div>
    <button class="btn btn-ghost btn-sm" data-action="logout">Log out</button>
  `
    : `
    <button class="btn btn-glass btn-sm" data-nav="login">Log in</button>
    <button class="btn btn-gold btn-sm" data-nav="register">Sign up</button>
  `;

  return `
  <header class="site">
    <div class="wrap">
      <div class="header-inner glass-strong">
        <a href="#/home" class="brand"><span class="mark">RT</span> Ryan Tours</a>
        <nav class="main">
          ${NAV_ITEMS.map(([r, l]) => `<a href="#/${r}" class="${top === r ? 'active' : ''}">${l}</a>`).join('')}
        </nav>
        <div class="header-actions">${userBlock}</div>
      </div>
    </div>
  </header>`;
}
