// ==========================================================
// worker.test.mjs — smoke test for the Worker against a mocked
// Airtable API (no real network calls, no real Airtable token
// needed). Run with: npm test
//
// Covers: read endpoints + linked-record resolution, admin login
// (correct/wrong password), the admin-required gate on the bookings
// list and status update, guest-scoped booking reads, and booking
// creation (including auto-creating a Users record for a new guest).
// ==========================================================

import { TABLES, FIELDS } from '../src/airtable-schema.js';

// ---------- Mock Airtable dataset (mirrors what's actually in the base) ----------

const rec = (id, fields) => ({ id, createdTime: '2026-08-05T00:00:00.000Z', fields });

const PARK_AMBOSELI = rec('recPARK1', {
  [FIELDS.PARKS.SLUG]: 'amboseli', [FIELDS.PARKS.NAME]: 'Amboseli National Park',
  [FIELDS.PARKS.COORDINATES]: '2.6527° S, 37.2606° E', [FIELDS.PARKS.LOCATION]: 'Southern Kenya',
  [FIELDS.PARKS.DESCRIPTION]: 'desc', [FIELDS.PARKS.HIGHLIGHTS]: ['Kilimanjaro views'],
  [FIELDS.PARKS.WILDLIFE]: ['Elephant'], [FIELDS.PARKS.BEST_TIME]: 'Jun–Oct', [FIELDS.PARKS.ENTRANCE_FEE]: 60,
});
const PARK_MARA = rec('recPARK2', {
  [FIELDS.PARKS.SLUG]: 'mara', [FIELDS.PARKS.NAME]: 'Maasai Mara National Reserve',
  [FIELDS.PARKS.COORDINATES]: '1.5° S, 35.15° E', [FIELDS.PARKS.LOCATION]: 'Rift Valley',
  [FIELDS.PARKS.DESCRIPTION]: 'desc', [FIELDS.PARKS.HIGHLIGHTS]: ['Migration'],
  [FIELDS.PARKS.WILDLIFE]: ['Lion'], [FIELDS.PARKS.BEST_TIME]: 'Jul–Oct', [FIELDS.PARKS.ENTRANCE_FEE]: 80,
});

const PACKAGE_1 = rec('recPKG1', {
  [FIELDS.PACKAGES.SLUG]: 'amboseli-elephant-trail', [FIELDS.PACKAGES.NAME]: 'Amboseli Elephant Trail',
  [FIELDS.PACKAGES.DURATION_DAYS]: 3, [FIELDS.PACKAGES.PARKS_LINK]: ['recPARK1'],
  [FIELDS.PACKAGES.ACCOMMODATION_TIER]: 'Mid', [FIELDS.PACKAGES.TRANSPORT]: 'Jeep',
  [FIELDS.PACKAGES.PRICE_PER_PERSON]: 640, [FIELDS.PACKAGES.RATING]: 4.8,
  [FIELDS.PACKAGES.INCLUDED]: 'Park fees\nFull board', [FIELDS.PACKAGES.NOT_INCLUDED]: 'Flights',
});

const ITIN_1 = rec('recIT1', { [FIELDS.PACKAGE_ITINERARY.DAY_NUMBER]: 1, [FIELDS.PACKAGE_ITINERARY.DESCRIPTION]: 'Arrival', [FIELDS.PACKAGE_ITINERARY.PACKAGE_LINK]: ['recPKG1'] });
const ITIN_2 = rec('recIT2', { [FIELDS.PACKAGE_ITINERARY.DAY_NUMBER]: 2, [FIELDS.PACKAGE_ITINERARY.DESCRIPTION]: 'Full-day safari', [FIELDS.PACKAGE_ITINERARY.PACKAGE_LINK]: ['recPKG1'] });

const ADDON_1 = rec('recADD1', { [FIELDS.ADDONS.NAME]: 'Hot air balloon safari', [FIELDS.ADDONS.PRICE]: 450, [FIELDS.ADDONS.CATEGORY]: 'Experience' });

const USER_SARAH = rec('recUSER1', { [FIELDS.USERS.NAME]: 'Sarah Mwangi', [FIELDS.USERS.EMAIL]: 'sarah@example.com', [FIELDS.USERS.ROLE]: 'Guest' });

