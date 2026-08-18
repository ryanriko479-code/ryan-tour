# Ryan Tours

A vanilla-JS single-page application for a safari tour operator offering
pre-built and custom safari packages across Amboseli, Maasai Mara, and
Tsavo (East & West). No frameworks, no build step — open `index.html`
through a static server and it runs.

Data lives in Airtable, reached through a
Cloudflare Worker (`worker/`, already built and tested) that proxies
Airtable's API — see `docs/api-contract.md` for the endpoint shapes
and `docs/deployment.md` for why the Worker sits between the browser
and Airtable, plus how admin login is verified. Until you deploy it
(`worker/README.md` has the exact steps), `src/services/api.js` points
at a local `http://localhost:8787` placeholder.

## Getting started

```bash
npm install -g http-server   # or use VS Code's "Live Server" extension
http-server .
```

Open `http://localhost:8080`.

> **Why a server and not `file://`?** The app is built with native ES
> modules (`<script type="module">`), which browsers refuse to `import`
> over the `file://` protocol for security reasons. Any static file
> server works.

## Project structure

See `docs/deployment.md` for the deployment pipeline and
`docs/api-contract.md` for the API shape `src/services/api.js` calls
against — that Worker now lives in `worker/`, with its own README.

```
index.html            SPA shell — CSS links + module entry point
styles/                tokens, utilities, and one stylesheet per component
src/
  app.js               kernel — route dispatch + all delegated event wiring
  router.js             hash parsing, navigation, change subscription
  pages/                one module per route, composes components + fetches data
  components/           pure render functions (no side effects)
  services/             async data-access layer (api.js talks to the Worker/Airtable)
  utilities/             helpers, validation, auth, channel links, icons
assets/                 images and icons
docs/                   API contract + deployment notes
worker/                 Cloudflare Worker — Airtable proxy + admin auth (own README)
```

## Key principles

- **No frameworks** — vanilla JS, ES modules, template-string rendering.
- **`dataLoader.js` is the only import surface** pages/components use to
  read or write data. It re-exports `src/services/api.js`, which now
  calls the Worker instead of returning mock arrays — no page or
  component code changed in that swap.
- **Components are pure** — they take data in, return an HTML string,
  and never touch global state or the DOM directly.
- **All event handling is centralized** in `src/app.js` via delegated
  listeners on the `#app` root, matched against `data-*` attributes
  in the rendered markup.
- **Session state is in-memory only** (see `src/utilities/auth.js`) —
  it resets on page reload, matching Phase 1 of the data-layer plan.

## Images

This prototype loads photography directly from Unsplash by URL rather
than shipping binary assets, so `assets/images/**` is kept as the
folder structure the architecture calls for, with a `SOURCES.md` note
in its place — drop optimized local JPEGs in there when you're ready
to self-host imagery.

## Roadmap

See the **Future Enhancements** table in the original architecture
doc: D1 database, real JWT auth, PDF itinerary download, multi-language
support, M-Pesa/Stripe payments, gallery carousel, real-time
availability.
