// ==========================================================
// api.js — async client. Talks to the Cloudflare Worker that proxies
// Airtable (see docs/api-contract.md for the endpoint list and
// docs/deployment.md for why the Worker sits in front of Airtable
// instead of calling it directly from the browser).
//
// The Worker is responsible for translating Airtable's record/field
// shape into the exact JSON shapes the app already expects — every
// function here keeps the same signature and return shape the old
// mock-data version had, so dataLoader.js and everything above it
// needs zero changes.
//
// IMPORTANT: nothing outside src/services/ should import this file
// directly — go through dataLoader.js, the single import surface.
// ==========================================================

// TODO: point this at your deployed Worker once it exists, e.g.
// 'https://ryan-tours-api.<your-subdomain>.workers.dev/api/v1'.
// Defaults to a local `wrangler dev` server for now.
const API_BASE_URL = 'http://localhost:8787/api/v1';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Thin fetch wrapper: builds the URL (with query params), parses JSON,
 * and throws a typed ApiError on non-2xx responses so callers/UI can
 * distinguish "not found" from "network down" from "server error".
 */
async function request(path, { method = 'GET', params, body } = {}) {
  const url = new URL(API_BASE_URL + path);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
    });
  }

  let res;
  try {
    res = await fetch(url.toString(), {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new ApiError(`Network error reaching API: ${err.message}`, 0);
  }

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    // empty/non-JSON body — leave payload null
  }

  if (!res.ok) {
    const message = payload?.error || `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }

  return payload?.data ?? payload;
}

/* ---------------- Parks ---------------- */

export async function fetchParks() {
  return request('/parks');
}

export async function fetchPark(id) {
  try {
    return await request(`/parks/${encodeURIComponent(id)}`);
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

/* ---------------- Accommodations ---------------- */

export async function fetchAccommodations({ parkId, tier } = {}) {
  return request('/accommodations', { params: { parkId, tier: tier === 'all' ? undefined : tier } });
}

/* ---------------- Packages ---------------- */

export async function fetchPackages({ parkId } = {}) {
  return request('/packages', { params: { parkId: parkId === 'all' ? undefined : parkId } });
}

export async function fetchPackage(id) {
  try {
    return await request(`/packages/${encodeURIComponent(id)}`);
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

/* ---------------- Add-ons ---------------- */

export async function fetchAddons() {
  return request('/addons');
}

/* ---------------- Reviews ---------------- */

export async function fetchReviews({ parkId } = {}) {
  return request('/reviews', { params: { parkId } });
}

/* ---------------- Bookings ---------------- */

export async function fetchBookings({ guestEmail, status } = {}) {
  return request('/bookings', { params: { guestEmail, status: status === 'all' ? undefined : status } });
}

export async function createBooking(payload) {
  // id/status/createdAt are assigned server-side (Worker generates the
  // next "BK-xxxx" id and defaults status to "pending") — see
  // docs/api-contract.md.
  return request('/bookings', { method: 'POST', body: payload });
}

export async function updateBookingStatus(id, status) {
  try {
    return await request(`/bookings/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: { status } });
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

export { ApiError, API_BASE_URL };
