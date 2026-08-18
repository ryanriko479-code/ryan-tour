// ==========================================================
// card.js — card renderer with variants (pure functions, no side effects)
// variant: 'package' | 'park' | 'accommodation' | 'booking'
// ==========================================================

import { money, fmtDate, tierLabel, transportLabel } from '../utilities/helpers.js';
import { waLink } from '../utilities/channelLinks.js';

function shortParkName(name) {
  return name.split(' ')[0];
}

/** @param {object} pkg  @param {Record<string,object>} parksById */
export function packageCard(pkg, parksById) {
  return `
  <div class="card glass" data-nav="package-detail" data-id="${pkg.id}" style="cursor:pointer;">
    <div class="card-img" style="background-image:url('${pkg.img}')">
      <div class="tag glass-strong">${pkg.duration} days</div>
    </div>
    <div class="card-body">
      <div class="card-title">${pkg.name}</div>
      <div style="display:flex; gap:6px; flex-wrap:wrap;">
        ${pkg.parks.map((id) => `<span class="pill">${shortParkName(parksById[id]?.name || id)}</span>`).join('')}
        <span class="pill ${pkg.transport === 'jeep' ? 'green' : 'clay'}">${transportLabel(pkg.transport)}</span>
      </div>
      <p style="font-size:13px;">${tierLabel(pkg.accommodationTier)} accommodation · ★ ${pkg.rating}</p>
      <div class="card-foot">
        <div class="price">${money(pkg.price)} <small>/ person</small></div>
        <span class="btn btn-glass btn-sm">Details</span>
      </div>
    </div>
  </div>`;
}

/** @param {object} park */
export function parkCard(park) {
  return `
  <div class="card glass" data-nav="park-detail" data-id="${park.id}" style="cursor:pointer;">
    <div class="card-img" style="background-image:url('${park.img}')"><div class="tag glass-strong">${park.entranceFee ? '$' + park.entranceFee + ' entry' : ''}</div></div>
    <div class="card-body">
      <div class="coord">${park.coord}</div>
      <div class="card-title" style="font-size:16.5px;">${park.name}</div>
      <p style="font-size:12.5px;">${park.location}</p>
      <div class="card-foot" style="border:none; padding-top:6px;">
        <span class="pill gold">Best: ${park.bestTime}</span>
      </div>
    </div>
  </div>`;
}

/** Larger park card used on the parks listing page. */
export function parkCardWide(park) {
  return `
  <div class="card glass" style="cursor:pointer;" data-nav="park-detail" data-id="${park.id}">
    <div class="card-img" style="height:210px; background-image:url('${park.img}')"><div class="tag glass-strong">${park.coord}</div></div>
    <div class="card-body">
      <div class="card-title">${park.name}</div>
      <p style="font-size:13.5px;">${park.description}</p>
      <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:4px;">
        ${park.wildlife.slice(0, 4).map((w) => `<span class="pill">${w}</span>`).join('')}
      </div>
      <div class="card-foot">
        <span class="pill gold">Best: ${park.bestTime}</span>
        <span class="btn btn-glass btn-sm">Explore →</span>
      </div>
    </div>
  </div>`;
}

/** @param {object} acc  @param {Record<string,object>} parksById */
export function accommodationCard(acc, parksById) {
  return `
  <div class="card glass">
    <div class="card-img" style="background-image:url('${acc.img}')"><div class="tag glass-strong">${tierLabel(acc.tier)}</div></div>
    <div class="card-body">
      <div class="card-title" style="font-size:16.5px;">${acc.name}</div>
      <p style="font-size:12.5px;">${parksById[acc.parkId]?.name || acc.parkId} · ${acc.location === 'inside' ? 'Inside park' : 'Outside park'}</p>
      <div style="display:flex; gap:6px; flex-wrap:wrap;">${acc.amenities.slice(0, 2).map((m) => `<span class="pill">${m}</span>`).join('')}</div>
      <div class="card-foot">
        <div class="price">${money(acc.price)} <small>/ night</small></div>
        <span class="btn btn-glass btn-sm" data-nav="booking">Add to trip</span>
      </div>
    </div>
  </div>`;
}

/**
 * Guest-dashboard booking card.
 * @param {object} booking  @param {object|null} pkg  @param {Record<string,object>} parksById
 */
export function bookingCard(booking, pkg, parksById) {
  const title = booking.mode === 'prebuilt'
    ? pkg?.name || 'Package'
    : `Custom: ${booking.customDetails.parks.map((id) => shortParkName(parksById[id]?.name || id)).join(' + ')}`;

  return `
  <div class="glass" style="padding:20px;">
    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
      <div>
        <div class="coord">${booking.id}</div>
        <div class="card-title" style="font-size:16.5px; margin-top:4px;">${title}</div>
      </div>
      <span class="status-badge status-${booking.status}">${booking.status}</span>
    </div>
    <div style="display:flex; gap:14px; margin-top:12px; font-size:12.5px; color:var(--ink-faint);">
      <span>📅 ${fmtDate(booking.startDate)}</span>
      <span>👥 ${booking.groupSize} guests</span>
    </div>
    <div class="card-foot">
      <div class="price" style="font-size:16px;">${money(booking.totalPrice)}</div>
      <div style="display:flex; gap:8px;">
        <a class="btn btn-glass btn-sm" href="${waLink('Hi! Question about booking ' + booking.id)}" target="_blank">Contact guide</a>
      </div>
    </div>
  </div>`;
}
