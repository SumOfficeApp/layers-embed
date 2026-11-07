/*! layers-door.js: open, fill in and sign .docx/.xlsx/.pptx files in Layers. MIT, SumOffice. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.LayersDoor = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';

  var APP = 'https://app.layers.md';
  var SITE = 'https://layers.md';
  var OFFICE = /\.(docx|xlsx|pptx)$/i;

  function tag(from) {
    return String(from || 'door').toLowerCase().replace(/[^a-z0-9._-]+/g, '-').slice(0, 80);
  }

  function absolute(file) {
    var base = typeof location !== 'undefined' ? location.href : undefined;
    try { return new URL(file, base); } catch (e) { return null; }
  }

  function isOfficeFile(file) {
    var u = absolute(file);
    return !!u && (u.protocol === 'https:' || u.protocol === 'http:') && OFFICE.test(u.pathname);
  }

  // Link that opens the file in Layers: read it, edit it, send it for signature, save a copy.
  function viewerUrl(file, from) {
    var u = absolute(file);
    if (!u || !isOfficeFile(u.href)) return null;
    u.hash = '';
    return APP + '/v1/public/viewer/open#' + new URLSearchParams({ url: u.href, from: tag(from) }).toString();
  }

  // Live document or table from the Layers catalog (4,000+ letters, contracts, calculators).
  function formUrl(slug, from, embed) {
    var q = new URLSearchParams({ from: tag(from) });
    if (embed !== false) q.set('embed', '1');
    return APP + '/t/' + encodeURIComponent(slug) + '?' + q.toString();
  }

  function signUpUrl(from) { return APP + '/register?from=' + encodeURIComponent(tag(from)); }
  function pricingUrl(from) { return SITE + '/pricing?from=' + encodeURIComponent(tag(from)); }

  // Server side (Node 18+): import a public file and get a ready link to it.
  function open(file, from, fetchImpl) {
    var f = fetchImpl || fetch;
    return f(APP + '/v1/public/viewer/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: String(file), from: tag(from) })
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (b) {
        if (!r.ok) throw new Error(b.error || 'ERR_VIEWER_IMPORT_' + r.status);
        return b;
      });
    });
  }

  return {
    APP: APP, SITE: SITE, tag: tag, isOfficeFile: isOfficeFile,
    viewerUrl: viewerUrl, formUrl: formUrl, signUpUrl: signUpUrl, pricingUrl: pricingUrl, open: open
  };
});

/* Layers embed: turns .docx/.xlsx/.pptx links into "Open, fill in, sign" buttons and inserts live documents. */
(function () {
  'use strict';
  var D = window.LayersDoor;
  if (!D || window.__layersEmbed) return;
  window.__layersEmbed = true;

  var me = document.currentScript;
  var host = (location.hostname || 'local').replace(/^www\./, '');
  var from = (me && me.getAttribute('data-from')) || ('door-embed-' + host);
  var allLinks = me && me.getAttribute('data-links') === 'all';
  var label = (me && me.getAttribute('data-label')) || 'Open, fill in, sign';

  function css() {
    if (document.getElementById('layers-embed-css')) return;
    var s = document.createElement('style');
    s.id = 'layers-embed-css';
    s.textContent =
      '.layers-open{display:inline-flex;align-items:center;gap:6px;margin:0 0 0 8px;padding:3px 10px;border:1px solid #185abc;' +
      'border-radius:999px;background:#fff;color:#185abc;font:600 13px/1.6 system-ui,sans-serif;text-decoration:none;vertical-align:middle}' +
      '.layers-open:hover{background:#185abc;color:#fff}' +
      '.layers-form{display:block;width:100%;border:1px solid #ddd;border-radius:10px;background:#fff}';
    document.head.appendChild(s);
  }

  function button(a) {
    if (a.dataset.layersDone) return;
    var href = D.viewerUrl(a.href, from);
    if (!href) return;
    a.dataset.layersDone = '1';
    var b = document.createElement('a');
    b.className = 'layers-open';
    b.href = href;
    b.target = '_blank';
    b.rel = 'noopener';
    b.textContent = label;
    b.title = 'Opens this file in Layers. Nothing to install.';
    a.insertAdjacentElement('afterend', b);
  }

  function form(el) {
    if (el.dataset.layersDone) return;
    el.dataset.layersDone = '1';
    var f = document.createElement('iframe');
    f.className = 'layers-form';
    f.src = D.formUrl(el.getAttribute('data-layers-form'), from);
    f.height = el.getAttribute('data-height') || '760';
    f.loading = 'lazy';
    f.title = el.getAttribute('data-title') || 'Live document';
    f.allow = 'clipboard-write';
    el.appendChild(f);
  }

  function scan(root) {
    css();
    var sel = allLinks ? 'a[href]' : 'a[data-layers]';
    root.querySelectorAll(sel).forEach(button);
    root.querySelectorAll('[data-layers-form]').forEach(form);
  }

  window.LayersEmbed = { scan: scan, from: from };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { scan(document); });
  else scan(document);
})();
