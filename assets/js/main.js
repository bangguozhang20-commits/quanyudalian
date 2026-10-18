/* 隆一堂 — interactions: bilingual toggle, nav, reveal, floating contact, forms */
(function () {
  var html = document.documentElement;

  /* ---------- bilingual (zh default, data-en attributes) ---------- */
  function cacheZh() {
    document.querySelectorAll('[data-en]').forEach(function (el) {
      if (!el.hasAttribute('data-zh')) el.setAttribute('data-zh', el.innerHTML);
    });
    document.querySelectorAll('[data-en-ph]').forEach(function (el) {
      if (!el.hasAttribute('data-zh-ph')) el.setAttribute('data-zh-ph', el.getAttribute('placeholder') || '');
    });
  }
  function setLang(lang) {
    cacheZh();
    var en = lang === 'en';
    document.querySelectorAll('[data-en]').forEach(function (el) {
      el.innerHTML = en ? el.getAttribute('data-en') : el.getAttribute('data-zh');
    });
    document.querySelectorAll('[data-en-ph]').forEach(function (el) {
      el.setAttribute('placeholder', en ? el.getAttribute('data-en-ph') : el.getAttribute('data-zh-ph'));
    });
    html.setAttribute('lang', en ? 'en' : 'zh-CN');
    document.querySelectorAll('.lang-sw button').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-lang') === lang);
    });
    try { localStorage.setItem('lyt-lang', lang); } catch (e) {}
  }
  var saved = 'zh';
  try { saved = localStorage.getItem('lyt-lang') || 'zh'; } catch (e) {}
  document.querySelectorAll('.lang-sw button').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
  });
  setLang(saved);

  /* ---------- mobile nav ---------- */
  var burger = document.querySelector('.burger');
  var nav = document.querySelector('nav.main');
  if (burger && nav) burger.addEventListener('click', function () { nav.classList.toggle('open'); });

  /* ---------- reveal on scroll ---------- */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });

  /* ---------- floating contact ---------- */
  var panel = document.querySelector('.float-panel');
  var chatBtn = document.querySelector('.fbtn.chat');
  if (chatBtn && panel) chatBtn.addEventListener('click', function () { panel.classList.toggle('open'); });
  var topBtn = document.querySelector('.fbtn.top');
  window.addEventListener('scroll', function () {
    if (topBtn) topBtn.classList.toggle('show', window.scrollY > 500);
  }, { passive: true });
  if (topBtn) topBtn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* ---------- copy links (Douyin / WeChat Channels) ---------- */
  var toast = document.querySelector('.toast');
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg; toast.classList.add('show');
    setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }
  document.querySelectorAll('[data-copy]').forEach(function (el) {
    el.addEventListener('click', function (ev) {
      ev.preventDefault();
      var url = el.getAttribute('data-copy');
      var zh = html.getAttribute('lang') !== 'en';
      var done = function () { showToast(zh ? '链接已复制，打开对应 App 查看' : 'Link copied — open it in the app'); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done).catch(function () { window.open(url, '_blank'); });
      } else { window.open(url, '_blank'); }
    });
  });

  /* ---------- inquiry form ---------- */
  document.querySelectorAll('form.quote').forEach(function (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var zh = html.getAttribute('lang') !== 'en';
      var d = function (n) { var f = form.querySelector('[name="' + n + '"]'); return f ? f.value.trim() : ''; };
      var body = [
        'Name: ' + d('name'), 'Company: ' + d('company'), 'Country/Region: ' + d('country'),
        'Phone/WeChat: ' + d('phone'), 'Interested Product: ' + d('product'),
        'Estimated Quantity: ' + d('qty'), '', 'Message:', d('msg')
      ].join('\n');
      var ok = form.querySelector('.form-ok');
      if (ok) {
        ok.style.display = 'block';
        ok.innerHTML = zh
          ? '询盘已生成邮件草稿，发送后我们的招商团队将在 24 小时内回复。您也可以直接拨打招商热线 <b>175 4276 3058</b>。'
          : 'Your inquiry has been drafted as an email. Our team replies within 24 hours — or call us at <b>+86 175 4276 3058</b>.';
      }
      window.location.href = 'mailto:sales@longyitang.com?subject=' +
        encodeURIComponent('[B2B Inquiry] ' + d('company') + ' — ' + d('product')) +
        '&body=' + encodeURIComponent(body);
    });
  });

  /* ---------- footer year ---------- */
  document.querySelectorAll('.js-year').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
