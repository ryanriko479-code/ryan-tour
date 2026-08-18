# Ryan Tours — API Worker

Cloudflare Worker that sits between the frontend and Airtable. It's
the only thing that holds the Airtable token, and the only thing that
can approve admin actions. See `../docs/api-contract.md` for the full
endpoint list and `src/airtable-schema.js` for the exact table/field
IDs it talks to.

## How admin auth works here

There's no public sign-up and no password database beyond a short,
hand-maintained list (`ADMIN_CREDENTIALS`, a Worker secret — never
committed). Passwords are hashed (SHA-256) before they're ever
compared; `scripts/hash-password.mjs` generates that hash locally so
a real password never needs to be typed into a config file or a chat.
A successful login gets a signed, 12-hour session token back; that
token is required (as `Authorization: Bearer <token>`) for the two
admin-only routes: listing *all* bookings, and updating a booking's
status.

Guests are unaffected — they still just identify by email, no
password, same as before. Only admin actions needed real
verification, since only admin actions can touch every guest's data.

## 1. Test locally first (no Cloudflare account needed for this part)

```bash
cd worker
npm install
npm test          # runs test/worker.test.mjs against a mocked Airtable — should print "24 passed, 0 failed"
```

## 2. Get an Airtable Personal Access Token

1. https://airtable.com/create/tokens → **Create new token**
2. Scopes: `data.records:read`, `data.records:write`
3. Access: only your Airtable base for this project (still internally
   titled **"Wild Kenya Safaris"** in Airtable — the API doesn't support
   renaming a base's title, only tables/fields within it. Rename it by
   hand in the Airtable UI if you want the label to match, it's purely
   cosmetic and doesn't affect the base ID or any field IDs this Worker
   depends on)
4. Save the token (starts with `pat...`) — you'll paste it in step 5

## 3. Generate your admin password hash

```bash
npm run hash-password -- "YourStrongPasswordHere"
```

Copy the JSON object it prints. Repeat for each admin. Combine them
into a single array, e.g.:

```json
[
  {"email":"admin@ryantours.com","name":"Admin User","passwordHash":"..."},
  {"email":"you@ryantours.com","name":"Your Name","passwordHash":"..."}
]
```

## 4. Install Wrangler and log in

```bash
npm install -g wrangler
wrangler login   # opens a browser to authorize against your Cloudflare account
```

If you don't have a Cloudflare account yet: https://dash.cloudflare.com/sign-up (free tier is enough for this).

## 5. Set the three secrets

```bash
wrangler secret put AIRTABLE_TOKEN
# paste the pat... token from step 2, press enter

wrangler secret put ADMIN_CREDENTIALS
# paste the JSON array from step 3, press enter

wrangler secret put SESSION_SECRET
# paste a long random string, e.g. output of:
# node -e "console.log(crypto.randomUUID()+crypto.randomUUID())"
```

## 6. Deploy

```bash
wrangler deploy
```

Wrangler prints a URL like `https://ryan-tours-api.<your-subdomain>.workers.dev`. That's your API base.

## 7. Point the frontend at it

In the main project (not this folder): `src/services/api.js`, update:

```js
const API_BASE_URL = 'https://ryan-tours-api.<your-subdomain>.workers.dev/api/v1';
```

## 8. Lock CORS down (optional but recommended before going public)

Once the frontend has a real deployed URL, edit `wrangler.toml`:

```toml
[vars]
ALLOWED_ORIGIN = "https://your-actual-frontend-domain.com"
```

Then `wrangler deploy` again. Until then, `"*"` keeps local development simple.

## Local dev loop (optional)

```bash
cp .dev.vars.example .dev.vars
# fill in real values in .dev.vars (gitignored, never committed)
npm run dev
# Worker runs at http://localhost:8787 — matches the default
# API_BASE_URL already in the frontend's api.js
```

## What's NOT done yet

The frontend's login page still has demo shortcut buttons and doesn't
call `POST /auth/login` yet — that's the next piece: swap the admin
demo-login button for a real email/password form that calls this
endpoint, store the returned token in `app.js`'s in-memory state, and
attach it as an `Authorization` header on the two admin-gated
`dataLoader` calls (fetching all bookings, updating booking status).
Say the word and I'll wire that up.
