(function () {
  "use strict";
  var SVGNS = "http://www.w3.org/2000/svg";

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
    var f = el("div", { cls: P + "-field" }, [el("label", { for: id }, [el("span", { text: o.label }), val]), inp]);
    if (o.hint) f.appendChild(el("span", { cls: P + "-hint", text: o.hint }));
    return { node: f, input: inp, get: function () { return Number(inp.value); } };
  }

  // Small seeded random generator so a render's samples are stable until "Sample again".
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

  // Toy next-token distributions (probabilities at temperature 1). Invented for teaching.
  var PROMPTS = [
    { key: "refund", label: "Support reply: \"Your refund will arrive within ...\"",
      tokens: [["5", 0.34], ["3", 0.20], ["7", 0.12], ["two", 0.10], ["10", 0.08], ["a few", 0.07], ["24", 0.05], ["banana", 0.04]],
      after: " business days." },
    { key: "name", label: "Brainstorm: \"A name for our new coffee blend is ...\"",
      tokens: [["Morning", 0.18], ["Velvet", 0.15], ["Ember", 0.13], ["Summit", 0.12], ["Harbor", 0.11], ["Nimbus", 0.10], ["Copper", 0.09], ["Wildfire", 0.07], ["Quasar", 0.05]],
      after: " Roast" },
    { key: "json", label: "Extraction: {\"currency\": \"...",
      tokens: [["EUR", 0.90], ["USD", 0.04], ["eur", 0.02], ["GBP", 0.015], ["Euro", 0.012], ["EU", 0.008], ["E", 0.005]],
      after: "\"}" }
  ];

  // Apply temperature then top_p (nucleus). Returns rows sorted by original probability.
  function distribution(tokens, temp, topP) {
    var rows = tokens.map(function (t) { return { tok: t[0], p1: t[1], logit: Math.log(t[1]) }; });
    rows.sort(function (a, b) { return b.p1 - a.p1; });
    var i;
    if (temp <= 0.001) {
      rows.forEach(function (r, j) { r.pt = j === 0 ? 1 : 0; });
    } else {
      var mx = rows[0].logit / temp, sum = 0;
      rows.forEach(function (r) { r.e = Math.exp(r.logit / temp - mx); sum += r.e; });
      rows.forEach(function (r) { r.pt = r.e / sum; });
    }
    // nucleus: smallest top set whose probability reaches top_p (always keep the top token)
    var order = rows.slice().sort(function (a, b) { return b.pt - a.pt; });
    var cum = 0;
    for (i = 0; i < order.length; i++) {
      order[i].inPool = cum < topP - 1e-9 || i === 0;
      if (order[i].inPool) cum += order[i].pt;
    }
    var poolSum = 0;
    rows.forEach(function (r) { if (r.inPool) poolSum += r.pt; });
    rows.forEach(function (r) { r.pf = r.inPool ? r.pt / poolSum : 0; });
    return rows;
  }

  function pct(v) {
    if (v === 0) return "0%";
    if (v < 0.001) return "<0.1%";
    if (v < 0.1) return (v * 100).toFixed(1) + "%";
    return Math.round(v * 100) + "%";
  }

  var llmapi = {
    title: "Sampling playground: temperature and top_p",
    intro: "Pick a prompt, then move the temperature and top_p sliders. Watch which next tokens stay in the candidate pool, how likely each one is, and how varied 20 sampled answers become.",
    render: function (host) {
      var P = "wg-samp";
      var seed = 20240611;
      var wrap = el("div", { cls: P + "-wrap" });

      var selId = nid(P);
      var sel = el("select", { id: selId });
      PROMPTS.forEach(function (p, i) { sel.appendChild(el("option", { value: String(i), text: p.label })); });
      sel.addEventListener("change", update);
      var selField = el("div", { cls: P + "-field" }, [el("label", { for: selId }, [el("span", { text: "Prompt (toy example)" })]), sel]);

      var temp = slider(P, { label: "Temperature", min: 0, max: 2, step: 0.05, value: 1,
        fmt: function (v) { return v.toFixed(2); },
        hint: "0 = always the top token. Anthropic accepts 0 to 1; some providers allow up to 2." }, update);
      var topp = slider(P, { label: "top_p", min: 0.05, max: 1, step: 0.05, value: 1,
        fmt: function (v) { return v.toFixed(2); },
        hint: "Keep only the top tokens whose chances add up to this share." }, update);

      var btnSample = el("button", { type: "button", cls: P + "-btn " + P + "-btn-primary", text: "Sample 20 again" });
      btnSample.addEventListener("click", function () { seed = (seed * 1103515245 + 12345) >>> 0; update(); });
      var btnReset = el("button", { type: "button", cls: P + "-btn", text: "Reset sliders" });
      btnReset.addEventListener("click", function () {
        temp.input.value = 1; topp.input.value = 1;
        temp.input.dispatchEvent(new Event("input")); topp.input.dispatchEvent(new Event("input"));
      });
      var presets = el("div", { cls: P + "-btns" }, [
        el("span", { cls: P + "-hint", text: "Presets:" }),
        mkPreset("Extraction (0, 1)", 0, 1),
        mkPreset("Balanced (0.7, 0.9)", 0.7, 0.9),
        mkPreset("Creative (1.0, 1.0)", 1, 1)
      ]);
      function mkPreset(label, t, p) {
        var b = el("button", { type: "button", cls: P + "-btn", text: label });
        b.addEventListener("click", function () {
          temp.input.value = t; topp.input.value = p;
          temp.input.dispatchEvent(new Event("input")); topp.input.dispatchEvent(new Event("input"));
        });
        return b;
      }

      var chart = el("div", { cls: P + "-chart" });
      var legend = el("p", { cls: P + "-note" }, [
        el("span", { cls: P + "-key " + P + "-key-in" }), " in the pool (chance after temperature and top_p)   ",
        el("span", { cls: P + "-key " + P + "-key-out" }), " dropped   ",
        el("span", { cls: P + "-key " + P + "-key-tick" }), " chance at temperature 1"
      ]);

      function stat(label) {
        var v = el("div", { cls: P + "-statv" });
        return { node: el("div", { cls: P + "-stat" }, [el("div", { cls: P + "-statl", text: label }), v]), set: function (t) { v.textContent = t; } };
      }
      var sPool = stat("Tokens in pool"), sTop = stat("Top token chance"), sDistinct = stat("Different answers in 20");
      var stats = el("div", { cls: P + "-stats" }, [sPool.node, sTop.node, sDistinct.node]);

      var samplesBox = el("div", { cls: P + "-samples", "aria-live": "polite" });
      var meanText = el("span");
      var mean = el("p", { cls: P + "-mean" }, [el("strong", { text: "What this means: " }), meanText]);

      wrap.appendChild(selField);
      wrap.appendChild(el("div", { cls: P + "-grid" }, [temp.node, topp.node]));
      wrap.appendChild(presets);
      wrap.appendChild(chart);
      wrap.appendChild(legend);
      wrap.appendChild(stats);
      wrap.appendChild(el("div", { cls: P + "-h", text: "20 sampled completions" }));
      wrap.appendChild(samplesBox);
      wrap.appendChild(el("div", { cls: P + "-btns" }, [btnSample, btnReset]));
      wrap.appendChild(mean);
      wrap.appendChild(el("p", { cls: P + "-note", text: "Toy numbers for learning, not from a real model. Real models choose among tens of thousands of tokens at every step. Some newer models do not accept temperature or top_p at all; check the model's documentation." }));
      host.appendChild(wrap);

      function drawChart(rows) {
        var W = 400, rowH = 26, top = 6, H = top + rows.length * rowH + 4;
        var L = 78, R = 350;
        var svg = sv("svg", { viewBox: "0 0 " + W + " " + H, width: "100%", role: "img",
          "aria-label": "Chance of each candidate next token" });
        rows.forEach(function (r, i) {
          var y = top + i * rowH;
          svg.appendChild(sv("text", { x: L - 6, y: y + 16, "text-anchor": "end", "font-size": 12,
            "font-family": "var(--mono)", fill: r.inPool ? "var(--ink)" : "var(--muted)",
            "text-decoration": r.inPool ? "none" : "line-through" }, r.tok));
          svg.appendChild(sv("rect", { x: L, y: y + 4, width: R - L, height: 16, rx: 3, fill: "var(--code-bg)" }));
          var w = Math.max(r.inPool ? 1.5 : 0, (R - L) * r.pf);
          svg.appendChild(sv("rect", { x: L, y: y + 4, width: w, height: 16, rx: 3,
            fill: r.inPool ? "var(--accent)" : "var(--line-strong)" }));
          var tx = L + (R - L) * r.p1;
          svg.appendChild(sv("line", { x1: tx, x2: tx, y1: y + 2, y2: y + 22, stroke: "var(--packet)", "stroke-width": 2 }));
          svg.appendChild(sv("text", { x: W - 4, y: y + 16, "text-anchor": "end", "font-size": 12,
            "font-family": "var(--mono)", fill: r.inPool ? "var(--ink)" : "var(--muted)" }, r.inPool ? pct(r.pf) : "out"));
        });
        clear(chart);
        chart.appendChild(svg);
      }

      function update() {
        var pr = PROMPTS[Number(sel.value)];
        var T = temp.get(), tp = topp.get();
        var rows = distribution(pr.tokens, T, tp);
        drawChart(rows);

        var pool = rows.filter(function (r) { return r.inPool; });
        var best = pool.slice().sort(function (a, b) { return b.pf - a.pf; })[0];
        sPool.set(pool.length + " of " + rows.length);
        sTop.set(pct(best.pf));

        // sample 20 completions from the pool
        var rand = rng(seed + Number(sel.value) * 7919);
        var counts = {}, picks = [];
        for (var k = 0; k < 20; k++) {
          var x = rand(), acc = 0, pick = pool[pool.length - 1];
          for (var j = 0; j < pool.length; j++) { acc += pool[j].pf; if (x < acc) { pick = pool[j]; break; } }
          picks.push(pick.tok);
          counts[pick.tok] = (counts[pick.tok] || 0) + 1;
        }
        var distinct = Object.keys(counts).length;
        sDistinct.set(String(distinct));

        clear(samplesBox);
        var ordered = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; });
        ordered.forEach(function (tok) {
          samplesBox.appendChild(el("span", { cls: P + "-chip" + (tok === best.tok ? " " + P + "-chip-top" : "") }, [
            el("span", { cls: P + "-chipt", text: prText(pr, tok) }),
            el("span", { cls: P + "-chipn", text: "x" + counts[tok] })
          ]));
        });

        var msg;
        var worst = pool[pool.length - 1];
        if (T <= 0.001) {
          msg = "Temperature 0 is greedy decoding: \"" + best.tok + "\" wins every time, so all 20 answers are the same. Good for extraction, useless for brainstorming.";
        } else if (pool.length === 1) {
          msg = "top_p " + tp.toFixed(2) + " is so tight that only \"" + best.tok + "\" survives, so the output is fixed no matter the temperature.";
        } else {
          msg = pool.length + " of " + rows.length + " tokens stay in the pool and \"" + best.tok + "\" is picked about " + pct(best.pf) +
            " of the time, so 20 samples gave " + distinct + " different answer" + (distinct === 1 ? "" : "s") + ".";
          if (worst.p1 <= 0.05 && worst.pf > 0) msg += " Watch out: unlikely tokens such as \"" + worst.tok + "\" can still appear at this setting.";
          else if (pool.length < rows.length && T > 1.2) msg += " High temperature flattens the chances, but top_p " + tp.toFixed(2) + " still cuts off the " + (rows.length - pool.length) + " least likely tokens.";
          else if (pool.length < rows.length) msg += " top_p " + tp.toFixed(2) + " removed the " + (rows.length - pool.length) + " least likely token" + (rows.length - pool.length === 1 ? "" : "s") + ", so the rarest answers cannot appear.";
          else if (T < 0.5) msg += " Low temperature concentrates the chance on the favourite.";
          else if (T > 1.2) msg += " High temperature flattens the chances, so surprising words appear more often.";
        }
        meanText.textContent = msg;
      }
      function prText(pr, tok) { return tok + pr.after; }

      update();
    }
  };

  Object.assign(WIDGETS, { llmapi: llmapi });

  var P = "wg-samp";
  WIDGET_CSS += "\n" +
    "." + P + "-wrap{display:flex;flex-direction:column;gap:12px;font-family:var(--body);color:var(--ink);min-width:0}\n" +
    "." + P + "-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px 20px}\n" +
    "." + P + "-field{display:flex;flex-direction:column;gap:4px;font-size:14px;min-width:0}\n" +
    "." + P + "-field label{display:flex;justify-content:space-between;align-items:baseline;gap:8px;color:var(--ink)}\n" +
    "." + P + "-field input[type=range]{width:100%;accent-color:var(--accent)}\n" +
    "." + P + "-field select{width:100%;max-width:100%;font:inherit;font-size:14px;padding:6px 8px;border:1px solid var(--line-strong);border-radius:6px;background:var(--surface);color:var(--ink)}\n" +
    "." + P + "-val{font-family:var(--mono);font-size:13px;color:var(--accent);white-space:nowrap}\n" +
    "." + P + "-hint{font-size:12px;color:var(--muted)}\n" +
    "." + P + "-btns{display:flex;flex-wrap:wrap;gap:8px;align-items:center}\n" +
    "." + P + "-btn{font:inherit;font-size:13px;padding:6px 12px;border-radius:6px;border:1px solid var(--line-strong);background:var(--surface);color:var(--ink);cursor:pointer}\n" +
    "." + P + "-btn:hover{border-color:var(--accent)}\n" +
    "." + P + "-btn:focus-visible{outline:2px solid var(--accent);outline-offset:2px}\n" +
    "." + P + "-btn-primary{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}\n" +
    "." + P + "-chart{background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:6px}\n" +
    "." + P + "-chart svg{display:block;width:100%;max-width:600px;margin:0 auto;height:auto}\n" +
    "." + P + "-note{font-size:12px;color:var(--muted);margin:0;line-height:1.6}\n" +
    "." + P + "-key{display:inline-block;width:12px;height:10px;border-radius:2px;vertical-align:middle;margin-right:2px}\n" +
    "." + P + "-key-in{background:var(--accent)}\n" +
    "." + P + "-key-out{background:var(--line-strong)}\n" +
    "." + P + "-key-tick{width:3px;background:var(--packet)}\n" +
    "." + P + "-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:10px}\n" +
    "." + P + "-stat{background:var(--accent-soft);border:1px solid var(--line);border-radius:8px;padding:8px 10px}\n" +
    "." + P + "-statl{font-size:12px;color:var(--muted)}\n" +
    "." + P + "-statv{font-family:var(--mono);font-size:19px;font-weight:600;color:var(--ink)}\n" +
    "." + P + "-h{font-size:14px;font-weight:600;margin:4px 0 0}\n" +
    "." + P + "-samples{display:flex;flex-wrap:wrap;gap:6px;min-height:30px}\n" +
    "." + P + "-chip{display:inline-flex;gap:6px;align-items:baseline;padding:4px 8px;border:1px solid var(--line);border-radius:14px;background:var(--code-bg);font-family:var(--mono);font-size:12px;max-width:100%;overflow-wrap:anywhere}\n" +
    "." + P + "-chip-top{border-color:var(--accent)}\n" +
    "." + P + "-chipn{color:var(--muted)}\n" +
    "." + P + "-mean{margin:0;padding:10px 12px;background:var(--hl);border-left:3px solid var(--packet);border-radius:4px;font-size:14px}\n";
})();
