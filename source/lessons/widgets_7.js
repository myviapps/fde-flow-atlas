(function () {
  "use strict";
  var SVGNS = "http://www.w3.org/2000/svg";

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === "text") n.textContent = attrs[k];
      else if (k === "cls") n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  function sv(tag, attrs, text) {
    var n = document.createElementNS(SVGNS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    return n;
  }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  var uid = 0;
  function nid(p) { uid += 1; return p + "-" + uid + "-" + Math.floor(Math.random() * 1e6); }

  function slider(P, o, onchange) {
    var id = nid(P);
    var val = el("span", { cls: P + "-val" });
    var inp = el("input", { type: "range", id: id, min: o.min, max: o.max, step: o.step, value: o.value });
    function show() { val.textContent = o.fmt(Number(inp.value)); }
    inp.addEventListener("input", function () { show(); onchange(); });
    show();
    var f = el("div", { cls: P + "-field" }, [el("label", { "for": id }, [el("span", { text: o.label }), val]), inp]);
    if (o.hint) f.appendChild(el("span", { cls: P + "-hint", text: o.hint }));
    return {
      node: f, input: inp,
      get: function () { return Number(inp.value); },
      set: function (v) {
        var mn = Number(o.min), mx = Number(o.max);
        inp.value = String(Math.max(mn, Math.min(mx, v))); show();
      }
    };
  }
  function button(P, label, primary, fn) {
    var b = el("button", { type: "button", cls: P + "-btn" + (primary ? " " + P + "-btn-primary" : ""), text: label });
    b.addEventListener("click", fn);
    return b;
  }
  function stat(P, label) {
    var v = el("div", { cls: P + "-statv" });
    return { node: el("div", { cls: P + "-stat" }, [el("div", { cls: P + "-statl", text: label }), v]), set: function (t) { v.textContent = t; } };
  }
  function meaning(P) {
    var t = el("span");
    return { node: el("p", { cls: P + "-mean", "aria-live": "polite" }, [el("strong", { text: "What this means: " }), t]), set: function (s) { t.textContent = s; } };
  }
  // Small seeded random generator (mulberry32) and a normal sample from it.
  function rng(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function gauss(r) {
    var u = 1 - r(), v = r();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  function fmt(x, d) { return isFinite(x) ? x.toFixed(d) : "too big"; }

  // Solve A x = y with Gaussian elimination and partial pivoting (A is small and square).
  function solve(A, y) {
    var n = y.length, M = A.map(function (row, i) { return row.slice().concat([y[i]]); });
    for (var c = 0; c < n; c++) {
      var p = c;
      for (var r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      var tmp = M[c]; M[c] = M[p]; M[p] = tmp;
      var d = M[c][c] || 1e-12;
      for (var r2 = c + 1; r2 < n; r2++) {
        var f = M[r2][c] / d;
        for (var k = c; k <= n; k++) M[r2][k] -= f * M[c][k];
      }
    }
    var x = new Array(n);
    for (var i = n - 1; i >= 0; i--) {
      var s = M[i][n];
      for (var j = i + 1; j < n; j++) s -= M[i][j] * x[j];
      x[i] = s / (M[i][i] || 1e-12);
    }
    return x;
  }

  /* ------------------------------------------------------------------ linreg */
  var KM = [1, 2, 3, 4, 5, 6], MIN = [14, 17, 23, 25, 31, 33];
  var LRS = [0.001, 0.002, 0.005, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08];

  function gdPanel(P) {
    var n = KM.length, mx = 0, my = 0;
    KM.forEach(function (x, i) { mx += x / n; my += MIN[i] / n; });
    var sxy = 0, sxx = 0;
    KM.forEach(function (x, i) { sxy += (x - mx) * (MIN[i] - my); sxx += (x - mx) * (x - mx); });
    var wBest = sxy / sxx, bBest = my - wBest * mx;
    function loss(w, b) {
      var s = 0;
      for (var i = 0; i < n; i++) { var e = w * KM[i] + b - MIN[i]; s += e * e; }
      return s / n;
    }
    var lBest = loss(wBest, bBest);
    var st = { w: 0, b: 0, steps: 0, hist: [loss(0, 0)], diverged: false };

    var box = el("div", { cls: P + "-panel" });
    box.appendChild(el("h4", { cls: P + "-h", text: "1. Gradient descent playground" }));
    box.appendChild(el("p", { cls: P + "-note", text: "Six deliveries: distance in km and time in minutes. The line starts flat at zero. Each step moves the slope w and intercept b a little downhill on the loss (mean squared error)." }));

    var lr = slider(P, { label: "Learning rate", min: 0, max: LRS.length - 1, step: 1, value: 4,
      fmt: function (v) { return String(LRS[v]); },
      hint: "Step size. Above about 0.06 on this data, steps overshoot so far that the loss grows." }, update);
    var btns = el("div", { cls: P + "-btns" }, [
      button(P, "Step once", true, function () { run(1); }),
      button(P, "Run 10 steps", false, function () { run(10); }),
      button(P, "Run 100 steps", false, function () { run(100); }),
      button(P, "Reset line", false, function () { st.w = 0; st.b = 0; st.steps = 0; st.hist = [loss(0, 0)]; st.diverged = false; update(); })
    ]);

    var W = 340, H = 230, L0 = 40, R0 = 12, T0 = 12, B0 = 34;
    var clipId = nid(P + "-clip");
    var svg1 = sv("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": "Scatter of deliveries with the current line" });
    var svg2 = sv("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": "Loss after each step, log scale" });
    var charts = el("div", { cls: P + "-two" }, [
      el("div", { cls: P + "-chart" }, [el("div", { cls: P + "-ctitle", text: "Data and current line" }), svg1]),
      el("div", { cls: P + "-chart" }, [el("div", { cls: P + "-ctitle", text: "Loss per step (log scale)" }), svg2])
    ]);
    var sS = stat(P, "Steps taken"), sW = stat(P, "Slope w (min per km)"), sB = stat(P, "Intercept b (min)"), sL = stat(P, "Loss (MSE, min²)");
    var stats = el("div", { cls: P + "-stats" }, [sS.node, sW.node, sB.node, sL.node]);
    var m = meaning(P);
    var best = el("p", { cls: P + "-note", text: "Best possible line (least squares): w = " + wBest.toFixed(2) + ", b = " + bBest.toFixed(2) + ", loss = " + lBest.toFixed(2) + " min²." });

    box.appendChild(lr.node); box.appendChild(btns); box.appendChild(charts); box.appendChild(stats); box.appendChild(best); box.appendChild(m.node);

    function run(k) {
      if (st.diverged) return;
      var a = LRS[lr.get()];
      for (var s = 0; s < k; s++) {
        var gw = 0, gb = 0;
        for (var i = 0; i < n; i++) { var e = st.w * KM[i] + st.b - MIN[i]; gw += 2 * e * KM[i] / n; gb += 2 * e / n; }
        st.w -= a * gw; st.b -= a * gb; st.steps += 1;
        var l = loss(st.w, st.b);
        st.hist.push(l);
        if (!isFinite(l) || l > 1e9) { st.diverged = true; break; }
      }
      update();
    }

    function drawData() {
      clear(svg1);
      var xmax = 7, ymax = 45;
      function X(x) { return L0 + x / xmax * (W - L0 - R0); }
      function Y(y) { return T0 + (1 - y / ymax) * (H - T0 - B0); }
      var defs = sv("defs", {}), cp = sv("clipPath", { id: clipId });
      cp.appendChild(sv("rect", { x: L0, y: T0, width: W - L0 - R0, height: H - T0 - B0 }));
      defs.appendChild(cp); svg1.appendChild(defs);
      for (var gy = 0; gy <= 40; gy += 10) {
        svg1.appendChild(sv("line", { x1: L0, x2: W - R0, y1: Y(gy), y2: Y(gy), "class": P + "-gl" }));
        svg1.appendChild(sv("text", { x: L0 - 6, y: Y(gy) + 4, "text-anchor": "end", "class": P + "-tick" }, String(gy)));
      }
      for (var gx = 0; gx <= 7; gx++) svg1.appendChild(sv("text", { x: X(gx), y: H - B0 + 16, "text-anchor": "middle", "class": P + "-tick" }, String(gx)));
      svg1.appendChild(sv("text", { x: (L0 + W - R0) / 2, y: H - 4, "text-anchor": "middle", "class": P + "-axis" }, "distance (km)"));
      svg1.appendChild(sv("text", { x: 10, y: T0 + 4, "class": P + "-axis" }, "min"));
      var g = sv("g", { "clip-path": "url(#" + clipId + ")" });
      if (!st.diverged) {
        KM.forEach(function (x, i) {
          g.appendChild(sv("line", { x1: X(x), x2: X(x), y1: Y(MIN[i]), y2: Y(st.w * x + st.b), "class": P + "-resid" }));
        });
        g.appendChild(sv("line", { x1: X(0), y1: Y(st.b), x2: X(xmax), y2: Y(st.w * xmax + st.b), "class": P + "-fit" }));
      }
      svg1.appendChild(g);
      KM.forEach(function (x, i) { svg1.appendChild(sv("circle", { cx: X(x), cy: Y(MIN[i]), r: 4.5, "class": P + "-pt" })); });
    }

    function drawLoss() {
      clear(svg2);
      var h = st.hist.filter(function (v) { return isFinite(v); });
      var lo = Math.log10(Math.max(0.1, lBest * 0.5)), hi = Math.max(3, Math.log10(Math.max.apply(null, h)) + 0.2);
      if (hi > 9) hi = 9;
      var nx = Math.max(10, h.length - 1);
      function X(i) { return L0 + i / nx * (W - L0 - R0); }
      function Y(v) { var t = (Math.log10(Math.max(v, 1e-3)) - lo) / (hi - lo); t = Math.max(0, Math.min(1, t)); return T0 + (1 - t) * (H - T0 - B0); }
      for (var p = Math.ceil(lo); p <= Math.floor(hi); p++) {
        var yy = Y(Math.pow(10, p));
        svg2.appendChild(sv("line", { x1: L0, x2: W - R0, y1: yy, y2: yy, "class": P + "-gl" }));
        svg2.appendChild(sv("text", { x: L0 - 6, y: yy + 4, "text-anchor": "end", "class": P + "-tick" }, p >= 0 ? String(Math.pow(10, p)) : String(Math.pow(10, p).toFixed(-p))));
      }
      var yb = Y(lBest);
      svg2.appendChild(sv("line", { x1: L0, x2: W - R0, y1: yb, y2: yb, "class": P + "-bestline" }));
      svg2.appendChild(sv("text", { x: W - R0 - 2, y: yb - 4, "text-anchor": "end", "class": P + "-tick" }, "best possible"));
      svg2.appendChild(sv("text", { x: L0, y: H - B0 + 16, "class": P + "-tick" }, "0"));
      svg2.appendChild(sv("text", { x: W - R0, y: H - B0 + 16, "text-anchor": "end", "class": P + "-tick" }, String(nx)));
      svg2.appendChild(sv("text", { x: (L0 + W - R0) / 2, y: H - 4, "text-anchor": "middle", "class": P + "-axis" }, "step"));
      var pts = h.map(function (v, i) { return X(i).toFixed(1) + "," + Y(v).toFixed(1); }).join(" ");
      if (h.length > 1) svg2.appendChild(sv("polyline", { points: pts, "class": P + "-curve" }));
      var last = h[h.length - 1];
      svg2.appendChild(sv("circle", { cx: X(h.length - 1), cy: Y(last), r: 4, "class": P + "-dot" }));
    }

    function explain() {
      var h = st.hist, l = h[h.length - 1];
      if (st.diverged) return "The learning rate is too big: every step jumps past the bottom of the loss bowl and lands higher up, so the loss exploded. Pick a smaller rate and press Reset line.";
      if (st.steps === 0) return "The flat line at zero misses every delivery by 14 to 33 minutes (loss " + l.toFixed(0) + " min²). Press Step once and watch the line and the loss move.";
      var prev = h[h.length - 2];
      var ratio = l / lBest;
      var zig = h.length >= 4 && ((h[h.length - 1] - h[h.length - 2]) * (h[h.length - 2] - h[h.length - 3]) < 0);
      if (l > h[0]) return "Diverging: the loss is now higher than where it started. At learning rate " + LRS[lr.get()] + " each step jumps past the bottom of the bowl and lands higher up the other side. Pick a smaller rate and press Reset line.";
      if (l > prev) return "The loss went up on the last step: the step overshot. With learning rate " + LRS[lr.get()] + " the line is swinging back and forth; a smaller rate would be steadier.";
      if (ratio < 1.01) return "Converged: after " + st.steps + " steps the line is within 1 percent of the best possible fit, about " + st.w.toFixed(1) + " minutes per km plus " + st.b.toFixed(1) + " minutes. More steps will not help.";
      if (LRS[lr.get()] <= 0.002) return "The loss is falling but slowly: at learning rate " + LRS[lr.get()] + " each step is tiny. Try a bigger rate to reach the bottom in fewer steps.";
      return "The loss is " + ratio.toFixed(1) + " times the best possible. Keep stepping: the slope is now " + st.w.toFixed(2) + " minutes per km" + (zig ? " (it is zig-zagging, a sign the rate is near the upper limit)." : ".");
    }

    function update() {
      var l = st.hist[st.hist.length - 1];
      sS.set(String(st.steps));
      sW.set(st.diverged ? "diverged" : fmt(st.w, 2));
      sB.set(st.diverged ? "diverged" : fmt(st.b, 2));
      sL.set(st.diverged || l > 1e6 ? "too big" : l >= 100 ? l.toFixed(0) : l.toFixed(2));
      drawData(); drawLoss(); m.set(explain());
    }
    update();
    return box;
  }

  function bvPanel(P) {
    var seed = 7;
    var data;
    function truth(x) { return Math.sin(3.2 * x) + 0.3 * x; }
    function makeData() {
      var r = rng(seed), tr = [], va = [];
      for (var i = 0; i < 12; i++) { var x = -1 + 2 * (i + 0.2 + 0.6 * r()) / 12; tr.push([x, truth(x) + 0.28 * gauss(r)]); }
      for (var j = 0; j < 30; j++) { var x2 = -1 + 2 * r(); va.push([x2, truth(x2) + 0.28 * gauss(r)]); }
      data = { tr: tr, va: va };
    }
    function fit(d) {
      var k = d + 1, A = [], y = [];
      for (var i = 0; i < k; i++) { A.push(new Array(k).fill(0)); y.push(0); }
      data.tr.forEach(function (p) {
        var pw = [];
        for (var a = 0; a < k; a++) pw.push(Math.pow(p[0], a));
        for (var r = 0; r < k; r++) { y[r] += pw[r] * p[1]; for (var c = 0; c < k; c++) A[r][c] += pw[r] * pw[c]; }
      });
      for (var q = 1; q < k; q++) A[q][q] += 1e-7;   // tiny ridge keeps the solve stable
      return solve(A, y);
    }
    function pred(c, x) { var s = 0, p = 1; for (var i = 0; i < c.length; i++) { s += c[i] * p; p *= x; } return s; }
    function rmse(c, pts) { var s = 0; pts.forEach(function (p) { var e = pred(c, p[0]) - p[1]; s += e * e; }); return Math.sqrt(s / pts.length); }

    var box = el("div", { cls: P + "-panel" });
    box.appendChild(el("h4", { cls: P + "-h", text: "2. Bias and variance: polynomial degree" }));
    box.appendChild(el("p", { cls: P + "-note", text: "12 training points (filled) and 30 validation points (hollow) come from the same hidden curve plus noise. A polynomial of the chosen degree is fitted to the training points only." }));
    var deg = slider(P, { label: "Polynomial degree", min: 1, max: 11, step: 1, value: 1,
      fmt: function (v) { return String(v) + (v === 1 ? " (straight line)" : ""); },
      hint: "Higher degree = more flexible curve." }, update);
    var btns = el("div", { cls: P + "-btns" }, [
      button(P, "New noisy sample", false, function () { seed = (seed * 1103515245 + 12345) >>> 0; makeData(); update(); })
    ]);
    var W = 340, H = 230, L0 = 40, R0 = 12, T0 = 12, B0 = 34;
    var clipId = nid(P + "-clip");
    var svg1 = sv("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": "Training and validation points with the fitted curve" });
    var svg2 = sv("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": "Training and validation error for each degree" });
    var charts = el("div", { cls: P + "-two" }, [
      el("div", { cls: P + "-chart" }, [el("div", { cls: P + "-ctitle", text: "Fitted curve" }), svg1]),
      el("div", { cls: P + "-chart" }, [el("div", { cls: P + "-ctitle", text: "Error (RMSE) by degree" }), svg2])
    ]);
    var legend = el("p", { cls: P + "-note" }, [
      el("span", { cls: P + "-key " + P + "-key-tr" }), " training error · ",
      el("span", { cls: P + "-key " + P + "-key-va" }), " validation error · ",
      el("span", { cls: P + "-key " + P + "-key-truth" }), " hidden true curve"
    ]);
    var sT = stat(P, "Training RMSE"), sV = stat(P, "Validation RMSE"), sG = stat(P, "Gap (val minus train)");
    var stats = el("div", { cls: P + "-stats" }, [sT.node, sV.node, sG.node]);
    var m = meaning(P);
    box.appendChild(deg.node); box.appendChild(btns); box.appendChild(charts); box.appendChild(legend); box.appendChild(stats); box.appendChild(m.node);

    function update() {
      var d = deg.get();
      var errs = [];
      for (var k = 1; k <= 11; k++) { var ck = fit(k); errs.push([rmse(ck, data.tr), rmse(ck, data.va)]); }
      var c = fit(d), et = errs[d - 1][0], ev = errs[d - 1][1];
      var bestD = 1;
      for (var q = 2; q <= 11; q++) if (errs[q - 1][1] < errs[bestD - 1][1]) bestD = q;

      // curve chart
      clear(svg1);
      var ymin = -2.2, ymax = 2.2;
      function X(x) { return L0 + (x + 1) / 2 * (W - L0 - R0); }
      function Y(y) { return T0 + (1 - (y - ymin) / (ymax - ymin)) * (H - T0 - B0); }
      var defs = sv("defs", {}), cp = sv("clipPath", { id: clipId });
      cp.appendChild(sv("rect", { x: L0, y: T0, width: W - L0 - R0, height: H - T0 - B0 }));
      defs.appendChild(cp); svg1.appendChild(defs);
      [-2, -1, 0, 1, 2].forEach(function (gy) {
        svg1.appendChild(sv("line", { x1: L0, x2: W - R0, y1: Y(gy), y2: Y(gy), "class": P + "-gl" }));
        svg1.appendChild(sv("text", { x: L0 - 6, y: Y(gy) + 4, "text-anchor": "end", "class": P + "-tick" }, String(gy)));
      });
      svg1.appendChild(sv("text", { x: (L0 + W - R0) / 2, y: H - 4, "text-anchor": "middle", "class": P + "-axis" }, "input x"));
      var g = sv("g", { "clip-path": "url(#" + clipId + ")" });
      var tp = [], fp = [];
      for (var i = 0; i <= 160; i++) {
        var x = -1 + 2 * i / 160;
        tp.push(X(x).toFixed(1) + "," + Y(truth(x)).toFixed(1));
        var yv = Math.max(-50, Math.min(50, pred(c, x)));
        fp.push(X(x).toFixed(1) + "," + Y(yv).toFixed(1));
      }
      g.appendChild(sv("polyline", { points: tp.join(" "), "class": P + "-truth" }));
      g.appendChild(sv("polyline", { points: fp.join(" "), "class": P + "-fit" }));
      svg1.appendChild(g);
      data.va.forEach(function (p) { svg1.appendChild(sv("circle", { cx: X(p[0]), cy: Y(p[1]), r: 3.5, "class": P + "-ptval" })); });
      data.tr.forEach(function (p) { svg1.appendChild(sv("circle", { cx: X(p[0]), cy: Y(p[1]), r: 4.5, "class": P + "-pt" })); });

      // error chart
      clear(svg2);
      var top = Math.max(errs[0][0], errs[0][1]) * 1.5;
      function X2(k) { return L0 + (k - 1) / 10 * (W - L0 - R0); }
      function Y2(v) { return T0 + (1 - Math.min(v, top) / top) * (H - T0 - B0); }
      [0, top / 2, top].forEach(function (gy) {
        svg2.appendChild(sv("line", { x1: L0, x2: W - R0, y1: Y2(gy), y2: Y2(gy), "class": P + "-gl" }));
        svg2.appendChild(sv("text", { x: L0 - 6, y: Y2(gy) + 4, "text-anchor": "end", "class": P + "-tick" }, gy.toFixed(2)));
      });
      for (var kx = 1; kx <= 11; kx++) svg2.appendChild(sv("text", { x: X2(kx), y: H - B0 + 16, "text-anchor": "middle", "class": P + "-tick" }, String(kx)));
      svg2.appendChild(sv("text", { x: (L0 + W - R0) / 2, y: H - 4, "text-anchor": "middle", "class": P + "-axis" }, "degree"));
      svg2.appendChild(sv("line", { x1: X2(d), x2: X2(d), y1: T0, y2: H - B0, "class": P + "-cursor" }));
      var lt = errs.map(function (e, k) { return X2(k + 1).toFixed(1) + "," + Y2(e[0]).toFixed(1); }).join(" ");
      var lv = errs.map(function (e, k) { return X2(k + 1).toFixed(1) + "," + Y2(e[1]).toFixed(1); }).join(" ");
      svg2.appendChild(sv("polyline", { points: lt, "class": P + "-ltr" }));
      svg2.appendChild(sv("polyline", { points: lv, "class": P + "-lva" }));
      errs.forEach(function (e, k) {
        if (e[1] > top) svg2.appendChild(sv("text", { x: X2(k + 1), y: T0 + 10, "text-anchor": "middle", "class": P + "-tick" }, "^"));
      });
      svg2.appendChild(sv("circle", { cx: X2(d), cy: Y2(et), r: 4, "class": P + "-dtr" }));
      svg2.appendChild(sv("circle", { cx: X2(d), cy: Y2(ev), r: 4, "class": P + "-dva" }));

      sT.set(et.toFixed(2)); sV.set(ev > 99 ? "> 99" : ev.toFixed(2)); sG.set(ev - et > 99 ? "> 99" : (ev - et).toFixed(2));
      var msg;
      var bestV = errs[bestD - 1][1];
      if (d < bestD && ev > 1.2 * bestV) msg = "Underfitting (high bias): a degree " + d + " curve is too stiff to follow the pattern, so both errors are high. Validation error is lowest at degree " + bestD + " for this sample.";
      else if (d > bestD && ev - et > 0.1) msg = "Overfitting (high variance): training error is only " + et.toFixed(2) + " but validation error is " + (ev > 99 ? "huge" : ev.toFixed(2)) + ". The curve bends to chase the noise in 12 points. Validation is best at degree " + bestD + ".";
      else if (d === bestD) msg = "Sweet spot for this sample: degree " + d + " has the lowest validation error (" + ev.toFixed(2) + "). Press New noisy sample and see how the best degree moves a little each time.";
      else msg = "Close to the sweet spot: training and validation errors are near each other. The lowest validation error for this sample is at degree " + bestD + ".";
      m.set(msg);
    }
    makeData();
    update();
    return box;
  }

  var linreg = {
    title: "Gradient descent and bias-variance playground",
    intro: "First, step gradient descent by hand and try a learning rate that is too big. Then drag the polynomial degree and watch training error keep falling while validation error turns back up.",
    render: function (host) {
      var P = "wg-lr";
      var wrap = el("div", { cls: P + "-wrap" });
      wrap.appendChild(gdPanel(P));
      wrap.appendChild(bvPanel(P));
      host.appendChild(wrap);
    }
  };

  /* ------------------------------------------------------------------ logreg */
  function makeCustomers() {
    var r = rng(4242), pts = [];
    for (var i = 0; i < 22; i++) pts.push([6.4 + 1.5 * gauss(r), 2.2 + 1.3 * gauss(r), 0]);   // stayed
    for (var j = 0; j < 18; j++) pts.push([3.2 + 1.4 * gauss(r), 5.4 + 1.4 * gauss(r), 1]);   // churned
    return pts.map(function (p) { return [Math.max(0.2, Math.min(9.8, p[0])), Math.max(0.2, Math.min(9.8, p[1])), p[2]]; });
  }
  function sigm(z) { return 1 / (1 + Math.exp(-z)); }

  var logreg = {
    title: "Decision boundary and log loss",
    intro: "Move the weights and bias to place the boundary between customers who stayed and those who churned. Watch log loss and accuracy, then change the threshold or let gradient descent take over.",
    render: function (host) {
      var P = "wg-lg";
      var pts = makeCustomers();
      var wrap = el("div", { cls: P + "-wrap" });
      wrap.appendChild(el("p", { cls: P + "-note", text: "40 made-up customers. x = logins per week, y = support tickets per month. The model is p(churn) = sigmoid(w1 * logins + w2 * tickets + b). The boundary is where p equals the threshold." }));
      var w1 = slider(P, { label: "w1 (logins weight)", min: -3, max: 3, step: 0.05, value: 0, fmt: function (v) { return v.toFixed(2); } }, update);
      var w2 = slider(P, { label: "w2 (tickets weight)", min: -3, max: 3, step: 0.05, value: 0.6, fmt: function (v) { return v.toFixed(2); } }, update);
      var bb = slider(P, { label: "b (bias)", min: -20, max: 20, step: 0.1, value: -1, fmt: function (v) { return v.toFixed(1); } }, update);
      var th = slider(P, { label: "Threshold", min: 0.05, max: 0.95, step: 0.05, value: 0.5, fmt: function (v) { return v.toFixed(2); },
        hint: "Customers with p at or above this are flagged as likely to churn." }, update);
      var grid = el("div", { cls: P + "-grid" }, [w1.node, w2.node, bb.node, th.node]);
      var btns = el("div", { cls: P + "-btns" }, [
        button(P, "Train 50 steps", true, function () { train(50); }),
        button(P, "Train 500 steps", false, function () { train(500); }),
        button(P, "Reset", false, function () { w1.set(0); w2.set(0.6); bb.set(-1); th.set(0.5); update(); })
      ]);

      var S = 300, pad = 34;
      var clipId = nid(P + "-clip");
      var svg = sv("svg", { viewBox: "0 0 " + (S + pad + 10) + " " + (S + pad + 10), role: "img", "aria-label": "Customers with the decision boundary" });
      var chart = el("div", { cls: P + "-chart" }, [svg]);
      var legend = el("p", { cls: P + "-note" }, [
        el("span", { cls: P + "-key " + P + "-key-c1" }), " churned (circle) · ",
        el("span", { cls: P + "-key " + P + "-key-c0" }), " stayed (square) · ",
        el("span", { cls: P + "-key " + P + "-key-shade" }), " darker = higher p(churn) · ",
        "ringed = wrong at this threshold"
      ]);
      var sLL = stat(P, "Log loss"), sAcc = stat(P, "Accuracy"), sRec = stat(P, "Churners caught"), sFlag = stat(P, "Flagged");
      var stats = el("div", { cls: P + "-stats" }, [sLL.node, sAcc.node, sRec.node, sFlag.node]);
      var m = meaning(P);
      wrap.appendChild(grid); wrap.appendChild(btns); wrap.appendChild(chart); wrap.appendChild(legend); wrap.appendChild(stats); wrap.appendChild(m.node);
      host.appendChild(wrap);

      function train(k) {
        var a = w1.get(), c = w2.get(), b = bb.get(), lr = 0.02, n = pts.length;
        for (var s = 0; s < k; s++) {
          var ga = 0, gc = 0, gb = 0;
          pts.forEach(function (p) { var e = sigm(a * p[0] + c * p[1] + b) - p[2]; ga += e * p[0] / n; gc += e * p[1] / n; gb += e / n; });
          a -= lr * ga; c -= lr * gc; b -= lr * gb * 5;   // the bias gets a bigger step so it keeps up
          a = Math.max(-3, Math.min(3, a)); c = Math.max(-3, Math.min(3, c)); b = Math.max(-20, Math.min(20, b));
        }
        w1.set(a); w2.set(c); bb.set(b); update();
      }

      function update() {
        var a = w1.get(), c = w2.get(), b = bb.get(), t = th.get();
        function X(x) { return pad + x / 10 * S; }
        function Y(y) { return 10 + (1 - y / 10) * S; }
        clear(svg);
        var defs = sv("defs", {}), cp = sv("clipPath", { id: clipId });
        cp.appendChild(sv("rect", { x: pad, y: 10, width: S, height: S }));
        defs.appendChild(cp); svg.appendChild(defs);
        var g = sv("g", { "clip-path": "url(#" + clipId + ")" });
        var N = 20, cell = S / N;
        for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) {
          var cx = (i + 0.5) * 10 / N, cy = (j + 0.5) * 10 / N;
          var p = sigm(a * cx + c * cy + b);
          g.appendChild(sv("rect", { x: X(i * 10 / N), y: Y((j + 1) * 10 / N), width: cell + 0.5, height: cell + 0.5, "class": P + "-cell", "fill-opacity": (0.05 + 0.4 * p).toFixed(3) }));
        }
        // boundary: a*x + c*y + b = logit(t)
        var lg = Math.log(t / (1 - t));
        function lineFor(level, cls) {
          var seg;
          if (Math.abs(c) > 1e-6) seg = [[-1, (level - b - a * -1) / c], [11, (level - b - a * 11) / c]];
          else if (Math.abs(a) > 1e-6) seg = [[(level - b) / a, -1], [(level - b) / a, 11]];
          if (seg) g.appendChild(sv("line", { x1: X(seg[0][0]), y1: Y(seg[0][1]), x2: X(seg[1][0]), y2: Y(seg[1][1]), "class": cls }));
        }
        lineFor(lg, P + "-bound");
        svg.appendChild(g);
        for (var q = 0; q <= 10; q += 2) {
          svg.appendChild(sv("text", { x: X(q), y: S + 10 + 16, "text-anchor": "middle", "class": P + "-tick" }, String(q)));
          svg.appendChild(sv("text", { x: pad - 6, y: Y(q) + 4, "text-anchor": "end", "class": P + "-tick" }, String(q)));
        }
        svg.appendChild(sv("text", { x: pad + S / 2, y: S + pad + 8, "text-anchor": "middle", "class": P + "-axis" }, "logins per week"));
        svg.appendChild(sv("text", { x: 12, y: 10 + S / 2, "text-anchor": "middle", "class": P + "-axis", transform: "rotate(-90 12 " + (10 + S / 2) + ")" }, "tickets per month"));
        svg.appendChild(sv("rect", { x: pad, y: 10, width: S, height: S, "class": P + "-frame" }));

        var ll = 0, right = 0, tp = 0, pos = 0, flagged = 0, confWrong = 0;
        pts.forEach(function (pt) {
          var p = sigm(a * pt[0] + c * pt[1] + b);
          var pc = Math.min(1 - 1e-12, Math.max(1e-12, p));
          ll += -(pt[2] * Math.log(pc) + (1 - pt[2]) * Math.log(1 - pc));
          var yhat = p >= t ? 1 : 0;
          if (yhat === pt[2]) right++;
          if (pt[2] === 1) { pos++; if (yhat === 1) tp++; }
          if (yhat === 1) flagged++;
          if ((pt[2] === 1 && p < 0.1) || (pt[2] === 0 && p > 0.9)) confWrong++;
          var wrong = yhat !== pt[2];
          if (pt[2] === 1) svg.appendChild(sv("circle", { cx: X(pt[0]), cy: Y(pt[1]), r: 5, "class": P + "-c1" }));
          else svg.appendChild(sv("rect", { x: X(pt[0]) - 4.5, y: Y(pt[1]) - 4.5, width: 9, height: 9, "class": P + "-c0" }));
          if (wrong) svg.appendChild(sv("circle", { cx: X(pt[0]), cy: Y(pt[1]), r: 8.5, "class": P + "-wrong" }));
        });
        ll /= pts.length;
        var acc = right / pts.length;
        sLL.set(ll > 99 ? "> 99" : ll.toFixed(3));
        sAcc.set(Math.round(acc * 100) + "%");
        sRec.set(tp + " of " + pos);
        sFlag.set(String(flagged));

        var msg;
        if (ll > 0.693) msg = "Log loss " + ll.toFixed(2) + " is worse than guessing 50/50 for everyone (0.69)" + (confWrong ? ": " + confWrong + " customers get a confident wrong answer, and log loss punishes those hard." : ". Try flipping the sign of a weight.");
        else if (acc >= 0.9 && ll < 0.3) msg = "A good fit: " + right + " of 40 customers are on the correct side and log loss is low (" + ll.toFixed(2) + "), so the probabilities are confident and mostly right.";
        else msg = right + " of 40 customers are on the correct side. Log loss " + ll.toFixed(2) + " beats 50/50 guessing (0.69) but there is room to improve: try Train 50 steps.";
        if (Math.abs(t - 0.5) > 0.01) msg += " At threshold " + t.toFixed(2) + ", " + flagged + " customers are flagged and " + tp + " of " + pos + " churners are caught; the boundary line moved but the probabilities did not.";
        else msg += " Each extra ticket multiplies the odds of churn by " + Math.exp(c).toFixed(2) + " (exp of w2).";
        m.set(msg);
      }
      update();
    }
  };

  Object.assign(WIDGETS, { linreg: linreg, logreg: logreg });

  function baseCss(P) {
    return "." + P + "-wrap{display:flex;flex-direction:column;gap:14px;font-family:var(--body);color:var(--ink)}\n" +
      "." + P + "-panel{display:flex;flex-direction:column;gap:10px;border:1px solid var(--line);border-radius:10px;padding:12px;background:var(--bg)}\n" +
      "." + P + "-h{font-size:15px;font-weight:600;margin:0}\n" +
      "." + P + "-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px 16px}\n" +
      "." + P + "-field{display:flex;flex-direction:column;gap:4px;min-width:0}\n" +
      "." + P + "-field label{display:flex;justify-content:space-between;gap:8px;font-size:13px;color:var(--ink)}\n" +
      "." + P + "-field input[type=range]{width:100%;accent-color:var(--accent)}\n" +
      "." + P + "-val{font-family:var(--mono);font-size:13px;color:var(--accent);white-space:nowrap}\n" +
      "." + P + "-hint{font-size:12px;color:var(--muted)}\n" +
      "." + P + "-btns{display:flex;flex-wrap:wrap;gap:8px;align-items:center}\n" +
      "." + P + "-btn{font:inherit;font-size:13px;padding:6px 12px;border-radius:6px;border:1px solid var(--line-strong);background:var(--surface);color:var(--ink);cursor:pointer}\n" +
      "." + P + "-btn:hover{border-color:var(--accent)}\n" +
      "." + P + "-btn:focus-visible{outline:2px solid var(--accent);outline-offset:2px}\n" +
      "." + P + "-btn-primary{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}\n" +
      "." + P + "-two{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px}\n" +
      "." + P + "-chart{background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:6px;min-width:0}\n" +
      "." + P + "-chart svg{display:block;width:100%;max-width:520px;margin:0 auto;height:auto}\n" +
      "." + P + "-ctitle{font-size:12px;color:var(--muted);padding:2px 4px}\n" +
      "." + P + "-note{font-size:12px;color:var(--muted);margin:0;line-height:1.6}\n" +
      "." + P + "-key{display:inline-block;width:12px;height:10px;border-radius:2px;vertical-align:middle;margin-right:2px}\n" +
      "." + P + "-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px}\n" +
      "." + P + "-stat{background:var(--accent-soft);border:1px solid var(--line);border-radius:8px;padding:8px 10px;min-width:0}\n" +
      "." + P + "-statl{font-size:12px;color:var(--muted)}\n" +
      "." + P + "-statv{font-family:var(--mono);font-size:18px;font-weight:600;color:var(--ink);overflow-wrap:anywhere}\n" +
      "." + P + "-mean{margin:0;padding:10px 12px;background:var(--hl);border-left:3px solid var(--packet);border-radius:4px;font-size:14px;line-height:1.5}\n" +
      "." + P + "-gl{stroke:var(--line);stroke-width:1}\n" +
      "." + P + "-tick{fill:var(--muted);font-size:11px;font-family:var(--mono)}\n" +
      "." + P + "-axis{fill:var(--muted);font-size:11px;font-family:var(--body)}\n";
  }

  WIDGET_CSS += "\n" + baseCss("wg-lr") + baseCss("wg-lg") +
    ".wg-lr-pt{fill:var(--accent);stroke:var(--surface);stroke-width:1.5}\n" +
    ".wg-lr-ptval{fill:none;stroke:var(--ink);stroke-width:1.2;opacity:.7}\n" +
    ".wg-lr-fit{stroke:var(--packet);stroke-width:2.5;fill:none}\n" +
    ".wg-lr-truth{stroke:var(--muted);stroke-width:1.5;stroke-dasharray:5 4;fill:none}\n" +
    ".wg-lr-resid{stroke:var(--muted);stroke-width:1;stroke-dasharray:3 3}\n" +
    ".wg-lr-curve{stroke:var(--accent);stroke-width:2;fill:none}\n" +
    ".wg-lr-dot{fill:var(--packet)}\n" +
    ".wg-lr-bestline{stroke:var(--packet);stroke-width:1;stroke-dasharray:4 4}\n" +
    ".wg-lr-cursor{stroke:var(--line-strong);stroke-width:1;stroke-dasharray:3 3}\n" +
    ".wg-lr-ltr{stroke:var(--accent);stroke-width:2;fill:none}\n" +
    ".wg-lr-lva{stroke:var(--packet);stroke-width:2;fill:none;stroke-dasharray:6 3}\n" +
    ".wg-lr-dtr{fill:var(--accent)}\n" +
    ".wg-lr-dva{fill:var(--packet)}\n" +
    ".wg-lr-key-tr{background:var(--accent)}\n" +
    ".wg-lr-key-va{background:var(--packet)}\n" +
    ".wg-lr-key-truth{background:var(--muted);height:3px}\n" +
    ".wg-lg-cell{fill:var(--accent)}\n" +
    ".wg-lg-chart svg{max-width:440px}\n" +
    ".wg-lg-bound{stroke:var(--ink);stroke-width:2.5}\n" +
    ".wg-lg-frame{fill:none;stroke:var(--line-strong)}\n" +
    ".wg-lg-c1{fill:var(--accent);stroke:var(--surface);stroke-width:1.5}\n" +
    ".wg-lg-c0{fill:var(--surface);stroke:var(--ink);stroke-width:1.8}\n" +
    ".wg-lg-wrong{fill:none;stroke:var(--packet);stroke-width:2}\n" +
    ".wg-lg-key-c1{background:var(--accent);border-radius:50%;width:10px}\n" +
    ".wg-lg-key-c0{background:var(--surface);border:1.5px solid var(--ink);width:9px;height:9px}\n" +
    ".wg-lg-key-shade{background:var(--accent);opacity:.4}\n";
})();
