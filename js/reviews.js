// Home page: the Google reviews carousel. Swipe (or scroll) the row; the arrows and dots follow it. Without JavaScript the row still scrolls by touch.
(function () {
  var track = document.querySelector(".rv-track");
  if (!track) return;
  var cards = track.querySelectorAll(".rv-card");
  var prev = document.querySelector(".rv-prev");
  var next = document.querySelector(".rv-next");
  var dotsBox = document.querySelector(".rv-dots");
  var wrap = document.querySelector(".rv-wrap");
  var dots = [];

  for (var i = 0; i < cards.length; i++) {
    var d = document.createElement("button");
    d.type = "button";
    d.setAttribute("aria-label", "Go to review " + (i + 1));
    d.addEventListener("click", (function (n) { return function () { goTo(n); }; })(i));
    dotsBox.appendChild(d);
    dots.push(d);
  }
  dotsBox.removeAttribute("aria-hidden");

  function calm() { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; }

  function goTo(i) {
    var c = cards[Math.max(0, Math.min(cards.length - 1, i))];
    track.scrollTo({ left: c.offsetLeft - track.offsetLeft, behavior: calm() ? "auto" : "smooth" });
  }

  function current() {
    var best = 0, bestD = Infinity;
    for (var j = 0; j < cards.length; j++) {
      var dist = Math.abs(cards[j].offsetLeft - track.offsetLeft - track.scrollLeft);
      if (dist < bestD) { bestD = dist; best = j; }
    }
    return best;
  }

  function update() {
    var max = track.scrollWidth - track.clientWidth;
    var scrolls = max > 4;
    wrap.classList.toggle("is-static", !scrolls);
    dotsBox.hidden = !scrolls;
    if (!scrolls) return;
    var at = track.scrollLeft >= max - 4 ? cards.length - 1 : current();
    dots.forEach(function (b, j) {
      b.classList.toggle("on", j === at);
      if (j === at) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current");
    });
    prev.disabled = track.scrollLeft <= 4;
    next.disabled = track.scrollLeft >= max - 4;
  }

  prev.addEventListener("click", function () { goTo(current() - 1); });
  next.addEventListener("click", function () { goTo(current() + 1); });
  track.addEventListener("scroll", update, { passive: true });
  track.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { e.preventDefault(); goTo(current() + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); goTo(current() - 1); }
  });
  window.addEventListener("resize", update);
  update();
})();
