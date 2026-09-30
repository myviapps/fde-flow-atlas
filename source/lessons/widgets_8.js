(function () {
  /* ---------- shared helpers (scoped to this file) ---------- */
  var SVGNS = "http://www.w3.org/2000/svg";
  function h(tag, props) {
    var e = document.createElement(tag);
    if (props) for (var k in props) {
      var v = props[k];
      if (v == null || v === false) continue;
      if (k === "class") e.className = v;
      else if (k === "text") e.textContent = v;
      else if (k.indexOf("on") === 0) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? "" : v);
    }
    for (var i = 2; i < arguments.length; i++) add(e, arguments[i]);
    return e;
  }
  function add(e, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) { c.forEach(function (x) { add(e, x); }); return; }
    e.appendChild(typeof c === "string" || typeof c === "number" ? document.createTextNode(String(c)) : c);
  }
  function s(tag, attrs) {
    var e = document.createElementNS(SVGNS, tag);
    if (attrs) for (var k in attrs) {
      if (k === "text") e.textContent = attrs[k]; else e.setAttribute(k, attrs[k]);
    }
    for (var i = 2; i < arguments.length; i++) add(e, arguments[i]);
    return e;
  }
  function clear(e) { while (e.firstChild) e.removeChild(e.firstChild); }
  function uid() { return "wgw8-" + Math.random().toString(36).slice(2, 10); }
  function field(labelText, control, valueEl) {
    var id = control.id || (control.id = uid());
    var lab = h("label", { for: id }, labelText);
    if (valueEl) lab.appendChild(valueEl);
    return h("div", { class: "wg-w8-field" }, lab, control);
  }
  function btn(label, onclick, cls) {
    return h("button", { type: "button", class: "wg-w8-btn" + (cls ? " " + cls : ""), onclick: onclick }, label);
  }
  function slider(min, max, step, value) {
    return h("input", { type: "range", class: "wg-w8-range", min: min, max: max, step: step, value: value });
  }
  function valSpan() { return h("span", { class: "wg-w8-val" }); }
  function meaning() {
    var span = h("span");
    var el = h("p", { class: "wg-w8-mean", "aria-live": "polite" }, h("strong", null, "What this means: "), span);
    return { el: el, set: function (t) { span.textContent = t; } };
  }
  function table(head, rows) {
    return h("div", { class: "wg-w8-tablewrap" },
      h("table", { class: "wg-w8-table" },
        h("thead", null, h("tr", null, head.map(function (x) { return h("th", { scope: "col" }, x); }))),
        h("tbody", null, rows.map(function (r) {
          return h("tr", null, r.map(function (x) { return h("td", null, x); }));
        }))));
  }
  function rng(seed) { // mulberry32: small seeded random generator
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function gauss(r) { var u = 1 - r(), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function r2(x) { return Math.round(x * 100) / 100; }
  function pct(x) { return Math.round(x * 100) + "%"; }

  /* plot frame: data box mapped into a 340 x 340 viewBox */
  var VB = 340, PL = 40, PT = 10, PW = 290, PH = 290;
  function frame(xr, yr) {
    return {
      x: function (v) { return PL + (v - xr[0]) / (xr[1] - xr[0]) * PW; },
      y: function (v) { return PT + PH - (v - yr[0]) / (yr[1] - yr[0]) * PH; },
      ix: function (px) { return xr[0] + (px - PL) / PW * (xr[1] - xr[0]); },
      iy: function (py) { return yr[0] + (PT + PH - py) / PH * (yr[1] - yr[0]); },
      xr: xr, yr: yr
    };
  }
  function axes(g, f, xlab, ylab, xticks, yticks) {
    g.appendChild(s("rect", { x: PL, y: PT, width: PW, height: PH, fill: "none", stroke: "var(--line-strong)" }));
    xticks.forEach(function (t) {
      g.appendChild(s("text", { x: f.x(t), y: PT + PH + 13, "text-anchor": "middle", class: "wg-w8-tick", text: String(t) }));
    });
    yticks.forEach(function (t) {
      g.appendChild(s("text", { x: PL - 4, y: f.y(t) + 4, "text-anchor": "end", class: "wg-w8-tick", text: String(t) }));
    });
    g.appendChild(s("text", { x: PL + PW / 2, y: VB - 4, "text-anchor": "middle", class: "wg-w8-axl", text: xlab }));
    g.appendChild(s("text", { x: 11, y: PT + PH / 2, "text-anchor": "middle", class: "wg-w8-axl",
      transform: "rotate(-90 11 " + (PT + PH / 2) + ")", text: ylab }));
  }
  var CLS = ["var(--accent)", "var(--packet)"];
  function marker(cx, cy, c, opts) {
    opts = opts || {};
    var r = opts.r || 5, hollow = opts.hollow;
    var fill = hollow ? "var(--surface)" : CLS[c], stroke = CLS[c];
    if (c === 0) return s("circle", { cx: cx, cy: cy, r: r, fill: fill, stroke: hollow ? stroke : "var(--surface)", "stroke-width": hollow ? 2 : 1 });
    return s("rect", { x: cx - r, y: cy - r, width: 2 * r, height: 2 * r, fill: fill, stroke: hollow ? stroke : "var(--surface)", "stroke-width": hollow ? 2 : 1 });
  }
  function legendItem(c, text, hollow) {
    var sv = s("svg", { viewBox: "0 0 14 14", width: 14, height: 14, "aria-hidden": "true" }, marker(7, 7, c, { r: 5, hollow: hollow }));
    return h("span", { class: "wg-w8-leg" }, sv, text);
  }
  function svgPoint(svg, evt) {
    var pt = svg.createSVGPoint(); pt.x = evt.clientX; pt.y = evt.clientY;
    var m = svg.getScreenCTM(); if (!m) return { x: 0, y: 0 };
    var p = pt.matrixTransform(m.inverse()); return { x: p.x, y: p.y };
  }

  /* =====================================================================
     trees: split explorer + depth slider
     ===================================================================== */
  function gini(n0, n1) { var n = n0 + n1; if (!n) return 0; var p = n0 / n, q = n1 / n; return 1 - p * p - q * q; }
  function counts(pts) { var c = [0, 0]; pts.forEach(function (p) { c[p.c]++; }); return c; }
  var FEAT = [
    { key: "inc", name: "Income ($k)", range: [10, 110], step: 1, ticks: [10, 30, 50, 70, 90, 110] },
    { key: "debt", name: "Debt ratio (%)", range: [0, 80], step: 1, ticks: [0, 20, 40, 60, 80] }
  ];
  function loanData(seed, n) {
    var r = rng(seed), out = [];
    for (var i = 0; i < n; i++) {
      var inc = Math.round(10 + 100 * r()), debt = Math.round(80 * r());
      var c = (debt > 50 || inc < 35) ? 1 : 0;
      if (r() < 0.13) c = 1 - c;
      out.push({ v: [inc, debt], c: c });
    }
    return out;
  }
  function bestSplit(pts, minLeaf) {
    var best = null, c = counts(pts), parent = gini(c[0], c[1]);
    for (var f = 0; f < 2; f++) {
      var vals = pts.map(function (p) { return p.v[f]; }).sort(function (a, b) { return a - b; });
      for (var i = 1; i < vals.length; i++) {
        if (vals[i] === vals[i - 1]) continue;
        var t = (vals[i] + vals[i - 1]) / 2, L = [0, 0], R = [0, 0];
        pts.forEach(function (p) { if (p.v[f] <= t) L[p.c]++; else R[p.c]++; });
        var nl = L[0] + L[1], nr = R[0] + R[1];
        if (nl < minLeaf || nr < minLeaf) continue;
        var w = (nl * gini(L[0], L[1]) + nr * gini(R[0], R[1])) / (nl + nr);
        if (!best || w < best.w - 1e-12) best = { f: f, t: t, w: w, gain: parent - w };
      }
    }
    return best;
  }
  function growTree(pts, depth, maxDepth, box, leaves) {
    var c = counts(pts), maj = c[1] > c[0] ? 1 : 0;
    var sp = (depth < maxDepth && c[0] && c[1]) ? bestSplit(pts, 1) : null;
    if (!sp || sp.gain <= 1e-9) { leaves.push({ box: box, c: maj, n: pts.length }); return { leaf: true, c: maj }; }
    var lb = box.slice(), rb = box.slice();
    if (sp.f === 0) { lb[1] = sp.t; rb[0] = sp.t; } else { lb[3] = sp.t; rb[2] = sp.t; }
    return {
      f: sp.f, t: sp.t,
      l: growTree(pts.filter(function (p) { return p.v[sp.f] <= sp.t; }), depth + 1, maxDepth, lb, leaves),
      r: growTree(pts.filter(function (p) { return p.v[sp.f] > sp.t; }), depth + 1, maxDepth, rb, leaves)
    };
  }
  function predictTree(node, p) { while (!node.leaf) node = p.v[node.f] <= node.t ? node.l : node.r; return node.c; }
  function acc(tree, pts) { var ok = 0; pts.forEach(function (p) { if (predictTree(tree, p) === p.c) ok++; }); return ok / pts.length; }

  function renderTrees(host) {
    var seed = 1, train, test;
    var fr = frame(FEAT[0].range, FEAT[1].range);
    function newData() { train = loanData(seed, 60); test = loanData(seed + 1000, 150); }
    newData();

    /* ---- part 1: one split ---- */
    var featSel = h("select", { class: "wg-w8-in" },
      FEAT.map(function (f, i) { return h("option", { value: String(i) }, f.name); }));
    var thrVal = valSpan();
    var thr = slider(FEAT[0].range[0], FEAT[0].range[1], 1, 60);
    var svg1 = s("svg", { viewBox: "0 0 " + VB + " " + VB, class: "wg-w8-svg", role: "img", "aria-label": "Loan applicants plotted by income and debt ratio with the chosen split line" });
    var statsBox = h("div");
    var m1 = meaning();

    function drawSplit() {
      var f = +featSel.value, t = +thr.value;
      thrVal.textContent = " " + t + (f === 0 ? " $k" : " %");
      clear(svg1);
      var g = s("g"); svg1.appendChild(g);
      // shade the two sides
      var x0 = fr.x(fr.xr[0]), x1 = fr.x(fr.xr[1]), y0 = fr.y(fr.yr[1]), y1 = fr.y(fr.yr[0]);
      if (f === 0) {
        g.appendChild(s("rect", { x: x0, y: y0, width: fr.x(t) - x0, height: y1 - y0, fill: "var(--accent-soft)", opacity: 0.8 }));
        g.appendChild(s("line", { x1: fr.x(t), x2: fr.x(t), y1: y0, y2: y1, stroke: "var(--ink)", "stroke-width": 2, "stroke-dasharray": "6 4" }));
      } else {
        g.appendChild(s("rect", { x: x0, y: fr.y(t), width: x1 - x0, height: y1 - fr.y(t), fill: "var(--accent-soft)", opacity: 0.8 }));
        g.appendChild(s("line", { x1: x0, x2: x1, y1: fr.y(t), y2: fr.y(t), stroke: "var(--ink)", "stroke-width": 2, "stroke-dasharray": "6 4" }));
      }
      axes(g, fr, "Income ($k)", "Debt ratio (%)", FEAT[0].ticks, FEAT[1].ticks);
      train.forEach(function (p) { g.appendChild(marker(fr.x(p.v[0]), fr.y(p.v[1]), p.c)); });

      var L = [0, 0], R = [0, 0];
      train.forEach(function (p) { if (p.v[f] <= t) L[p.c]++; else R[p.c]++; });
      var nl = L[0] + L[1], nr = R[0] + R[1], n = nl + nr, all = counts(train);
      var gp = gini(all[0], all[1]), gl = gini(L[0], L[1]), gr = gini(R[0], R[1]);
      var w = n ? (nl * gl + nr * gr) / n : 0;
      var fname = FEAT[f].name.split(" (")[0].toLowerCase();
      clear(statsBox);
      statsBox.appendChild(table(["Side", "Repaid", "Defaulted", "Gini"], [
        [fname + " <= " + t + " (shaded)", String(L[0]), String(L[1]), nl ? gl.toFixed(3) : "empty"],
        [fname + " > " + t, String(R[0]), String(R[1]), nr ? gr.toFixed(3) : "empty"],
        ["Before split (all)", String(all[0]), String(all[1]), gp.toFixed(3)],
        ["After split (weighted)", "", "", w.toFixed(3)]
      ]));
      var best = bestSplit(train, 1);
      var bestTxt = best ? " The best single split on this data is " + FEAT[best.f].name.split(" (")[0].toLowerCase() + " <= " + best.t + ", with a gain of " + best.gain.toFixed(3) + "." : "";
      if (!nl || !nr) m1.set("Every applicant is on one side, so this is not a split at all and impurity does not change." + bestTxt);
      else m1.set("This split lowers Gini impurity from " + gp.toFixed(3) + " to " + w.toFixed(3) + " (gain " + (gp - w).toFixed(3) + "). A tree would try every threshold and keep the biggest gain." + bestTxt);
    }
    featSel.addEventListener("change", function () {
      var f = FEAT[+featSel.value];
      thr.min = f.range[0]; thr.max = f.range[1]; thr.value = Math.round((f.range[0] + f.range[1]) / 2);
      drawSplit();
    });
    thr.addEventListener("input", drawSplit);
    var bestBtn = btn("Jump to best split", function () {
      var b = bestSplit(train, 1); if (!b) return;
      featSel.value = String(b.f);
      var f = FEAT[b.f]; thr.min = f.range[0]; thr.max = f.range[1];
      thr.value = Math.floor(b.t); drawSplit();
    });

    /* ---- part 2: depth ---- */
    var depthVal = valSpan();
    var depth = slider(0, 6, 1, 2);
    var showTest = h("input", { type: "checkbox" });
    var showTestId = uid(); showTest.id = showTestId;
    var svg2 = s("svg", { viewBox: "0 0 " + VB + " " + VB, class: "wg-w8-svg", role: "img", "aria-label": "Regions carved by a decision tree of the chosen depth" });
    var depthStats = h("div", { class: "wg-w8-cols" });
    var m2 = meaning();
    function drawDepth() {
      var d = +depth.value;
      depthVal.textContent = " " + d + (d === 1 ? " question" : " questions deep");
      var leaves = [];
      var tree = growTree(train, 0, d, [fr.xr[0], fr.xr[1], fr.yr[0], fr.yr[1]], leaves);
      clear(svg2);
      var g = s("g"); svg2.appendChild(g);
      leaves.forEach(function (lf) {
        var b = lf.box;
        g.appendChild(s("rect", { x: fr.x(b[0]), y: fr.y(b[3]), width: fr.x(b[1]) - fr.x(b[0]), height: fr.y(b[2]) - fr.y(b[3]),
          fill: CLS[lf.c], "fill-opacity": 0.16, stroke: "var(--line-strong)", "stroke-width": 1 }));
      });
      axes(g, fr, "Income ($k)", "Debt ratio (%)", FEAT[0].ticks, FEAT[1].ticks);
      train.forEach(function (p) { g.appendChild(marker(fr.x(p.v[0]), fr.y(p.v[1]), p.c)); });
      if (showTest.checked) test.forEach(function (p) { g.appendChild(marker(fr.x(p.v[0]), fr.y(p.v[1]), p.c, { hollow: true, r: 3 })); });
      var tr = acc(tree, train), te = acc(tree, test);
      clear(depthStats);
      [["Leaves (regions)", String(leaves.length)], ["Training accuracy", pct(tr)], ["Test accuracy", pct(te)]].forEach(function (c) {
        depthStats.appendChild(h("div", { class: "wg-w8-stat" }, h("div", { class: "wg-w8-statl" }, c[0]), h("div", { class: "wg-w8-statv" }, c[1])));
      });
      var gap = tr - te;
      if (d === 0) m2.set("With no questions the tree predicts the majority class for everyone: " + pct(tr) + " on training data. Add depth to let it learn the pattern.");
      else if (gap > 0.08) m2.set("Training accuracy is " + pct(tr) + " but test is only " + pct(te) + ". The extra boxes are chasing individual noisy points: this is overfitting, and pruning would cut them back.");
      else if (te < 0.75) m2.set("Only " + leaves.length + " regions: the tree is too simple to capture both risk rules (low income and high debt). Try one more level.");
      else m2.set("Train " + pct(tr) + " and test " + pct(te) + " are close, so this depth captures the real pattern without memorising noise.");
    }
    depth.addEventListener("input", drawDepth);
    showTest.addEventListener("change", drawDepth);
    var newBtn = btn("New sample of applicants", function () { seed = Math.floor(Math.random() * 1e6); newData(); drawSplit(); drawDepth(); });

    host.appendChild(h("div", { class: "wg-w8-box" },
      h("div", { class: "wg-w8-legend" }, legendItem(0, "Repaid (circle)"), legendItem(1, "Defaulted (square)"), legendItem(1, "Test applicant (hollow)", true)),
      h("h4", { class: "wg-w8-h" }, "1. Score one split"),
      h("div", { class: "wg-w8-grid" },
        h("div", { class: "wg-w8-plot" }, svg1),
        h("div", { class: "wg-w8-side" },
          field("Split on feature", featSel),
          field("Threshold:", thr, thrVal),
          h("div", { class: "wg-w8-row" }, bestBtn),
          statsBox)),
      m1.el,
      h("h4", { class: "wg-w8-h" }, "2. Let a small tree grow"),
      h("div", { class: "wg-w8-grid" },
        h("div", { class: "wg-w8-plot" }, svg2),
        h("div", { class: "wg-w8-side" },
          field("Maximum depth:", depth, depthVal),
          h("label", { class: "wg-w8-cb", for: showTestId }, showTest, "Show test applicants (not used for training)"),
          depthStats,
          h("div", { class: "wg-w8-row" }, newBtn),
          h("p", { class: "wg-w8-note" }, "Shaded boxes are the tree's leaves; each box predicts its majority class. The tree picks each split greedily by Gini, as in part 1."))),
      m2.el));
    drawSplit(); drawDepth();
  }

  /* =====================================================================
     knnsvm: kNN playground
     ===================================================================== */
  function renderKnn(host) {
    var fr = frame([0, 10], [0, 10]);
    function start() {
      var r = rng(42), pts = [];
      for (var i = 0; i < 11; i++) pts.push({ x: 3 + gauss(r) * 1.3, y: 3.2 + gauss(r) * 1.3, c: 0 });
      for (var j = 0; j < 11; j++) pts.push({ x: 6.8 + gauss(r) * 1.3, y: 6.5 + gauss(r) * 1.3, c: 1 });
      return pts.map(function (p) { return { x: Math.min(9.7, Math.max(0.3, p.x)), y: Math.min(9.7, Math.max(0.3, p.y)), c: p.c }; });
    }
    var pts = start(), q = { x: 5.2, y: 4.6 }, dragging = false;

    var modeName = "wgw8mode" + uid();
    var modes = [["0", "Add class A"], ["1", "Add class B"], ["q", "Move query"]];
    var modeBox = h("fieldset", { class: "wg-w8-fs" }, h("legend", null, "Clicking the plot will"),
      modes.map(function (m, i) {
        var id = uid();
        return h("label", { class: "wg-w8-radio", for: id },
          h("input", { type: "radio", name: modeName, id: id, value: m[0], checked: i === 2 }), m[1]);
      }));
    function mode() { var c = modeBox.querySelector("input:checked"); return c ? c.value : "q"; }
    var kVal = valSpan(), kIn = slider(1, 15, 1, 3);
    var qxVal = valSpan(), qx = slider(0, 10, 0.1, q.x);
    var qyVal = valSpan(), qy = slider(0, 10, 0.1, q.y);
    var distSel = h("select", { class: "wg-w8-in" },
      h("option", { value: "1" }, "Scaled: both features count equally"),
      h("option", { value: "5" }, "Unscaled: x in units 5 times larger"));
    var mapCb = h("input", { type: "checkbox", checked: true }); mapCb.id = uid();
    var svg = s("svg", { viewBox: "0 0 " + VB + " " + VB, class: "wg-w8-svg wg-knn-svg", role: "img", "aria-label": "Points of class A and B, a query point and lines to its nearest neighbours" });
    var result = h("div", { class: "wg-w8-cols" });
    var m = meaning();

    function dist(a, b, wx) { var dx = (a.x - b.x) * wx, dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy); }
    function vote(pt, k, wx) {
      var ds = pts.map(function (p, i) { return { i: i, d: dist(p, pt, wx) }; }).sort(function (a, b) { return a.d - b.d; });
      var nb = ds.slice(0, Math.min(k, ds.length)), v = [0, 0];
      nb.forEach(function (o) { v[pts[o.i].c]++; });
      return { nb: nb, v: v, pred: v[0] > v[1] ? 0 : v[1] > v[0] ? 1 : -1 };
    }
    function draw() {
      var k = +kIn.value, wx = +distSel.value;
      kVal.textContent = " " + k;
      q.x = +qx.value; q.y = +qy.value;
      qxVal.textContent = " " + q.x.toFixed(1); qyVal.textContent = " " + q.y.toFixed(1);
      clear(svg);
      var g = s("g"); svg.appendChild(g);
      if (mapCb.checked && pts.length) {
        var N = 25, cw = 10 / N;
        for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) {
          var c = { x: (i + 0.5) * cw, y: (j + 0.5) * cw }, pr = vote(c, k, wx).pred;
          if (pr < 0) continue;
          g.appendChild(s("rect", { x: fr.x(i * cw), y: fr.y((j + 1) * cw), width: PW / N + 0.4, height: PH / N + 0.4, fill: CLS[pr], "fill-opacity": 0.13 }));
        }
      }
      axes(g, fr, "Feature x", "Feature y", [0, 2, 4, 6, 8, 10], [0, 2, 4, 6, 8, 10]);
      var res = pts.length ? vote(q, k, wx) : { nb: [], v: [0, 0], pred: -1 };
      if (res.nb.length) {
        var rad = res.nb[res.nb.length - 1].d;
        g.appendChild(s("ellipse", { cx: fr.x(q.x), cy: fr.y(q.y), rx: rad / wx / 10 * PW, ry: rad / 10 * PH,
          fill: "none", stroke: "var(--muted)", "stroke-dasharray": "4 4" }));
        res.nb.forEach(function (o) {
          var p = pts[o.i];
          g.appendChild(s("line", { x1: fr.x(q.x), y1: fr.y(q.y), x2: fr.x(p.x), y2: fr.y(p.y), stroke: "var(--ink)", "stroke-width": 1.2, opacity: 0.7 }));
        });
      }
      pts.forEach(function (p) { g.appendChild(marker(fr.x(p.x), fr.y(p.y), p.c)); });
      res.nb.forEach(function (o) {
        var p = pts[o.i];
        g.appendChild(s("circle", { cx: fr.x(p.x), cy: fr.y(p.y), r: 9, fill: "none", stroke: "var(--ink)", "stroke-width": 1.5 }));
      });
      var qg = s("g", { class: "wg-knn-q" });
      qg.appendChild(s("circle", { cx: fr.x(q.x), cy: fr.y(q.y), r: 9, fill: res.pred < 0 ? "var(--surface)" : CLS[res.pred], stroke: "var(--ink)", "stroke-width": 2.5 }));
      qg.appendChild(s("text", { x: fr.x(q.x), y: fr.y(q.y) + 4, "text-anchor": "middle", class: "wg-knn-qt", text: "?" }));
      g.appendChild(qg);

      clear(result);
      var predTxt = res.pred === 0 ? "A" : res.pred === 1 ? "B" : "Tie";
      [["Votes for A", String(res.v[0])], ["Votes for B", String(res.v[1])], ["Prediction", predTxt]].forEach(function (c) {
        result.appendChild(h("div", { class: "wg-w8-stat" }, h("div", { class: "wg-w8-statl" }, c[0]), h("div", { class: "wg-w8-statv" }, c[1])));
      });
      if (!pts.length) { m.set("There are no known points yet. Add some A and B points by clicking the plot."); return; }
      var txt;
      if (res.pred < 0) txt = "The " + k + " nearest neighbours split evenly, so kNN cannot decide. An odd k avoids ties with two classes.";
      else txt = "The " + res.nb.length + " nearest known points vote " + res.v[res.pred] + " to " + res.v[1 - res.pred] + ", so the query is labelled " + predTxt + ".";
      if (wx > 1) txt += " With unscaled x, small moves left or right count 5 times as much, so the neighbour zone is a thin ellipse and y is nearly ignored.";
      else if (k === 1) txt += " With k = 1 a single odd point decides; the shaded map gets patchy.";
      else if (k >= 11) txt += " A large k smooths the map, but near the border the bigger class starts to win everywhere.";
      m.set(txt);
    }
    function setQuery(x, y) {
      qx.value = String(Math.round(Math.min(10, Math.max(0, x)) * 10) / 10);
      qy.value = String(Math.round(Math.min(10, Math.max(0, y)) * 10) / 10);
    }
    function toData(evt) { var p = svgPoint(svg, evt); return { x: fr.ix(p.x), y: fr.iy(p.y) }; }
    svg.addEventListener("pointerdown", function (evt) {
      var d = toData(evt);
      if (d.x < 0 || d.x > 10 || d.y < 0 || d.y > 10) return;
      var md = mode();
      if (md === "q") { dragging = true; setQuery(d.x, d.y); try { svg.setPointerCapture(evt.pointerId); } catch (e) {} draw(); }
      else { pts.push({ x: d.x, y: d.y, c: +md }); draw(); }
    });
    svg.addEventListener("pointermove", function (evt) {
      if (!dragging) return; var d = toData(evt); setQuery(d.x, d.y); draw();
    });
    function stopDrag() { dragging = false; }
    svg.addEventListener("pointerup", stopDrag);
    svg.addEventListener("pointercancel", stopDrag);
    [kIn, qx, qy].forEach(function (el) { el.addEventListener("input", draw); });
    distSel.addEventListener("change", draw);
    mapCb.addEventListener("change", draw);

    host.appendChild(h("div", { class: "wg-w8-box" },
      h("div", { class: "wg-w8-legend" }, legendItem(0, "Class A (circle)"), legendItem(1, "Class B (square)"),
        h("span", { class: "wg-w8-leg" }, "? = query point, ringed points = its neighbours")),
      h("div", { class: "wg-w8-grid" },
        h("div", { class: "wg-w8-plot" }, svg),
        h("div", { class: "wg-w8-side" },
          modeBox,
          field("k (neighbours that vote):", kIn, kVal),
          field("Query x:", qx, qxVal),
          field("Query y:", qy, qyVal),
          field("Distance", distSel),
          h("label", { class: "wg-w8-cb", for: mapCb.id }, mapCb, "Shade the plot by what kNN would predict"),
          h("div", { class: "wg-w8-row" },
            btn("Undo last point", function () { if (pts.length) { pts.pop(); draw(); } }),
            btn("Clear points", function () { pts = []; draw(); }),
            btn("Reset example", function () { pts = start(); setQuery(5.2, 4.6); kIn.value = "3"; distSel.value = "1"; draw(); })),
          result)),
      m.el));
    draw();
  }

  /* =====================================================================
     clustering: k-means stepper
     ===================================================================== */
  var KCOL = ["var(--accent)", "var(--packet)", "var(--ink)", "var(--muted)", "var(--accent)", "var(--packet)"];
  function kShape(i, cx, cy, r, col, hollow) {
    var fill = hollow ? "none" : col, st = hollow ? col : "var(--surface)", sw = hollow ? 2 : 0.8;
    var sh = i % 6;
    if (sh === 0) return s("circle", { cx: cx, cy: cy, r: r, fill: fill, stroke: st, "stroke-width": sw });
    if (sh === 1) return s("rect", { x: cx - r, y: cy - r, width: 2 * r, height: 2 * r, fill: fill, stroke: st, "stroke-width": sw });
    if (sh === 2) return s("polygon", { points: [cx, cy - r * 1.2, cx + r * 1.1, cy + r * 0.8, cx - r * 1.1, cy + r * 0.8].join(" "), fill: fill, stroke: st, "stroke-width": sw });
    if (sh === 3) return s("polygon", { points: [cx, cy - r * 1.3, cx + r * 1.3, cy, cx, cy + r * 1.3, cx - r * 1.3, cy].join(" "), fill: fill, stroke: st, "stroke-width": sw });
    if (sh === 4) return s("polygon", { points: [cx - r, cy - r, cx + r, cy - r, cx, cy + r * 1.1].join(" "), fill: "none", stroke: col, "stroke-width": 2 });
    return s("rect", { x: cx - r * 0.8, y: cy - r * 0.8, width: 1.6 * r, height: 1.6 * r, fill: "none", stroke: col, "stroke-width": 2, transform: "rotate(45 " + cx + " " + cy + ")" });
  }
  function renderKmeans(host) {
    var fr = frame([0, 10], [0, 10]);
    var seed = 3, X = [], labels = null, centers = [], iter = 0, phase = "init", lastInertia = null, runs = [], converged = false;
    function makeData() {
      var r = rng(seed), cs = [[2.5, 2.8], [7.2, 3.0], [4.8, 7.4], [8.0, 8.0]], sd = [0.9, 0.8, 1.0, 0.6], ns = [30, 30, 30, 12];
      X = [];
      cs.forEach(function (c, j) {
        for (var i = 0; i < ns[j]; i++) X.push({ x: Math.min(9.8, Math.max(0.2, c[0] + gauss(r) * sd[j])), y: Math.min(9.8, Math.max(0.2, c[1] + gauss(r) * sd[j])) });
      });
    }
    function d2(a, b) { var dx = a.x - b.x, dy = a.y - b.y; return dx * dx + dy * dy; }
    function inertia() {
      if (!labels) return null; var s2 = 0;
      X.forEach(function (p, i) { s2 += d2(p, centers[labels[i]]); }); return s2;
    }
    var kVal = valSpan(), kIn = slider(1, 6, 1, 3);
    var svg = s("svg", { viewBox: "0 0 " + VB + " " + VB, class: "wg-w8-svg", role: "img", "aria-label": "Points coloured by cluster with k-means centers" });
    var stats = h("div", { class: "wg-w8-cols" });
    var runsEl = h("p", { class: "wg-w8-note" });
    var m = meaning();
    var bInit, bAssign, bUpdate, bRun;

    function randomInit(r) {
      var k = +kIn.value, idx = [];
      while (idx.length < k) { var i = Math.floor(r() * X.length); if (idx.indexOf(i) < 0) idx.push(i); }
      centers = idx.map(function (i) { return { x: X[i].x, y: X[i].y }; });
      labels = null; iter = 0; phase = "assign"; lastInertia = null; converged = false;
    }
    function assign() {
      var changed = 0, nl = X.map(function (p, i) {
        var best = 0, bd = Infinity;
        centers.forEach(function (c, j) { var d = d2(p, c); if (d < bd) { bd = d; best = j; } });
        if (!labels || labels[i] !== best) changed++;
        return best;
      });
      labels = nl; iter++; phase = "update";
      return changed;
    }
    function update() {
      var moved = 0;
      centers = centers.map(function (c, j) {
        var sx = 0, sy = 0, n = 0;
        X.forEach(function (p, i) { if (labels[i] === j) { sx += p.x; sy += p.y; n++; } });
        if (!n) return c; // empty cluster keeps its place
        var nc = { x: sx / n, y: sy / n }; moved = Math.max(moved, Math.sqrt(d2(nc, c))); return nc;
      });
      phase = "assign";
      return moved;
    }
    var lastMsg = "";
    function draw() {
      var k = +kIn.value; kVal.textContent = " " + k;
      clear(svg);
      var g = s("g"); svg.appendChild(g);
      axes(g, fr, "Feature 1 (scaled)", "Feature 2 (scaled)", [0, 2, 4, 6, 8, 10], [0, 2, 4, 6, 8, 10]);
      if (labels) X.forEach(function (p, i) {
        var c = centers[labels[i]];
        g.appendChild(s("line", { x1: fr.x(p.x), y1: fr.y(p.y), x2: fr.x(c.x), y2: fr.y(c.y), stroke: KCOL[labels[i]], "stroke-width": 0.6, opacity: 0.35 }));
      });
      X.forEach(function (p, i) {
        if (labels) g.appendChild(kShape(labels[i], fr.x(p.x), fr.y(p.y), 4.2, KCOL[labels[i]], false));
        else g.appendChild(s("circle", { cx: fr.x(p.x), cy: fr.y(p.y), r: 4, fill: "none", stroke: "var(--muted)", "stroke-width": 1.4 }));
      });
      centers.forEach(function (c, j) {
        var cx = fr.x(c.x), cy = fr.y(c.y);
        g.appendChild(s("circle", { cx: cx, cy: cy, r: 12, fill: "var(--surface)", stroke: "var(--ink)", "stroke-width": 2 }));
        g.appendChild(kShape(j, cx, cy, 5.5, KCOL[j], false));
      });
      var I = inertia();
      clear(stats);
      [["Iteration", String(iter)], ["Inertia", I == null ? "not yet" : I.toFixed(1)], ["Next step", converged ? "done" : phase === "init" ? "init" : phase]].forEach(function (c) {
        stats.appendChild(h("div", { class: "wg-w8-stat" }, h("div", { class: "wg-w8-statl" }, c[0]), h("div", { class: "wg-w8-statv" }, c[1])));
      });
      bAssign.disabled = phase !== "assign" || converged;
      bUpdate.disabled = phase !== "update" || converged;
      bRun.disabled = phase === "init" || converged;
      runsEl.textContent = runs.length ? "Final inertia of your finished runs (lower is tighter): " + runs.map(function (x) { return x.k + " clusters: " + x.v.toFixed(1); }).join(", ") : "Finished runs will be listed here so you can compare random starts and values of k.";
      m.set(lastMsg);
    }
    function finish() {
      converged = true; var I = inertia();
      runs.push({ k: centers.length, v: I }); if (runs.length > 6) runs.shift();
      var same = runs.filter(function (r) { return r.k === centers.length; }).map(function (r) { return r.v; });
      var best = Math.min.apply(null, same);
      lastMsg = "Converged after " + iter + " iterations: no point changed cluster, so the centers will not move again. Inertia is " + I.toFixed(1) + "." +
        (same.length > 1 && I > best + 0.5 ? " An earlier start with k = " + centers.length + " reached " + best.toFixed(1) + ", so this run got stuck in a worse local answer. That is why libraries run several starts (n_init) and keep the best." :
          " Press Random init again: a different start can end in a different answer.");
    }
    function doAssign() {
      var before = inertia();
      var ch = assign();
      var I = inertia();
      if (ch === 0 && iter > 1) { finish(); draw(); return; }
      lastMsg = "Assign: each point joined its nearest center (" + ch + " points changed cluster). Inertia, the total squared distance to centers, is now " + I.toFixed(1) + (before != null ? ", down from " + before.toFixed(1) : "") + ". Next, move each center.";
      draw();
    }
    function doUpdate() {
      var before = inertia();
      var mv = update();
      var I = inertia();
      lastMsg = "Update: each center moved to the mean of its points (largest move " + mv.toFixed(2) + "). Inertia fell from " + before.toFixed(1) + " to " + I.toFixed(1) + ". Assign again to see if any point switches.";
      if (mv < 1e-9) { finish(); }
      draw();
    }
    function doRun() {
      var guard = 0;
      while (!converged && guard++ < 200) {
        if (phase === "assign") { var ch = assign(); if (ch === 0 && iter > 1) { finish(); break; } }
        else if (update() < 1e-9) { finish(); break; }
      }
      draw();
    }
    bInit = btn("Random init", function () { randomInit(Math.random); lastMsg = k() + " starting centers were placed on random points. Points are not assigned yet. Press Assign."; draw(); }, "wg-w8-primary");
    bAssign = btn("Assign points", doAssign);
    bUpdate = btn("Move centers", doUpdate);
    bRun = btn("Run to the end", doRun);
    function k() { return +kIn.value; }
    kIn.addEventListener("input", function () {
      randomInit(rng(seed * 31 + k()));
      lastMsg = "k is now " + k() + ". New starting centers were placed; step through to see how the data splits into " + k() + " groups. Compare the final inertia with other values of k.";
      draw();
    });
    var bData = btn("New data", function () {
      seed = Math.floor(Math.random() * 1e6); makeData(); runs = [];
      randomInit(rng(seed)); lastMsg = "New points drawn. Starting centers placed; press Assign."; draw();
    });

    makeData();
    randomInit(rng(11));
    lastMsg = "Three starting centers (big ringed markers) sit on random points. Press Assign to give every point to its nearest center, then Move centers. Repeat and watch inertia fall.";

    host.appendChild(h("div", { class: "wg-w8-box" },
      h("div", { class: "wg-w8-grid" },
        h("div", { class: "wg-w8-plot" }, svg),
        h("div", { class: "wg-w8-side" },
          field("k (number of clusters):", kIn, kVal),
          h("div", { class: "wg-w8-row" }, bInit, bData),
          h("div", { class: "wg-w8-row" }, bAssign, bUpdate, bRun),
          stats,
          runsEl,
          h("p", { class: "wg-w8-note" }, "Hollow points are not assigned yet. Each cluster has its own color and shape; the big ringed markers are the centers."))),
      m.el));
    draw();
  }

  Object.assign(WIDGETS, {
    trees: {
      title: "Split explorer and tree depth",
      intro: "Pick a feature and slide the threshold to see the Gini impurity of each side, then raise the depth and watch the tree carve the plane into boxes. Notice when training accuracy keeps rising but test accuracy does not.",
      render: renderTrees
    },
    knnsvm: {
      title: "kNN playground",
      intro: "Click to add class A or B points, drag the query point (or use its sliders), and change k. Watch which neighbours vote, and switch the distance to unscaled to see why scaling matters.",
      render: renderKnn
    },
    clustering: {
      title: "k-means stepper",
      intro: "Step through k-means yourself: assign points to the nearest center, move centers to the mean, repeat. Try several random starts and values of k and compare the final inertia.",
      render: renderKmeans
    }
  });
})();
WIDGET_CSS += `
.wg-w8-box { display:flex; flex-direction:column; gap:12px; font-family:var(--body); color:var(--ink); min-width:0; }
.wg-w8-h { margin:4px 0 0; font-size:15px; }
.wg-w8-grid { display:grid; grid-template-columns:minmax(0,3fr) minmax(0,2fr); gap:14px; align-items:start; }
@media (max-width:640px) { .wg-w8-grid { grid-template-columns:minmax(0,1fr); } }
.wg-w8-plot { min-width:0; }
.wg-w8-side { display:flex; flex-direction:column; gap:10px; min-width:0; }
.wg-w8-svg { display:block; width:100%; height:auto; max-width:460px; background:var(--surface); border:1px solid var(--line); border-radius:6px; touch-action:none; }
.wg-knn-svg { cursor:crosshair; }
.wg-w8-tick { font-family:var(--mono); font-size:10px; fill:var(--muted); }
.wg-w8-axl { font-family:var(--body); font-size:11px; fill:var(--muted); }
.wg-knn-qt { font-family:var(--body); font-size:11px; font-weight:700; fill:var(--surface); pointer-events:none; }
.wg-w8-row { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
.wg-w8-field { display:flex; flex-direction:column; gap:4px; min-width:0; }
.wg-w8-field label { font-size:13px; color:var(--muted); }
.wg-w8-val { font-family:var(--mono); color:var(--ink); font-weight:600; }
.wg-w8-in { font:inherit; font-size:14px; padding:6px 8px; border:1px solid var(--line-strong); border-radius:6px; background:var(--bg); color:var(--ink); width:100%; box-sizing:border-box; min-width:0; }
.wg-w8-range { width:100%; accent-color:var(--accent); }
.wg-w8-in:focus-visible, .wg-w8-btn:focus-visible, .wg-w8-range:focus-visible { outline:2px solid var(--accent); outline-offset:1px; }
.wg-w8-btn { font:inherit; font-size:14px; padding:6px 12px; border:1px solid var(--line-strong); border-radius:6px; background:var(--surface); color:var(--ink); cursor:pointer; }
.wg-w8-btn:hover:not(:disabled) { border-color:var(--accent); }
.wg-w8-btn:disabled { color:var(--muted); border-style:dashed; opacity:1; cursor:default; }
.wg-w8-primary { background:var(--accent); color:var(--accent-ink); border-color:var(--accent); }
.wg-w8-cb, .wg-w8-radio { display:flex; gap:8px; align-items:center; font-size:14px; }
.wg-w8-cb input, .wg-w8-radio input { accent-color:var(--accent); margin:0; }
.wg-w8-fs { border:1px solid var(--line); border-radius:6px; padding:6px 10px 8px; margin:0; display:flex; flex-wrap:wrap; gap:4px 14px; min-width:0; }
.wg-w8-fs legend { font-size:13px; color:var(--muted); padding:0 4px; }
.wg-w8-legend { display:flex; flex-wrap:wrap; gap:6px 16px; font-size:13px; color:var(--muted); }
.wg-w8-leg { display:inline-flex; align-items:center; gap:6px; }
.wg-w8-cols { display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:8px; }
.wg-w8-stat { border:1px solid var(--line); border-radius:6px; padding:6px 8px; background:var(--surface); min-width:0; }
.wg-w8-statl { font-size:12px; color:var(--muted); }
.wg-w8-statv { font-family:var(--mono); font-size:16px; font-weight:600; overflow-wrap:anywhere; }
.wg-w8-mean { background:var(--accent-soft); border-left:3px solid var(--accent); padding:8px 12px; border-radius:4px; margin:0; font-size:14px; line-height:1.5; color:var(--ink); }
.wg-w8-note { color:var(--muted); font-size:13px; margin:0; line-height:1.5; }
.wg-w8-tablewrap { overflow-x:auto; max-width:100%; }
.wg-w8-table { border-collapse:collapse; font-size:13px; width:100%; }
.wg-w8-table th, .wg-w8-table td { border:1px solid var(--line); padding:4px 6px; text-align:left; }
.wg-w8-table td { font-family:var(--mono); font-size:12px; }
.wg-w8-table thead th { background:var(--surface); color:var(--muted); font-weight:600; }
`;
