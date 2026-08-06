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
