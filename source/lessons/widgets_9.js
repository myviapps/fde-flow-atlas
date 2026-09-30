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
    return e;
  }
  function clear(e) { while (e.firstChild) e.removeChild(e.firstChild); }
  function uid() { return "wgw9-" + Math.random().toString(36).slice(2, 10); }
  // seeded random numbers so every visit shows the same data
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function gauss(r) {
    var u = 0, v = 0;
    while (u === 0) u = r();
    while (v === 0) v = r();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  function slider(labelText, min, max, step, value, unit, fmtFn) {
    var id = uid();
    var input = h("input", { type: "range", id: id, min: min, max: max, step: step, value: value, class: "wg-w9-range" });
    var out = h("output", { for: id, class: "wg-w9-val" });
    function show() { out.textContent = (fmtFn ? fmtFn(+input.value) : input.value) + (unit || ""); }
    input.addEventListener("input", show);
    show();
    var el = h("div", { class: "wg-w9-field" },
      h("div", { class: "wg-w9-lab" }, h("label", { for: id }, labelText), out), input);
    return { el: el, input: input, get: function () { return +input.value; }, set: function (v) { input.value = v; show(); } };
  }
  function selectField(labelText, options, value) {
    var id = uid();
    var sel = h("select", { id: id, class: "wg-w9-in" });
    options.forEach(function (o) {
      var opt = h("option", { value: o[0] }, o[1]);
      if (o[0] === value) opt.selected = true;
      sel.appendChild(opt);
    });
    return { el: h("div", { class: "wg-w9-field" }, h("label", { for: id, class: "wg-w9-lab" }, labelText), sel), input: sel };
  }
  function checkField(labelText, checked) {
    var id = uid();
    var cb = h("input", { type: "checkbox", id: id, checked: checked ? true : null });
    return { el: h("div", { class: "wg-w9-check" }, cb, h("label", { for: id }, labelText)), input: cb };
  }
  function meaning() {
    var span = h("span");
    var el = h("p", { class: "wg-w9-mean", "aria-live": "polite" }, h("strong", null, "What this means: "), span);
    return { el: el, set: function (t) { span.textContent = t; } };
  }
  function stat(label) {
    var v = h("div", { class: "wg-w9-statv" });
    var el = h("div", { class: "wg-w9-stat" }, h("div", { class: "wg-w9-statl" }, label), v);
    return { el: el, set: function (t) { v.textContent = t; } };
  }
  function pct(x) { return Math.round(x * 100) + "%"; }

  /* =====================================================================
     dimred: PCA playground
     ===================================================================== */
  function renderPCA(host) {
    var N = 160, TILT = 30 * Math.PI / 180;
    var r0 = rng(20260927), Z = [];
    for (var i = 0; i < N; i++) Z.push([gauss(r0), gauss(r0)]);

    var corr = slider("How strongly the two columns are linked (correlation)", 0, 0.98, 0.01, 0.85, "", function (v) { return v.toFixed(2); });
    var ang = slider("Angle of your line", 0, 179, 1, 110, " degrees");
    var snapBtn = h("button", { type: "button", class: "wg-w9-btn" }, "Snap to PC1");
    var svg = s("svg", { viewBox: "0 0 320 320", class: "wg-pca-svg", role: "img", "aria-label": "Scatter plot of the point cloud with your line and the first principal component" });
    var yours = stat("Variance kept by your line");
    var best = stat("Best possible (PC1)");
    var pc2 = stat("Left for PC2");
    var bar = h("div", { class: "wg-pca-bar", "aria-hidden": "true" });
    var barYou = h("div", { class: "wg-pca-bar-you" });
    var barBest = h("div", { class: "wg-pca-bar-best" });
    bar.appendChild(barBest); bar.appendChild(barYou);
    var mean = meaning();
    var pc1Angle = 0;

    function data() {
      var r = corr.get(), c = Math.cos(TILT), sn = Math.sin(TILT), pts = [];
      for (var i = 0; i < N; i++) {
        var x = Z[i][0] * 1.0, y = r * Z[i][0] + Math.sqrt(1 - r * r) * Z[i][1];
        // scale the second column a little so the cloud is not symmetric, then tilt it
        x = x * 1.15; y = y * 0.85;
        pts.push([x * c - y * sn, x * sn + y * c]);
      }
      return pts;
    }
    function cov(pts) {
      var mx = 0, my = 0, n = pts.length;
      pts.forEach(function (p) { mx += p[0]; my += p[1]; });
      mx /= n; my /= n;
      var sxx = 0, syy = 0, sxy = 0;
      pts.forEach(function (p) { var dx = p[0] - mx, dy = p[1] - my; sxx += dx * dx; syy += dy * dy; sxy += dx * dy; });
      return { mx: mx, my: my, xx: sxx / (n - 1), yy: syy / (n - 1), xy: sxy / (n - 1) };
    }
    function update() {
      var pts = data(), C = cov(pts), tr = C.xx + C.yy;
      var a = ang.get() * Math.PI / 180, ux = Math.cos(a), uy = Math.sin(a);
      var vYou = (ux * ux * C.xx + 2 * ux * uy * C.xy + uy * uy * C.yy) / tr;
      var disc = Math.sqrt((C.xx - C.yy) * (C.xx - C.yy) / 4 + C.xy * C.xy);
      var l1 = (C.xx + C.yy) / 2 + disc, vBest = l1 / tr;
      pc1Angle = 0.5 * Math.atan2(2 * C.xy, C.xx - C.yy);
      var pcDeg = ((pc1Angle * 180 / Math.PI) % 180 + 180) % 180;

      clear(svg);
      var S = 38, cx = 160, cy = 160;
      function X(v) { return cx + (v - C.mx) * S; }
      function Y(v) { return cy - (v - C.my) * S; }
      svg.appendChild(s("line", { x1: 10, y1: cy, x2: 310, y2: cy, class: "wg-pca-axis" }));
      svg.appendChild(s("line", { x1: cx, y1: 10, x2: cx, y2: 310, class: "wg-pca-axis" }));
      svg.appendChild(s("text", { x: 306, y: cy - 6, "text-anchor": "end", class: "wg-pca-lbl", text: "column A" }));
      svg.appendChild(s("text", { x: cx + 6, y: 20, class: "wg-pca-lbl", text: "column B" }));
      // projections of a few points onto your line
      pts.forEach(function (p, i) {
        var dx = p[0] - C.mx, dy = p[1] - C.my, t = dx * ux + dy * uy;
        if (i % 4 === 0) svg.appendChild(s("line", { x1: X(p[0]), y1: Y(p[1]), x2: X(C.mx + t * ux), y2: Y(C.my + t * uy), class: "wg-pca-proj" }));
      });
      pts.forEach(function (p) { svg.appendChild(s("circle", { cx: X(p[0]).toFixed(1), cy: Y(p[1]).toFixed(1), r: 2.6, class: "wg-pca-pt" })); });
      var L = 4.2, bx = Math.cos(pc1Angle), by = Math.sin(pc1Angle);
      svg.appendChild(s("line", { x1: X(C.mx - L * bx), y1: Y(C.my - L * by), x2: X(C.mx + L * bx), y2: Y(C.my + L * by), class: "wg-pca-best" }));
      svg.appendChild(s("line", { x1: X(C.mx - L * ux), y1: Y(C.my - L * uy), x2: X(C.mx + L * ux), y2: Y(C.my + L * uy), class: "wg-pca-you" }));

      yours.set(pct(vYou));
      best.set(pct(vBest) + " at " + Math.round(pcDeg) + " degrees");
      pc2.set(pct(1 - vBest));
      barYou.style.width = (vYou * 100).toFixed(1) + "%";
      barBest.style.width = (vBest * 100).toFixed(1) + "%";

      var gap = vBest - vYou, msg;
      if (gap < 0.01) msg = "Your line is the first principal component. Describing each point by one number along it keeps " + pct(vBest) + " of the spread";
      else msg = "Your line keeps " + pct(vYou) + " of the spread; turning it to about " + Math.round(pcDeg) + " degrees would keep " + pct(vBest) + ". PCA always picks that best line for you";
      if (vBest > 0.9) msg += ". With columns this strongly linked, one component is almost as good as two.";
      else if (vBest < 0.65) msg += ". With weakly linked columns no single line captures much, so dropping to one component throws away a lot.";
      else msg += ". One component keeps most of the shape, but PC2 still holds real information.";
      mean.set(msg);
    }
    corr.input.addEventListener("input", update);
    ang.input.addEventListener("input", update);
    snapBtn.addEventListener("click", function () {
      var d = ((pc1Angle * 180 / Math.PI) % 180 + 180) % 180;
      ang.set(Math.round(d) % 180);
      update();
    });

    host.appendChild(h("div", { class: "wg-w9-wrap" },
      h("div", { class: "wg-w9-cols" },
        h("div", { class: "wg-w9-ctrl" }, corr.el, ang.el, h("div", { class: "wg-w9-row" }, snapBtn),
          h("div", { class: "wg-w9-stats" }, yours.el, best.el, pc2.el),
          h("div", { class: "wg-pca-barwrap" }, h("div", { class: "wg-w9-statl" }, "Variance kept: yours (solid) vs best (light)"), bar)),
        h("div", { class: "wg-w9-plotcol" }, h("div", { class: "wg-w9-plot" }, svg),
          h("p", { class: "wg-w9-note" }, "Solid blue line: your line. Dashed line: PC1, the best possible line. Thin blue ticks: how points project onto your line."))),
      mean.el));
    update();
  }

  /* =====================================================================
     timeseries: forecast playground
     ===================================================================== */
  function renderForecast(host) {
    var DAYS = 112, H = 14;
    var r0 = rng(7331), noise = [];
    for (var i = 0; i < DAYS; i++) noise.push(gauss(r0));
    var SHAPE = [0, 0.1, 0.2, 0.25, 0.6, 1.0, -0.6]; // Mon..Sun, scaled by the weekly size slider

    var method = selectField("Forecast method", [
      ["naive", "Naive (repeat the last value)"],
      ["snaive", "Seasonal naive (same weekday last week)"],
      ["ma", "Moving average"],
      ["ses", "Exponential smoothing"]], "ses");
    var win = slider("Moving-average window", 2, 28, 1, 7, " days");
    var alpha = slider("Smoothing alpha", 0.05, 0.95, 0.05, 0.3, "", function (v) { return v.toFixed(2); });
    var season = slider("Weekly pattern size", 0, 60, 5, 40, " units");
    var noiseS = slider("Random noise (sd)", 0, 20, 1, 6, " units");
    var svg = s("svg", { viewBox: "0 0 640 236", class: "wg-fcst-svg", role: "img", "aria-label": "Line chart of recent sales, the actual holdout period and the forecast" });
    var maeStat = stat("Your MAE on the 14-day holdout");
    var baseStat = stat("Seasonal naive MAE");
    var tbody = h("tbody");
    var table = h("div", { class: "wg-w9-tablewrap" }, h("table", { class: "wg-w9-table" },
      h("thead", null, h("tr", null, h("th", { scope: "col" }, "Method (current settings)"), h("th", { scope: "col" }, "MAE, units/day"))), tbody));
    var mean = meaning();

    function series() {
      var S = season.get(), sd = noiseS.get(), y = [];
      for (var t = 0; t < DAYS; t++) y.push(Math.max(0, Math.round(100 + 0.25 * t + S * SHAPE[t % 7] + sd * noise[t])));
      return y;
    }
    function forecast(kind, train) {
      var n = train.length, out = [], j;
      if (kind === "naive") for (j = 0; j < H; j++) out.push(train[n - 1]);
      else if (kind === "snaive") for (j = 0; j < H; j++) out.push(train[n - 7 + (j % 7)]);
      else if (kind === "ma") {
        var w = win.get(), sum = 0;
        for (j = n - w; j < n; j++) sum += train[j];
        for (j = 0; j < H; j++) out.push(sum / w);
      } else {
        var a = alpha.get(), level = train[0];
        for (j = 1; j < n; j++) level = a * train[j] + (1 - a) * level;
        for (j = 0; j < H; j++) out.push(level);
      }
      return out;
    }
    function mae(fc, test) { var e = 0; for (var j = 0; j < test.length; j++) e += Math.abs(test[j] - fc[j]); return e / test.length; }

    function update() {
      var kind = method.input.value;
      win.el.hidden = kind !== "ma";
      alpha.el.hidden = kind !== "ses";
      var y = series(), train = y.slice(0, DAYS - H), test = y.slice(DAYS - H);
      var names = { naive: "Naive", snaive: "Seasonal naive", ma: "Moving average (" + win.get() + " days)", ses: "Exponential smoothing (alpha " + alpha.get().toFixed(2) + ")" };
      var res = {};
      ["naive", "snaive", "ma", "ses"].forEach(function (k) { res[k] = mae(forecast(k, train), test); });
      var fc = forecast(kind, train);

      // chart: last 42 training days + 14 holdout days
      clear(svg);
      var SHOW = 42, start = DAYS - H - SHOW, vis = y.slice(start);
      var lo = Math.min.apply(null, vis.concat(fc)), hi = Math.max.apply(null, vis.concat(fc));
      var pad = (hi - lo) * 0.1 + 1; lo -= pad; hi += pad;
      var L = 44, R = 630, T = 14, B = 226;
      function X(t) { return L + (t - start) / (DAYS - 1 - start) * (R - L); }
      function Y(v) { return B - (v - lo) / (hi - lo) * (B - T); }
      for (var g = 0; g <= 4; g++) {
        var v = lo + (hi - lo) * g / 4;
        svg.appendChild(s("line", { x1: L, y1: Y(v), x2: R, y2: Y(v), class: "wg-fcst-grid" }));
        svg.appendChild(s("text", { x: L - 6, y: Y(v) + 4, "text-anchor": "end", class: "wg-fcst-lbl", text: Math.round(v) }));
      }
      svg.appendChild(s("rect", { x: X(DAYS - H) - 4, y: T, width: R - X(DAYS - H) + 4, height: B - T, class: "wg-fcst-hold" }));
      svg.appendChild(s("text", { x: X(DAYS - H) + 2, y: T + 14, class: "wg-fcst-lbl", text: "holdout (14 days)" }));
      function path(arr, t0) {
        return arr.map(function (v, j) { return (j ? "L" : "M") + X(t0 + j).toFixed(1) + " " + Y(v).toFixed(1); }).join(" ");
      }
      svg.appendChild(s("path", { d: path(y.slice(start, DAYS - H), start), class: "wg-fcst-hist" }));
      svg.appendChild(s("path", { d: path(y.slice(DAYS - H - 1), DAYS - H - 1), class: "wg-fcst-act" }));
      svg.appendChild(s("path", { d: path([train[train.length - 1]].concat(fc), DAYS - H - 1), class: "wg-fcst-fc" }));

      maeStat.set(res[kind].toFixed(1) + " units/day");
      baseStat.set(res.snaive.toFixed(1) + " units/day");
      clear(tbody);
      var bestK = Object.keys(res).reduce(function (a, b) { return res[a] <= res[b] ? a : b; });
      ["naive", "snaive", "ma", "ses"].forEach(function (k) {
        tbody.appendChild(h("tr", { class: (k === kind ? "wg-fcst-cur" : "") + (k === bestK ? " wg-fcst-best" : "") },
          h("td", null, names[k] + (k === bestK ? " (lowest)" : "")), h("td", null, res[k].toFixed(1))));
      });

      var you = res[kind], base = res.snaive, msg;
      if (kind === "snaive") msg = "Seasonal naive misses by " + base.toFixed(1) + " units a day. This is the bar any model must beat.";
      else {
        var diff = (you - base) / Math.max(base, 0.01);
        msg = names[kind] + " misses by " + you.toFixed(1) + " units a day, " + Math.abs(Math.round(diff * 100)) + "% " + (diff > 0 ? "worse" : "better") + " than seasonal naive.";
        if (season.get() >= 20 && kind !== "snaive" && diff > 0) msg += " A flat forecast cannot follow a strong weekly pattern.";
        else if (season.get() === 0 && diff <= 0) msg += " With no weekly pattern, smoothing out the noise beats copying last week.";
      }
      if (kind === "ses") msg += alpha.get() >= 0.7 ? " A high alpha chases the most recent day." : alpha.get() <= 0.15 ? " A low alpha averages over a long past, lagging the trend." : "";
      mean.set(msg);
    }
    [method.input, win.input, alpha.input, season.input, noiseS.input].forEach(function (el) {
      el.addEventListener("input", update); el.addEventListener("change", update);
    });

    host.appendChild(h("div", { class: "wg-w9-wrap" },
      h("div", { class: "wg-w9-grid" }, method.el, win.el, alpha.el, season.el, noiseS.el),
      h("div", { class: "wg-w9-plot" }, svg),
      h("p", { class: "wg-w9-note" }, "Grey: the last 6 weeks of history. Black: actual sales in the holdout. Dashed blue: your forecast."),
      h("div", { class: "wg-w9-stats" }, maeStat.el, baseStat.el),
      table, mean.el,
      h("p", { class: "wg-w9-note" }, "Synthetic daily sales: a slow upward trend, a weekly pattern (busy Friday and Saturday, quiet Sunday) and random noise. MAE is the average size of the miss per day.")));
    update();
  }

  /* =====================================================================
     anomaly: z-score threshold playground
     ===================================================================== */
  function renderAnomaly(host) {
    var N = 120, r0 = rng(424242), base = [];
    for (var i = 0; i < N; i++) base.push(50 + 5 * gauss(r0));
    // injected anomalies: [day, size added]; a mix of big and subtle ones
    var SPIKES = [[14, 45], [31, 16], [52, 22], [67, 60], [83, 14], [98, 28], [109, -18]];
    var isTrue = {};
    SPIKES.forEach(function (sp) { base[sp[0]] += sp[1]; isTrue[sp[0]] = true; });
    var y = base.map(function (v) { return Math.round(v * 10) / 10; });

    var thr = slider("Flag when |z| is above", 1, 5, 0.1, 3, "", function (v) { return v.toFixed(1); });
    var robust = checkField("Use robust z (median and MAD instead of mean and sd)", false);
    var svg = s("svg", { viewBox: "0 0 640 228", class: "wg-anom-svg", role: "img", "aria-label": "Daily metric with injected anomalies and flagged points" });
    var flagged = stat("Flagged points");
    var prec = stat("Precision");
    var rec = stat("Recall");
    var detail = h("p", { class: "wg-w9-note" });
    var mean = meaning();

    function median(a) { var b = a.slice().sort(function (p, q) { return p - q; }), m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; }
    function update() {
      var t = thr.get(), useR = robust.input.checked, center, scale;
      if (useR) {
        center = median(y);
        scale = 1.4826 * median(y.map(function (v) { return Math.abs(v - center); }));
      } else {
        center = y.reduce(function (a, b) { return a + b; }, 0) / N;
        scale = Math.sqrt(y.reduce(function (a, b) { return a + (b - center) * (b - center); }, 0) / N);
      }
      var z = y.map(function (v) { return (v - center) / scale; });
      var tp = 0, fp = 0, fn = 0, flags = [];
      z.forEach(function (zz, j) {
        var f = Math.abs(zz) > t;
        if (f) flags.push(j);
        if (f && isTrue[j]) tp++; else if (f) fp++; else if (isTrue[j]) fn++;
      });
      var P = tp + fp ? tp / (tp + fp) : null, Rr = tp / SPIKES.length;

      clear(svg);
      var lo = Math.min.apply(null, y) - 5, hi = Math.max.apply(null, y) + 5;
      var L = 40, R = 630, T = 12, B = 218;
      function X(j) { return L + j / (N - 1) * (R - L); }
      function Y(v) { return B - (v - lo) / (hi - lo) * (B - T); }
      [lo + 5, (lo + hi) / 2, hi - 5].forEach(function (v) {
        svg.appendChild(s("line", { x1: L, y1: Y(v), x2: R, y2: Y(v), class: "wg-anom-grid" }));
        svg.appendChild(s("text", { x: L - 6, y: Y(v) + 4, "text-anchor": "end", class: "wg-anom-lbl", text: Math.round(v) }));
      });
      // threshold band
      var up = center + t * scale, dn = center - t * scale;
      var bandTop = Math.max(T, Math.min(B, Y(up))), bandBot = Math.max(T, Math.min(B, Y(dn)));
      svg.appendChild(s("rect", { x: L, y: bandTop, width: R - L, height: Math.max(0, bandBot - bandTop), class: "wg-anom-band" }));
      if (Y(up) >= T) svg.appendChild(s("line", { x1: L, y1: Y(up), x2: R, y2: Y(up), class: "wg-anom-thr" }));
      if (Y(dn) <= B) svg.appendChild(s("line", { x1: L, y1: Y(dn), x2: R, y2: Y(dn), class: "wg-anom-thr" }));
      svg.appendChild(s("path", { d: y.map(function (v, j) { return (j ? "L" : "M") + X(j).toFixed(1) + " " + Y(v).toFixed(1); }).join(" "), class: "wg-anom-line" }));
      y.forEach(function (v, j) {
        if (isTrue[j]) svg.appendChild(s("circle", { cx: X(j), cy: Y(v), r: 7, class: "wg-anom-true" }));
        if (Math.abs(z[j]) > t) svg.appendChild(s("circle", { cx: X(j), cy: Y(v), r: 3.8, class: isTrue[j] ? "wg-anom-hit" : "wg-anom-fa" }));
      });

      flagged.set(flags.length + " of " + N + " days");
      prec.set(P == null ? "n/a" : pct(P) + " (" + tp + " of " + (tp + fp) + ")");
      rec.set(pct(Rr) + " (" + tp + " of " + SPIKES.length + ")");
      detail.textContent = (useR ? "Robust centre (median) " : "Mean ") + center.toFixed(1) + ", " + (useR ? "robust spread (1.4826 x MAD) " : "standard deviation ") + scale.toFixed(1) +
        ". False alarms: " + fp + ". Missed anomalies: " + fn + ".";

      var msg;
      if (!flags.length) msg = "Nothing is flagged, so all " + SPIKES.length + " real anomalies are missed. The threshold is too strict.";
      else {
        msg = "Of " + flags.length + " alerts, " + tp + " are real (" + pct(P) + "), and you catch " + tp + " of " + SPIKES.length + " anomalies.";
        if (fp > tp) msg += " Most alerts are false alarms; a review team would soon ignore them.";
        else if (fn > 0 && !useR && t >= 2.5) msg += " The big spikes inflate the sd and mask the subtle ones; try the robust z.";
        else if (fn > 0) msg += " Lowering the threshold catches more, at the cost of more false alarms.";
        else msg += " Every anomaly is caught at this threshold.";
      }
      mean.set(msg);
    }
    thr.input.addEventListener("input", update);
    robust.input.addEventListener("change", update);

    host.appendChild(h("div", { class: "wg-w9-wrap" },
      h("div", { class: "wg-w9-grid" }, thr.el, robust.el),
      h("div", { class: "wg-w9-plot" }, svg),
      h("p", { class: "wg-w9-note" }, "Ring: a real (injected) anomaly. Blue dot: flagged and real. Orange dot: false alarm. Shaded band: values that are not flagged."),
      h("div", { class: "wg-w9-stats" }, flagged.el, prec.el, rec.el),
      detail, mean.el,
      h("p", { class: "wg-w9-note" }, "Synthetic daily metric around 50 with 7 injected anomalies: 2 large, 5 subtle (one is a dip). Precision = real alerts / all alerts. Recall = anomalies caught / all anomalies.")));
    update();
  }

  Object.assign(WIDGETS, {
    dimred: {
      title: "PCA playground",
      intro: "Turn your line through the cloud and watch how much of the spread it keeps. Then change how strongly the two columns are linked and see how much one component can capture.",
      render: renderPCA
    },
    timeseries: {
      title: "Forecast playground",
      intro: "Pick a forecast method and compare its error on the last 14 days with the seasonal-naive baseline. Try exponential smoothing with different alpha values, then shrink the weekly pattern to zero.",
      render: renderForecast
    },
    anomaly: {
      title: "Z-score threshold tuner",
      intro: "Move the threshold and watch alerts, precision and recall change. Then switch on the robust z to see how big spikes were hiding the subtle ones.",
      render: renderAnomaly
    }
  });
})();
WIDGET_CSS += `
.wg-w9-wrap { display:flex; flex-direction:column; gap:14px; font-family:var(--body); color:var(--ink); min-width:0; }
.wg-w9-cols { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:16px; align-items:start; }
.wg-w9-ctrl { display:flex; flex-direction:column; gap:12px; min-width:0; }
.wg-w9-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px 16px; }
.wg-w9-field { display:flex; flex-direction:column; gap:4px; min-width:0; }
.wg-w9-field[hidden] { display:none; }
.wg-w9-lab { display:flex; justify-content:space-between; gap:8px; font-size:14px; font-weight:600; }
.wg-w9-lab label { flex:1; }
.wg-w9-val { font-family:var(--mono); font-size:13px; color:var(--accent); white-space:nowrap; }
.wg-w9-range { width:100%; accent-color:var(--accent); }
.wg-w9-in { font:inherit; font-size:14px; padding:6px 8px; border:1px solid var(--line-strong); border-radius:6px; background:var(--surface); color:var(--ink); width:100%; box-sizing:border-box; }
.wg-w9-check { display:flex; gap:8px; align-items:flex-start; font-size:14px; }
.wg-w9-check input { margin-top:3px; accent-color:var(--accent); }
.wg-w9-row { display:flex; flex-wrap:wrap; gap:8px; }
.wg-w9-btn { font:inherit; font-size:14px; padding:6px 12px; border-radius:6px; border:1px solid var(--accent); background:var(--accent-soft); color:var(--ink); cursor:pointer; }
.wg-w9-btn:hover { background:var(--accent); color:var(--accent-ink); }
.wg-w9-btn:focus-visible { outline:2px solid var(--accent); outline-offset:2px; }
.wg-w9-plot { border:1px solid var(--line); border-radius:8px; background:var(--surface); padding:6px; min-width:0; }
.wg-w9-plotcol { display:flex; flex-direction:column; gap:6px; min-width:0; }
.wg-w9-plot svg { display:block; width:100%; height:auto; }
.wg-w9-stats { display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:8px; }
.wg-w9-stat { border:1px solid var(--line); border-radius:8px; padding:8px 10px; background:var(--surface); min-width:0; }
.wg-w9-statl { font-size:12px; color:var(--muted); }
.wg-w9-statv { font-size:17px; font-weight:700; font-family:var(--mono); word-break:break-word; }
.wg-w9-mean { margin:0; padding:10px 12px; border-left:3px solid var(--accent); background:var(--accent-soft); border-radius:4px; font-size:14px; line-height:1.5; }
.wg-w9-note { margin:0; font-size:13px; color:var(--muted); line-height:1.5; }
.wg-w9-tablewrap { overflow-x:auto; }
.wg-w9-table { border-collapse:collapse; width:100%; font-size:14px; }
.wg-w9-table th, .wg-w9-table td { text-align:left; padding:6px 8px; border-bottom:1px solid var(--line); }
.wg-w9-table td:last-child, .wg-w9-table th:last-child { text-align:right; font-family:var(--mono); }
.wg-pca-axis { stroke:var(--line); stroke-width:1; }
.wg-pca-lbl { fill:var(--muted); font-size:12px; font-family:var(--body); }
.wg-fcst-lbl, .wg-anom-lbl { fill:var(--muted); font-size:15px; font-family:var(--body); }
.wg-pca-pt { fill:var(--muted); opacity:.7; }
.wg-pca-proj { stroke:var(--accent); stroke-width:.8; opacity:.45; }
.wg-pca-you { stroke:var(--accent); stroke-width:3; stroke-linecap:round; }
.wg-pca-best { stroke:var(--ink); stroke-width:1.5; stroke-dasharray:5 4; opacity:.6; }
.wg-pca-barwrap { display:flex; flex-direction:column; gap:4px; }
.wg-pca-bar { position:relative; height:14px; border-radius:7px; background:var(--code-bg); border:1px solid var(--line); overflow:hidden; }
.wg-pca-bar-best { position:absolute; left:0; top:0; bottom:0; background:var(--accent-soft); }
.wg-pca-bar-you { position:absolute; left:0; top:3px; bottom:3px; background:var(--accent); border-radius:4px; }
.wg-fcst-grid, .wg-anom-grid { stroke:var(--line); stroke-width:1; }
.wg-fcst-hold { fill:var(--hl); opacity:.6; }
.wg-fcst-hist { fill:none; stroke:var(--muted); stroke-width:1.8; }
.wg-fcst-act { fill:none; stroke:var(--ink); stroke-width:2; }
.wg-fcst-fc { fill:none; stroke:var(--accent); stroke-width:2.5; stroke-dasharray:6 4; }
.wg-fcst-cur td { font-weight:700; background:var(--accent-soft); }
.wg-anom-band { fill:var(--accent-soft); opacity:.6; }
.wg-anom-thr { stroke:var(--accent); stroke-width:1; stroke-dasharray:4 3; }
.wg-anom-line { fill:none; stroke:var(--muted); stroke-width:1.5; }
.wg-anom-true { fill:none; stroke:var(--ink); stroke-width:1.5; }
.wg-anom-hit { fill:var(--accent); }
.wg-anom-fa { fill:var(--packet); stroke:var(--ink); stroke-width:.6; }
@media (max-width: 640px) { .wg-w9-cols { grid-template-columns:minmax(0,1fr); } }
`;
