// Mobile menu toggle. Without JavaScript the links simply stay visible.
(function () {
  var button = document.querySelector(".menu-toggle");
  var nav = document.getElementById("site-nav");
  if (!button || !nav) return;

  function setOpen(open) {
    button.setAttribute("aria-expanded", open ? "true" : "false");
    nav.setAttribute("data-open", open ? "true" : "false");
    button.textContent = open ? "Close" : "Menu";
  }

  button.addEventListener("click", function () {
    setOpen(button.getAttribute("aria-expanded") !== "true");
  });

  nav.addEventListener("click", function (event) {
    if (event.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") setOpen(false);
  });
})();

// Wide screens: hide the nav pills while scrolling down, bring them back on scroll up.
(function () {
  var header = document.querySelector(".site-header");
  if (!header || !window.matchMedia) return;
  var wide = window.matchMedia("(min-width: 900px)");
  var last = window.scrollY;
  var queued = false;

  function update() {
    var y = window.scrollY;
    header.classList.toggle("scrolled", y > 30); // homepage CSS fades a soft band in behind the header
    if (wide.matches && y > last + 6 && y > 120) header.classList.add("nav-hidden");
    else if (!wide.matches || y < last - 6 || y <= 120) header.classList.remove("nav-hidden");
    last = y;
    queued = false;
  }

  window.addEventListener("scroll", function () {
    if (!queued) { queued = true; window.requestAnimationFrame(update); }
  }, { passive: true });

  // Keyboard users tabbing into the header always get the full bar.
  var nav = header.querySelector(".site-nav");
  if (nav) nav.addEventListener("focusin", function () { header.classList.remove("nav-hidden"); });
})();

// Light / dark switch. Follows the device until the visitor picks a side, then remembers the choice.
(function () {
  var toggle = document.getElementById("theme-toggle");
  if (!toggle) return;
  var root = document.documentElement;
  var query = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function effective() {
    var set = root.getAttribute("data-theme");
    if (set === "light" || set === "dark") return set;
    return query && query.matches ? "dark" : "light";
  }

  function show() {
    toggle.setAttribute("aria-checked", effective() === "dark" ? "true" : "false");
  }

  toggle.hidden = false;
  show();

  toggle.addEventListener("click", function () {
    var next = effective() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("mst-theme", next); } catch (e) { /* private mode: still works for this visit */ }
    show();
  });

  if (query && query.addEventListener) query.addEventListener("change", show);
})();

// Page glow: on the home page it starts where the hero photo ends.
(function () {
  var hero = document.querySelector(".hero");
  var main = document.getElementById("main");
  if (!hero || !main) return;
  function place() {
    main.style.setProperty("--glow-top", hero.offsetHeight + "px");
  }
  place();
  window.addEventListener("resize", place);
  window.addEventListener("load", place);
})();
