// ==========================================================
// packages.js — all packages with filter + package detail drill-down
// ==========================================================

import { fetchPackages, fetchParks } from '../services/dataLoader.js';
import { renderPageHero } from '../components/hero.js';
import { packageCard } from '../components/card.js';
import { money, tierLabel, transportLabel } from '../utilities/helpers.js';
import { waLink } from '../utilities/channelLinks.js';

/** @param {string} activeFilter park id or 'all' */
export async function renderPackagesList(activeFilter = 'all') {
  const [packages, parks] = await Promise.all([fetchPackages({ parkId: activeFilter }), fetchParks()]);
  const parksById = Object.fromEntries(parks.map((p) => [p.id, p]));
  const allParkIds = ['all', ...new Set(parks.map((p) => p.id))];

  return `
  <section class="section wrap">
    ${renderPageHero({
      eyebrow: 'All routes',
      title: 'Pre-built safari packages',
      lead: 'Fixed itineraries with set pricing. Prefer to choose your own parks, nights, and add-ons? <a class="link-underline" href="#/booking">Use the custom builder</a> instead.',
    })}
    <div class="filter-bar glass" style="margin-top:26px;">
      ${allParkIds.map((f) => `
        <div class="chip ${activeFilter === f ? 'active' : ''}" data-filter-package="${f}">${f === 'all' ? 'All parks' : (parksById[f]?.name || f).split(' ')[0]}</div>
      `).join('')}
    </div>
    <div class="grid grid-3" id="packages-grid">
      ${packages.map((p) => packageCard(p, parksById)).join('') || `<div class="empty-state">No packages match this filter.</div>`}
    </div>
  </section>`;
}

export async function renderPackageDetail(id) {
  const [parks] = await Promise.all([fetchParks()]);
  const parksById = Object.fromEntries(parks.map((p) => [p.id, p]));
  const packages = await fetchPackages();
  const p = packages.find((pkg) => pkg.id === id);

  if (!p) return `<div class="wrap section"><div class="empty-state">Package not found.</div></div>`;

  return `
  <section class="section wrap">
    <button class="btn btn-ghost btn-sm" data-nav="packages">← Back to packages</button>
    <div class="glass" style="margin-top:20px; overflow:hidden;">
      <div style="height:280px; background-image:url('${p.img}'); background-size:cover; background-position:center; position:relative;">
        <div style="position:absolute; inset:0; background:linear-gradient(180deg, transparent 40%, rgba(19,21,23,0.85));"></div>
        <div style="position:absolute; bottom:24px; left:32px;">
          <div style="display:flex; gap:8px; margin-bottom:10px;">
            ${p.parks.map((id) => `<span class="pill glass-strong">${parksById[id]?.name || id}</span>`).join('')}
          </div>
          <h1 class="h2">${p.name}</h1>
        </div>
      </div>
      <div style="padding:32px; display:grid; grid-template-columns:1.6fr 1fr; gap:32px;">
        <div>
          <div style="display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap;">
            <span class="pill gold">${p.duration} days</span>
            <span class="pill">${tierLabel(p.accommodationTier)}</span>
            <span class="pill ${p.transport === 'jeep' ? 'green' : 'clay'}">${transportLabel(p.transport)}</span>
            <span class="pill">★ ${p.rating}</span>
          </div>
          <h3 class="h3">Itinerary</h3>
          <div class="divider"></div>
          <div style="display:flex; flex-direction:column; gap:14px;">
            ${p.itinerary.map((d, i) => `
              <div style="display:flex; gap:14px;">
                <div style="font-family:var(--font-mono); color:var(--gold-soft); font-size:13px; width:26px;">${String(i + 1).padStart(2, '0')}</div>
                <div style="font-size:14px; color:var(--ink-dim);">${d}</div>
              </div>`).join('')}
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-top:28px;">
            <div>
              <h4 style="font-family:var(--font-mono); font-size:12px; color:var(--ok); text-transform:uppercase; letter-spacing:0.5px;">Included</h4>
              <ul style="margin:10px 0 0; padding-left:18px; color:var(--ink-dim); font-size:13.5px; line-height:1.9;">
                ${p.included.map((i) => `<li>${i}</li>`).join('')}
              </ul>
            </div>
            <div>
              <h4 style="font-family:var(--font-mono); font-size:12px; color:#e6a89f; text-transform:uppercase; letter-spacing:0.5px;">Not included</h4>
              <ul style="margin:10px 0 0; padding-left:18px; color:var(--ink-dim); font-size:13.5px; line-height:1.9;">
                ${p.notIncluded.map((i) => `<li>${i}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>
        <div class="glass-strong" style="padding:24px; align-self:start; position:sticky; top:110px;">
          <div class="price" style="font-size:26px;">${money(p.price)} <small>/ person</small></div>
          <p style="font-size:12.5px; margin-top:6px;">Group discounts available on request.</p>
          <button class="btn btn-gold btn-block" style="margin-top:18px;" data-nav="booking" data-prefill-package="${p.id}">Book this package</button>
          <a class="btn btn-glass btn-block" style="margin-top:10px;" href="${waLink('Hi! I have a question about the ' + p.name + ' package.')}" target="_blank">Ask on WhatsApp</a>
        </div>
      </div>
    </div>
  </section>`;
}
