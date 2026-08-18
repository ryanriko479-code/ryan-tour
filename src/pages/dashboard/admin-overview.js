// ==========================================================
// admin-overview.js — stats cards, recent bookings, revenue
// ==========================================================

import { fetchBookings, fetchPackages } from '../../services/dataLoader.js';
import { renderStatCards } from '../../components/admin/stat-cards.js';
import { renderRecentBookingsTable } from '../../components/admin/tables.js';
import { money } from '../../utilities/helpers.js';

const TODAY = '2026-08-04';

export async function renderAdminOverview() {
  const [bookings, packages] = await Promise.all([fetchBookings(), fetchPackages()]);
  const packagesById = Object.fromEntries(packages.map((p) => [p.id, p]));

  const total = bookings.length;
  const revenue = bookings.filter((b) => b.status !== 'cancelled').reduce((s, b) => s + b.totalPrice, 0);
  const pending = bookings.filter((b) => b.status === 'pending').length;
  const upcoming = bookings.filter((b) => new Date(b.startDate) >= new Date(TODAY) && b.status !== 'cancelled').length;
  const recent = [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  const stats = renderStatCards([
    { num: total, lbl: 'Total bookings', delta: '+3 this week' },
    { num: money(revenue), lbl: 'Gross revenue', delta: '+12% vs last month' },
    { num: pending, lbl: 'Awaiting confirmation' },
    { num: upcoming, lbl: 'Upcoming departures' },
  ]);

  return `
    ${stats}
    <div class="glass" style="padding:24px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <div class="h3" style="font-size:17px;">Recent bookings</div>
        <a href="#/admin/bookings" class="btn btn-glass btn-sm">View all →</a>
      </div>
      ${renderRecentBookingsTable(recent, packagesById)}
    </div>`;
}
