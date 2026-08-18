// ==========================================================
// tables.js — table renderers (bookings, packages, accommodations)
// ==========================================================

import { money, fmtDate, tierLabel } from '../../utilities/helpers.js';

/**
 * Compact recent-bookings table for the overview tab.
 * @param {object[]} bookings  @param {Record<string,object>} packagesById
 */
export function renderRecentBookingsTable(bookings, packagesById) {
  return `
  <table>
    <thead><tr><th>ID</th><th>Guest</th><th>Trip</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
    <tbody>
      ${bookings.map((b) => `
        <tr>
          <td style="font-family:var(--font-mono); font-size:12px;">${b.id}</td>
          <td>${b.guestName}</td>
          <td>${b.mode === 'prebuilt' ? (packagesById[b.packageId]?.name || '—') : 'Custom safari'}</td>
          <td>${fmtDate(b.startDate)}</td>
          <td>${money(b.totalPrice)}</td>
          <td><span class="status-badge status-${b.status}">${b.status}</span></td>
        </tr>`).join('')}
    </tbody>
  </table>`;
}

/**
 * Full bookings management table with inline status editing.
 * @param {object[]} bookings  @param {Record<string,object>} packagesById  @param {Record<string,object>} parksById
 */
export function renderBookingsTable(bookings, packagesById, parksById) {
  if (!bookings.length) {
    return `<div class="empty-state">No bookings with this status.</div>`;
  }
  return `
  <table>
    <thead><tr><th>ID</th><th>Guest</th><th>Trip</th><th>Date</th><th>Guests</th><th>Total</th><th>Status</th><th></th></tr></thead>
    <tbody>
      ${bookings.map((b) => `
        <tr>
          <td style="font-family:var(--font-mono); font-size:12px;">${b.id}</td>
          <td>${b.guestName}<div style="font-size:11px; color:var(--ink-faint);">${b.guestEmail}</div></td>
          <td>${b.mode === 'prebuilt'
            ? (packagesById[b.packageId]?.name || '—')
            : 'Custom: ' + b.customDetails.parks.map((id) => (parksById[id]?.name || id).split(' ')[0]).join('+')}</td>
          <td>${fmtDate(b.startDate)}</td>
          <td>${b.groupSize}</td>
          <td>${money(b.totalPrice)}</td>
          <td><span class="status-badge status-${b.status}">${b.status}</span></td>
          <td>
            <select data-admin-status="${b.id}" style="padding:5px 8px; border-radius:7px; background:rgba(255,255,255,0.04); border:1px solid var(--glass-border); color:var(--ink); font-size:11.5px;">
              <option value="pending" ${b.status === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="confirmed" ${b.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
              <option value="cancelled" ${b.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
        </tr>`).join('')}
    </tbody>
  </table>`;
}

/** @param {object[]} accommodations  @param {Record<string,object>} parksById */
export function renderAccommodationsTable(accommodations, parksById) {
  return `
  <table>
    <thead><tr><th>Name</th><th>Park</th><th>Tier</th><th>Capacity</th><th>Price/night</th><th></th></tr></thead>
    <tbody>
      ${accommodations.map((a) => `
        <tr>
          <td>${a.name}</td>
          <td>${parksById[a.parkId]?.name || a.parkId}</td>
          <td><span class="pill">${tierLabel(a.tier)}</span></td>
          <td>${a.capacity}</td>
          <td>${money(a.price)}</td>
          <td><button class="btn btn-glass btn-sm" data-action="admin-edit-acc" data-id="${a.id}">Edit</button></td>
        </tr>`).join('')}
    </tbody>
  </table>`;
}