const BOOKING_1 = rec('recBK1', {
  [FIELDS.BOOKINGS.BOOKING_ID]: 'BK-1001', [FIELDS.BOOKINGS.MODE]: 'Prebuilt',
  [FIELDS.BOOKINGS.GUEST_LINK]: ['recUSER1'], [FIELDS.BOOKINGS.PACKAGE_LINK]: ['recPKG1'],
  [FIELDS.BOOKINGS.GROUP_SIZE]: 2, [FIELDS.BOOKINGS.START_DATE]: '2026-08-14',
  [FIELDS.BOOKINGS.TOTAL_PRICE]: 1280, [FIELDS.BOOKINGS.STATUS]: 'Confirmed',
});

const DB = {
  [TABLES.PARKS]: [PARK_AMBOSELI, PARK_MARA],
  [TABLES.ACCOMMODATIONS]: [],
  [TABLES.PACKAGES]: [PACKAGE_1],
  [TABLES.PACKAGE_ITINERARY]: [ITIN_1, ITIN_2],
  [TABLES.ADDONS]: [ADDON_1],
  [TABLES.REVIEWS]: [],
  [TABLES.USERS]: [USER_SARAH],
  [TABLES.BOOKINGS]: [BOOKING_1],
  [TABLES.SETTINGS]: [],
};

let createdCounter = 0;

// ---------- Mock fetch ----------
// This mock deliberately mimics real Airtable's actual default
// behavior: field data is keyed by NAME unless returnFieldsByFieldId
// is explicitly requested. Since every fixture above is keyed by
// FIELD ID, a request missing that flag gets a deliberately wrong
// (empty-fields) response here too — the same way real Airtable
// would silently misbehave. This is what should have caught the
// "blank fields in production" bug before it shipped.
global.fetch = async (url, opts = {}) => {
  const u = new URL(url);
  if (u.searchParams.get('returnFieldsByFieldId') !== 'true') {
    throw new Error(
      `Mock Airtable: request to ${u.pathname} is missing returnFieldsByFieldId=true — ` +
      `real Airtable would key fields by NAME here, and every fixture/transform in this ` +
      `codebase assumes field IDs. This would silently return blank data in production.`
    );
  }
  const tableId = u.pathname.split('/')[3];
  const recordId = u.pathname.split('/')[4];
  const method = opts.method || 'GET';

  const ok = (body, status = 200) => ({ ok: true, status, json: async () => body });

  if (method === 'GET' && !recordId) {
    return ok({ records: DB[tableId] || [] });
  }
  if (method === 'POST' && !recordId) {
    const body = JSON.parse(opts.body);
    createdCounter += 1;
    const newRec = rec(`recNEW${createdCounter}`, body.fields);
    (DB[tableId] ||= []).push(newRec);
    return ok(newRec);
  }
  if (method === 'PATCH' && recordId) {
    const body = JSON.parse(opts.body);
    const target = (DB[tableId] || []).find((r) => r.id === recordId);
    Object.assign(target.fields, body.fields);
    return ok(target);
  }
  throw new Error(`Unhandled mock request: ${method} ${url}`);
};

// ---------- Run against the real Worker ----------

const worker = (await import('../src/index.js')).default;

const env = {
  AIRTABLE_TOKEN: 'fake-token',
  ADMIN_CREDENTIALS: JSON.stringify([{ email: 'admin@ryantours.com', name: 'Admin User', passwordHash: 'ffc121a2210958bf74e5a874668f3d978d24b6a8241496ccff3c0ea245e4f126' }]),
  SESSION_SECRET: 'test-secret',
  ALLOWED_ORIGIN: '*',
};

let passed = 0, failed = 0;
function assert(name, cond, detail) {
  if (cond) { passed++; console.log(`✓ ${name}`); }
  else { failed++; console.log(`✗ ${name}${detail ? ' — ' + JSON.stringify(detail) : ''}`); }
}

