(function () {
  'use strict';
  var dataEl = document.getElementById('photos-data');
  var canvas = document.getElementById('globe');
  if (!dataEl || !canvas || !window.d3 || !window.topojson) return;

  var data = JSON.parse(dataEl.textContent);
  var stage = document.getElementById('globe-stage');
  var tip = document.getElementById('globe-tip');
  var panel = document.getElementById('photos-panel');
  var ppTitle = document.getElementById('pp-title');
  var ppMeta = document.getElementById('pp-meta');
  var ppGrid = document.getElementById('pp-grid');
  var ppClose = document.getElementById('pp-close');
  var chipList = document.getElementById('photos-places');
  var lb = document.getElementById('lb');
  var lbImg = document.getElementById('lb-img');
  var lbWhere = document.getElementById('lb-where');
  var lbNote = document.getElementById('lb-note');
  var lbCount = document.getElementById('lb-count');
  var lbPrev = document.getElementById('lb-prev');
  var lbNext = document.getElementById('lb-next');
  var lbClose = document.getElementById('lb-close');
  var ctx = canvas.getContext('2d');

  var reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var phoneQuery = window.matchMedia('(max-width: 720px)');
  var reduce = reduceQuery.matches;
  reduceQuery.addEventListener('change', function (e) { reduce = e.matches; dirty = true; });

  /* ── Data ── */
  var byId = {};
  var places = data.places.map(function (p) {
    var o = { id: p.id, name: p.name, region: p.region, lat: p.lat, lon: p.lon, photos: [] };
    byId[o.id] = o;
    return o;
  });
  data.photos.forEach(function (ph) { if (byId[ph.place]) byId[ph.place].photos.push(ph); });
  var pins = places.filter(function (p) { return p.photos.length; });
  pins.forEach(function (p) {
    p.photos.sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
    p.latest = p.photos[0].date;
  });

  var dateFmt = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
  function fmtDate(s) { return dateFmt.format(new Date(s + 'T00:00:00Z')); }
  function placeLabel(p) { return p.name + ', ' + p.region; }
  function plural(n) { return n + (n === 1 ? ' photo' : ' photos'); }

  /* ── Theme tokens (read from CSS so a redesign only edits photos.css) ── */
  var colors = {};
  function readColors() {
    var cs = getComputedStyle(document.getElementById('photos'));
    ['sphere', 'land', 'grid', 'border', 'coast', 'pin', 'pin-ring', 'halo-rgb', 'halo-a'].forEach(function (k) {
      colors[k] = cs.getPropertyValue('--g-' + k).trim();
    });
    colors.glow = cs.getPropertyValue('--g-pin-glow').trim();
    dirty = true;
  }
  new MutationObserver(readColors).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  /* ── Globe state ── */
  var view = { rot: [-10, -22, 0], zoom: 1, ox: 0, oy: 0 };
  var W = 0, H = 0, R0 = 0, dpr = 1;
  var projection = d3.geoOrthographic().clipAngle(90).precision(0.4);
  var path = d3.geoPath(projection, ctx);
  var graticule = d3.geoGraticule10();
  var land = null, borders = null;
  var screenPins = [];
  var hover = null, active = null;
  var anim = null, dirty = true;
  var lastInteract = 0, lastFrame = performance.now();
  var dragging = false, visible = true;

  function resize() {
    var r = stage.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    R0 = Math.min(W, H) / 2 * 0.8;
    if (active) applyPanelOffsets(true);
    dirty = true;
  }
  new ResizeObserver(resize).observe(stage);

  fetch('/photos/vendor/countries-110m.json')
    .then(function (r) { return r.json(); })
    .then(function (world) {
      land = topojson.feature(world, world.objects.land);
      borders = topojson.mesh(world, world.objects.countries, function (a, b) { return a !== b; });
      dirty = true;
    });

  /* ── Drawing ── */
  function pinRadius(p) { return 3.4 + Math.min(p.photos.length, 8) * 0.55; }

  function draw(now) {
    var R = R0 * view.zoom, cx = W / 2 + view.ox, cy = H / 2 + view.oy;
    projection.rotate(view.rot).scale(R).translate([cx, cy]);
    ctx.clearRect(0, 0, W, H);

    var halo = ctx.createRadialGradient(cx, cy, R * 0.96, cx, cy, R * 1.3);
    halo.addColorStop(0, 'rgba(' + colors['halo-rgb'] + ',' + colors['halo-a'] + ')');
    halo.addColorStop(1, 'rgba(' + colors['halo-rgb'] + ',0)');
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.3, 0, 2 * Math.PI); ctx.fill();

    ctx.beginPath(); path({ type: 'Sphere' });
    ctx.fillStyle = colors.sphere; ctx.fill();

    ctx.beginPath(); path(graticule);
    ctx.strokeStyle = colors.grid; ctx.lineWidth = 0.6; ctx.stroke();

    if (land) {
      ctx.beginPath(); path(land); ctx.fillStyle = colors.land; ctx.fill();
      ctx.beginPath(); path(borders); ctx.strokeStyle = colors.border; ctx.lineWidth = 0.6; ctx.stroke();
      ctx.beginPath(); path(land); ctx.strokeStyle = colors.coast; ctx.lineWidth = 0.9; ctx.stroke();
    }

    ctx.beginPath(); path({ type: 'Sphere' });
    ctx.strokeStyle = colors.coast; ctx.globalAlpha = 0.35; ctx.lineWidth = 1; ctx.stroke(); ctx.globalAlpha = 1;

    var center = [-view.rot[0], -view.rot[1]];
    var zoomBoost = 1 + (view.zoom - 1) * 0.45;
    var t = reduce ? 0 : (now || 0);
    screenPins = [];
    pins.forEach(function (p) {
      var dist = d3.geoDistance([p.lon, p.lat], center);
      if (dist >= Math.PI / 2 - 0.02) return;
      var xy = projection([p.lon, p.lat]);
      if (!xy) return;
      var fade = Math.min(1, (Math.PI / 2 - dist) * 4);
      var r = pinRadius(p) * zoomBoost * (p === hover || p === active ? 1.25 : 1);
      screenPins.push({ p: p, x: xy[0], y: xy[1], r: r, fade: fade });
    });
    screenPins.sort(function (a, b) { return a.y - b.y; });

    screenPins.forEach(function (s, i) {
      var g = s.r * 3.4;
      ctx.globalAlpha = s.fade;
      var gr = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, g);
      gr.addColorStop(0, 'rgba(' + colors.glow + ',0.55)');
      gr.addColorStop(0.45, 'rgba(' + colors.glow + ',0.18)');
      gr.addColorStop(1, 'rgba(' + colors.glow + ',0)');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(s.x, s.y, g, 0, 2 * Math.PI); ctx.fill();

      if (!reduce) {
        var ph = ((t / 2400) + i * 0.137) % 1;
        ctx.strokeStyle = 'rgba(' + colors.glow + ',' + (0.38 * (1 - ph)).toFixed(3) + ')';
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r + ph * s.r * 2.6, 0, 2 * Math.PI); ctx.stroke();
      }

      ctx.fillStyle = colors.pin;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 2 * Math.PI); ctx.fill();
      ctx.strokeStyle = colors['pin-ring']; ctx.lineWidth = 1.4; ctx.stroke();
      if (s.p === active) {
        ctx.strokeStyle = colors.pin; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r + 5, 0, 2 * Math.PI); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    });
  }

  /* ── Animation loop ── */
  function lerp(a, b, k) { return a + (b - a) * k; }

  function frame(now) {
    requestAnimationFrame(frame);
    var dt = Math.min(64, now - lastFrame); lastFrame = now;
    if (!visible || document.hidden) return;

    if (anim) {
      var k = Math.min(1, (now - anim.t0) / anim.dur), e = d3.easeCubicInOut(k);
      view.rot = [lerp(anim.from.rot[0], anim.to.rot[0], e), lerp(anim.from.rot[1], anim.to.rot[1], e), 0];
      view.zoom = lerp(anim.from.zoom, anim.to.zoom, e);
      view.ox = lerp(anim.from.ox, anim.to.ox, e);
      view.oy = lerp(anim.from.oy, anim.to.oy, e);
      if (k >= 1) anim = null;
      dirty = true;
    } else if (!reduce && !dragging && !active && !hover && !lbOpen() && now - lastInteract > 2500) {
      view.rot[0] += dt * 0.0042;
      dirty = true;
    }
    if (!reduce || dirty) { draw(now); dirty = false; }
  }
  new IntersectionObserver(function (en) { visible = en[0].isIntersecting; dirty = true; }).observe(stage);

  function animateTo(target, dur) {
    var from = { rot: view.rot.slice(), zoom: view.zoom, ox: view.ox, oy: view.oy };
    var to = { rot: target.rot || from.rot, zoom: target.zoom != null ? target.zoom : from.zoom,
               ox: target.ox != null ? target.ox : from.ox, oy: target.oy != null ? target.oy : from.oy };
    var d = ((to.rot[0] - from.rot[0] + 540) % 360) - 180;
    to.rot = [from.rot[0] + d, to.rot[1], 0];
    if (reduce || !dur) {
      view.rot = to.rot; view.zoom = to.zoom; view.ox = to.ox; view.oy = to.oy; anim = null;
    } else {
      anim = { t0: performance.now(), dur: dur, from: from, to: to };
    }
    dirty = true;
  }

  /* ── Panel + selection ── */
  var panelOffsets = { ox: 0, oy: 0 };
  function applyPanelOffsets(instant) {
    var phone = phoneQuery.matches;
    var ox = 0, oy = 0;
    if (phone) {
      var sheetH = window.innerHeight * 0.52;
      var stageBottom = 8 + H;
      oy = -Math.max(0, stageBottom - (window.innerHeight - sheetH)) / 2;
    } else {
      ox = -Math.min(360, W * 0.44) / 2;
    }
    panelOffsets = { ox: ox, oy: oy };
    if (instant) { view.ox = ox; view.oy = oy; view.zoom = phone ? 1.7 : 2.1; dirty = true; }
  }

  function selectPlace(p, opener) {
    active = p; hover = null; hideTip();
    lastInteract = performance.now();
    var sr = stage.getBoundingClientRect();
    if (phoneQuery.matches) {
      window.scrollTo({ top: sr.top + window.scrollY - 8, behavior: reduce ? 'auto' : 'smooth' });
    } else if (sr.top < 0 || sr.bottom > window.innerHeight) {
      var gap = Math.max(8, (window.innerHeight - sr.height) / 2);
      window.scrollTo({ top: sr.top + window.scrollY - gap, behavior: reduce ? 'auto' : 'smooth' });
    }
    applyPanelOffsets(false);
    animateTo({ rot: [-p.lon, Math.max(-70, Math.min(70, -p.lat)), 0], zoom: phoneQuery.matches ? 1.7 : 2.1,
                ox: panelOffsets.ox, oy: panelOffsets.oy }, 1100);

    ppTitle.textContent = p.name;
    ppMeta.textContent = p.region + '  ·  ' + plural(p.photos.length);
    ppGrid.textContent = '';
    ppGrid.scrollTop = 0;
    p.photos.forEach(function (ph, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'pp-thumb';
      b.setAttribute('aria-label', 'Open photo ' + (i + 1) + ' of ' + p.photos.length + (ph.note ? ': ' + ph.note : ''));
      var img = document.createElement('img');
      img.src = '/assets/photos/thumb/' + ph.file; img.alt = ''; img.loading = 'lazy'; img.decoding = 'async';
      b.appendChild(img);
      b.addEventListener('click', function () { openLightbox(p, i, b); });
      ppGrid.appendChild(b);
    });
    panel.classList.add('open'); panel.setAttribute('aria-hidden', 'false');
    syncChips();
    if (opener && opener.dataset && opener.dataset.chip) { /* keep focus on chip */ }
    dirty = true;
  }

  function closePanel() {
    if (!active) return;
    active = null;
    panel.classList.remove('open'); panel.setAttribute('aria-hidden', 'true');
    animateTo({ zoom: 1, ox: 0, oy: 0 }, 900);
    lastInteract = performance.now();
    syncChips();
  }
  ppClose.addEventListener('click', closePanel);

  /* ── Place chips (keyboard + touch friendly list) ── */
  var chips = {};
  pins.slice().sort(function (a, b) { return a.latest < b.latest ? 1 : -1; }).forEach(function (p) {
    var li = document.createElement('li'), b = document.createElement('button');
    b.type = 'button'; b.dataset.chip = p.id;
    b.textContent = p.name + ' · ' + p.photos.length;
    b.addEventListener('click', function () { selectPlace(p, b); });
    li.appendChild(b); chipList.appendChild(li); chips[p.id] = b;
  });
  function syncChips() {
    Object.keys(chips).forEach(function (id) { chips[id].classList.toggle('active', !!active && active.id === id); });
  }

  /* ── Pointer interaction ── */
  function pinAt(x, y) {
    var best = null, bd = 1e9;
    screenPins.forEach(function (s) {
      var d = Math.hypot(s.x - x, s.y - y), reach = Math.max(14, s.r + 8);
      if (d < reach && d < bd) { best = s.p; bd = d; }
    });
    return best;
  }
  function local(e) { var r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }

  var start = null;
  canvas.addEventListener('pointerdown', function (e) {
    canvas.setPointerCapture(e.pointerId);
    var l = local(e);
    start = { x: l[0], y: l[1], px: l[0], py: l[1], moved: false };
    anim = null; lastInteract = performance.now();
  });
  canvas.addEventListener('pointermove', function (e) {
    var l = local(e);
    if (start) {
      var dx = l[0] - start.px, dy = l[1] - start.py;
      if (!start.moved && Math.hypot(l[0] - start.x, l[1] - start.y) > 5) { start.moved = true; dragging = true; canvas.classList.add('dragging'); hideTip(); }
      if (start.moved) {
        var sens = 70 / (R0 * view.zoom);
        view.rot = [view.rot[0] + dx * sens, Math.max(-85, Math.min(85, view.rot[1] - dy * sens)), 0];
        dirty = true;
      }
      start.px = l[0]; start.py = l[1];
      lastInteract = performance.now();
      return;
    }
    if (e.pointerType === 'mouse') {
      var p = pinAt(l[0], l[1]);
      if (p !== hover) { hover = p; dirty = true; canvas.classList.toggle('over-pin', !!p); }
      if (p) showTip(p, l[0], l[1]); else hideTip();
    }
  });
  function endPointer(e) {
    if (!start) return;
    var wasMove = start.moved, l = local(e);
    start = null; dragging = false; canvas.classList.remove('dragging');
    lastInteract = performance.now();
    if (wasMove) return;
    var p = pinAt(l[0], l[1]);
    if (p) selectPlace(p);
    else if (active) closePanel();
  }
  canvas.addEventListener('pointerup', endPointer);
  canvas.addEventListener('pointercancel', function () { start = null; dragging = false; canvas.classList.remove('dragging'); });
  canvas.addEventListener('pointerleave', function () { if (!start) { hover = null; hideTip(); canvas.classList.remove('over-pin'); dirty = true; } });

  function showTip(p, x, y) {
    var s = screenPins.filter(function (q) { return q.p === p; })[0];
    tip.textContent = p.name + ' · ' + plural(p.photos.length);
    tip.style.left = (s ? s.x : x) + 'px'; tip.style.top = ((s ? s.y - s.r : y) - 12) + 'px';
    tip.hidden = false;
  }
  function hideTip() { tip.hidden = true; }

  /* ── Lightbox ── */
  var lbPlace = null, lbIndex = 0, lbOpener = null;
  function lbOpen() { return !lb.hidden; }

  function showPhoto() {
    var ph = lbPlace.photos[lbIndex];
    lbImg.src = '/assets/photos/full/' + ph.file;
    lbImg.alt = lbPlace.name + (ph.note ? ' – ' + ph.note : '');
    lbWhere.textContent = placeLabel(lbPlace) + '  ·  ' + fmtDate(ph.date);
    lbNote.textContent = ph.note || '';
    var n = lbPlace.photos.length;
    lbCount.textContent = n > 1 ? (lbIndex + 1) + ' / ' + n : '';
    lbPrev.hidden = lbNext.hidden = n < 2;
    [lbIndex + 1, lbIndex - 1].forEach(function (i) {
      var nb = lbPlace.photos[(i + n) % n]; if (nb) new Image().src = '/assets/photos/full/' + nb.file;
    });
  }
  function openLightbox(p, i, opener) {
    lbPlace = p; lbIndex = i; lbOpener = opener || null;
    showPhoto();
    lb.hidden = false;
    requestAnimationFrame(function () { lb.classList.add('show'); });
    document.documentElement.style.overflow = 'hidden';
    lbClose.focus();
  }
  function closeLightbox() {
    if (!lbOpen()) return;
    lb.classList.remove('show'); lb.hidden = true;
    document.documentElement.style.overflow = '';
    if (lbOpener) lbOpener.focus();
  }
  function step(d) { var n = lbPlace.photos.length; lbIndex = (lbIndex + d + n) % n; showPhoto(); }
  lbPrev.addEventListener('click', function (e) { e.stopPropagation(); step(-1); });
  lbNext.addEventListener('click', function (e) { e.stopPropagation(); step(1); });
  lbClose.addEventListener('click', closeLightbox);
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb-fig')) closeLightbox(); });

  var sx = null;
  lbImg.addEventListener('pointerdown', function (e) { sx = e.clientX; });
  lbImg.addEventListener('pointerup', function (e) {
    if (sx == null) return;
    var dx = e.clientX - sx; sx = null;
    if (Math.abs(dx) > 50 && lbPlace.photos.length > 1) step(dx < 0 ? 1 : -1);
  });

  document.addEventListener('keydown', function (e) {
    if (lbOpen()) {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowRight' && lbPlace.photos.length > 1) step(1);
      else if (e.key === 'ArrowLeft' && lbPlace.photos.length > 1) step(-1);
      else if (e.key === 'Tab') {
        var f = [lbClose, lbPrev, lbNext].filter(function (b) { return !b.hidden; });
        var i = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    } else if (e.key === 'Escape' && active) {
      closePanel();
    }
  });

  readColors();
  resize();
  requestAnimationFrame(frame);
})();
