// ==========================================================
// mockData.js — SEED DATA for Phase 1 (see docs/api-contract.md
// for the shape this will take once D1/Cloudflare Workers is live).
// Nothing outside src/services/ should import this file directly —
// go through dataLoader.js instead.
// ==========================================================

export const PARKS = [
  {
    id: 'amboseli', name: 'Amboseli National Park', coord: '2.6527° S, 37.2606° E',
    location: 'Southern Kenya, Kilimanjaro border',
    img: 'https://images.unsplash.com/photo-1547970810-dc1eac37d174?auto=format&fit=crop&w=800&q=70',
    description: "Open plains beneath Kilimanjaro's snowcap, famous for its free-roaming elephant herds and dramatic mountain backdrops.",
    highlights: ['Elephant herds up close', 'Kilimanjaro views', 'Maasai villages nearby'],
    wildlife: ['Elephant', 'Lion', 'Cheetah', 'Wildebeest', 'Zebra'],
    bestTime: 'Jun – Oct', entranceFee: 60,
  },
  {
    id: 'mara', name: 'Maasai Mara National Reserve', coord: '1.5000° S, 35.1500° E',
    location: 'Great Rift Valley, southwest Kenya',
    img: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=800&q=70',
    description: "Kenya's flagship reserve — rolling savanna, the Great Migration river crossings, and the highest predator density in East Africa.",
    highlights: ['Great Migration (Jul–Oct)', 'Big Five sightings', 'Hot air balloon safaris'],
    wildlife: ['Lion', 'Leopard', 'Wildebeest', 'Hippo', 'Crocodile'],
    bestTime: 'Jul – Oct', entranceFee: 80,
  },
  {
    id: 'tsavo-east', name: 'Tsavo East National Park', coord: '3.3833° S, 38.5667° E',
    location: 'Southeastern Kenya',
    img: 'https://images.unsplash.com/photo-1535941339077-2dd1c7963098?auto=format&fit=crop&w=800&q=70',
    description: 'Vast red-earth wilderness known for its "red elephants" dusted in oxide soil and the Yatta plateau lava flow.',
    highlights: ['Red-dust elephants', 'Lugard Falls', 'Yatta plateau'],
    wildlife: ['Elephant', 'Lion', 'Buffalo', 'Giraffe'],
    bestTime: 'Jun – Sep', entranceFee: 50,
  },
  {
    id: 'tsavo-west', name: 'Tsavo West National Park', coord: '3.4167° S, 38.1333° E',
    location: 'Southeastern Kenya',
    img: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=70',
    description: 'Volcanic hills, crystal springs, and rhino sanctuary — a rugged, greener counterpart to its eastern twin.',
    highlights: ['Mzima Springs', 'Rhino sanctuary', 'Shetani lava field'],
    wildlife: ['Rhino', 'Hippo', 'Leopard', 'Elephant'],
    bestTime: 'Jun – Sep', entranceFee: 52,
  },
];

