// ==========================================================
// booking-form.js — booking form renderer (pure functions)
// ==========================================================

import { tierLabel } from '../utilities/helpers.js';

/**
 * Pre-built package booking form.
 * @param {object[]} packages
 * @param {string} selectedId
 */
export function renderPrebuiltForm(packages, selectedId) {
  return `
  <div class="glass" style="padding:26px;">
    <div class="field"><label>Select a package</label>
      <select id="pb-package">
        ${packages.map((p) => `<option value="${p.id}" ${selectedId === p.id ? 'selected' : ''}>${p.name} — $${p.price.toLocaleString()}/person</option>`).join('')}
      </select>
    </div>
    <div class="field-row">
      <div class="field"><label>Start date</label><input type="date" id="pb-date" min="2026-08-04" value="2026-09-01"></div>
      <div class="field"><label>Group size</label><input type="number" id="pb-group" min="1" value="2"></div>
    </div>
    <div class="field"><label>Full name</label><input type="text" id="pb-name" placeholder="Jane Wanjiru"></div>
    <div class="field-row">
      <div class="field"><label>Email</label><input type="email" id="pb-email" placeholder="jane@example.com"></div>
      <div class="field"><label>Phone</label><input type="tel" id="pb-phone" placeholder="+254 7XX XXX XXX"></div>
    </div>
    <div class="field"><label>Special requests (optional)</label><textarea id="pb-notes" placeholder="Dietary needs, celebrations, accessibility..."></textarea></div>
    <button class="btn btn-gold btn-block" id="pb-submit">Submit booking request</button>
    <p class="center-note">You'll be redirected to WhatsApp or email to confirm payment — no card details are collected here.</p>
  </div>`;
}

/**
 * Custom builder form — parks, duration, stay/transport, add-ons, guest details.
 * @param {object} opts
 * @param {object[]} opts.parks
 * @param {object[]} opts.addons
 * @param {object} opts.builder current in-progress selection state
 */
export function renderCustomForm({ parks, addons, builder }) {
  return `
  <div class="steps">
    <div class="step done">01 · Parks</div>
    <div class="step done">02 · Duration</div>
    <div class="step done">03 · Stay &amp; transport</div>
    <div class="step active">04 · Add-ons &amp; details</div>
  </div>
  <div class="glass" style="padding:26px;">
    <div class="field"><label>Select parks (choose one or more)</label></div>
    <div class="grid grid-2" style="gap:10px; margin-bottom:18px;">
      ${parks.map((pk) => `
        <label class="checkbox-card ${builder.parks.includes(pk.id) ? 'checked' : ''}">
          <input type="checkbox" data-custom-park="${pk.id}" ${builder.parks.includes(pk.id) ? 'checked' : ''}>
          <span style="font-size:13.5px;">${pk.name}</span>
        </label>`).join('')}
    </div>
    <div class="field-row">
      <div class="field"><label>Total days</label><input type="number" id="cb-days" min="2" max="14" value="${builder.days}"></div>
      <div class="field"><label>Start date</label><input type="date" id="cb-date" min="2026-08-04" value="2026-09-10"></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Accommodation tier</label>
        <select id="cb-tier">
          ${['budget', 'mid', 'luxury'].map((t) => `<option value="${t}" ${builder.accommodationTier === t ? 'selected' : ''}>${tierLabel(t)}</option>`).join('')}
        </select>
      </div>
      <div class="field"><label>Transport</label>
        <select id="cb-transport">
          <option value="jeep" ${builder.transport === 'jeep' ? 'selected' : ''}>4×4 Jeep</option>
          <option value="motorbike" ${builder.transport === 'motorbike' ? 'selected' : ''}>Adventure motorbike</option>
        </select>
      </div>
    </div>
    <div class="field"><label>Add-ons</label></div>
    <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:18px;">
      ${addons.map((a) => `
        <label class="checkbox-card ${builder.addOns.includes(a.id) ? 'checked' : ''}" style="justify-content:space-between;">
          <span style="display:flex; align-items:center; gap:10px;"><input type="checkbox" data-custom-addon="${a.id}" ${builder.addOns.includes(a.id) ? 'checked' : ''}><span style="font-size:13.5px;">${a.name}</span></span>
          <span style="font-size:12.5px; color:var(--ink-faint); font-family:var(--font-mono);">+$${a.price}</span>
        </label>`).join('')}
    </div>
    <div class="divider"></div>
    <div class="field"><label>Full name</label><input type="text" id="cb-name" placeholder="Jane Wanjiru"></div>
    <div class="field-row">
      <div class="field"><label>Email</label><input type="email" id="cb-email" placeholder="jane@example.com"></div>
      <div class="field"><label>Group size</label><input type="number" id="cb-group" min="1" value="2"></div>
    </div>
    <button class="btn btn-gold btn-block" id="cb-submit" ${builder.parks.length === 0 ? 'disabled' : ''}>Submit custom booking request</button>
    ${builder.parks.length === 0
      ? `<p class="center-note" style="color:#e6a89f;">Select at least one park to continue.</p>`
      : `<p class="center-note">You'll be redirected to WhatsApp or email to confirm payment.</p>`}
  </div>`;
}
