// ==========================================================
// admin-shell.js — admin layout wrapper (pure function)
// ==========================================================

import { renderAdminSidebar } from './sidebar.js';

/**
 * @param {string} activeSub current admin sub-route
 * @param {string} contentHtml already-rendered content for the active tab
 */
export function renderAdminShell(activeSub, contentHtml) {
  return `
  <section class="section wrap">
    <div class="eyebrow">Admin</div>
    <h1 class="h2" style="margin-top:8px;">Operations dashboard</h1>
    <div class="dash-layout" style="margin-top:26px;">
      ${renderAdminSidebar(activeSub)}
      <div>${contentHtml}</div>
    </div>
  </section>`;
}
