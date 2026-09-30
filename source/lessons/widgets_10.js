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
  function uid() { return "wgw10-" + Math.random().toString(36).slice(2, 10); }
  function btn(label, onclick, cls) {
    return h("button", { type: "button", class: "wg-w10-btn" + (cls ? " " + cls : ""), onclick: onclick }, label);
  }
  function field(labelText, control, valueEl) {
    var id = control.id || (control.id = uid());
    var lab = h("label", { for: id }, labelText);
    if (valueEl) lab.appendChild(valueEl);
    return h("div", { class: "wg-w10-field" }, lab, control);
  }
  function slider(min, max, step, value) {
    return h("input", { type: "range", class: "wg-w10-range", min: min, max: max, step: step, value: value });
  }
  function meaning() {
    var span = h("span");
    var el = h("p", { class: "wg-w10-mean", "aria-live": "polite" }, h("strong", null, "What this means: "), span);
    return { el: el, set: function (t) { span.textContent = t; } };
  }
  function stat(label) {
    var v = h("span", { class: "wg-w10-statv" }, "0");
    return { el: h("div", { class: "wg-w10-stat" }, h("span", { class: "wg-w10-statl" }, label), v), set: function (t) { v.textContent = t; } };
  }
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function gauss(rng) {
    var u = 1 - rng(), v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  /* ---------- neural network trainer ---------- */
  function makeData(kind) {
    var rng = mulberry32(kind === "xor" ? 11 : 23), pts = [];
    if (kind === "xor") {
      var corners = [[-0.55, -0.55, 0], [0.55, 0.55, 0], [-0.55, 0.55, 1], [0.55, -0.55, 1]];
      corners.forEach(function (c) {
        for (var i = 0; i < 20; i++) pts.push([c[0] + gauss(rng) * 0.18, c[1] + gauss(rng) * 0.18, c[2]]);
      });
    } else {
      while (pts.length < 90) {
        var x = rng() * 2 - 1, y = rng() * 2 - 1, r = Math.sqrt(x * x + y * y);
        if (r > 0.45 && r < 0.62) continue; // leave a small gap so the classes are clear
        pts.push([x, y, r < 0.5 ? 1 : 0]);
      }
    }
    return pts.map(function (p) { return [Math.max(-0.98, Math.min(0.98, p[0])), Math.max(-0.98, Math.min(0.98, p[1])), p[2]]; });
  }

  function Net(H, seed) {
    var rng = mulberry32(seed);
    this.H = H;
    this.W1 = []; this.b1 = []; this.W2 = []; this.b2 = 0;
    for (var j = 0; j < H; j++) {
      this.W1.push([gauss(rng) * 1.2, gauss(rng) * 1.2]);
      this.b1.push(gauss(rng) * 0.3);
      this.W2.push(gauss(rng) * 0.8);
    }
  }
  Net.prototype.predict = function (x, y) {
    var z = this.b2;
    for (var j = 0; j < this.H; j++) z += this.W2[j] * Math.tanh(this.W1[j][0] * x + this.W1[j][1] * y + this.b1[j]);
    return 1 / (1 + Math.exp(-z));
  };
  // one epoch of full-batch gradient descent, returns loss before the update
  Net.prototype.epoch = function (data, lr) {
    var H = this.H, n = data.length, loss = 0;
    var gW1 = [], gb1 = [], gW2 = [], gb2 = 0, j;
    for (j = 0; j < H; j++) { gW1.push([0, 0]); gb1.push(0); gW2.push(0); }
    var hid = new Array(H);
    for (var i = 0; i < n; i++) {
      var x = data[i][0], y = data[i][1], t = data[i][2], z = this.b2;
      for (j = 0; j < H; j++) { hid[j] = Math.tanh(this.W1[j][0] * x + this.W1[j][1] * y + this.b1[j]); z += this.W2[j] * hid[j]; }
      var p = 1 / (1 + Math.exp(-z));
      var pc = Math.min(1 - 1e-9, Math.max(1e-9, p));
      loss -= t * Math.log(pc) + (1 - t) * Math.log(1 - pc);
      var dz = (p - t) / n;                        // error at the output
      gb2 += dz;
      for (j = 0; j < H; j++) {
        gW2[j] += dz * hid[j];
        var dh = dz * this.W2[j] * (1 - hid[j] * hid[j]); // chain rule through tanh
        gW1[j][0] += dh * x; gW1[j][1] += dh * y; gb1[j] += dh;
      }
    }
    for (j = 0; j < H; j++) {
      this.W1[j][0] -= lr * gW1[j][0]; this.W1[j][1] -= lr * gW1[j][1];
      this.b1[j] -= lr * gb1[j]; this.W2[j] -= lr * gW2[j];
    }
    this.b2 -= lr * gb2;
    return loss / n;
  };
  Net.prototype.accuracy = function (data) {
    var ok = 0, self = this;
    data.forEach(function (d) { if ((self.predict(d[0], d[1]) > 0.5 ? 1 : 0) === d[2]) ok++; });
    return ok / data.length;
  };

  var LRS = [0.01, 0.03, 0.1, 0.3, 0.5, 1, 2, 5, 10];
  var MAX_EPOCHS = 4000;

  function renderNN(host) {
    var st = { kind: "xor", H: 4, lrIdx: 5, seed: 1, running: false, epoch: 0, losses: [], net: null, data: null, raf: 0 };

    var dsSel = h("select", { class: "wg-w10-in" },
      h("option", { value: "xor" }, "XOR"),
      h("option", { value: "circle" }, "Circle"));
    var hVal = h("span", { class: "wg-w10-val" });
    var hSl = slider(1, 12, 1, st.H);
    var lrVal = h("span", { class: "wg-w10-val" });
    var lrSl = slider(0, LRS.length - 1, 1, st.lrIdx);
    var trainB = btn("Train", function () { st.running ? stop() : start(); }, "wg-w10-primary");
    var stepB = btn("Train 100 epochs", function () { stop(); runEpochs(100); draw(); });
    var resetB = btn("New random start", function () { st.seed++; reset(); });

    var N = 30, cells = [];
    var map = s("svg", { viewBox: "0 0 300 300", class: "wg-w10-svg", role: "img", "aria-label": "Decision regions of the network with training points" });
    var gCells = s("g", { "shape-rendering": "crispEdges" }), gPts = s("g");
    for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) {
      var rect = s("rect", { x: c * 10, y: r * 10, width: 10, height: 10 });
      cells.push(rect); gCells.appendChild(rect);
    }
    map.appendChild(gCells); map.appendChild(gPts);
    map.appendChild(s("rect", { x: 0.5, y: 0.5, width: 299, height: 299, fill: "none", stroke: "var(--line-strong)" }));

    var curve = s("svg", { viewBox: "0 0 300 150", class: "wg-w10-svg", role: "img", "aria-label": "Training loss per epoch" });
    var legend = h("p", { class: "wg-w10-note" },
      h("span", { class: "wg-w10-key wg-w10-key1" }), " class 1 (filled circle)   ",
      h("span", { class: "wg-w10-key wg-w10-key0" }), " class 0 (hollow square). Shading shows what the network predicts at each spot; stronger colour means more confident.");

    var sEpoch = stat("Epochs"), sLoss = stat("Loss"), sAcc = stat("Accuracy");
    var mean = meaning();

    function toPx(v) { return (v + 1) * 150; }
    function drawPoints() {
      clear(gPts);
      st.data.forEach(function (d) {
        var x = toPx(d[0]), y = toPx(-d[1]);
        if (d[2] === 1) gPts.appendChild(s("circle", { cx: x, cy: y, r: 4.2, fill: "var(--accent)", stroke: "var(--ink)", "stroke-width": 1 }));
        else gPts.appendChild(s("rect", { x: x - 3.6, y: y - 3.6, width: 7.2, height: 7.2, fill: "var(--surface)", stroke: "var(--ink)", "stroke-width": 1.3 }));
      });
    }
    function drawMap() {
      for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) {
        var x = (c + 0.5) / N * 2 - 1, y = 1 - (r + 0.5) / N * 2;
        var p = st.net.predict(x, y), rect = cells[r * N + c];
        rect.setAttribute("fill", p >= 0.5 ? "var(--accent)" : "var(--packet)");
        rect.setAttribute("fill-opacity", (0.06 + Math.abs(p - 0.5) * 0.9).toFixed(3));
      }
    }
    function drawCurve() {
      clear(curve);
      var L = 34, R = 292, T = 10, B = 124;
      var maxL = Math.max(0.8, st.losses.length ? Math.max.apply(null, st.losses.map(function (q) { return q[1]; })) : 0.8);
      maxL = Math.ceil(maxL * 5) / 5;
      curve.appendChild(s("line", { x1: L, y1: B, x2: R, y2: B, stroke: "var(--line-strong)" }));
      curve.appendChild(s("line", { x1: L, y1: T, x2: L, y2: B, stroke: "var(--line-strong)" }));
      [0, maxL / 2, maxL].forEach(function (v) {
        var y = B - v / maxL * (B - T);
        curve.appendChild(s("text", { x: L - 4, y: y + 3, "text-anchor": "end", class: "wg-w10-axis", text: v.toFixed(1) }));
      });
      var maxE = Math.max(500, Math.ceil(st.epoch / 500) * 500);
      [0, maxE].forEach(function (v, i) {
        curve.appendChild(s("text", { x: L + (R - L) * (v / maxE), y: B + 13, "text-anchor": i ? "end" : "start", class: "wg-w10-axis", text: String(v) }));
      });
      curve.appendChild(s("text", { x: (L + R) / 2, y: B + 24, "text-anchor": "middle", class: "wg-w10-axis", text: "epoch" }));
      curve.appendChild(s("text", { x: 4, y: T + 2, class: "wg-w10-axis", text: "loss", transform: "rotate(90 4 " + (T + 2) + ")" }));
      if (st.losses.length > 1) {
        var pts = st.losses.map(function (q) {
          return (L + (R - L) * q[0] / maxE).toFixed(1) + "," + (B - Math.min(q[1], maxL) / maxL * (B - T)).toFixed(1);
        }).join(" ");
        curve.appendChild(s("polyline", { points: pts, fill: "none", stroke: "var(--accent)", "stroke-width": 2, "stroke-linejoin": "round" }));
      }
    }
    function lastLoss() { return st.losses.length ? st.losses[st.losses.length - 1][1] : NaN; }
    function explain() {
      var acc = st.net.accuracy(st.data), loss = lastLoss(), lr = LRS[st.lrIdx], n = st.data.length;
      var name = st.kind === "xor" ? "XOR" : "circle";
      if (st.epoch === 0) {
        mean.set("The network starts with random weights, so its guesses are about as good as a coin. Press Train and watch the shading and the loss change.");
      } else if (st.H === 1) {
        mean.set("With 1 hidden unit the network can only draw one straight boundary, so it gets " + Math.round(acc * 100) + "% of the " + name + " points right at best. Add hidden units to let it bend the boundary.");
      } else if (st.kind === "circle" && st.H === 2 && acc < 0.95) {
        mean.set("Two hidden units give two straight edges, which is not enough to wrap around a circle (" + Math.round(acc * 100) + "% correct). Try 3 or more.");
      } else if (!isFinite(loss) || (lr >= 5 && st.losses.length > 5 && loss > 0.3)) {
        mean.set("A learning rate of " + lr + " takes steps so big that the loss jumps around instead of settling. Lower it and start again.");
      } else if (acc === 1 && loss < 0.1) {
        mean.set("After " + st.epoch + " epochs the network classifies all " + n + " points correctly with loss " + loss.toFixed(3) + ". The hidden units have bent the boundary to fit the " + name + " pattern.");
      } else if (lr <= 0.03 && st.epoch >= 300) {
        mean.set("With learning rate " + lr + " each step is tiny, so after " + st.epoch + " epochs the loss has only reached " + loss.toFixed(3) + ". Raise it to learn faster.");
      } else if (st.epoch >= MAX_EPOCHS && acc < 0.95) {
        mean.set("Training stalled at " + Math.round(acc * 100) + "% accuracy. This random start got stuck; press New random start or change the settings.");
      } else {
        mean.set("After " + st.epoch + " epochs the loss is " + loss.toFixed(3) + " and " + Math.round(acc * 100) + "% of points are on the right side. Each epoch nudges every weight a little downhill.");
      }
    }
    function draw() {
      drawMap(); drawCurve();
      sEpoch.set(String(st.epoch));
      var l = lastLoss();
      sLoss.set(isFinite(l) ? l.toFixed(3) : "n/a");
      sAcc.set(Math.round(st.net.accuracy(st.data) * 100) + "%");
      explain();
    }
    function runEpochs(k) {
      var lr = LRS[st.lrIdx];
      for (var i = 0; i < k && st.epoch < MAX_EPOCHS; i++) {
        var l = st.net.epoch(st.data, lr);
        if (st.epoch % 10 === 0) st.losses.push([st.epoch, isFinite(l) ? l : 10]);
        st.epoch++;
      }
      if (st.epoch >= MAX_EPOCHS) stop();
    }
    function tick() {
      if (!host.isConnected) { st.running = false; return; }
      if (!st.running) return;
      runEpochs(15); draw();
      if (st.running) st.raf = requestAnimationFrame(tick);
    }
    function start() {
      if (st.epoch >= MAX_EPOCHS) reset();
      st.running = true; trainB.textContent = "Pause";
      st.raf = requestAnimationFrame(tick);
    }
    function stop() {
      st.running = false; trainB.textContent = "Train";
      if (st.raf) cancelAnimationFrame(st.raf);
    }
    function reset() {
      stop();
      st.data = makeData(st.kind);
      st.net = new Net(st.H, st.seed * 7919 + st.H);
      st.epoch = 0; st.losses = [];
      drawPoints(); draw();
    }
    function syncLabels() {
      hVal.textContent = ": " + st.H;
      lrVal.textContent = ": " + LRS[st.lrIdx];
    }
    dsSel.addEventListener("change", function () { st.kind = dsSel.value; reset(); });
    hSl.addEventListener("input", function () { st.H = +hSl.value; syncLabels(); reset(); });
    lrSl.addEventListener("input", function () { st.lrIdx = +lrSl.value; syncLabels(); explain(); });

    syncLabels();
    host.appendChild(h("div", { class: "wg-w10-box" },
      h("div", { class: "wg-w10-row" },
        field("Dataset", dsSel),
        field("Hidden units", hSl, hVal),
        field("Learning rate", lrSl, lrVal)),
      h("div", { class: "wg-w10-row wg-w10-btns" }, trainB, stepB, resetB),
      h("div", { class: "wg-w10-grid" },
        h("figure", { class: "wg-w10-fig" }, map, h("figcaption", { class: "wg-w10-note" }, "Decision regions (x from -1 to 1 left to right, y from -1 to 1 bottom to top)")),
        h("figure", { class: "wg-w10-fig" }, curve, h("figcaption", { class: "wg-w10-note" }, "Training loss (binary cross-entropy), sampled every 10 epochs"),
          h("div", { class: "wg-w10-stats" }, sEpoch.el, sLoss.el, sAcc.el))),
      legend,
      mean.el,
      h("p", { class: "wg-w10-note" }, "Network: 2 inputs, one tanh hidden layer, sigmoid output, full-batch gradient descent on " + "cross-entropy loss, the same maths as the numpy XOR example in the lesson.")));
    reset();
  }

  /* ---------- multi-armed bandit ---------- */
  var ARM_NAMES = ["A", "B", "C", "D"];
  function renderBandit(host) {
    var st = { rates: [], counts: [0, 0, 0, 0], sums: [0, 0, 0, 0], total: 0, pulls: 0, hist: [[0, 0]], eps: 0.1, timer: 0, running: false, reveal: false, lastArm: -1, lastWin: false, lastExplore: false };
    var MAX_PULLS = 2000;

    function newRates() {
      var base = [0.2, 0.35, 0.5, 0.6].map(function (r) { return Math.round((r + (Math.random() - 0.5) * 0.1) * 100) / 100; });
      for (var i = base.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = base[i]; base[i] = base[j]; base[j] = t; }
      return base;
    }
    function est(i) { return st.counts[i] ? st.sums[i] / st.counts[i] : 0; }
    function bestArm() { var b = 0; for (var i = 1; i < 4; i++) if (st.rates[i] > st.rates[b]) b = i; return b; }
    function pull(arm, explore) {
      if (st.pulls >= MAX_PULLS) return;
      var win = Math.random() < st.rates[arm];
      st.counts[arm]++; st.sums[arm] += win ? 1 : 0; st.total += win ? 1 : 0; st.pulls++;
      st.lastArm = arm; st.lastWin = win; st.lastExplore = !!explore;
      if (st.pulls % 5 === 0 || st.pulls < 50) st.hist.push([st.pulls, st.total]);
    }
    function autoPull() {
      if (Math.random() < st.eps) { pull(Math.floor(Math.random() * 4), true); return; }
      var best = [], bv = -1;
      for (var i = 0; i < 4; i++) { var v = est(i); if (v > bv + 1e-12) { bv = v; best = [i]; } else if (Math.abs(v - bv) < 1e-12) best.push(i); }
      // untried arms have estimate 0; ties are broken at random
      pull(best[Math.floor(Math.random() * best.length)], false);
    }

    var epsVal = h("span", { class: "wg-w10-val" });
    var epsSl = slider(0, 1, 0.01, st.eps);
    var speedSel = h("select", { class: "wg-w10-in" },
      h("option", { value: "1" }, "Slow (10/s)"),
      h("option", { value: "10", selected: true }, "Fast (100/s)"),
      h("option", { value: "50" }, "Very fast (500/s)"));
    var autoB = btn("Auto-play", function () { st.running ? stop() : start(); }, "wg-w10-primary");
    var stepB = btn("Auto-play 1 pull", function () { stop(); autoPull(); draw(); });
    var resetB = btn("New machines", function () { reset(true); });
    var revealCb = h("input", { type: "checkbox", id: uid() });
    var revealLab = h("label", { class: "wg-w10-cb", for: revealCb.id }, revealCb, " Reveal the hidden payout rates");

    var armBox = h("div", { class: "wg-w10-arms" });
    var armEls = ARM_NAMES.map(function (name, i) {
      var pullB = btn("Pull " + name, function () { stop(); pull(i, false); draw(); }, "wg-w10-armbtn");
      var bar = h("div", { class: "wg-w10-barfill" });
      var trueMark = h("div", { class: "wg-w10-truemark" });
      var info = h("div", { class: "wg-w10-arminfo" });
      var el = h("div", { class: "wg-w10-arm" }, pullB,
        h("div", { class: "wg-w10-armmain" }, h("div", { class: "wg-w10-bar", "aria-hidden": "true" }, bar, trueMark), info));
      armBox.appendChild(el);
      return { el: el, bar: bar, trueMark: trueMark, info: info };
    });
    var last = h("p", { class: "wg-w10-note", "aria-live": "polite" });

    var chart = s("svg", { viewBox: "0 0 320 170", class: "wg-w10-svg", role: "img", "aria-label": "Cumulative reward compared with always pulling the best arm" });
    var sPulls = stat("Pulls"), sTotal = stat("Reward"), sBest = stat("Best arm, expected"), sRegret = stat("Regret");
    var mean = meaning();

    function drawChart() {
      clear(chart);
      var L = 38, R = 312, T = 10, B = 138;
      var maxX = Math.max(200, Math.ceil(st.pulls / 200) * 200);
      var br = st.rates[bestArm()];
      var maxY = Math.max(10, Math.ceil(maxX * br / 10) * 10);
      function X(v) { return L + (R - L) * v / maxX; }
      function Y(v) { return B - (B - T) * v / maxY; }
      chart.appendChild(s("line", { x1: L, y1: B, x2: R, y2: B, stroke: "var(--line-strong)" }));
      chart.appendChild(s("line", { x1: L, y1: T, x2: L, y2: B, stroke: "var(--line-strong)" }));
      [0, maxY / 2, maxY].forEach(function (v) {
        chart.appendChild(s("text", { x: L - 4, y: Y(v) + 3, "text-anchor": "end", class: "wg-w10-axis", text: String(Math.round(v)) }));
      });
      [0, maxX].forEach(function (v, i) {
        chart.appendChild(s("text", { x: X(v), y: B + 13, "text-anchor": i ? "end" : "start", class: "wg-w10-axis", text: String(v) }));
      });
      chart.appendChild(s("text", { x: (L + R) / 2, y: B + 26, "text-anchor": "middle", class: "wg-w10-axis", text: "pulls" }));
      chart.appendChild(s("line", { x1: X(0), y1: Y(0), x2: X(maxX), y2: Y(maxX * br), stroke: "var(--muted)", "stroke-width": 1.5, "stroke-dasharray": "5 4" }));
      var pts = st.hist.concat([[st.pulls, st.total]]).map(function (q) { return X(q[0]).toFixed(1) + "," + Y(q[1]).toFixed(1); }).join(" ");
      chart.appendChild(s("polyline", { points: pts, fill: "none", stroke: "var(--accent)", "stroke-width": 2.2, "stroke-linejoin": "round" }));
      chart.appendChild(s("text", { x: L + 6, y: T + 10, class: "wg-w10-axis", text: "dashed: always the best arm" }));
      chart.appendChild(s("text", { x: L + 6, y: T + 22, class: "wg-w10-axis wg-w10-axisacc", text: "solid: your total reward" }));
    }
    function draw() {
      var b = bestArm(), maxCount = Math.max(1, Math.max.apply(null, st.counts));
      armEls.forEach(function (a, i) {
        var e = est(i);
        a.bar.style.width = (e * 100).toFixed(1) + "%";
        a.trueMark.style.left = (st.rates[i] * 100).toFixed(1) + "%";
        a.trueMark.style.display = st.reveal ? "block" : "none";
        a.info.textContent = "Pulled " + st.counts[i] + " times, paid " + st.sums[i] + ", estimate " + (st.counts[i] ? Math.round(e * 100) + "%" : "unknown") +
          (st.reveal ? ", true rate " + Math.round(st.rates[i] * 100) + "%" : "");
        a.el.classList.toggle("wg-w10-armbest", st.reveal && i === b);
        a.el.classList.toggle("wg-w10-armlast", i === st.lastArm);
        a.el.style.setProperty("--wg-w10-share", (st.counts[i] / maxCount).toFixed(3));
      });
      last.textContent = st.lastArm < 0 ? "No pulls yet. Pull an arm yourself or press Auto-play." :
        "Last pull: arm " + ARM_NAMES[st.lastArm] + (st.lastExplore ? " (exploring at random)" : "") + ", " + (st.lastWin ? "it paid 1." : "it paid nothing.");
      var expBest = st.pulls * st.rates[b];
      sPulls.set(String(st.pulls));
      sTotal.set(String(st.total));
      sBest.set(expBest.toFixed(0));
      sRegret.set(Math.max(0, expBest - st.total).toFixed(0));
      drawChart();
      explain(b, expBest);
    }
    function explain(b, expBest) {
      if (st.pulls === 0) {
        mean.set("Each machine pays 1 with a hidden probability. You must try them to learn which is best, but every try on a poor machine costs you reward.");
        return;
      }
      var per100 = st.total / st.pulls * 100, bestPer100 = st.rates[b] * 100;
      var share = st.counts[b] / st.pulls * 100;
      var msg = "After " + st.pulls + (st.pulls === 1 ? " pull" : " pulls") + " you earned " + st.total + ", about " + per100.toFixed(0) + " per 100 pulls; always pulling the best machine averages " + bestPer100.toFixed(0) + ". ";
      if (st.eps === 0 && st.pulls >= 100 && share < 50) msg += "With epsilon 0 the player never explores, so it locked onto machine " + ARM_NAMES[st.counts.indexOf(Math.max.apply(null, st.counts))] + " and may never find the better one.";
      else if (st.eps >= 0.5 && st.pulls >= 100) msg += "With epsilon " + st.eps.toFixed(2) + ", " + Math.round(st.eps * 100) + "% of pulls are random, so it keeps wasting pulls on machines it already knows are worse.";
      else if (st.pulls >= 200) msg += "The best machine got " + share.toFixed(0) + "% of pulls. The gap to the dashed line is the regret: the price of exploring and of early mistakes.";
      else msg += "Early estimates are noisy; a machine can look good or bad by luck after a few pulls.";
      mean.set(msg);
    }
    function tick() {
      if (!host.isConnected) { stop(); return; }
      var k = +speedSel.value;
      for (var i = 0; i < k; i++) autoPull();
      draw();
      if (st.pulls >= MAX_PULLS) stop();
    }
    function start() {
      if (st.pulls >= MAX_PULLS) reset(false);
      st.running = true; autoB.textContent = "Pause";
      st.timer = setInterval(tick, 100);
    }
    function stop() {
      st.running = false; autoB.textContent = "Auto-play";
      if (st.timer) { clearInterval(st.timer); st.timer = 0; }
    }
    function reset(newMachines) {
      stop();
      if (newMachines || !st.rates.length) st.rates = newRates();
      st.counts = [0, 0, 0, 0]; st.sums = [0, 0, 0, 0]; st.total = 0; st.pulls = 0; st.hist = [[0, 0]]; st.lastArm = -1;
      draw();
    }
    epsSl.addEventListener("input", function () { st.eps = +epsSl.value; epsVal.textContent = ": " + st.eps.toFixed(2); draw(); });
    revealCb.addEventListener("change", function () { st.reveal = revealCb.checked; draw(); });
    var restartB = btn("Restart same machines", function () { reset(false); });
    epsVal.textContent = ": " + st.eps.toFixed(2);

    host.appendChild(h("div", { class: "wg-w10-box" },
      h("div", { class: "wg-w10-row" },
        field("Epsilon (share of random exploring pulls)", epsSl, epsVal),
        field("Auto-play speed", speedSel)),
      h("div", { class: "wg-w10-row wg-w10-btns" }, autoB, stepB, restartB, resetB),
      revealLab,
      armBox,
      last,
      h("div", { class: "wg-w10-grid" },
        h("figure", { class: "wg-w10-fig" }, chart, h("figcaption", { class: "wg-w10-note" }, "Cumulative reward, up to " + MAX_PULLS + " pulls")),
        h("div", { class: "wg-w10-stats wg-w10-stats2" }, sPulls.el, sTotal.el, sBest.el, sRegret.el)),
      mean.el,
      h("p", { class: "wg-w10-note" }, "Bars show the player's current estimate of each machine's payout rate. With the rates revealed, the tick marks the true rate and the best machine is outlined.")));
    reset(true);
  }

  Object.assign(WIDGETS, {
    neuralnets: {
      title: "Tiny neural network trainer",
      intro: "Pick a dataset, set the hidden units and learning rate, and press Train. Watch the shaded regions bend to fit the points while the loss curve falls; try 1 hidden unit on XOR, or a learning rate of 0.01.",
      render: renderNN
    },
    rlhf: {
      title: "Multi-armed bandit: explore or exploit",
      intro: "Four machines pay out with hidden rates. Pull them yourself or press Auto-play to let an epsilon-greedy player choose; compare epsilon 0, 0.1 and 0.5 and watch how close the total reward gets to always pulling the best machine.",
      render: renderBandit
    }
  });
})();
WIDGET_CSS += `
.wg-w10-box { display:flex; flex-direction:column; gap:12px; font-family:var(--body); color:var(--ink); min-width:0; }
.wg-w10-row { display:flex; flex-wrap:wrap; gap:10px 14px; align-items:flex-end; }
.wg-w10-row > .wg-w10-field { flex:1 1 170px; }
.wg-w10-btns { gap:8px; }
.wg-w10-field { display:flex; flex-direction:column; gap:4px; min-width:0; }
.wg-w10-field label { font-size:13px; color:var(--muted); }
.wg-w10-val { color:var(--ink); font-family:var(--mono); font-weight:600; }
.wg-w10-in { font:inherit; font-size:14px; padding:6px 8px; border:1px solid var(--line-strong); border-radius:6px; background:var(--bg); color:var(--ink); width:100%; box-sizing:border-box; min-width:0; }
.wg-w10-range { width:100%; accent-color:var(--accent); margin:4px 0; }
.wg-w10-in:focus-visible, .wg-w10-btn:focus-visible, .wg-w10-range:focus-visible { outline:2px solid var(--accent); outline-offset:1px; }
.wg-w10-btn { font:inherit; font-size:14px; padding:6px 12px; border:1px solid var(--line-strong); border-radius:6px; background:var(--surface); color:var(--ink); cursor:pointer; }
.wg-w10-btn:hover { border-color:var(--accent); }
.wg-w10-primary { background:var(--accent); color:var(--accent-ink); border-color:var(--accent); min-width:6.5em; }
.wg-w10-grid { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:14px; align-items:start; }
@media (max-width:640px) { .wg-w10-grid { grid-template-columns:minmax(0,1fr); } }
.wg-w10-fig { margin:0; display:flex; flex-direction:column; gap:6px; min-width:0; }
.wg-w10-svg { display:block; width:100%; height:auto; background:var(--surface); border:1px solid var(--line); border-radius:6px; }
.wg-w10-axis { font-family:var(--mono); font-size:9px; fill:var(--muted); }
.wg-w10-axisacc { fill:var(--accent); }
.wg-w10-note { color:var(--muted); font-size:13px; margin:0; line-height:1.5; }
.wg-w10-key { display:inline-block; width:10px; height:10px; vertical-align:middle; border:1px solid var(--ink); }
.wg-w10-key1 { background:var(--accent); border-radius:50%; }
.wg-w10-key0 { background:var(--surface); }
.wg-w10-stats { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; }
.wg-w10-stats2 { grid-template-columns:repeat(2,minmax(0,1fr)); align-self:start; }
.wg-w10-stat { display:flex; flex-direction:column; gap:2px; padding:8px 10px; border:1px solid var(--line); border-radius:6px; background:var(--surface); min-width:0; }
.wg-w10-statl { font-size:12px; color:var(--muted); }
.wg-w10-statv { font-family:var(--mono); font-size:18px; font-weight:600; color:var(--ink); }
.wg-w10-mean { background:var(--accent-soft); border-left:3px solid var(--accent); padding:8px 12px; border-radius:4px; margin:0; font-size:14px; line-height:1.5; color:var(--ink); }
.wg-w10-cb { display:flex; gap:8px; align-items:center; font-size:14px; }
.wg-w10-cb input { accent-color:var(--accent); }
.wg-w10-arms { display:flex; flex-direction:column; gap:8px; }
.wg-w10-arm { display:flex; gap:10px; align-items:center; padding:6px 8px; border:1px solid var(--line); border-radius:6px; background:var(--surface); min-width:0; }
.wg-w10-armlast { border-color:var(--line-strong); background:var(--hl); }
.wg-w10-armbest { outline:2px solid var(--accent); outline-offset:-1px; }
.wg-w10-armbtn { flex:none; min-width:5.2em; }
.wg-w10-armmain { flex:1 1 auto; display:flex; flex-direction:column; gap:4px; min-width:0; }
.wg-w10-bar { position:relative; height:10px; background:var(--code-bg); border:1px solid var(--line); border-radius:3px; }
.wg-w10-barfill { height:100%; background:var(--accent); border-radius:2px; opacity:calc(0.35 + 0.65 * var(--wg-w10-share, 0)); }
.wg-w10-truemark { position:absolute; top:-4px; width:3px; height:16px; margin-left:-1px; background:var(--ink); border-radius:1px; }
.wg-w10-arminfo { font-size:12.5px; color:var(--muted); font-family:var(--mono); overflow-wrap:anywhere; }
`;
