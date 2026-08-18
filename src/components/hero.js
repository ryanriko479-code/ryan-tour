// ==========================================================
// hero.js — hero renderer (pure function, no side effects)
// ==========================================================

/**
 * Home page hero — thesis statement + featured park visual.
 * @param {{packagesCount:number, featuredPark:object}} data
 */
export function renderHomeHero({ packagesCount, featuredPark }) {
  return `
  <section class="hero wrap">
    <div class="hero-panel glass-strong">
      <div class="hero-copy">
        <div class="eyebrow">3–7 day custom &amp; pre-built itineraries</div>
        <h1 class="h1" style="margin-top:12px;">Kenya, tracked<br>on your terms.</h1>
        <p class="lead">Choose a ready-made route through Amboseli, the Mara, and Tsavo — or build your own park-by-park, night-by-night, jeep or motorbike. Every safari ends in a real conversation, not a checkout page.</p>
        <div class="hero-cta">
          <button class="btn btn-gold" data-nav="booking">Build your safari</button>
          <button class="btn btn-glass" data-nav="packages">Browse packages</button>
        </div>
        <div class="hero-stats">
          <div class="hero-stat"><div class="num">4</div><div class="lbl">Parks covered</div></div>
          <div class="hero-stat"><div class="num">${packagesCount}</div><div class="lbl">Signature routes</div></div>
          <div class="hero-stat"><div class="num">4.8</div><div class="lbl">Avg. guest rating</div></div>
        </div>
      </div>
      <div class="hero-visual" style="background-image:url('${featuredPark.img}')">
        <div class="float-card glass">
          <div class="coord">${featuredPark.coord}</div>
          <div class="card-title" style="font-size:16px;">${featuredPark.name}</div>
        </div>
      </div>
    </div>
    <div class="feature-strip">
      <div class="glass"><div class="ico">🚙</div><div><div style="font-size:13.5px;color:var(--ink)">Jeep or motorbike</div><div style="font-size:11.5px;color:var(--ink-faint)">Standalone or add-on</div></div></div>
      <div class="glass"><div class="ico">🧭</div><div><div style="font-size:13.5px;color:var(--ink)">Custom builder</div><div style="font-size:11.5px;color:var(--ink-faint)">Park by park, à la carte</div></div></div>
      <div class="glass"><div class="ico">💬</div><div><div style="font-size:13.5px;color:var(--ink)">WhatsApp checkout</div><div style="font-size:11.5px;color:var(--ink-faint)">No cards, real conversation</div></div></div>
    </div>
  </section>`;
}

/**
 * Compact hero used at the top of interior listing pages (packages/parks).
 */
export function renderPageHero({ eyebrow, title, lead }) {
  return `
  <div class="eyebrow">${eyebrow}</div>
  <h1 class="h2" style="margin-top:8px;">${title}</h1>
  ${lead ? `<p style="margin-top:10px; max-width:560px;">${lead}</p>` : ''}
  `;
}
