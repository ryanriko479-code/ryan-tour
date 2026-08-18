// ==========================================================
// airtable-schema.js — every table/field ID for the "Wild Kenya
// Safaris" Airtable base, in one place. If a field gets renamed or
// re-typed in Airtable, the field ID (fldXXXXXXXXXXXXXX) does NOT
// change, so this file only needs updating if a field is deleted and
// recreated, or a new field is added.
//
// Get these from Airtable: Base → table → field header → "Edit field"
// shows nothing useful; easiest is the API docs at
// https://airtable.com/appYUF0UDGsnWNSwj/api/docs, or ask an LLM with
// Airtable MCP access to run list_tables_for_base.
// ==========================================================

export const BASE_ID = 'appYUF0UDGsnWNSwj';

export const TABLES = {
  PARKS: 'tbloDuJtDE0mgmSKC',
  ACCOMMODATIONS: 'tblKam4CfL4MBE0XD',
  PACKAGES: 'tbloAKw1extzvWFMS',
  PACKAGE_ITINERARY: 'tbl7jijc54wtAg56o',
  ADDONS: 'tblmv5FbzgIAeWkXE',
  REVIEWS: 'tblvybmfT58aQ8LRq',
  USERS: 'tblReiIo6W4GvJWwu',
  BOOKINGS: 'tbldqD0QD9fNzDjNa',
  SETTINGS: 'tblODxkTALlle6auu',
};

