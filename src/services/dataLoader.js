// ==========================================================
// dataLoader.js — SINGLE IMPORT SURFACE. Pages and components
// import data-access functions from here, never from api.js
// directly. This is what made the mock-data → Airtable/Worker
// swap painless: only api.js changed.
//
// Next (future): add caching, in-flight de-duping, and error
// fallback here without touching pages/components at all.
// ==========================================================

export {
  fetchParks,
  fetchPark,
  fetchAccommodations,
  fetchPackages,
  fetchPackage,
  fetchAddons,
  fetchReviews,
  fetchBookings,
  createBooking,
  updateBookingStatus,
} from './api.js';
