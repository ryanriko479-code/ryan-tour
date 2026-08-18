// ==========================================================
// stat-cards.js — stats cards (reusable for admin + guest dashboards)
// ==========================================================

/**
 * @param {{num:string|number, lbl:string, delta?:string}[]} stats
 */
export function renderStatCards(stats) {
  return `
  <div class="stat-cards">
    ${stats.map((s) => `
      <div class="stat-card glass">
        <div class="num">${s.num}</div>
        <div class="lbl">${s.lbl}</div>
        ${s.delta ? `<div class="delta">${s.delta}</div>` : ''}
      </div>`).join('')}
  </div>`;
}
