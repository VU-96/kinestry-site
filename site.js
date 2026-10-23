/* Kinestry — shared behaviour. Linked by every page so the palette works
   everywhere; the kinship demo no-ops on pages without the hero tree. */
(function () {
  'use strict';

  // ── Palette ────────────────────────────────────────────────────────────────
  // The app ships four; so does the site. Nothing is stored but the chosen
  // name, and only so a reader who picked Nocturne is not flashbanged on their
  // next visit. No cookie, no analytics, nothing leaves the browser.
  var KEY = 'kinestry-palette';
  var PAPER = { heirloom:'#ECE4D5', dusk:'#231F1A', archive:'#E9E7E2', nocturne:'#1A1D23' };
  var root = document.documentElement;
  var swatches = [].slice.call(document.querySelectorAll('.sw'));
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  function apply(name, persist) {
    if (name) { root.setAttribute('data-palette', name); }
    else { root.removeAttribute('data-palette'); }
    swatches.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.palette === name));
    });
    if (themeMeta && PAPER[name]) { themeMeta.setAttribute('content', PAPER[name]); }
    if (persist) { try { localStorage.setItem(KEY, name); } catch (e) {} }
  }

  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  // No saved choice means no attribute, which lets prefers-color-scheme decide.
  if (saved && PAPER[saved]) { apply(saved, false); }

  swatches.forEach(function (b) {
    b.addEventListener('click', function () { apply(b.dataset.palette, true); });
  });

  // ── "How are these two related?" ───────────────────────────────────────────
  // The app's best trick, playable in the hero. Five people, so the twenty
  // ordered pairs are simply written out — a kinship engine here would be
  // dishonest anyway, since the real one lives in the app.
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

/* ── The living favicon ──────────────────────────────────────────────────────
   The mark in the tab draws itself: the base, the trunk, the branches out, and
   the five nodes landing one after another. Then it holds, fades, and does it
   again.

   Swapping the icon file is the ONLY method that works. Chrome animates
   neither an animated GIF nor an animated SVG favicon — Firefox animates GIFs,
   Chromium has an open request for it — so a <link> pointing at a GIF freezes
   on frame one. Replacing the href is what every browser repaints.

   The frames come from tool/generate_favicon_anim.dart in the app repo, drawn
   by the same drawMark the phone uses. Do not hand-draw a frame.

   Deliberate, and worth knowing before changing any of it:

   - **What a 16px tab can show is the NODES.** The mark's stroke is under half
     a pixel there and anti-aliases away, so the branches are for the larger
     renderings and the dots arriving are the animation as far as a tab strip
     is concerned. An earlier attempt animated a glow travelling up the mark
     and was, at the size that matters, invisible.
   - **The frames become object URLs first.** Pointing the link at the files
     works, and then the browser asks for an icon on EVERY swap: measured here,
     thirteen requests a second for as long as the page is open. A host with
     cache headers hides it; one without will not. Fetching each frame once
     costs 22 requests ever, on any host.
   - It honours prefers-reduced-motion. Someone who told their operating system
     they do not want movement gets the static mark.
   - The static links are removed only once every frame is in hand, so a failed
     load leaves the tab showing the icon it already had.
   - setTimeout, not setInterval: a throttled background tab queues interval
     callbacks and fires them in a burst, which looks like a glitch. Browsers
     also clamp background timers to about a tick a second, so it crawls there.
     That is the browser, not this code.
   - Everything is wrapped, because a flourish on a sixteen-pixel square must
     never be able to break the page it is decorating. */
(function () {
  'use strict';
  try {
    if (window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.fetch || !window.URL || !URL.createObjectURL) return;

    var FRAMES = 27;
    // 26 frames at 90ms plus 160ms on the hold frame is 2.5s exactly. The
    // odd first number is not a fudge: a GIF stores delays in hundredths of a
    // second, so the avatar cannot run at 92.6ms, and these two keep the tab
    // icon and the profile picture on the same rhythm.
    var MS = 90, FIRST_MS = 160;
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

      var f = 0;
      (function tick() {
        var shown = f;
        link.href = urls[shown];
        f = (f + 1) % FRAMES;
        window.setTimeout(tick, shown === 0 ? FIRST_MS : MS);
      })();
    });
  } catch (e) { /* the tab keeps the static mark */ }
})();
