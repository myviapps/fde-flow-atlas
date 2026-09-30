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
  function uid() { return "wgw12-" + Math.random().toString(36).slice(2, 10); }
  function fmt(x, d) {
    if (!isFinite(x)) return "infinite";
    return Number(x).toLocaleString("en-US", { maximumFractionDigits: d == null ? 0 : d, minimumFractionDigits: 0 });
  }
  function money(x, d) {
    return "$" + Number(x).toLocaleString("en-US", { minimumFractionDigits: d == null ? 2 : d, maximumFractionDigits: d == null ? 2 : d });
  }
  function fmtDur(sec) {
    if (!isFinite(sec)) return "forever";
    if (sec < 1) return fmt(sec * 1000, 0) + " ms";
    if (sec < 90) return fmt(sec, 1) + " s";
    if (sec < 5400) return fmt(sec / 60, 1) + " min";
    if (sec < 172800) return fmt(sec / 3600, 1) + " hours";
    return fmt(sec / 86400, 1) + " days";
  }
  function slider(label, min, max, step, value, show, onchange) {
    var id = uid();
    var val = h("output", { class: "wg-w12-val", for: id });
    var inp = h("input", { type: "range", id: id, min: min, max: max, step: step, value: value });
    function upd() { val.textContent = show(Number(inp.value)); }
    inp.addEventListener("input", function () { upd(); onchange(); });
    upd();
    var el = h("div", { class: "wg-w12-field" },
      h("label", { class: "wg-w12-lab", for: id }, h("span", null, label), val), inp);
    return { el: el, input: inp, get: function () { return Number(inp.value); }, set: function (v) { inp.value = v; upd(); } };
  }
  function numInput(label, value, step, min, onchange) {
    var id = uid();
    var inp = h("input", { type: "number", id: id, value: value, step: step, min: min, class: "wg-w12-num" });
    inp.addEventListener("input", onchange);
    var el = h("div", { class: "wg-w12-field" }, h("label", { class: "wg-w12-lab", for: id }, h("span", null, label)), inp);
    return { el: el, input: inp, get: function () { var v = parseFloat(inp.value); return isFinite(v) ? v : 0; } };
  }
  function selectInput(label, options, value, onchange) {
    var id = uid();
    var sel = h("select", { id: id, class: "wg-w12-sel" });
    options.forEach(function (o) {
      var op = h("option", { value: o[0], text: o[1] });
      if (o[0] === value) op.selected = true;
      sel.appendChild(op);
    });
    sel.addEventListener("change", onchange);
    var el = h("div", { class: "wg-w12-field" }, h("label", { class: "wg-w12-lab", for: id }, h("span", null, label)), sel);
    return { el: el, input: sel, get: function () { return sel.value; } };
  }
  function checkbox(label, checked, onchange) {
    var id = uid();
    var inp = h("input", { type: "checkbox", id: id });
    inp.checked = !!checked;
    inp.addEventListener("change", onchange);
    var el = h("div", { class: "wg-w12-check" }, inp, h("label", { for: id, text: label }));
    return { el: el, input: inp, get: function () { return inp.checked; } };
  }
  function stat(label) {
    var v = h("div", { class: "wg-w12-statv" });
    var sub = h("div", { class: "wg-w12-stats" });
    var el = h("div", { class: "wg-w12-stat" }, h("div", { class: "wg-w12-statl", text: label }), v, sub);
    return { el: el, set: function (a, b, warn) { v.textContent = a; sub.textContent = b || ""; el.classList.toggle("wg-w12-warn", !!warn); } };
  }
  function meaning() {
    var t = h("span");
    var el = h("div", { class: "wg-w12-mean", role: "status" }, h("strong", { text: "What this means: " }), t);
    return { el: el, set: function (x) { t.textContent = x; } };
  }
  function btn(label, onclick, cls) {
    return h("button", { type: "button", class: "wg-w12-btn" + (cls ? " " + cls : ""), onclick: onclick, text: label });
  }

  /* =====================================================================
     SPARK: partition skew calculator
     ===================================================================== */
  function fnv(str) {
    var x = 2166136261;
    for (var i = 0; i < str.length; i++) { x ^= str.charCodeAt(i); x = Math.imul(x, 16777619) >>> 0; }
    return x >>> 0;
  }
  function renderSpark(host) {
    var wrap = h("div", { class: "wg-w12-wrap" });
    host.appendChild(wrap);
    var rows = slider("Total rows", 10, 2000, 10, 200, function (v) { return fmt(v) + " million"; }, update);
    var keys = slider("Distinct join keys (e.g. cities)", 2, 5000, 1, 1000, function (v) { return fmt(v) + " keys"; }, update);
    var hot = slider("Share of rows on the one hot key", 0, 90, 1, 35, function (v) { return v + "%"; }, update);
    var parts = slider("Partitions after the shuffle", 2, 64, 1, 16, function (v) { return v + " partitions"; }, update);
    var cost = slider("Time to process one row", 0.5, 50, 0.5, 10, function (v) { return fmt(v, 1) + " µs"; }, update);
    var salt = slider("Salt buckets for the hot key (1 = no salting)", 1, 64, 1, 1, function (v) { return v === 1 ? "off" : v + " buckets"; }, update);
    wrap.appendChild(h("div", { class: "wg-w12-grid" }, rows.el, keys.el, hot.el, parts.el, cost.el, salt.el));

    var svg = s("svg", { viewBox: "0 0 600 240", class: "wg-w12-svg", role: "img", "aria-label": "Rows per partition bar chart" });
    wrap.appendChild(h("div", { class: "wg-w12-panel" },
      h("div", { class: "wg-w12-cap", text: "Rows per partition (one task each). Dashed line = perfectly balanced." }), svg,
      h("div", { class: "wg-w12-legend" },
        h("span", null, h("i", { class: "wg-skw-sw wg-skw-norm" }), "ordinary keys"),
        h("span", null, h("i", { class: "wg-skw-sw wg-skw-hot" }), "hot key rows"))));

    var sStrag = stat("Stage time (slowest task)");
    var sBal = stat("If perfectly balanced");
    var sSlow = stat("Slowdown from skew");
    var sIdle = stat("Core time spent idle");
    wrap.appendChild(h("div", { class: "wg-w12-stats4" }, sStrag.el, sBal.el, sSlow.el, sIdle.el));
    var mean = meaning();
    wrap.appendChild(mean.el);
    wrap.appendChild(h("p", { class: "wg-w12-note", text: "Assumes one executor core per partition, so every task runs at the same time and the stage ends when the slowest task ends. Salted buckets are placed on neighbouring partitions here; with real hashing a few buckets can land together." }));

    function loads(N, K, share, P, S) {
      var norm = new Array(P).fill(0), hotL = new Array(P).fill(0);
      var perKey = K > 1 ? N * (1 - share) / (K - 1) : 0;
      for (var i = 1; i < K; i++) norm[fnv("key" + i) % P] += perKey;
      var hp = fnv("key0") % P, H = N * share;
      for (var j = 0; j < S; j++) hotL[(hp + j) % P] += H / S;
      return { norm: norm, hot: hotL, hp: hp };
    }
    function update() {
      var N = rows.get() * 1e6, K = keys.get(), share = hot.get() / 100, P = parts.get(), t = cost.get() * 1e-6, S = salt.get();
      var L = loads(N, K, share, P, S);
      var tot = L.norm.map(function (v, i) { return v + L.hot[i]; });
      var mx = Math.max.apply(null, tot);
      var bal = N / P;
      var strag = mx * t, balT = bal * t;
      var L1 = loads(N, K, share, P, 1);
      var mx1 = Math.max.apply(null, L1.norm.map(function (v, i) { return v + L1.hot[i]; }));

      clear(svg);
      var x0 = 44, y0 = 206, W = 546, Hh = 190;
      var top = Math.max(mx, bal) * 1.08;
      [0, 0.5, 1].forEach(function (f) {
        var y = y0 - Hh * f;
        svg.appendChild(s("line", { x1: x0, x2: x0 + W, y1: y, y2: y, stroke: "var(--line)", "stroke-width": 1 }));
        svg.appendChild(s("text", { x: x0 - 4, y: y + 4, "text-anchor": "end", class: "wg-w12-svgt", text: fmt(top * f / 1e6, top * f / 1e6 < 10 ? 1 : 0) + "M" }));
      });
      var bw = W / P;
      for (var i = 0; i < P; i++) {
        var hn = Hh * L.norm[i] / top, hh = Hh * L.hot[i] / top;
        var x = x0 + i * bw + bw * 0.12, w = Math.max(1, bw * 0.76);
        svg.appendChild(s("rect", { x: x, y: y0 - hn, width: w, height: hn, fill: "var(--packet)", opacity: 0.8 },
          s("title", { text: "Partition " + i + ": " + fmt(tot[i] / 1e6, 1) + "M rows" })));
        if (hh > 0) svg.appendChild(s("rect", { x: x, y: y0 - hn - hh, width: w, height: hh, fill: "var(--accent)" },
          s("title", { text: "Partition " + i + ": " + fmt(L.hot[i] / 1e6, 1) + "M hot-key rows" })));
        if (P <= 24 || i % Math.ceil(P / 16) === 0)
          svg.appendChild(s("text", { x: x0 + i * bw + bw / 2, y: y0 + 14, "text-anchor": "middle", class: "wg-w12-svgt", text: String(i) }));
      }
      var yb = y0 - Hh * bal / top;
      svg.appendChild(s("line", { x1: x0, x2: x0 + W, y1: yb, y2: yb, stroke: "var(--ink)", "stroke-dasharray": "5 4", "stroke-width": 1.5 }));
      svg.appendChild(s("text", { x: x0 + W, y: yb - 5, "text-anchor": "end", class: "wg-w12-svgt", text: "balanced " + fmt(bal / 1e6, 1) + "M" }));
      svg.appendChild(s("text", { x: x0 + W / 2, y: 236, "text-anchor": "middle", class: "wg-w12-svgt", text: "partition number" }));

      var slow = strag / balT;
      var idle = 1 - N / (P * mx);
      sStrag.set(fmtDur(strag), fmt(mx / 1e6, 1) + "M rows in the biggest task", slow > 2);
      sBal.set(fmtDur(balT), fmt(bal / 1e6, 1) + "M rows per task");
      sSlow.set(fmt(slow, 1) + "×", S > 1 ? "was " + fmt(mx1 / bal, 1) + "× before salting" : "1.0× is perfect", slow > 2);
      sIdle.set(Math.round(idle * 100) + "%", "cores finished and waiting");

      var msg;
      if (share === 0) msg = "With no hot key the " + fmt(K) + " keys spread fairly evenly, so the stage takes about " + fmtDur(strag) + ", close to the balanced " + fmtDur(balT) + ".";
      else if (S === 1) msg = "One key holds " + Math.round(share * 100) + "% of the rows, so partition " + L.hp + " does " + fmt(mx / 1e6, 1) + "M rows while the balanced share is " + fmt(bal / 1e6, 1) + "M. The whole stage waits " + fmtDur(strag) + " instead of " + fmtDur(balT) + " (" + fmt(slow, 1) + "× slower). Adding partitions will not help much: the hot key always lands in one task. Try the salt slider.";
      else msg = "Salting splits the hot key into " + S + " sub-keys on " + Math.min(S, P) + " partitions, so the slowest task drops from " + fmtDur(mx1 * t) + " to " + fmtDur(strag) + ". The cost is a small second step that adds the " + S + " partial results back together." + (S > P ? " More buckets than partitions gives no extra benefit." : "");
      mean.set(msg);
    }
    update();
  }

  /* =====================================================================
     STREAMING: consumer group rebalancer
     ===================================================================== */
  function renderStreaming(host) {
    var wrap = h("div", { class: "wg-w12-wrap" });
    host.appendChild(wrap);
    var P = slider("Partitions in the topic", 1, 24, 1, 12, function (v) { return v + " partitions"; }, update);
    var C = slider("Consumers in the group", 1, 24, 1, 3, function (v) { return v + " consumers"; }, update);
    var R = slider("Incoming message rate", 500, 30000, 500, 6000, function (v) { return fmt(v) + " events/s"; }, update);
    var T = slider("Throughput of one consumer", 100, 5000, 100, 1500, function (v) { return fmt(v) + " events/s"; }, update);
    wrap.appendChild(h("div", { class: "wg-w12-grid" }, P.el, C.el, R.el, T.el));

    var board = h("div", { class: "wg-cgr-board" });
    wrap.appendChild(h("div", { class: "wg-w12-panel" },
      h("div", { class: "wg-w12-cap", text: "Assignment after rebalance (range assignor: each partition goes to exactly one consumer)" }), board));
    var sLoad = stat("Busiest consumer load");
    var sLag = stat("Lag growth");
    var sLag10 = stat("Lag after 10 minutes");
    var sIdle = stat("Idle consumers");
    wrap.appendChild(h("div", { class: "wg-w12-stats4" }, sLoad.el, sLag.el, sLag10.el, sIdle.el));
    var mean = meaning();
    wrap.appendChild(mean.el);
    wrap.appendChild(h("p", { class: "wg-w12-note", text: "Assumes events are spread evenly over partitions (no hot key) and lag starts at zero." }));

    function assign(p, c) {
      var out = [], base = Math.floor(p / c), extra = p % c, next = 0;
      for (var i = 0; i < c; i++) {
        var n = i < p ? base + (i < extra ? 1 : 0) : 0;
        var list = [];
        for (var j = 0; j < n; j++) list.push(next++);
        out.push(list);
      }
      return out;
    }
    function neededConsumers(p, rate, cap) {
      for (var k = 1; k <= p; k++) if (Math.ceil(p / k) * rate / p <= cap + 1e-9) return k;
      return null;
    }
    function update() {
      var p = P.get(), c = C.get(), rate = R.get(), cap = T.get();
      var perPart = rate / p;
      var a = assign(p, c);
      clear(board);
      var growth = 0, idle = 0, maxLoad = 0;
      a.forEach(function (list, i) {
        var inc = list.length * perPart;
        var over = Math.max(0, inc - cap);
        growth += over;
        if (!list.length) idle++;
        maxLoad = Math.max(maxLoad, inc);
        var chips = h("div", { class: "wg-cgr-chips" });
        if (!list.length) chips.appendChild(h("span", { class: "wg-cgr-none", text: "no partitions: idle" }));
        list.forEach(function (pp) { chips.appendChild(h("span", { class: "wg-cgr-chip", text: "P" + pp })); });
        var pctUse = Math.min(1, inc / cap);
        var fill = h("div", { class: "wg-cgr-fill" + (over > 0 ? " wg-cgr-over" : "") });
        fill.style.width = (pctUse * 100).toFixed(1) + "%";
        var status = !list.length ? "idle" : over > 0 ? "falling behind +" + fmt(over) + "/s" : "keeping up";
        board.appendChild(h("div", { class: "wg-cgr-card" + (!list.length ? " wg-cgr-idle" : over > 0 ? " wg-cgr-bad" : "") },
          h("div", { class: "wg-cgr-head" }, h("strong", { text: "Consumer " + (i + 1) }), h("span", { class: "wg-cgr-status", text: status })),
          chips,
          h("div", { class: "wg-cgr-bar", title: "incoming vs capacity" }, fill),
          h("div", { class: "wg-cgr-sub", text: fmt(inc) + " of " + fmt(cap) + " events/s capacity" })));
      });
      sLoad.set(fmt(maxLoad) + "/s", "capacity " + fmt(cap) + "/s each", maxLoad > cap);
      sLag.set(growth > 0 ? "+" + fmt(growth) + "/s" : "0/s", growth > 0 ? "+" + fmt(growth * 60) + " per minute" : "lag stays near zero", growth > 0);
      sLag10.set(fmt(growth * 600) + " events", growth > 0 ? "and still growing" : "caught up", growth > 0);
      sIdle.set(String(idle), idle ? "more consumers than partitions" : "every consumer has work", idle > 0);

      var need = neededConsumers(p, rate, cap);
      var msg;
      if (growth > 0) {
        msg = "Lag grows by " + fmt(growth) + " events every second, so data gets older and older. ";
        if (need && need > c) msg += "Scaling the group to " + need + " consumers would keep up.";
        else if (!need) msg += "Even " + p + " consumers (one per partition) cannot keep up, because each partition alone brings " + fmt(perPart) + "/s. Add partitions or make each consumer faster (batch writes, less work per event).";
        else msg += "Spread is uneven: some consumers got an extra partition. Try a consumer count that divides " + p + " evenly.";
      } else if (idle) {
        msg = idle + " consumer" + (idle > 1 ? "s sit" : " sits") + " idle: a partition can go to only one consumer in the group, so " + p + " partitions cap useful consumers at " + p + ". Idle ones are paid-for spares.";
      } else {
        msg = "Every consumer keeps up (busiest at " + Math.round(maxLoad / cap * 100) + "% of capacity). " + (need && need < c ? "You could run as few as " + need + " consumers." : "There is little headroom for a traffic spike.");
      }
      mean.set(msg);
    }
    update();
  }

  /* =====================================================================
     TOOLS: agent loop stepper
     ===================================================================== */
  function renderTools(host) {
    var wrap = h("div", { class: "wg-w12-wrap" });
    host.appendChild(wrap);
    wrap.appendChild(h("div", { class: "wg-agl-task" }, h("strong", { text: "User: " }), "\"Please refund order 1042, the lamp arrived broken.\""));
    var maxSteps = slider("Max steps (turn limit)", 2, 20, 1, 8, function (v) { return v + " steps"; }, rebuild);
    var budget = slider("Cost budget per task", 0.01, 0.3, 0.01, 0.1, function (v) { return money(v); }, rebuild);
    var flaky = selectInput("Eligibility service (check_refund)", [["ok", "Healthy"], ["twice", "Flaky: times out twice, then works"], ["down", "Down: always times out"]], "twice", rebuild);
    var codeRetry = checkbox("Retry inside the tool code (up to 2 retries with backoff)", false, rebuild);
    var pin = numInput("Input price, $ per million tokens (example prices, check current rates)", 3, 0.1, 0, rebuild);
    var pout = numInput("Output price, $ per million tokens", 15, 0.1, 0, rebuild);
    wrap.appendChild(h("div", { class: "wg-w12-grid" }, maxSteps.el, budget.el, flaky.el, pin.el, pout.el));
    wrap.appendChild(codeRetry.el);

    var nextB = btn("Next step", function () { if (shown < plan.steps.length) { shown++; draw(); } }, "wg-w12-primary");
    var allB = btn("Run to the end", function () { shown = plan.steps.length; draw(); });
    var resetB = btn("Reset", function () { shown = 0; draw(); });
    wrap.appendChild(h("div", { class: "wg-w12-row" }, nextB, allB, resetB));
    var trace = h("ol", { class: "wg-agl-trace", "aria-live": "polite" });
    wrap.appendChild(trace);
    var sSteps = stat("Steps used");
    var sCost = stat("Cost so far");
    var sTime = stat("Wall time so far");
    var sEnd = stat("Outcome");
    wrap.appendChild(h("div", { class: "wg-w12-stats4" }, sSteps.el, sCost.el, sTime.el, sEnd.el));
    var mean = meaning();
    wrap.appendChild(mean.el);
    wrap.appendChild(h("p", { class: "wg-w12-note", text: "Token counts are illustrative: each step resends the whole conversation so far, so input tokens grow every turn." }));

    var plan, shown = 0;
    function stepCost(i) {
      var tin = 1500 + 350 * i, tout = 120;
      return { tin: tin, tout: tout, usd: tin * pin.get() / 1e6 + tout * pout.get() / 1e6 };
    }
    function build() {
      var mode = flaky.get(), inCode = codeRetry.get();
      var failsLeft = mode === "ok" ? 0 : mode === "twice" ? 2 : Infinity;
      var phase = "order", steps = [], spent = 0, time = 0, stop = null, modelRetries = 0;
      while (true) {
        if (steps.length >= maxSteps.get()) { stop = { kind: "max", text: "Stopped: hit the " + maxSteps.get() + "-step limit" }; break; }
        if (spent >= budget.get()) { stop = { kind: "budget", text: "Stopped: budget of " + money(budget.get()) + " used up" }; break; }
        var c = stepCost(steps.length);
        var st = { cost: c, think: "", call: null, result: "", attempts: [], bad: false, final: false };
        if (phase === "order") {
          st.think = "I need the order details before I can refund anything.";
          st.call = "get_order(order_id=1042)";
          st.result = "{status: \"delivered\", item: \"Arc floor lamp\", total: 89.00}";
          st.secs = 1.2 + 0.4; phase = "elig";
        } else if (phase === "elig") {
          st.think = modelRetries ? "The check timed out. I will try the same call again." : "Delivered and 89.00. Check it is inside the refund policy.";
          st.call = "check_refund(order_id=1042)";
          var tries = inCode ? 3 : 1, ok = false, secs = 1.2;
          for (var a = 0; a < tries; a++) {
            if (failsLeft > 0) { failsLeft--; st.attempts.push("attempt " + (a + 1) + ": timeout after 5 s"); secs += 5 + (a > 0 ? a * 1 : 0); }
            else { st.attempts.push("attempt " + (a + 1) + ": ok"); secs += 0.4; ok = true; break; }
          }
          st.secs = secs;
          if (ok) { st.result = "{eligible: true, reason: \"damaged on arrival\", max_refund: 89.00}"; phase = "refund"; }
          else if (inCode) { st.result = "{error: \"service_unavailable\", retryable: false, hint: \"escalate to a human\"}"; st.bad = true; phase = "escalate"; }
          else { st.result = "{error: \"timeout\"}"; st.bad = true; modelRetries++; }
          if (!inCode || tries === 1) st.attempts = st.attempts.length > 1 ? st.attempts : [];
        } else if (phase === "refund") {
          st.think = "Eligible. Issue the refund once, with an idempotency key so a retry cannot pay twice.";
          st.call = "issue_refund(order_id=1042, amount=89.00, idempotency_key=\"rf-1042\")";
          st.result = "{refund_id: \"R-5531\", status: \"issued\"}";
          st.secs = 1.2 + 0.6; phase = "answer";
        } else if (phase === "answer") {
          st.think = "Done. Tell the customer.";
          st.result = "Answer: \"Refund R-5531 for 89.00 is on its way; it takes 3 to 5 business days.\"";
          st.final = true; st.secs = 1.5;
        } else if (phase === "escalate") {
          st.think = "The eligibility service is down and the tool says not to retry. Hand off instead of guessing.";
          st.result = "Answer: \"I could not verify the refund right now. I have passed order 1042 to a support agent.\"";
          st.final = true; st.secs = 1.5;
        }
        spent += c.usd; time += st.secs;
        st.spent = spent; st.time = time;
        steps.push(st);
        if (st.final) { stop = { kind: phase === "answer" ? "done" : "handoff", text: phase === "answer" ? "Task finished" : "Handed off to a human" }; break; }
      }
      return { steps: steps, stop: stop, modelRetries: modelRetries };
    }
    function rebuild() { plan = build(); shown = 0; draw(); }
    function draw() {
      clear(trace);
      for (var i = 0; i < shown; i++) {
        var st = plan.steps[i];
        var li = h("li", { class: "wg-agl-step" + (st.bad ? " wg-agl-bad" : "") + (st.final ? " wg-agl-final" : "") },
          h("div", { class: "wg-agl-meta" }, h("strong", { text: "Step " + (i + 1) }),
            h("span", { text: fmt(st.cost.tin) + " in + " + st.cost.tout + " out tokens · " + money(st.cost.usd, 4) + " · total " + money(st.spent, 3) })),
          h("div", { class: "wg-agl-think" }, h("span", { class: "wg-agl-tag", text: "think" }), st.think),
          st.call ? h("div", { class: "wg-agl-line" }, h("span", { class: "wg-agl-tag", text: "tool call" }), h("code", { text: st.call })) : null,
          st.attempts.length ? h("div", { class: "wg-agl-att", text: "Tool code retried: " + st.attempts.join(" → ") }) : null,
          h("div", { class: "wg-agl-line" }, h("span", { class: "wg-agl-tag", text: st.final ? "reply" : "result" }), h("code", { text: st.result })));
        trace.appendChild(li);
      }
      var done = shown === plan.steps.length;
      if (done) trace.appendChild(h("li", { class: "wg-agl-stop" + (plan.stop.kind === "max" || plan.stop.kind === "budget" ? " wg-agl-bad" : ""), text: plan.stop.text }));
      if (!shown) trace.appendChild(h("li", { class: "wg-agl-empty", text: "Press Next step to run the loop one turn at a time." }));
      nextB.disabled = done; allB.disabled = done;
      var last = shown ? plan.steps[shown - 1] : null;
      sSteps.set(shown + " / " + maxSteps.get(), done ? "of " + plan.steps.length + " planned" : "limit " + maxSteps.get(), done && plan.stop.kind === "max");
      sCost.set(money(last ? last.spent : 0, 3), "budget " + money(budget.get()), done && plan.stop.kind === "budget");
      sTime.set(fmtDur(last ? last.time : 0), "model + tool latency");
      sEnd.set(done ? plan.stop.text.replace(/^Stopped: /, "") : "running…", "", done && (plan.stop.kind === "max" || plan.stop.kind === "budget"));

      var total = plan.steps.length ? plan.steps[plan.steps.length - 1].spent : 0;
      var msg;
      if (!done) {
        if (!last) msg = "Nothing has run yet. Each Next step is one model turn: it thinks, maybe calls a tool, and reads the result.";
        else if (last.bad) msg = "The tool failed. The model sees the error as the result and must choose what to do; if it just tries again, every retry is a full paid turn that resends the history.";
        else msg = "So far " + shown + " step" + (shown > 1 ? "s" : "") + " and " + money(last.spent, 3) + ". Input tokens grew from 1,500 to " + fmt(last.cost.tin) + " because the history is resent each turn.";
      } else if (plan.stop.kind === "done" && plan.modelRetries) msg = "The model retried the timed-out tool " + plan.modelRetries + " time" + (plan.modelRetries > 1 ? "s" : "") + " itself, so the task took " + plan.steps.length + " steps and " + money(total, 3) + ". Tick the tool-code retry box: retries then cost seconds, not model turns.";
      else if (plan.stop.kind === "done") msg = "The loop finished in " + plan.steps.length + " steps for " + money(total, 3) + ". Every step resends the history, so later steps cost more than earlier ones.";
      else if (plan.stop.kind === "handoff") msg = "Retries lived in the tool code, and when they failed the tool said \"do not retry, escalate\". The agent stopped cleanly after " + plan.steps.length + " steps for " + money(total, 3) + ".";
      else msg = "The loop ran away: the model kept calling a dead tool (" + plan.modelRetries + " retries) until the " + (plan.stop.kind === "max" ? "step limit" : "budget") + " stopped it at " + money(total, 3) + ". Without that cap it would keep spending. Fix the tool so it returns a clear non-retryable error.";
      mean.set(msg);
    }
    rebuild();
  }

  /* =====================================================================
     SECURITY: JWT decoder + RBAC checker
     ===================================================================== */
  function b64urlEncode(str) {
    var bytes = new TextEncoder().encode(str), bin = "";
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function b64urlDecode(part) {
    var t = part.replace(/-/g, "+").replace(/_/g, "/");
    while (t.length % 4) t += "=";
    var bin = atob(t), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  }
  function relTime(sec) {
    var a = Math.abs(sec), u;
    if (a < 90) u = Math.round(a) + " seconds";
    else if (a < 5400) u = Math.round(a / 60) + " minutes";
    else if (a < 172800) u = fmt(a / 3600, 1) + " hours";
    else u = fmt(a / 86400, 0) + " days";
    return u;
  }
  function makeSample(expiresIn) {
    var now = Math.floor(Date.now() / 1000);
    var head = { alg: "HS256", typ: "JWT" };
    var body = { iss: "https://login.northwind-example.com", sub: "user-812", aud: "claims-api", name: "Priya Shah", roles: ["analyst"], iat: now + expiresIn - 900, exp: now + expiresIn };
    return b64urlEncode(JSON.stringify(head)) + "." + b64urlEncode(JSON.stringify(body)) + ".dGhpcy1zaWduYXR1cmUtaXMtbm90LWNoZWNrZWQtaGVyZQ";
  }
  var CLAIMS = {
    iss: "Issuer: who created the token (your IdP).",
    sub: "Subject: the user or service id this token is about.",
    aud: "Audience: which app the token is meant for. Reject tokens meant for someone else.",
    exp: "Expiry time. After it, the token must be rejected.",
    iat: "Issued-at time.",
    nbf: "Not before: invalid until this time.",
    name: "Display name (just data, not proof).",
    email: "Email address (just data, not proof).",
    roles: "Roles the IdP says this user has. Your server maps them to permissions.",
    scope: "Scopes: what this token may be used for.",
    jti: "Token id, useful for revocation lists."
  };
  var RBAC_ROLES = ["viewer", "analyst", "adjuster", "admin"];
  var RBAC_RES = ["claim", "payout", "report"];
  var RBAC_ACT = ["read", "approve", "delete"];
  var RBAC_DEFAULT = {
    viewer: ["report:read"],
    analyst: ["claim:read", "report:read"],
    adjuster: ["claim:read", "claim:approve", "payout:read", "report:read"],
    admin: ["claim:read", "claim:approve", "claim:delete", "payout:read", "payout:approve", "report:read", "report:delete"]
  };
  var RBAC_USERS = [
    ["priya", "Priya (analyst)", ["analyst"]],
    ["marco", "Marco (adjuster)", ["adjuster"]],
    ["sam", "Sam (viewer)", ["viewer"]],
    ["jo", "Jo (analyst + adjuster)", ["analyst", "adjuster"]],
    ["lee", "Lee (admin)", ["admin"]],
    ["anon", "Nobody (not logged in / expired token)", null]
  ];
  function renderSecurity(host) {
    var wrap = h("div", { class: "wg-w12-wrap" });
    host.appendChild(wrap);
    var tabJ = h("button", { type: "button", role: "tab", class: "wg-sec-tab", "aria-selected": "true", text: "JWT decoder" });
    var tabR = h("button", { type: "button", role: "tab", class: "wg-sec-tab", "aria-selected": "false", text: "RBAC checker" });
    var paneJ = h("div", { role: "tabpanel" }), paneR = h("div", { role: "tabpanel", hidden: true });
    function pick(j) {
      tabJ.setAttribute("aria-selected", j ? "true" : "false"); tabR.setAttribute("aria-selected", j ? "false" : "true");
      paneJ.hidden = !j; paneR.hidden = j;
    }
    tabJ.addEventListener("click", function () { pick(true); });
    tabR.addEventListener("click", function () { pick(false); });
    wrap.appendChild(h("div", { class: "wg-sec-tabs", role: "tablist" }, tabJ, tabR));
    wrap.appendChild(paneJ); wrap.appendChild(paneR);

    /* ---- JWT ---- */
    var tid = uid();
    var ta = h("textarea", { id: tid, class: "wg-sec-ta", rows: 4, spellcheck: "false", autocomplete: "off" });
    ta.value = makeSample(600);
    ta.addEventListener("input", decode);
    paneJ.appendChild(h("div", { class: "wg-w12-field" }, h("label", { class: "wg-w12-lab", for: tid }, h("span", null, "Paste a JWT (header.payload.signature)")), ta));
    paneJ.appendChild(h("div", { class: "wg-w12-row" },
      btn("Load sample (valid 10 min)", function () { ta.value = makeSample(600); decode(); }),
      btn("Load sample (expired)", function () { ta.value = makeSample(-3 * 3600); decode(); }),
      btn("Load sample with alg none", function () {
        var p = ta.value.split(".");
        ta.value = b64urlEncode(JSON.stringify({ alg: "none", typ: "JWT" })) + "." + (p[1] || "") + ".";
        decode();
      })));
    var warnBox = h("div", { class: "wg-sec-warn", role: "note" });
    var out = h("div", { class: "wg-sec-out" });
    paneJ.appendChild(out);
    paneJ.appendChild(warnBox);
    var jmean = meaning();
    paneJ.appendChild(jmean.el);

    function decode() {
      clear(out); clear(warnBox);
      var raw = ta.value.trim().replace(/^Bearer\s+/i, "");
      var parts = raw.split(".");
      var warns = ["Decoding is not verifying. Anyone can read or edit these parts; only a signature check with the right key (plus exp, iss and aud checks) on your server proves the token is genuine. This page does not check the signature."];
      if (parts.length !== 3) {
        out.appendChild(h("p", { class: "wg-sec-err", text: "Not a JWT: expected 3 parts separated by dots, found " + parts.length + "." }));
        jmean.set("A JWT is three base64url pieces joined by dots. Load a sample to see one.");
        warns.forEach(function (w) { warnBox.appendChild(h("p", { text: w })); });
        return;
      }
      var head, body;
      try { head = JSON.parse(b64urlDecode(parts[0])); body = JSON.parse(b64urlDecode(parts[1])); }
      catch (e) {
        out.appendChild(h("p", { class: "wg-sec-err", text: "Could not decode: a part is not valid base64url JSON." }));
        jmean.set("The text looks like a token but one part is damaged or not JSON.");
        warns.forEach(function (w) { warnBox.appendChild(h("p", { text: w })); });
        return;
      }
      out.appendChild(h("div", { class: "wg-sec-parts" },
        h("div", null, h("div", { class: "wg-w12-cap", text: "Header" }), h("pre", { class: "wg-sec-pre", text: JSON.stringify(head, null, 2) })),
        h("div", null, h("div", { class: "wg-w12-cap", text: "Payload (claims)" }), h("pre", { class: "wg-sec-pre", text: JSON.stringify(body, null, 2) }))));
      var tbl = h("table", { class: "wg-w12-table" }, h("thead", null, h("tr", null, h("th", { text: "Claim" }), h("th", { text: "Value" }), h("th", { text: "In plain words" }))));
      var tb = h("tbody");
      var now = Date.now() / 1000;
      Object.keys(body).forEach(function (k) {
        var v = body[k], plain = CLAIMS[k] || "Custom claim set by the issuer.";
        var shown = typeof v === "object" ? JSON.stringify(v) : String(v);
        if ((k === "exp" || k === "iat" || k === "nbf") && typeof v === "number") {
          var d = new Date(v * 1000);
          shown = String(v) + " = " + d.toISOString().replace("T", " ").slice(0, 16) + " UTC";
          if (k === "exp") plain = v < now ? "Expired " + relTime(now - v) + " ago. A server must reject it." : "Expires in " + relTime(v - now) + ".";
          if (k === "iat") plain = "Issued " + relTime(now - v) + (v > now ? " in the future (clock skew?)" : " ago") + ".";
          if (k === "nbf") plain = v > now ? "Not valid for another " + relTime(v - now) + "." : "Already active.";
        }
        tb.appendChild(h("tr", null, h("td", null, h("code", { text: k })), h("td", { class: "wg-sec-val", text: shown }), h("td", { text: plain })));
      });
      tbl.appendChild(tb);
      out.appendChild(h("div", { class: "wg-w12-scroll" }, tbl));

      if (String(head.alg).toLowerCase() === "none") warns.push("alg is \"none\": the token has no signature at all. A server must never accept this.");
      var txt = JSON.stringify(body).toLowerCase();
      if (/password|secret|ssn|card_number|api_key/.test(txt)) warns.push("The payload seems to contain a secret. JWT payloads are readable by anyone; never put secrets in them.");
      if (typeof body.exp !== "number") warns.push("No exp claim: this token never expires unless the server adds its own rule.");
      warns.forEach(function (w, i) { warnBox.appendChild(h("p", { class: i ? "wg-sec-strong" : "", text: w })); });

      var who = body.name || body.sub || "someone";
      var m = "This token claims to be " + who + (body.roles ? " with roles " + [].concat(body.roles).join(", ") : "") + ", issued by " + (body.iss || "an unknown issuer") + ". ";
      if (typeof body.exp === "number") m += body.exp < now ? "It expired " + relTime(now - body.exp) + " ago, so the API should answer 401." : "It is still inside its lifetime (" + relTime(body.exp - now) + " left), but that means nothing until the signature is verified.";
      jmean.set(m);
    }
    decode();

    /* ---- RBAC ---- */
    var perms = {};
    RBAC_ROLES.forEach(function (r) { perms[r] = {}; RBAC_DEFAULT[r].forEach(function (p) { perms[r][p] = true; }); });
    paneR.appendChild(h("p", { class: "wg-w12-note", text: "Tick boxes to change what each role may do. Users get permissions only through their roles; anything not granted is denied." }));
    var mt = h("table", { class: "wg-w12-table wg-sec-matrix" });
    var hr = h("tr", null, h("th", { text: "Permission" }));
    RBAC_ROLES.forEach(function (r) { hr.appendChild(h("th", { text: r })); });
    mt.appendChild(h("thead", null, hr));
    var mb = h("tbody");
    RBAC_RES.forEach(function (res) {
      RBAC_ACT.forEach(function (act) {
        var key = res + ":" + act;
        var tr = h("tr", null, h("td", null, h("code", { text: key })));
        RBAC_ROLES.forEach(function (r) {
          var cb = h("input", { type: "checkbox", "aria-label": r + " may " + act + " " + res });
          cb.checked = !!perms[r][key];
          cb.addEventListener("change", function () { perms[r][key] = cb.checked; check(); });
          tr.appendChild(h("td", { class: "wg-sec-cell" }, cb));
        });
        mb.appendChild(tr);
      });
    });
    mt.appendChild(mb);
    paneR.appendChild(h("div", { class: "wg-w12-scroll" }, mt));
    var uSel = selectInput("User", RBAC_USERS.map(function (u) { return [u[0], u[1]]; }), "priya", check);
    var aSel = selectInput("Action", RBAC_ACT.map(function (a) { return [a, a]; }), "approve", check);
    var rSel = selectInput("Resource", RBAC_RES.map(function (a) { return [a, a]; }), "claim", check);
    paneR.appendChild(h("div", { class: "wg-w12-grid" }, uSel.el, aSel.el, rSel.el));
    var verdict = h("div", { class: "wg-sec-verdict", role: "status" });
    paneR.appendChild(verdict);
    var rmean = meaning();
    paneR.appendChild(rmean.el);
    function check() {
      var u = RBAC_USERS.filter(function (x) { return x[0] === uSel.get(); })[0];
      var act = aSel.get(), res = rSel.get(), key = res + ":" + act;
      var name = u[1].split(" (")[0];
      clear(verdict);
      if (!u[2]) {
        verdict.className = "wg-sec-verdict wg-sec-deny";
        verdict.appendChild(h("div", { class: "wg-sec-big", text: "401 Unauthorized" }));
        verdict.appendChild(h("div", { text: "No valid identity, so roles are never even looked at." }));
        rmean.set("401 means \"log in first\". Authentication failed before authorization could run.");
        return;
      }
      var granting = u[2].filter(function (r) { return perms[r][key]; });
      var allow = granting.length > 0;
      verdict.className = "wg-sec-verdict " + (allow ? "wg-sec-allow" : "wg-sec-deny");
      verdict.appendChild(h("div", { class: "wg-sec-big", text: allow ? "Allow (200)" : "Deny (403 Forbidden)" }));
      verdict.appendChild(h("div", {
        text: allow
          ? name + " has role " + granting.join(" and ") + ", which grants " + key + "."
          : name + "'s role" + (u[2].length > 1 ? "s " : " ") + u[2].join(" + ") + " do" + (u[2].length > 1 ? "" : "es") + " not grant " + key + ". Default deny."
      }));
      var holders = RBAC_ROLES.filter(function (r) { return perms[r][key]; });
      rmean.set(allow
        ? "The server knows who " + name + " is and a role allows it. Changing the matrix changes access for everyone with that role at once."
        : "The server knows who " + name + " is (so not 401) but no role allows it. " + (holders.length ? "Only " + holders.join(", ") + " may " + act + " a " + res + "." : "No role may " + act + " a " + res + " right now."));
    }
    check();
  }

  /* =====================================================================
     DSA: pattern flashcards
     ===================================================================== */
  var PATTERNS = ["Two pointers", "Sliding window", "Hash map", "BFS / DFS", "Binary search", "Heap", "Dynamic programming", "Sorting"];
  var CARDS = [
    ["Given a sorted list of prices, find two that add up to exactly 100, using no extra memory.", "Two pointers", "Sorted input plus a pair: start one pointer at each end and move the one that makes the sum closer."],
    ["Check whether a customer name is a palindrome, ignoring spaces and punctuation.", "Two pointers", "Compare from both ends inward, skipping non-letters. O(n) time, O(1) memory."],
    ["Find the longest stretch of a string with no repeated characters.", "Sliding window", "A window over consecutive characters that grows on the right and shrinks on the left when a repeat appears."],
    ["Find the highest total sales over any 7 consecutive days in a year of daily totals.", "Sliding window", "Fixed-size window of consecutive days: add the new day, subtract the one leaving. O(n) instead of O(n × 7)."],
    ["In an unsorted list of 100,000 refunds, find two that together equal a disputed charge of 250.00.", "Hash map", "Walk once, and for each amount look up 250 minus it in a dict of amounts seen so far. O(n)."],
    ["Count how often each IP address appears in a log file and list the ones seen more than 100 times.", "Hash map", "Counting by key is a dict (or collections.Counter) job: one pass, O(1) per update."],
    ["Find the fewest introductions needed to connect two people in a friend network.", "BFS / DFS", "People and friendships form a graph. BFS explores level by level, so the first time it reaches the target is the shortest path."],
    ["Count the separate islands in a grid map of land and water cells.", "BFS / DFS", "Each unvisited land cell starts a flood fill (BFS or DFS) that marks its whole island. Count the fills."],
    ["10,000 builds in order; once a build fails, all later ones fail. Find the first failing build.", "Binary search", "The pass/fail answer flips once over an ordered list, so halve the range each check: about 14 checks, not 10,000."],
    ["Find the smallest truck capacity that ships all packages, in order, within 5 days.", "Binary search", "Binary search on the answer: if a capacity works, every bigger one works too, so search the capacity range."],
    ["Return the 10 slowest endpoints out of 5 million log lines.", "Heap", "Top-k: keep a min-heap of size 10 and push out the smallest. O(n log k), memory for 10 items only."],
    ["Merge 50 log files, each already sorted by time, into one sorted stream.", "Heap", "A heap holds the next line from each file and always pops the earliest. O(n log 50)."],
    ["Find the fewest coins that make 63 cents from coins of 1, 5, 10 and 25.", "Dynamic programming", "The best answer for 63 builds on best answers for smaller amounts. Fill a table from 0 up to 63."],
    ["Count the ways to climb 30 stairs taking 1 or 2 steps at a time.", "Dynamic programming", "ways(n) = ways(n-1) + ways(n-2). Overlapping subproblems: store each once instead of recomputing."],
    ["Merge overlapping meeting times like 9-10, 9:30-11 and 13-14 into free and busy blocks.", "Sorting", "Sort by start time, then one pass merges each meeting into the previous block if they overlap."],
    ["From a list of 50,000 prices, find the two closest in value.", "Sorting", "After sorting, the closest pair must be neighbours, so compare adjacent items. O(n log n)."]
  ];
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function renderDsa(host) {
    var wrap = h("div", { class: "wg-w12-wrap" });
    host.appendChild(wrap);
    var limit = selectInput("Time per card", [["0", "No limit (just time me)"], ["30", "30 seconds"], ["15", "15 seconds"]], "30", function () { start(); });
    var restartB = btn("Restart (new order)", function () { start(); });
    wrap.appendChild(h("div", { class: "wg-w12-grid" }, limit.el, h("div", { class: "wg-w12-field wg-pat-end" }, restartB)));
    var prog = h("div", { class: "wg-pat-prog" });
    var timerEl = h("div", { class: "wg-pat-timer", "aria-live": "off" });
    var bar = h("div", { class: "wg-pat-tbar" }, h("div", { class: "wg-pat-tfill" }));
    var card = h("div", { class: "wg-pat-card" });
    var choices = h("div", { class: "wg-pat-choices", role: "group", "aria-label": "Pick the pattern" });
    var feedback = h("div", { class: "wg-pat-fb", role: "status" });
    var nextB = btn("Next card", function () { idx++; show(); }, "wg-w12-primary");
    wrap.appendChild(h("div", { class: "wg-w12-row wg-pat-top" }, prog, timerEl));
    wrap.appendChild(bar);
    wrap.appendChild(card);
    wrap.appendChild(choices);
    wrap.appendChild(feedback);
    wrap.appendChild(h("div", { class: "wg-w12-row" }, nextB));
    var mean = meaning();
    wrap.appendChild(mean.el);

    var deck, idx, answered, score, t0, results, timer = null;
    function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
    function start() { deck = shuffle(CARDS); idx = 0; score = 0; results = []; show(); }
    function tick() {
      if (!host.isConnected) { stopTimer(); return; }
      if (answered) return;
      var el = (Date.now() - t0) / 1000, lim = Number(limit.get());
      timerEl.textContent = lim ? Math.max(0, Math.ceil(lim - el)) + " s left" : fmt(el, 0) + " s";
      bar.firstChild.style.width = lim ? Math.max(0, 100 - el / lim * 100) + "%" : "0%";
      if (lim && el >= lim) answer(null);
    }
    function show() {
      stopTimer();
      clear(choices); clear(feedback); clear(card);
      if (idx >= deck.length) return finish();
      answered = false;
      nextB.hidden = true;
      prog.textContent = "Card " + (idx + 1) + " of " + deck.length + " · score " + score;
      card.appendChild(h("div", { class: "wg-w12-cap", text: "Which pattern fits?" }));
      card.appendChild(h("p", { class: "wg-pat-q", text: deck[idx][0] }));
      PATTERNS.forEach(function (p) {
        choices.appendChild(h("button", { type: "button", class: "wg-pat-choice", "data-p": p, text: p, onclick: function () { answer(p); } }));
      });
      mean.set("Read the problem and look for the clue words: sorted, consecutive, count, shortest, top k, fewest ways.");
      t0 = Date.now();
      tick();
      timer = setInterval(tick, 250);
    }
    function answer(p) {
      if (answered) return;
      answered = true; stopTimer();
      var c = deck[idx], ok = p === c[1], secs = (Date.now() - t0) / 1000;
      if (ok) score++;
      results.push({ ok: ok, secs: secs, pat: c[1] });
      Array.prototype.forEach.call(choices.children, function (b) {
        b.disabled = true;
        if (b.getAttribute("data-p") === c[1]) b.classList.add("wg-pat-right");
        else if (b.getAttribute("data-p") === p) b.classList.add("wg-pat-wrong");
      });
      feedback.className = "wg-pat-fb " + (ok ? "wg-pat-ok" : "wg-pat-no");
      feedback.appendChild(h("strong", { text: ok ? "Correct: " + c[1] + ". " : (p ? "Not quite. It is " : "Time is up. It is ") + (ok ? "" : c[1] + ". ") }));
      feedback.appendChild(document.createTextNode(c[2]));
      prog.textContent = "Card " + (idx + 1) + " of " + deck.length + " · score " + score;
      timerEl.textContent = fmt(secs, 1) + " s";
      nextB.hidden = false;
      nextB.textContent = idx === deck.length - 1 ? "See my score" : "Next card";
      nextB.focus({ preventScroll: true });
      var done = results.length, right = results.filter(function (r) { return r.ok; }).length;
      mean.set("You have " + right + " of " + done + " right so far. Naming the pattern out loud first is what interviewers want to hear before you code.");
    }
    function finish() {
      stopTimer();
      nextB.hidden = true;
      bar.firstChild.style.width = "0%";
      timerEl.textContent = "";
      prog.textContent = "Finished";
      var avg = results.reduce(function (a, r) { return a + r.secs; }, 0) / results.length;
      var miss = {};
      results.forEach(function (r) { if (!r.ok) miss[r.pat] = (miss[r.pat] || 0) + 1; });
      card.appendChild(h("div", { class: "wg-pat-score", text: score + " / " + deck.length }));
      card.appendChild(h("p", { class: "wg-pat-q", text: "Average " + fmt(avg, 1) + " s per card." }));
      var mk = Object.keys(miss);
      if (mk.length) {
        var ul = h("ul", { class: "wg-pat-miss" });
        mk.forEach(function (k) { ul.appendChild(h("li", { text: k + ": missed " + miss[k] })); });
        card.appendChild(h("div", { class: "wg-w12-cap", text: "Patterns to review" }));
        card.appendChild(ul);
      }
      var pct = score / deck.length;
      mean.set(pct >= 0.85 ? "Strong: you spot patterns quickly. Next, practise writing the code for the ones that took longest."
        : pct >= 0.6 ? "Good base. Re-read the lesson sections for the patterns listed above, then restart for a new order."
        : "Patterns are still blurry. Learn the clue words (sorted means pointers or binary search, consecutive means window, top k means heap) and try again.");
    }
    start();
  }

  /* =====================================================================
     PANDAS: operation explorer
     ===================================================================== */
  var PD_COLS = ["order_id", "customer_id", "order_date", "region", "amount"];
  var PD_RAW = [
    [1001, "C1", "2026-03-02", "North", "120.50"],
    [1002, "C2", "03/04/2026", "south", null],
    [1003, "C1", "2026-03-05", " North ", "1,250.00"],
    [1004, "C9", "2026-03-05", "East", "80"],
    [1004, "C9", "2026-03-05", "East", "80"],
    [1005, "C3", "not recorded", "North", "45.00"]
  ];
  var PD_CUST = [["C1", "Ana Ruiz", "Retail"], ["C2", "Ben Okafor", "Trade"], ["C2", "Ben Okafor", "Retail"], ["C3", "Dara Singh", "Retail"]];
  var PD_ORD = [[1001, "C1", 120.5], [1002, "C2", 60], [1003, "C1", 1250], [1004, "C9", 80]];
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function pdDate(y, m, d) { return { y: y, m: m, d: d, date: true }; }
  function parseDate(str, f) {
    var m;
    if (f === "iso") { m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str); return m ? pdDate(+m[1], +m[2], +m[3]) : null; }
    m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(str);
    if (!m) return null;
    return f === "us" ? pdDate(+m[3], +m[1], +m[2]) : pdDate(+m[3], +m[2], +m[1]);
  }
  function fmt2(x) { return Number(x).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function dispVal(v, dtype) {
    if (v == null) return { t: dtype && dtype.indexOf("datetime") === 0 ? "NaT" : "NaN", na: true };
    if (v && v.date) return { t: v.y + "-" + pad(v.m) + "-" + pad(v.d) };
    if (typeof v === "number") {
      if (dtype === "float64") return { t: (Math.round(v * 100) / 100).toFixed(v % 1 ? (Math.round(v * 100) % 10 ? 2 : 1) : 1) };
      return { t: String(v) };
    }
    if (typeof v === "boolean") return { t: v ? "True" : "False" };
    return { t: String(v).replace(/^ +| +$/g, function (sp) { return sp.replace(/ /g, "·"); }) };
  }
  function renderPandas(host) {
    var wrap = h("div", { class: "wg-w12-wrap" });
    host.appendChild(wrap);
    var ops = [
      ["look", "Look first (read_csv, dtypes)"],
      ["dropna", "dropna: drop rows with a missing amount"],
      ["fillna", "fillna: fill the missing amount"],
      ["astype", "astype(float): make amount numeric"],
      ["dates", "to_datetime: parse order_date"],
      ["dups", "drop_duplicates"],
      ["groupby", "groupby region, sum amount"],
      ["merge", "merge with the customer lookup"]
    ];
    var op = selectInput("Operation", ops, "look", update);
    wrap.appendChild(op.el);
    var opts = h("div", { class: "wg-w12-grid wg-pdo-opts" });
    wrap.appendChild(opts);

    var fillVal = numInput("Fill value", 0, 1, null, update);
    var flag = checkbox("Add an amount_missing flag column first", true, update);
    var commas = checkbox("Remove thousands commas first (.str.replace(\",\", \"\"))", false, update);
    var dfmt = selectInput("Date format", [["iso", "%Y-%m-%d (ISO)"], ["us", "%m/%d/%Y (US)"], ["uk", "%d/%m/%Y (UK)"], ["both", "ISO, then US for the rest"]], "iso", update);
    var tidy = checkbox("Tidy region first (.str.strip().str.title())", false, update);
    var how = selectInput("how", [["left", "left"], ["inner", "inner"]], "left", update);
    var valid = checkbox("Add validate=\"many_to_one\"", false, update);
    var optMap = { fillna: [fillVal.el, flag.el], astype: [commas.el], dates: [dfmt.el], groupby: [tidy.el], merge: [how.el, valid.el] };

    var code = h("pre", { class: "wg-pdo-code" });
    wrap.appendChild(h("div", null, h("div", { class: "wg-w12-cap", text: "pandas code" }), code));
    var lookup = h("div");
    wrap.appendChild(lookup);
    var resCap = h("div", { class: "wg-w12-cap" });
    var resBox = h("div", { class: "wg-w12-scroll" });
    wrap.appendChild(h("div", null, resCap, resBox));
    wrap.appendChild(h("div", { class: "wg-w12-legend" },
      h("span", null, h("i", { class: "wg-pdo-sw wg-pdo-chg" }), "changed or new cell"),
      h("span", null, h("i", { class: "wg-pdo-sw wg-pdo-gone" }), "row removed"),
      h("span", null, "· = a space inside the text")));
    var mean = meaning();
    wrap.appendChild(mean.el);

    function table(cols, dtypes, rows) {
      var t = h("table", { class: "wg-w12-table wg-pdo-t" });
      var hr = h("tr", null, h("th", { class: "wg-pdo-idx", text: "" }));
      cols.forEach(function (c) { hr.appendChild(h("th", null, h("div", { text: c }), h("div", { class: "wg-pdo-dt", text: dtypes[c] }))); });
      t.appendChild(h("thead", null, hr));
      var tb = h("tbody");
      rows.forEach(function (r) {
        var tr = h("tr", { class: (r.gone ? "wg-pdo-rgone" : "") + (r.added ? " wg-pdo-radd" : "") }, h("td", { class: "wg-pdo-idx", text: String(r.idx) }));
        cols.forEach(function (c) {
          var d = dispVal(r.v[c], dtypes[c]);
          var cls = (d.na ? "wg-pdo-na" : "") + (r.chg && r.chg[c] ? " wg-pdo-chg" : "");
          tr.appendChild(h("td", { class: cls, text: d.t }));
        });
        tb.appendChild(tr);
      });
      t.appendChild(tb);
      return t;
    }
    function baseRows() {
      return PD_RAW.map(function (r, i) {
        var v = {}; PD_COLS.forEach(function (c, j) { v[c] = r[j]; });
        return { idx: i, v: v, chg: {} };
      });
    }
    var baseTypes = { order_id: "int64", customer_id: "str", order_date: "str", region: "str", amount: "str" };
    function copy(o) { var x = {}; for (var k in o) x[k] = o[k]; return x; }
    function num(sv) { return sv == null ? null : parseFloat(String(sv).replace(/,/g, "")); }
    function sumOf(rows, col) { return rows.reduce(function (a, r) { return a + (r.gone || r.v[col] == null ? 0 : r.v[col]); }, 0); }

    function update() {
      var o = op.get();
      clear(opts); (optMap[o] || []).forEach(function (e) { opts.appendChild(e); });
      opts.hidden = !optMap[o];
      clear(lookup); clear(resBox);
      var cols = PD_COLS.slice(), types = copy(baseTypes), rows = baseRows(), lines = ['df = pd.read_csv("orders.csv")'], msg = "", err = null, cap = "Result: df";

      if (o === "look") {
        lines.push("df.dtypes         # amount is str, not a number", "df.isna().sum()   # amount: 1", "df.shape          # (6, 5)");
        cap = "The raw export (dtype under each column name)";
        msg = "Four problems before any maths: amount is text because of \"1,250.00\", order 1002 has no amount, dates come in two formats plus \"not recorded\", and order 1004 appears twice. Region also has \" North \" and \"south\".";
      } else if (o === "dropna") {
        lines.push('df = df.dropna(subset=["amount"])');
        rows.forEach(function (r) { if (r.v.amount == null) r.gone = true; });
        msg = "6 rows become 5. Order 1002 disappears from every later total without an error. Note dropna does not catch \"not recorded\" in order_date: that is text, not a missing value.";
      } else if (o === "fillna") {
        var fv = fillVal.get();
        if (flag.get()) { lines.push('df["amount_missing"] = df["amount"].isna()'); cols.push("amount_missing"); types.amount_missing = "bool"; }
        lines.push('df["amount"] = df["amount"].fillna(' + fmt(fv, 2) + ")");
        rows.forEach(function (r) {
          if (flag.get()) { r.v.amount_missing = r.v.amount == null; r.chg.amount_missing = true; }
          if (r.v.amount == null) { r.v.amount = String(fmt(fv, 2)); r.chg.amount = true; }
        });
        msg = "Order 1002 now counts as " + fmt(fv, 2) + " in every sum and average" + (fv === 0 ? ", which pulls the average down" : ", which is a guess") + ". Only do this if the customer confirms what a blank means." + (flag.get() ? " The flag column keeps the gap visible." : " Without a flag nobody can tell this value was invented.");
      } else if (o === "astype") {
        if (commas.get()) {
          lines.push('df["amount"] = df["amount"].str.replace(",", "").astype(float)');
          types.amount = "float64";
          rows.forEach(function (r) { var before = r.v.amount; r.v.amount = num(before); if (before != null) r.chg.amount = true; });
          msg = "amount is now float64, so maths works: total " + fmt2(sumOf(rows, "amount")) + " (NaN skipped). The blank stays NaN, which is honest. Note 1004 is still counted twice.";
        } else {
          lines.push('df["amount"] = df["amount"].astype(float)');
          err = "ValueError: could not convert string to float: '1,250.00'";
          msg = "astype refuses the whole column because of one value with a thousands comma. Tick the box to strip commas first, or use pd.to_numeric(..., errors=\"coerce\") and count the NaN it creates.";
        }
      } else if (o === "dates") {
        var f = dfmt.get(), okN = 0;
        if (f === "both") {
          lines.push('iso = pd.to_datetime(df["order_date"], format="%Y-%m-%d", errors="coerce")',
            'us  = pd.to_datetime(df["order_date"], format="%m/%d/%Y", errors="coerce")',
            'df["order_date"] = iso.fillna(us)');
        } else lines.push('df["order_date"] = pd.to_datetime(df["order_date"], format="' + (f === "iso" ? "%Y-%m-%d" : f === "us" ? "%m/%d/%Y" : "%d/%m/%Y") + '", errors="coerce")');
        types.order_date = "datetime64[ns]";
        var odd;
        rows.forEach(function (r) {
          var sv = r.v.order_date;
          var d = f === "both" ? (parseDate(sv, "iso") || parseDate(sv, "us")) : parseDate(sv, f);
          if (d) okN++;
          if (sv === "03/04/2026") odd = d;
          r.v.order_date = d; r.chg.order_date = true;
        });
        msg = okN + " of 6 dates parsed; the rest became NaT. " + (odd ? "\"03/04/2026\" was read as " + odd.d + " " + MONTHS[odd.m - 1] + ", which is only right if the customer uses " + (f === "uk" ? "UK" : "US") + " dates. Ask them." : "\"03/04/2026\" did not match this format.") + " \"not recorded\" can never parse: flag it and ask.";
      } else if (o === "dups") {
        lines.push("before = len(df)", "df = df.drop_duplicates()   # keeps the first copy", "print(before, \"->\", len(df))   # 6 -> 5");
        rows[4].gone = true;
        msg = "The second copy of order 1004 is gone, so revenue drops by 80. Rows are only dropped when every column matches; use subset=[\"order_id\"] if copies differ slightly.";
      } else if (o === "groupby") {
        lines.push('df["amount"] = pd.to_numeric(df["amount"].str.replace(",", ""), errors="coerce")');
        if (tidy.get()) lines.push('df["region"] = df["region"].str.strip().str.title()');
        lines.push('df.groupby("region")["amount"].sum()');
        var g = {};
        PD_RAW.forEach(function (r) {
          var reg = tidy.get() ? r[3].trim().replace(/^\w/, function (c) { return c.toUpperCase(); }) : r[3];
          var a = num(r[4]);
          g[reg] = (g[reg] || 0) + (a == null ? 0 : a);
        });
        var keys = Object.keys(g).sort();
        cols = ["region", "amount"]; types = { region: "str (index)", amount: "float64" };
        rows = keys.map(function (k, i) { return { idx: i, v: { region: k, amount: g[k] }, chg: { region: tidy.get() ? k !== "East" : (k === " North " || k === "south") } }; });
        cap = "Result: one row per group";
        msg = tidy.get()
          ? "Three clean regions. North is " + fmt2(g.North) + ". South shows 0.0 because its only amount is missing and sum skips NaN, and East still includes the duplicate 1004 twice."
          : keys.length + " groups instead of 3: \" North \" (with spaces) and \"North\" are different text, and \"south\" is lowercase. North's " + fmt2(g.North + g[" North "]) + " is split in two. Tick the tidy box.";
      } else if (o === "merge") {
        lookup.appendChild(h("div", { class: "wg-w12-cap", text: "orders (cleaned, 4 rows) and customers lookup (C2 appears twice)" }));
        var oRows = PD_ORD.map(function (r, i) { return { idx: i, v: { order_id: r[0], customer_id: r[1], amount: r[2] }, chg: {} }; });
        var cRows = PD_CUST.map(function (r, i) { return { idx: i, v: { customer_id: r[0], name: r[1], segment: r[2] }, chg: i === 2 ? { customer_id: true } : {} }; });
        lookup.appendChild(h("div", { class: "wg-pdo-two" },
          h("div", { class: "wg-w12-scroll" }, table(["order_id", "customer_id", "amount"], { order_id: "int64", customer_id: "str", amount: "float64" }, oRows)),
          h("div", { class: "wg-w12-scroll" }, table(["customer_id", "name", "segment"], { customer_id: "str", name: "str", segment: "str" }, cRows))));
        lines = ['joined = orders.merge(customers, on="customer_id", how="' + how.get() + '"' + (how.get() === "left" ? ", indicator=True" : "") + (valid.get() ? ', validate="many_to_one"' : "") + ")", 'print(len(orders), "->", len(joined))'];
        if (valid.get()) {
          err = "MergeError: Merge keys are not unique in right dataset; not a many-to-one merge";
          msg = "validate stopped the merge before it could fan out. Ask the customer which C2 row is correct (Trade or Retail), drop the other, and merge again.";
        } else {
          cols = ["order_id", "customer_id", "amount", "name", "segment"];
          if (how.get() === "left") cols.push("_merge");
          types = { order_id: "int64", customer_id: "str", amount: "float64", name: "str", segment: "str", _merge: "category" };
          rows = []; var i2 = 0;
          PD_ORD.forEach(function (r) {
            var m = PD_CUST.filter(function (c) { return c[0] === r[1]; });
            if (!m.length && how.get() === "left") rows.push({ idx: i2++, v: { order_id: r[0], customer_id: r[1], amount: r[2], name: null, segment: null, _merge: "left_only" }, chg: { _merge: true } });
            m.forEach(function (c, k) { rows.push({ idx: i2++, added: k > 0, v: { order_id: r[0], customer_id: r[1], amount: r[2], name: c[1], segment: c[2], _merge: "both" }, chg: k > 0 ? { order_id: true, customer_id: true, amount: true, name: true, segment: true, _merge: true } : { name: true, segment: true } }); });
          });
          var tot = sumOf(rows, "amount");
          cap = "Result: joined";
          msg = "4 orders became " + rows.length + " rows" + (how.get() === "inner" ? " (C9 has no match, so inner drops order 1004)" : "") + ". Order 1002 was copied because C2 is in the lookup twice, so revenue shows " + fmt2(tot) + " instead of " + fmt2(how.get() === "inner" ? 1430.5 : 1510.5) + ". No error was raised. Always compare len() before and after a merge.";
        }
      }
      code.textContent = lines.join("\n");
      resCap.textContent = cap;
      if (err) resBox.appendChild(h("div", { class: "wg-pdo-err", text: err }));
      else resBox.appendChild(table(cols, types, rows));
      mean.set(msg);
    }
    update();
  }

  Object.assign(WIDGETS, {
    spark: {
      title: "Partition skew calculator",
      intro: "Raise the hot key's share and watch one partition tower over the rest while the stage waits for it. Then turn on salting to spread that key out.",
      render: renderSpark
    },
    streaming: {
      title: "Consumer group rebalancer",
      intro: "Change partitions and consumers to see how Kafka hands out partitions. Push consumers past the partition count to create idle members, or lower throughput to watch lag grow.",
      render: renderStreaming
    },
    tools: {
      title: "Agent loop stepper",
      intro: "Step through an agent refunding an order: think, call a tool, read the result. Make the eligibility tool flaky or down and see where retries belong and when the loop runs away.",
      render: renderTools
    },
    security: {
      title: "JWT decoder and RBAC checker",
      intro: "Decode a token to read its claims and expiry in plain words, then switch tabs to see why a user is allowed or denied an action.",
      render: renderSecurity
    },
    dsa: {
      title: "Pattern flashcards",
      intro: "Sixteen short problems, one pattern each. Pick the pattern before the timer runs out and read why it fits.",
      render: renderDsa
    },
    pandas: {
      title: "pandas operation explorer",
      intro: "Pick an operation to apply to a small messy export. See the pandas line, the resulting table with changed cells highlighted, and what went quietly wrong.",
      render: renderPandas
    }
  });
})();

