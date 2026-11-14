(function () {
  'use strict';

  try { localStorage.removeItem('kinestry-palette'); } catch (e) {}
  document.documentElement.removeAttribute('data-palette');

  var NAME = { ibrahim:'Ibrahim', fatima:'Fatima', nadia:'Nadia', khalid:'Khalid', dina:'Dina' };
  var REL = {
    'ibrahim|fatima':'husband','fatima|ibrahim':'wife',
    'ibrahim|nadia':'father','nadia|ibrahim':'daughter',
    'ibrahim|khalid':'grandfather','khalid|ibrahim':'grandson',
    'ibrahim|dina':'grandfather','dina|ibrahim':'granddaughter',
    'fatima|nadia':'mother','nadia|fatima':'daughter',
    'fatima|khalid':'grandmother','khalid|fatima':'grandson',
    'fatima|dina':'grandmother','dina|fatima':'granddaughter',
    'nadia|khalid':'mother','khalid|nadia':'son',
    'nadia|dina':'mother','dina|nadia':'daughter',
    'khalid|dina':'brother','dina|khalid':'sister'
  };
  var caption = document.getElementById('kin');
  var nodes = [].slice.call(document.querySelectorAll('.node[data-person]'));
  var picked = [];

  function say(text, lit) {
    if (!caption) { return; }
    caption.textContent = text;
    caption.classList.toggle('on', !!lit);
  }
  function paint() {
    nodes.forEach(function (n) {
      n.setAttribute('aria-pressed', String(picked.indexOf(n.dataset.person) !== -1));
    });
  }

  nodes.forEach(function (n) {
    n.addEventListener('click', function () {
      var id = n.dataset.person;
      var at = picked.indexOf(id);
      if (at !== -1) { picked.splice(at, 1); }
      else if (picked.length < 2) { picked.push(id); }
      else { picked = [id]; }

      if (picked.length === 2) {
        var rel = REL[picked[0] + '|' + picked[1]];
        say(rel ? NAME[picked[0]] + ' is ' + NAME[picked[1]] + "'s " + rel + '.' : '', true);
      } else if (picked.length === 1) {
        say('Now tap someone else.', false);
      } else {
        say("Tap two people to see how they're related.", false);
      }
      paint();
    });
  });
})();

(function () {
  'use strict';

  function start() {
    try {
      if (window.matchMedia &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (!window.fetch || !window.URL || !URL.createObjectURL) return;
      var c = navigator.connection || navigator.mozConnection;
      if (c && (c.saveData === true ||
                /^(slow-2g|2g|3g)$/.test(c.effectiveType || ''))) return;
      run();
    } catch (e) {  }
  }
  function whenIdle(fn) {
    if (window.requestIdleCallback) window.requestIdleCallback(fn, {timeout: 4000});
    else window.setTimeout(fn, 1200);
  }
  if (document.readyState === 'complete') whenIdle(start);
  else window.addEventListener('load', function () { whenIdle(start); }, {once: true});

  function run() {
    var FRAMES = 27;
    var MS = 50, FIRST_MS = 100;
    var LOOPS = 3;
    var head = document.head;
    var statics = [].slice.call(head.querySelectorAll('link[rel~="icon"]'));
    if (!statics.length) return;

    var paths = [];
    for (var i = 0; i < FRAMES; i++) {
      paths.push('favicon-anim/f' + ('0' + i).slice(-2) + '.png');
    }

    Promise.all(paths.map(function (p) {
      return fetch(p)
        .then(function (r) { return r.ok ? r.blob() : Promise.reject(); })
        .then(function (b) { return URL.createObjectURL(b); })
        .catch(function () { return null; });
    })).then(function (urls) {
      if (urls.some(function (u) { return !u; })) return; // leave it static
      var link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      statics.forEach(function (l) { l.remove(); });
      head.appendChild(link);

      var f = 0, loops = 0;
      (function tick() {
        var shown = f;
        link.href = urls[shown];
        f = (f + 1) % FRAMES;
        if (f === 0 && ++loops >= LOOPS) return;
        window.setTimeout(tick, shown === 0 ? FIRST_MS : MS);
      })();
    });
  }
})();

(function () {
  var items = [].slice.call(document.querySelectorAll('.reveal'));
  if (!items.length) return;
  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('js-reveal');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
  items.forEach(function (el) { io.observe(el); });
})();

(function () {
  var items = [].slice.call(document.querySelectorAll('details[name="faq"]'));
  if (items.length < 2) return;
  var native = 'name' in document.createElement('details');
  if (native) return;
  items.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      items.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });
})();


(function () {
  var grove = document.querySelector('.grove');
  if (!grove) return;
  if (window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia || !window.matchMedia('(hover: hover)').matches) return;

  var DEPTH = { n1: 4, n2: 4, n3: 9, n4: 15, n5: 15 };
  var nodes = [].slice.call(grove.querySelectorAll('.node'));
  var vines = grove.querySelector('.vines');
  var tx = 0, ty = 0, cx = 0, cy = 0, running = false;

  function frame() {
    cx += (tx - cx) * 0.085;
    cy += (ty - cy) * 0.085;
    nodes.forEach(function (el) {
      var d = 0;
      for (var k in DEPTH) { if (el.classList.contains(k)) d = DEPTH[k]; }
      el.style.setProperty('--px', (cx * d).toFixed(2) + 'px');
      el.style.setProperty('--py', (cy * d * 0.5).toFixed(2) + 'px');
    });
    if (vines) {
      vines.style.transform = 'translate(' + (cx * 7).toFixed(2) + 'px,' +
                              (cy * 3.5).toFixed(2) + 'px)';
    }
    if (Math.abs(tx - cx) > 0.01 || Math.abs(ty - cy) > 0.01) {
      requestAnimationFrame(frame);
    } else { running = false; }
  }
  function start() { if (!running) { running = true; requestAnimationFrame(frame); } }

  window.addEventListener('pointermove', function (e) {
    var r = grove.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    tx = (e.clientX / window.innerWidth - 0.5) * 2;
    ty = (e.clientY / window.innerHeight - 0.5) * 2;
    start();
  }, { passive: true });

  window.addEventListener('blur', function () { tx = 0; ty = 0; start(); });
  grove.addEventListener('pointerleave', function () { tx = 0; ty = 0; start(); });
})();

(function () {
  var figs = [].slice.call(document.querySelectorAll('.shotrow figure'));
  if (!figs.length) return;
  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('js-deal');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      figs.forEach(function (f, i) {
        setTimeout(function () { f.classList.add('dealt'); }, i * 110);
      });
      io.disconnect();
    });
  }, { rootMargin: '0px 0px -14% 0px', threshold: 0.15 });
  io.observe(figs[0].parentNode);
})();