export const ACCOMMODATIONS = [
  { id: 'a1', name: 'Kibo Dust Camp', parkId: 'amboseli', location: 'inside', tier: 'mid', capacity: 4, price: 180,
    img: 'https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?auto=format&fit=crop&w=800&q=70',
    amenities: ['En-suite tents', 'Kilimanjaro view deck', 'Full board'] },
  { id: 'a2', name: 'Amboseli Serena Lodge', parkId: 'amboseli', location: 'inside', tier: 'luxury', capacity: 2, price: 410,
    img: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=70',
    amenities: ['Pool', 'Spa', 'Butler service'] },
  { id: 'a3', name: 'Mara Under-Canvas', parkId: 'mara', location: 'inside', tier: 'luxury', capacity: 2, price: 520,
    img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=70',
    amenities: ['Riverfront tents', 'Private guide', 'Sundowner deck'] },
  { id: 'a4', name: 'Talek Budget Camp', parkId: 'mara', location: 'outside', tier: 'budget', capacity: 6, price: 65,
    img: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=70',
    amenities: ['Shared bathhouse', 'Campfire area'] },
  { id: 'a5', name: 'Ashnil Aruba Lodge', parkId: 'tsavo-east', location: 'inside', tier: 'mid', capacity: 3, price: 150,
    img: 'https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=800&q=70',
    amenities: ['Waterhole view', 'Pool', 'Full board'] },
  { id: 'a6', name: 'Voi Savanna Camp', parkId: 'tsavo-east', location: 'outside', tier: 'budget', capacity: 5, price: 58,
    img: 'https://images.unsplash.com/photo-1550354804-3e3a1a24da71?auto=format&fit=crop&w=800&q=70',
    amenities: ['Basic bandas', 'Shared kitchen'] },
  { id: 'a7', name: 'Finch Hattons Luxury Camp', parkId: 'tsavo-west', location: 'inside', tier: 'luxury', capacity: 2, price: 480,
    img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=70',
    amenities: ['Natural spring pool', 'Fine dining', 'Spa tent'] },
  { id: 'a8', name: 'Ngulia Hillside Lodge', parkId: 'tsavo-west', location: 'inside', tier: 'mid', capacity: 4, price: 165,
    img: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=800&q=70',
    amenities: ['Floodlit waterhole', 'Pool', 'Full board'] },
];

export const PACKAGES = [
  { id: 'p1', name: 'Amboseli Elephant Trail', duration: 3, parks: ['amboseli'], accommodationTier: 'mid', transport: 'jeep', price: 640,
    img: 'https://images.unsplash.com/photo-1547970810-dc1eac37d174?auto=format&fit=crop&w=800&q=70', rating: 4.8,
    included: ['4x4 game drives', 'Park fees', 'Full board', 'Professional guide'],
    notIncluded: ['Flights', 'Travel insurance', 'Tips'],
    itinerary: ['Day 1 — Arrival & sundowner game drive', 'Day 2 — Full-day Kilimanjaro-view safari', 'Day 3 — Morning drive & departure'] },
  { id: 'p2', name: 'Mara Migration Explorer', duration: 5, parks: ['mara'], accommodationTier: 'luxury', transport: 'jeep', price: 1850,
    img: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=800&q=70', rating: 4.9,
    included: ['4x4 game drives', 'Park fees', 'Full board', 'Balloon safari add-on available'],
    notIncluded: ['Flights', 'Alcoholic drinks', 'Tips'],
    itinerary: ['Day 1 — Fly-in & camp orientation', 'Day 2-4 — River-crossing tracking drives', 'Day 5 — Sunrise drive & departure'] },
  { id: 'p3', name: 'Tsavo Twin Parks Adventure', duration: 4, parks: ['tsavo-east', 'tsavo-west'], accommodationTier: 'mid', transport: 'jeep', price: 980,
    img: 'https://images.unsplash.com/photo-1535941339077-2dd1c7963098?auto=format&fit=crop&w=800&q=70', rating: 4.6,
    included: ['4x4 transfers between parks', 'Park fees', 'Full board'],
    notIncluded: ['Flights', 'Tips'],
    itinerary: ['Day 1 — Tsavo East arrival', 'Day 2 — Lugard Falls & red elephants', 'Day 3 — Transfer to Tsavo West, Mzima Springs', 'Day 4 — Rhino sanctuary & departure'] },
  { id: 'p4', name: 'Rift Valley Motorbike Safari', duration: 6, parks: ['mara', 'amboseli'], accommodationTier: 'mid', transport: 'motorbike', price: 1420,
    img: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=70', rating: 4.7,
    included: ['Guided adventure motorbike', 'Park fees', 'Full board', 'Support vehicle'],
    notIncluded: ['Flights', 'Riding gear rental'],
    itinerary: ['Day 1-2 — Rift Valley ride to Mara', 'Day 3-4 — Mara exploration', 'Day 5 — Ride to Amboseli', 'Day 6 — Kilimanjaro views & departure'] },
  { id: 'p5', name: 'Grand Kenya Circuit', duration: 7, parks: ['amboseli', 'mara', 'tsavo-east'], accommodationTier: 'luxury', transport: 'jeep', price: 2650,
    img: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=70', rating: 5.0,
    included: ['Private 4x4 throughout', 'All park fees', 'Full board', 'Dedicated guide'],
    notIncluded: ['Flights', 'Travel insurance'],
    itinerary: ['Day 1-2 — Amboseli', 'Day 3-5 — Maasai Mara', 'Day 6-7 — Tsavo East & departure'] },
];

