/* 星光闪烁层：首屏星空上的动态星星（纯 Canvas，轻量、尊重系统减少动态偏好） */
(function () {
  var canvas = document.querySelector('.hero .stars');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var stars = [];
  var W = 0, H = 0, raf = 0, visible = true;

  function resize() {
    var hero = canvas.parentElement;
    if (!hero) return;
    W = hero.clientWidth;
    H = hero.clientHeight;
    canvas.width = Math.max(1, Math.round(W * dpr));
    canvas.height = Math.max(1, Math.round(H * dpr));
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.min(260, Math.round((W * H) / 8500));
    stars = [];
    for (var i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.4 + Math.random() * 1.1,
        ph: Math.random() * Math.PI * 2,
        sp: 0.4 + Math.random() * 1.4,
        base: 0.22 + Math.random() * 0.5
      });
    }
  }

  function frame(now) {
    raf = 0;
    var t = now / 1000;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#ffffff';
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var tw = reduced ? 0.8 : 0.55 + 0.45 * Math.sin(s.ph + t * s.sp);
      ctx.globalAlpha = s.base * tw;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, 6.2832);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (visible) raf = requestAnimationFrame(frame);
  }

  function start() {
    if (!raf && visible) raf = requestAnimationFrame(frame);
  }

  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas.parentElement);
  else window.addEventListener('resize', resize);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      start();
    }).observe(canvas);
  }

  resize();
  start();
})();
