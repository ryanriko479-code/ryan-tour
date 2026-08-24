// ==========================================================
// transform.js — Airtable record → app JSON shape.
// This is the layer that lets dataLoader.js/api.js stay unchanged:
// everything here maps fldXXXXXXXX-keyed Airtable fields (and
// rec-linked fields) onto the plain { id, name, ... } objects the
// frontend has used since the mock-data version.
// ==========================================================

import { FIELDS, FALLBACK_IMAGES } from './airtable-schema.js';

const TIER_LOWER = { Budget: 'budget', Mid: 'mid', Luxury: 'luxury' };
const TRANSPORT_LOWER = { Jeep: 'jeep', Motorbike: 'motorbike' };
const MODE_LOWER = { Prebuilt: 'prebuilt', Custom: 'custom' };
const STATUS_LOWER = { Pending: 'pending', Confirmed: 'confirmed', Cancelled: 'cancelled' };

export function parkFromRecord(record) {
  const f = record.fields;
  const slug = f[FIELDS.PARKS.SLUG];
  return {
    id: slug,
    _recordId: record.id, // internal use only — never returned to the browser
    name: f[FIELDS.PARKS.NAME] || '',
    coord: f[FIELDS.PARKS.COORDINATES] || '',
    location: f[FIELDS.PARKS.LOCATION] || '',
    img: FALLBACK_IMAGES.parks[slug] || '',
    description: f[FIELDS.PARKS.DESCRIPTION] || '',
    highlights: f[FIELDS.PARKS.HIGHLIGHTS] || [],
    wildlife: f[FIELDS.PARKS.WILDLIFE] || [],
    bestTime: f[FIELDS.PARKS.BEST_TIME] || '',
    entranceFee: f[FIELDS.PARKS.ENTRANCE_FEE] || 0,
  };
}

/** @param {object} record  @param {Map<string,string>} parkIdBySlugOrRecId recordId -> slug lookup */
export function accommodationFromRecord(record, parksByRecordId) {
  const f = record.fields;
  const parkRecId = (f[FIELDS.ACCOMMODATIONS.PARK_LINK] || [])[0];
  return {
    id: record.id,
    name: f[FIELDS.ACCOMMODATIONS.NAME] || '',
    parkId: parksByRecordId.get(parkRecId)?.id || null,
    location: (f[FIELDS.ACCOMMODATIONS.LOCATION_TYPE] || '').toLowerCase(),
    tier: TIER_LOWER[f[FIELDS.ACCOMMODATIONS.TIER]] || 'mid',
    capacity: f[FIELDS.ACCOMMODATIONS.CAPACITY] || 0,
    price: f[FIELDS.ACCOMMODATIONS.PRICE_PER_NIGHT] || 0,
    img: FALLBACK_IMAGES.accommodationDefault,
    amenities: f[FIELDS.ACCOMMODATIONS.AMENITIES] || [],
  };
}

/**
 * @param {object} record
 * @param {Map<string,object>} parksByRecordId recordId -> park object
 * @param {string[]} itinerary already-resolved "Day N — ..." strings (package detail only)
 */
export function packageFromRecord(record, parksByRecordId, itinerary = []) {
  const f = record.fields;
  const slug = f[FIELDS.PACKAGES.SLUG];
  const parkRecIds = f[FIELDS.PACKAGES.PARKS_LINK] || [];
  return {
    id: slug,
    _recordId: record.id,
    name: f[FIELDS.PACKAGES.NAME] || '',
    duration: f[FIELDS.PACKAGES.DURATION_DAYS] || 0,
    parks: parkRecIds.map((recId) => parksByRecordId.get(recId)?.id).filter(Boolean),
    accommodationTier: TIER_LOWER[f[FIELDS.PACKAGES.ACCOMMODATION_TIER]] || 'mid',
    transport: TRANSPORT_LOWER[f[FIELDS.PACKAGES.TRANSPORT]] || 'jeep',
    price: f[FIELDS.PACKAGES.PRICE_PER_PERSON] || 0,
    img: FALLBACK_IMAGES.packages[slug] || '',
    rating: f[FIELDS.PACKAGES.RATING] || 0,
    included: (f[FIELDS.PACKAGES.INCLUDED] || '').split('\n').filter(Boolean),
    notIncluded: (f[FIELDS.PACKAGES.NOT_INCLUDED] || '').split('\n').filter(Boolean),
    itinerary,
  };
}

