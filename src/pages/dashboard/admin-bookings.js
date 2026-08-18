// ==========================================================
// admin-bookings.js — bookings table with filters & status updates
// ==========================================================

import { fetchBookings, fetchPackages, fetchParks } from '../../services/dataLoader.js';
import { renderBookingsTable } from '../../components/admin/tables.js';

const FILTERS = ['all', 'pending', 'confirmed', 'cancelled'];

/** @param {string} activeFilter */
export async function renderAdminBookings(activeFilter = 'all') {
  const [bookings, packages, parks] = await Promise.all([
    fetchBookings({ status: activeFilter }),
    fetchPackages(),
    fetchParks(),
  ]);
  const packagesById = Object.fromEntries(packages.map((p) => [p.id, p]));
  const parksById = Object.fromEntries(parks.map((p) => [p.id, p]));

  return `
    <div class="filter-bar glass" style="margin-bottom:0;">
      ${FILTERS.map((f) => `<div class="chip ${activeFilter === f ? 'active' : ''}" data-filter-admin-booking="${f}">${f[0].toUpperCase() + f.slice(1)}</div>`).join('')}
    </div>
    <div class="glass" style="padding:24px; margin-top:20px;">
      ${renderBookingsTable(bookings, packagesById, parksById)}
    </div>`;
}
