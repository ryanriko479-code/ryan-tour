// ==========================================================
// airtable-client.js — thin wrapper around Airtable's real REST API
// (api.airtable.com), used only from inside the Worker. The token
// never reaches the browser — that's the whole point of this Worker.
// ==========================================================

import { BASE_ID } from './airtable-schema.js';

const API_ROOT = 'https://api.airtable.com/v0';

class AirtableError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'AirtableError';
    this.status = status;
  }
}

/**
 * @param {string} token AIRTABLE_TOKEN from env
 * @param {string} tableId
 * @param {object} [opts]
 * @param {URLSearchParams} [opts.params]
 * @returns {Promise<{records: object[]}>}
 */
export async function listRecords(token, tableId, { params } = {}) {
  const url = new URL(`${API_ROOT}/${BASE_ID}/${tableId}`);
  if (params) params.forEach((v, k) => url.searchParams.append(k, v));
  return airtableRequest(token, url);
}

/** Fetches ALL pages for a table (Airtable paginates at 100 records/page). */
export async function listAllRecords(token, tableId, { params } = {}) {
  let all = [];
  let offset;
  do {
    const p = new URLSearchParams(params);
    if (offset) p.set('offset', offset);
    const page = await listRecords(token, tableId, { params: p });
    all = all.concat(page.records);
    offset = page.offset;
  } while (offset);
  return all;
}

export async function getRecord(token, tableId, recordId) {
  const url = new URL(`${API_ROOT}/${BASE_ID}/${tableId}/${recordId}`);
  return airtableRequest(token, url);
}

export async function createRecord(token, tableId, fields) {
  const url = new URL(`${API_ROOT}/${BASE_ID}/${tableId}`);
  return airtableRequest(token, url, { method: 'POST', body: { fields } });
}

export async function updateRecord(token, tableId, recordId, fields) {
  const url = new URL(`${API_ROOT}/${BASE_ID}/${tableId}/${recordId}`);
  return airtableRequest(token, url, { method: 'PATCH', body: { fields } });
}

async function airtableRequest(token, url, { method = 'GET', body } = {}) {
  // Airtable keys record `fields` by field NAME by default. This app
  // is written against field IDs everywhere (airtable-schema.js), so
  // every request — reads AND writes — asks for ID-keyed fields via
  // this flag. Without it, every f[FIELDS.X.Y] lookup in transform.js
  // silently returns undefined instead of throwing, which is exactly
  // the bug that shipped: blank fields, no error, no obvious cause.
  url.searchParams.set('returnFieldsByFieldId', 'true');

  const res = await fetch(url.toString(), {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    throw new AirtableError(payload?.error?.message || `Airtable request failed (${res.status})`, res.status);
  }
  return payload;
}

export { AirtableError };
