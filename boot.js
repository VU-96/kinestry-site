(function () {
  var root = document.documentElement;
  try {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window) || !window.requestAnimationFrame) return;
  } catch (e) { return; }
  root.classList.add('anim');
  window.setTimeout(function () {
    if (!window.__home) root.classList.remove('anim');
  }, 3000);
})();
