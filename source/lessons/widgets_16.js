(function () {
  function h(tag, props) {
    var e = document.createElement(tag);
    if (props) for (var k in props) {
      var v = props[k];
      if (v == null || v === false) continue;
      if (k === "class") e.className = v;
      else if (k === "text") e.textContent = v;
      else e.setAttribute(k, v === true ? "" : v);
    }
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c == null || c === false) continue;
      e.appendChild(typeof c === "string" || typeof c === "number" ? document.createTextNode(String(c)) : c);
    }
    return e;
  }
  function uid() { return "wgw16-" + Math.random().toString(36).slice(2, 10); }

  /* ---------- dataquality: fuzzy matcher ---------- */
  // Two made-up customer lists. "twin" is the index in BILLING of the true same company, or -1 if none.
  var CRM = [
    { n: "Harrowgate Plumbing Ltd", twin: 0 },
    { n: "Finch & Bramble LLP", twin: 1 },
    { n: "Kestrel Dental Ltd", twin: 2 },
    { n: "Kestrel Motors Ltd", twin: -1 },
    { n: "Ostler Bakery Co", twin: 3 },
    { n: "The Marlow Group Inc", twin: 4 },
    { n: "Pell Street Cafe", twin: -1 },
    { n: "Tarn & Hollis Roofing", twin: 5 },
    { n: "Wren Logistics Limited", twin: 6 },
    { n: "Quillon Bakery", twin: -1 }
  ];
  var BILLING = [
    "HARROWGATE PLUMBING LIMITED",
    "Bramble and Finch",
    "Kestrel Dental Care Limited",
    "Ostler Bakehouse Co.",
    "Marlow Group",
    "Hollis & Tarn Roofing Ltd",
    "Wren Logistic Ltd",
    "Kestrel Motor Works Ltd",
    "Pell Street Cafe Bar"
  ];
  // Note: "Pell Street Cafe" and "Pell Street Cafe Bar" are different businesses; so are the two Kestrels.

  var SUFFIX = { ltd: 1, limited: 1, llp: 1, inc: 1, plc: 1, co: 1 };
  function normalise(s) {
    var t = s.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9 ]/g, " ");
    var w = t.split(/\s+/).filter(function (x) { return x && !SUFFIX[x] && x !== "the"; });
    return w;
  }
  function lev(a, b) {
    var prev = [], cur = [], i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur = [i];
      for (j = 1; j <= b.length; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prev = cur;
    }
    return prev[b.length];
  }
  function score(a, b, useNorm) {
    var x, y;
    if (useNorm) {
      var wa = normalise(a).filter(function (w) { return w !== "and"; }).sort();
      var wb = normalise(b).filter(function (w) { return w !== "and"; }).sort();
      x = wa.join(" "); y = wb.join(" ");
    } else { x = a; y = b; }
    var m = Math.max(x.length, y.length);
    if (!m) return 0;
    return Math.round((1 - lev(x, y) / m) * 100);
  }
  function best(name, useNorm) {
    var bi = -1, bs = -1;
    BILLING.forEach(function (b, i) {
      var sc = score(name, b, useNorm);
      if (sc > bs) { bs = sc; bi = i; }
    });
    return { idx: bi, score: bs };
  }

  function dqRender(host) {
    var id1 = uid(), id2 = uid();
    var val = h("output", { class: "wg-w16-val", for: id1 });
    var sl = h("input", { type: "range", id: id1, min: 40, max: 100, step: 1, value: 80 });
    var cb = h("input", { type: "checkbox", id: id2 });
    cb.checked = true;
    var out = h("div", { class: "wg-w16-out" });
    var stats = h("div", { class: "wg-w16-stats" });
    var mean = h("div", { class: "wg-w16-mean", "aria-live": "polite" });
    var tbody = h("tbody");
    var table = h("table", { class: "wg-w16-table" },
      h("caption", { class: "wg-w16-cap", text: "For each name in the CRM list, the best-scoring name in the billing list." }),
      h("thead", null, h("tr", null,
        h("th", { scope: "col", text: "CRM name" }),
        h("th", { scope: "col", text: "Best billing match" }),
        h("th", { scope: "col", text: "Score" }),
        h("th", { scope: "col", text: "Same company?" }),
        h("th", { scope: "col", text: "Result at this threshold" }))),
      tbody);

    function statBox(label) {
      var v = h("div", { class: "wg-w16-statv" });
      return { el: h("div", { class: "wg-w16-stat" }, h("div", { class: "wg-w16-statl", text: label }), v), set: function (t) { v.textContent = t; } };
    }
    var sGood = statBox("Correct matches"), sFalse = statBox("False matches"), sMiss = statBox("Missed matches"), sOk = statBox("Correct non-matches");
    [sGood, sFalse, sMiss, sOk].forEach(function (s) { stats.appendChild(s.el); });

    function update() {
      var thr = Number(sl.value), useNorm = cb.checked;
      val.textContent = thr + " out of 100";
      while (tbody.firstChild) tbody.removeChild(tbody.firstChild);
      var good = 0, fals = 0, miss = 0, ok = 0;
      CRM.forEach(function (rec, i) {
        var b = best(rec.n, useNorm);
        var matched = b.score >= thr;
        var truth = rec.twin === b.idx;
        var label, cls;
        if (matched && truth) { good++; label = "Correct match"; cls = "wg-w16-good"; }
        else if (matched && !truth) { fals++; label = "FALSE match"; cls = "wg-w16-bad"; }
        else if (!matched && rec.twin >= 0) { miss++; label = "MISSED (real match left apart)"; cls = "wg-w16-warn"; }
        else { ok++; label = "Correctly left apart"; cls = "wg-w16-good"; }
        var truthTxt = rec.twin < 0 ? "No twin in billing" : (truth ? "Yes" : "Twin is " + BILLING[rec.twin]);
        tbody.appendChild(h("tr", { class: cls },
          h("td", { text: rec.n }),
          h("td", { text: BILLING[b.idx] }),
          h("td", { class: "wg-w16-num", text: String(b.score) }),
          h("td", { text: truthTxt }),
          h("td", { class: "wg-w16-res", text: label })));
      });
      sGood.set(good + " of " + CRM.filter(function (r) { return r.twin >= 0; }).length);
      sFalse.set(String(fals));
      sMiss.set(String(miss));
      sOk.set(String(ok));
      var msg;
      if (fals > 0 && miss > 0) msg = "At " + thr + " you merge " + fals + " pair(s) that are different companies and still miss " + miss + " real one(s). No single number is safe here, so send the middle scores to a person.";
      else if (fals > 0) msg = "At " + thr + " you find every real match but merge " + fals + " pair(s) that are different companies. A wrong merge can mix two customers' data, so raise the threshold or add a review band.";
      else if (miss > 0) msg = "At " + thr + " nothing is wrongly merged, but " + miss + " real match(es) are left apart. That is the safe side to err on, and a review band below the threshold can recover them.";
      else msg = "At " + thr + " every pair is handled correctly for this small list. Real data is bigger and messier, so still read a sample of matches at each score band.";
      if (!useNorm) msg += " Normalising is off, so case, punctuation, suffixes and word order are hurting the scores.";
      mean.textContent = "What this means: " + msg;
    }
    sl.addEventListener("input", update);
    cb.addEventListener("change", update);

    host.appendChild(h("div", { class: "wg-w16-root" },
      h("div", { class: "wg-w16-field" },
        h("label", { class: "wg-w16-lab", for: id1 }, h("span", { text: "Match threshold" }), val), sl),
      h("div", { class: "wg-w16-check" }, cb, h("label", { for: id2, text: "Normalise first (lower-case, drop Ltd/LLP/Inc, ignore word order)" })),
      stats,
      h("div", { class: "wg-w16-scroll" }, table),
      mean,
      h("p", { class: "wg-w16-note", text: "Scores use a simple string similarity, 0 to 100. Both lists are made up. Pairs marked \"Same company?\" were decided by a person who knows the businesses." })));
    update();
  }

  Object.assign(WIDGETS, {
    dataquality: {
      title: "Fuzzy matcher",
      intro: "Drag the threshold and watch true matches, false matches and missed matches change. Then switch normalising off and see how much the scores drop.",
      render: dqRender
    }
  });
})();
WIDGET_CSS += `
.wg-w16-root { display: flex; flex-direction: column; gap: 12px; }
.wg-w16-field { display: flex; flex-direction: column; gap: 4px; }
.wg-w16-lab { display: flex; justify-content: space-between; gap: 8px; font-size: 14px; color: var(--ink); }
.wg-w16-val { font-family: var(--mono); font-weight: 600; color: var(--ink); }
.wg-w16-field input[type=range] { width: 100%; accent-color: var(--accent); }
.wg-w16-check { display: flex; gap: 8px; align-items: flex-start; font-size: 14px; color: var(--ink); }
.wg-w16-check input { margin-top: 3px; accent-color: var(--accent); }
.wg-w16-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px; }
.wg-w16-stat { border: 1px solid var(--line); border-radius: 8px; padding: 8px 10px; background: var(--surface); }
.wg-w16-statl { font-size: 12px; color: var(--muted); }
.wg-w16-statv { font-size: 20px; font-weight: 600; font-family: var(--mono); color: var(--ink); }
.wg-w16-scroll { overflow-x: auto; max-width: 100%; }
.wg-w16-table { border-collapse: collapse; font-size: 13px; width: 100%; min-width: 560px; color: var(--ink); }
.wg-w16-cap { text-align: left; font-size: 12px; color: var(--muted); padding-bottom: 6px; }
.wg-w16-table th, .wg-w16-table td { border-bottom: 1px solid var(--line); padding: 6px 8px; text-align: left; vertical-align: top; }
.wg-w16-table th { color: var(--muted); font-weight: 600; font-size: 12px; }
.wg-w16-num { font-family: var(--mono); }
.wg-w16-res { font-weight: 600; }
.wg-w16-bad td { background: var(--hl); }
.wg-w16-bad .wg-w16-res { text-decoration: underline; font-weight: 700; }
.wg-w16-warn .wg-w16-res { font-style: italic; }
.wg-w16-mean { background: var(--accent-soft); border-left: 3px solid var(--accent); padding: 10px 12px; border-radius: 6px; font-size: 14px; line-height: 1.5; color: var(--ink); }
.wg-w16-note { font-size: 12px; color: var(--muted); margin: 0; line-height: 1.5; }
`;
