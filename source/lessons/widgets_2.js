/* Interactive widgets, batch 2: mathbasics, embeddings, transformer, context, rag, llmcost */
(function () {
  "use strict";

  /* ---------- small helpers (no shared state) ---------- */
  function h(tag, props, kids) {
    var e = document.createElement(tag);
    if (props) {
      for (var k in props) {
        var v = props[k];
        if (v == null) continue;
        if (k === "class") e.className = v;
        else if (k === "text") e.textContent = v;
        else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), v);
        else e.setAttribute(k, v);
      }
    }
    add(e, kids);
    return e;
  }
  function add(e, kids) {
    if (kids == null) return;
    (Array.isArray(kids) ? kids : [kids]).forEach(function (c) {
      if (c == null) return;
      e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
  }
  var SVGNS = "http://www.w3.org/2000/svg";
  function s(tag, attrs, text) {
    var e = document.createElementNS(SVGNS, tag);
    if (attrs) for (var k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }
  function clear(e) { while (e.firstChild) e.removeChild(e.firstChild); }
  function nid(p) { return "wgw2-" + (p || "f") + "-" + Math.random().toString(36).slice(2, 9); }
  function fmtInt(n) { return Math.round(n).toLocaleString("en-US"); }
  function pct(x, d) { return (x * 100).toFixed(d == null ? 0 : d) + "%"; }
  function money(v) {
    if (!isFinite(v)) return "-";
    if (Math.abs(v) >= 100) return "$" + Math.round(v).toLocaleString("en-US");
    if (Math.abs(v) >= 1) return "$" + v.toFixed(2);
    if (v === 0) return "$0";
    return "$" + v.toFixed(4);
  }

  function slider(label, o) {
    var id = nid("r");
    var out = h("output", { class: "wg-w2-val", for: id });
    var inp = h("input", { type: "range", id: id, min: o.min, max: o.max, step: o.step, value: String(o.value) });
    function upd() { out.textContent = o.fmt ? o.fmt(+inp.value) : inp.value; }
    inp.addEventListener("input", function () { upd(); if (o.onInput) o.onInput(+inp.value); });
    upd();
    var wrap = h("div", { class: "wg-w2-field" }, [
      h("div", { class: "wg-w2-lrow" }, [h("label", { for: id, text: label }), out]),
      inp
    ]);
    return { wrap: wrap, inp: inp, get: function () { return +inp.value; }, set: function (v) { inp.value = v; upd(); } };
  }
  function field(label, inputProps, onInput) {
    var id = nid("i");
    inputProps.id = id;
    inputProps.class = "wg-w2-in";
    var inp = h("input", inputProps);
    if (onInput) inp.addEventListener("input", onInput);
    var wrap = h("div", { class: "wg-w2-field" }, [h("label", { for: id, text: label }), inp]);
    return { wrap: wrap, inp: inp, num: function (def) { var v = parseFloat(inp.value); return isFinite(v) ? v : (def || 0); } };
  }
  function select(label, options, value, onChange) {
    var id = nid("s");
    var sel = h("select", { id: id, class: "wg-w2-in" });
    options.forEach(function (op) {
      var o = h("option", { value: String(op[0]), text: op[1] });
      if (String(op[0]) === String(value)) o.selected = true;
      sel.appendChild(o);
    });
    sel.addEventListener("change", onChange);
    var wrap = h("div", { class: "wg-w2-field" }, [h("label", { for: id, text: label }), sel]);
    return { wrap: wrap, sel: sel };
  }
  function meaningBox() {
    var span = h("span");
    var box = h("div", { class: "wg-w2-mean", role: "status", "aria-live": "polite" }, [h("strong", { text: "What this means: " }), span]);
    return { box: box, set: function (t) { span.textContent = t; } };
  }
  function btn(label, onClick, ghost) {
    return h("button", { type: "button", class: "wg-w2-btn" + (ghost ? " wg-w2-ghost" : ""), text: label, onclick: onClick });
  }

  var STOP = {};
  ("a an the and or but if of to in on at by for with from as is are was were be been am do does did have has had i you he she it we they me my your our their this that these those what which who whom how when where why can could should would will shall may might must not no yes so than then there here into out up down over under about after before until also just only very too all any each every some such own same other more most much many few its his her them him us").split(" ").forEach(function (w) { STOP[w] = 1; });

  Object.assign(WIDGETS, {

    /* =========================== SOFTMAX =========================== */
    mathbasics: {
      title: "Softmax and temperature playground",
      intro: "Edit the model's raw scores (logits) for five candidate next words, then drag the temperature slider. Watch low temperature pile almost all probability on the top word and high temperature spread it out.",
      render: function (host) {
        var root = h("div", { class: "wg-w2" });
        host.appendChild(root);
        root.appendChild(h("p", { class: "wg-w2-note", text: 'Prompt: "The cat sat on the ___". The model gives each candidate word a raw score called a logit. Softmax turns the scores into probabilities.' }));

        var preset = [["mat", 3.2], ["sofa", 2.4], ["floor", 2.0], ["roof", 0.8], ["moon", -1.0]];
        var grid = h("div", { class: "wg-sm-grid" });
        var rows = preset.map(function (p, i) {
          var wid = nid("w"), zid = nid("z");
          var wi = h("input", { type: "text", id: wid, value: p[0], maxlength: "14", class: "wg-w2-in" });
          var zi = h("input", { type: "number", id: zid, value: String(p[1]), step: "0.1", min: "-10", max: "10", class: "wg-w2-in" });
          wi.addEventListener("input", changed);
          zi.addEventListener("input", changed);
          grid.appendChild(h("div", { class: "wg-sm-row" }, [
            h("label", { for: wid, text: "Word " + (i + 1) }), wi,
            h("label", { for: zid, text: "Logit" }), zi
          ]));
          return { wi: wi, zi: zi };
        });
        root.appendChild(grid);

        var temp = slider("Temperature (T)", { min: 0.1, max: 3, step: 0.05, value: 1, fmt: function (v) { return v.toFixed(2); }, onInput: changed });
        root.appendChild(temp.wrap);

        var svg = s("svg", { viewBox: "0 0 400 180", class: "wg-w2-svg wg-w2-cap", role: "img", "aria-label": "Bar chart of next-word probabilities" });
        root.appendChild(svg);

        var tally = null, lastDraw = null;
        var drawOut = h("div", { class: "wg-sm-draw", "aria-live": "polite" });
        root.appendChild(h("div", { class: "wg-w2-btns" }, [
          btn("Sample one word", function () { sample(1); }),
          btn("Sample 100 words", function () { sample(100); }, true),
          drawOut
        ]));

        var formula = h("div", { class: "wg-w2-code" });
        root.appendChild(formula);
        var mean = meaningBox();
        root.appendChild(mean.box);

        function data() {
          var T = temp.get();
          var items = rows.map(function (r, i) {
            var z = parseFloat(r.zi.value);
            if (!isFinite(z)) z = 0;
            z = Math.max(-10, Math.min(10, z));
            return { w: (r.wi.value.trim() || "word " + (i + 1)), z: z };
          });
          var m = Math.max.apply(null, items.map(function (it) { return it.z; }));
          var sum = 0;
          items.forEach(function (it) { it.e = Math.exp((it.z - m) / T); sum += it.e; });
          items.forEach(function (it) { it.p = it.e / sum; it.raw = Math.exp(it.z / T); });
          return { T: T, items: items };
        }
        function changed() { tally = null; lastDraw = null; draw(); }
        function sample(n) {
          var d = data();
          if (!tally) tally = d.items.map(function () { return 0; });
          for (var k = 0; k < n; k++) {
            var r = Math.random(), acc = 0, pick = d.items.length - 1;
            for (var i = 0; i < d.items.length; i++) { acc += d.items[i].p; if (r < acc) { pick = i; break; } }
            tally[pick]++;
            lastDraw = pick;
          }
          draw();
        }
        function big(x) { return x >= 1e5 || (x < 0.01 && x > 0) ? x.toExponential(2) : x.toFixed(2); }
        function draw() {
          var d = data(), T = d.T, it = d.items;
          clear(svg);
          var total = tally ? tally.reduce(function (a, b) { return a + b; }, 0) : 0;
          it.forEach(function (x, i) {
            var y = 8 + i * 34;
            svg.appendChild(s("text", { x: 0, y: y + 17, style: "fill:var(--ink);font:13px var(--body)" }, x.w.slice(0, 12)));
            svg.appendChild(s("rect", { x: 96, y: y + 4, width: 240, height: 20, rx: 3, style: "fill:var(--code-bg)" }));
            svg.appendChild(s("rect", { x: 96, y: y + 4, width: Math.max(1, 240 * x.p), height: 20, rx: 3, style: "fill:" + (i === lastDraw ? "var(--packet)" : "var(--accent)") }));
            if (tally) svg.appendChild(s("rect", { x: 96 + 240 * (tally[i] / total), y: y + 1, width: 2, height: 26, style: "fill:var(--ink)" }));
            svg.appendChild(s("text", { x: 342, y: y + 19, style: "fill:var(--ink);font:12px var(--mono)" }, pct(x.p, 1)));
          });
          var order = it.map(function (x, i) { return i; }).sort(function (a, b) { return it[b].p - it[a].p; });
          var top = it[order[0]], low = it[order[order.length - 1]];

          if (tally) {
            drawOut.textContent = "Drew: “" + it[lastDraw].w + "”  (" + total + " draws so far; black ticks show how often each word came up)";
          } else drawOut.textContent = "Press a button to draw a word at random using these probabilities.";

          var sumRaw = it.reduce(function (a, x) { return a + x.raw; }, 0);
          formula.textContent =
            "p(word) = e^(logit / T) ÷ sum over all words of e^(logit / T)\n\n" +
            "p(" + top.w + ") = e^(" + top.z + " / " + T.toFixed(2) + ") ÷ (" +
            it.map(function (x) { return "e^(" + x.z + "/" + T.toFixed(2) + ")"; }).join(" + ") + ")\n" +
            "         = " + big(top.raw) + " ÷ " + big(sumRaw) + " = " + top.p.toFixed(3);

          var tail;
          if (T < 0.5) tail = " Low temperature makes the model near-greedy: answers become predictable and repetitive.";
          else if (T > 1.4) tail = " High temperature flattens the odds: more variety, but unlikely (odd) words show up far more often.";
          else tail = " Around T = 1 the model samples from its own learned odds.";
          mean.set("At T = " + T.toFixed(2) + ", “" + top.w + "” is chosen " + pct(top.p) + " of the time and “" + low.w + "” only " + (low.p < 0.001 ? "under 0.1%" : pct(low.p, 1)) + "." + tail);
        }
        draw();
      }
    },

    /* =========================== EMBEDDINGS =========================== */
    embeddings: {
      title: "2D embedding playground",
      intro: "Pick a query word, or drag anywhere on the plane to place your own query point. The nearest words by cosine similarity get connected; compare the dot product and cosine columns to see why length matters.",
      render: function (host) {
        var words = [
          ["cat", 0.9, 0.35], ["kitten", 0.45, 0.3], ["dog", 0.85, 0.6], ["puppy", 0.5, 0.42],
          ["apple", -0.3, 0.9], ["banana", -0.5, 0.78], ["pizza", -0.12, 1.1],
          ["car", -0.85, -0.5], ["truck", -1.05, -0.72], ["bicycle", -0.45, -0.55]
        ].map(function (w) { return { w: w[0], x: w[1], y: w[2] }; });

        var root = h("div", { class: "wg-w2" });
        host.appendChild(root);
        root.appendChild(h("p", { class: "wg-w2-note", text: "Toy embeddings: real models use hundreds or thousands of numbers per word; here each word is just 2 numbers so we can draw it." }));

        var q = { x: 0.7, y: 0.3 }, qWord = "cat";
        q.x = words[0].x; q.y = words[0].y;
        var opts = [["", "Custom point (drag on the plane)"]].concat(words.map(function (w) { return [w.w, w.w]; }));
        var ctrls = h("div", { class: "wg-w2-controls" });
        var sel = select("Query word", opts, "cat", function () {
          qWord = sel.sel.value;
          var f = words.filter(function (w) { return w.w === qWord; })[0];
          if (f) { q.x = f.x; q.y = f.y; }
          draw();
        });
        var kS = slider("Top-k neighbours", { min: 1, max: 5, step: 1, value: 3, onInput: draw });
        ctrls.appendChild(sel.wrap); ctrls.appendChild(kS.wrap);
        root.appendChild(ctrls);

        var svg = s("svg", { viewBox: "-150 -130 300 260", class: "wg-w2-svg wg-em-plane", role: "img", "aria-label": "2D plane with word vectors; drag to move the query point" });
        root.appendChild(svg);
        var calc = h("div", { class: "wg-w2-code" });
        root.appendChild(calc);
        var tbl = h("table", { class: "wg-w2-table" });
        root.appendChild(h("div", { class: "wg-w2-scroll" }, tbl));
        var mean = meaningBox();
        root.appendChild(mean.box);

        var dragging = false;
        function toPlane(ev) {
          var pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
          var m = svg.getScreenCTM();
          if (!m) return null;
          var p = pt.matrixTransform(m.inverse());
          return { x: Math.max(-1.25, Math.min(1.25, p.x / 100)), y: Math.max(-1.25, Math.min(1.25, -p.y / 100)) };
        }
        function moveTo(ev) {
          var p = toPlane(ev); if (!p) return;
          if (Math.hypot(p.x, p.y) < 0.03) p.x = 0.03;
          q = p; qWord = ""; sel.sel.value = ""; draw();
        }
        svg.addEventListener("pointerdown", function (ev) { dragging = true; try { svg.setPointerCapture(ev.pointerId); } catch (e) {} moveTo(ev); ev.preventDefault(); });
        svg.addEventListener("pointermove", function (ev) { if (dragging) moveTo(ev); });
        svg.addEventListener("pointerup", function () { dragging = false; });
        svg.addEventListener("pointercancel", function () { dragging = false; });

        function f2(v) { return v.toFixed(2); }
        function draw() {
          var k = kS.get();
          var qn = Math.hypot(q.x, q.y);
          var ranked = words.filter(function (w) { return w.w !== qWord; }).map(function (w) {
            var dot = q.x * w.x + q.y * w.y;
            return { w: w, dot: dot, cos: dot / (qn * Math.hypot(w.x, w.y)) };
          }).sort(function (a, b) { return b.cos - a.cos; });
          var topSet = {};
          ranked.slice(0, k).forEach(function (r) { topSet[r.w.w] = 1; });

          clear(svg);
          svg.appendChild(s("circle", { cx: 0, cy: 0, r: 100, style: "fill:none;stroke:var(--line);stroke-dasharray:3 3" }));
          svg.appendChild(s("line", { x1: -125, y1: 0, x2: 125, y2: 0, style: "stroke:var(--line-strong);stroke-width:0.6" }));
          svg.appendChild(s("line", { x1: 0, y1: -125, x2: 0, y2: 125, style: "stroke:var(--line-strong);stroke-width:0.6" }));
          words.forEach(function (w) {
            var on = topSet[w.w];
            svg.appendChild(s("line", { x1: 0, y1: 0, x2: w.x * 100, y2: -w.y * 100, style: "stroke:var(--muted);stroke-width:0.5;opacity:0.5" }));
            if (on) svg.appendChild(s("line", { x1: q.x * 100, y1: -q.y * 100, x2: w.x * 100, y2: -w.y * 100, style: "stroke:var(--packet);stroke-width:1.4;stroke-dasharray:4 2" }));
          });
          words.forEach(function (w) {
            var on = topSet[w.w], isQ = w.w === qWord;
            svg.appendChild(s("circle", { cx: w.x * 100, cy: -w.y * 100, r: on ? 4.2 : 3, style: "fill:" + (isQ ? "var(--accent)" : on ? "var(--packet)" : "var(--muted)") }));
            var lx = w.x * 100 + (w.x < 0 ? -6 : 6);
            svg.appendChild(s("text", { x: lx, y: -w.y * 100 + (w.w === "kitten" || w.w === "bicycle" ? 12 : -5), "text-anchor": w.x < 0 ? "end" : "start", style: "fill:var(--ink);font:" + (on ? "600 " : "") + "9px var(--body)" }, w.w));
          });
          svg.appendChild(s("line", { x1: 0, y1: 0, x2: q.x * 100, y2: -q.y * 100, style: "stroke:var(--accent);stroke-width:2" }));
          svg.appendChild(s("circle", { cx: q.x * 100, cy: -q.y * 100, r: 6, style: "fill:var(--accent);stroke:var(--surface);stroke-width:1.5;cursor:grab" }));
          if (!qWord) svg.appendChild(s("text", { x: q.x * 100 + 8, y: -q.y * 100 + 12, style: "fill:var(--accent);font:600 9px var(--body)" }, "query"));

          clear(tbl);
          tbl.appendChild(h("thead", null, h("tr", null, [h("th", { text: "#" }), h("th", { text: "Word" }), h("th", { class: "wg-w2-num", text: "Vector" }), h("th", { class: "wg-w2-num", text: "Dot" }), h("th", { class: "wg-w2-num", text: "Cosine" })])));
          var tb = h("tbody");
          ranked.forEach(function (r, i) {
            tb.appendChild(h("tr", { class: topSet[r.w.w] ? "wg-w2-hit" : null }, [
              h("td", { text: String(i + 1) }), h("td", { text: r.w.w }),
              h("td", { class: "wg-w2-num", text: "[" + f2(r.w.x) + ", " + f2(r.w.y) + "]" }),
              h("td", { class: "wg-w2-num", text: f2(r.dot) }), h("td", { class: "wg-w2-num", text: f2(r.cos) })
            ]));
          });
          tbl.appendChild(tb);

          var b = ranked[0], worst = ranked[ranked.length - 1];
          var qName = qWord ? "“" + qWord + "”" : "your query point";
          calc.textContent =
            "query = [" + f2(q.x) + ", " + f2(q.y) + "],  " + b.w.w + " = [" + f2(b.w.x) + ", " + f2(b.w.y) + "]\n" +
            "dot    = " + f2(q.x) + "×" + f2(b.w.x) + " + " + f2(q.y) + "×" + f2(b.w.y) + " = " + f2(b.dot) + "\n" +
            "cosine = dot ÷ (length(query) × length(" + b.w.w + ")) = " + f2(b.dot) + " ÷ (" + f2(qn) + " × " + f2(Math.hypot(b.w.x, b.w.y)) + ") = " + f2(b.cos);

          var byDot = ranked.slice().sort(function (a, c) { return c.dot - a.dot; })[0];
          var msg = "Closest to " + qName + " is “" + b.w.w + "” (cosine " + f2(b.cos) + "): " + (b.cos > 0.95 ? "the two arrows point almost the same way." : b.cos > 0.7 ? "the arrows point in a broadly similar direction." : "nothing points very close to it.") + " Least similar is “" + worst.w.w + "” (cosine " + f2(worst.cos) + (worst.cos < 0 ? ", pointing away" : "") + ").";
          if (byDot.w.w !== b.w.w) msg += " Ranked by raw dot product, “" + byDot.w.w + "” would win instead, because its arrow is longer; cosine ignores length and only compares direction.";
          mean.set(msg);
        }
        draw();
      }
    },

    /* =========================== TRANSFORMER / ATTENTION =========================== */
    transformer: {
      title: "Toy self-attention heatmap",
      intro: "Click a word to see how much attention it pays to every other word. Compare the two “animal / street” sentences: changing one word at the end changes what “it” looks at.",
      render: function (host) {
        var presets = [
          { t: "The animal didn't cross the street because it was too tired", focus: "it",
            o: { it: { animal: 7, tired: 1.5, street: 0.8 }, tired: { it: 3, animal: 2.5 }, cross: { animal: 2.5, street: 3 }, was: { it: 2, tired: 1.5 }, "didn't": { cross: 2.5 } } },
          { t: "The animal didn't cross the street because it was too wide", focus: "it",
            o: { it: { street: 7, wide: 1.5, animal: 0.8 }, wide: { it: 3, street: 2.5 }, cross: { animal: 2.5, street: 3 }, was: { it: 2, wide: 1.5 }, "didn't": { cross: 2.5 } } },
          { t: "The bank by the river flooded after the storm", focus: "bank",
            o: { bank: { river: 5, flooded: 2 }, flooded: { bank: 4, storm: 3, river: 1.5 }, storm: { flooded: 3 }, river: { bank: 3 } } },
          { t: "Sara gave Tom the keys because he asked for them", focus: "he",
            o: { he: { tom: 7, asked: 1 }, them: { keys: 7, gave: 1 }, asked: { he: 2.5, tom: 1.5 }, gave: { sara: 2.5, keys: 2, tom: 2 } } }
        ];
        var PRON = { it: 1, he: 1, she: 1, they: 1, them: 1, him: 1, her: 1, its: 1, this: 1 };

        var root = h("div", { class: "wg-w2" });
        host.appendChild(root);
        var ctrls = h("div", { class: "wg-w2-controls" });
        var pSel = select("Preset sentence", presets.map(function (p, i) { return [i, p.t]; }), 0, function () {
          var p = presets[+pSel.sel.value];
          txt.inp.value = p.t;
          selected = null; build(p.focus);
        });
        var txt = field("Sentence (edit it, up to 14 words)", { type: "text", value: presets[0].t, maxlength: "120" }, function () { selected = null; build(null); });
        ctrls.appendChild(pSel.wrap); ctrls.appendChild(txt.wrap);
        root.appendChild(ctrls);
        var causalId = nid("c");
        var causal = h("input", { type: "checkbox", id: causalId });
        causal.addEventListener("change", function () { build(null); });
        root.appendChild(h("div", { class: "wg-w2-check" }, [causal, h("label", { for: causalId, text: "Only look backwards (how chat models generate text: a word cannot see words after it)" })]));

        root.appendChild(h("p", { class: "wg-w2-note", text: "Click a word (the query) to see its attention weights:" }));
        var wordRow = h("div", { class: "wg-tf-words" });
        root.appendChild(wordRow);
        var note = h("p", { class: "wg-w2-note" });
        root.appendChild(note);
        var svg = s("svg", { class: "wg-w2-svg wg-w2-cap", role: "img", "aria-label": "Attention heatmap: rows are query words, columns are the words they attend to" });
        root.appendChild(svg);
        var bars = h("div", { class: "wg-tf-bars" });
        root.appendChild(bars);
        root.appendChild(h("ul", { class: "wg-tf-qkv" }, [
          h("li", null, [h("strong", { text: "Query: " }), "what this word is looking for (“which noun do I refer to?”)."]),
          h("li", null, [h("strong", { text: "Key: " }), "what each word offers to be matched against (“I am a noun, an animal”)."]),
          h("li", null, [h("strong", { text: "Value: " }), "the information a word hands over once it is attended to; the output is the weighted mix of values."])
        ]));
        var mean = meaningBox();
        root.appendChild(mean.box);

        var toks = [], W = [], selected = null;
        function norm(w) { return w.toLowerCase().replace(/[^a-z']/g, ""); }
        function build(focus) {
          var text = txt.inp.value.trim();
          toks = text.split(/\s+/).filter(Boolean).slice(0, 14);
          if (!toks.length) toks = ["(empty)"];
          var preset = null;
          presets.forEach(function (p) { if (p.t === text) preset = p; });
          note.textContent = preset ? "Weights are hand-set to look like a trained model." :
            "Custom sentence: weights are a simple guess (a word looks at itself, its neighbours, and pronouns look back at earlier nouns). Real models learn these from data.";
          var n = toks.length, nk = toks.map(norm);
          W = nk.map(function (qw, i) {
            var row = nk.map(function (kw, j) {
              var sc = 1;
              if (i === j) sc += 2;
              if (Math.abs(i - j) === 1) sc += 1;
              if (STOP[kw] && i !== j) sc *= 0.5;
              if (preset && preset.o[qw] && preset.o[qw][kw] != null) sc += preset.o[qw][kw] * 2;
              else if (!preset && PRON[qw] && j < i && !STOP[kw] && !PRON[kw] && kw.length > 2) sc += 6 * Math.pow(0.8, i - j - 1);
              if (causal.checked && j > i) sc = 0;
              return sc;
            });
            var sum = row.reduce(function (a, b) { return a + b; }, 0);
            return row.map(function (v) { return v / sum; });
          });
          if (selected == null || selected >= n) {
            selected = 0;
            var f = focus ? nk.indexOf(norm(focus)) : -1;
            if (f < 0) { nk.forEach(function (w, i) { if (f < 0 && PRON[w]) f = i; }); }
            if (f < 0) f = Math.min(1, n - 1);
            selected = f;
          }
          clear(wordRow);
          toks.forEach(function (t, i) {
            var b = h("button", { type: "button", class: "wg-tf-word", "aria-pressed": i === selected ? "true" : "false", text: t, onclick: function () { selected = i; draw(); } });
            wordRow.appendChild(b);
          });
          draw();
        }
        function draw() {
          Array.prototype.forEach.call(wordRow.children, function (b, i) {
            b.setAttribute("aria-pressed", i === selected ? "true" : "false");
            var w = W[selected][i];
            b.style.background = "color-mix(in srgb, var(--accent) " + Math.round(Math.min(1, w * 1.8) * 40) + "%, var(--surface))";
            b.style.color = "var(--ink)";
          });
          var n = toks.length, left = 92, top = 70, cell = Math.min(34, (400 - left - 40) / n);
          var H = top + cell * n + 4;
          svg.setAttribute("viewBox", "0 0 400 " + H);
          clear(svg);
          toks.forEach(function (t, j) {
            var cx = left + j * cell + cell / 2;
            svg.appendChild(s("text", { x: cx, y: top - 6, transform: "rotate(-50 " + cx + " " + (top - 6) + ")", style: "fill:var(--ink);font:" + (j === selected ? "700 " : "") + "10px var(--body)" }, t.slice(0, 11)));
          });
          toks.forEach(function (t, i) {
            var y = top + i * cell;
            var lab = s("text", { x: left - 6, y: y + cell / 2 + 4, "text-anchor": "end", style: "fill:" + (i === selected ? "var(--accent)" : "var(--ink)") + ";font:" + (i === selected ? "700 " : "") + "10px var(--body);cursor:pointer" }, t.slice(0, 13));
            lab.addEventListener("click", function () { selected = i; draw(); });
            svg.appendChild(lab);
            toks.forEach(function (u, j) {
              var w = W[i][j];
              var r = s("rect", { x: left + j * cell + 0.5, y: y + 0.5, width: cell - 1, height: cell - 1, style: "fill:var(--accent);fill-opacity:" + (0.04 + Math.min(1, w * 1.8) * 0.96).toFixed(3) + ";cursor:pointer" });
              r.appendChild(s("title", null, t + " → " + u + ": " + pct(w)));
              r.addEventListener("click", function () { selected = i; draw(); });
              svg.appendChild(r);
            });
          });
          svg.appendChild(s("rect", { x: left - 1, y: top + selected * cell, width: cell * n + 2, height: cell, style: "fill:none;stroke:var(--ink);stroke-width:1.5" }));

          var row = W[selected], order = row.map(function (v, j) { return j; }).sort(function (a, b) { return row[b] - row[a]; });
          clear(bars);
          bars.appendChild(h("p", { class: "wg-w2-note", text: "Where “" + toks[selected] + "” looks (top 5):" }));
          order.slice(0, 5).forEach(function (j) {
            var fill = h("span", { class: "wg-tf-fill" });
            fill.style.width = (row[j] * 100).toFixed(1) + "%";
            bars.appendChild(h("div", { class: "wg-tf-bar" }, [h("span", { class: "wg-tf-bl", text: toks[j] }), h("span", { class: "wg-tf-track" }, fill), h("span", { class: "wg-w2-val", text: pct(row[j]) })]));
          });
          var bestOther = order.filter(function (j) { return j !== selected; })[0];
          var q = toks[selected];
          if (bestOther == null) { mean.set("“" + q + "” can only look at itself here."); return; }
          var msg = "“" + q + "” puts " + pct(row[bestOther]) + " of its attention on “" + toks[bestOther] + "”, so its updated vector is mostly a blend of “" + toks[bestOther] + "”’s value.";
          if (PRON[norm(q)]) msg += " That is how the model works out what “" + q + "” refers to.";
          if (causal.checked && selected < 2) msg += " (Early words have little to look back at when attention only goes backwards.)";
          mean.set(msg);
        }
        build(presets[0].focus);
      }
    },

    /* =========================== CONTEXT WINDOW =========================== */
    context: {
      title: "Context window budget packer",
      intro: "Pick a window size and slide each part of the prompt. When the total overflows, see what gets cut first and what the model actually receives.",
      render: function (host) {
        var root = h("div", { class: "wg-w2" });
        host.appendChild(root);
        var parts = [
          { k: "sys", name: "System prompt", max: 8000, step: 100, v: 1500, col: "var(--accent)", op: 1 },
          { k: "tools", name: "Tool definitions", max: 20000, step: 250, v: 3000, col: "var(--packet)", op: 1 },
          { k: "hist", name: "Chat history", max: 120000, step: 500, v: 20000, col: "var(--hl)", op: 1 },
          { k: "ret", name: "Retrieved chunks", max: 60000, step: 500, v: 8000, col: "var(--muted)", op: 0.8 },
          { k: "out", name: "Output reserve", max: 32000, step: 500, v: 4000, col: "var(--line-strong)", op: 1 }
        ];
        var win = select("Context window size", [[8192, "8K tokens (8,192)"], [32000, "32K tokens"], [128000, "128K tokens"], [200000, "200K tokens"], [1000000, "1M tokens"]], 32000, draw);
        root.appendChild(win.wrap);
        var ctrls = h("div", { class: "wg-w2-controls" });
        parts.forEach(function (p) {
          p.sl = slider(p.name, { min: 0, max: p.max, step: p.step, value: p.v, fmt: function (v) { return fmtInt(v) + " tok"; }, onInput: draw });
          ctrls.appendChild(p.sl.wrap);
        });
        root.appendChild(ctrls);

        var conv = h("div", { class: "wg-w2-controls" });
        var words = field("Words-to-tokens helper: number of words", { type: "number", min: "0", step: "50", value: "750" }, convUpd);
        var convOut = h("div", { class: "wg-w2-field wg-cx-conv", "aria-live": "polite" });
        conv.appendChild(words.wrap); conv.appendChild(convOut);
        root.appendChild(conv);
        function convUpd() {
          var w = Math.max(0, words.num());
          convOut.textContent = fmtInt(w) + " words ≈ " + fmtInt(w * 1.33) + " tokens (rough English rule: tokens ≈ words × 1.33)";
        }
        convUpd();

        var svg = s("svg", { viewBox: "0 0 400 150", class: "wg-w2-svg wg-w2-cap", role: "img", "aria-label": "Stacked bars: requested tokens versus what is actually sent" });
        root.appendChild(svg);
        var legend = h("div", { class: "wg-cx-legend" });
        parts.forEach(function (p) {
          var sw = h("span", { class: "wg-cx-sw" }); sw.style.background = p.col; sw.style.opacity = p.op;
          legend.appendChild(h("span", null, [sw, p.name]));
        });
        root.appendChild(legend);
        var tbl = h("table", { class: "wg-w2-table" });
        root.appendChild(h("div", { class: "wg-w2-scroll" }, tbl));
        var mean = meaningBox();
        root.appendChild(mean.box);

        function draw() {
          var W = +win.sel.value;
          var v = {}; parts.forEach(function (p) { v[p.k] = p.sl.get(); });
          var total = parts.reduce(function (a, p) { return a + v[p.k]; }, 0);
          var over = Math.max(0, total - W);
          var cut = { hist: 0, ret: 0 };
          var rest = over;
          cut.hist = Math.min(v.hist, rest); rest -= cut.hist;
          cut.ret = Math.min(v.ret, rest); rest -= cut.ret;
          var impossible = rest > 0;
          if (impossible) cut = { hist: 0, ret: 0 };

          clear(svg);
          var scale = 380 / Math.max(total, W, 1), x0 = 10;
          function bar(y, label, getLen, dropped) {
            svg.appendChild(s("text", { x: x0, y: y - 6, style: "fill:var(--ink);font:600 12px var(--body)" }, label));
            var x = x0;
            parts.forEach(function (p) {
              var len = getLen(p);
              if (len <= 0) return;
              var r = s("rect", { x: x, y: y, width: len * scale, height: 30, style: "fill:" + p.col + ";fill-opacity:" + p.op + ";stroke:var(--surface);stroke-width:1" });
              r.appendChild(s("title", null, p.name + ": " + fmtInt(len) + " tokens"));
              svg.appendChild(r);
              x += len * scale;
            });
            if (dropped) {
              svg.appendChild(s("rect", { x: x, y: y, width: Math.max(0, x0 + W * scale - x), height: 30, style: "fill:none;stroke:var(--line-strong);stroke-dasharray:3 3" }));
            }
          }
          bar(26, "What you want to send: " + fmtInt(total) + " tokens", function (p) { return v[p.k]; });
          var sent = impossible ? 0 : total - over;
          bar(96, impossible ? "Actually sent: nothing (request rejected)" : "Actually sent: " + fmtInt(sent) + " tokens", function (p) { return impossible ? 0 : v[p.k] - (cut[p.k] || 0); }, !impossible);
          var wx = x0 + W * scale;
          [[22, 60], [92, 134]].forEach(function (seg) { svg.appendChild(s("line", { x1: wx, y1: seg[0], x2: wx, y2: seg[1], style: "stroke:var(--ink);stroke-width:2" })); });
          svg.appendChild(s("text", { x: Math.min(wx, 392), y: 146, "text-anchor": wx > 300 ? "end" : "middle", style: "fill:var(--ink);font:11px var(--body)" }, "window limit " + fmtInt(W)));

          clear(tbl);
          tbl.appendChild(h("thead", null, h("tr", null, [h("th", { text: "Part" }), h("th", { class: "wg-w2-num", text: "Tokens" }), h("th", { class: "wg-w2-num", text: "≈ Words" }), h("th", { class: "wg-w2-num", text: "Cut" })])));
          var tb = h("tbody");
          parts.forEach(function (p) {
            var c = cut[p.k] || 0;
            tb.appendChild(h("tr", { class: c > 0 ? "wg-w2-bad" : null }, [h("td", { text: p.name }), h("td", { class: "wg-w2-num", text: fmtInt(v[p.k]) }), h("td", { class: "wg-w2-num", text: fmtInt(v[p.k] / 1.33) }), h("td", { class: "wg-w2-num", text: c ? "-" + fmtInt(c) : "0" })]));
          });
          tb.appendChild(h("tr", null, [h("td", null, h("strong", { text: "Total" })), h("td", { class: "wg-w2-num", text: fmtInt(total) }), h("td", { class: "wg-w2-num", text: fmtInt(total / 1.33) }), h("td", { class: "wg-w2-num", text: impossible ? "rejected" : over ? "-" + fmtInt(over) : "0" })]));
          tbl.appendChild(tb);

          var msg;
          if (impossible) msg = "System prompt, tool definitions and output reserve alone need " + fmtInt(v.sys + v.tools + v.out) + " tokens, more than the " + fmtInt(W) + "-token window. Choose a bigger window or trim tools and instructions; cutting history cannot fix this.";
          else if (!over) msg = "Everything fits with " + fmtInt(W - total) + " tokens to spare (" + pct((W - total) / W) + " of the window). The model sees the whole conversation and all retrieved chunks.";
          else {
            msg = "You are " + fmtInt(over) + " tokens over. Truncation order: the oldest " + fmtInt(cut.hist) + " tokens of chat history are dropped (or summarised) first";
            msg += cut.ret ? ", then " + fmtInt(cut.ret) + " tokens of the lowest-ranked retrieved chunks. The model never sees what was cut, so it may miss facts it needs." : ". The model will not remember anything said in that cut part.";
          }
          mean.set(msg);
        }
        draw();
      }
    },

    /* =========================== RAG CHUNKING =========================== */
    rag: {
      title: "Chunking playground",
      intro: "Change chunk size, overlap and strategy, then type a question. See how the document is cut up and which chunks a simple keyword search would hand to the model.",
      render: function (host) {
        var DOC = "Returns and Refunds Policy\n\n" +
          "You can return most items within 30 days of delivery for a full refund. Items must be unused and in their original packaging. Sale items can only be exchanged, not refunded.\n\n" +
          "To start a return, open your order in the app and choose Return item. Print the prepaid label and drop the parcel at any post office. Refunds are issued to the original payment method within 5 business days after we receive the item.\n\n" +
          "Damaged or wrong items must be reported within 48 hours of delivery. Send a photo of the damage to our support team and we will ship a replacement at no cost.\n\n" +
          "Gift cards, custom engraved products and perishable food cannot be returned. If you paid with a gift card, your refund is issued as store credit.\n\n" +
          "International orders can be returned within 45 days, but the customer pays return shipping unless the item arrived damaged.";

        var root = h("div", { class: "wg-w2" });
        host.appendChild(root);
        var taId = nid("t");
        var ta = h("textarea", { id: taId, class: "wg-w2-in wg-rg-ta", rows: "8" });
        ta.value = DOC;
        ta.addEventListener("input", draw);
        root.appendChild(h("div", { class: "wg-w2-field" }, [h("label", { for: taId, text: "Document (edit or paste your own)" }), ta]));

        var ctrls = h("div", { class: "wg-w2-controls" });
        var strat = select("Strategy", [["fixed", "Fixed characters"], ["sentence", "By sentence"], ["para", "By paragraph"]], "fixed", draw);
        var size = slider("Chunk size", { min: 80, max: 800, step: 10, value: 250, fmt: function (v) { return v + " chars"; }, onInput: draw });
        var ov = slider("Overlap", { min: 0, max: 200, step: 10, value: 40, fmt: function (v) { return v + " chars"; }, onInput: draw });
        var qf = field("Question", { type: "text", value: "How many days do I have to return an international order?", maxlength: "200" }, draw);
        [strat.wrap, size.wrap, ov.wrap, qf.wrap].forEach(function (e) { ctrls.appendChild(e); });
        root.appendChild(ctrls);

        var stats = h("p", { class: "wg-w2-note", "aria-live": "polite" });
        root.appendChild(stats);
        var list = h("div", { class: "wg-rg-list" });
        root.appendChild(list);
        var mean = meaningBox();
        root.appendChild(mean.box);

        function pack(units, sz, olap, sep) {
          var chunks = [], cur = [], len = 0;
          units.forEach(function (u) {
            var ul = u.length + (cur.length ? sep.length : 0);
            if (cur.length && len + ul > sz) {
              chunks.push(cur.join(sep));
              var carry = [], cl = 0;
              for (var i = cur.length - 1; i >= 0; i--) {
                if (cl + cur[i].length > olap) break;
                carry.unshift(cur[i]); cl += cur[i].length + sep.length;
              }
              if (carry.length === cur.length) carry = [];
              cur = carry; len = cl;
            }
            cur.push(u); len += u.length + (cur.length > 1 ? sep.length : 0);
          });
          if (cur.length) chunks.push(cur.join(sep));
          return chunks;
        }
        function chunk(text, st, sz, olap) {
          text = text.replace(/\r/g, "").trim();
          if (!text) return [];
          if (st === "fixed") {
            var out = [], step = Math.max(10, sz - olap);
            for (var i = 0; i < text.length; i += step) {
              out.push(text.slice(i, i + sz));
              if (i + sz >= text.length) break;
            }
            return out;
          }
          if (st === "sentence") {
            var sents = text.split(/(?<=[.!?])\s+|\n+/).map(function (x) { return x.trim(); }).filter(Boolean);
            return pack(sents, sz, olap, " ");
          }
          var paras = text.split(/\n\s*\n/).map(function (x) { return x.trim(); }).filter(Boolean);
          return pack(paras, sz, olap, "\n\n");
        }
        function stem(w) {
          w = w.toLowerCase().replace(/[^a-z0-9]/g, "");
          if (w.length > 5 && /ed$/.test(w)) w = w.slice(0, -2);
          else if (w.length > 5 && /ing$/.test(w)) w = w.slice(0, -3);
          if (w.length > 3 && /s$/.test(w) && !/ss$/.test(w)) w = w.slice(0, -1);
          return w;
        }
        function keywords(q) {
          var seen = {}, out = [];
          q.split(/\s+/).forEach(function (w) {
            var raw = w.toLowerCase().replace(/[^a-z0-9]/g, "");
            if (!raw || STOP[raw] || raw.length < 2) return;
            var st = stem(raw);
            if (!seen[st]) { seen[st] = 1; out.push(st); }
          });
          return out;
        }
        function highlighted(text, kw) {
          var frag = document.createDocumentFragment();
          text.split(/(\s+)/).forEach(function (tok) {
            if (/^\s+$/.test(tok) || !tok) { frag.appendChild(document.createTextNode(tok)); return; }
            if (kw.indexOf(stem(tok)) >= 0) frag.appendChild(h("mark", { class: "wg-rg-mark", text: tok }));
            else frag.appendChild(document.createTextNode(tok));
          });
          return frag;
        }
        function draw() {
          if (ov.get() >= size.get()) ov.set(Math.max(0, size.get() - 10));
          var st = strat.sel.value;
          var chunks = chunk(ta.value, st, size.get(), ov.get());
          var kw = keywords(qf.inp.value);
          var scored = chunks.map(function (c, i) {
            var toks = {};
            c.split(/\s+/).forEach(function (w) { toks[stem(w)] = 1; });
            var hits = kw.filter(function (k) { return toks[k]; }).length;
            return { i: i, c: c, hits: hits, score: hits + hits / (10 + c.length / 20) };
          });
          var ranked = scored.slice().sort(function (a, b) { return b.score - a.score; }).filter(function (r) { return r.hits > 0; }).slice(0, 3);
          var rankOf = {};
          ranked.forEach(function (r, k) { rankOf[r.i] = k + 1; });

          var avg = chunks.length ? chunks.reduce(function (a, c) { return a + c.length; }, 0) / chunks.length : 0;
          stats.textContent = chunks.length + " chunks, average " + Math.round(avg) + " characters (≈ " + Math.round(avg / 4) + " tokens each). Keywords searched: " + (kw.length ? kw.join(", ") : "none");
          clear(list);
          scored.forEach(function (r) {
            var rk = rankOf[r.i];
            var box = h("div", { class: "wg-rg-chunk wg-rg-c" + (r.i % 3) + (rk ? " wg-rg-top" : "") }, [
              h("div", { class: "wg-rg-head" }, [
                h("span", { text: "Chunk " + (r.i + 1) + " · " + r.c.length + " chars" }),
                h("span", { class: rk ? "wg-rg-badge" : "wg-w2-note", text: rk ? "Rank " + rk + ": " + r.hits + " of " + kw.length + " keywords" : r.hits + " of " + kw.length + " keywords" })
              ]),
              h("div", { class: "wg-rg-text" }, highlighted(r.c, kw))
            ]);
            list.appendChild(box);
          });

          var msg;
          if (!chunks.length) msg = "The document is empty, so there is nothing to retrieve.";
          else if (!kw.length) msg = "Type a question with some content words to see which chunks would be retrieved.";
          else if (!ranked.length) msg = "No chunk shares a keyword with the question. Keyword search misses synonyms; embedding (meaning-based) search is what fixes this.";
          else {
            var b = ranked[0];
            msg = "The best chunk is #" + (b.i + 1) + " (" + b.hits + " of " + kw.length + " keywords), and the top " + ranked.length + " would be pasted into the prompt.";
            if (avg < 160) msg += " These chunks are small: precise, but an answer can be split across two chunks and lose its context.";
            else if (avg > 450) msg += " These chunks are large: each carries lots of unrelated text, which costs tokens and can distract the model.";
            else msg += " This size keeps most answers in one piece without much noise.";
            if (ov.get() > 0 && st !== "para") msg += " Overlap repeats a little text between neighbours so a fact on a boundary is not cut in half.";
          }
          mean.set(msg);
        }
        draw();
      }
    },

    /* =========================== LLM COST =========================== */
    llmcost: {
      title: "Token cost calculator",
      intro: "Set your traffic and prompt sizes, then compare two models. Try raising the cache hit rate or shrinking the output to see which lever moves the monthly bill most.",
      render: function (host) {
        var root = h("div", { class: "wg-w2" });
        host.appendChild(root);
        var shared = h("div", { class: "wg-w2-controls" });
        var req = field("Requests per day", { type: "number", min: "0", step: "100", value: "5000" }, draw);
        var inT = field("Input tokens per request", { type: "number", min: "0", step: "100", value: "3000" }, draw);
        var outT = field("Output tokens per request", { type: "number", min: "0", step: "50", value: "400" }, draw);
        var cache = slider("Cache hit (share of input tokens read from cache)", { min: 0, max: 100, step: 5, value: 50, fmt: function (v) { return v + "%"; }, onInput: draw });
        [req.wrap, inT.wrap, outT.wrap, cache.wrap].forEach(function (e) { shared.appendChild(e); });
        root.appendChild(shared);

        root.appendChild(h("p", { class: "wg-w2-note", text: "Example prices in US dollars per million tokens, check current rates for real models." }));
        var models = [
          { name: "Large model", pin: 3, pout: 15, pc: 0.3 },
          { name: "Small model", pin: 0.25, pout: 1.25, pc: 0.03 }
        ];
        var mgrid = h("div", { class: "wg-lc-models" });
        models.forEach(function (m, i) {
          var box = h("fieldset", { class: "wg-lc-model" }, [h("legend", { text: "Model " + (i ? "B" : "A") })]);
          m.f = {
            name: field("Name", { type: "text", value: m.name, maxlength: "30" }, draw),
            pin: field("Input $ / 1M tokens", { type: "number", min: "0", step: "0.05", value: String(m.pin) }, draw),
            pout: field("Output $ / 1M tokens", { type: "number", min: "0", step: "0.05", value: String(m.pout) }, draw),
            pc: field("Cached input $ / 1M tokens", { type: "number", min: "0", step: "0.01", value: String(m.pc) }, draw)
          };
          ["name", "pin", "pout", "pc"].forEach(function (k) { box.appendChild(m.f[k].wrap); });
          mgrid.appendChild(box);
        });
        root.appendChild(mgrid);

        var tbl = h("table", { class: "wg-w2-table" });
        root.appendChild(h("div", { class: "wg-w2-scroll" }, tbl));
        var svg = s("svg", { viewBox: "0 0 400 120", class: "wg-w2-svg wg-w2-cap", role: "img", "aria-label": "Monthly cost comparison split into input, cached input and output" });
        root.appendChild(svg);
        var legend = h("div", { class: "wg-cx-legend" });
        [["Fresh input", "var(--accent)"], ["Cached input", "var(--hl)"], ["Output", "var(--packet)"]].forEach(function (l) {
          var sw = h("span", { class: "wg-cx-sw" }); sw.style.background = l[1];
          legend.appendChild(h("span", null, [sw, l[0]]));
        });
        root.appendChild(legend);
        var mean = meaningBox();
        root.appendChild(mean.box);

        function draw() {
          var R = Math.max(0, req.num()), I = Math.max(0, inT.num()), O = Math.max(0, outT.num()), c = cache.get() / 100;
          var res = models.map(function (m) {
            var pin = Math.max(0, m.f.pin.num()), pout = Math.max(0, m.f.pout.num()), pc = Math.max(0, m.f.pc.num());
            var fresh = I * (1 - c) * pin / 1e6, cached = I * c * pc / 1e6, out = O * pout / 1e6;
            var per = fresh + cached + out;
            var noCache = (I * pin + O * pout) / 1e6;
            return { name: m.f.name.inp.value.trim() || "Model", fresh: fresh, cached: cached, out: out, per: per, day: per * R, month: per * R * 30, noCacheMonth: noCache * R * 30 };
          });
          clear(tbl);
          tbl.appendChild(h("thead", null, h("tr", null, [h("th", { text: "" }), h("th", { class: "wg-w2-num", text: res[0].name }), h("th", { class: "wg-w2-num", text: res[1].name })])));
          var tb = h("tbody");
          [["Cost per request", "per"], ["Cost per day", "day"], ["Cost per month (30 days)", "month"]].forEach(function (r) {
            tb.appendChild(h("tr", null, [h("td", { text: r[0] }), h("td", { class: "wg-w2-num", text: money(res[0][r[1]]) }), h("td", { class: "wg-w2-num", text: money(res[1][r[1]]) })]));
          });
          tb.appendChild(h("tr", null, [h("td", { text: "Share of bill from output" }),
            h("td", { class: "wg-w2-num", text: res[0].per ? pct(res[0].out / res[0].per) : "-" }),
            h("td", { class: "wg-w2-num", text: res[1].per ? pct(res[1].out / res[1].per) : "-" })]));
          tbl.appendChild(tb);

          clear(svg);
          var mx = Math.max(res[0].month, res[1].month, 1e-9), left = 10, wmax = 300;
          res.forEach(function (r, i) {
            var y = 12 + i * 54;
            svg.appendChild(s("text", { x: left, y: y + 8, style: "fill:var(--ink);font:600 12px var(--body)" }, r.name.slice(0, 30)));
            var x = left;
            [["fresh", "var(--accent)"], ["cached", "var(--hl)"], ["out", "var(--packet)"]].forEach(function (p) {
              var w = (r[p[0]] * R * 30) / mx * wmax;
              if (w > 0) svg.appendChild(s("rect", { x: x, y: y + 14, width: w, height: 24, style: "fill:" + p[1] + ";stroke:var(--surface);stroke-width:1" }));
              x += w;
            });
            svg.appendChild(s("text", { x: x + 6, y: y + 31, style: "fill:var(--ink);font:12px var(--mono)" }, money(r.month) + "/mo"));
          });

          var a = res[0], b = res[1], msg;
          if (!a.month && !b.month) msg = "With zero traffic or zero prices there is nothing to pay.";
          else {
            var cheap = a.month <= b.month ? a : b, dear = cheap === a ? b : a;
            var diff = dear.month - cheap.month;
            msg = cheap.name + " costs " + money(cheap.month) + " a month versus " + money(dear.month) + " for " + dear.name + (dear.month ? " (" + pct(diff / dear.month) + " less, " + money(diff * 12) + " a year)." : ".");
            var save = a.noCacheMonth - a.month;
            if (c > 0 && save > 0) msg += " Caching " + cache.get() + "% of input saves " + a.name + " " + money(save) + " a month versus no caching.";
            else if (c === 0) msg += " Try raising the cache hit rate: repeated system prompts and documents are cheap to re-read from cache.";
          }
          mean.set(msg);
        }
        draw();
      }
    }
  });
})();

WIDGET_CSS += `
.wg-w2 { display:flex; flex-direction:column; gap:12px; font-family:var(--body); color:var(--ink); min-width:0; }
.wg-w2 * { box-sizing:border-box; }
.wg-w2-note { margin:0; color:var(--muted); font-size:13px; line-height:1.45; }
.wg-w2-controls { display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:10px 18px; }
.wg-w2-field { display:flex; flex-direction:column; gap:4px; font-size:14px; min-width:0; }
.wg-w2-lrow { display:flex; justify-content:space-between; gap:8px; align-items:baseline; }
.wg-w2-val { font-family:var(--mono); font-size:13px; color:var(--accent); white-space:nowrap; }
.wg-w2-in { font:inherit; font-size:14px; padding:5px 7px; border:1px solid var(--line-strong); border-radius:6px; background:var(--surface); color:var(--ink); width:100%; min-width:0; }
.wg-w2-in:focus-visible, .wg-w2-btn:focus-visible, .wg-tf-word:focus-visible, .wg-w2 input[type=range]:focus-visible { outline:2px solid var(--accent); outline-offset:2px; }
.wg-w2 input[type=range] { width:100%; accent-color:var(--accent); margin:2px 0; }
.wg-w2-btns { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
.wg-w2-btn { font:inherit; font-size:14px; padding:6px 12px; border-radius:6px; border:1px solid var(--accent); background:var(--accent); color:var(--accent-ink); cursor:pointer; }
.wg-w2-btn.wg-w2-ghost { background:transparent; color:var(--accent); }
.wg-w2-mean { border-left:3px solid var(--accent); background:var(--accent-soft); color:var(--ink); padding:8px 11px; border-radius:6px; font-size:14px; line-height:1.5; }
.wg-w2-code { font-family:var(--mono); font-size:12.5px; background:var(--code-bg); color:var(--ink); padding:8px 10px; border-radius:6px; white-space:pre-wrap; word-break:break-word; line-height:1.5; }
.wg-w2-svg { width:100%; height:auto; display:block; }
.wg-w2-cap { max-width:560px; }
.wg-w2-scroll { overflow-x:auto; max-width:100%; }
.wg-w2-table { width:100%; border-collapse:collapse; font-size:13px; }
.wg-w2-table th, .wg-w2-table td { text-align:left; padding:4px 6px; border-bottom:1px solid var(--line); }
.wg-w2-table th { color:var(--muted); font-weight:600; }
.wg-w2-table .wg-w2-num { text-align:right; font-family:var(--mono); white-space:nowrap; }
.wg-w2-table tr.wg-w2-hit td { background:var(--accent-soft); font-weight:600; }
.wg-w2-table tr.wg-w2-bad td { background:var(--hl); }
.wg-w2-check { display:flex; gap:8px; align-items:flex-start; font-size:14px; }
.wg-w2-check input { margin-top:3px; accent-color:var(--accent); }
.wg-sm-grid { display:flex; flex-direction:column; gap:6px; }
.wg-sm-row { display:grid; grid-template-columns:auto minmax(0,1fr) auto 5.5em; gap:6px 8px; align-items:center; font-size:14px; }
.wg-sm-draw { font-size:14px; color:var(--ink); flex:1 1 200px; }
.wg-em-plane { max-width:480px; margin:0 auto; touch-action:none; cursor:crosshair; border:1px solid var(--line); border-radius:8px; background:var(--surface); }
.wg-tf-words { display:flex; flex-wrap:wrap; gap:6px; }
.wg-tf-word { font:inherit; font-size:14px; padding:4px 8px; border-radius:6px; border:1px solid var(--line-strong); background:var(--surface); color:var(--ink); cursor:pointer; }
.wg-tf-word[aria-pressed=true] { outline:2px solid var(--ink); outline-offset:1px; font-weight:600; }
.wg-tf-bars { display:flex; flex-direction:column; gap:4px; }
.wg-tf-bar { display:grid; grid-template-columns:7em minmax(0,1fr) 3.5em; gap:8px; align-items:center; font-size:13px; }
.wg-tf-bl { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.wg-tf-track { height:12px; background:var(--code-bg); border-radius:3px; overflow:hidden; display:block; }
.wg-tf-fill { display:block; height:100%; background:var(--accent); }
.wg-tf-qkv { margin:0; padding-left:18px; font-size:14px; line-height:1.5; }
.wg-cx-legend { display:flex; flex-wrap:wrap; gap:6px 14px; font-size:13px; color:var(--ink); }
.wg-cx-legend > span { display:inline-flex; align-items:center; gap:5px; }
.wg-cx-sw { display:inline-block; width:12px; height:12px; border-radius:2px; border:1px solid var(--line); }
.wg-cx-conv { justify-content:flex-end; font-size:13px; color:var(--muted); }
.wg-rg-ta { font-family:var(--mono); font-size:12.5px; line-height:1.45; resize:vertical; }
.wg-rg-list { display:flex; flex-direction:column; gap:8px; max-height:420px; overflow-y:auto; padding-right:2px; }
.wg-rg-chunk { border:1px solid var(--line); border-left-width:5px; border-radius:6px; padding:6px 9px; background:var(--surface); }
.wg-rg-c0 { border-left-color:var(--accent); }
.wg-rg-c1 { border-left-color:var(--packet); }
.wg-rg-c2 { border-left-color:var(--muted); }
.wg-rg-top { background:var(--accent-soft); border-color:var(--accent); }
.wg-rg-head { display:flex; justify-content:space-between; flex-wrap:wrap; gap:4px 10px; font-size:12px; color:var(--muted); margin-bottom:3px; }
.wg-rg-badge { font-weight:700; color:var(--accent); }
.wg-rg-text { font-size:13px; line-height:1.45; white-space:pre-wrap; word-break:break-word; }
.wg-rg-mark { background:var(--hl); color:var(--ink); border-radius:2px; padding:0 1px; }
.wg-lc-models { display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; }
.wg-lc-model { border:1px solid var(--line); border-radius:8px; padding:8px 12px 12px; margin:0; display:flex; flex-direction:column; gap:8px; min-width:0; }
.wg-lc-model legend { font-weight:700; padding:0 4px; }
`;
