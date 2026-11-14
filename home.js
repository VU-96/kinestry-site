(function () {
  'use strict';
  var root = document.documentElement;
  var anim = root.classList.contains('anim');
  window.__home = true;

  function $$(s, el) { return [].slice.call((el || document).querySelectorAll(s)); }
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function mq(q) { return !!(window.matchMedia && window.matchMedia(q).matches); }


  var heroCta = document.querySelector('.hero .cta');
  if (heroCta) {
    var navTick = false;
    var navSwap = function () {
      navTick = false;
      root.classList.toggle('top-coffee', heroCta.getBoundingClientRect().bottom > 76);
    };
    window.addEventListener('scroll', function () {
      if (!navTick) { navTick = true; requestAnimationFrame(navSwap); }
    }, { passive: true });
    window.addEventListener('resize', navSwap);
    navSwap();
  }

  var faqs = $$('.qa details');
  var canAnimate = anim && typeof document.body.animate === 'function';
  faqs.forEach(function (d) {
    var sum = d.querySelector('summary');
    var ans = d.querySelector('.ans');
    sum.addEventListener('click', function (e) {
      if (!canAnimate) {
        if (!d.open) faqs.forEach(function (o) { if (o !== d) o.open = false; });
        return;
      }
      e.preventDefault();
      if (d._busy) return;
      if (d.open) { shut(d); return; }
      faqs.forEach(function (o) { if (o !== d && o.open) shut(o); });
      d.open = true;
      d._busy = true;
      var h = ans.scrollHeight;
      var a = ans.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }],
        { duration: 550, easing: 'cubic-bezier(.22,1,.36,1)' });
      a.onfinish = a.oncancel = function () { d._busy = false; };
    });
  });
  function shut(d) {
    var ans = d.querySelector('.ans');
    d._busy = true;
    var a = ans.animate([{ height: ans.scrollHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }],
      { duration: 420, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' });
    a.onfinish = function () { d.open = false; a.cancel(); d._busy = false; };
  }

  if (!anim) return;

  var marquee = document.querySelector('.marquee');
  var track = marquee && marquee.querySelector('.marquee-track');
  var toggle = document.querySelector('.marquee-toggle');
  if (marquee && track) {
    var dur = parseFloat(getComputedStyle(track).animationDuration) || 70;
    track.style.animationDelay = (-Math.random() * dur).toFixed(2) + 's';
    var run = track.getAnimations ? track.getAnimations()[0] : null;
    if (toggle) {
      toggle.addEventListener('click', function () {
        var paused = marquee.classList.toggle('paused');
        toggle.textContent = paused ? 'Play' : 'Pause';
      });
    }
    marquee.addEventListener('touchstart', function () { marquee.classList.add('held'); }, { passive: true });
    ['touchend', 'touchcancel'].forEach(function (ev) {
      marquee.addEventListener(ev, function () { marquee.classList.remove('held'); }, { passive: true });
    });
    if (run) {
      var lastY = window.pageYOffset || 0, boost = 0, spinning = false;
      var spin = function () {
        boost *= 0.92;
        run.playbackRate = 1 + boost;
        if (boost > 0.01) requestAnimationFrame(spin);
        else { run.playbackRate = 1; spinning = false; }
      };
      window.addEventListener('scroll', function () {
        var y = window.pageYOffset || 0;
        var v = Math.abs(y - lastY); lastY = y;
        boost = Math.min(3, boost + v / 120);
        if (!spinning) { spinning = true; requestAnimationFrame(spin); }
      }, { passive: true });
    }
  }

  var hero = document.querySelector('.hero');
  var grove = document.querySelector('.grove');

  function startHero() {
    $$('[data-a]', hero).forEach(function (el) { el.classList.add('in'); });
    if (grove) grove.classList.add('grown');
  }
  var started = false;
  function go() { if (started) return; started = true; requestAnimationFrame(function () { requestAnimationFrame(startHero); }); }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(go, go);
    window.setTimeout(go, 700);
  } else { go(); }

  var big = document.querySelector('.big');
  var words = [];
  if (big) {
    var text = big.textContent.replace(/\s+/g, ' ').trim();
    big.textContent = '';
    text.split(' ').forEach(function (w, i, all) {
      var s = document.createElement('span');
      s.className = 'w';
      s.textContent = w;
      big.appendChild(s);
      if (i < all.length - 1) big.appendChild(document.createTextNode(' '));
      words.push({ el: s, cur: 0.18 });
    });
    big.setAttribute('aria-label', text);
  }

  var STEP = { phone: 120, 'feature-card': 110 };
  var io = new IntersectionObserver(function (entries) {
    var batch = entries.filter(function (e) { return e.isIntersecting; }).map(function (e) { return e.target; });
    if (batch.some(function (el) { return el.classList.contains('phone'); })) {
      $$('.phone').forEach(function (ph) { if (batch.indexOf(ph) < 0 && !ph.classList.contains('in')) batch.push(ph); });
      batch.sort(function (x, y) { return x.compareDocumentPosition(y) & 4 ? -1 : 1; });
    }
    batch.forEach(function (el, i) {
      var step = 90;
      for (var k in STEP) { if (el.classList.contains(k)) step = STEP[k]; }
      el.style.setProperty('--d', (i * step) + 'ms');
      el.classList.add('in');
      io.unobserve(el);
      if (el.classList.contains('feature-card')) {
        window.setTimeout(function () { el.classList.add('settled'); el.style.removeProperty('--d'); }, 900 + i * step);
      }
    });
  }, { rootMargin: '0px 0px -14% 0px', threshold: 0.01 });

  $$('[data-a]').forEach(function (el) { if (!hero.contains(el)) io.observe(el); });
  $$('.phone, .feature-card').forEach(function (el) { io.observe(el); });

  var fine = mq('(hover: hover) and (pointer: fine)');
  var layers = [
    { el: document.querySelector('.hero-shapes-back'), x: 45, y: 22 },
    { el: document.querySelector('.hero-shapes-mid'), x: 22, y: 11 },
    { el: document.querySelector('.hero-copy'), x: 8, y: 5 },
    { el: document.querySelector('.g1'), x: 6, y: 3 },
    { el: document.querySelector('.g2'), x: 12, y: 6 },
    { el: document.querySelector('.g3'), x: 20, y: 10 },
    { el: document.querySelector('.vines'), x: 11, y: 5.5 }
  ].filter(function (l) { return l.el; });
  var mouse = { tx: 0, ty: 0, x: 0, y: 0 };

  var browser = document.querySelector('.browser');
  var desk = document.getElementById('desktop');
  var privacy = document.getElementById('privacy');
  var phonesWrap = document.querySelector('.phones');
  var drifts = $$('.phone').map(function (p) {
    return { el: p.querySelector('.drift'), depth: Number(p.getAttribute('data-depth') || 0), cur: 0 };
  });
  var desk3d = { cur: 0 };

  function targets() {
    var vh = window.innerHeight || 800;
    var out = {};
    if (desk && browser) {
      var r = desk.getBoundingClientRect();
      out.desk = clamp((0.85 * vh - r.top) / (0.30 * vh + r.height / 2));
    }
    if (privacy && words.length) {
      var q = privacy.getBoundingClientRect();
      out.words = clamp((0.72 * vh - q.top) / (0.27 * vh + q.height / 2));
    }
    if (phonesWrap && window.innerWidth > 900) {
      var w = phonesWrap.getBoundingClientRect();
      out.drift = clamp((vh - w.top) / (vh + w.height));
    } else { out.drift = null; }
    return out;
  }

  var running = false;
  function tick() {
    var t = targets(), moving = false, k = 0.14;

    if (t.desk !== undefined) {
      desk3d.cur += (t.desk - desk3d.cur) * k;
      if (Math.abs(t.desk - desk3d.cur) > 0.001) moving = true;
      var p = desk3d.cur;
      browser.style.transform = 'translateY(' + (40 * (1 - p)).toFixed(2) + 'px) rotateX(' +
        (24 * (1 - p)).toFixed(2) + 'deg) scale(' + (0.9 + 0.1 * p).toFixed(4) + ')';
    }

    if (t.words !== undefined) {
      var n = words.length, stag = 0.12, total = 1 + stag * (n - 1);
      words.forEach(function (w, i) {
        var target = 0.18 + 0.82 * clamp(t.words * total - stag * i);
        w.cur += (target - w.cur) * k;
        if (Math.abs(target - w.cur) > 0.002) moving = true;
        w.el.style.opacity = w.cur.toFixed(3);
      });
    }

    drifts.forEach(function (d) {
      var target = t.drift === null ? 0 : d.depth * -46 * t.drift;
      d.cur += (target - d.cur) * k;
      if (Math.abs(target - d.cur) > 0.05) moving = true;
      d.el.style.transform = d.cur ? 'translateY(' + d.cur.toFixed(2) + 'px)' : '';
    });

    if (fine) {
      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;
      if (Math.abs(mouse.tx - mouse.x) > 0.001 || Math.abs(mouse.ty - mouse.y) > 0.001) moving = true;
      layers.forEach(function (l) {
        l.el.style.transform = 'translate(' + (mouse.x * l.x).toFixed(2) + 'px,' + (mouse.y * l.y).toFixed(2) + 'px)';
      });
    }

    if (moving) requestAnimationFrame(tick); else running = false;
  }
  function kick() { if (!running) { running = true; requestAnimationFrame(tick); } }
  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', kick);
  window.addEventListener('load', kick);
  kick();

  if (fine && hero) {
    hero.addEventListener('mousemove', function (e) {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
      kick();
    });
    hero.addEventListener('mouseleave', function () { mouse.tx = 0; mouse.ty = 0; kick(); });

    $$('.phone').forEach(function (p) {
      var f = p.querySelector('.frame');
      p.addEventListener('mousemove', function (e) {
        var r = p.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        f.style.transform = 'rotateY(' + (px * 12).toFixed(2) + 'deg) rotateX(' + (-py * 12).toFixed(2) + 'deg)';
      });
      p.addEventListener('mouseleave', function () { f.style.transform = ''; });
    });
  }
})();
