// ==========================================================
// admin-accommodations.js — manage lodges/camps
// ==========================================================

import { fetchAccommodations, fetchParks } from '../../services/dataLoader.js';
import { renderAccommodationsTable } from '../../components/admin/tables.js';

export async function renderAdminAccommodations() {
  const [accommodations, parks] = await Promise.all([fetchAccommodations(), fetchParks()]);
  const parksById = Object.fromEntries(parks.map((p) => [p.id, p]));

  return `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
      <div class="h3" style="font-size:17px;">Accommodations</div>
      <button class="btn btn-gold btn-sm" data-action="admin-new-acc">+ New accommodation</button>
    </div>
    <div class="glass" style="padding:24px;">
      ${renderAccommodationsTable(accommodations, parksById)}
    </div>`;
}
