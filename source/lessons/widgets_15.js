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
  function uid() { return "wgw15-" + Math.random().toString(36).slice(2, 10); }
  function fmt(x, d) {
    if (!isFinite(x)) return "n/a";
    return Number(x).toLocaleString("en-US", { maximumFractionDigits: d == null ? 0 : d, minimumFractionDigits: d == null ? 0 : d });
  }
  function slider(label, min, max, step, value, show, onchange) {
    var id = uid();
    var val = h("output", { class: "wg-w15-val", for: id });
    var inp = h("input", { type: "range", id: id, min: min, max: max, step: step, value: value });
    function upd() { val.textContent = show(Number(inp.value)); }
    inp.addEventListener("input", function () { upd(); onchange(); });
    upd();
    var el = h("div", { class: "wg-w15-field" },
      h("label", { class: "wg-w15-lab", for: id }, h("span", null, label), val), inp);
    return { el: el, input: inp, get: function () { return Number(inp.value); }, set: function (v) { inp.value = v; upd(); } };
  }
  function numInput(label, value, step, min, onchange) {
    var id = uid();
    var inp = h("input", { type: "number", id: id, value: value, step: step, min: min, class: "wg-w15-num" });
    inp.addEventListener("input", onchange);
    var el = h("div", { class: "wg-w15-field" }, h("label", { class: "wg-w15-lab", for: id }, h("span", null, label)), inp);
    return { el: el, input: inp, get: function () { var v = parseFloat(inp.value); return isFinite(v) && v >= 0 ? v : 0; } };
  }
  function checkbox(label, checked, onchange) {
    var id = uid();
    var inp = h("input", { type: "checkbox", id: id });
    inp.checked = !!checked;
    inp.addEventListener("change", onchange);
    var el = h("div", { class: "wg-w15-check" }, inp, h("label", { for: id, text: label }));
    return { el: el, input: inp, get: function () { return inp.checked; }, set: function (v) { inp.checked = !!v; } };
  }
  function selectInput(label, options, value, onchange) {
    var id = uid();
    var sel = h("select", { id: id, class: "wg-w15-sel" });
    options.forEach(function (o) {
      var op = h("option", { value: o[0], text: o[1] });
      if (o[0] === value) op.selected = true;
      sel.appendChild(op);
    });
    sel.addEventListener("change", onchange);
    var el = h("div", { class: "wg-w15-field" }, h("label", { class: "wg-w15-lab", for: id }, h("span", null, label)), sel);
    return { el: el, input: sel, get: function () { return sel.value; } };
  }
  function stat(label) {
    var v = h("div", { class: "wg-w15-statv" });
    var sub = h("div", { class: "wg-w15-stats" });
    var el = h("div", { class: "wg-w15-stat" }, h("div", { class: "wg-w15-statl", text: label }), v, sub);
    return { el: el, set: function (a, b, warn) { v.textContent = a; sub.textContent = b || ""; el.classList.toggle("wg-w15-warn", !!warn); } };
  }
  function meaning() {
    var t = h("span");
    var el = h("div", { class: "wg-w15-mean", role: "status" }, h("strong", { text: "What this means: " }), t);
    return { el: el, set: function (x) { t.textContent = x; } };
  }
  function btn(label, onclick, cls) {
    return h("button", { type: "button", class: "wg-w15-btn" + (cls ? " " + cls : ""), onclick: onclick, text: label });
  }

  /* =====================================================================
     AGENTMEMORY: memory stepper
     ===================================================================== */
  var MEM_TURNS = [
    { who: "Customer asks why the March invoice is higher than February", tok: 220 },
    { who: "Customer: 'I'm Lena, I run IT at Harrowgate Clinics'", tok: 180, fact: { text: "User is Lena, IT lead at Harrowgate Clinics", kind: "semantic", key: "who" } },
    { who: "Agent looks up the invoice (tool result: 40 line items)", tok: 760 },
    { who: "Agent explains: 12 new seats were added on 3 March", tok: 300, fact: { text: "On 3 March, 12 seats were added to the account", kind: "episodic", key: "seats" } },
    { who: "Customer: 'Please always email me, never call'", tok: 150, fact: { text: "Prefers email, never phone calls", kind: "semantic", key: "contact" } },
    { who: "Customer asks to remove 4 of the new seats", tok: 190 },
    { who: "Agent calls the seat tool and confirms the change", tok: 420, fact: { text: "Seats reduced by 4 after a billing question", kind: "episodic", key: "seats2" } },
    { who: "Customer asks for a pro-rated credit", tok: 210 },
    { who: "Agent reads the credit policy (tool result: policy text)", tok: 680, fact: { text: "Credits: check the policy tool before promising an amount", kind: "procedural", key: "proc" } },
    { who: "Customer: 'Actually, calls are fine this month'", tok: 140, fact: { text: "Phone calls are fine this month (updates email-only)", kind: "semantic", key: "contact" } },
    { who: "Agent offers a 96 euro credit, customer accepts", tok: 260 },
    { who: "Customer says thanks and closes the chat", tok: 90 }
  ];
  var MEM_SYS = 300;

  function memSimulate(upto, budget, keepN, writeFacts) {
    var kept = [], summarised = [], sumTok = 0, compactions = 0, store = {}, order = [], events = [];
    var over = false;
    for (var i = 0; i < upto; i++) {
      var t = MEM_TURNS[i];
      kept.push(i);
      var ev = [];
      if (writeFacts && t.fact) {
        if (store[t.fact.key]) ev.push("Updated a " + t.fact.kind + " memory instead of adding a duplicate.");
        else { ev.push("Wrote a " + t.fact.kind + " memory to the long-term store."); order.push(t.fact.key); }
        store[t.fact.key] = { text: t.fact.text, kind: t.fact.kind, turn: i + 1 };
      }
      var total = MEM_SYS + sumTok + kept.reduce(function (a, k) { return a + MEM_TURNS[k].tok; }, 0);
      if (total > 0.8 * budget && kept.length > keepN) {
        var moved = 0;
        while (kept.length > keepN) { summarised.push(kept.shift()); moved++; }
        sumTok = Math.min(80 + 35 * summarised.length, 450);
        compactions++;
        ev.push("Compacted: " + moved + " older turn" + (moved > 1 ? "s" : "") + " folded into the running summary.");
      }
      total = MEM_SYS + sumTok + kept.reduce(function (a, k) { return a + MEM_TURNS[k].tok; }, 0);
      over = total > budget;
      events = ev;
    }
    var used = MEM_SYS + sumTok + kept.reduce(function (a, k) { return a + MEM_TURNS[k].tok; }, 0);
    var rawAll = MEM_SYS + MEM_TURNS.slice(0, upto).reduce(function (a, t) { return a + t.tok; }, 0);
    return { kept: kept, summarised: summarised, sumTok: sumTok, compactions: compactions, store: store, order: order,
      used: used, over: over, events: events, rawAll: rawAll };
  }

  function renderMemory(host) {
    var step = 1;
    var wrap = h("div", { class: "wg-w15-wrap" });
    host.appendChild(wrap);
    var budget = slider("Thread token budget", 1200, 4000, 100, 2000, function (v) { return fmt(v) + " tokens"; }, update);
    var keepN = slider("Recent turns kept word for word", 1, 6, 1, 3, function (v) { return v + " turns"; }, update);
    var write = checkbox("Write lasting facts to the long-term store", true, update);
    wrap.appendChild(h("div", { class: "wg-w15-grid" }, budget.el, keepN.el, write.el));

    var label = h("div", { class: "wg-w15-steplab", "aria-live": "polite" });
    var back = btn("Back", function () { if (step > 1) { step--; update(); } });
    var next = btn("Next turn", function () { if (step < MEM_TURNS.length) { step++; update(); } }, "wg-w15-primary");
    var reset = btn("Start over", function () { step = 1; update(); });
    wrap.appendChild(h("div", { class: "wg-w15-row" }, back, next, reset, label));

    var stTok = stat("Tokens sent this turn"), stCmp = stat("Compactions so far"), stRaw = stat("Without compaction"), stMem = stat("Long-term memories");
    wrap.appendChild(h("div", { class: "wg-w15-stats4" }, stTok.el, stCmp.el, stRaw.el, stMem.el));

    var svgBox = h("div", { class: "wg-w15-panel" });
    wrap.appendChild(svgBox);
    var evBox = h("div", { class: "wg-mem-events", "aria-live": "polite" });
    wrap.appendChild(evBox);

    var cols = h("div", { class: "wg-mem-cols" });
    var threadList = h("ol", { class: "wg-mem-list" });
    var storeList = h("ul", { class: "wg-mem-store" });
    cols.appendChild(h("div", { class: "wg-w15-panel" }, h("div", { class: "wg-w15-cap", text: "The thread (short-term memory)" }), threadList));
    cols.appendChild(h("div", { class: "wg-w15-panel" }, h("div", { class: "wg-w15-cap", text: "Long-term store (survives this chat)" }), storeList));
    wrap.appendChild(cols);
    var mean = meaning();
    wrap.appendChild(mean.el);

    function drawBar(r, B) {
      clear(svgBox);
      var W = 640, H = 70, x0 = 10, w = W - 20;
      var scale = w / Math.max(B, r.used);
      var svg = s("svg", { viewBox: "0 0 " + W + " " + H, class: "wg-w15-svg", role: "img",
        "aria-label": "Token use: " + r.used + " of " + B + " tokens" });
      svg.appendChild(s("rect", { x: x0, y: 12, width: B * scale, height: 26, rx: 4, fill: "var(--code-bg)", stroke: "var(--line-strong)" }));
      var x = x0;
      var parts = [["System", MEM_SYS, "var(--line-strong)"], ["Summary", r.sumTok, "var(--packet)"],
        ["Recent turns", r.used - MEM_SYS - r.sumTok, "var(--accent)"]];
      parts.forEach(function (p) {
        if (p[1] <= 0) return;
        svg.appendChild(s("rect", { x: x, y: 12, width: p[1] * scale, height: 26, fill: p[2], opacity: 0.9 }));
        x += p[1] * scale;
      });
      var tx = x0 + 0.8 * B * scale;
      svg.appendChild(s("line", { x1: tx, x2: tx, y1: 6, y2: 44, stroke: "var(--ink)", "stroke-dasharray": "3 3" }));
      svg.appendChild(s("text", { x: tx, y: 60, "text-anchor": "middle", class: "wg-w15-svgt", text: "80% compaction line" }));
      svgBox.appendChild(svg);
      svgBox.appendChild(h("div", { class: "wg-w15-legend" },
        h("span", null, h("i", { class: "wg-mem-sw wg-mem-sys" }), "System prompt " + MEM_SYS),
        h("span", null, h("i", { class: "wg-mem-sw wg-mem-sum" }), "Summary " + r.sumTok),
        h("span", null, h("i", { class: "wg-mem-sw wg-mem-rec" }), "Recent turns " + (r.used - MEM_SYS - r.sumTok))));
    }

    function update() {
      var B = budget.get(), K = keepN.get();
      var r = memSimulate(step, B, K, write.get());
      label.textContent = "Turn " + step + " of " + MEM_TURNS.length;
      back.disabled = step <= 1; next.disabled = step >= MEM_TURNS.length;
      stTok.set(fmt(r.used), Math.round(100 * r.used / B) + "% of budget", r.over);
      stCmp.set(String(r.compactions), r.summarised.length + " turns in summary");
      stRaw.set(fmt(r.rawAll), "tokens if nothing was compacted", r.rawAll > B);
      stMem.set(String(r.order.length), write.get() ? "facts, preferences, lessons" : "writing is off");
      drawBar(r, B);

      clear(evBox);
      var t = MEM_TURNS[step - 1];
      evBox.appendChild(h("p", null, h("strong", { text: "This turn: " }), t.who + " (" + t.tok + " tokens)."));
      r.events.forEach(function (e) { evBox.appendChild(h("p", { class: "wg-mem-ev", text: e })); });
      if (r.over) evBox.appendChild(h("p", { class: "wg-mem-bad", text: "Over budget even after compaction: the recent turns alone are too big. Keep fewer turns or trim tool results." }));

      clear(threadList);
      if (r.summarised.length) threadList.appendChild(h("li", { class: "wg-mem-sumrow" },
        "Summary of turns " + (r.summarised[0] + 1) + " to " + (r.summarised[r.summarised.length - 1] + 1) + " (" + r.sumTok + " tokens)"));
      r.kept.forEach(function (k) {
        threadList.appendChild(h("li", { class: k === step - 1 ? "wg-mem-now" : "" }, "Turn " + (k + 1) + ": " + MEM_TURNS[k].who + " (" + MEM_TURNS[k].tok + ")"));
      });

      clear(storeList);
      if (!r.order.length) storeList.appendChild(h("li", { class: "wg-w15-note", text: write.get() ? "Nothing worth keeping yet." : "Long-term writing is turned off." }));
      r.order.forEach(function (key) {
        var m = r.store[key];
        storeList.appendChild(h("li", null, h("span", { class: "wg-mem-kind", text: m.kind }), " " + m.text + " (turn " + m.turn + ")"));
      });

      var msg;
      if (r.over) msg = "The last " + K + " turns do not fit in " + fmt(B) + " tokens, so the model would lose context or the call would fail. Keep fewer turns word for word or shorten tool results.";
      else if (r.compactions === 0) msg = "So far the whole thread fits (" + fmt(r.used) + " of " + fmt(B) + " tokens). Keep stepping: tool results fill the budget fast.";
      else msg = "Compaction keeps this turn at " + fmt(r.used) + " tokens instead of " + fmt(r.rawAll) + ". Details from summarised turns survive only if the summary or the long-term store kept them" + (write.get() ? ", which is why lasting facts were written separately." : "; with writing off, they are gone once the chat ends.");
      mean.set(msg);
    }
    update();
  }

  /* =====================================================================
     LLMOBS: trace viewer
     ===================================================================== */
  var OBS_SPANS = [
    { id: "root", name: "invoke_agent refund-helper", kind: "agent", depth: 0, start: 0 },
    { id: "ret", name: "retrieve help-center articles", kind: "retrieval", depth: 1, dur: 180, attrs: { "retrieval.count": 6 } },
    { id: "c1", name: "chat MODEL (plan)", kind: "llm", depth: 1, dur: 1100, inTok: 3200, outTok: 180 },
    { id: "t1", name: "execute_tool lookup_order", kind: "tool", depth: 1, dur: 2400, attrs: { "gen_ai.tool.name": "lookup_order", "cache": "miss" } },
    { id: "c2", name: "chat MODEL (decide)", kind: "llm", depth: 1, dur: 950, inTok: 4100, outTok: 120 },
    { id: "t2", name: "execute_tool check_refund_policy", kind: "tool", depth: 1, dur: 320, attrs: { "gen_ai.tool.name": "check_refund_policy" } },
    { id: "c3", name: "chat MODEL (answer)", kind: "llm", depth: 1, dur: 1600, inTok: 9800, outTok: 420 },
    { id: "g", name: "guardrail output check", kind: "check", depth: 1, dur: 90 }
  ];

  function renderObs(host) {
    var selected = "t1";
    var wrap = h("div", { class: "wg-w15-wrap" });
    host.appendChild(wrap);
    var pin = numInput("Input price, $ per million tokens", 3, 0.1, 0, update);
    var pout = numInput("Output price, $ per million tokens", 15, 0.1, 0, update);
    var cache = checkbox("Fix 1: cache order lookups (hit takes about 60 ms)", false, update);
    var trim = checkbox("Fix 2: send only the 2 best articles to the last call", false, update);
    wrap.appendChild(h("div", { class: "wg-w15-grid" }, pin.el, pout.el));
    wrap.appendChild(h("p", { class: "wg-w15-note", text: "Example prices, check current rates for your model." }));
    wrap.appendChild(h("div", { class: "wg-w15-grid" }, cache.el, trim.el));

    var stLat = stat("End-to-end latency"), stCost = stat("Cost of this run"), stTok = stat("Tokens (in / out)"), stSteps = stat("Spans");
    wrap.appendChild(h("div", { class: "wg-w15-stats4" }, stLat.el, stCost.el, stTok.el, stSteps.el));

    var svgBox = h("div", { class: "wg-w15-panel" });
    wrap.appendChild(svgBox);
    var tableBox = h("div", { class: "wg-w15-scroll" });
    wrap.appendChild(tableBox);
    var detail = h("div", { class: "wg-w15-panel wg-obs-detail", "aria-live": "polite" });
    wrap.appendChild(detail);

    var guessSlow = selectInput("Your guess: the slowest span", [["", "Choose a span"]].concat(OBS_SPANS.slice(1).map(function (x) { return [x.id, x.name]; })), "", update);
    var guessCost = selectInput("Your guess: the costliest span", [["", "Choose a span"]].concat(OBS_SPANS.slice(1).map(function (x) { return [x.id, x.name]; })), "", update);
    var fb = h("div", { class: "wg-obs-fb", "aria-live": "polite" });
    wrap.appendChild(h("div", { class: "wg-w15-panel" }, h("div", { class: "wg-w15-cap", text: "Find the problem steps" }),
      h("div", { class: "wg-w15-grid" }, guessSlow.el, guessCost.el), fb));
    var mean = meaning();
    wrap.appendChild(mean.el);

    function spans() {
      var t = 0, out = [], root = { id: "root", name: OBS_SPANS[0].name, kind: "agent", depth: 0, start: 0, inTok: 0, outTok: 0, cost: 0 };
      out.push(root);
      OBS_SPANS.slice(1).forEach(function (sp) {
        var x = { id: sp.id, name: sp.name, kind: sp.kind, depth: 1, start: t, dur: sp.dur, inTok: sp.inTok || 0, outTok: sp.outTok || 0, attrs: sp.attrs || {} };
        if (sp.id === "t1" && cache.get()) { x.dur = 60; x.attrs = { "gen_ai.tool.name": "lookup_order", "cache": "hit" }; }
        if (sp.id === "c3" && trim.get()) { x.inTok = 4300; x.dur = 1150; }
        x.cost = (x.inTok * pin.get() + x.outTok * pout.get()) / 1e6;
        t += x.dur;
        root.inTok += x.inTok; root.outTok += x.outTok; root.cost += x.cost;
        out.push(x);
      });
      root.dur = t;
      return out;
    }

    function update() {
      var sp = spans(), root = sp[0], kids = sp.slice(1);
      var slow = kids.reduce(function (a, b) { return b.dur > a.dur ? b : a; });
      var costly = kids.reduce(function (a, b) { return b.cost > a.cost ? b : a; });
      stLat.set(fmt(root.dur / 1000, 2) + " s", "sum of child spans", root.dur > 5000);
      stCost.set("$" + fmt(root.cost, 4), "x 20,000 runs a day = $" + fmt(root.cost * 20000, 0));
      stTok.set(fmt(root.inTok) + " / " + fmt(root.outTok), "input / output");
      stSteps.set(String(sp.length), "1 root + " + kids.length + " children");

      /* waterfall */
      clear(svgBox);
      var W = 640, rowH = 24, top = 8, labW = 0, H = top + sp.length * rowH + 22;
      var scale = (W - 20) / Math.max(root.dur, 1);
      var svg = s("svg", { viewBox: "0 0 " + W + " " + H, class: "wg-w15-svg", role: "img", "aria-label": "Waterfall of span durations" });
      sp.forEach(function (x, i) {
        var y = top + i * rowH;
        var isSel = x.id === selected;
        var bar = s("rect", { x: 10 + x.start * scale, y: y + 3, width: Math.max(2, x.dur * scale), height: rowH - 8, rx: 3,
          fill: x.id === "root" ? "var(--line-strong)" : (x.kind === "llm" ? "var(--accent)" : "var(--packet)"),
          opacity: isSel ? 1 : 0.75, stroke: isSel ? "var(--ink)" : "none", "stroke-width": 2, style: "cursor:pointer" });
        bar.addEventListener("click", function () { selected = x.id; update(); });
        svg.appendChild(bar);
      });
      svg.appendChild(s("text", { x: 10, y: H - 6, class: "wg-w15-svgt", text: "0 ms" }));
      svg.appendChild(s("text", { x: W - 10, y: H - 6, "text-anchor": "end", class: "wg-w15-svgt", text: fmt(root.dur) + " ms" }));
      svgBox.appendChild(h("div", { class: "wg-w15-cap", text: "Waterfall: each bar is a span, placed at its start time. Blue bars are model calls, orange bars are tools and other steps. Click a bar or a row." }));
      svgBox.appendChild(svg);

      /* table */
      clear(tableBox);
      var tb = h("table", { class: "wg-w15-table" });
      tb.appendChild(h("thead", null, h("tr", null, h("th", { text: "Span" }), h("th", { text: "ms" }), h("th", { text: "Share" }), h("th", { text: "Tokens in / out" }), h("th", { text: "Cost $" }))));
      var body = h("tbody");
      sp.forEach(function (x) {
        var b = h("button", { type: "button", class: "wg-obs-name" + (x.depth ? " wg-obs-child" : ""), text: x.name, "aria-pressed": x.id === selected ? "true" : "false",
          onclick: function () { selected = x.id; update(); } });
        body.appendChild(h("tr", { class: x.id === selected ? "wg-obs-sel" : "" },
          h("td", null, b), h("td", { text: fmt(x.dur) }), h("td", { text: Math.round(100 * x.dur / root.dur) + "%" }),
          h("td", { text: x.inTok ? fmt(x.inTok) + " / " + fmt(x.outTok) : "-" }), h("td", { text: x.cost ? fmt(x.cost, 4) : "-" })));
      });
      tb.appendChild(body);
      tableBox.appendChild(tb);

      /* detail */
      clear(detail);
      var cur = sp.filter(function (x) { return x.id === selected; })[0] || root;
      detail.appendChild(h("div", { class: "wg-w15-cap", text: "Selected span attributes" }));
      var attrs = { "span.name": cur.name, "duration_ms": cur.dur, "parent": cur.depth ? root.name : "(none, root span)" };
      if (cur.inTok) { attrs["gen_ai.request.model"] = "MODEL"; attrs["gen_ai.usage.input_tokens"] = cur.inTok; attrs["gen_ai.usage.output_tokens"] = cur.outTok; }
      for (var k in (cur.attrs || {})) attrs[k] = cur.attrs[k];
      var pre = h("pre", { class: "wg-obs-pre" });
      pre.textContent = Object.keys(attrs).map(function (k) { return k + " = " + attrs[k]; }).join("\n");
      detail.appendChild(pre);

      /* guesses */
      clear(fb);
      var g1 = guessSlow.get(), g2 = guessCost.get();
      if (g1) fb.appendChild(h("p", { class: g1 === slow.id ? "wg-obs-ok" : "wg-obs-no" }, h("strong", { text: g1 === slow.id ? "Right. " : "Not quite. " }),
        g1 === slow.id ? slow.name + " takes " + fmt(slow.dur) + " ms, " + Math.round(100 * slow.dur / root.dur) + "% of the run." : "Sort by the ms column: the slowest span right now takes " + fmt(slow.dur) + " ms."));
      if (g2) fb.appendChild(h("p", { class: g2 === costly.id ? "wg-obs-ok" : "wg-obs-no" }, h("strong", { text: g2 === costly.id ? "Right. " : "Not quite. " }),
        g2 === costly.id ? costly.name + " costs $" + fmt(costly.cost, 4) + ", mostly input tokens." : "Tools cost no tokens here; compare the model calls' input tokens."));
      if (!g1 && !g2) fb.appendChild(h("p", { class: "wg-w15-note", text: "Pick your answers, then try the two fixes and watch the answers change." }));

      var msg = "The slowest step is " + slow.name + " (" + Math.round(100 * slow.dur / root.dur) + "% of the time) and the costliest is " + costly.name +
        " (" + Math.round(100 * costly.cost / root.cost) + "% of the cost). ";
      msg += slow.id === costly.id ? "Here one step is both, so fix it first." : "They are different steps, so check latency and cost separately; an average for the whole run would hide both.";
      mean.set(msg);
    }
    update();
  }

  /* =====================================================================
     LABELING: agreement calculator
     ===================================================================== */
  var LAB_LABELS = ["refund", "delivery", "account", "other"];
  var LAB_ITEMS = [
    "I want my money back for the lamp",
    "Sofa arrived with a broken leg, please refund",
    "Where is my parcel? It is 5 days late",
    "Refund the second chair, I ordered two by mistake",
    "Cannot log in, password reset email never comes",
    "Tracking has not moved since Monday",
    "Do you sell gift cards?",
    "Cancel and refund order 5521",
    "Please change my email address",
    "Driver left the box in the rain",
    "Charged twice, need one payment back",
    "Can I choose a delivery time slot?",
    "How do I delete my account and my data?",
    "The rug colour is not as shown, I want a refund",
    "Great service, thank you!",
    "Box delivered but it was the wrong address",
    "Still waiting for my refund from last month",
    "Update my phone number on the account",
    "Parcel marked delivered but I never got it",
    "Return label please, then refund me"
  ];
  var LAB_PRESETS = {
    lesson: {
      a: ["refund","refund","delivery","refund","account","delivery","other","refund","account","delivery","refund","delivery","account","refund","other","delivery","refund","account","delivery","refund"],
      b: ["refund","delivery","delivery","refund","account","delivery","refund","refund","account","delivery","refund","delivery","other","refund","other","account","refund","account","delivery","refund"]
    },
    skew: {
      a: ["other","other","other","other","other","other","other","other","refund","other","other","other","other","other","other","other","other","delivery","other","other"],
      b: ["other","other","other","other","other","other","other","other","other","other","other","other","other","other","other","refund","other","other","other","other"]
    }
  };

  function labStats(a, b) {
    var n = a.length, agree = 0, ca = {}, cb = {}, mat = {};
    LAB_LABELS.forEach(function (l) { ca[l] = 0; cb[l] = 0; mat[l] = {}; LAB_LABELS.forEach(function (m) { mat[l][m] = 0; }); });
    for (var i = 0; i < n; i++) { if (a[i] === b[i]) agree++; ca[a[i]]++; cb[b[i]]++; mat[a[i]][b[i]]++; }
    var po = agree / n, pe = 0;
    LAB_LABELS.forEach(function (l) { pe += (ca[l] / n) * (cb[l] / n); });
    var kappa = pe >= 1 ? (po === 1 ? 1 : 0) : (po - pe) / (1 - pe);
    return { po: po, pe: pe, kappa: kappa, agree: agree, n: n, mat: mat, ca: ca, cb: cb };
  }
  function kappaWord(k) {
    if (k < 0.2) return "slight or none";
    if (k < 0.4) return "fair";
    if (k < 0.6) return "moderate";
    if (k < 0.8) return "substantial";
    return "strong";
  }

  function renderLabeling(host) {
    var a = LAB_PRESETS.lesson.a.slice(), b = LAB_PRESETS.lesson.b.slice(), useSkew = false;
    var wrap = h("div", { class: "wg-w15-wrap" });
    host.appendChild(wrap);
    wrap.appendChild(h("div", { class: "wg-w15-row" },
      btn("Load: lesson sample", function () { useSkew = false; a = LAB_PRESETS.lesson.a.slice(); b = LAB_PRESETS.lesson.b.slice(); build(); }),
      btn("Load: one very common label", function () { useSkew = true; a = LAB_PRESETS.skew.a.slice(); b = LAB_PRESETS.skew.b.slice(); build(); }),
      btn("Make B copy A", function () { b = a.slice(); build(); })));

    var stPo = stat("Percent agreement"), stPe = stat("Chance agreement"), stK = stat("Cohen's kappa"), stD = stat("Disagreements");
    wrap.appendChild(h("div", { class: "wg-w15-stats4" }, stPo.el, stPe.el, stK.el, stD.el));
    var mean = meaning();
    wrap.appendChild(mean.el);

    var cols = h("div", { class: "wg-lab-cols" });
    wrap.appendChild(cols);
    var tableBox = h("div", { class: "wg-w15-scroll wg-lab-items" });
    var side = h("div", { class: "wg-lab-side" });
    cols.appendChild(tableBox); cols.appendChild(side);

    function sel(arr, i, who) {
      var id = uid();
      var el = h("select", { id: id, class: "wg-w15-sel wg-lab-sel", "aria-label": "Annotator " + who + " label for item " + (i + 1) });
      LAB_LABELS.forEach(function (l) { var o = h("option", { value: l, text: l }); if (arr[i] === l) o.selected = true; el.appendChild(o); });
      el.addEventListener("change", function () { arr[i] = el.value; refresh(); });
      return el;
    }
    var rows = [];
    function build() {
      clear(tableBox); rows = [];
      var tb = h("table", { class: "wg-w15-table wg-lab-table" });
      tb.appendChild(h("thead", null, h("tr", null, h("th", { text: "#" }), h("th", { text: "Ticket" }), h("th", { text: "Annotator A" }), h("th", { text: "Annotator B" }))));
      var body = h("tbody");
      for (var i = 0; i < LAB_ITEMS.length; i++) {
        var tr = h("tr", null, h("td", { text: String(i + 1) }), h("td", { class: "wg-lab-text", text: LAB_ITEMS[i] }),
          h("td", null, sel(a, i, "A")), h("td", null, sel(b, i, "B")));
        rows.push(tr); body.appendChild(tr);
      }
      tb.appendChild(body);
      tableBox.appendChild(tb);
      refresh();
    }
    function refresh() {
      var r = labStats(a, b);
      stPo.set(Math.round(100 * r.po) + "%", r.agree + " of " + r.n + " items match");
      stPe.set(fmt(r.pe, 2), "expected from each person's label mix");
      stK.set(fmt(r.kappa, 2), kappaWord(r.kappa), r.kappa < 0.6);
      stD.set(String(r.n - r.agree), "items to adjudicate", false);
      rows.forEach(function (tr, i) { tr.classList.toggle("wg-lab-diff", a[i] !== b[i]); });

      clear(side);
      var mt = h("table", { class: "wg-w15-table wg-lab-mat" });
      mt.appendChild(h("caption", { class: "wg-w15-cap", text: "Confusion matrix: rows A, columns B" }));
      mt.appendChild(h("thead", null, h("tr", null, h("th", { text: "A \\ B" }), LAB_LABELS.map(function (l) { return h("th", { text: l }); }))));
      var mb = h("tbody");
      LAB_LABELS.forEach(function (l) {
        mb.appendChild(h("tr", null, h("th", { text: l }), LAB_LABELS.map(function (m) {
          var v = r.mat[l][m];
          return h("td", { class: v ? (l === m ? "wg-lab-on" : "wg-lab-off") : "", text: String(v) });
        })));
      });
      mt.appendChild(mb);
      side.appendChild(h("div", { class: "wg-w15-panel" }, mt));

      var dl = h("ul", { class: "wg-lab-dis" });
      for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) dl.appendChild(h("li", null, h("strong", { text: "#" + (i + 1) + " " }), LAB_ITEMS[i] + ": A said " + a[i] + ", B said " + b[i]));
      if (!dl.firstChild) dl.appendChild(h("li", { text: "No disagreements. Check they labeled blind before trusting this." }));
      side.appendChild(h("div", { class: "wg-w15-panel" }, h("div", { class: "wg-w15-cap", text: "Disagreements to adjudicate" }), dl));

      var msg;
      if (r.po >= 0.85 && r.kappa < 0.4) msg = "Agreement looks high at " + Math.round(100 * r.po) + "%, but most of it is luck: both people use one label for nearly everything, so kappa is only " + fmt(r.kappa, 2) + ". Check the rare labels.";
      else if (r.kappa >= 0.8) msg = "Kappa " + fmt(r.kappa, 2) + " is strong. The guideline is working; keep gold questions in future batches to catch drift.";
      else if (r.kappa >= 0.6) msg = "Kappa " + fmt(r.kappa, 2) + " is substantial but not perfect. Read the " + (r.n - r.agree) + " disagreements: each one points to a rule the guideline should state.";
      else msg = "Kappa " + fmt(r.kappa, 2) + " is " + kappaWord(r.kappa) + ". Do not train or evaluate on these labels yet; fix the guideline and re-measure.";
      mean.set(msg);
    }
    build();
  }

  /* =====================================================================
     VOICE: latency budget builder
     ===================================================================== */
  var VOC_STAGES = [
    ["endpoint", "End-of-turn wait", 100, 1500, 50, 700],
    ["stt", "STT final transcript", 50, 600, 10, 150],
    ["llm", "LLM time to first token", 100, 2000, 10, 450],
    ["tts", "TTS time to first audio", 50, 800, 10, 200],
    ["net", "Network and telephony", 20, 400, 10, 120]
  ];
  var VOC_PRESETS = {
    first: { endpoint: 700, stt: 150, llm: 450, tts: 200, net: 120, stream: false, full: 1300, tool: 0 },
    tuned: { endpoint: 400, stt: 100, llm: 250, tts: 120, net: 80, stream: true, full: 1300, tool: 0 }
  };

  function renderVoice(host) {
    var wrap = h("div", { class: "wg-w15-wrap" });
    host.appendChild(wrap);
    var sl = {};
    var grid = h("div", { class: "wg-w15-grid" });
    VOC_STAGES.forEach(function (st) {
      sl[st[0]] = slider(st[1], st[2], st[3], st[4], st[5], function (v) { return fmt(v) + " ms"; }, update);
      grid.appendChild(sl[st[0]].el);
    });
    var tool = slider("Tool call inside this turn", 0, 3000, 50, 0, function (v) { return v ? fmt(v) + " ms" : "none"; }, update);
    grid.appendChild(tool.el);
    var full = slider("Full LLM reply time (used when not streaming)", 300, 4000, 50, 1300, function (v) { return fmt(v) + " ms"; }, update);
    grid.appendChild(full.el);
    var target = numInput("Target, ms from last word to first sound", 800, 50, 100, update);
    grid.appendChild(target.el);
    wrap.appendChild(grid);
    var stream = checkbox("Stream: start TTS on the first sentence instead of the full reply", false, update);
    var filler = checkbox("Say a short filler ('Let me check') while the tool runs", false, update);
    wrap.appendChild(h("div", { class: "wg-w15-grid" }, stream.el, filler.el));

    function load(p) {
      VOC_STAGES.forEach(function (st) { sl[st[0]].set(p[st[0]]); });
      stream.set(p.stream); full.set(p.full); tool.set(p.tool); update();
    }
    wrap.appendChild(h("div", { class: "wg-w15-row" },
      btn("Load: first build", function () { load(VOC_PRESETS.first); }),
      btn("Load: tuned", function () { load(VOC_PRESETS.tuned); }),
      btn("Add a slow lookup", function () { tool.set(1200); update(); })));

    var stTot = stat("Silence the caller hears"), stGap = stat("Against target"), stBig = stat("Biggest piece");
    wrap.appendChild(h("div", { class: "wg-w15-stats4" }, stTot.el, stGap.el, stBig.el));
    var svgBox = h("div", { class: "wg-w15-panel" });
    wrap.appendChild(svgBox);
    var mean = meaning();
    wrap.appendChild(mean.el);
    wrap.appendChild(h("p", { class: "wg-w15-note", text: "Example stage times, not vendor figures. Measure your own per stage and look at p95 as well as the median." }));

    function update() {
      var T = target.get() || 800;
      var parts = [["End-of-turn wait", sl.endpoint.get()], ["STT final", sl.stt.get()]];
      var useFiller = filler.get() && tool.get() > 0;
      if (tool.get() > 0 && !useFiller) parts.push(["Tool call", tool.get()]);
      parts.push([stream.get() ? "LLM first token" : "LLM full reply", stream.get() ? sl.llm.get() : Math.max(full.get(), sl.llm.get())]);
      parts.push(["TTS first audio", sl.tts.get()]);
      parts.push(["Network", sl.net.get()]);
      var total = parts.reduce(function (x, p) { return x + p[1]; }, 0);
      var big = parts.reduce(function (x, p) { return p[1] > x[1] ? p : x; });
      stTot.set(fmt(total) + " ms", useFiller ? "until the filler starts" : "until the reply starts", total > T);
      stGap.set((total > T ? "+" : "-") + fmt(Math.abs(total - T)) + " ms", total > T ? "over the " + fmt(T) + " ms target" : "under the " + fmt(T) + " ms target", total > T);
      stBig.set(big[0], fmt(big[1]) + " ms, " + Math.round(100 * big[1] / total) + "% of the wait");

      clear(svgBox);
      var W = 640, H = 96, x0 = 10, w = W - 20;
      var maxV = Math.max(total, T) * 1.08;
      var sc = w / maxV;
      var svg = s("svg", { viewBox: "0 0 " + W + " " + H, class: "wg-w15-svg", role: "img", "aria-label": "Stacked latency bar, total " + total + " ms, target " + T + " ms" });
      var x = x0;
      var fills = ["var(--line-strong)", "var(--accent-soft)", "var(--accent)", "var(--packet)", "var(--hl)", "var(--muted)", "var(--line-strong)"];
      parts.forEach(function (p, i) {
        var wd = p[1] * sc;
        svg.appendChild(s("rect", { x: x, y: 18, width: Math.max(wd, 1), height: 30, fill: fills[i % fills.length], stroke: "var(--surface)", "stroke-width": 1 }));
        x += wd;
      });
      var tx = x0 + T * sc;
      svg.appendChild(s("line", { x1: tx, x2: tx, y1: 8, y2: 58, stroke: "var(--ink)", "stroke-width": 2, "stroke-dasharray": "4 3" }));
      svg.appendChild(s("text", { x: Math.min(tx, W - 60), y: 74, "text-anchor": "middle", class: "wg-w15-svgt", text: "target " + fmt(T) + " ms" }));
      svg.appendChild(s("text", { x: x0, y: 12, class: "wg-w15-svgt", text: "caller stops talking" }));
      svg.appendChild(s("text", { x: Math.min(x0 + total * sc, W - 10), y: 90, "text-anchor": "end", class: "wg-w15-svgt", text: "first sound at " + fmt(total) + " ms" }));
      svgBox.appendChild(svg);
      var lg = h("div", { class: "wg-w15-legend" });
      parts.forEach(function (p, i) {
        var sw = h("i", { class: "wg-voc-sw" }); sw.style.background = fills[i % fills.length];
        lg.appendChild(h("span", null, sw, p[0] + " " + fmt(p[1]) + " ms"));
      });
      svgBox.appendChild(lg);

      var tip;
      if (!stream.get()) tip = "Turn on streaming: waiting for the full reply is the most expensive habit.";
      else if (tool.get() > 0 && !useFiller) tip = "Prefetch this data at call start, cache it, or say a short filler while it runs.";
      else if (big[0] === "End-of-turn wait") tip = "Shorten the end-of-turn wait, keeping a longer one only after asking for numbers.";
      else if (big[0] === "LLM first token") tip = "Shorten the prompt or use a faster model for simple turns.";
      else tip = "Look at the biggest piece first; every 100 ms saved there is saved on every turn.";
      mean.set(total > T ? "Callers wait " + fmt(total) + " ms, " + fmt(total - T) + " ms over target, and " + big[0].toLowerCase() + " is the biggest piece. " + tip
        : "Callers hear the agent after " + fmt(total) + " ms, inside the " + fmt(T) + " ms target" + (useFiller ? ", although the real answer comes " + fmt(tool.get()) + " ms later, after the filler." : ". Now check the slow tail (p95), not just this typical turn."));
    }
    update();
  }

  Object.assign(WIDGETS, {
    agentmemory: {
      title: "Memory stepper",
      intro: "Step through a 12-turn support chat. Watch the thread fill its token budget, get compacted into a summary, and see lasting facts written to a long-term store. Change the budget and how many recent turns are kept word for word.",
      render: renderMemory
    },
    llmobs: {
      title: "Trace viewer",
      intro: "One run of a refund agent as a tree of spans with time, tokens and cost. Find the slowest and the costliest step, then switch on the two fixes and see what changes.",
      render: renderObs
    },
    labeling: {
      title: "Agreement calculator",
      intro: "Two annotators labeled the same 20 tickets. Change any label and watch percent agreement, chance agreement and Cohen's kappa update. Load the 'one very common label' set to see why percent agreement alone can fool you.",
      render: renderLabeling
    },
    voice: {
      title: "Voice latency budget builder",
      intro: "Set how long each stage of a voice turn takes and see the silence a caller hears against an 800 ms target. Try the first build, then turn on streaming and shorten the end-of-turn wait.",
      render: renderVoice
    }
  });
})();