/** Sorts Package Itinerary rows by day and formats them "Day N — Description". */
export function formatItinerary(itineraryRecords) {
  return [...itineraryRecords]
    .sort((a, b) => a.fields[FIELDS.PACKAGE_ITINERARY.DAY_NUMBER] - b.fields[FIELDS.PACKAGE_ITINERARY.DAY_NUMBER])
    .map((r) => `Day ${r.fields[FIELDS.PACKAGE_ITINERARY.DAY_NUMBER]} — ${r.fields[FIELDS.PACKAGE_ITINERARY.DESCRIPTION] || ''}`);
}

export function addonFromRecord(record) {
  const f = record.fields;
  return {
    id: record.id,
    name: f[FIELDS.ADDONS.NAME] || '',
    price: f[FIELDS.ADDONS.PRICE] || 0,
    category: (f[FIELDS.ADDONS.CATEGORY] || '').toLowerCase(),
  };
}

export function reviewFromRecord(record, parksByRecordId) {
  const f = record.fields;
  const parkRecId = (f[FIELDS.REVIEWS.PARK_LINK] || [])[0];
  return {
    id: record.id,
    parkId: parksByRecordId.get(parkRecId)?.id || null,
    guestName: f[FIELDS.REVIEWS.GUEST_NAME] || '',
    rating: f[FIELDS.REVIEWS.RATING] || 0,
    comment: f[FIELDS.REVIEWS.COMMENT] || '',
    date: f[FIELDS.REVIEWS.DATE] || '',
  };
}

/**
 * @param {object} record Bookings record
 * @param {Map<string,object>} usersByRecordId
 * @param {Map<string,object>} packagesByRecordId
 * @param {Map<string,object>} parksByRecordId
 * @param {Map<string,object>} addonsByRecordId
 */
export function bookingFromRecord(record, { usersByRecordId, packagesByRecordId, parksByRecordId, addonsByRecordId }) {
  const f = record.fields;
  const mode = MODE_LOWER[f[FIELDS.BOOKINGS.MODE]] || 'prebuilt';
  const guestRecId = (f[FIELDS.BOOKINGS.GUEST_LINK] || [])[0];
  const guest = usersByRecordId.get(guestRecId);
  const packageRecId = (f[FIELDS.BOOKINGS.PACKAGE_LINK] || [])[0];

  const base = {
    id: f[FIELDS.BOOKINGS.BOOKING_ID],
    mode,
    guestName: guest?.name || '',
    guestEmail: guest?.email || '',
    groupSize: f[FIELDS.BOOKINGS.GROUP_SIZE] || 1,
    startDate: f[FIELDS.BOOKINGS.START_DATE] || '',
    totalPrice: f[FIELDS.BOOKINGS.TOTAL_PRICE] || 0,
    status: STATUS_LOWER[f[FIELDS.BOOKINGS.STATUS]] || 'pending',
    createdAt: (record.createdTime || '').slice(0, 10),
  };

  if (mode === 'prebuilt') {
    return { ...base, packageId: packagesByRecordId.get(packageRecId)?.id || null };
  }

  const customParkRecIds = f[FIELDS.BOOKINGS.CUSTOM_PARKS_LINK] || [];
  const addonRecIds = f[FIELDS.BOOKINGS.ADDONS_LINK] || [];
  return {
    ...base,
    customDetails: {
      parks: customParkRecIds.map((id) => parksByRecordId.get(id)?.id).filter(Boolean),
      days: f[FIELDS.BOOKINGS.CUSTOM_DAYS] || 0,
      accommodationTier: TIER_LOWER[f[FIELDS.BOOKINGS.CUSTOM_ACCOMMODATION_TIER]] || 'mid',
      transport: TRANSPORT_LOWER[f[FIELDS.BOOKINGS.CUSTOM_TRANSPORT]] || 'jeep',
      addOns: addonRecIds.map((id) => addonsByRecordId.get(id)?.id).filter(Boolean),
    },
  };
}

export { TIER_LOWER, TRANSPORT_LOWER, MODE_LOWER, STATUS_LOWER };
