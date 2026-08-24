// ==========================================================
// index.js — Worker entry point. Routes /api/v1/* requests, talks to
// Airtable via airtable-client.js, shapes responses via transform.js,
// and gates admin-only actions via auth.js.
//
// This is the ONLY thing standing between the public internet and
// your Airtable token — see docs/deployment.md in the main repo for
// why that separation exists.
// ==========================================================

import { TABLES, FIELDS } from './airtable-schema.js';
import { listAllRecords, getRecord, createRecord, updateRecord, AirtableError } from './airtable-client.js';
import {
  parkFromRecord, accommodationFromRecord, packageFromRecord, formatItinerary,
  addonFromRecord, reviewFromRecord, bookingFromRecord,
} from './transform.js';
import { loginAdmin, requireAdmin, AuthError } from './auth.js';

/* ---------------- CORS ---------------- */

function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function json(data, { status = 200, env } = {}) {
  return new Response(JSON.stringify({ data }), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(env) },
  });
}

function errorJson(message, { status = 500, env } = {}) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(env) },
  });
}

/* ---------------- Shared lookups (fetched once per request, as needed) ---------------- */

async function buildParksIndex(env) {
  const records = await listAllRecords(env.AIRTABLE_TOKEN, TABLES.PARKS);
  const parks = records.map(parkFromRecord);
  const byRecordId = new Map(parks.map((p) => [p._recordId, p]));
  const bySlug = new Map(parks.map((p) => [p.id, p]));
  return { parks, byRecordId, bySlug };
}

async function buildPackagesIndex(env) {
  const records = await listAllRecords(env.AIRTABLE_TOKEN, TABLES.PACKAGES);
  const { byRecordId: parksByRecordId } = await buildParksIndex(env);
  const packages = records.map((r) => packageFromRecord(r, parksByRecordId));
  const byRecordId = new Map(records.map((r, i) => [r.id, packages[i]]));
  const bySlug = new Map(packages.map((p) => [p.id, p]));
  return { packages, byRecordId, bySlug, parksByRecordId };
}

async function buildAddonsIndex(env) {
  const records = await listAllRecords(env.AIRTABLE_TOKEN, TABLES.ADDONS);
  const addons = records.map(addonFromRecord);
  const byRecordId = new Map(addons.map((a) => [a.id, a])); // addon id === recordId
  return { addons, byRecordId };
}

async function buildUsersIndex(env) {
  const records = await listAllRecords(env.AIRTABLE_TOKEN, TABLES.USERS);
  const users = records.map((r) => ({ recordId: r.id, name: r.fields[FIELDS.USERS.NAME], email: r.fields[FIELDS.USERS.EMAIL] }));
  const byRecordId = new Map(users.map((u) => [u.recordId, u]));
  const byEmail = new Map(users.map((u) => [(u.email || '').toLowerCase(), u]));
  return { users, byRecordId, byEmail };
}

/** Finds a Users record by email, or creates one (role defaults to Guest). */
async function findOrCreateUser(env, { name, email }) {
  const { byEmail } = await buildUsersIndex(env);
  const existing = byEmail.get(email.toLowerCase());
  if (existing) return existing.recordId;

  const created = await createRecord(env.AIRTABLE_TOKEN, TABLES.USERS, {
    [FIELDS.USERS.NAME]: name,
    [FIELDS.USERS.EMAIL]: email,
    [FIELDS.USERS.ROLE]: 'Guest',
  });
  return created.id;
}

