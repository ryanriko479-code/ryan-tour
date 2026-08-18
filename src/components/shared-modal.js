// ==========================================================
// shared-modal.js — modal renderer (pure function, no side effects)
// app.js mounts the returned string into #modal-root and clears it
// on close (see data-action="close-modal" handling in app.js).
// ==========================================================

/**
 * @param {{title:string, bodyHtml:string, footerHtml?:string}} opts
 */
export function renderModal({ title, bodyHtml, footerHtml = '' }) {
  return `
  <div class="modal-overlay" data-action="close-modal-backdrop">
    <div class="modal-box glass-strong" onclick="event.stopPropagation()">
      <button class="close-x" data-action="close-modal">✕</button>
      <h3 class="h3">${title}</h3>
      <div style="margin-top:16px;">${bodyHtml}</div>
      ${footerHtml ? `<div style="margin-top:20px;">${footerHtml}</div>` : ''}
    </div>
  </div>`;
}

/** Simple image gallery modal body — an array of image URLs. */
export function renderGalleryBody(images) {
  return `
  <div class="grid grid-2" style="gap:10px;">
    ${images.map((src) => `<div style="height:140px; border-radius:10px; background-size:cover; background-position:center; background-image:url('${src}')"></div>`).join('')}
  </div>`;
}

/** Confirmation modal body — used for destructive actions in the admin dashboard. */
export function renderConfirmBody(message) {
  return `<p>${message}</p>`;
}
