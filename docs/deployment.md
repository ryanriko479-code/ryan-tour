# Deployment guide

## Phase 1 (current) — static, mock data

**Local development**

```bash
npm install -g http-server   # or use VS Code's "Live Server" extension
http-server .
```

**Staging** — push to a private GitHub repo, enable GitHub Pages on a
`staging` branch.

**Production** — GitHub Pages on `main` (public repo), or point a
custom domain at the Pages deployment via CNAME.

Because this is a pure static site with no build step, GitHub Pages
requires zero configuration beyond enabling it in repo settings and
pointing it at the branch root.

## Phase 2 — Cloudflare Workers + D1

1. Stand up a Cloudflare Workers project alongside this repo (or in a
   `/worker` subfolder) exposing the endpoints in `docs/api-contract.md`.
2. Provision a D1 database and seed it with the same records currently
   in `src/services/mockData.js`.
3. Replace each function body in `src/services/api.js` with a
   `fetch()` call to the Worker — keep exported function names and
   return shapes identical so `dataLoader.js` and everything above it
   needs no changes.
4. Move `assets/images/**` to Cloudflare Images or R2 and update the
   `img` fields in the (now server-side) data.
5. Deploy the static frontend to Cloudflare Pages instead of GitHub
   Pages so frontend + Worker + D1 all live in one account.

## Environment notes

- No `.env` values are required in Phase 1 — everything is mock data
  and public contact links (`src/utilities/channelLinks.js`).
- Once real auth ships, store JWT secrets as Worker environment
  variables/secrets, never in the frontend bundle.

## Phase 2 status: Worker built ✅

The Worker described above now exists in `../worker/` — see
`../worker/README.md` for the exact deploy steps (Airtable token,
admin password hashing, `wrangler secret put`, `wrangler deploy`).
`src/services/api.js` in the frontend already points at it; only the
`API_BASE_URL` constant needs updating once you have a real Worker
URL from `wrangler deploy`.

## GitHub repo setup

No GitHub MCP connector is available in this environment, and this
sandbox has no outbound network access, so I can't push code on your
behalf — these are the manual steps to do it yourself, from a machine
that has both `git` and network access:

1. **Create the repo on GitHub** (empty, no README/gitignore — you
   already have both): https://github.com/new → name it, e.g.
   `ryan-tours` → **Create repository**. Copy the URL it
   gives you, e.g. `https://github.com/<you>/ryan-tours.git`.

2. **Unzip the project** you downloaded from this conversation
   somewhere on your machine, then `cd` into it.

3. **Initialize and push:**
   ```bash
   git init
   git add .
   git commit -m "Ryan Tours: frontend + Airtable-backed Worker"
   git branch -M main
   git remote add origin https://github.com/<you>/ryan-tours.git
   git push -u origin main
   ```

4. **Double-check secrets didn't get committed** — `worker/.gitignore`
   already excludes `.dev.vars` and `.wrangler/`, and real secrets
   live in Cloudflare (`wrangler secret put`), never in this repo. If
   you ever paste a real Airtable token or admin password into a
   tracked file by mistake, treat it as compromised: rotate it
   (new Airtable token, new password → new hash) rather than just
   deleting the line, since it's still in git history.

5. **Enable GitHub Pages** for the frontend (optional, matches
   `docs/deployment.md`): repo **Settings → Pages → Deploy from a
   branch → main → / (root)**. The `worker/` folder deploys
   separately via `wrangler deploy` (step 6 in its README) — Pages
   only needs to serve `index.html`, `styles/`, `src/`, `assets/`.

Once it's pushed, if you connect a GitHub MCP integration in a future
session, I'd be able to open PRs, review diffs, and push follow-up
commits directly instead of walking through zip files.
