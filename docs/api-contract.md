# API contract (implemented — see worker/)

This is the endpoint contract the Cloudflare Worker in `worker/`
actually implements, proxying an Airtable base (still internally
titled "Wild Kenya Safaris" in Airtable itself — that's cosmetic only,
see worker/README.md).
`src/services/api.js` calls these; every function there keeps the
same signature and return shape the old mock-data version had.

## Conventions

- Base URL: `/api/v1`
- All responses: `{ data, error }`
- Auth: `Authorization: Bearer <token>` once JWT auth ships (see README roadmap)
- Dates: ISO 8601 (`YYYY-MM-DD`)

## Endpoints

### Parks
| Method | Path | Notes |
|---|---|---|
| GET | `/parks` | list all parks |
| GET | `/parks/:id` | single park detail |

### Accommodations
| Method | Path | Notes |
|---|---|---|
| GET | `/accommodations?parkId=&tier=` | filterable list |

### Packages
| Method | Path | Notes |
|---|---|---|
| GET | `/packages?parkId=` | filterable list |
| GET | `/packages/:id` | single package detail |
| POST | `/packages` | admin only |
| PATCH | `/packages/:id` | admin only |

### Add-ons
| Method | Path | Notes |
|---|---|---|
| GET | `/addons` | flat list |

### Reviews
| Method | Path | Notes |
|---|---|---|
| GET | `/reviews?parkId=` | filterable list |

### Bookings
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/bookings?guestEmail=` | none | a guest's own bookings |
| GET | `/bookings?status=` (no `guestEmail`) | **admin** | full bookings list — this is what makes it the admin view |
| POST | `/bookings` | none | body: `{ mode, packageId?, customDetails?, guestName, guestEmail, groupSize, startDate, totalPrice, specialRequests? }` — auto-creates the guest's Users record if it doesn't exist yet; `id`/`status` are assigned server-side |
| PATCH | `/bookings/:id/status` | **admin** | `:id` is the human `BK-xxxx` id, body: `{ status }` |

### Auth
| Method | Path | Notes |
|---|---|---|
| POST | `/auth/login` | body: `{ email, password }` → `{ token, user }` on success. Checked against a short hand-maintained admin list (Worker secret `ADMIN_CREDENTIALS`), not a public user table — see `worker/README.md`. Token is a signed, 12-hour session token passed as `Authorization: Bearer <token>` on the two admin-gated routes above. |

## Example: booking object

```json
{
  "id": "BK-1006",
  "mode": "custom",
  "packageId": null,
  "customDetails": {
    "parks": ["mara", "amboseli"],
    "days": 5,
    "accommodationTier": "luxury",
    "transport": "jeep",
    "addOns": ["ad1"]
  },
  "guestName": "Jane Wanjiru",
  "guestEmail": "jane@example.com",
  "groupSize": 2,
  "totalPrice": 4200,
  "status": "pending",
  "createdAt": "2026-08-04",
  "updatedAt": "2026-08-04"
}
```

## Migration notes

- Keep `dataLoader.js`'s exported function names and return shapes
  identical when swapping `api.js` internals — no page or component
  code should need to change.
- Pricing (`calcCustomPricePerPerson` in `utilities/booking.js`) should
  move server-side once real money is involved; the client-side copy
  becomes an estimate only.
