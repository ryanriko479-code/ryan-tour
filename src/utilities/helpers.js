// ==========================================================
// helpers.js — DOM query helpers, formatting, toast notifications
// No dependencies on other modules.
// ==========================================================

export function $(sel, root = document) {
  return root.querySelector(sel);
}

export function $all(sel, root = document) {
  return [...root.querySelectorAll(sel)];
}

export function money(n) {
  return '$' + Number(n).toLocaleString('en-US');
}

export function fmtDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function tierLabel(t) {
  return { budget: 'Budget', mid: 'Mid-range', luxury: 'Luxury' }[t] || t;
}

export function transportLabel(t) {
  return { jeep: '4×4 Jeep', motorbike: 'Motorbike' }[t] || t;
}

let toastTimer = null;

/**
 * Renders a transient toast into #toast-root.
 * @param {string} msg
 * @param {'ok'|'err'} kind
 */
export function toast(msg, kind = 'ok') {
  const root = $('#toast-root');
  if (!root) return;
  root.innerHTML = `<div class="toast glass-strong show" style="border-color:${
    kind === 'ok' ? 'rgba(113,146,111,0.4)' : 'rgba(193,89,79,0.4)'
  }">
    <span style="font-size:16px">${kind === 'ok' ? '✓' : '!'}</span>
    <span style="font-size:13.5px;color:var(--ink)">${msg}</span></div>`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    const t = $('.toast');
    if (t) t.classList.remove('show');
  }, 3200);
}