async function nextBookingId(env) {
  const records = await listAllRecords(env.AIRTABLE_TOKEN, TABLES.BOOKINGS);
  const nums = records
    .map((r) => r.fields[FIELDS.BOOKINGS.BOOKING_ID])
    .map((id) => parseInt((id || '').replace('BK-', ''), 10))
    .filter((n) => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : 1000;
  return `BK-${max + 1}`;
}

/* ---------------- Route handlers ---------------- */

const routes = [];
function route(method, pattern, handler) {
  routes.push({ method, regex: pathToRegex(pattern), handler });
}
function pathToRegex(pattern) {
  return new RegExp('^' + pattern.replace(/:[^/]+/g, '([^/]+)') + '$');
}

route('GET', '/parks', async ({ env }) => {
  const { parks } = await buildParksIndex(env);
  return parks.map(stripInternal);
});

route('GET', '/parks/:id', async ({ env, params }) => {
  const { bySlug } = await buildParksIndex(env);
  const park = bySlug.get(params[0]);
  if (!park) throw new HttpError('Park not found', 404);
  return stripInternal(park);
});

route('GET', '/accommodations', async ({ env, query }) => {
  const { byRecordId: parksByRecordId, bySlug: parksBySlug } = await buildParksIndex(env);
  const records = await listAllRecords(env.AIRTABLE_TOKEN, TABLES.ACCOMMODATIONS);
  let list = records.map((r) => accommodationFromRecord(r, parksByRecordId));
  if (query.get('parkId')) list = list.filter((a) => a.parkId === query.get('parkId'));
  if (query.get('tier')) list = list.filter((a) => a.tier === query.get('tier'));
  void parksBySlug;
  return list;
});

route('GET', '/packages', async ({ env, query }) => {
  const { packages } = await buildPackagesIndex(env);
  let list = packages.map(stripInternal);
  if (query.get('parkId')) list = list.filter((p) => p.parks.includes(query.get('parkId')));
  return list;
});

route('GET', '/packages/:id', async ({ env, params }) => {
  const { bySlug } = await buildPackagesIndex(env);
  const pkg = bySlug.get(params[0]);
  if (!pkg) throw new HttpError('Package not found', 404);

  const itineraryRecords = await listAllRecords(env.AIRTABLE_TOKEN, TABLES.PACKAGE_ITINERARY);
  const rowsForPackage = itineraryRecords.filter((r) => (r.fields[FIELDS.PACKAGE_ITINERARY.PACKAGE_LINK] || []).includes(pkg._recordId));
  return { ...stripInternal(pkg), itinerary: formatItinerary(rowsForPackage) };
});

route('GET', '/addons', async ({ env }) => {
  const { addons } = await buildAddonsIndex(env);
  return addons;
});

route('GET', '/reviews', async ({ env, query }) => {
  const { byRecordId: parksByRecordId } = await buildParksIndex(env);
  const records = await listAllRecords(env.AIRTABLE_TOKEN, TABLES.REVIEWS);
  let list = records.map((r) => reviewFromRecord(r, parksByRecordId));
  if (query.get('parkId')) list = list.filter((r) => r.parkId === query.get('parkId'));
  return list;
});

route('GET', '/bookings', async ({ env, query, request }) => {
  const guestEmail = query.get('guestEmail');
  // No guestEmail = someone is asking for the full bookings list —
  // that's the admin view, so it requires a valid admin session.
  if (!guestEmail) await requireAdmin(request, env);

  const [{ byRecordId: usersByRecordId, byEmail }, { byRecordId: packagesByRecordId }, { byRecordId: parksByRecordId }, { byRecordId: addonsByRecordId }] = await Promise.all([
    buildUsersIndex(env), buildPackagesIndex(env), buildParksIndex(env), buildAddonsIndex(env),
  ]);

  const records = await listAllRecords(env.AIRTABLE_TOKEN, TABLES.BOOKINGS);
  let list = records.map((r) => bookingFromRecord(r, { usersByRecordId, packagesByRecordId, parksByRecordId, addonsByRecordId }));

  if (guestEmail) {
    const user = byEmail.get(guestEmail.toLowerCase());
    list = user ? list.filter((b) => b.guestEmail?.toLowerCase() === guestEmail.toLowerCase()) : [];
  }
  const status = query.get('status');
  if (status) list = list.filter((b) => b.status === status);

  return list;
});

route('POST', '/bookings', async ({ env, body }) => {
  const required = ['mode', 'guestName', 'guestEmail', 'groupSize', 'startDate', 'totalPrice'];
  const missing = required.filter((k) => body[k] === undefined || body[k] === null || body[k] === '');
  if (missing.length) throw new HttpError(`Missing required field(s): ${missing.join(', ')}`, 400);

  const [guestRecId, bookingId] = await Promise.all([
    findOrCreateUser(env, { name: body.guestName, email: body.guestEmail }),
    nextBookingId(env),
  ]);

  const fields = {
    [FIELDS.BOOKINGS.BOOKING_ID]: bookingId,
    [FIELDS.BOOKINGS.MODE]: body.mode === 'custom' ? 'Custom' : 'Prebuilt',
    [FIELDS.BOOKINGS.GUEST_LINK]: [guestRecId],
    [FIELDS.BOOKINGS.GROUP_SIZE]: body.groupSize,
    [FIELDS.BOOKINGS.START_DATE]: body.startDate,
    [FIELDS.BOOKINGS.TOTAL_PRICE]: body.totalPrice,
    [FIELDS.BOOKINGS.STATUS]: 'Pending',
  };

  if (body.mode === 'prebuilt') {
    const { bySlug } = await buildPackagesIndex(env);
    const pkg = bySlug.get(body.packageId);
    if (!pkg) throw new HttpError(`Unknown packageId: ${body.packageId}`, 400);
    fields[FIELDS.BOOKINGS.PACKAGE_LINK] = [pkg._recordId];
  } else {
    const cd = body.customDetails || {};
    const { bySlug: parksBySlug } = await buildParksIndex(env);
    const parkRecIds = (cd.parks || []).map((slug) => parksBySlug.get(slug)?._recordId).filter(Boolean);
    fields[FIELDS.BOOKINGS.CUSTOM_PARKS_LINK] = parkRecIds;
    fields[FIELDS.BOOKINGS.CUSTOM_DAYS] = cd.days || 0;
    fields[FIELDS.BOOKINGS.CUSTOM_ACCOMMODATION_TIER] = capitalize(cd.accommodationTier || 'mid');
    fields[FIELDS.BOOKINGS.CUSTOM_TRANSPORT] = capitalize(cd.transport || 'jeep');
    fields[FIELDS.BOOKINGS.ADDONS_LINK] = cd.addOns || []; // addon id === Airtable record id already
  }
  if (body.specialRequests) fields[FIELDS.BOOKINGS.SPECIAL_REQUESTS] = body.specialRequests;

  const created = await createRecord(env.AIRTABLE_TOKEN, TABLES.BOOKINGS, fields);

  const [{ byRecordId: usersByRecordId }, { byRecordId: packagesByRecordId }, { byRecordId: parksByRecordId }, { byRecordId: addonsByRecordId }] = await Promise.all([
    buildUsersIndex(env), buildPackagesIndex(env), buildParksIndex(env), buildAddonsIndex(env),
  ]);
  return bookingFromRecord(created, { usersByRecordId, packagesByRecordId, parksByRecordId, addonsByRecordId });
});

route('PATCH', '/bookings/:id/status', async ({ env, params, body, request }) => {
  await requireAdmin(request, env);
  const status = body.status;
  if (!['pending', 'confirmed', 'cancelled'].includes(status)) throw new HttpError('Invalid status', 400);

  const records = await listAllRecords(env.AIRTABLE_TOKEN, TABLES.BOOKINGS);
  const target = records.find((r) => r.fields[FIELDS.BOOKINGS.BOOKING_ID] === params[0]);
  if (!target) throw new HttpError('Booking not found', 404);

  const updated = await updateRecord(env.AIRTABLE_TOKEN, TABLES.BOOKINGS, target.id, {
    [FIELDS.BOOKINGS.STATUS]: capitalize(status),
  });

  const [{ byRecordId: usersByRecordId }, { byRecordId: packagesByRecordId }, { byRecordId: parksByRecordId }, { byRecordId: addonsByRecordId }] = await Promise.all([
    buildUsersIndex(env), buildPackagesIndex(env), buildParksIndex(env), buildAddonsIndex(env),
  ]);
  return bookingFromRecord(updated, { usersByRecordId, packagesByRecordId, parksByRecordId, addonsByRecordId });
});

route('POST', '/auth/login', async ({ env, body }) => {
  return loginAdmin(body, env);
});

/* ---------------- helpers ---------------- */

class HttpError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function stripInternal(obj) { const { _recordId, ...rest } = obj; return rest; }

/* ---------------- fetch handler ---------------- */

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(env) });
    }

    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/v1')) {
      return errorJson('Not found', { status: 404, env });
    }
    const path = url.pathname.replace('/api/v1', '') || '/';

    const match = routes.find((r) => r.method === request.method && r.regex.test(path));
    if (!match) return errorJson('Not found', { status: 404, env });

    const params = match.regex.exec(path).slice(1);
    let body = {};
    if (['POST', 'PATCH'].includes(request.method)) {
      body = await request.json().catch(() => ({}));
    }

    try {
      const data = await match.handler({ env, params, query: url.searchParams, body, request });
      return json(data, { env });
    } catch (err) {
      if (err instanceof HttpError) return errorJson(err.message, { status: err.status, env });
      if (err instanceof AuthError) return errorJson(err.message, { status: err.status, env });
      if (err instanceof AirtableError) return errorJson(err.message, { status: err.status >= 400 ? err.status : 502, env });
      console.error(err);
      return errorJson('Internal server error', { status: 500, env });
    }
  },
};