WIDGET_CSS += `
.wg-w15-wrap { display: flex; flex-direction: column; gap: 14px; font-family: var(--body); color: var(--ink); min-width: 0; }
.wg-w15-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 10px 18px; }
.wg-w15-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.wg-w15-lab { display: flex; justify-content: space-between; gap: 8px; font-size: 13px; color: var(--muted); flex-wrap: wrap; }
.wg-w15-val { font-family: var(--mono); color: var(--ink); font-size: 13px; }
.wg-w15-field input[type=range] { width: 100%; accent-color: var(--accent); }
.wg-w15-num, .wg-w15-sel { font: inherit; font-size: 14px; color: var(--ink); background: var(--surface); border: 1px solid var(--line-strong); border-radius: 6px; padding: 6px 8px; width: 100%; box-sizing: border-box; }
.wg-w15-check { display: flex; gap: 8px; align-items: flex-start; font-size: 14px; }
.wg-w15-check input { margin-top: 3px; accent-color: var(--accent); }
.wg-w15-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.wg-w15-btn { font: inherit; font-size: 14px; padding: 7px 14px; border-radius: 6px; border: 1px solid var(--line-strong); background: var(--surface); color: var(--ink); cursor: pointer; }
.wg-w15-btn:hover:not(:disabled) { border-color: var(--accent); }
.wg-w15-btn:disabled { color: var(--muted); border-style: dashed; opacity: 1; cursor: default; }
.wg-w15-primary { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
.wg-w15-primary:disabled { background: var(--surface); }
.wg-w15-steplab { font-family: var(--mono); font-size: 13px; color: var(--muted); }
.wg-w15-panel { border: 1px solid var(--line); border-radius: 8px; padding: 10px; background: var(--surface); min-width: 0; }
.wg-w15-cap { font-size: 12px; color: var(--muted); margin-bottom: 6px; text-align: left; }
.wg-w15-svg { width: 100%; max-width: 720px; height: auto; display: block; margin: 0 auto; }
.wg-w15-svgt { font-family: var(--mono); font-size: 11px; fill: var(--muted); }
.wg-w15-legend { display: flex; flex-wrap: wrap; gap: 8px 14px; font-size: 12px; color: var(--muted); margin-top: 6px; }
.wg-w15-legend span { display: inline-flex; align-items: center; gap: 6px; }
.wg-w15-stats4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
.wg-w15-stat { border: 1px solid var(--line); border-radius: 8px; padding: 8px 10px; background: var(--surface); min-width: 0; }
.wg-w15-statl { font-size: 12px; color: var(--muted); }
.wg-w15-statv { font-size: 20px; font-weight: 600; font-family: var(--mono); margin-top: 2px; word-break: break-word; }
.wg-w15-stats { font-size: 12px; color: var(--muted); }
.wg-w15-warn { border-color: var(--accent); }
.wg-w15-warn .wg-w15-statv { color: var(--accent); }
.wg-w15-mean { background: var(--accent-soft); border-left: 3px solid var(--accent); padding: 10px 12px; border-radius: 6px; font-size: 14px; line-height: 1.5; color: var(--ink); }
.wg-w15-note { font-size: 12px; color: var(--muted); margin: 0; line-height: 1.5; }
.wg-w15-scroll { overflow-x: auto; max-width: 100%; }
.wg-w15-table { border-collapse: collapse; font-size: 13px; width: 100%; }
.wg-w15-table th, .wg-w15-table td { border-bottom: 1px solid var(--line); padding: 5px 8px; text-align: left; vertical-align: top; }
.wg-w15-table th { color: var(--muted); font-weight: 600; font-size: 12px; }
.wg-mem-events { font-size: 14px; line-height: 1.5; }
.wg-mem-events p { margin: 2px 0; }
.wg-mem-ev { border-left: 3px solid var(--packet); padding-left: 8px; }
.wg-mem-bad { border-left: 3px solid var(--accent); padding-left: 8px; color: var(--accent); font-weight: 600; }
.wg-mem-cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px; }
.wg-mem-list, .wg-mem-store { margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.5; }
.wg-mem-store { list-style: none; padding-left: 0; }
.wg-mem-store li { margin-bottom: 4px; }
.wg-mem-now { font-weight: 600; }
.wg-mem-sumrow { list-style: none; margin-left: -20px; background: var(--hl); color: var(--ink); padding: 4px 8px; border-radius: 4px; margin-bottom: 4px; }
.wg-mem-kind { display: inline-block; font-family: var(--mono); font-size: 11px; border: 1px solid var(--line-strong); border-radius: 4px; padding: 0 5px; color: var(--ink); }
.wg-mem-sw, .wg-voc-sw { display: inline-block; width: 12px; height: 12px; border-radius: 2px; border: 1px solid var(--line-strong); }
.wg-mem-sys { background: var(--line-strong); }
.wg-mem-sum { background: var(--packet); }
.wg-mem-rec { background: var(--accent); }
.wg-obs-name { font: inherit; font-size: 13px; background: none; border: none; color: var(--ink); cursor: pointer; padding: 0; text-align: left; text-decoration: underline; text-decoration-color: var(--line-strong); }
.wg-obs-child { padding-left: 14px; }
.wg-obs-sel td { background: var(--accent-soft); }
.wg-obs-sel .wg-obs-name { font-weight: 600; }
.wg-obs-pre { font-family: var(--mono); font-size: 12px; background: var(--code-bg); color: var(--ink); padding: 8px; border-radius: 6px; margin: 0; white-space: pre-wrap; word-break: break-word; }
.wg-obs-fb p { margin: 6px 0; font-size: 14px; }
.wg-obs-ok { border-left: 3px solid var(--packet); padding-left: 8px; }
.wg-obs-no { border-left: 3px solid var(--accent); padding-left: 8px; }
.wg-lab-cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 12px; align-items: start; }
.wg-lab-side { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.wg-lab-table td { padding: 3px 6px; }
.wg-lab-text { min-width: 120px; }
.wg-lab-sel { padding: 3px 4px; font-size: 13px; min-width: 88px; }
.wg-lab-diff td { background: var(--hl); }
.wg-lab-mat td, .wg-lab-mat th { text-align: center; }
.wg-lab-on { font-weight: 700; background: var(--accent-soft); }
.wg-lab-off { font-weight: 700; background: var(--hl); }
.wg-lab-dis { margin: 0; padding-left: 18px; font-size: 13px; line-height: 1.5; }
`;
