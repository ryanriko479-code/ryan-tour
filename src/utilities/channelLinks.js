// ==========================================================
// channelLinks.js — wa.me / mailto / tel / m.me link builders
// All manual-booking flows redirect through these. No integrated payments.
// ==========================================================

const CONTACT = {
  whatsappNumber: '254700000000', // digits only, no leading +
  phone: '+254700000000',
  email: 'info@ryantours.com',
  messengerPage: 'yourpage',
};

export function waLink(text) {
  return `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export function mailLink(subject, body) {
  return `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function telLink() {
  return `tel:${CONTACT.phone}`;
}

export function messengerLink() {
  return `https://m.me/${CONTACT.messengerPage}`;
}

export { CONTACT };
