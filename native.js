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
