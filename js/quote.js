// "Request a quote" pop-up. Any link to mailto:Sales@mstindustrial.co.za?subject=Quote... opens it.
// Without JavaScript (or an old browser) those links still open an email as before.
(function () {
  if (typeof HTMLDialogElement === "undefined") return;

  var EMAIL = "Sales@mstindustrial.co.za";
  var dlg, form, productRow, productName, formView, doneView, lastFocus;

  function build() {
    dlg = document.createElement("dialog");
    dlg.className = "quote-dialog";
    dlg.setAttribute("aria-labelledby", "quote-title");
    dlg.innerHTML =
      '<div class="quote-card">' +
        '<button class="quote-close" type="button" aria-label="Close">&times;</button>' +
        '<div class="quote-view" data-view="form">' +
          '<h2 id="quote-title">Request a quote</h2>' +
          '<p class="quote-lead">Tell us how to reach you and we will come back with a price.</p>' +
          '<p class="quote-product" hidden>Quote for: <strong></strong></p>' +
          '<form novalidate>' +
            field("name", "Your name", "text", "name", true, "") +
            field("email", "Email address", "email", "email", true, "") +
            field("phone", "Contact number", "tel", "tel", true, ' inputmode="tel" pattern="[0-9+()\\s\\-]{9,}"') +
            field("company", "Company name <span class=\"quote-opt\">(optional)</span>", "text", "organization", false, "") +
            '<div class="quote-field"><label for="quote-message">What do you need a price on? <span class="quote-opt">(optional)</span></label>' +
            '<textarea id="quote-message" name="message" rows="3"></textarea></div>' +
            '<div class="quote-actions">' +
              '<button class="btn btn-primary" type="submit">Send request</button>' +
              '<button class="btn btn-secondary" type="button" data-close>Cancel</button>' +
            '</div>' +
            '<p class="quote-note">Sending opens your email app with these details filled in, ready to send to ' + EMAIL + '.</p>' +
          '</form>' +
        '</div>' +
        '<div class="quote-view" data-view="done" hidden>' +
          '<h2>Nearly done</h2>' +
          '<p class="quote-lead">Your email app should now be open with your request ready to send. Press send there to finish.</p>' +
          '<p class="quote-lead">Nothing opened? Email <a href="mailto:' + EMAIL + '">' + EMAIL + '</a> or call <a href="tel:+27619790504">061 979 0504</a>.</p>' +
          '<div class="quote-actions"><button class="btn btn-primary" type="button" data-close>Close</button></div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(dlg);

    form = dlg.querySelector("form");
    productRow = dlg.querySelector(".quote-product");
    productName = productRow.querySelector("strong");
    formView = dlg.querySelector('[data-view="form"]');
    doneView = dlg.querySelector('[data-view="done"]');

    dlg.addEventListener("click", function (e) {
      if (e.target === dlg || e.target.closest(".quote-close, [data-close]")) dlg.close();
    });
    dlg.addEventListener("close", function () {
      document.documentElement.classList.remove("modal-open");
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    });
    form.addEventListener("submit", submit);
    form.addEventListener("input", function (e) { if (e.target.getAttribute("aria-invalid")) validate(e.target); });
  }

  function field(name, label, type, auto, required, extra) {
    return '<div class="quote-field">' +
      '<label for="quote-' + name + '">' + label + (required ? ' <span class="quote-req" aria-hidden="true">*</span>' : "") + "</label>" +
      '<input id="quote-' + name + '" name="' + name + '" type="' + type + '" autocomplete="' + auto + '"' + (required ? " required" : "") + extra + ">" +
      '<p class="quote-error" id="quote-' + name + '-err" hidden></p></div>';
  }

  var MESSAGES = {
    name: "Please enter your name.",
    email: "Please enter a valid email address.",
    phone: "Please enter a contact number, for example 061 979 0504."
  };

  function validate(input) {
    var err = document.getElementById(input.id + "-err");
    if (!err) return true;
    var ok = input.checkValidity();
    input.setAttribute("aria-invalid", ok ? "" : "true");
    if (ok) input.removeAttribute("aria-invalid");
    input.setAttribute("aria-describedby", ok ? "" : err.id);
    if (ok) input.removeAttribute("aria-describedby");
    err.textContent = ok ? "" : MESSAGES[input.name] || "Please check this field.";
    err.hidden = ok;
    return ok;
  }

  function submit(e) {
    e.preventDefault();
    var bad = null;
    Array.prototype.forEach.call(form.querySelectorAll("input[required], input[pattern]"), function (input) {
      if (!validate(input) && !bad) bad = input;
    });
    if (bad) { bad.focus(); return; }

    var v = function (n) { return form.elements[n].value.trim(); };
    var product = productName.textContent;
    var lines = ["Name: " + v("name"), "Email: " + v("email"), "Phone: " + v("phone")];
    if (v("company")) lines.push("Company: " + v("company"));
    if (product) lines.push("Product: " + product);
    if (v("message")) lines.push("", "Message:", v("message"));

    var subject = "Quote request" + (product ? ": " + product : "") + " - " + v("name");
    window.location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(lines.join("\r\n"));

    formView.hidden = true;
    doneView.hidden = false;
    doneView.querySelector("button").focus();
  }

  function open(product) {
    if (!dlg) build();
    form.reset();
    Array.prototype.forEach.call(form.querySelectorAll("[aria-invalid]"), function (i) {
      i.removeAttribute("aria-invalid");
      i.removeAttribute("aria-describedby");
    });
    Array.prototype.forEach.call(form.querySelectorAll(".quote-error"), function (p) { p.hidden = true; });
    productName.textContent = product || "";
    productRow.hidden = !product;
    formView.hidden = false;
    doneView.hidden = true;
    lastFocus = document.activeElement;
    document.documentElement.classList.add("modal-open");
    dlg.showModal();
    form.elements.name.focus();
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="mailto:"]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var href = a.getAttribute("href");
    if (href.toLowerCase().indexOf("mailto:" + EMAIL.toLowerCase()) !== 0) return;
    var query = href.split("?")[1] || "";
    var subject = new URLSearchParams(query).get("subject") || "";
    if (subject.toLowerCase().indexOf("quote") !== 0) return;
    e.preventDefault();
    open(subject.replace(/^quote request:?\s*/i, "").trim());
  });
})();
