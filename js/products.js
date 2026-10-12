// Search and multi-select category filter for the products page. Without JavaScript the full list is shown.
(function () {
  var input = document.getElementById("q");
  var sections = Array.prototype.slice.call(document.querySelectorAll(".cat"));
  var count = document.getElementById("count");
  var empty = document.getElementById("empty");
  var btn = document.getElementById("browse-btn");
  var badge = document.getElementById("browse-badge");
  var panel = document.getElementById("browse-panel");
  var chipsBox = document.getElementById("chips");
  var form = input && input.closest("form");
  if (!input || !sections.length || !panel) return;

  var cats = sections.map(function (sec) {
    return {
      slug: sec.getAttribute("data-cat"),
      name: sec.querySelector(".cat-head h2").textContent,
      desc: sec.querySelector(".cat-head p").textContent,
      total: sec.querySelectorAll(".prod").length
    };
  });
  var total = cats.reduce(function (n, c) { return n + c.total; }, 0);
  var selected = []; // slugs; empty means every category

  function svg(id) {
    return '<svg aria-hidden="true"><use href="#' + id + '"/></svg>';
  }

  function nameOf(slug) {
    return cats.filter(function (c) { return c.slug === slug; })[0].name;
  }

  function terms() {
    return input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  }

  // ---- filtering ----
  function update() {
    var t = terms();
    var shown = 0;
    sections.forEach(function (sec) {
      var inCat = !selected.length || selected.indexOf(sec.getAttribute("data-cat")) !== -1;
      var visible = 0;
      Array.prototype.forEach.call(sec.querySelectorAll(".prod"), function (row) {
        var name = row.getAttribute("data-name");
        var match = inCat && t.every(function (w) { return name.indexOf(w) !== -1; });
        row.hidden = !match;
        if (match) visible++;
      });
      sec.hidden = visible === 0;
      shown += visible;
    });
    empty.hidden = shown !== 0;
    var label = shown === 1 ? "1 product" : shown + " products";
    count.textContent = label;
    var go = panel.querySelector(".browse-go");
    if (go) go.textContent = "Show " + label;
    drawChips();
    badge.textContent = selected.length;
    badge.hidden = !selected.length;
    input.placeholder = selected.length === 1
      ? "Search in " + nameOf(selected[0])
      : "Search all products, e.g. unloader or 13 HP";
  }

  function setSelected(list) {
    selected = list;
    syncChecks();
    update();
  }

  // ---- panel ----
  function buildPanel() {
    var html = '<div class="browse-grid">' + card("", "All products", "", total, true);
    cats.forEach(function (c) { html += card(c.slug, c.name, c.desc, c.total, false); });
    html += '</div><div class="browse-foot"><button class="link-btn browse-clear" type="button">Clear all</button>' +
      '<button class="btn btn-primary browse-go" type="button"></button></div>';
    panel.innerHTML = html;

    Array.prototype.forEach.call(panel.querySelectorAll("input"), function (cb) {
      cb.addEventListener("change", function () {
        if (!cb.value) {
          setSelected([]);
        } else {
          setSelected(Array.prototype.filter.call(panel.querySelectorAll("input[value]:checked"), function (x) { return x.value; })
            .map(function (x) { return x.value; }));
        }
      });
    });
    panel.querySelector(".browse-clear").addEventListener("click", function () { setSelected([]); });
    panel.querySelector(".browse-go").addEventListener("click", function () { open(false); btn.focus(); });
  }

  function card(slug, name, desc, n, all) {
    return '<label class="cat-card' + (all ? " cat-card--all" : "") + '">' +
      '<input type="checkbox" value="' + slug + '">' +
      '<span class="cat-box">' + svg("i-tick") + '</span>' +
      '<span class="cat-name">' + name + '</span><span class="cat-num">' + n + "</span>" +
      (desc ? '<span class="cat-desc">' + desc + "</span>" : "") + "</label>";
  }

  function syncChecks() {
    Array.prototype.forEach.call(panel.querySelectorAll("input"), function (cb) {
      cb.checked = cb.value ? selected.indexOf(cb.value) !== -1 : !selected.length;
    });
  }

  function open(show) {
    panel.hidden = !show;
    btn.setAttribute("aria-expanded", show ? "true" : "false");
  }

  btn.addEventListener("click", function () { open(panel.hidden); });
  document.addEventListener("click", function (e) {
    if (!panel.hidden && !panel.contains(e.target) && !btn.contains(e.target)) open(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden) { open(false); btn.focus(); }
  });

  // ---- chips ----
  function drawChips() {
    chipsBox.textContent = "";
    selected.forEach(function (slug) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "filter-chip";
      b.setAttribute("aria-label", "Remove filter " + nameOf(slug));
      b.appendChild(document.createTextNode(nameOf(slug)));
      var x = document.createElement("i");
      x.setAttribute("aria-hidden", "true");
      x.innerHTML = "&times;";
      b.appendChild(x);
      b.addEventListener("click", function () {
        setSelected(selected.filter(function (s) { return s !== slug; }));
      });
      chipsBox.appendChild(b);
    });
    if (selected.length > 1) {
      var clear = document.createElement("button");
      clear.type = "button";
      clear.className = "link-btn";
      clear.textContent = "Clear all";
      clear.addEventListener("click", function () { setSelected([]); });
      chipsBox.appendChild(clear);
    }
  }

  // ---- search ----
  input.addEventListener("input", update);
  if (form) {
    // Suggestions only offer products from the ticked categories.
    form.hsScope = function (p) { return !selected.length || selected.indexOf(p.s) !== -1; };
    form.addEventListener("hs-pick", function (e) {
      input.value = e.detail.text;
      update();
    });
    if (window.MST_initSearch) window.MST_initSearch(form);
  }

  // ---- start-up: ?q=search from the header, #category from the homepage tiles ----
  buildPanel();
  var q = new URLSearchParams(location.search).get("q");
  if (q) input.value = q;
  var hash = location.hash.replace("#", "");
  var known = cats.some(function (c) { return c.slug === hash; });
  setSelected(known ? [hash] : []);
})();
