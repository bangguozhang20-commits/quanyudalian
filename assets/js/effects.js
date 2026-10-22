/* 隆一堂 — 动效：海洋涟漪 / 磁吸按钮 / 药丸滑动导航 / 苹果式轮播 */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 海洋涟漪（首屏画布） ---------- */
  var hero = document.querySelector('.hero-ocean');
  var cv = document.getElementById('sea');
  if (hero && cv && !reduce) {
    var ctx = cv.getContext('2d');
    var W = 0, H = 0;
    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = hero.clientWidth; H = hero.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    var ripples = [];
    var last = { x: -999, y: -999, t: 0 };
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      var x = e.clientX - r.left, y = e.clientY - r.top, t = performance.now();
      var dx = x - last.x, dy = y - last.y;
      if (dx * dx + dy * dy > 900 || t - last.t > 90) {
        ripples.push({ x: x, y: y, r: 4, a: 0.5, big: false });
        last = { x: x, y: y, t: t };
      }
    }, { passive: true });
    hero.addEventListener('pointerdown', function (e) {
      var r = hero.getBoundingClientRect();
      ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, r: 6, a: 0.8, big: true });
    });

    var bubbles = [];
    for (var i = 0; i < 14; i++) {
      bubbles.push({ x: Math.random(), y: Math.random(), s: Math.random() * 2.2 + 1, v: Math.random() * 0.25 + 0.12, w: Math.random() * 6.28 });
    }

    var t0 = performance.now(), running = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { running = es[0].isIntersecting; }).observe(hero);
    }

    function wave(base, amp, len, phase, color) {
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (var x = 0; x <= W; x += 8) {
        ctx.lineTo(x, base + Math.sin(x / len + phase) * amp + Math.sin(x / (len * 0.53) - phase * 1.4) * amp * 0.4);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    }

    function frame(now) {
      requestAnimationFrame(frame);
      if (!running) return;
      var t = (now - t0) / 1000;
      ctx.clearRect(0, 0, W, H);

      wave(H * 0.60, 16, 130, t * 0.9, 'rgba(30, 96, 145, 0.18)');
      wave(H * 0.71, 20, 100, -t * 0.7, 'rgba(24, 78, 122, 0.28)');
      wave(H * 0.84, 14, 160, t * 0.5, 'rgba(10, 44, 74, 0.55)');

      bubbles.forEach(function (b) {
        b.y -= b.v / 600;
        if (b.y < -0.05) { b.y = 1.05; b.x = Math.random(); }
        ctx.beginPath();
        ctx.arc(b.x * W + Math.sin(t * 0.8 + b.w) * 14, b.y * H, b.s, 0, 6.29);
        ctx.fillStyle = 'rgba(125, 184, 218, 0.28)';
        ctx.fill();
      });

      for (var i = ripples.length - 1; i >= 0; i--) {
        var p = ripples[i];
        p.r += p.big ? 3.2 : 2.2;
        p.a *= 0.955;
        if (p.a < 0.02) { ripples.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.29);
        ctx.strokeStyle = 'rgba(158, 209, 240,' + p.a + ')';
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 0.62, 0, 6.29);
        ctx.strokeStyle = 'rgba(201, 169, 97,' + p.a * 0.7 + ')';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
    requestAnimationFrame(frame);
  }

  /* ---------- 磁吸按钮（悬停微移 + 弹簧复位） ---------- */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    var springBack = 'transform .5s cubic-bezier(.34,1.56,.64,1), background-color .25s, color .25s, border-color .25s';
    var followTr = 'transform .18s ease-out, background-color .25s, color .25s, border-color .25s';
    document.querySelectorAll('.btn').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * 0.28;
        var dy = (e.clientY - (r.top + r.height / 2)) * 0.4;
        dx = Math.max(-9, Math.min(9, dx));
        dy = Math.max(-6, Math.min(6, dy));
        el.style.transition = followTr;
        el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      });
      el.addEventListener('pointerleave', function () {
        el.style.transition = springBack;
        el.style.transform = '';
      });
    });
  }

  /* ---------- 药丸导航滑动背景（layoutId 等效实现） ---------- */
  var nav = document.querySelector('nav.main');
  if (nav && !reduce) {
    var pill = document.createElement('span');
    pill.className = 'nav-pill';
    pill.setAttribute('aria-hidden', 'true');
    nav.insertBefore(pill, nav.firstChild);
    var items = nav.querySelectorAll(':scope > a:not(.nav-cta)');
    function moveTo(a) {
      pill.style.left = a.offsetLeft + 'px';
      pill.style.width = a.offsetWidth + 'px';
      pill.style.opacity = '1';
    }
    items.forEach(function (a) {
      a.addEventListener('pointerenter', function () { moveTo(a); });
      a.addEventListener('focus', function () { moveTo(a); });
    });
    nav.addEventListener('pointerleave', function () { pill.style.opacity = '0'; });
  }

  /* ---------- 苹果式卡片轮播 ---------- */
  var track = document.getElementById('carTrack');
  if (track) {
    var cards = Array.prototype.slice.call(track.children);
    var dotsWrap = document.getElementById('carDots');
    var dots = [];
    function targetLeft(c) {
      return c.offsetLeft + c.offsetWidth / 2 - track.clientWidth / 2;
    }
    function scrollToCard(i) {
      i = Math.max(0, Math.min(cards.length - 1, i));
      track.scrollTo({ left: targetLeft(cards[i]), behavior: 'smooth' });
    }
    function current() {
      var center = track.scrollLeft + track.clientWidth / 2;
      var best = 0, bd = Infinity;
      cards.forEach(function (c, i) {
        var d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - center);
        if (d < bd) { bd = d; best = i; }
      });
      return best;
    }
    if (dotsWrap) {
      cards.forEach(function (_, i) {
        var d = document.createElement('button');
        d.className = 'car-dot' + (i === 0 ? ' on' : '');
        d.setAttribute('aria-label', '第' + (i + 1) + '张');
        d.addEventListener('click', function () { scrollToCard(i); });
        dotsWrap.appendChild(d);
        dots.push(d);
      });
    }
    cards[0].classList.add('on');
    var tick = false;
    track.addEventListener('scroll', function () {
      if (tick) return;
      tick = true;
      requestAnimationFrame(function () {
        var i = current();
        cards.forEach(function (c, j) { c.classList.toggle('on', j === i); });
        dots.forEach(function (d, j) { d.classList.toggle('on', j === i); });
        tick = false;
      });
    }, { passive: true });
    var prev = document.querySelector('.car-btn.prev');
    var next = document.querySelector('.car-btn.next');
    if (prev) prev.addEventListener('click', function () { scrollToCard(current() - 1); });
    if (next) next.addEventListener('click', function () { scrollToCard(current() + 1); });
    setTimeout(function () { scrollToCard(0); }, 80);
  }
})();
