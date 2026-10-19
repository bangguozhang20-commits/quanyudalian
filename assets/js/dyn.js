/* 隆一堂 — 动态站点数据渲染（后台可改：电话/邮箱/社媒/价格） */
(function () {
  var DEFAULTS = {
    phone: "175 4276 3058",
    email: "sales@quanyudalian.asia",
    douyin: "https://v.douyin.com/mIwWgKdWmxI/",
    channels: "https://weixin.qq.com/sph/AzSOc0yxKF",
    prices: { dried: "¥2,999", ready: "¥1,899", royal: "¥698", classic: "¥698" }
  };

  window.SITE_DATA = null;

  function digits(s) { return (s || "").replace(/\D/g, ""); }

  /* 文本节点替换：兜底覆盖英文切换后的 innerHTML 重写 */
  function replaceInTextNodes(root, fromRe, to) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode, tag = p && p.nodeName;
        if (tag === "SCRIPT" || tag === "STYLE" || tag === "TEXTAREA") return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [], n;
    while ((n = walker.nextNode())) if (fromRe.test(n.nodeValue)) nodes.push(n);
    nodes.forEach(function (n) { n.nodeValue = n.nodeValue.replace(fromRe, to); });
  }

  window.applySiteData = function () {
    var d = window.SITE_DATA || DEFAULTS;

    /* 电话链接与显示 */
    document.querySelectorAll('[data-field="phone-link"]').forEach(function (a) {
      a.setAttribute("href", "tel:+86" + digits(d.phone));
    });
    document.querySelectorAll('[data-field="phone"]').forEach(function (el) {
      el.textContent = d.phone;
    });
    var oldPhoneRe = /175[\s\u00A0]?4276[\s\u00A0]?3058/;
    if (!oldPhoneRe.test(d.phone)) {
      replaceInTextNodes(document.body, oldPhoneRe, d.phone);
    }

    /* 社媒复制链接 */
    document.querySelectorAll('[data-copy-field="douyin"]').forEach(function (el) {
      el.setAttribute("data-copy", d.douyin);
    });
    document.querySelectorAll('[data-copy-field="channels"]').forEach(function (el) {
      el.setAttribute("data-copy", d.channels);
    });

    /* 产品价格 */
    var prices = d.prices || {};
    Object.keys(prices).forEach(function (k) {
      document.querySelectorAll('[data-price="' + k + '"]').forEach(function (el) {
        el.textContent = prices[k];
      });
    });
  };

  /* 读取站点数据（相对站点根，兼容子目录页面） */
  var me = document.querySelector('script[src*="dyn.js"]');
  var base = me ? me.src.replace(/assets\/js\/dyn\.js.*$/, "") : "/";
  fetch(base + "data/site.json", { cache: "no-cache" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) { if (j && typeof j === "object") { window.SITE_DATA = j; window.applySiteData(); } })
    .catch(function () { /* 静态兜底值已写在 HTML 中 */ });
})();
