// ==========================================================
// booking.js — booking form validation rules + custom builder pricing
//
// No dependency on services/ — the mock data file is gone. Callers
// (pages/booking.js, app.js) already have the add-ons list in hand
// from a prior fetchAddons() call via dataLoader, so it's passed in
// rather than imported here. This keeps calcCustomPricePerPerson a
// pure, synchronous function usable on every keystroke without an
// extra network round trip.
// ==========================================================

/**
 * Pricing model for the custom builder (a la carte).
 * total = basePerParkPerDay × parks × days × accommodationMultiplier × transportMultiplier + add-ons
 */
export const PRICING_RULES = {
  basePricePerParkPerDay: 90,
  accommodationMultiplier: { budget: 1, mid: 1.6, luxury: 2.6 },
  transportMultiplier: { jeep: 1, motorbike: 0.85 },
};

/**
 * @param {object} builder in-progress custom builder selection
 * @param {object[]} addons full add-ons list (from fetchAddons()), used
 *   to look up the price of each selected add-on id
 */
export function calcCustomPricePerPerson(builder, addons = []) {
  const { basePricePerParkPerDay, accommodationMultiplier, transportMultiplier } = PRICING_RULES;
  const accMult = accommodationMultiplier[builder.accommodationTier] || 1;
  const transMult = transportMultiplier[builder.transport] || 1;
  let total = basePricePerParkPerDay * Math.max(builder.parks.length, 1) * builder.days * accMult * transMult;
  builder.addOns.forEach((id) => {
    const addon = addons.find((a) => a.id === id);
    if (addon) total += addon.price;
  });
  return Math.round(total);
}

export function validatePrebuiltBooking({ name, email, date, group }) {
  const errors = [];
  if (!name || !name.trim()) errors.push('Full name is required.');
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push('A valid email is required.');
  if (!date) errors.push('Start date is required.');
  if (!group || group < 1) errors.push('Group size must be at least 1.');
  return errors;
}

export function validateCustomBooking({ name, email, date, group, parks }) {
  const errors = validatePrebuiltBooking({ name, email, date, group });
  if (!parks || parks.length === 0) errors.push('Select at least one park.');
  return errors;
}