WIDGET_CSS += `
.wg-w12-wrap { display: flex; flex-direction: column; gap: 14px; font-family: var(--body); color: var(--ink); min-width: 0; }
.wg-w12-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 10px 18px; }
.wg-w12-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.wg-w12-lab { display: flex; justify-content: space-between; gap: 8px; font-size: 13px; color: var(--muted); flex-wrap: wrap; }
.wg-w12-val { font-family: var(--mono); color: var(--ink); font-size: 13px; }
.wg-w12-field input[type=range] { width: 100%; accent-color: var(--accent); }
.wg-w12-num, .wg-w12-sel, .wg-sec-ta { font: inherit; font-size: 14px; color: var(--ink); background: var(--surface); border: 1px solid var(--line-strong); border-radius: 6px; padding: 6px 8px; width: 100%; box-sizing: border-box; }
.wg-w12-check { display: flex; gap: 8px; align-items: flex-start; font-size: 14px; }
.wg-w12-check input { margin-top: 3px; accent-color: var(--accent); }
.wg-w12-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.wg-w12-btn { font: inherit; font-size: 14px; padding: 7px 14px; border-radius: 6px; border: 1px solid var(--line-strong); background: var(--surface); color: var(--ink); cursor: pointer; }
.wg-w12-btn:hover:not(:disabled) { border-color: var(--accent); }
.wg-w12-btn:disabled { color: var(--muted); border-style: dashed; opacity: 1; cursor: default; }
.wg-w12-primary { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
.wg-w12-panel { border: 1px solid var(--line); border-radius: 8px; padding: 10px; background: var(--surface); }
.wg-w12-cap { font-size: 12px; color: var(--muted); margin-bottom: 6px; text-transform: none; }
.wg-w12-svg { width: 100%; max-width: 720px; height: auto; display: block; margin: 0 auto; }
.wg-w12-svgt { font-family: var(--mono); font-size: 11px; fill: var(--muted); }
.wg-w12-legend { display: flex; flex-wrap: wrap; gap: 14px; font-size: 12px; color: var(--muted); margin-top: 6px; }
.wg-w12-legend span { display: inline-flex; align-items: center; gap: 6px; }
.wg-w12-stats4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
.wg-w12-stat { border: 1px solid var(--line); border-radius: 8px; padding: 8px 10px; background: var(--surface); }
.wg-w12-statl { font-size: 12px; color: var(--muted); }
.wg-w12-statv { font-size: 20px; font-weight: 600; font-family: var(--mono); margin-top: 2px; word-break: break-word; }
.wg-w12-stats { font-size: 12px; color: var(--muted); }
.wg-w12-warn { border-color: var(--accent); }
.wg-w12-warn .wg-w12-statv { color: var(--accent); }
.wg-w12-mean { background: var(--accent-soft); border-left: 3px solid var(--accent); padding: 10px 12px; border-radius: 6px; font-size: 14px; line-height: 1.5; }
.wg-w12-note { font-size: 12px; color: var(--muted); margin: 0; line-height: 1.5; }
.wg-w12-scroll { overflow-x: auto; max-width: 100%; }
.wg-w12-table { border-collapse: collapse; font-size: 13px; width: 100%; }
.wg-w12-table th, .wg-w12-table td { border-bottom: 1px solid var(--line); padding: 5px 8px; text-align: left; vertical-align: top; }
.wg-w12-table th { color: var(--muted); font-weight: 600; font-size: 12px; }
.wg-skw-sw { display: inline-block; width: 12px; height: 12px; border-radius: 2px; }
.wg-skw-norm { background: var(--packet); opacity: .8; }
.wg-skw-hot { background: var(--accent); }
.wg-cgr-board { display: grid; grid-template-columns: repeat(auto-fill, minmax(165px, 1fr)); gap: 8px; }
.wg-cgr-card { border: 1px solid var(--line); border-radius: 8px; padding: 8px; display: flex; flex-direction: column; gap: 6px; background: var(--bg); }
.wg-cgr-bad { border-color: var(--accent); }
.wg-cgr-idle { border-style: dashed; }
.wg-cgr-head { display: flex; justify-content: space-between; gap: 6px; font-size: 13px; flex-wrap: wrap; }
.wg-cgr-status { font-size: 12px; color: var(--muted); }
.wg-cgr-bad .wg-cgr-status { color: var(--accent); font-weight: 600; }
.wg-cgr-chips { display: flex; flex-wrap: wrap; gap: 4px; min-height: 22px; }
.wg-cgr-chip { font-family: var(--mono); font-size: 11px; padding: 2px 6px; border-radius: 4px; background: var(--code-bg); border: 1px solid var(--line); }
.wg-cgr-none { font-size: 12px; color: var(--muted); font-style: italic; }
.wg-cgr-bar { height: 8px; border-radius: 4px; background: var(--code-bg); overflow: hidden; }
.wg-cgr-fill { height: 100%; background: var(--packet); }
.wg-cgr-fill.wg-cgr-over { background: var(--accent); }
.wg-cgr-sub { font-size: 11px; color: var(--muted); font-family: var(--mono); }
.wg-agl-task { background: var(--code-bg); border-radius: 8px; padding: 10px 12px; font-size: 14px; }
.wg-agl-trace { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.wg-agl-step { border: 1px solid var(--line); border-radius: 8px; padding: 8px 10px; display: flex; flex-direction: column; gap: 5px; font-size: 13px; background: var(--surface); }
.wg-agl-bad { border-color: var(--accent); }
.wg-agl-final { border-color: var(--line-strong); }
.wg-agl-meta { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 6px; color: var(--muted); font-size: 12px; }
.wg-agl-meta strong { color: var(--ink); }
.wg-agl-think { font-style: italic; }
.wg-agl-line { display: flex; gap: 8px; align-items: baseline; flex-wrap: wrap; }
.wg-agl-line code { font-family: var(--mono); font-size: 12px; background: var(--code-bg); padding: 2px 5px; border-radius: 4px; word-break: break-word; white-space: pre-wrap; }
.wg-agl-tag { font-size: 10px; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); border: 1px solid var(--line); border-radius: 4px; padding: 0 4px; margin-right: 4px; font-style: normal; }
.wg-agl-att { font-family: var(--mono); font-size: 11px; color: var(--muted); }
.wg-agl-stop { font-weight: 600; font-size: 14px; padding: 6px 10px; border-radius: 6px; background: var(--accent-soft); border: 1px solid transparent; }
.wg-agl-empty { color: var(--muted); font-size: 13px; }
.wg-sec-tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--line); }
.wg-sec-tab { font: inherit; font-size: 14px; padding: 7px 14px; background: none; border: none; border-bottom: 2px solid transparent; color: var(--muted); cursor: pointer; }
.wg-sec-tab[aria-selected=true] { color: var(--ink); border-bottom-color: var(--accent); font-weight: 600; }
.wg-sec-ta { font-family: var(--mono); font-size: 12px; word-break: break-all; resize: vertical; }
.wg-sec-out { display: flex; flex-direction: column; gap: 10px; margin-top: 10px; }
.wg-sec-parts { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; }
.wg-sec-pre { font-family: var(--mono); font-size: 12px; background: var(--code-bg); padding: 8px; border-radius: 6px; margin: 0; white-space: pre-wrap; word-break: break-word; }
.wg-sec-val { font-family: var(--mono); font-size: 12px; word-break: break-word; }
.wg-sec-err { color: var(--accent); font-weight: 600; margin: 0; }
.wg-sec-warn { border: 1px solid var(--accent); border-radius: 8px; padding: 4px 12px; font-size: 13px; margin-top: 10px; }
.wg-sec-warn p { margin: 6px 0; }
.wg-sec-strong { color: var(--accent); font-weight: 600; }
.wg-sec-matrix td, .wg-sec-matrix th { text-align: center; padding: 5px 3px; }
.wg-sec-matrix td:first-child, .wg-sec-matrix th:first-child { text-align: left; }
.wg-sec-cell input { width: 18px; height: 18px; accent-color: var(--accent); }
.wg-sec-verdict { border-radius: 8px; padding: 10px 12px; font-size: 14px; border: 2px solid var(--line); margin-top: 10px; }
.wg-sec-big { font-size: 20px; font-weight: 700; font-family: var(--mono); }
.wg-sec-allow { border-color: var(--packet); }
.wg-sec-allow .wg-sec-big { color: color-mix(in srgb, var(--packet) 65%, var(--ink)); }
.wg-sec-deny { border-color: var(--accent); }
.wg-sec-deny .wg-sec-big { color: var(--accent); }
.wg-pat-end { justify-content: flex-end; }
.wg-pat-top { justify-content: space-between; font-size: 14px; }
.wg-pat-timer { font-family: var(--mono); font-size: 14px; }
.wg-pat-tbar { height: 6px; background: var(--code-bg); border-radius: 3px; overflow: hidden; }
.wg-pat-tfill { height: 100%; width: 100%; background: var(--accent); transition: width .25s linear; }
.wg-pat-card { border: 1px solid var(--line); border-radius: 10px; padding: 14px; background: var(--surface); min-height: 80px; }
.wg-pat-q { font-size: 17px; line-height: 1.45; margin: 0; }
.wg-pat-choices { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; }
.wg-pat-choice { font: inherit; font-size: 14px; padding: 9px 10px; border-radius: 6px; border: 1px solid var(--line-strong); background: var(--surface); color: var(--ink); cursor: pointer; text-align: left; }
.wg-pat-choice:hover:not(:disabled) { border-color: var(--accent); }
.wg-pat-choice:disabled { cursor: default; color: var(--muted); opacity: 1; }
.wg-pat-choice.wg-pat-right { border: 2px solid var(--packet); color: var(--ink); opacity: 1; font-weight: 600; }
.wg-pat-choice.wg-pat-wrong { border: 2px solid var(--accent); color: var(--ink); opacity: 1; text-decoration: line-through; }
.wg-pat-fb { font-size: 14px; line-height: 1.5; }
.wg-pat-fb:empty { display: none; }
.wg-pat-ok strong { color: color-mix(in srgb, var(--packet) 65%, var(--ink)); }
.wg-pat-no strong { color: var(--accent); }
.wg-pat-score { font-size: 40px; font-weight: 700; font-family: var(--mono); }
.wg-pat-miss { margin: 0; padding-left: 20px; font-size: 14px; }
.wg-pdo-code { font-family: var(--mono); font-size: 12px; background: var(--code-bg); padding: 10px; border-radius: 6px; margin: 0; white-space: pre-wrap; word-break: break-word; }
.wg-pdo-t { width: auto; min-width: 50%; }
.wg-pdo-t td { font-family: var(--mono); font-size: 12px; white-space: pre; }
.wg-pdo-t th { font-family: var(--mono); }
.wg-pdo-dt { font-weight: 400; font-size: 10px; color: var(--muted); }
.wg-pdo-idx { color: var(--muted); }
.wg-pdo-na { color: var(--muted); font-style: italic; }
.wg-pdo-chg { background: var(--hl); }
.wg-pdo-rgone td { text-decoration: line-through; color: var(--muted); }
.wg-pdo-radd td:first-child { box-shadow: inset 3px 0 0 var(--accent); }
.wg-pdo-sw { display: inline-block; width: 14px; height: 12px; border-radius: 2px; border: 1px solid var(--line); }
.wg-pdo-sw.wg-pdo-chg { background: var(--hl); }
.wg-pdo-sw.wg-pdo-gone { background: var(--line); }
.wg-pdo-err { font-family: var(--mono); font-size: 13px; color: var(--accent); border: 1px solid var(--accent); border-radius: 6px; padding: 10px; }
.wg-pdo-two { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; }
.wg-pdo-opts[hidden] { display: none; }
`;
