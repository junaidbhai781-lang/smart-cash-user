/* Native (Android) helpers: back button + no-internet banner. Safe to load in a normal browser too. */
(function () {
  /* ---- No-internet banner ---- */
  var bar = null;
  function showBar(on) {
    try {
      if (!bar) {
        bar = document.createElement('div');
        bar.setAttribute('role', 'status');
        bar.textContent = 'No internet connection. Please check your network.';
        bar.style.cssText = 'position:fixed;left:0;right:0;top:0;z-index:99;padding:calc(env(safe-area-inset-top,0px) + 8px) 12px 8px;background:#b91c1c;color:#fff;font:600 13px/1.3 system-ui,sans-serif;text-align:center;display:none';
        document.body.appendChild(bar);
      }
      bar.style.display = on ? 'block' : 'none';
    } catch (e) {}
  }
  window.addEventListener('offline', function () { showBar(true); });
  window.addEventListener('online', function () { showBar(false); });
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    document.addEventListener('DOMContentLoaded', function () { showBar(true); });
  }

  /* ---- Privacy / Terms links: open in an in-app browser tab (falls back to the normal link) ---- */
  document.addEventListener('click', function (e) {
    try {
      var a = e.target && e.target.closest && e.target.closest('a[data-legal]');
      if (!a) return;
      var Br = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Browser;
      if (!Br || !Br.open) return;            /* no plugin: browser opens the link as usual */
      e.preventDefault();
      Br.open({ url: a.href }).catch(function () { window.open(a.href, '_blank'); });
    } catch (err) {}
  }, true);

  /* ---- Android back button ---- */
  try {
    var App = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
    if (!App || !App.addListener) return;
    App.addListener('backButton', function () {
      try {
        var modal = document.getElementById('modal');
        if (modal && modal.classList.contains('show')) { closeModal(); return; }
        if (hist && hist.length) { back(); return; }
        if (cur && TABS.indexOf(cur.n) > -1 && cur.n !== 'home') { navigateTo('home', null, true); return; }
      } catch (e) {}
      App.exitApp();
    });
  } catch (e) {}
})();

/* ---- Layout helper: asli screen height (--vh) aur bottom-nav ki jagah (--navgap) set karta hai.
        Sirf CSS variables badalta hai; app ka koi logic nahi chhuta. Fail ho to purane rules chalte hain. ---- */
(function () {
  var root = document.documentElement, pend = false;
  function apply() {
    pend = false;
    try {
      var h = window.innerHeight || 0;
      if (h > 0) root.style.setProperty('--vh', (h / 100) + 'px');
      var n = document.getElementById('nav');
      var r = n && n.children.length ? n.getBoundingClientRect() : null;
      if (r && r.height > 0 && h > 0 && r.top < h) {
        root.style.setProperty('--navgap', Math.ceil(h - r.top) + 'px');
      } else {
        root.style.removeProperty('--navgap');
      }
    } catch (e) {}
  }
  function sched() {
    if (pend) return;
    pend = true;
    (window.requestAnimationFrame || setTimeout)(apply, 16);
  }
  try {
    apply();
    window.addEventListener('resize', sched);
    window.addEventListener('orientationchange', function () { setTimeout(sched, 150); });
    window.addEventListener('load', sched);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', sched);
    if (window.MutationObserver) {
      var mo = new MutationObserver(sched);
      var nv = document.getElementById('nav');
      if (nv) mo.observe(nv, { childList: true, subtree: true, attributes: true });
      mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }
    setTimeout(sched, 300); setTimeout(sched, 1200);
  } catch (e) {}
})();
