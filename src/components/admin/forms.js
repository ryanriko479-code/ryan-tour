// ==========================================================
// forms.js — admin forms (add/edit packages/accommodations, settings)
// These are prototype stubs: markup is fully wired for layout, but
// submission just toasts until a real CRUD endpoint exists (see
// docs/api-contract.md).
// ==========================================================

import { money } from '../../utilities/helpers.js';

/** @param {object[]} packages */
export function renderPackagesGrid(packages) {
  return `
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
    <div class="h3" style="font-size:17px;">Pre-built packages</div>
    <button class="btn btn-gold btn-sm" data-action="admin-new-package">+ New package</button>
  </div>
  <div class="grid grid-3">
    ${packages.map((p) => `
      <div class="card glass">
        <div class="card-img" style="height:130px; background-image:url('${p.img}')"></div>
        <div class="card-body">
          <div class="card-title" style="font-size:15.5px;">${p.name}</div>
          <p style="font-size:12px;">${p.duration} days · ${money(p.price)}/person</p>
          <div class="card-foot">
            <span class="pill">★ ${p.rating}</span>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-glass btn-sm" data-action="admin-edit-package" data-id="${p.id}">Edit</button>
            </div>
          </div>
        </div>
      </div>`).join('')}
  </div>`;
}

export function renderSettingsForm() {
  return `
  <div class="glass" style="padding:28px; max-width:560px;">
    <div class="h3" style="font-size:17px; margin-bottom:20px;">General settings</div>
    <div class="field"><label>Currency</label><select><option>USD ($)</option><option>KES</option></select></div>
    <div class="field"><label>Contact WhatsApp number</label><input type="text" value="+254 700 000 000"></div>
    <div class="field"><label>Contact email</label><input type="text" value="info@ryantours.com"></div>
    <div class="field"><label>Default park entrance fee (USD)</label><input type="number" value="60"></div>
    <button class="btn btn-gold" data-action="admin-save-settings">Save settings</button>
  </div>`;
}