export const FIELDS = {
  PARKS: {
    SLUG: 'fldpyIWmSZ1MNGF8E',
    NAME: 'flddB5rRwhiRoCg7B',
    COORDINATES: 'fld9g7d5ybZk3O3to',
    LOCATION: 'fldEYEanHxKvbOxJt',
    DESCRIPTION: 'fldp2LJNllHd1WZ9L',
    HIGHLIGHTS: 'fldW0sywbyYi68DFD',
    WILDLIFE: 'fldOULVw2vYb3VTNV',
    BEST_TIME: 'fldMHCjlGp3Q4MHaB',
    ENTRANCE_FEE: 'fldzsc2mf8fq5ibat',
    STATUS: 'fldW3OVm9wAPcTmKC',
  },
  ACCOMMODATIONS: {
    NAME: 'fldogmRjFNA5Mpb5t',
    LOCATION_TYPE: 'fldjLmORl0cHLVVPM',
    TIER: 'fldAwMYpI7GrTNBg2',
    CAPACITY: 'fldKHIUZdt2G58fD9',
    PRICE_PER_NIGHT: 'fldOFF66AnNWqsMF8',
    AMENITIES: 'fldSf0FFmxgxdhPJD',
    STATUS: 'fldzqmr13unSCdAeE',
    PARK_LINK: 'fldURJ7MFYJ8hXeD2',
  },
  PACKAGES: {
    NAME: 'fldbh1JajiK5wjIwW',
    SLUG: 'fldOEIoAddFKuSpCT',
    DURATION_DAYS: 'fldfpznl36E7dd0B5',
    ACCOMMODATION_TIER: 'fldZmczOjKjBpFlrc',
    TRANSPORT: 'fldW1dgtuwHJITeRW',
    PRICE_PER_PERSON: 'fldNfaanqNxP1y4bQ',
    RATING: 'fldAa7Oct571wuiV3',
    INCLUDED: 'fldwRHEWRSxX2QQbj',
    NOT_INCLUDED: 'fldzvTOHWTIUGOYDp',
    STATUS: 'fldSlQuDZkTCb5h80',
    PARKS_LINK: 'fldzbC01yzElGvzaP',
  },
  PACKAGE_ITINERARY: {
    DAY_NUMBER: 'fldcBA3DS42GuLdw6',
    DESCRIPTION: 'flduOYvVCajHZedKa',
    PACKAGE_LINK: 'fldycppUaG4Fs2ckp',
  },
  ADDONS: {
    NAME: 'fldJtN8CvRG4NIYP2',
    PRICE: 'fldky1kBb6uOHH2Qk',
    CATEGORY: 'fldIvuWmCVWdL4NqH',
  },
  REVIEWS: {
    GUEST_NAME: 'fldB1zqMsmlPOJe6U',
    RATING: 'fldpf9KLTTMiasQPq',
    COMMENT: 'fldDtU8EXgHuyPkpN',
    DATE: 'fldqI4uI0rkk7SyNO',
    STATUS: 'fldHEanH2lHJ0tkY8',
    PARK_LINK: 'fldOMBiU53e5NZ1Zl',
    BOOKING_LINK: 'fldgfKFAJWfDf1RYe',
  },
  USERS: {
    EMAIL: 'fldKWWJZysAgu0Wuw',
    NAME: 'fldY505VMCL7yIzEj',
    ROLE: 'fldft8oKVykSURuDQ',
    BOOKINGS_LINK: 'fldl5rqOWnjLQ0CZt',
    TOTAL_SPEND: 'fldYBT87NEWpImsWZ',
    BOOKING_COUNT: 'fldqetnd6Pu74WwmM',
  },
  BOOKINGS: {
    BOOKING_ID: 'fldGZ7uRIHjddbKH1',
    MODE: 'fld7D5sKsjx43mNde',
    CUSTOM_DAYS: 'fldDVW6xxTlWHv68y',
    CUSTOM_ACCOMMODATION_TIER: 'fld1zo7tSFdiuEyWJ',
    CUSTOM_TRANSPORT: 'fld8YBbgf8cWy3rCQ',
    GROUP_SIZE: 'fldp7N28rZqZzdGjc',
    START_DATE: 'fldIqOjnOqllYZNaK',
    TOTAL_PRICE: 'fldYSkWTEZYShZjXr',
    STATUS: 'fld1EQmVeNbQTtrLM',
    SPECIAL_REQUESTS: 'fldY5tU74OmWREJ9f',
    GUEST_LINK: 'fldnSBHDymlhOXxch',
    PACKAGE_LINK: 'fldnnXnx6EyfMOTsg',
    CUSTOM_PARKS_LINK: 'fldsiXvUrEcDuI8vc',
    ADDONS_LINK: 'fldIWbxqytFPE9TDb',
  },
  SETTINGS: {
    KEY: 'fldO3eRyvHHIBVAoj',
    VALUE: 'fld7pfyCmiRkFqfZP',
    DESCRIPTION: 'fldqvJBFBY3RuN1UZ',
  },
};

// Airtable Attachment fields ("Images") were left empty when the base
// was seeded — no files were uploaded. Until real photos are added in
// Airtable, the Worker falls back to these so cards don't render
// blank. Swap a park/package's entry out once you upload real photos
// to its Images field (and wire the field ID back in transform.js).
export const FALLBACK_IMAGES = {
  parks: {
    amboseli: 'https://images.unsplash.com/photo-1547970810-dc1eac37d174?auto=format&fit=crop&w=800&q=70',
    mara: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=800&q=70',
    'tsavo-east': 'https://images.unsplash.com/photo-1535941339077-2dd1c7963098?auto=format&fit=crop&w=800&q=70',
    'tsavo-west': 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=70',
  },
  packages: {
    'amboseli-elephant-trail': 'https://images.unsplash.com/photo-1547970810-dc1eac37d174?auto=format&fit=crop&w=800&q=70',
    'mara-migration-explorer': 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=800&q=70',
    'tsavo-twin-parks-adventure': 'https://images.unsplash.com/photo-1535941339077-2dd1c7963098?auto=format&fit=crop&w=800&q=70',
    'rift-valley-motorbike-safari': 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=70',
    'grand-kenya-circuit': 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=70',
  },
  accommodationDefault: 'https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?auto=format&fit=crop&w=800&q=70',
};