async function call(method, path, { body, token } = {}) {
  const req = new Request(`https://worker.test/api/v1${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const res = await worker.fetch(req, env);
  const payload = await res.json();
  return { status: res.status, payload };
}

// 1. GET /parks
{
  const { status, payload } = await call('GET', '/parks');
  assert('GET /parks → 200', status === 200);
  assert('GET /parks → 2 parks with slug ids', payload.data.length === 2 && payload.data[0].id === 'amboseli', payload.data);
  assert('GET /parks → no _recordId leaked', payload.data[0]._recordId === undefined, payload.data[0]);
}

// 2. GET /packages/:id with itinerary join
{
  const { status, payload } = await call('GET', '/packages/amboseli-elephant-trail');
  assert('GET /packages/:id → 200', status === 200);
  assert('GET /packages/:id → resolves parks to slugs', JSON.stringify(payload.data.parks) === JSON.stringify(['amboseli']), payload.data.parks);
  assert('GET /packages/:id → itinerary formatted & sorted', payload.data.itinerary[0] === 'Day 1 — Arrival', payload.data.itinerary);
  assert('GET /packages/:id → included split on newline', payload.data.included.length === 2, payload.data.included);
}

// 3. GET /bookings without guestEmail (admin view) → 401 without token
{
  const { status } = await call('GET', '/bookings');
  assert('GET /bookings (no email, no token) → 401', status === 401);
}

// 4. Admin login with correct password → token issued
let adminToken;
{
  const { status, payload } = await call('POST', '/auth/login', { body: { email: 'admin@ryantours.com', password: 'TestPassword123!' } });
  assert('POST /auth/login correct password → 200', status === 200, payload);
  assert('POST /auth/login → returns token + admin role', payload.data.token && payload.data.user.role === 'admin', payload);
  adminToken = payload.data.token;
}

// 5. Wrong password → 401
{
  const { status } = await call('POST', '/auth/login', { body: { email: 'admin@ryantours.com', password: 'wrong' } });
  assert('POST /auth/login wrong password → 401', status === 401);
}

// 6. GET /bookings with admin token → succeeds, resolves guest name from linked Users record
{
  const { status, payload } = await call('GET', '/bookings', { token: adminToken });
  assert('GET /bookings with admin token → 200', status === 200, payload);
  assert('GET /bookings → resolves guest name via link', payload.data[0].guestName === 'Sarah Mwangi', payload.data);
  assert('GET /bookings → resolves packageId to slug', payload.data[0].packageId === 'amboseli-elephant-trail', payload.data);
}

// 7. GET /bookings?guestEmail= (guest view, no token needed)
{
  const { status, payload } = await call('GET', '/bookings?guestEmail=sarah@example.com');
  assert('GET /bookings?guestEmail= → 200 no auth needed', status === 200, payload);
  assert('GET /bookings?guestEmail= → filters to that guest', payload.data.length === 1, payload.data);
}

// 8. PATCH status without admin token → 401
{
  const { status } = await call('PATCH', '/bookings/BK-1001/status', { body: { status: 'cancelled' } });
  assert('PATCH status without token → 401', status === 401);
}

// 9. PATCH status with admin token → succeeds
{
  const { status, payload } = await call('PATCH', '/bookings/BK-1001/status', { body: { status: 'cancelled' }, token: adminToken });
  assert('PATCH status with admin token → 200', status === 200, payload);
  assert('PATCH status → status actually changed', payload.data.status === 'cancelled', payload.data);
}

// 10. POST /bookings (custom mode, new guest) → creates user + booking, resolves shape back
{
  const { status, payload } = await call('POST', '/bookings', {
    body: {
      mode: 'custom', guestName: 'New Guest', guestEmail: 'newguest@example.com', groupSize: 2,
      startDate: '2026-09-01', totalPrice: 2000,
      customDetails: { parks: ['amboseli', 'mara'], days: 4, accommodationTier: 'luxury', transport: 'jeep', addOns: ['recADD1'] },
    },
  });
  assert('POST /bookings custom → 200', status === 200, payload);
  assert('POST /bookings → id assigned server-side (BK-1002)', payload.data.id === 'BK-1002', payload.data);
  assert('POST /bookings → custom parks resolved to slugs', JSON.stringify(payload.data.customDetails.parks) === JSON.stringify(['amboseli', 'mara']), payload.data.customDetails);
  assert('POST /bookings → new guest user was created', DB[TABLES.USERS].some((u) => u.fields[FIELDS.USERS.EMAIL] === 'newguest@example.com'));
}

// 11. Unknown route → 404
{
  const { status } = await call('GET', '/nonexistent');
  assert('Unknown route → 404', status === 404);
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
