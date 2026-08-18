// ==========================================================
// home.js — landing page (hero, featured packages, park highlights)
// ==========================================================

import { fetchPackages, fetchParks, fetchReviews } from '../services/dataLoader.js';
import { renderHomeHero } from '../components/hero.js';
import { packageCard, parkCard } from '../components/card.js';

export async function renderHome() {
  const [packages, parks] = await Promise.all([fetchPackages(), fetchParks()]);
  const parksById = Object.fromEntries(parks.map((p) => [p.id, p]));
  const featured = packages.slice(0, 3);
  const reviews = await fetchReviews({ parkId: parks[1].id });
  const review = reviews[0];

  return `
  ${renderHomeHero({ packagesCount: packages.length, featuredPark: parks[1] })}

  <section class="section wrap">
    <div class="section-head">
      <div>
        <div class="eyebrow">Signature routes</div>
        <h2 class="h2" style="margin-top:8px;">Featured packages</h2>
      </div>
      <button class="btn btn-glass btn-sm" data-nav="packages">View all packages →</button>
    </div>
    <div class="grid grid-3">
      ${featured.map((p) => packageCard(p, parksById)).join('')}
    </div>
  </section>

  <section class="section wrap" style="padding-top:0;">
    <div class="section-head">
      <div>
        <div class="eyebrow">Where you'll go</div>
        <h2 class="h2" style="margin-top:8px;">The four parks</h2>
      </div>
      <button class="btn btn-glass btn-sm" data-nav="parks">Explore parks →</button>
    </div>
    <div class="grid grid-4">
      ${parks.map(parkCard).join('')}
    </div>
  </section>

  ${review ? `
  <section class="section wrap" style="padding-top:0;">
    <div class="glass-strong" style="padding:40px; display:flex; justify-content:space-between; align-items:center; gap:24px; flex-wrap:wrap;">
      <div>
        <div class="eyebrow">Guest voices</div>
        <h3 class="h3" style="margin-top:8px; max-width:520px;">"${review.comment}"</h3>
        <p style="margin-top:10px; font-size:13px;">— ${review.guestName}, ${parksById[review.parkId]?.name || ''}</p>
      </div>
      <button class="btn btn-gold" data-nav="booking">Start planning</button>
    </div>
  </section>` : ''}
  `;
}
