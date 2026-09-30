(function () {
  "use strict";
  var SVGNS = "http://www.w3.org/2000/svg";

  // ---------- shared helpers (scoped to this file) ----------
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === "text") n.textContent = attrs[k];
      else if (k === "cls") n.className = attrs[k];
      else if (k.slice(0, 2) === "on") n.addEventListener(k.slice(2), attrs[k]);
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
  var uid = 0;
  function nid(p) { uid += 1; return p + "-" + uid + "-" + Math.floor(Math.random() * 1e6); }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  function money(v) {
    var s = v < 0 ? "-" : ""; v = Math.abs(v);
    if (v >= 1e6) return s + "$" + (v / 1e6).toFixed(v >= 1e7 ? 1 : 2) + "M";
    if (v >= 1e4) return s + "$" + Math.round(v / 1e3) + "k";
    return s + "$" + Math.round(v).toLocaleString("en-US");
  }
  function fmtNum(v, d) { return Number(v.toFixed(d == null ? 0 : d)).toLocaleString("en-US"); }
  function words(t) { var m = String(t).trim().match(/\S+/g); return m ? m.length : 0; }

  // slider with label + live value. P = class prefix like "wg-slg"
  function slider(P, o, onchange) {
    var id = nid(P);
    var val = el("span", { cls: P + "-val" });
    var inp = el("input", { type: "range", id: id, min: o.min, max: o.max, step: o.step, value: o.value });
    function show() { val.textContent = o.fmt(Number(inp.value)); }
    inp.addEventListener("input", function () { show(); onchange(); });
    show();
    var f = el("div", { cls: P + "-field" }, [
      el("label", { for: id }, [el("span", { text: o.label }), val]), inp
    ]);
    if (o.hint) f.appendChild(el("span", { cls: P + "-hint", text: o.hint }));
    return { node: f, get: function () { return Number(inp.value); }, input: inp };
  }
  function numInput(P, o, onchange) {
    var id = nid(P);
    var inp = el("input", { type: "number", id: id, min: o.min, max: o.max, step: o.step, value: o.value, inputmode: "decimal" });
    inp.addEventListener("input", onchange);
    var f = el("div", { cls: P + "-field" }, [
      el("label", { for: id }, [el("span", { text: o.label }), el("span", { cls: P + "-unit", text: o.unit || "" })]), inp
    ]);
    if (o.hint) f.appendChild(el("span", { cls: P + "-hint", text: o.hint }));
    return { node: f, input: inp, get: function () {
      var v = Number(inp.value); if (!isFinite(v)) v = 0;
      if (o.min != null) v = Math.max(Number(o.min), v);
      if (o.max != null) v = Math.min(Number(o.max), v);
      return v;
    } };
  }
  function textField(P, o, onchange) {
    var id = nid(P);
    var inp = el(o.multi ? "textarea" : "input", o.multi ? { id: id, rows: o.rows || 3 } : { id: id, type: "text" });
    inp.value = o.value || "";
    if (o.placeholder) inp.setAttribute("placeholder", o.placeholder);
    var cnt = el("span", { cls: P + "-val" });
    inp.addEventListener("input", onchange);
    var f = el("div", { cls: P + "-field" }, [el("label", { for: id }, [el("span", { text: o.label }), cnt]), inp]);
    if (o.hint) f.appendChild(el("span", { cls: P + "-hint", text: o.hint }));
    return { node: f, input: inp, count: cnt, get: function () { return inp.value; } };
  }
  function stat(P, label) {
    var v = el("div", { cls: P + "-statv" });
    var n = el("div", { cls: P + "-stat" }, [el("div", { cls: P + "-statl", text: label }), v]);
    return { node: n, set: function (t) { v.textContent = t; } };
  }
  function meaning(P) {
    var t = el("span");
    var n = el("p", { cls: P + "-mean" }, [el("strong", { text: "What this means: " }), t]);
    return { node: n, set: function (s) { t.textContent = s; } };
  }

  // generic line chart. series: [{name, values:[...], color, dash, width}]
  function lineChart(o) {
    var W = 560, H = 300, L = 70, R = 104, T = 16, B = 34;
    var svg = sv("svg", { viewBox: "0 0 " + W + " " + H, width: "100%", role: "img", "aria-label": o.aria || "chart" });
    var all = []; o.series.forEach(function (s) { all = all.concat(s.values); });
    if (o.extraY) all = all.concat(o.extraY);
    var mn = Math.min.apply(null, all), mx = Math.max.apply(null, all);
    if (o.zeroBase) mn = Math.min(0, mn);
    if (mx === mn) { mx += 1; mn -= 1; }
    var pad = (mx - mn) * 0.08; mx += pad; if (!o.zeroBase || mn < 0) mn -= pad;
    var n = o.series[0].values.length;
    function x(i) { return L + (W - L - R) * i / (n - 1); }
    function y(v) { return T + (H - T - B) * (1 - (v - mn) / (mx - mn)); }
    for (var g = 0; g <= 4; g++) {
      var gv = mn + (mx - mn) * g / 4;
      svg.appendChild(sv("line", { x1: L, x2: W - R, y1: y(gv), y2: y(gv), stroke: "var(--line)", "stroke-width": 1 }));
      svg.appendChild(sv("text", { x: L - 6, y: y(gv) + 4, "text-anchor": "end", "font-size": 13, fill: "var(--muted)", "font-family": "var(--mono)" }, o.yfmt(gv)));
    }
    if (mn < 0 && mx > 0) svg.appendChild(sv("line", { x1: L, x2: W - R, y1: y(0), y2: y(0), stroke: "var(--line-strong)", "stroke-width": 1.5 }));
    o.xlabels.forEach(function (lb, i) {
      if (lb == null) return;
      svg.appendChild(sv("text", { x: x(i), y: H - 12, "text-anchor": "middle", "font-size": 13, fill: "var(--muted)", "font-family": "var(--mono)" }, lb));
    });
    var lastYs = [];
    o.series.forEach(function (s) {
      var d = s.values.map(function (v, i) { return (i ? "L" : "M") + x(i).toFixed(1) + " " + y(v).toFixed(1); }).join(" ");
      svg.appendChild(sv("path", { d: d, fill: "none", stroke: s.color, "stroke-width": s.width || 2.5, "stroke-dasharray": s.dash || "none", "stroke-linejoin": "round" }));
      if (s.dots) s.values.forEach(function (v, i) { svg.appendChild(sv("circle", { cx: x(i), cy: y(v), r: 3.5, fill: s.color })); });
      var ly = y(s.values[n - 1]);
      lastYs.forEach(function (p) { if (Math.abs(p - ly) < 14) ly = p + (ly >= p ? 14 : -14); });
      lastYs.push(ly);
      svg.appendChild(sv("text", { x: W - R + 8, y: ly + 4, "font-size": 14, fill: s.color === "var(--packet)" ? "color-mix(in srgb,var(--packet) 65%,var(--ink))" : s.color, "font-family": "var(--body)", "font-weight": 600 }, s.name));
    });
    if (o.after) o.after(svg, x, y);
    return svg;
  }

  // ---------- CSS generator (per-topic prefixes) ----------
  function baseCss(P) {
    return "\n" +
      "." + P + "-wrap{display:flex;flex-direction:column;gap:14px;font-family:var(--body);color:var(--ink);min-width:0}\n" +
      "." + P + "-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px 20px}\n" +
      "." + P + "-field{display:flex;flex-direction:column;gap:4px;font-size:14px;min-width:0}\n" +
      "." + P + "-field label{display:flex;justify-content:space-between;align-items:baseline;gap:8px;color:var(--ink)}\n" +
      "." + P + "-field input[type=range]{width:100%;accent-color:var(--accent)}\n" +
      "." + P + "-field input[type=number],." + P + "-field input[type=text],." + P + "-field textarea,." + P + "-field select{width:100%;font:inherit;font-size:14px;padding:6px 8px;border:1px solid var(--line-strong);border-radius:6px;background:var(--surface);color:var(--ink)}\n" +
      "." + P + "-field textarea{resize:vertical;line-height:1.45}\n" +
      "." + P + "-val,." + P + "-unit{font-family:var(--mono);font-size:13px;color:var(--accent);white-space:nowrap}\n" +
      "." + P + "-unit{color:var(--muted)}\n" +
      "." + P + "-hint{font-size:12px;color:var(--muted)}\n" +
      "." + P + "-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px}\n" +
      "." + P + "-stat{background:var(--accent-soft);border:1px solid var(--line);border-radius:8px;padding:8px 10px}\n" +
      "." + P + "-statl{font-size:12px;color:var(--muted)}\n" +
      "." + P + "-statv{font-family:var(--mono);font-size:19px;font-weight:600;color:var(--ink)}\n" +
      "." + P + "-mean{margin:0;padding:10px 12px;background:var(--hl);border-left:3px solid var(--packet);border-radius:4px;font-size:14px}\n" +
      "." + P + "-note{font-size:12px;color:var(--muted);margin:0}\n" +
      "." + P + "-chart{background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:6px}\n" +
      "." + P + "-chart svg{display:block;width:100%;height:auto}\n" +
      "." + P + "-btn{font:inherit;font-size:13px;padding:6px 12px;border-radius:6px;border:1px solid var(--line-strong);background:var(--surface);color:var(--ink);cursor:pointer}\n" +
      "." + P + "-btn:hover{border-color:var(--accent)}\n" +
      "." + P + "-btn:focus-visible{outline:2px solid var(--accent);outline-offset:2px}\n" +
      "." + P + "-btn-primary{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}\n" +
      "." + P + "-list{margin:0;padding-left:18px;font-size:14px;display:flex;flex-direction:column;gap:6px}\n" +
      "." + P + "-h{font-size:14px;font-weight:600;margin:4px 0 0}\n";
  }

  // =====================================================================
  // slg: NRR / GRR calculator
  // =====================================================================
  var slg = {
    title: "Net revenue retention calculator",
    intro: "Set a customer base's starting ARR and how much it expanded, shrank and churned over a year. Watch how NRR compounds over three years compared with a weak (90%) and a best-in-class (130%) company.",
    render: function (host) {
      var P = "wg-slg";
      var wrap = el("div", { cls: P + "-wrap" });
      var upd = function () { update(); };
      var start = slider(P, { label: "Starting ARR", min: 500000, max: 50000000, step: 500000, value: 10000000, fmt: money }, upd);
      var exp = slider(P, { label: "Expansion (upsell, more seats)", min: 0, max: 80, step: 1, value: 25, fmt: function (v) { return v + "%"; } }, upd);
      var con = slider(P, { label: "Contraction (downgrades)", min: 0, max: 30, step: 1, value: 4, fmt: function (v) { return v + "%"; } }, upd);
      var chu = slider(P, { label: "Churn (customers who left)", min: 0, max: 40, step: 1, value: 6, fmt: function (v) { return v + "%"; } }, upd);
      var dollars = el("p", { cls: P + "-note" });
      var sN = stat(P, "NRR"), sG = stat(P, "GRR"), sE = stat(P, "ARR after 1 year"), s3 = stat(P, "Same cohort in year 3");
      var chart = el("div", { cls: P + "-chart" });
      var mean = meaning(P);
      var expl = el("p", { cls: P + "-note", text: "NRR = (start + expansion - contraction - churn) / start. GRR = (start - contraction - churn) / start, so it ignores expansion and can never exceed 100%. Percentages are of starting ARR; new customers are not counted." });
      wrap.appendChild(el("div", { cls: P + "-grid" }, [start.node, exp.node, con.node, chu.node]));
      wrap.appendChild(dollars);
      wrap.appendChild(el("div", { cls: P + "-stats" }, [sN.node, sG.node, sE.node, s3.node]));
      wrap.appendChild(mean.node);
      wrap.appendChild(el("div", { cls: P + "-h", text: "Same customers, 3 years of compounding (no new logos)" }));
      wrap.appendChild(chart);
      wrap.appendChild(expl);
      host.appendChild(wrap);

      function update() {
        var S = start.get(), e = S * exp.get() / 100, c = S * con.get() / 100, h = S * chu.get() / 100;
        var nrr = (S + e - c - h) / S, grr = Math.max(0, (S - c - h) / S);
        dollars.textContent = "In dollars: +" + money(e) + " expansion, -" + money(c) + " contraction, -" + money(h) + " churn.";
        sN.set(Math.round(nrr * 100) + "%");
        sG.set(Math.round(grr * 100) + "%");
        sE.set(money(S * nrr));
        s3.set(money(S * Math.pow(nrr, 3)));
        var msg;
        if (nrr >= 1.2) msg = "At " + Math.round(nrr * 100) + "% NRR these customers alone grow the business to " + money(S * Math.pow(nrr, 3)) + " in 3 years without a single new sale. That is the payoff SLG is betting on.";
        else if (nrr >= 1) msg = "At " + Math.round(nrr * 100) + "% NRR the existing base grows slowly on its own; expansion covers the " + money(c + h) + " you lose each year.";
        else msg = "At " + Math.round(nrr * 100) + "% NRR the base shrinks to " + money(S * Math.pow(nrr, 3)) + " in 3 years, so sales must replace lost revenue just to stand still.";
        if (grr < 0.85) msg += " GRR of " + Math.round(grr * 100) + "% is low: fix churn before chasing upsells.";
        mean.set(msg);
        var years = [0, 1, 2, 3];
        function ser(r) { return years.map(function (y) { return S * Math.pow(r, y); }); }
        clear(chart);
        chart.appendChild(lineChart({
          aria: "ARR over three years at 90%, your NRR and 130% NRR",
          series: [
            { name: "90% NRR", values: ser(0.9), color: "var(--muted)", dash: "5 4", width: 2 },
            { name: "130% NRR", values: ser(1.3), color: "var(--packet)", dash: "5 4", width: 2 },
            { name: "Yours " + Math.round(nrr * 100) + "%", values: ser(nrr), color: "var(--accent)", width: 3, dots: true }
          ],
          xlabels: ["Start", "Year 1", "Year 2", "Year 3"],
          yfmt: money
        }));
      }
      update();
    }
  };

  // =====================================================================
  // roi: AI project ROI / payback
  // =====================================================================
  var roi = {
    title: "AI project ROI and payback",
    intro: "Enter what the AI tool saves and what it costs to build and run. The chart shows cumulative cash: below zero you are still paying off the build, the dot marks breakeven.",
    render: function (host) {
      var P = "wg-roi";
      var wrap = el("div", { cls: P + "-wrap" });
      var upd = function () { update(); };
      var hrs = slider(P, { label: "Hours saved per task", min: 0.05, max: 4, step: 0.05, value: 0.25, fmt: function (v) { return v.toFixed(2) + " h (" + Math.round(v * 60) + " min)"; } }, upd);
      var tasks = slider(P, { label: "Tasks per month", min: 50, max: 20000, step: 50, value: 3000, fmt: function (v) { return fmtNum(v); } }, upd);
      var rate = numInput(P, { label: "Loaded hourly cost", unit: "$/hour", min: 5, max: 500, step: 1, value: 55, hint: "Salary + benefits + overhead. Example rate, use the customer's number." }, upd);
      var err = numInput(P, { label: "Error reduction value", unit: "$/month", min: 0, max: 1000000, step: 500, value: 4000, hint: "Rework, refunds or penalties avoided each month." }, upd);
      var build = numInput(P, { label: "Build cost (one-off)", unit: "$", min: 0, max: 10000000, step: 5000, value: 180000, hint: "FDE time, integration, evaluation." }, upd);
      var run = numInput(P, { label: "Run cost", unit: "$/month", min: 0, max: 1000000, step: 500, value: 9000, hint: "Model API, hosting, support. Example prices, check current rates." }, upd);
      var sB = stat(P, "Monthly benefit"), sNet = stat(P, "Net per month"), sP = stat(P, "Payback"), sR = stat(P, "12-month ROI");
      var chart = el("div", { cls: P + "-chart" });
      var mean = meaning(P);
      wrap.appendChild(el("div", { cls: P + "-grid" }, [hrs.node, tasks.node, rate.node, err.node, build.node, run.node]));
      wrap.appendChild(el("div", { cls: P + "-stats" }, [sB.node, sNet.node, sP.node, sR.node]));
      wrap.appendChild(mean.node);
      wrap.appendChild(el("div", { cls: P + "-h", text: "Cumulative cash over 24 months" }));
      wrap.appendChild(chart);
      wrap.appendChild(el("p", { cls: P + "-note", text: "Monthly benefit = hours saved x tasks x hourly cost + error value. 12-month ROI = (12 months of benefit - build - 12 months of run cost) / (build + 12 months of run cost). Hours saved only become money if the time is actually reused." }));
      host.appendChild(wrap);

      function update() {
        var labour = hrs.get() * tasks.get() * rate.get();
        var benefit = labour + err.get();
        var net = benefit - run.get();
        var B = build.get();
        var cost12 = B + 12 * run.get();
        var roi12 = cost12 > 0 ? (12 * benefit - cost12) / cost12 : 0;
        var payback = net > 0 ? B / net : Infinity;
        sB.set(money(benefit));
        sNet.set(money(net));
        sP.set(net > 0 ? (payback < 0.1 ? "< 0.1 mo" : payback.toFixed(1) + " mo") : "never");
        sR.set(cost12 > 0 ? Math.round(roi12 * 100) + "%" : "n/a");
        var m;
        if (net <= 0) m = "Run costs (" + money(run.get()) + "/mo) are higher than the benefit (" + money(benefit) + "/mo), so this never pays back. Cut run cost or find a higher-volume task.";
        else if (payback <= 12) m = "The project pays for itself in " + payback.toFixed(1) + " months and returns " + Math.round(roi12 * 100) + "% in year one. Of the benefit, " + Math.round(labour / benefit * 100) + "% is time saved and the rest is fewer errors.";
        else m = "Payback takes " + payback.toFixed(1) + " months, longer than a typical 12-month budget cycle. Expect a hard sell unless you can show a bigger volume or lower build cost.";
        mean.set(m);
        var vals = []; for (var i = 0; i <= 24; i++) vals.push(-B + net * i);
        clear(chart);
        chart.appendChild(lineChart({
          aria: "Cumulative cash by month with breakeven point",
          series: [{ name: "Cash", values: vals, color: "var(--accent)", width: 3 }],
          xlabels: vals.map(function (v, i) { return i % 6 === 0 ? "M" + i : null; }),
          yfmt: money, extraY: [0],
          after: function (svg, x, y) {
            if (net > 0 && payback <= 24) {
              var px = x(payback);
              svg.appendChild(sv("line", { x1: px, x2: px, y1: y(0) - 40, y2: y(0) + 40, stroke: "var(--packet)", "stroke-dasharray": "3 3", "stroke-width": 1.5 }));
              svg.appendChild(sv("circle", { cx: px, cy: y(0), r: 6, fill: "var(--packet)", stroke: "var(--surface)", "stroke-width": 2 }));
              svg.appendChild(sv("text", { x: px + (payback > 16 ? -8 : 8), y: y(0) - 12, "text-anchor": payback > 16 ? "end" : "start", "font-size": 12, fill: "var(--ink)", "font-weight": 600 }, "Breakeven: month " + payback.toFixed(1)));
            }
          }
        }));
      }
      update();
    }
  };

  // =====================================================================
  // sysdesign: back-of-the-envelope capacity
  // =====================================================================
  var sysdesign = {
    title: "Back-of-the-envelope capacity",
    intro: "Describe the load in plain numbers and get QPS, bandwidth and storage, plus which parts (cache, queue, sharding) the numbers actually justify. Try pushing users to 5 million or the peak factor to 10.",
    render: function (host) {
      var P = "wg-sys";
      var wrap = el("div", { cls: P + "-wrap" });
      var upd = function () { update(); };
      var dau = numInput(P, { label: "Daily active users", unit: "users", min: 1, max: 1000000000, step: 1000, value: 200000 }, upd);
      var rpu = slider(P, { label: "Requests per user per day", min: 1, max: 500, step: 1, value: 40, fmt: function (v) { return v + " req"; } }, upd);
      var peak = slider(P, { label: "Peak factor (busiest hour vs average)", min: 1, max: 20, step: 0.5, value: 3, fmt: function (v) { return v + "x"; } }, upd);
      var size = slider(P, { label: "Payload size per request", min: 0.5, max: 2000, step: 0.5, value: 4, fmt: function (v) { return v + " KB"; } }, upd);
      var rw = slider(P, { label: "Reads per write", min: 0, max: 100, step: 1, value: 10, fmt: function (v) { return v + " : 1"; } }, upd);
      var ret = slider(P, { label: "Retention", min: 1, max: 3650, step: 1, value: 365, fmt: function (v) { return v + " days"; } }, upd);
      var sA = stat(P, "Average QPS"), sPk = stat(P, "Peak QPS"), sW = stat(P, "Peak write QPS"), sBw = stat(P, "Peak bandwidth"), sY = stat(P, "New storage / year"), sR = stat(P, "Stored (retention)");
      var mean = meaning(P);
      var recs = el("ul", { cls: P + "-recs" });
      wrap.appendChild(el("div", { cls: P + "-grid" }, [dau.node, rpu.node, peak.node, size.node, rw.node, ret.node]));
      wrap.appendChild(el("div", { cls: P + "-stats" }, [sA.node, sPk.node, sW.node, sBw.node, sY.node, sR.node]));
      wrap.appendChild(mean.node);
      wrap.appendChild(el("div", { cls: P + "-h", text: "What the numbers suggest" }));
      wrap.appendChild(recs);
      wrap.appendChild(el("p", { cls: P + "-note", text: "Rules of thumb only: 1 day = 86,400 s (about 100k); one app server handles roughly a few hundred to a few thousand simple requests per second; one well-tuned database a few thousand writes per second. Storage counts written payloads only, before replication and indexes (multiply by about 3 for real disk)." }));
      host.appendChild(wrap);

      function bytes(b) {
        var u = ["B", "KB", "MB", "GB", "TB", "PB"], i = 0;
        while (b >= 1000 && i < u.length - 1) { b /= 1000; i++; }
        return (b >= 100 ? Math.round(b) : b.toFixed(1)) + " " + u[i];
      }
      function q(v) { return v >= 100 ? fmtNum(Math.round(v)) : v.toFixed(1); }
      function update() {
        var perDay = dau.get() * rpu.get();
        var avg = perDay / 86400, pk = avg * peak.get();
        var wFrac = 1 / (rw.get() + 1);
        var pkW = pk * wFrac, pkR = pk - pkW;
        var bw = pk * size.get() * 1000; // bytes/s
        var writeBytesDay = perDay * wFrac * size.get() * 1000;
        var year = writeBytesDay * 365, stored = writeBytesDay * ret.get();
        sA.set(q(avg)); sPk.set(q(pk)); sW.set(q(pkW));
        sBw.set(bytes(bw) + "/s"); sY.set(bytes(year)); sR.set(bytes(stored));
        var servers = Math.max(1, Math.ceil(pk / 500));
        mean.set(fmtNum(dau.get()) + " users making " + rpu.get() + " requests a day is about " + q(avg) + " requests per second on average and " + q(pk) + " at peak, which is roughly " + servers + " app server" + (servers > 1 ? "s" : "") + " at ~500 req/s each (plus one spare).");
        var list = [];
        if (pk < 50) list.push(["Keep it simple", "Under 50 peak QPS one small server and one database are enough. Spend the effort on reliability and backups, not scale."]);
        if (rw.get() >= 5 && pkR > 100) list.push(["Add a cache", "Reads outnumber writes " + rw.get() + " to 1 and peak reads are " + q(pkR) + "/s. A cache such as Redis can absorb most repeated reads and protect the database."]);
        else if (rw.get() < 5) list.push(["Cache has limited value", "With only " + rw.get() + " reads per write, cached answers go stale quickly. Optimise queries and indexes first."]);
        if (peak.get() >= 5 || pkW > 1000) list.push(["Put a queue in front of slow work", (peak.get() >= 5 ? "Traffic spikes " + peak.get() + "x above average. " : "") + (pkW > 1000 ? "Peak writes reach " + q(pkW) + "/s. " : "") + "A queue lets workers drain bursts at a steady rate instead of sizing everything for the worst minute."]);
        if (pkW > 3000 || stored > 5e12) list.push(["Plan for sharding", (pkW > 3000 ? "Peak writes of " + q(pkW) + "/s are near what one primary database handles. " : "") + (stored > 5e12 ? "Retained data of " + bytes(stored) + " is large for a single database node. " : "") + "Split data by a key such as customer id, or archive old data to cheap object storage first."]);
        else list.push(["No sharding yet", "Peak writes (" + q(pkW) + "/s) and stored data (" + bytes(stored) + ") fit one primary database. Sharding now would add complexity for no gain."]);
        if (pkR > 3000) list.push(["Add read replicas", "Peak reads of " + q(pkR) + "/s: copies of the database that serve reads spread the load."]);
        if (bw > 1e9) list.push(["Use a CDN or object storage", "Peak bandwidth of " + bytes(bw) + "/s is heavy; serve large payloads from a CDN rather than your app servers."]);
        list.push(["Run " + (servers + 1) + " stateless app servers", "Behind a load balancer so one can fail without an outage (" + servers + " for peak load + 1 spare)."]);
        clear(recs);
        list.forEach(function (r) { recs.appendChild(el("li", {}, [el("strong", { text: r[0] + ": " }), el("span", { text: r[1] })])); });
      }
      update();
    }
  };

  // =====================================================================
  // pm: RAID risk matrix builder
  // =====================================================================
  var pm = {
    title: "Risk matrix builder",
    intro: "Each risk gets a likelihood and an impact from 1 to 5; score = likelihood x impact. Change the scores, add your own, and notice which risks land in the top-right corner and whether each has an owner and a mitigation.",
    render: function (host) {
      var P = "wg-pm";
      var next = 1;
      var risks = [
        { t: "Model gives wrong answers on edge-case claims", l: 4, i: 4, o: "FDE lead", m: "Eval set of 200 real cases; human review below confidence 0.8" },
        { t: "Customer data access approved late", l: 4, i: 3, o: "Customer IT sponsor", m: "Request access on day one; use a masked sample meanwhile" },
        { t: "LLM API cost exceeds budget at full volume", l: 2, i: 3, o: "", m: "Cache repeated prompts; route easy cases to a smaller model" },
        { t: "Handlers do not adopt the new tool", l: 3, i: 5, o: "Claims ops director", m: "" }
      ].map(function (r) { r.id = next++; return r; });
      var wrap = el("div", { cls: P + "-wrap" });
      var gridBox = el("div", { cls: P + "-chart" });
      var mean = meaning(P);
      var table = el("div", { cls: P + "-rows" });
      var addT = textField(P, { label: "New risk", placeholder: "e.g. Key SME leaves mid-project" }, function () {});
      var addL = selectField("Likelihood", 3), addI = selectField("Impact", 3);
      var addBtn = el("button", { type: "button", cls: P + "-btn " + P + "-btn-primary", text: "Add risk" });
      addBtn.addEventListener("click", function () {
        var t = addT.get().trim();
        if (!t) { addT.input.focus(); return; }
        risks.push({ id: next++, t: t, l: Number(addL.sel.value), i: Number(addI.sel.value), o: "", m: "" });
        addT.input.value = "";
        redraw();
      });
      wrap.appendChild(el("div", { cls: P + "-add" }, [addT.node, addL.node, addI.node, addBtn]));
      wrap.appendChild(el("div", { cls: P + "-top" }, [gridBox, el("div", { cls: P + "-legend" }, [
        el("div", { cls: P + "-h", text: "Heat grid" }),
        el("p", { cls: P + "-note", text: "Numbers are risk ids. Score 15-25: act now. 8-14: plan a mitigation. 1-7: watch." })
      ])]));
      wrap.appendChild(mean.node);
      wrap.appendChild(el("div", { cls: P + "-h", text: "Risks sorted by score" }));
      wrap.appendChild(table);
      host.appendChild(wrap);

      function selectField(label, v) {
        var id = nid(P), s = el("select", { id: id });
        for (var k = 1; k <= 5; k++) s.appendChild(el("option", { value: k, text: String(k) }));
        s.value = String(v);
        return { node: el("div", { cls: P + "-field " + P + "-small" }, [el("label", { for: id }, [el("span", { text: label })]), s]), sel: s };
      }
      function band(s) { return s >= 15 ? "high" : s >= 8 ? "med" : "low"; }
      function drawGrid() {
        var C = 52, L = 40, T = 10, W = L + C * 5 + 10, H = T + C * 5 + 40;
        var svg = sv("svg", { viewBox: "0 0 " + W + " " + H, width: "100%", role: "img", "aria-label": "5 by 5 risk heat grid, likelihood across, impact up" });
        for (var li = 1; li <= 5; li++) for (var im = 1; im <= 5; im++) {
          var sc = li * im, pct = sc >= 15 ? 75 : sc >= 8 ? 40 : 12;
          var x = L + (li - 1) * C, y = T + (5 - im) * C;
          svg.appendChild(sv("rect", { x: x + 1, y: y + 1, width: C - 2, height: C - 2, rx: 4, fill: "color-mix(in srgb, var(--packet) " + pct + "%, var(--surface))", stroke: "var(--line)" }));
          var here = risks.filter(function (r) { return r.l === li && r.i === im; });
          here.forEach(function (r, k) {
            var cx = x + 14 + (k % 3) * 12, cy = y + 16 + Math.floor(k / 3) * 18;
            if (here.length === 1) { cx = x + C / 2; cy = y + C / 2; }
            svg.appendChild(sv("circle", { cx: cx, cy: cy, r: 10, fill: "var(--accent)", stroke: "var(--surface)", "stroke-width": 1.5 }));
            svg.appendChild(sv("text", { x: cx, y: cy + 4, "text-anchor": "middle", "font-size": 11, "font-weight": 700, fill: "var(--accent-ink)", "font-family": "var(--mono)" }, String(r.id)));
          });
        }
        for (var k = 1; k <= 5; k++) {
          svg.appendChild(sv("text", { x: L + (k - 0.5) * C, y: T + 5 * C + 16, "text-anchor": "middle", "font-size": 11, fill: "var(--muted)", "font-family": "var(--mono)" }, String(k)));
          svg.appendChild(sv("text", { x: L - 10, y: T + (5 - k + 0.5) * C + 4, "text-anchor": "middle", "font-size": 11, fill: "var(--muted)", "font-family": "var(--mono)" }, String(k)));
        }
        svg.appendChild(sv("text", { x: L + 2.5 * C, y: H - 4, "text-anchor": "middle", "font-size": 12, fill: "var(--ink)" }, "Likelihood →"));
        var yl = sv("text", { x: 12, y: T + 2.5 * C, "text-anchor": "middle", "font-size": 12, fill: "var(--ink)", transform: "rotate(-90 12 " + (T + 2.5 * C) + ")" }, "Impact →");
        svg.appendChild(yl);
        clear(gridBox); gridBox.appendChild(svg);
      }
      function drawMeaning() {
        if (!risks.length) { mean.set("No risks listed. An empty RAID log usually means nobody has looked, not that there are no risks."); return; }
        var sorted = risks.slice().sort(function (a, b) { return b.l * b.i - a.l * a.i; });
        var hi = risks.filter(function (r) { return r.l * r.i >= 15; }).length;
        var noOwner = risks.filter(function (r) { return !r.o.trim(); }).length;
        var noMit = risks.filter(function (r) { return !r.m.trim(); }).length;
        var top = sorted[0];
        var s = "Top risk is #" + top.id + " (score " + top.l * top.i + "). " + hi + " risk" + (hi === 1 ? " is" : "s are") + " in the act-now zone.";
        if (noOwner || noMit) s += " " + (noOwner ? noOwner + " without an owner" : "") + (noOwner && noMit ? " and " : "") + (noMit ? noMit + " without a mitigation" : "") + ": a risk nobody owns is a risk nobody manages.";
        else s += " Every risk has an owner and a mitigation, so this log is ready to review with the sponsor.";
        mean.set(s);
      }
      function drawTable() {
        clear(table);
        var sorted = risks.slice().sort(function (a, b) { return b.l * b.i - a.l * a.i || a.id - b.id; });
        sorted.forEach(function (r) {
          var sc = r.l * r.i;
          var badge = el("span", { cls: P + "-score " + P + "-" + band(sc), text: String(sc) });
          var title = el("div", { cls: P + "-title" }, [el("span", { cls: P + "-id", text: "#" + r.id }), el("span", { text: r.t })]);
          var lS = selectField("Likelihood", r.l), iS = selectField("Impact", r.i);
          lS.sel.addEventListener("change", function () { r.l = Number(lS.sel.value); redraw(); });
          iS.sel.addEventListener("change", function () { r.i = Number(iS.sel.value); redraw(); });
          var own = textField(P, { label: "Owner", value: r.o, placeholder: "Named person" }, function () { r.o = own.get(); flagRow(); drawMeaning(); });
          var mit = textField(P, { label: "Mitigation", value: r.m, placeholder: "What reduces likelihood or impact?" }, function () { r.m = mit.get(); flagRow(); drawMeaning(); });
          var del = el("button", { type: "button", cls: P + "-btn", text: "Remove" });
          del.setAttribute("aria-label", "Remove risk " + r.id);
          del.addEventListener("click", function () { risks = risks.filter(function (x) { return x !== r; }); redraw(); });
          var flag = el("span", { cls: P + "-flag" });
          function flagRow() { flag.textContent = (!r.o.trim() ? "Needs an owner. " : "") + (!r.m.trim() ? "Needs a mitigation." : ""); }
          flagRow();
          table.appendChild(el("div", { cls: P + "-row" }, [
            el("div", { cls: P + "-rowhead" }, [badge, title, del]),
            el("div", { cls: P + "-rowgrid" }, [lS.node, iS.node, own.node, mit.node]),
            flag
          ]));
        });
      }
      function redraw() { drawGrid(); drawMeaning(); drawTable(); }
      redraw();
    }
  };

  // =====================================================================
  // arc: 12-week engagement planner
  // =====================================================================
  var arc = {
    title: "12-week engagement planner",
    intro: "Split 12 weeks across the six phases with the + and - buttons. The bar redraws as a timeline and flags the mistakes new FDEs make most often, such as skipping hardening.",
    render: function (host) {
      var P = "wg-arc";
      var phases = [
        { k: "Discover", w: 1, d: "Interviews, workflow map, baseline number, data access requests." },
        { k: "Design", w: 1, d: "Success criteria, architecture sketch, eval plan." },
        { k: "Build", w: 6, d: "Working prototype on real data, eval set." },
        { k: "Pilot", w: 2, d: "Real users, real volume, measured against the baseline." },
        { k: "Harden", w: 0, d: "Security review, monitoring, error handling, load tests." },
        { k: "Handoff", w: 2, d: "Runbook, training, customer team owns it." }
      ];
      var RECOMMENDED = [2, 1, 4, 2, 2, 1];
      var wrap = el("div", { cls: P + "-wrap" });
      var rows = el("div", { cls: P + "-phases" });
      var total = el("div", { cls: P + "-total" });
      var chart = el("div", { cls: P + "-chart" });
      var flags = el("ul", { cls: P + "-list" });
      var mean = meaning(P);
      var reset = el("button", { type: "button", cls: P + "-btn", text: "Load a sensible plan" });
      reset.addEventListener("click", function () { RECOMMENDED.forEach(function (w, i) { phases[i].w = w; }); update(); });
      var counters = phases.map(function (ph) {
        var v = el("span", { cls: P + "-count", "aria-live": "polite" });
        var minus = el("button", { type: "button", cls: P + "-btn " + P + "-pm", text: "−" });
        var plus = el("button", { type: "button", cls: P + "-btn " + P + "-pm", text: "+" });
        minus.setAttribute("aria-label", "One week less " + ph.k);
        plus.setAttribute("aria-label", "One week more " + ph.k);
        minus.addEventListener("click", function () { if (ph.w > 0) { ph.w--; update(); } });
        plus.addEventListener("click", function () { if (ph.w < 12) { ph.w++; update(); } });
        rows.appendChild(el("div", { cls: P + "-phase" }, [
          el("div", { cls: P + "-pname" }, [el("strong", { text: ph.k }), el("span", { cls: P + "-hint", text: ph.d })]),
          el("div", { cls: P + "-ctl" }, [minus, v, plus])
        ]));
        return v;
      });
      wrap.appendChild(rows);
      wrap.appendChild(el("div", { cls: P + "-bar" }, [total, reset]));
      wrap.appendChild(chart);
      wrap.appendChild(mean.node);
      wrap.appendChild(el("div", { cls: P + "-h", text: "Plan check" }));
      wrap.appendChild(flags);
      host.appendChild(wrap);

      function update() {
        var sum = 0;
        phases.forEach(function (ph, i) { counters[i].textContent = ph.w + " wk"; sum += ph.w; });
        total.textContent = "Total: " + sum + " of 12 weeks" + (sum === 12 ? "" : sum < 12 ? " (" + (12 - sum) + " unplanned)" : " (" + (sum - 12) + " over)");
        total.className = P + "-total" + (sum === 12 ? "" : " " + P + "-bad");
        // gantt
        var W = 480, rowH = 30, L = 76, T = 24, span = Math.max(12, sum), H = T + rowH * phases.length + 8;
        var colW = (W - L - 8) / span;
        var svg = sv("svg", { viewBox: "0 0 " + W + " " + H, width: "100%", role: "img", "aria-label": "Timeline of phases across weeks" });
        for (var wk = 0; wk <= span; wk++) {
          var gx = L + wk * colW;
          svg.appendChild(sv("line", { x1: gx, x2: gx, y1: T - 4, y2: H - 6, stroke: wk === 12 ? "var(--packet)" : "var(--line)", "stroke-width": wk === 12 ? 2 : 1, "stroke-dasharray": wk === 12 ? "4 3" : "none" }));
          if (wk < span) svg.appendChild(sv("text", { x: gx + colW / 2, y: T - 8, "text-anchor": "middle", "font-size": 11, fill: "var(--muted)", "font-family": "var(--mono)" }, "W" + (wk + 1)));
        }
        var at = 0;
        phases.forEach(function (ph, i) {
          var y = T + i * rowH;
          svg.appendChild(sv("text", { x: L - 8, y: y + rowH / 2 + 4, "text-anchor": "end", "font-size": 13, fill: "var(--ink)" }, ph.k));
          if (ph.w > 0) {
            var over = at + ph.w > 12;
            svg.appendChild(sv("rect", { x: L + at * colW + 1, y: y + 4, width: ph.w * colW - 2, height: rowH - 8, rx: 4, fill: over ? "var(--packet)" : "var(--accent)" }));
          } else {
            svg.appendChild(sv("text", { x: L + at * colW + 4, y: y + rowH / 2 + 4, "font-size": 12, fill: "color-mix(in srgb,var(--packet) 65%,var(--ink))", "font-style": "italic" }, "skipped"));
          }
          at += ph.w;
        });
        clear(chart); chart.appendChild(svg);
        // flags
        var w = {}; phases.forEach(function (p) { w[p.k] = p.w; });
        var f = [];
        if (sum !== 12) f.push(sum > 12 ? "The plan runs " + (sum - 12) + " week(s) past the 12-week deadline (orange bars). Take time from Build first." : (12 - sum) + " week(s) are unassigned. Put them where the risk is, usually Harden or Pilot.");
        if (w.Discover < 1) f.push("No discovery: you will build to the customer's first guess and have no baseline to prove improvement.");
        else if (w.Discover === 1) f.push("One week of discovery is tight. Start data access requests on day one; they are often the critical path.");
        if (w.Design === 0) f.push("No design week: agree success criteria in writing before building, or 'done' will keep moving.");
        if (w.Build > 6) f.push("Build takes " + w.Build + " weeks, over half the engagement. Long builds usually hide scope creep; ship a thin slice earlier.");
        if (w.Build < 2) f.push("Under 2 weeks of build is rarely enough for a prototype on real data.");
        if (w.Pilot === 0) f.push("No pilot: you will go live without evidence from real users, and the renewal conversation has no numbers.");
        if (w.Harden === 0) f.push("No hardening: the demo becomes production with no monitoring, security review or error handling. This is the most common cause of week-13 incidents.");
        if (w.Handoff === 0) f.push("No handoff: when you leave, nobody on the customer side can run or fix the system.");
        if (!f.length) f.push("No red flags. Every phase has time and the plan fits in 12 weeks.");
        clear(flags);
        f.forEach(function (t) { flags.appendChild(el("li", { text: t })); });
        var issues = f[0].indexOf("No red flags") === 0 ? 0 : f.length;
        var live = w.Discover + w.Design + w.Build + w.Pilot;
        mean.set(issues === 0
          ? "Real users start in week " + (w.Discover + w.Design + w.Build + 1) + " and you have " + (w.Harden + w.Handoff) + " weeks to make it safe and hand it over. That is a plan a sponsor can trust."
          : "This plan has " + issues + " issue" + (issues > 1 ? "s" : "") + ". Real users would first touch the system in week " + Math.min(live - w.Pilot + 1, 13) + ", leaving " + Math.max(0, 12 - live) + " week(s) to harden and hand over.");
      }
      update();
    }
  };

  // =====================================================================
  // interview: STAR story builder
  // =====================================================================
  var interview = {
    title: "STAR story builder",
    intro: "Write one interview story in four parts. Word counts turn orange outside the target range, and the checklist tells you whether it would land in a real interview. The example starts deliberately weak: try fixing it.",
    render: function (host) {
      var P = "wg-star";
      var wrap = el("div", { cls: P + "-wrap" });
      var upd = function () { update(); };
      var parts = [
        { k: "S", name: "Situation", min: 25, max: 60, hint: "Where, who, what was at stake. 2-3 sentences.", v: "At a regional insurer, claims handlers were taking over four hours to triage each new motor claim, and the backlog doubled on Mondays." },
        { k: "T", name: "Task", min: 15, max: 40, hint: "What you specifically were responsible for.", v: "We were asked to use AI to speed up triage within one quarter." },
        { k: "A", name: "Action", min: 70, max: 150, hint: "Your steps, in order, with the key decision and why. The longest part.", v: "We interviewed handlers and looked at the data. We built a classifier with an LLM and a review queue. We tested it and rolled it out to one team first, then the rest." },
        { k: "R", name: "Result", min: 25, max: 60, hint: "Measured outcome vs the baseline, plus what you learned.", v: "Triage got a lot faster and the handlers liked it." }
      ];
      var fields = parts.map(function (p) {
        var f = textField(P, { label: p.name + " (" + p.min + "-" + p.max + " words)", value: p.v, multi: true, rows: p.k === "A" ? 5 : 3, hint: p.hint }, upd);
        wrap.appendChild(f.node);
        return f;
      });
      var sT = stat(P, "Total words"), sTime = stat(P, "Spoken at 150 wpm"), sPass = stat(P, "Checks passed");
      var checks = el("ul", { cls: P + "-checks" });
      var mean = meaning(P);
      var preview = el("div", { cls: P + "-preview" });
      wrap.appendChild(el("div", { cls: P + "-stats" }, [sT.node, sTime.node, sPass.node]));
      wrap.appendChild(mean.node);
      wrap.appendChild(el("div", { cls: P + "-h", text: "Checklist" }));
      wrap.appendChild(checks);
      wrap.appendChild(el("div", { cls: P + "-h", text: "Story preview" }));
      wrap.appendChild(preview);
      host.appendChild(wrap);

      function count(re, t) { var m = t.match(re); return m ? m.length : 0; }
      function update() {
        var txt = fields.map(function (f) { return f.get(); });
        var wc = txt.map(words);
        var tot = wc.reduce(function (a, b) { return a + b; }, 0);
        fields.forEach(function (f, i) {
          var p = parts[i], ok = wc[i] >= p.min && wc[i] <= p.max;
          f.count.textContent = wc[i] + " words" + (ok ? "" : wc[i] < p.min ? " (short)" : " (long)");
          f.count.className = P + "-val" + (ok ? "" : " " + P + "-warn");
        });
        var secs = Math.round(tot / 150 * 60);
        sT.set(String(tot));
        sTime.set(Math.floor(secs / 60) + ":" + String(secs % 60).padStart(2, "0"));
        var act = txt[2];
        var iCount = count(/\b(I|I'm|I've|I'd|my|me)\b/g, act), weCount = count(/\b(we|we're|we've|our|us)\b/gi, act);
        var list = [
          [/\d/.test(txt[3]), "Result has a number", "Add a measured outcome, e.g. '4.1 hours to 25 minutes'."],
          [/\d/.test(txt[0] + txt[3]) && /(from|baseline|before|to|down|up|%|percent)/i.test(txt[3]), "Result is compared with a starting point", "Say what it was before, so the change is clear."],
          [iCount > weCount, "Action says \"I\" more than \"we\" (" + iCount + " vs " + weCount + ")", "Interviewers score what you did. Use \"I\" for your own steps."],
          [wc[2] >= Math.max(wc[0], wc[1], wc[3]), "Action is the longest part", "Cut the setup and spend the words on what you did."],
          [secs <= 120, "Under 2 minutes spoken", "Trim to about 300 words; the interviewer will ask follow-ups."],
          [secs >= 45, "Long enough to show depth (45 s+)", "Add the key decision you made and why."],
          [/\b(because|so that|decided|chose|trade-?off|instead)\b/i.test(act), "Action explains a decision", "Name one choice and its reason, e.g. 'I chose X instead of Y because...'."]
        ];
        clear(checks);
        var pass = 0;
        list.forEach(function (c) {
          if (c[0]) pass++;
          checks.appendChild(el("li", { cls: c[0] ? P + "-ok" : P + "-no" }, [
            el("span", { cls: P + "-mark", text: c[0] ? "✓" : "✗", "aria-label": c[0] ? "pass" : "fail" }),
            el("span", {}, [el("strong", { text: c[1] }), c[0] ? null : el("span", { cls: P + "-fix", text: " " + c[2] })])
          ]));
        });
        sPass.set(pass + " / " + list.length);
        var firstFail = list.filter(function (c) { return !c[0]; })[0];
        mean.set(pass === list.length ? "This story would hold up: it is short enough to tell in " + Math.floor(secs / 60) + ":" + String(secs % 60).padStart(2, "0") + ", shows your own decisions and ends on a number." : "Passes " + pass + " of " + list.length + " checks. Fix first: " + firstFail[1].replace(/ \(.*\)$/, "") + ". " + firstFail[2]);
        clear(preview);
        parts.forEach(function (p, i) {
          if (!txt[i].trim()) return;
          preview.appendChild(el("p", {}, [el("strong", { text: p.name + ". " }), el("span", { text: txt[i].trim() })]));
        });
        if (!preview.firstChild) preview.appendChild(el("p", { cls: P + "-note", text: "Start typing to see your story." }));
      }
      update();
    }
  };

  // =====================================================================
  // exec: executive update builder
  // =====================================================================
  var exec = {
    title: "Executive update builder",
    intro: "Fill in the fields and read the five-line preview an executive would actually see. Warnings appear when it gets too long, the status and risks disagree, or there is no clear ask.",
    render: function (host) {
      var P = "wg-exec";
      var wrap = el("div", { cls: P + "-wrap" });
      var upd = function () { update(); };
      var status = "amber";
      var statusBox = el("div", { cls: P + "-status", role: "group", "aria-label": "Headline status" });
      var sBtns = {};
      ["green", "amber", "red"].forEach(function (s) {
        var b = el("button", { type: "button", cls: P + "-btn " + P + "-s-" + s, text: s.charAt(0).toUpperCase() + s.slice(1) });
        b.addEventListener("click", function () { status = s; update(); });
        sBtns[s] = b; statusBox.appendChild(b);
      });
      var head = textField(P, { label: "Headline (one sentence, answer first)", value: "Claims triage pilot on track for go-live 14 Oct; one data risk." }, upd);
      var out = textField(P, { label: "Outcomes this week", multi: true, value: "Pilot live with 12 handlers\nEval accuracy reviewed with claims lead" }, upd);
      var met = textField(P, { label: "Metrics", multi: true, value: "Median triage time 4.1h to 0.6h\n91% of triage suggestions accepted" }, upd);
      var risk = textField(P, { label: "Risks", multi: true, value: "Policy database access expires 30 Sep, which would stop the pilot" }, upd);
      var ask = textField(P, { label: "Asks (decision, who, by when)", multi: true, value: "" , placeholder: "e.g. Approve extending policy DB access to 31 Dec by Friday" }, upd);
      wrap.appendChild(el("div", { cls: P + "-field" }, [el("span", { cls: P + "-lab", text: "Headline status" }), statusBox]));
      [head, out, met, risk, ask].forEach(function (f) { wrap.appendChild(f.node); });
      var preview = el("div", { cls: P + "-preview", "aria-live": "polite" });
      var warns = el("ul", { cls: P + "-list " + P + "-warns" });
      var sW = stat(P, "Words"), sL = stat(P, "Read time");
      var mean = meaning(P);
      wrap.appendChild(el("div", { cls: P + "-h", text: "5-line preview" }));
      wrap.appendChild(preview);
      wrap.appendChild(el("div", { cls: P + "-stats" }, [sW.node, sL.node]));
      wrap.appendChild(mean.node);
      wrap.appendChild(warns);
      host.appendChild(wrap);

      function join(t) { return t.split(/\n+/).map(function (s) { return s.trim().replace(/^[-*•]\s*/, ""); }).filter(Boolean).join("; "); }
      function update() {
        Object.keys(sBtns).forEach(function (k) { sBtns[k].setAttribute("aria-pressed", k === status ? "true" : "false"); });
        var lines = [
          ["Status", status.toUpperCase() + ": " + (head.get().trim() || "(no headline)")],
          ["Done", join(out.get()) || "(nothing listed)"],
          ["Metrics", join(met.get()) || "(no metrics)"],
          ["Risk", join(risk.get()) || "None"],
          ["Ask", join(ask.get()) || "(no ask)"]
        ];
        clear(preview);
        lines.forEach(function (l, i) {
          var row = el("div", { cls: P + "-line" }, [el("span", { cls: P + "-tag", text: l[0] }), el("span", { text: l[1] })]);
          if (i === 0) row.insertBefore(el("span", { cls: P + "-dot " + P + "-d-" + status, "aria-hidden": "true" }), row.childNodes[1]);
          preview.appendChild(row);
        });
        var tw = words(lines.map(function (l) { return l[1]; }).join(" "));
        sW.set(String(tw));
        sL.set(Math.max(5, Math.round(tw / 230 * 60)) + " s");
        var w = [];
        if (tw > 110) w.push("Too long: " + tw + " words. Aim for under 110 so it reads in about 30 seconds on a phone.");
        lines.forEach(function (l) { var n = words(l[1]); if (n > 30) w.push(l[0] + " line is " + n + " words. Keep each line under 30; move detail to an appendix."); });
        var askT = ask.get().trim();
        if (!askT) w.push("No ask. Every update should end with one decision you need, or say 'No ask this week'.");
        else if (!/no ask/i.test(askT)) {
          if (!/\b(approve|decide|confirm|agree|sign|choose|assign|release|grant|extend|fund|join|review|attend|introduce|escalate)\b/i.test(askT)) w.push("The ask has no clear decision verb. Start with what you need them to do: approve, confirm, decide...");
          if (!/\b(by|before|on|mon|tue|wed|thu|fri|today|tomorrow|this week|next week|eod|\d)/i.test(askT)) w.push("The ask has no deadline. Add 'by Friday' or a date.");
        }
        if (!/\d/.test(met.get())) w.push("Metrics have no numbers. Executives trust 'from 4.1h to 0.6h' more than 'much faster'.");
        if ((status === "amber" || status === "red") && !risk.get().trim()) w.push(status.toUpperCase() + " status with no risk listed. Say what is wrong and what you are doing about it.");
        if (status === "green" && /\b(block|blocked|stop|delay|late|miss|outage|breach)\b/i.test(risk.get())) w.push("Status is GREEN but a risk mentions a blocker or delay. Consider AMBER; surprises later cost more trust.");
        if (words(head.get()) > 20) w.push("Headline is over 20 words. Give the answer first in one short sentence.");
        clear(warns);
        w.forEach(function (t) { warns.appendChild(el("li", { text: t })); });
        mean.set(w.length ? w.length + " thing" + (w.length > 1 ? "s" : "") + " to fix before sending. An executive reads the first line and the ask; make both impossible to misread." : "Ready to send: " + tw + " words, about " + Math.max(5, Math.round(tw / 230 * 60)) + " seconds to read, and it ends with a clear decision.");
      }
      update();
    }
  };

  // =====================================================================
  // discovery: question sorter
  // =====================================================================
  var discovery = {
    title: "Discovery question sorter",
    intro: "Sort each customer question into the bucket it mainly tells you about. You get instant feedback and the reason, and a score at the end. A good interview guide covers all five buckets.",
    render: function (host) {
      var P = "wg-disc";
      var B = ["Business goal", "Current process", "Data", "Constraints", "Success metric"];
      var Q = [
        ["What would change for the business if claims were triaged in minutes instead of hours?", 0, "It asks why the project matters to the business, the outcome leaders are paying for."],
        ["Walk me through the last claim you handled, step by step.", 1, "It asks how work happens today, in the order it happens."],
        ["Where are claim documents stored, and in what format?", 2, "It is about where the information lives and what shape it is in."],
        ["Are there rules about which data can leave your network or be sent to an external AI provider?", 3, "Rules that limit what you may build are constraints, here data residency and privacy."],
        ["How will we know in three months that this project worked?", 4, "It asks for the measure of success, agreed up front."],
        ["Which step makes you wait for someone else?", 1, "Waiting points are part of the current workflow; they often reveal the real bottleneck."],
        ["How many claims do you receive per month, and how far back does the history go?", 2, "Volume and history tell you how much data exists for building and evaluating."],
        ["Is this project tied to a target in this year's company plan?", 0, "It links the work to a strategic goal and shows who cares about it."],
        ["What is the current average handling time, and where does that number come from?", 4, "This establishes the baseline that success will be measured against."],
        ["What budget and deadline are we working within?", 3, "Money and time are hard limits on the solution: constraints."],
        ["What tools, screens or spreadsheets do you use during a typical day?", 1, "It maps the tools in today's process, including workarounds."],
        ["How often are claim labels or categories wrong or missing in the system?", 2, "It is about data quality, which decides whether labels can be trusted for training or evaluation."],
        ["Who needs to approve a new system before it can go live?", 3, "Approval gates (security, legal, change boards) constrain your timeline and design."],
        ["If this works, what would you do with the time saved?", 0, "It reveals the business value behind the request: capacity, cost or customer experience."],
        ["What error rate would be acceptable for automatically routed claims?", 4, "It defines a measurable threshold the solution must meet."],
        ["Does the system have to run on your existing on-premise servers?", 3, "An infrastructure requirement limits which designs are possible."]
      ];
      var answers = Q.map(function () { return null; });
      var idx = 0;
      var wrap = el("div", { cls: P + "-wrap" });
      var prog = el("div", { cls: P + "-prog" });
      var card = el("div", { cls: P + "-card" });
      var mean = meaning(P);
      var sS = stat(P, "Score"), sA = stat(P, "Answered");
      var review = el("ol", { cls: P + "-review" });
      var resetB = el("button", { type: "button", cls: P + "-btn", text: "Start over" });
      resetB.addEventListener("click", function () { answers = Q.map(function () { return null; }); idx = 0; update(); });
      wrap.appendChild(prog);
      wrap.appendChild(card);
      wrap.appendChild(el("div", { cls: P + "-stats" }, [sS.node, sA.node]));
      wrap.appendChild(mean.node);
      wrap.appendChild(el("div", { cls: P + "-bar" }, [el("div", { cls: P + "-h", text: "Your answers" }), resetB]));
      wrap.appendChild(review);
      host.appendChild(wrap);

      function update() {
        var done = answers.filter(function (a) { return a != null; }).length;
        var right = answers.filter(function (a, i) { return a === Q[i][1]; }).length;
        sS.set(right + " / " + done);
        sA.set(done + " of " + Q.length);
        // progress dots
        clear(prog);
        Q.forEach(function (q, i) {
          var a = answers[i];
          var d = el("button", { type: "button", cls: P + "-pdot" + (i === idx ? " " + P + "-cur" : "") + (a == null ? "" : a === q[1] ? " " + P + "-right" : " " + P + "-wrong"), text: String(i + 1) });
          d.setAttribute("aria-label", "Question " + (i + 1) + (a == null ? ", not answered" : a === q[1] ? ", correct" : ", wrong"));
          d.addEventListener("click", function () { idx = i; update(); });
          prog.appendChild(d);
        });
        // card
        clear(card);
        var q = Q[idx], a = answers[idx];
        card.appendChild(el("div", { cls: P + "-qn", text: "Question " + (idx + 1) + " of " + Q.length }));
        card.appendChild(el("p", { cls: P + "-q", text: "“" + q[0] + "”" }));
        var btns = el("div", { cls: P + "-buckets" });
        B.forEach(function (b, bi) {
          var cls = P + "-btn " + P + "-bucket";
          if (a != null && bi === q[1]) cls += " " + P + "-isright";
          else if (a === bi) cls += " " + P + "-iswrong";
          var btn = el("button", { type: "button", cls: cls, text: b });
          if (a != null) btn.disabled = true;
          btn.addEventListener("click", function () { answers[idx] = bi; update(); });
          btns.appendChild(btn);
        });
        card.appendChild(btns);
        if (a != null) {
          card.appendChild(el("p", { cls: P + "-fb " + (a === q[1] ? P + "-fbok" : P + "-fbno") }, [
            el("strong", { text: a === q[1] ? "Correct. " : "Not quite: this is " + B[q[1]] + ". " }),
            el("span", { text: q[2] })
          ]));
          var nextI = answers.indexOf(null);
          if (nextI !== -1) {
            var nb = el("button", { type: "button", cls: P + "-btn " + P + "-btn-primary", text: "Next question" });
            nb.addEventListener("click", function () { idx = nextI; update(); });
            card.appendChild(nb);
          }
        }
        // meaning
        if (done === 0) mean.set("Pick a bucket. Ask yourself: if the customer answers this, what do I learn?");
        else if (done < Q.length) mean.set("You have " + right + " of " + done + " right so far. " + (right / done >= 0.75 ? "You can tell what each question is really for." : "Mixed-up buckets usually mean gaps in an interview guide, for example no baseline or no constraints."));
        else {
          var miss = {}; answers.forEach(function (x, i) { if (x !== Q[i][1]) miss[B[Q[i][1]]] = (miss[B[Q[i][1]]] || 0) + 1; });
          var worst = Object.keys(miss).sort(function (x, y) { return miss[y] - miss[x]; })[0];
          mean.set("Final score " + right + " / " + Q.length + " (" + Math.round(right / Q.length * 100) + "%). " + (worst ? "Most misses were " + worst + " questions; practise writing two of those for your next guide." : "Perfect: you could write a balanced interview guide from scratch."));
        }
        // review list
        clear(review);
        answers.forEach(function (x, i) {
          if (x == null) return;
          review.appendChild(el("li", { value: i + 1, cls: x === Q[i][1] ? P + "-right" : P + "-wrong" }, [
            el("span", { cls: P + "-rq", text: Q[i][0] }),
            el("span", { cls: P + "-rr", text: (x === Q[i][1] ? "✓ " + B[x] : "✗ You said " + B[x] + "; it is " + B[Q[i][1]]) + ". " + Q[i][2] })
          ]));
        });
        if (!review.firstChild) review.appendChild(el("li", { cls: P + "-note", text: "Nothing answered yet." }));
      }
      update();
    }
  };

  Object.assign(WIDGETS, { slg: slg, roi: roi, sysdesign: sysdesign, pm: pm, arc: arc, interview: interview, exec: exec, discovery: discovery });

  WIDGET_CSS += ["wg-slg", "wg-roi", "wg-sys", "wg-pm", "wg-arc", "wg-star", "wg-exec", "wg-disc"].map(baseCss).join("") + `
.wg-sys-recs{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:8px;font-size:14px}
.wg-pm-add{display:grid;grid-template-columns:minmax(0,1fr) 90px 90px auto;gap:10px;align-items:end}
.wg-pm-top{display:grid;grid-template-columns:minmax(0,360px) minmax(0,1fr);gap:16px;align-items:start}
.wg-pm-legend{display:flex;flex-direction:column;gap:6px}
.wg-pm-rows{display:flex;flex-direction:column;gap:10px}
.wg-pm-row{border:1px solid var(--line);border-radius:8px;padding:10px;background:var(--surface);display:flex;flex-direction:column;gap:8px}
.wg-pm-rowhead{display:flex;align-items:center;gap:10px}
.wg-pm-title{flex:1;min-width:0;font-weight:600;font-size:14px;overflow-wrap:anywhere}
.wg-pm-id{font-family:var(--mono);color:var(--muted);margin-right:6px}
.wg-pm-score{font-family:var(--mono);font-weight:700;min-width:34px;text-align:center;padding:3px 6px;border-radius:6px;border:1px solid var(--line-strong)}
.wg-pm-high{background:color-mix(in srgb,var(--packet) 65%,var(--ink));color:var(--surface);border-color:color-mix(in srgb,var(--packet) 65%,var(--ink))}
.wg-pm-med{background:color-mix(in srgb,var(--packet) 35%,var(--surface))}
.wg-pm-low{background:var(--code-bg)}
.wg-pm-rowgrid{display:grid;grid-template-columns:80px 80px minmax(0,1fr) minmax(0,2fr);gap:8px}
.wg-pm-flag{font-size:12px;color:color-mix(in srgb,var(--packet) 65%,var(--ink));font-weight:600}
.wg-pm-flag:empty{display:none}
@media (max-width:640px){
 .wg-pm-add{grid-template-columns:1fr 1fr}
 .wg-pm-add>.wg-pm-field:first-child{grid-column:1/-1}
 .wg-pm-add>button{grid-column:1/-1}
 .wg-pm-top{grid-template-columns:1fr}
 .wg-pm-rowgrid{grid-template-columns:1fr 1fr}
 .wg-pm-rowgrid>.wg-pm-field:nth-child(n+3){grid-column:1/-1}
}
.wg-arc-chart svg{max-width:600px;margin:0 auto}
.wg-arc-phases{display:flex;flex-direction:column;gap:6px}
.wg-arc-phase{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:6px 10px;border:1px solid var(--line);border-radius:8px;background:var(--surface)}
.wg-arc-pname{display:flex;flex-direction:column;min-width:0;font-size:14px}
.wg-arc-ctl{display:flex;align-items:center;gap:6px;flex-shrink:0}
.wg-arc-pm{width:34px;height:34px;padding:0;font-size:18px;line-height:1}
.wg-arc-count{font-family:var(--mono);min-width:44px;text-align:center;font-weight:600}
.wg-arc-bar{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px}
.wg-arc-total{font-family:var(--mono);font-weight:600;color:var(--accent)}
.wg-arc-bad{color:color-mix(in srgb,var(--packet) 65%,var(--ink))}
.wg-star-warn{color:color-mix(in srgb,var(--packet) 65%,var(--ink))}
.wg-star-checks{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px;font-size:14px}
.wg-star-checks li{display:flex;gap:8px;align-items:baseline}
.wg-star-mark{font-family:var(--mono);font-weight:700;width:16px;flex-shrink:0}
.wg-star-ok .wg-star-mark{color:var(--accent)}
.wg-star-no .wg-star-mark{color:color-mix(in srgb,var(--packet) 65%,var(--ink))}
.wg-star-fix{color:var(--muted);font-weight:400}
.wg-star-preview{background:var(--code-bg);border:1px solid var(--line);border-radius:8px;padding:10px 14px;font-size:14px}
.wg-star-preview p{margin:0 0 8px}
.wg-star-preview p:last-child{margin:0}
.wg-exec-lab{font-size:14px}
.wg-exec-status{display:flex;gap:8px;flex-wrap:wrap}
.wg-exec-status .wg-exec-btn[aria-pressed=true]{background:var(--accent);color:var(--accent-ink);border-color:var(--accent);font-weight:600}
.wg-exec-preview{background:var(--code-bg);border:1px solid var(--line);border-radius:8px;padding:10px 14px;display:flex;flex-direction:column;gap:6px;font-size:14px}
.wg-exec-line{display:flex;gap:8px;align-items:baseline;overflow-wrap:anywhere}
.wg-exec-tag{font-family:var(--mono);font-size:12px;color:var(--muted);min-width:58px;flex-shrink:0}
.wg-exec-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;align-self:center}
.wg-exec-d-green{background:var(--accent)}
.wg-exec-d-amber{background:var(--packet)}
.wg-exec-d-red{background:var(--ink)}
.wg-exec-warns{color:var(--ink)}
.wg-exec-warns li::marker{color:var(--packet)}
.wg-exec-warns:empty{display:none}
.wg-disc-prog{display:flex;flex-wrap:wrap;gap:4px}
.wg-disc-pdot{width:28px;height:28px;border-radius:50%;border:1px solid var(--line-strong);background:var(--surface);color:var(--muted);font-family:var(--mono);font-size:11px;cursor:pointer;padding:0}
.wg-disc-pdot.wg-disc-right{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}
.wg-disc-pdot.wg-disc-wrong{background:color-mix(in srgb,var(--packet) 65%,var(--ink));color:var(--surface);border-color:color-mix(in srgb,var(--packet) 65%,var(--ink))}
.wg-disc-pdot.wg-disc-cur{outline:2px solid var(--ink);outline-offset:1px}
.wg-disc-card{border:1px solid var(--line-strong);border-radius:10px;padding:14px;background:var(--surface);display:flex;flex-direction:column;gap:10px}
.wg-disc-qn{font-size:12px;color:var(--muted);font-family:var(--mono)}
.wg-disc-q{margin:0;font-size:17px;font-weight:600;line-height:1.4}
.wg-disc-buckets{display:flex;flex-wrap:wrap;gap:8px}
.wg-disc-bucket:disabled{cursor:default;color:var(--muted);border-style:dashed;opacity:1}
.wg-disc-bucket.wg-disc-isright{opacity:1;background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}
.wg-disc-bucket.wg-disc-iswrong{opacity:1;background:color-mix(in srgb,var(--packet) 65%,var(--ink));color:var(--surface);border-color:color-mix(in srgb,var(--packet) 65%,var(--ink))}
.wg-disc-fb{margin:0;font-size:14px;padding:8px 10px;border-radius:6px;background:var(--accent-soft)}
.wg-disc-fbno{background:var(--hl)}
.wg-disc-card>.wg-disc-btn-primary{align-self:flex-start}
.wg-disc-bar{display:flex;justify-content:space-between;align-items:center;gap:8px}
.wg-disc-review{margin:0;padding-left:22px;display:flex;flex-direction:column;gap:8px;font-size:13px}
.wg-disc-review li span{display:block}
.wg-disc-rq{font-weight:600}
.wg-disc-rr{color:var(--muted)}
.wg-disc-review li.wg-disc-wrong::marker{color:var(--packet)}
`;
})();
