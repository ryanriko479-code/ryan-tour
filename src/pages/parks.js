// ==========================================================
// parks.js — park overview + drill-down into each park
// ==========================================================

import { fetchParks, fetchAccommodations, fetchPackages, fetchReviews } from '../services/dataLoader.js';
import { renderPageHero } from '../components/hero.js';
import { parkCardWide } from '../components/card.js';
import { money } from '../utilities/helpers.js';

export async function renderParksList() {
  const parks = await fetchParks();
  return `
  <section class="section wrap">
    ${renderPageHero({
      eyebrow: 'Field guide',
      title: 'National parks &amp; reserves',
      lead: 'Every itinerary — pre-built or custom — draws from these four landscapes.',
    })}
    <div class="grid grid-2" style="margin-top:30px;">
      ${parks.map(parkCardWide).join('')}
    </div>
  </section>`;
}

export async function renderParkDetail(id) {
  const [parks, allPackages, stays, reviews] = await Promise.all([
    fetchParks(),
    fetchPackages(),
    fetchAccommodations({ parkId: id }),
    fetchReviews({ parkId: id }),
  ]);
  const pk = parks.find((p) => p.id === id);
  if (!pk) return `<div class="wrap section"><div class="empty-state">Park not found.</div></div>`;

  const pkgs = allPackages.filter((p) => p.parks.includes(id));

  return `
  <section class="section wrap">
    <button class="btn btn-ghost btn-sm" data-nav="parks">← Back to parks</button>
    <div style="margin-top:20px; border-radius:18px; overflow:hidden; height:300px; background-image:url('${pk.img}'); background-size:cover; background-position:center; position:relative;">
      <div style="position:absolute; inset:0; background:linear-gradient(180deg, transparent 30%, rgba(19,21,23,0.9));"></div>
      <div style="position:absolute; bottom:24px; left:32px;">
        <div class="coord" style="color:#fff; opacity:0.8;">${pk.coord}</div>
        <h1 class="h2" style="margin-top:6px;">${pk.name}</h1>
      </div>
    </div>
    <div style="display:grid; grid-template-columns:1.6fr 1fr; gap:28px; margin-top:28px;">
      <div>
        <p style="font-size:15px;">${pk.description}</p>
        <div class="grid grid-2" style="margin-top:22px; gap:14px;">
          <div class="glass" style="padding:16px;"><div class="eyebrow">Best time</div><div class="h3" style="font-size:18px; margin-top:6px;">${pk.bestTime}</div></div>
          <div class="glass" style="padding:16px;"><div class="eyebrow">Entrance fee</div><div class="h3" style="font-size:18px; margin-top:6px;">${money(pk.entranceFee)}/day</div></div>
        </div>
        <h4 style="font-family:var(--font-mono); font-size:12px; text-transform:uppercase; letter-spacing:0.5px; color:var(--ink-faint); margin-top:26px;">Highlights</h4>
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:10px;">${pk.highlights.map((h) => `<span class="pill gold">${h}</span>`).join('')}</div>
        <h4 style="font-family:var(--font-mono); font-size:12px; text-transform:uppercase; letter-spacing:0.5px; color:var(--ink-faint); margin-top:22px;">Wildlife</h4>
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:10px;">${pk.wildlife.map((h) => `<span class="pill">${h}</span>`).join('')}</div>

        ${reviews.length ? `
        <h4 style="font-family:var(--font-mono); font-size:12px; text-transform:uppercase; letter-spacing:0.5px; color:var(--ink-faint); margin-top:30px;">Guest reviews</h4>
        <div style="display:flex; flex-direction:column; gap:10px; margin-top:12px;">
          ${reviews.map((r) => `<div class="glass" style="padding:14px 16px;"><div style="font-size:13.5px; color:var(--ink);">"${r.comment}"</div><div style="font-size:11.5px; color:var(--ink-faint); margin-top:6px;">${r.guestName} · ★${r.rating}</div></div>`).join('')}
        </div>` : ''}
      </div>
      <div class="glass-strong" style="padding:22px; align-self:start; position:sticky; top:110px;">
        <div class="h3" style="font-size:16px;">Stay here</div>
        <div style="display:flex; flex-direction:column; gap:10px; margin-top:14px;">
          ${stays.slice(0, 3).map((a) => `<div style="display:flex; justify-content:space-between; align-items:center; font-size:13px;"><span>${a.name}</span><span class="price" style="font-size:13px;">${money(a.price)}/night</span></div>`).join('')}
        </div>
        <button class="btn btn-glass btn-block" style="margin-top:16px;" data-nav="accommodations">All stays →</button>
        <div class="divider"></div>
        <div class="h3" style="font-size:16px;">Packages including this park</div>
        <div style="display:flex; flex-direction:column; gap:10px; margin-top:14px;">
          ${pkgs.map((p) => `<div style="display:flex; justify-content:space-between; align-items:center; font-size:13px; cursor:pointer;" data-nav="package-detail" data-id="${p.id}"><span>${p.name}</span><span class="price" style="font-size:13px;">${money(p.price)}</span></div>`).join('') || '<div style="font-size:12.5px; color:var(--ink-faint);">None yet — try the custom builder.</div>'}
        </div>
        <button class="btn btn-gold btn-block" style="margin-top:16px;" data-nav="booking">Build a safari here</button>
      </div>
    </div>
  </section>`;
}
