// ==========================================================
// footer.js — footer renderer (pure function, no side effects)
// ==========================================================

import { waLink, mailLink, telLink } from '../utilities/channelLinks.js';

export function renderFooter() {
  return `
  <footer class="site">
    <div class="wrap">
      <div class="footer-panel glass">
        <div>
          <div class="brand" style="margin-bottom:12px;"><span class="mark">RT</span> Ryan Tours</div>
          <p style="max-width:260px; font-size:13px;">Custom and pre-built safaris across Amboseli, the Maasai Mara, and Tsavo. Every booking closes over WhatsApp or email — no card details, ever.</p>
          <div class="channel-links">
            <a href="${waLink('Hi! I would like to know more about your safari packages.')}" target="_blank" title="WhatsApp">💬</a>
            <a href="${mailLink('Safari inquiry', 'Hi Ryan Tours team,')}" title="Email">✉️</a>
            <a href="${telLink()}" title="Call">📞</a>
          </div>
        </div>
        <div class="footer-cols">
          <div class="footer-col">
            <h4>Explore</h4>
            <a href="#/packages">Packages</a>
            <a href="#/parks">Parks</a>
            <a href="#/accommodations">Accommodations</a>
            <a href="#/booking">Build a safari</a>
          </div>
          <div class="footer-col">
            <h4>Contact</h4>
            <div>+254 700 000 000</div>
            <div>info@ryantours.com</div>
            <div>Nairobi, Kenya</div>
          </div>
          <div class="footer-col">
            <h4>Prototype</h4>
            <div style="font-family:var(--font-mono); font-size:11.5px;">Phase 1 · mock data</div>
            <div style="font-family:var(--font-mono); font-size:11.5px;">v0.1.0</div>
          </div>
        </div>
      </div>
    </div>
  </footer>`;
}
