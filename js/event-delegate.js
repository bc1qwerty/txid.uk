/**
 * Global event delegation — replaces all inline onclick/onchange handlers
 * for CSP script-src-attr compliance (no 'unsafe-inline' needed)
 */
(function () {
  'use strict';

  // Font loading: replace onload="this.media='all'" with JS listener
  document.querySelectorAll('link[data-loadmedia]').forEach(function (link) {
    link.addEventListener('load', function () { this.media = this.dataset.loadmedia; });
  });

  // Click delegation
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-dismiss]');
    if (el) {
      var target = document.getElementById(el.dataset.dismiss);
      if (target) target.remove();
      return;
    }

    el = e.target.closest('[data-dismiss-overlay]');
    if (el && e.target === el) {
      el.remove();
      return;
    }

    el = e.target.closest('[data-copy]');
    if (el) {
      if (typeof copyToClip === 'function') copyToClip(el.dataset.copy, el);
      return;
    }

    el = e.target.closest('[data-copy-text]');
    if (el) {
      var text = el.dataset.copyText;
      var btn = el;
      var origLabel = el.dataset.labelCopied || 'Copied';
      var origText = el.dataset.labelDefault || el.textContent;
      navigator.clipboard.writeText(text).then(function () {
        btn.textContent = origLabel;
      });
      setTimeout(function () { btn.textContent = origText; }, 1500);
      return;
    }

    el = e.target.closest('[data-nav]');
    if (el) {
      location.hash = el.dataset.nav;
      return;
    }

    el = e.target.closest('[data-fav-toggle]');
    if (el) {
      e.stopPropagation();
      if (typeof toggleFavorite === 'function') {
        toggleFavorite(el.dataset.favType, el.dataset.favValue, el.dataset.favLabel);
      }
      return;
    }

    el = e.target.closest('[data-fav-remove]');
    if (el) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof removeFavorite === 'function') {
        removeFavorite(el.dataset.favType, el.dataset.favValue);
        var sec = document.getElementById('fav-section');
        if (sec) sec.remove();
        if (typeof route === 'function') route();
      }
      return;
    }

    el = e.target.closest('[data-action]');
    if (el) {
      var fn = el.dataset.action;
      var a1 = el.dataset.arg;
      var a2 = el.dataset.arg2;
      var handler = window[fn] || (window.App && window.App[fn]);
      if (typeof handler === 'function') {
        if (a2 !== undefined) handler(a1, a2);
        else if (a1 !== undefined) handler(a1);
        else handler();
      }
      return;
    }

    el = e.target.closest('[data-save-notes]');
    if (el) {
      var addr = el.dataset.saveNotes;
      var textarea = document.getElementById('addr-notes-text');
      if (textarea) {
        localStorage.setItem('addr_notes_' + addr, textarea.value);
        var modal = document.getElementById('addr-notes-modal');
        if (modal) modal.remove();
        if (typeof showToast === 'function') showToast('\u{1f4dd}', el.dataset.savedMsg || 'Saved', null, 2000);
      }
      return;
    }

    el = e.target.closest('[data-block-txs]');
    if (el) {
      if (typeof loadBlockTxs === 'function') {
        loadBlockTxs(el.dataset.hash, parseInt(el.dataset.total), parseInt(el.dataset.offset));
      }
      return;
    }

    el = e.target.closest('[data-addr-txs]');
    if (el) {
      if (typeof loadAddrTxs === 'function') {
        loadAddrTxs(el.dataset.address, el.dataset.lastId);
      }
      return;
    }

    el = e.target.closest('[data-treemap]');
    if (el) {
      if (typeof openBlockTreemap === 'function') {
        openBlockTreemap(el.dataset.treemap, parseInt(el.dataset.height));
      }
      return;
    }
  });

  // Change delegation
  document.addEventListener('change', function (e) {
    var el = e.target.closest('[data-onchange]');
    if (el) {
      var fn = window[el.dataset.onchange];
      if (typeof fn === 'function') fn();
    }
  });

  // Input delegation
  document.addEventListener('input', function (e) {
    var el = e.target.closest('[data-oninput]');
    if (el) {
      var fn = window[el.dataset.oninput];
      if (typeof fn === 'function') fn();
    }
  });
})();
