// ==========================================================
// accommodations.js — lodges/camps with filters (park, tier, inside/outside)
// ==========================================================

import { fetchAccommodations, fetchParks } from '../services/dataLoader.js';
import { renderPageHero } from '../components/hero.js';
import { accommodationCard } from '../components/card.js';

const TIERS = ['all', 'budget', 'mid', 'luxury'];
const TIER_LABELS = { all: 'All tiers', budget: 'Budget', mid: 'Mid-range', luxury: 'Luxury' };

/** @param {string} activeTier 'all' | 'budget' | 'mid' | 'luxury' */
export async function renderAccommodations(activeTier = 'all') {
  const [list, parks] = await Promise.all([fetchAccommodations({ tier: activeTier }), fetchParks()]);
  const parksById = Object.fromEntries(parks.map((p) => [p.id, p]));

  return `
  <section class="section wrap">
    ${renderPageHero({
      eyebrow: 'Lodges &amp; camps',
      title: 'Accommodations',
      lead: 'Every stay is available inside packages or as part of a custom itinerary.',
    })}
    <div class="filter-bar glass" style="margin-top:26px;">
      ${TIERS.map((t) => `<div class="chip ${activeTier === t ? 'active' : ''}" data-filter-acc="${t}">${TIER_LABELS[t]}</div>`).join('')}
    </div>
    <div class="grid grid-4">
      ${list.map((a) => accommodationCard(a, parksById)).join('') || `<div class="empty-state">No accommodations at this tier.</div>`}
    </div>
  </section>`;
}
