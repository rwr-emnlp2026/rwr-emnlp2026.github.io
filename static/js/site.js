/* Shared behaviour: segmented controls, copy buttons, active section in the top bar. */
(function () {
  window.bindSeg = function (el, onChange) {
    var buttons = Array.prototype.slice.call(el.querySelectorAll("button"));
    function select(btn, focus) {
      buttons.forEach(function (b) {
        var on = b === btn;
        b.setAttribute("aria-selected", String(on));
        b.tabIndex = on ? 0 : -1;
      });
      if (focus) btn.focus();
      onChange(btn.dataset.value);
    }
    buttons.forEach(function (b, i) {
      b.setAttribute("role", "tab");
      b.addEventListener("click", function () { select(b); });
      b.addEventListener("keydown", function (e) {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        var step = e.key === "ArrowRight" ? 1 : -1;
        select(buttons[(i + step + buttons.length) % buttons.length], true);
      });
    });
    el.setAttribute("role", "tablist");
    select(buttons.filter(function (b) { return b.getAttribute("aria-selected") === "true"; })[0] || buttons[0]);
  };

  window.fmt = function (v) { return v == null ? "—" : v.toFixed(2); };

  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var src = document.getElementById(btn.dataset.copy);
      var text = src.textContent;
      var label = btn.querySelector("span");
      var done = function () {
        label.textContent = "Copied";
        setTimeout(function () { label.textContent = "Copy"; }, 1600);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done);
      } else {
        var range = document.createRange();
        range.selectNodeContents(src);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        document.execCommand("copy");
        sel.removeAllRanges();
        done();
      }
    });
  });

  var links = Array.prototype.slice.call(document.querySelectorAll('.toc a[href^="#"]'));
  if ("IntersectionObserver" in window && links.length) {
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove("is-active"); });
        if (byId[e.target.id]) byId[e.target.id].classList.add("is-active");
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    Object.keys(byId).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }
})();
