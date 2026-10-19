// Custom pressure washers, phones: the dots under the five-choices cards follow the swipe and jump to a card when tapped.
(function () {
  var row = document.querySelector(".choose-path");
  var dots = document.querySelectorAll(".path-dots button");
  var swipe = document.querySelector(".path-swipe");
  if (!row || !dots.length) return;
  var cards = row.querySelectorAll("li");

  function pad() {
    return parseFloat(getComputedStyle(row).paddingLeft) || 0;
  }

  function atEnd() {
    var max = row.scrollWidth - row.clientWidth;
    return max > 0 && row.scrollLeft >= max - 4;
  }

  function update() {
    var edge = row.getBoundingClientRect().left + pad();
    var index = 0;
    var best = Infinity;
    for (var i = 0; i < cards.length; i++) {
      var d = Math.abs(cards[i].getBoundingClientRect().left - edge);
      if (d < best) { best = d; index = i; }
    }
    if (atEnd()) index = cards.length - 1;
    for (var j = 0; j < dots.length; j++) dots[j].classList.toggle("on", j === index);
    if (swipe) swipe.classList.toggle("is-end", atEnd());
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      var card = cards[i];
      if (!card) return;
      var left = row.scrollLeft + card.getBoundingClientRect().left - row.getBoundingClientRect().left - pad();
      var smooth = !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
      row.scrollTo({ left: left, behavior: smooth ? "smooth" : "auto" });
    });
  });

  row.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
})();
