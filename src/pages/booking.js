// ==========================================================
// booking.js — dual-mode form (pre-built package OR custom builder)
// Composes components/booking-form.js + booking-summary.js.
// Live summary re-renders are triggered from app.js on input events.
// ==========================================================

import { fetchPackages, fetchParks, fetchAddons } from '../services/dataLoader.js';
import { renderPrebuiltForm, renderCustomForm } from '../components/booking-form.js';
import { renderPrebuiltSummary, renderCustomSummary } from '../components/booking-summary.js';
import { calcCustomPricePerPerson } from '../utilities/booking.js';

/**
 * @param {'prebuilt'|'custom'} mode
 * @param {object} opts
 * @param {string} [opts.selectedPackageId]
 * @param {object} [opts.builder] custom builder draft state
 */
export async function renderBooking(mode, opts = {}) {
  const toggle = `
    <div class="toggle-group" style="margin-top:22px; width:fit-content;">
      <button class="${mode === 'prebuilt' ? 'active' : ''}" data-booking-mode="prebuilt">Pre-built package</button>
      <button class="${mode === 'custom' ? 'active' : ''}" data-booking-mode="custom">Build your own</button>
    </div>`;

  let body;
  if (mode === 'custom') {
    body = await renderCustomBody(opts.builder);
  } else {
    body = await renderPrebuiltBody(opts.selectedPackageId);
  }

  return `
  <section class="section wrap">
    <div class="eyebrow">Book your safari</div>
    <h1 class="h2" style="margin-top:8px;">Choose how you want to travel</h1>
    ${toggle}
    <div style="margin-top:30px;">${body}</div>
  </section>`;
}

async function renderPrebuiltBody(selectedId) {
  const packages = await fetchPackages();
  const id = selectedId || packages[0].id;
  return `
  <div style="display:grid; grid-template-columns:1.3fr 1fr; gap:28px; align-items:start;">
    ${renderPrebuiltForm(packages, id)}
    <div id="pb-summary"></div>
  </div>`;
}

async function renderCustomBody(builder) {
  const [parks, addons] = await Promise.all([fetchParks(), fetchAddons()]);
  return `
  <div style="display:grid; grid-template-columns:1.3fr 1fr; gap:28px; align-items:start;">
    ${renderCustomForm({ parks, addons, builder })}
    <div id="cb-summary"></div>
  </div>`;
}

/** Re-renders just the pre-built summary panel (called on select/group change). */
export async function refreshPrebuiltSummary(packageId, group) {
  const packages = await fetchPackages();
  const parks = await fetchParks();
  const parksById = Object.fromEntries(parks.map((p) => [p.id, p]));
  const pkg = packages.find((p) => p.id === packageId) || packages[0];
  return renderPrebuiltSummary(pkg, parksById, group);
}

/** Re-renders just the custom summary panel (called on any builder field change). */
export async function refreshCustomSummary(builder) {
  const [parks, addons] = await Promise.all([fetchParks(), fetchAddons()]);
  const parksById = Object.fromEntries(parks.map((p) => [p.id, p]));
  const total = calcCustomPricePerPerson(builder, addons);
  return renderCustomSummary(builder, parksById, total);
}
