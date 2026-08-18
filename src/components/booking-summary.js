// ==========================================================
// booking-summary.js — booking summary renderer (pure functions)
// ==========================================================

import { money, tierLabel, transportLabel } from '../utilities/helpers.js';

/** @param {object} pkg  @param {Record<string,object>} parksById  @param {number} group */
export function renderPrebuiltSummary(pkg, parksById, group) {
  const total = pkg.price * group;
  return `
  <div class="glass-strong" style="padding:24px; position:sticky; top:110px;">
    <div class="card-img" style="height:130px; border-radius:12px; background-image:url('${pkg.img}'); margin-bottom:16px;"></div>
    <div class="card-title" style="font-size:17px;">${pkg.name}</div>
    <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px;">
      ${pkg.parks.map((id) => `<span class="pill">${(parksById[id]?.name || id).split(' ')[0]}</span>`).join('')}
    </div>
    <div class="divider"></div>
    <div style="display:flex; justify-content:space-between; font-size:13.5px; margin-bottom:8px;"><span>Per person</span><span>${money(pkg.price)}</span></div>
    <div style="display:flex; justify-content:space-between; font-size:13.5px; margin-bottom:8px;"><span>Group size</span><span>× ${group}</span></div>
    <div class="divider"></div>
    <div style="display:flex; justify-content:space-between; align-items:center;"><span style="font-family:var(--font-display); font-size:17px;">Total</span><span class="price" style="font-size:20px;">${money(total)}</span></div>
  </div>`;
}

/** @param {object} builder  @param {Record<string,object>} parksById  @param {number} total already-computed per-person estimate */
export function renderCustomSummary(builder, parksById, total) {
  return `
  <div class="glass-strong" style="padding:24px; position:sticky; top:110px;">
    <div class="h3" style="font-size:16px;">Your custom safari</div>
    <div class="divider"></div>
    <div style="font-size:13px; display:flex; flex-direction:column; gap:9px;">
      <div style="display:flex; justify-content:space-between;"><span>Parks</span><span style="text-align:right; max-width:60%;">${builder.parks.length ? builder.parks.map((id) => (parksById[id]?.name || id).split(' ')[0]).join(', ') : '—'}</span></div>
      <div style="display:flex; justify-content:space-between;"><span>Duration</span><span>${builder.days} days</span></div>
      <div style="display:flex; justify-content:space-between;"><span>Stay tier</span><span>${tierLabel(builder.accommodationTier)}</span></div>
      <div style="display:flex; justify-content:space-between;"><span>Transport</span><span>${transportLabel(builder.transport)}</span></div>
      <div style="display:flex; justify-content:space-between;"><span>Add-ons</span><span style="text-align:right; max-width:60%;">${builder.addOns.length ? builder.addOns.length + ' selected' : 'None'}</span></div>
    </div>
    <div class="divider"></div>
    <div style="display:flex; justify-content:space-between; align-items:center;"><span style="font-family:var(--font-display); font-size:17px;">Estimated total</span><span class="price" style="font-size:20px;">${money(total)}</span></div>
    <p class="center-note" style="text-align:left; margin-top:10px;">Estimate per person; final group price confirmed by your guide.</p>
  </div>`;
}