export const ADDONS = [
  { id: 'ad1', name: 'Hot air balloon safari', price: 450, category: 'experience' },
  { id: 'ad2', name: 'Maasai cultural village visit', price: 40, category: 'experience' },
  { id: 'ad3', name: 'Extra game drive', price: 90, category: 'transport' },
  { id: 'ad4', name: 'Motorbike upgrade (from jeep)', price: 120, category: 'transport' },
  { id: 'ad5', name: 'Professional photography guide', price: 150, category: 'experience' },
  { id: 'ad6', name: 'Airstrip transfer', price: 200, category: 'transport' },
];

export const REVIEWS = [
  { id: 'r1', parkId: 'mara', guestName: 'Amara O.', rating: 5, comment: 'The river crossing left us speechless — our guide knew exactly where to wait.', date: '2026-03-14' },
  { id: 'r2', parkId: 'amboseli', guestName: 'Tom R.', rating: 5, comment: 'Waking up to Kilimanjaro over breakfast is something I will never forget.', date: '2026-02-02' },
  { id: 'r3', parkId: 'tsavo-west', guestName: 'Lindiwe K.', rating: 4, comment: 'Loved the rhino sanctuary. Roads are rougher here, worth it regardless.', date: '2026-01-20' },
];

// Mutable "DB" of bookings — this is the only mutable export in the
// mock layer, standing in for a real bookings table until Phase 2.
export const BOOKINGS = [
  { id: 'BK-1001', mode: 'prebuilt', packageId: 'p2', guestName: 'Sarah Mwangi', guestEmail: 'sarah@example.com', groupSize: 2, startDate: '2026-08-14', totalPrice: 3700, status: 'confirmed', createdAt: '2026-07-01' },
  { id: 'BK-1002', mode: 'custom', guestName: 'Sarah Mwangi', guestEmail: 'sarah@example.com', groupSize: 4, startDate: '2026-10-02',
    customDetails: { parks: ['amboseli'], days: 3, accommodationTier: 'luxury', transport: 'jeep', addOns: ['ad2'] }, totalPrice: 2140, status: 'pending', createdAt: '2026-07-20' },
  { id: 'BK-1003', mode: 'prebuilt', packageId: 'p1', guestName: 'James Otieno', guestEmail: 'james@example.com', groupSize: 2, startDate: '2026-08-01', totalPrice: 1280, status: 'confirmed', createdAt: '2026-06-18' },
  { id: 'BK-1004', mode: 'prebuilt', packageId: 'p5', guestName: 'Elena Petrova', guestEmail: 'elena@example.com', groupSize: 2, startDate: '2026-09-05', totalPrice: 5300, status: 'pending', createdAt: '2026-07-28' },
  { id: 'BK-1005', mode: 'custom', guestName: 'David Chen', guestEmail: 'david@example.com', groupSize: 3, startDate: '2026-08-22',
    customDetails: { parks: ['mara', 'tsavo-east'], days: 5, accommodationTier: 'mid', transport: 'motorbike', addOns: ['ad1', 'ad3'] }, totalPrice: 3120, status: 'cancelled', createdAt: '2026-06-30' },
];

export let bookingIdCounter = 1005;
export function nextBookingId() {
  bookingIdCounter += 1;
  return 'BK-' + bookingIdCounter;
}
