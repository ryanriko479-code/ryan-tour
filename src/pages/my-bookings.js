// ==========================================================
// my-bookings.js — guest dashboard: upcoming/past trips
// ==========================================================

import { fetchBookings, fetchPackages, fetchParks } from '../services/dataLoader.js';
import { renderStatCards } from '../components/admin/stat-cards.js';
import { bookingCard } from '../components/card.js';
import { money } from '../utilities/helpers.js';

const TODAY = '2026-08-04';

/** @param {{name:string, email:string, role:string}} user */
export async function renderMyBookings(user) {
  const [mineRaw, packages, parks] = await Promise.all([
    fetchBookings({ guestEmail: user.email }),
    fetchPackages(),
    fetchParks(),
  ]);
  // Demo fallback so the dashboard never looks empty for a freshly
  // logged-in email that has no seeded bookings.
  const mine = mineRaw.length ? mineRaw : await fetchBookings({ guestEmail: 'sarah@example.com' });

  const packagesById = Object.fromEntries(packages.map((p) => [p.id, p]));
  const parksById = Object.fromEntries(parks.map((p) => [p.id, p]));

  const upcoming = mine.filter((b) => new Date(b.startDate) >= new Date(TODAY) && b.status !== 'cancelled');
  const past = mine.filter((b) => new Date(b.startDate) < new Date(TODAY) || b.status === 'cancelled');

  const stats = renderStatCards([
    { num: mine.length, lbl: 'Total bookings' },
    { num: upcoming.length, lbl: 'Upcoming trips' },
    { num: mine.filter((b) => b.status === 'confirmed').length, lbl: 'Confirmed' },
    { num: money(mine.reduce((s, b) => s + b.totalPrice, 0)), lbl: 'Lifetime spend' },
  ]);

  return `
  <section class="section wrap">
    <div class="eyebrow">Guest dashboard</div>
    <h1 class="h2" style="margin-top:8px;">My bookings</h1>
    ${stats}

    <h3 class="h3" style="margin-top:10px;">Upcoming</h3>
    <div class="grid grid-2" style="margin-top:16px;">
      ${upcoming.map((b) => bookingCard(b, packagesById[b.packageId], parksById)).join('') || `<div class="empty-state">No upcoming trips yet. <a class="link-underline" href="#/booking">Plan one →</a></div>`}
    </div>

    ${past.length ? `
    <h3 class="h3" style="margin-top:34px;">Past &amp; cancelled</h3>
    <div class="grid grid-2" style="margin-top:16px;">
      ${past.map((b) => bookingCard(b, packagesById[b.packageId], parksById)).join('')}
    </div>` : ''}
  </section>`;
}
