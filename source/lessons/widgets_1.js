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
  function uid() { return "wgw1-" + Math.random().toString(36).slice(2, 10); }
  function fmt(x, d) {
    if (!isFinite(x)) return "infinite";
    return x.toLocaleString("en-US", { maximumFractionDigits: d == null ? 0 : d });
  }
  function fmtBig(x) {
    if (!isFinite(x)) return "infinite";
    if (Math.abs(x) >= 1e12) {
      var e = Math.floor(Math.log10(x));
      return fmt(x / Math.pow(10, e), 2) + " × 10^" + e;
    }
    return fmt(Math.round(x));
  }
  function pct(x, d) { return fmt(x * 100, d == null ? 1 : d) + "%"; }
  function fmtDur(sec) {
    if (!isFinite(sec)) return "forever";
    if (sec < 1e-6) return fmt(sec * 1e9, 1) + " ns";
    if (sec < 1e-3) return fmt(sec * 1e6, 1) + " µs";
    if (sec < 1) return fmt(sec * 1e3, 1) + " ms";
    if (sec < 60) return fmt(sec, 1) + " s";
    if (sec < 3600) return fmt(sec / 60, 1) + " min";
    if (sec < 86400) return fmt(sec / 3600, 1) + " hours";
    if (sec < 86400 * 365) return fmt(sec / 86400, 1) + " days";
    return fmtBig(sec / (86400 * 365)) + " years";
  }
  function field(labelText, control, valueEl) {
    var id = control.id || (control.id = uid());
    return h("div", { class: "wg-w1-field" },
      h("label", { class: "wg-w1-lab", for: id }, h("span", null, labelText), valueEl || null),
      control);
  }
  function slider(labelText, o, cb) {
    var inp = h("input", { type: "range", min: o.min, max: o.max, step: o.step || 1, value: o.value });
    var out = h("output", { class: "wg-w1-val" });
    function upd() { out.textContent = o.fmt ? o.fmt(+inp.value) : inp.value; }
    inp.addEventListener("input", function () { upd(); if (cb) cb(); });
    upd();
    return { el: field(labelText, inp, out), input: inp, get: function () { return +inp.value; }, set: function (v) { inp.value = v; upd(); } };
  }
  function select(labelText, options, value, cb) {
    var sel = h("select", null, options.map(function (o) {
      return h("option", { value: o[0], selected: String(o[0]) === String(value) }, o[1]);
    }));
    sel.addEventListener("change", function () { if (cb) cb(); });
    return { el: field(labelText, sel), input: sel, get: function () { return sel.value; } };
  }
  function num(labelText, value, o, cb) {
    o = o || {};
    var inp = h("input", { type: "number", value: value, min: o.min, max: o.max, step: o.step || "any", inputmode: "decimal" });
    inp.addEventListener("input", function () { if (cb) cb(); });
    return {
      el: field(labelText, inp), input: inp,
      get: function () { var v = parseFloat(inp.value); if (!isFinite(v)) v = o.fallback != null ? o.fallback : 0; if (o.min != null) v = Math.max(o.min, v); if (o.max != null) v = Math.min(o.max, v); return v; }
    };
  }
  function text(labelText, value, cb, tagName) {
    var inp = tagName === "textarea" ? h("textarea", { rows: 3, spellcheck: "false" }) : h("input", { type: "text", spellcheck: "false", autocomplete: "off" });
    inp.value = value;
    inp.addEventListener("input", function () { if (cb) cb(); });
    return { el: field(labelText, inp), input: inp, get: function () { return inp.value; } };
  }
  function btn(label, onclick, primary) {
    return h("button", { type: "button", class: "wg-w1-btn" + (primary ? " wg-w1-primary" : ""), onclick: onclick }, label);
  }
  function stat(label) {
    var v = h("div", { class: "wg-w1-stat-v" }), sub = h("div", { class: "wg-w1-stat-s" });
    var el = h("div", { class: "wg-w1-stat" }, h("div", { class: "wg-w1-stat-l" }, label), v, sub);
    return { el: el, set: function (val, subText, tone) { v.textContent = val; sub.textContent = subText || ""; el.classList.toggle("wg-w1-hot", tone === "hot"); el.classList.toggle("wg-w1-good", tone === "good"); } };
  }
  function meaning() {
    var span = h("span");
    var el = h("p", { class: "wg-w1-mean", "aria-live": "polite" }, h("strong", null, "What this means: "), span);
    return { el: el, set: function (t) { span.textContent = t; } };
  }
  function table(headers, rows, numCols, rowClass) {
    numCols = numCols || [];
    var t = h("table", { class: "wg-w1-table" },
      h("thead", null, h("tr", null, headers.map(function (x, i) { return h("th", { class: numCols.indexOf(i) >= 0 ? "wg-w1-num" : null }, x); }))),
      h("tbody", null, rows.map(function (r, ri) {
        return h("tr", { class: rowClass ? rowClass(ri) : null }, r.map(function (c, i) { return h("td", { class: numCols.indexOf(i) >= 0 ? "wg-w1-num" : null }, c == null ? "" : String(c)); }));
      })));
    return h("div", { class: "wg-w1-tablewrap" }, t);
  }
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
  function fitW(svg, H) {
    var p = svg.parentNode, W = p && p.clientWidth ? Math.max(300, Math.min(900, p.clientWidth)) : 600;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    return W;
  }
  function shell(host) { var w = h("div", { class: "wg-w1" }); host.appendChild(w); return w; }
  function sub(title) { return h("h4", { class: "wg-w1-h" }, title); }

  /* ---------- normal distribution helpers ---------- */
  function erf(x) {
    var sgn = x < 0 ? -1 : 1; x = Math.abs(x);
    var t = 1 / (1 + 0.3275911 * x);
    var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return sgn * y;
  }
  function phi(z) { return 0.5 * (1 + erf(z / Math.SQRT2)); }

  Object.assign(WIDGETS, {
    /* ================= computers ================= */
    computers: {
      title: "Number and text converter",
      intro: "Type a number in decimal, binary or hex and the others update. Click any bit to flip it. Then type some text, including an accent or an emoji, and see how many bytes it really takes.",
      render: function (host) {
        var w = shell(host);
        var err = h("p", { class: "wg-w1-note wg-w1-err", role: "status" });
        var dec, bin, hex;
        function onEdit(which) { return function () { fromField(which); }; }
        dec = text("Decimal (base 10)", "200", null); dec.name = "decimal";
        bin = text("Binary (base 2)", "", null); bin.name = "binary";
        hex = text("Hexadecimal (base 16)", "", null); hex.name = "hex";
        [dec, bin, hex].forEach(function (f) { f.input.addEventListener("input", onEdit(f)); f.input.classList.add("wg-w1-mono"); });
        var bits = h("div", { class: "wg-cmp-bits", role: "group", "aria-label": "Bits, click to flip" });
        var sBits = stat("Bits needed"), sBytes = stat("Bytes needed"), sMax = stat("Largest value in that many bytes");
        var m1 = meaning();
        var value = 200n;
        var LIMIT = 1n << 64n;

        function setValue(v, except) {
          value = v;
          if (except !== dec) dec.input.value = v.toString(10);
          if (except !== bin) bin.input.value = v.toString(2);
          if (except !== hex) hex.input.value = v.toString(16).toUpperCase();
          draw();
        }
        function fromField(f) {
          var raw = f.input.value.trim().replace(/[\s_,]/g, "");
          var v = null;
          if (f === dec && /^\d+$/.test(raw)) v = BigInt(raw);
          if (f === bin && /^(0b)?[01]+$/i.test(raw)) v = BigInt("0b" + raw.replace(/^0b/i, ""));
          if (f === hex && /^(0x)?[0-9a-f]+$/i.test(raw)) v = BigInt("0x" + raw.replace(/^0x/i, ""));
          if (v === null) { err.textContent = "That is not a valid " + f.name + " number. " + (f === bin ? "Use only 0 and 1." : f === hex ? "Use 0-9 and A-F." : "Use digits 0-9."); return; }
          if (v >= LIMIT) { err.textContent = "Keep it below 2^64 (the biggest a 64-bit number can hold)."; return; }
          err.textContent = "";
          setValue(v, f);
        }
        function draw() {
          var nb = value === 0n ? 1 : value.toString(2).length;
          var bytes = Math.ceil(nb / 8);
          var width = bytes * 8;
          var str = value.toString(2).padStart(width, "0");
          clear(bits);
          for (var b = 0; b < bytes; b++) {
            var grp = h("div", { class: "wg-cmp-byte" });
            var row = h("div", { class: "wg-cmp-byterow" });
            for (var i = 0; i < 8; i++) {
              var idx = b * 8 + i, power = width - 1 - idx, on = str[idx] === "1";
              (function (power, on) {
                row.appendChild(h("button", {
                  type: "button", class: "wg-cmp-bit" + (on ? " wg-cmp-on" : ""),
                  "aria-label": "Bit worth 2^" + power + ", currently " + (on ? 1 : 0) + ". Click to flip.",
                  title: "2^" + power + " = " + (1n << BigInt(power)).toString(),
                  onclick: function () { setValue(value ^ (1n << BigInt(power))); }
                }, on ? "1" : "0"));
              })(power, on);
            }
            grp.appendChild(row);
            var byteVal = parseInt(str.substr(b * 8, 8), 2);
            grp.appendChild(h("div", { class: "wg-w1-note wg-cmp-cap" }, "byte " + (bytes - b) + ": hex " + byteVal.toString(16).toUpperCase().padStart(2, "0") + " = " + byteVal));
            bits.appendChild(grp);
          }
          var maxV = (1n << BigInt(width)) - 1n;
          sBits.set(String(nb), "binary digits");
          sBytes.set(String(bytes), bytes === 1 ? "1 byte = 8 bits" : bytes + " bytes = " + width + " bits");
          sMax.set(maxV.toLocaleString("en-US"), "2^" + width + " - 1");
          m1.set(value.toLocaleString("en-US") + " needs " + nb + " bit" + (nb > 1 ? "s" : "") + ", so it fits in " + bytes + " byte" + (bytes > 1 ? "s" : "") +
            " (which can hold 0 to " + maxV.toLocaleString("en-US") + "). Each hex digit is exactly 4 bits, which is why " + (value.toString(16).length) + " hex digit" + (value.toString(16).length > 1 ? "s" : "") + " describe the same number more compactly than " + nb + " binary digits.");
        }

        // text part
        var str = text("Text to encode as UTF-8", "Héllo 👋", function () { drawText(); });
        var chips = h("div", { class: "wg-cmp-chips" });
        var sChars = stat("Characters"), sUtf = stat("UTF-8 bytes"), sUtf16 = stat("JavaScript .length");
        var m2 = meaning();
        var enc = new TextEncoder();
        function drawText() {
          var t = str.get();
          var chars = Array.from(t);
          var total = enc.encode(t).length;
          clear(chips);
          var counts = { 1: 0, 2: 0, 3: 0, 4: 0 };
          chars.forEach(function (c, i) {
            var bytesArr = enc.encode(c);
            counts[bytesArr.length] = (counts[bytesArr.length] || 0) + 1;
            if (i < 40) {
              chips.appendChild(h("div", { class: "wg-cmp-chip wg-cmp-b" + bytesArr.length },
                h("div", { class: "wg-cmp-ch" }, c === " " ? "space" : c),
                h("div", { class: "wg-cmp-cp" }, "U+" + c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")),
                h("div", { class: "wg-cmp-bytes" }, Array.from(bytesArr).map(function (x) { return x.toString(16).toUpperCase().padStart(2, "0"); }).join(" ")),
                h("div", { class: "wg-w1-note" }, bytesArr.length + " byte" + (bytesArr.length > 1 ? "s" : ""))));
            }
          });
          if (chars.length > 40) chips.appendChild(h("div", { class: "wg-w1-note" }, "+ " + (chars.length - 40) + " more characters"));
          sChars.set(String(chars.length), "what a person counts");
          sUtf.set(String(total), "what storage and networks count");
          sUtf16.set(String(t.length), "UTF-16 code units, a third answer");
          if (!chars.length) { m2.set("Empty text takes 0 bytes."); return; }
          var parts = [];
          var names = { 1: "plain English letters, digits and punctuation take 1 byte", 2: "most accented and Greek/Cyrillic letters take 2", 3: "most Chinese, Japanese, Hindi and similar characters take 3", 4: "emoji take 4" };
          [1, 2, 3, 4].forEach(function (k) { if (counts[k]) parts.push(names[k]); });
          m2.set("This text is " + chars.length + " character" + (chars.length > 1 ? "s" : "") + " but " + total + " byte" + (total > 1 ? "s" : "") + " in UTF-8: " + parts.join(", ") + ". Limits like \"max 255 bytes\" in databases and APIs count bytes, not characters.");
        }

        add(w, [
          sub("1. One number, three ways to write it"),
          h("div", { class: "wg-w1-controls" }, dec.el, bin.el, hex.el),
          err,
          h("div", { class: "wg-w1-row" },
            btn("Add 1", function () { if (value + 1n < LIMIT) setValue(value + 1n); }),
            btn("Subtract 1", function () { if (value > 0n) setValue(value - 1n); }),
            btn("Try 255", function () { setValue(255n); }),
            btn("Try 256", function () { setValue(256n); })),
          bits,
          h("div", { class: "wg-w1-stats" }, sBits.el, sBytes.el, sMax.el),
          m1.el,
          sub("2. How many bytes is this text?"),
          str.el,
          chips,
          h("div", { class: "wg-w1-stats" }, sChars.el, sUtf.el, sUtf16.el),
          m2.el
        ]);
        setValue(200n);
        drawText();
      }
    },

    /* ================= bigo ================= */
    bigo: {
      title: "Big-O growth explorer",
      intro: "Drag n (the number of items) and watch how the work for each complexity class grows. The table shows how long each would take on a machine doing a fixed number of simple operations per second.",
      render: function (host) {
        var w = shell(host);
        var NS = [10, 20, 50, 100, 200, 500, 1e3, 2e3, 5e3, 1e4, 2e4, 5e4, 1e5, 2e5, 5e5, 1e6, 1e7, 1e8, 1e9];
        var nS = slider("Input size n", { min: 0, max: NS.length - 1, value: 12, fmt: function (i) { return fmt(NS[i]) + " items"; } }, draw);
        var scale = select("Y axis", [["log", "Log (gridlines ×10)"], ["lin", "Linear (true proportions)"]], "log", draw);
        var ops = num("Operations per second (example machine speed)", 1e8, { min: 1, fallback: 1e8 }, draw);
        var CL = [
          { k: "O(1)", f: function () { return 1; }, ex: "dictionary lookup", c: "var(--muted)", d: "2 4" },
          { k: "O(log n)", f: function (n) { return Math.max(1, Math.log2(n)); }, ex: "binary search", c: "var(--muted)", d: "8 4" },
          { k: "O(n)", f: function (n) { return n; }, ex: "one loop over a list", c: "var(--accent)", d: "" },
          { k: "O(n log n)", f: function (n) { return n * Math.max(1, Math.log2(n)); }, ex: "sorting", c: "var(--ink)", d: "" },
          { k: "O(n^2)", f: function (n) { return n * n; }, ex: "loop inside a loop (all pairs)", c: "var(--packet)", d: "", wide: 1 }
        ];
        var svg = s("svg", { viewBox: "0 0 600 300", class: "wg-w1-svg", role: "img", "aria-label": "Growth of operations for each complexity class" });
        var tblHost = h("div");
        var m = meaning();
        var clipId = uid();
        add(w, [h("div", { class: "wg-w1-controls" }, nS.el, scale.el, ops.el), svg, tblHost, m.el]);

        function draw() {
          var n = NS[nS.get()], log = scale.get() === "log", rate = ops.get();
          var VW = fitW(svg, 300), L = 56, R = VW - 96, T = 12, B = 268;
          clear(svg);
          var ymax = log ? Math.pow(10, Math.ceil(Math.log10(n * n))) : Math.max(10, n * Math.log2(n) * 2.2);
          function X(x) { return L + (x - 1) / Math.max(1, n - 1) * (R - L); }
          function Y(y) {
            if (log) return B - Math.log10(Math.max(1, y)) / Math.log10(ymax) * (B - T);
            return B - y / ymax * (B - T);
          }
          svg.appendChild(s("defs", null, s("clipPath", { id: clipId }, s("rect", { x: L, y: T, width: R - L, height: B - T }))));
          // gridlines
          var ticks = [];
          if (log) {
            var top = Math.log10(ymax), step = Math.max(1, Math.ceil(top / 6));
            for (var e = 0; e <= top; e += step) ticks.push(Math.pow(10, e));
          } else {
            for (var i = 0; i <= 4; i++) ticks.push(ymax * i / 4);
          }
          ticks.forEach(function (t) {
            svg.appendChild(s("line", { x1: L, x2: R, y1: Y(t), y2: Y(t), stroke: "var(--line)", "stroke-width": 1 }));
            svg.appendChild(s("text", { x: L - 6, y: Y(t) + 4, "text-anchor": "end", "font-size": 12, fill: "var(--muted)", "font-family": "var(--mono)", text: shortNum(t) }));
          });
          svg.appendChild(s("line", { x1: L, x2: R, y1: B, y2: B, stroke: "var(--line-strong)" }));
          [1, n / 2, n].forEach(function (x) {
            svg.appendChild(s("text", { x: X(x), y: B + 16, "text-anchor": x === 1 ? "start" : x === n ? "end" : "middle", "font-size": 12, fill: "var(--muted)", "font-family": "var(--mono)", text: "n=" + shortNum(x) }));
          });
          var labels = [];
          CL.forEach(function (c) {
            var pts = [];
            for (var i = 0; i <= 100; i++) { var x = 1 + (n - 1) * i / 100; pts.push(X(x).toFixed(1) + "," + Y(c.f(x)).toFixed(1)); }
            svg.appendChild(s("polyline", { points: pts.join(" "), fill: "none", stroke: c.c, "stroke-width": c.wide ? 3.5 : 2.5, "stroke-dasharray": c.d, "clip-path": "url(#" + clipId + ")" }));
            var yEnd = Y(c.f(n));
            labels.push({ c: c, y: yEnd < T ? T + 4 : yEnd, off: yEnd < T });
          });
          labels.sort(function (a, b) { return a.y - b.y; });
          for (var j = 1; j < labels.length; j++) if (labels[j].y - labels[j - 1].y < 14) labels[j].y = labels[j - 1].y + 14;
          labels.forEach(function (lb) {
            svg.appendChild(s("text", { x: R + 6, y: lb.y + 4, "font-size": 12, fill: "var(--ink)", "font-family": "var(--mono)", "font-weight": 600, text: lb.c.k.replace("^2", "²") + (lb.off ? " ↑" : "") }));
          });
          // table
          clear(tblHost);
          tblHost.appendChild(table(["Class", "Typical example", "Operations at n", "Time at this speed"],
            CL.map(function (c) { var o = c.f(n); return [c.k.replace("^2", "²"), c.ex, fmtBig(o), fmtDur(o / rate)]; }), [2, 3]));
          var a = n * n, b = n * Math.log2(n);
          var verdict = a / rate > 1 ? " A nested loop that feels instant on 100 test rows is " + (a / rate > 3600 ? "unusable" : "painfully slow") + " here." : " At this size even O(n²) is still fast; the gap explodes as n grows.";
          m.set("At n = " + fmt(n) + ", O(n²) does " + fmtBig(a) + " operations (" + fmtDur(a / rate) + ") while O(n log n) does " + fmtBig(b) + " (" + fmtDur(b / rate) + "), about " + fmtBig(a / b) + "× less work." + verdict);
        }
        function shortNum(x) {
          if (x >= 1e12) return "1e" + Math.round(Math.log10(x));
          if (x >= 1e9) return fmt(x / 1e9, 1) + "B";
          if (x >= 1e6) return fmt(x / 1e6, 1) + "M";
          if (x >= 1e3) return fmt(x / 1e3, 1) + "k";
          return fmt(x, 1);
        }
        draw(); requestAnimationFrame(function () { if (host.isConnected) draw(); });
      }
    },

    /* ================= sql ================= */
    sql: {
      title: "SQL clause order and query playground",
      intro: "First, put the clauses in the order you write them and compare it with the order the database runs them. Then build a query on a tiny orders table with the dropdowns and watch which rows survive each step.",
      render: function (host) {
        var w = shell(host);
        var CLAUSES = [
          { k: "SELECT", ex: "SELECT region, SUM(amount) AS total", step: 5, why: "compute the output columns and aliases like total" },
          { k: "FROM", ex: "FROM orders", step: 1, why: "pick the table(s) and do any JOINs" },
          { k: "WHERE", ex: "WHERE status = 'paid'", step: 2, why: "throw away rows that fail the condition" },
          { k: "GROUP BY", ex: "GROUP BY region", step: 3, why: "put remaining rows into buckets" },
          { k: "HAVING", ex: "HAVING SUM(amount) > 100", step: 4, why: "throw away whole groups" },
          { k: "ORDER BY", ex: "ORDER BY total DESC", step: 6, why: "sort the output (aliases now exist)" },
          { k: "LIMIT", ex: "LIMIT 5", step: 7, why: "keep only the first rows" }
        ];
        var START = [5, 1, 0, 6, 3, 2, 4];
        var order = START.slice();
        var list = h("ol", { class: "wg-sql-list" });
        var status = h("p", { class: "wg-w1-note", "aria-live": "polite" });
        var execList = h("ol", { class: "wg-sql-exec" });
        var m1 = meaning();
        function move(pos, d) { var t = pos + d; if (t < 0 || t >= order.length) return; var x = order[pos]; order[pos] = order[t]; order[t] = x; drawOrder(pos + d); }
        function drawOrder(focusPos) {
          clear(list);
          var right = 0;
          order.forEach(function (ci, pos) {
            var c = CLAUSES[ci], ok = ci === pos;
            if (ok) right++;
            var up = h("button", { type: "button", class: "wg-w1-btn wg-sql-mv", "aria-label": "Move " + c.k + " up", disabled: pos === 0, onclick: function () { move(pos, -1); } }, "↑");
            var dn = h("button", { type: "button", class: "wg-w1-btn wg-sql-mv", "aria-label": "Move " + c.k + " down", disabled: pos === order.length - 1, onclick: function () { move(pos, 1); } }, "↓");
            list.appendChild(h("li", { class: "wg-sql-item" + (ok ? " wg-sql-ok" : "") },
              h("code", { class: "wg-sql-code" }, c.ex),
              h("span", { class: "wg-sql-runs" }, "runs " + ordinal(c.step)),
              h("span", { class: "wg-w1-row wg-sql-btns" }, up, dn)));
            if (focusPos === pos) setTimeout(function () { (focusPos > 0 ? up : dn).focus(); }, 0);
          });
          var done = right === CLAUSES.length;
          status.textContent = done ? "All 7 in the right written order." : right + " of 7 clauses are in the right written position (highlighted).";
          m1.set(done
            ? "You write SELECT first, but the database runs it 5th. That is why WHERE total > 100 fails (the alias total does not exist yet when WHERE runs) while ORDER BY total works, and why filters on groups need HAVING, not WHERE."
            : "Keep going: the written order starts with SELECT and FROM. Notice the \"runs\" number next to each clause; it rarely matches where you write it.");
        }
        function ordinal(n) { return n + (["th", "st", "nd", "rd"][n] || "th"); }
        CLAUSES.slice().sort(function (a, b) { return a.step - b.step; }).forEach(function (c) {
          execList.appendChild(h("li", null, h("strong", null, c.k), " ", h("span", { class: "wg-w1-note" }, c.why)));
        });

        // playground
        var ROWS = [
          [1, "Acme", "EU", "Widget", 120, "paid"], [2, "Birch", "US", "Gadget", 45, "paid"],
          [3, "Acme", "EU", "Gadget", 80, "refunded"], [4, "Cobalt", "APAC", "Widget", 200, "paid"],
          [5, "Birch", "US", "Widget", 30, "pending"], [6, "Dune", "EU", "Gizmo", 60, "paid"],
          [7, "Cobalt", "APAC", "Gizmo", 95, "paid"], [8, "Acme", "EU", "Widget", 150, "pending"],
          [9, "Dune", "EU", "Gadget", 40, "paid"], [10, "Birch", "US", "Gizmo", 75, "paid"]
        ];
        var COLS = ["id", "customer", "region", "product", "amount", "status"];
        var WHERES = [
          ["none", "(no filter)", null, function () { return true; }],
          ["paid", "status = 'paid'", "status = 'paid'", function (r) { return r[5] === "paid"; }],
          ["notref", "status <> 'refunded'", "status <> 'refunded'", function (r) { return r[5] !== "refunded"; }],
          ["eu", "region = 'EU'", "region = 'EU'", function (r) { return r[2] === "EU"; }],
          ["gt50", "amount > 50", "amount > 50", function (r) { return r[4] > 50; }]
        ];
        var wSel = select("WHERE (filter rows)", WHERES.map(function (x) { return [x[0], x[1]]; }), "paid", runQ);
        var gSel = select("GROUP BY", [["none", "(no grouping)"], ["customer", "customer"], ["region", "region"], ["product", "product"], ["status", "status"]], "region", runQ);
        var aSel = select("Aggregate", [["none", "(none, show rows)"], ["COUNT", "COUNT(*)"], ["SUM", "SUM(amount)"], ["AVG", "AVG(amount)"], ["MAX", "MAX(amount)"], ["MIN", "MIN(amount)"]], "SUM", runQ);
        var sortCb = h("input", { type: "checkbox", checked: true });
        sortCb.addEventListener("change", runQ);
        var sortField = h("label", { class: "wg-w1-check" }, sortCb, " Sort biggest result first (ORDER BY ... DESC)");
        var sqlPre = h("pre", { class: "wg-w1-pre" });
        var srcHost = h("div"), resHost = h("div");
        var m2 = meaning();
        function runQ() {
          var W = WHERES.filter(function (x) { return x[0] === wSel.get(); })[0];
          var g = gSel.get(), a = aSel.get(), gi = COLS.indexOf(g);
          var kept = ROWS.filter(W[3]);
          var aggExpr = a === "COUNT" ? "COUNT(*)" : a + "(amount)";
          var sql = [], out = [], head = [];
          if (a === "none" && g === "none") {
            sql.push("SELECT *");
          } else if (g === "none") {
            sql.push("SELECT " + aggExpr + " AS result");
          } else {
            sql.push("SELECT " + g + (a !== "none" ? ", " + aggExpr + " AS result" : ""));
          }
          sql.push("FROM orders");
          if (W[2]) sql.push("WHERE " + W[2]);
          if (g !== "none") sql.push("GROUP BY " + g);
          var sortable = a !== "none";
          if (sortable && g !== "none" && sortCb.checked) sql.push("ORDER BY result DESC");
          sortCb.disabled = !(sortable && g !== "none");
          sqlPre.textContent = sql.join("\n") + ";";
          function agg(rows) {
            if (!rows.length) return a === "COUNT" ? 0 : "NULL";
            var am = rows.map(function (r) { return r[4]; });
            if (a === "COUNT") return rows.length;
            if (a === "SUM") return am.reduce(function (x, y) { return x + y; }, 0);
            if (a === "AVG") return Math.round(am.reduce(function (x, y) { return x + y; }, 0) / am.length * 100) / 100;
            if (a === "MAX") return Math.max.apply(null, am);
            return Math.min.apply(null, am);
          }
          var groups = 0;
          if (a === "none" && g === "none") { head = COLS; out = kept.map(function (r) { return r.slice(); }); }
          else if (g === "none") { head = ["result"]; out = [[agg(kept)]]; }
          else {
            var map = {}, keys = [];
            kept.forEach(function (r) { var k = r[gi]; if (!map[k]) { map[k] = []; keys.push(k); } map[k].push(r); });
            groups = keys.length;
            head = a !== "none" ? [g, "result"] : [g];
            out = keys.map(function (k) { return a !== "none" ? [k, agg(map[k])] : [k]; });
            if (a !== "none" && sortCb.checked) out.sort(function (x, y) { return y[1] - x[1]; });
          }
          clear(srcHost); clear(resHost);
          srcHost.appendChild(table(COLS, ROWS, [0, 4], function (i) { return W[3](ROWS[i]) ? null : "wg-sql-out"; }));
          resHost.appendChild(out.length ? table(head, out, head.map(function (x, i) { return x === "result" || x === "id" || x === "amount" ? i : -1; })) : h("p", { class: "wg-w1-note" }, "(no rows)"));
          var msg = (W[2] ? fmt(kept.length) + " of 10 rows passed WHERE " + W[2] : "All 10 rows are used (no WHERE)") + ". ";
          if (g !== "none") msg += "GROUP BY " + g + " turned them into " + groups + " group" + (groups === 1 ? "" : "s") + ", and each group became exactly one output row" + (a !== "none" ? " holding its " + aggExpr + "." : " (like a list of distinct values).");
          else if (a !== "none") msg += "With no GROUP BY, " + aggExpr + " squashes all of them into a single row.";
          else msg += "No grouping or aggregate, so you get the rows themselves.";
          m2.set(msg);
        }

        add(w, [
          sub("1. Put the clauses in written order"),
          h("p", { class: "wg-w1-note" }, "Use the arrow buttons to reorder. Highlighted rows are in the right place."),
          list, status,
          h("div", { class: "wg-w1-row" },
            btn("Show answer", function () { order = [0, 1, 2, 3, 4, 5, 6]; drawOrder(); }),
            btn("Shuffle again", function () { order = START.slice(); drawOrder(); })),
          h("div", { class: "wg-sql-execbox" }, h("div", { class: "wg-w1-lab" }, "Logical execution order (what the database actually does)"), execList),
          m1.el,
          sub("2. Query playground: the orders table"),
          h("div", { class: "wg-w1-controls" }, wSel.el, gSel.el, aSel.el),
          sortField,
          h("div", { class: "wg-w1-lab" }, "Generated SQL"), sqlPre,
          h("div", { class: "wg-sql-two" },
            h("div", null, h("div", { class: "wg-w1-lab" }, "Source table (faded rows are removed by WHERE)"), srcHost),
            h("div", null, h("div", { class: "wg-w1-lab" }, "Result"), resHost)),
          m2.el
        ]);
        drawOrder();
        runQ();
      }
    },

    /* ================= http ================= */
    http: {
      title: "HTTP request builder",
      intro: "Choose a method, path, headers and body to see the exact text your program sends and a realistic reply. Try deleting the Authorization line or breaking the JSON body, then explore what each status code family means.",
      render: function (host) {
        var w = shell(host);
        var CODES = {
          200: ["OK", "It worked; the body has what you asked for.", "Use the data."],
          201: ["Created", "A new resource was made. The Location header says where it lives.", "Store the new id."],
          202: ["Accepted", "The server queued your request and will do it later.", "Poll a status URL or wait for a webhook."],
          204: ["No Content", "It worked and there is nothing to send back.", "Nothing to read; carry on."],
          301: ["Moved Permanently", "This URL has moved for good; see the Location header.", "Update your code to the new URL."],
          302: ["Found (temporary redirect)", "Look at the Location header for now, but keep using this URL.", "Follow the redirect (most clients do this automatically)."],
          304: ["Not Modified", "Your cached copy is still fresh, so no body is sent.", "Use your cached copy."],
          400: ["Bad Request", "The server could not understand the request (bad JSON, missing field).", "Fix the request. Retrying the same thing will fail again."],
          401: ["Unauthorized", "No valid credentials: missing or expired token/API key.", "Get a fresh token, then try again."],
          403: ["Forbidden", "You are identified but not allowed to do this.", "Ask for the right permission; do not retry."],
          404: ["Not Found", "Nothing exists at that path (or the id is wrong).", "Check the URL and id; do not retry."],
          409: ["Conflict", "The request clashes with the current state (e.g. duplicate).", "Re-read the resource, then decide."],
          422: ["Unprocessable Entity", "Valid JSON, but the values break a rule (e.g. qty must be > 0).", "Fix the data you send."],
          429: ["Too Many Requests", "You are over the rate limit. Retry-After says how long to wait.", "Wait (Retry-After), then retry with backoff."],
          500: ["Internal Server Error", "The server crashed handling your request. Not your fault.", "Retry a few times with backoff; report if it persists."],
          502: ["Bad Gateway", "A proxy in front of the service got a bad answer from it.", "Retry with backoff."],
          503: ["Service Unavailable", "The server is overloaded or down for maintenance.", "Retry later with backoff."],
          504: ["Gateway Timeout", "A proxy gave up waiting for the service.", "Retry with backoff; the action may or may not have happened."]
        };
        var method = select("Method", [["GET", "GET (read)"], ["POST", "POST (create)"], ["PUT", "PUT (replace)"], ["PATCH", "PATCH (update part)"], ["DELETE", "DELETE (remove)"]], "GET", onMethod);
        var path = text("Path", "/v1/orders/42", draw);
        var behave = select("What the server does (simulated)", [["ok", "Works normally"], ["missing", "Resource does not exist"], ["rate", "You hit the rate limit"], ["bug", "Server has a bug"], ["moved", "API moved to /v2"]], "ok", draw);
        var headers = text("Headers (one per line, Name: value)", "Authorization: Bearer demo-token-123\nAccept: application/json", draw, "textarea");
        var body = text("Body (JSON)", "{\"item\": \"widget\", \"qty\": 2}", draw, "textarea");
        var reqPre = h("pre", { class: "wg-w1-pre", "aria-label": "Raw HTTP request" });
        var resPre = h("pre", { class: "wg-w1-pre", "aria-label": "Raw HTTP response" });
        var sCode = stat("Status"), sAct = stat("What your code should do");
        var m = meaning();
        var lastPath = { GET: "/v1/orders/42", POST: "/v1/orders", PUT: "/v1/orders/42", PATCH: "/v1/orders/42", DELETE: "/v1/orders/42" };
        var prevMethod = "GET";
        function onMethod() {
          var mt = method.get();
          if (path.get() === lastPath[prevMethod]) path.input.value = lastPath[mt];
          prevMethod = mt;
          draw();
        }
        var enc = new TextEncoder();
        function draw() {
          var mt = method.get(), p = path.get().trim() || "/";
          var hasBody = mt === "POST" || mt === "PUT" || mt === "PATCH";
          body.input.disabled = !hasBody;
          var lines = headers.get().split("\n").map(function (l) { return l.trim(); }).filter(Boolean);
          var bad = lines.filter(function (l) { return !/^[A-Za-z0-9-]+\s*:/.test(l); });
          var hmap = {};
          lines.forEach(function (l) { var i = l.indexOf(":"); if (i > 0) hmap[l.slice(0, i).trim().toLowerCase()] = l.slice(i + 1).trim(); });
          var req = [mt + " " + p + " HTTP/1.1", "Host: api.example.com"].concat(lines);
          var b = body.get(), bodyOk = true, parsed = null;
          if (hasBody) {
            try { parsed = JSON.parse(b); } catch (e) { bodyOk = false; }
            if (!hmap["content-type"]) req.push("Content-Type: application/json");
            req.push("Content-Length: " + enc.encode(b).length);
          }
          reqPre.textContent = req.join("\n") + "\n" + (hasBody ? "\n" + b : "");
          var code, rh = ["Content-Type: application/json"], rb = "", why = "";
          var auth = hmap["authorization"];
          var idm = p.match(/\/(\d+)\/?$/);
          if (bad.length) { code = 400; rb = { error: "malformed_header", detail: "Header lines must look like Name: value" }; why = "one header line has no colon"; }
          else if (p[0] !== "/") { code = 400; rb = { error: "bad_path" }; why = "the path must start with /"; }
          else if (!auth) { code = 401; rh.push("WWW-Authenticate: Bearer"); rb = { error: "missing_credentials" }; why = "there is no Authorization header"; }
          else if (hasBody && !bodyOk) { code = 400; rb = { error: "invalid_json", detail: "Body is not valid JSON" }; why = "the body is not valid JSON"; }
          else if (hasBody && parsed && typeof parsed.qty === "number" && parsed.qty <= 0) { code = 422; rb = { error: "validation_failed", field: "qty", detail: "must be greater than 0" }; why = "qty must be more than 0"; }
          else if (behave.get() === "moved") { code = 301; rh = ["Location: " + p.replace(/^\/v1/, "/v2")]; rb = ""; why = "the API moved"; }
          else if (behave.get() === "rate") { code = 429; rh.push("Retry-After: 30"); rb = { error: "rate_limited", retry_after_seconds: 30 }; why = "too many calls in a short time"; }
          else if (behave.get() === "bug") { code = 500; rb = { error: "internal_error", request_id: "req_8f2a" }; why = "the server threw an exception"; }
          else if (behave.get() === "missing" && mt !== "POST") { code = 404; rb = { error: "not_found", detail: "No order at " + p }; why = "nothing lives at that path"; }
          else if (mt === "GET") {
            code = 200;
            rb = idm ? { id: idm[1], item: "widget", qty: 2, status: "paid", amount: 120 } : { data: [{ id: "42", status: "paid" }, { id: "43", status: "pending" }], next_page: "/v1/orders?page=2" };
            why = "the read succeeded";
          } else if (mt === "POST") {
            code = 201; rh.push("Location: " + p.replace(/\/$/, "") + "/1001");
            rb = Object.assign({ id: "1001" }, parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : { value: parsed }, { status: "created" }); why = "a new record was created";
          } else if (mt === "DELETE") { code = 204; rh = []; rb = ""; why = "the record was deleted"; }
          else { code = 200; rb = Object.assign({ id: idm ? idm[1] : "42" }, parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {}, { updated: true }); why = "the update was applied"; }
          var rbText = rb === "" ? "" : JSON.stringify(rb, null, 2);
          if (rbText) rh.push("Content-Length: " + enc.encode(rbText).length);
          var info = CODES[code];
          resPre.textContent = "HTTP/1.1 " + code + " " + info[0] + "\n" + rh.join("\n") + "\n" + (rbText ? "\n" + rbText : "");
          var cls = Math.floor(code / 100);
          sCode.set(code + " " + info[0], cls + "xx: " + ["", "", "success", "redirect", "your request's fault", "the server's fault"][cls], cls >= 4 ? "hot" : "good");
          sAct.set(cls === 2 ? "Carry on" : code === 429 || cls === 5 ? "Retry later" : cls === 3 ? "Follow" : "Fix, don't retry", info[2]);
          m.set(code + " " + info[0] + " because " + why + ". " + info[1] + (hasBody ? "" : " (" + mt + " requests normally carry no body, so the body box is off.)"));
        }
        // status explorer
        var FAM = [["2", "2xx success"], ["3", "3xx redirect"], ["4", "4xx client error"], ["5", "5xx server error"]];
        var famBtns = h("div", { class: "wg-w1-row", role: "group", "aria-label": "Status code family" });
        var famList = h("div", { class: "wg-http-codes" });
        var famNote = h("p", { class: "wg-w1-note" });
        function showFam(f) {
          Array.prototype.forEach.call(famBtns.children, function (b) { b.setAttribute("aria-pressed", b.dataset.f === f ? "true" : "false"); });
          clear(famList);
          Object.keys(CODES).filter(function (c) { return c[0] === f; }).forEach(function (c) {
            famList.appendChild(h("div", { class: "wg-http-card" },
              h("div", { class: "wg-http-cc" }, c + " " + CODES[c][0]),
              h("div", null, CODES[c][1]),
              h("div", { class: "wg-w1-note" }, "Your code: " + CODES[c][2])));
          });
          famNote.textContent = { 2: "2xx: the request worked.", 3: "3xx: the thing is somewhere else, or your cached copy is fine.", 4: "4xx: something about YOUR request is wrong. Retrying unchanged will not help (except 429, which means wait).", 5: "5xx: the SERVER failed. Usually temporary, so retrying with backoff is reasonable." }[f];
        }
        FAM.forEach(function (x) { var b = btn(x[1], function () { showFam(x[0]); }); b.dataset.f = x[0]; famBtns.appendChild(b); });

        add(w, [
          h("div", { class: "wg-w1-controls" }, method.el, path.el, behave.el),
          h("div", { class: "wg-w1-controls" }, headers.el, body.el),
          h("div", { class: "wg-http-two" },
            h("div", null, h("div", { class: "wg-w1-lab" }, "Request your program sends"), reqPre),
            h("div", null, h("div", { class: "wg-w1-lab" }, "Response it gets back (simulated)"), resPre)),
          h("div", { class: "wg-w1-stats" }, sCode.el, sAct.el),
          m.el,
          sub("Status code explorer"),
          famBtns, famNote, famList
        ]);
        draw();
        showFam("4");
      }
    },

    /* ================= resilient ================= */
    resilient: {
      title: "Retry backoff and jitter visualizer",
      intro: "Many clients hit a failing API at the same moment and each retries with exponential backoff. Turn jitter off and on and watch the retries either pile up in the same instant (a thundering herd) or spread out.",
      render: function (host) {
        var w = shell(host);
        var base = slider("Base delay", { min: 100, max: 2000, step: 100, value: 500, fmt: function (v) { return fmt(v) + " ms"; } }, draw);
        var factor = slider("Backoff factor", { min: 1.5, max: 3, step: 0.5, value: 2, fmt: function (v) { return "×" + v; } }, draw);
        var retries = slider("Max retries", { min: 1, max: 8, value: 5, fmt: function (v) { return v + " retries"; } }, draw);
        var cap = slider("Max delay cap", { min: 1, max: 60, value: 30, fmt: function (v) { return v + " s"; } }, draw);
        var clients = slider("Clients failing at once", { min: 1, max: 50, value: 20, fmt: function (v) { return v + " clients"; } }, draw);
        var jitter = select("Jitter", [["off", "Off (everyone waits exactly the same)"], ["full", "Full jitter (random 0 to delay)"]], "off", draw);
        var seed = 7;
        var svg = s("svg", { viewBox: "0 0 600 330", class: "wg-w1-svg", role: "img", "aria-label": "Retry timeline per client and requests per 100 ms" });
        var sTot = stat("Total requests"), sPeak = stat("Busiest 100 ms"), sLast = stat("Last retry at");
        var tblHost = h("div");
        var m = meaning();
        add(w, [
          h("div", { class: "wg-w1-controls" }, base.el, factor.el, retries.el, cap.el, clients.el, jitter.el),
          h("div", { class: "wg-w1-row" }, btn("Re-roll the random jitter", function () { seed++; draw(); })),
          svg,
          h("div", { class: "wg-w1-stats" }, sTot.el, sPeak.el, sLast.el),
          m.el, tblHost
        ]);
        function draw() {
          var r = rng(seed), N = clients.get(), R = retries.get(), J = jitter.get() === "full";
          var capMs = cap.get() * 1000;
          var delays = [];
          for (var k = 0; k < R; k++) delays.push(Math.min(capMs, base.get() * Math.pow(factor.get(), k)));
          var all = [], maxT = 0;
          for (var c = 0; c < N; c++) {
            var t = 0, times = [0];
            for (var k2 = 0; k2 < R; k2++) { t += J ? r() * delays[k2] : delays[k2]; times.push(t); }
            maxT = Math.max(maxT, t); all.push(times);
          }
          var span = Math.max(1000, maxT * 1.04);
          var VW = fitW(svg, 330), L = 44, RR = VW - 10, T = 8, midB = 196, hT = 222, hB = 300;
          function X(t) { return L + t / span * (RR - L); }
          clear(svg);
          var rowH = (midB - T) / N;
          svg.appendChild(s("text", { x: 4, y: T + 10, "font-size": 12, fill: "var(--muted)", text: "client" }));
          all.forEach(function (times, ci) {
            var y = T + rowH * (ci + 0.5);
            svg.appendChild(s("line", { x1: L, x2: RR, y1: y, y2: y, stroke: "var(--line)", "stroke-width": 0.5 }));
            times.forEach(function (tt, i) {
              svg.appendChild(s("circle", { cx: X(tt), cy: y, r: Math.max(1.6, Math.min(4, rowH / 2.6)), fill: i === 0 ? "var(--muted)" : "var(--accent)", "fill-opacity": 0.85 }));
            });
          });
          // histogram of 100ms windows
          var bw = 100, nb = Math.ceil(span / bw), hist = new Array(nb).fill(0);
          all.forEach(function (times) { times.forEach(function (tt, i) { if (i > 0) hist[Math.min(nb - 1, Math.floor(tt / bw))]++; }); });
          var peak = Math.max.apply(null, hist);
          var drawBins = Math.min(nb, 120), per = Math.ceil(nb / drawBins), dbins = [];
          for (var i = 0; i < nb; i += per) { var mx = 0; for (var j = i; j < Math.min(nb, i + per); j++) mx = Math.max(mx, hist[j]); dbins.push([i * bw, mx]); }
          var bwPx = (RR - L) / dbins.length;
          svg.appendChild(s("text", { x: L, y: hT - 6, "font-size": 12, fill: "var(--muted)", text: "retries per 100 ms (peak " + peak + ")" }));
          dbins.forEach(function (b) {
            if (!b[1]) return;
            var hh = b[1] / Math.max(1, N) * (hB - hT);
            svg.appendChild(s("rect", { x: X(b[0]), y: hB - hh, width: Math.max(1, bwPx - 0.5), height: hh, fill: b[1] >= Math.max(3, N * 0.5) ? "var(--packet)" : "var(--accent)" }));
          });
          svg.appendChild(s("line", { x1: L, x2: RR, y1: hB, y2: hB, stroke: "var(--line-strong)" }));
          svg.appendChild(s("text", { x: 4, y: hB - 2, "font-size": 12, fill: "var(--muted)", text: "0" }));
          svg.appendChild(s("text", { x: 4, y: hT + 8, "font-size": 12, fill: "var(--muted)", text: String(N) }));
          var nq = VW < 500 ? 2 : 4;
          for (var q = 0; q <= nq; q++) {
            var tq = span * q / nq;
            svg.appendChild(s("text", { x: X(tq), y: hB + 16, "font-size": 12, fill: "var(--muted)", "text-anchor": q === 0 ? "start" : q === nq ? "end" : "middle", "font-family": "var(--mono)", text: fmt(tq / 1000, 1) + " s" }));
          }
          var total = N * (R + 1);
          sTot.set(fmt(total), N + " × (1 try + " + R + " retries)");
          sPeak.set(peak + " requests", peak >= Math.max(2, N * 0.5) ? "a herd arriving together" : "spread out", peak >= Math.max(2, N * 0.5) && N > 2 ? "hot" : "good");
          sLast.set(fmt(maxT / 1000, 1) + " s", "after the first failure");
          clear(tblHost);
          var cum = 0;
          tblHost.appendChild(table(["Retry", "Backoff delay", J ? "Actual wait (random)" : "Actual wait", "Retry happens at"],
            delays.map(function (d, i) { cum += d; return ["#" + (i + 1), fmt(d) + " ms", J ? "0 to " + fmt(d) + " ms" : fmt(d) + " ms", J ? "varies per client" : fmt(cum / 1000, 2) + " s"]; }), [1, 2, 3]));
          if (N === 1) m.set("With one client there is no herd: it simply waits longer after each failure (" + delays.map(function (d) { return fmt(d / 1000, 1) + "s"; }).join(", ") + "), which gives a struggling API room to recover.");
          else if (!J) m.set("Without jitter, all " + N + " clients retry at exactly the same instants, so the server gets hit by " + peak + " requests at once, " + R + " times over. A server that is just recovering gets knocked straight back down. Turn jitter on.");
          else m.set("With full jitter the same " + fmt(total) + " requests are spread out: the busiest 100 ms sees " + peak + " instead of " + N + ". Same backoff, far gentler on the recovering server.");
        }
        draw(); requestAnimationFrame(function () { if (host.isConnected) draw(); });
      }
    },

    /* ================= caching ================= */
    caching: {
      title: "Cache simulator",
      intro: "Simulate 2,000 requests for 200 different items against an LRU cache. Change the cache size, how long items live (TTL) and how skewed traffic is, and watch hit rate, time saved and stale answers.",
      render: function (host) {
        var w = shell(host);
        var cap = slider("Cache capacity", { min: 1, max: 200, value: 20, fmt: function (v) { return v + " items"; } }, run);
        var ttl = slider("TTL (time to live)", { min: 1, max: 300, value: 60, fmt: function (v) { return v + " s"; } }, run);
        var chg = slider("Each item's data changes every", { min: 5, max: 600, step: 5, value: 600, fmt: function (v) { return v + " s"; } }, run);
        var skew = select("Request pattern", [["0", "Uniform (every item equally popular)"], ["0.8", "Some hot keys (mild skew)"], ["1.2", "Few very hot keys (strong skew)"]], "1.2", run);
        var cLat = num("Cache latency, ms (example)", 1, { min: 0, fallback: 1 }, run);
        var dLat = num("Database latency, ms (example)", 50, { min: 0, fallback: 50 }, run);
        var seed = 11;
        var KEYS = 200, REQ = 2000, RPS = 20;
        var sHit = stat("Hit rate"), sLat = stat("Average latency"), sSaved = stat("Waiting time saved"), sStale = stat("Stale reads");
        var svg = s("svg", { viewBox: "0 0 600 180", class: "wg-w1-svg", role: "img", "aria-label": "Hit rate over time" });
        var hotNote = h("p", { class: "wg-w1-note" });
        var m = meaning();
        add(w, [
          h("div", { class: "wg-w1-controls" }, cap.el, ttl.el, chg.el, skew.el, cLat.el, dLat.el),
          h("div", { class: "wg-w1-row" }, btn("Run again with new random requests", function () { seed++; run(); }, true)),
          h("div", { class: "wg-w1-stats" }, sHit.el, sLat.el, sSaved.el, sStale.el),
          svg, hotNote, m.el
        ]);
        function run() {
          var r = rng(seed), sk = parseFloat(skew.get());
          var wts = [], tot = 0;
          for (var k = 0; k < KEYS; k++) { tot += 1 / Math.pow(k + 1, sk); wts.push(tot); }
          var phase = []; var r2 = rng(999);
          for (var k1 = 0; k1 < KEYS; k1++) phase.push(r2());
          var C = cap.get(), TTL = ttl.get(), U = chg.get(), cl = cLat.get(), dl = dLat.get();
          var cache = new Map(), hits = 0, stale = 0, series = [], win = [], winHits = 0;
          for (var i = 0; i < REQ; i++) {
            var t = i / RPS, x = r() * tot, lo = 0, hi = KEYS - 1;
            while (lo < hi) { var mid = (lo + hi) >> 1; if (wts[mid] < x) lo = mid + 1; else hi = mid; }
            var key = lo, ver = Math.floor(t / U + phase[key]);
            var e = cache.get(key), hit = false;
            if (e && e.exp > t) {
              hit = true; hits++;
              if (e.ver !== ver) stale++;
              cache.delete(key); cache.set(key, e);
            } else {
              if (e) cache.delete(key);
              cache.set(key, { exp: t + TTL, ver: ver });
              if (cache.size > C) cache.delete(cache.keys().next().value);
            }
            win.push(hit); winHits += hit ? 1 : 0;
            if (win.length > 100) winHits -= win.shift() ? 1 : 0;
            if (i % 20 === 19) series.push(winHits / win.length);
          }
          var hr = hits / REQ, avg = hr * cl + (1 - hr) * dl, saved = hits * (dl - cl) / 1000;
          sHit.set(pct(hr), fmt(hits) + " of " + fmt(REQ) + " requests", hr > 0.7 ? "good" : null);
          sLat.set(fmt(avg, 1) + " ms", "vs " + fmt(dl) + " ms with no cache");
          sSaved.set(fmt(saved, 1) + " s", "across " + fmt(REQ) + " requests");
          sStale.set(pct(stale / REQ), fmt(stale) + " answers were out of date", stale / REQ > 0.05 ? "hot" : null);
          // chart
          clear(svg);
          var VW = fitW(svg, 180), L = 40, R = VW - 10, T = 10, B = 150;
          [0, 0.5, 1].forEach(function (v) {
            var y = B - v * (B - T);
            svg.appendChild(s("line", { x1: L, x2: R, y1: y, y2: y, stroke: "var(--line)" }));
            svg.appendChild(s("text", { x: L - 6, y: y + 4, "text-anchor": "end", "font-size": 12, fill: "var(--muted)", "font-family": "var(--mono)", text: v * 100 + "%" }));
          });
          var pts = series.map(function (v, i) { return (L + i / (series.length - 1) * (R - L)).toFixed(1) + "," + (B - v * (B - T)).toFixed(1); });
          svg.appendChild(s("polyline", { points: pts.join(" "), fill: "none", stroke: "var(--accent)", "stroke-width": 2.5 }));
          svg.appendChild(s("text", { x: L, y: B + 18, "font-size": 12, fill: "var(--muted)", text: "0 s" }));
          svg.appendChild(s("text", { x: R, y: B + 18, "font-size": 12, fill: "var(--muted)", "text-anchor": "end", text: (REQ / RPS) + " s" }));
          svg.appendChild(s("text", { x: (L + R) / 2, y: B + 18, "font-size": 12, fill: "var(--muted)", "text-anchor": "middle", text: "hit rate over the last 100 requests (" + RPS + " req/s)" }));
          var top10 = wts[9] / tot;
          hotNote.textContent = "Traffic shape: the 10 most popular items get " + pct(top10, 0) + " of all requests (with no skew they would get 5%).";
          var msg = pct(hr, 0) + " of requests were answered from the cache, cutting average latency from " + fmt(dl) + " ms to " + fmt(avg, 1) + " ms.";
          if (sk === 0 && C < KEYS / 2) msg += " With uniform traffic a small cache barely helps; caches pay off when a few keys are hot.";
          else if (C < 10) msg += " The cache is tiny, so popular items keep getting evicted; a bit more capacity would help a lot.";
          var sr = stale / REQ;
          if (sr > 0.05) msg += " But " + pct(sr) + " of answers were stale: a cached copy can live up to " + TTL + " s while the real data changes every " + U + " s. Shorten the TTL, or delete the cache entry whenever the data changes.";
          else msg += " Stale reads stay rare (" + pct(sr) + ") because the TTL (" + TTL + " s) is short compared with how often data changes (" + U + " s); a longer TTL would raise the hit rate but serve more out-of-date answers.";
          m.set(msg);
        }
        run(); requestAnimationFrame(function () { if (host.isConnected) run(); });
      }
    },

    /* ================= queues ================= */
    queues: {
      title: "Queue and worker simulator",
      intro: "Jobs arrive at a rate λ and a pool of workers takes them off the queue. Watch the queue depth live, check Little's law (L = λ × W), and push arrivals above capacity to see the queue grow without limit.",
      render: function (host) {
        var w = shell(host);
        var lam = slider("Arrival rate λ", { min: 1, max: 50, value: 8, fmt: function (v) { return v + " jobs/s"; } }, reset);
        var workers = slider("Workers", { min: 1, max: 20, value: 2, fmt: function (v) { return v + (v === 1 ? " worker" : " workers"); } }, reset);
        var proc = slider("Processing time per job (average)", { min: 50, max: 2000, step: 50, value: 200, fmt: function (v) { return v + " ms"; } }, reset);
        var speed = select("Simulation speed", [["1", "Real time"], ["4", "4× faster"], ["10", "10× faster"]], "4", null);
        var pauseB = btn("Pause", function () { running = !running; pauseB.textContent = running ? "Pause" : "Resume"; });
        var burstB = btn("Add a burst of 50 jobs", function () { for (var i = 0; i < 50; i++) queue.push(now); });
        var resetB = btn("Reset", reset);
        var svg = s("svg", { viewBox: "0 0 600 170", class: "wg-w1-svg", role: "img", "aria-label": "Queue depth over the last 30 seconds" });
        var qBox = h("div", { class: "wg-q-box", "aria-hidden": "true" });
        var wBox = h("div", { class: "wg-q-box", "aria-hidden": "true" });
        var sCap = stat("Capacity"), sUtil = stat("Utilization ρ = λ / capacity"), sDepth = stat("Queue depth now");
        var sL = stat("L: jobs in system (measured)"), sLW = stat("λ × W (Little's law)");
        var m = meaning();
        add(w, [
          h("div", { class: "wg-w1-controls" }, lam.el, workers.el, proc.el, speed.el),
          h("div", { class: "wg-w1-row" }, pauseB, burstB, resetB),
          h("div", { class: "wg-w1-stats" }, sCap.el, sUtil.el, sDepth.el),
          h("div", { class: "wg-w1-lab" }, "Waiting in the queue"), qBox,
          h("div", { class: "wg-w1-lab" }, "Workers (filled = busy)"), wBox,
          svg,
          h("div", { class: "wg-w1-stats" }, sL.el, sLW.el),
          m.el
        ]);
        var TICK = 0.05; // seconds of simulated time per tick
        var r = rng(5), running = true, now, queue, busy, arrivals, doneN, doneT, areaL, hist, startT;
        function expo(mean) { return -Math.log(1 - r()) * mean; }
        function poisson(l) { var L = Math.exp(-l), k = 0, p = 1; do { k++; p *= r(); } while (p > L); return k - 1; }
        function reset() { now = 0; startT = 0; queue = []; busy = []; arrivals = 0; doneN = 0; doneT = 0; areaL = 0; hist = []; paint(); }
        function tick() {
          var l = lam.get(), c = workers.get(), p = proc.get() / 1000;
          var a = poisson(l * TICK);
          for (var i = 0; i < a; i++) queue.push(now + r() * TICK);
          arrivals += a;
          now += TICK;
          busy = busy.filter(function (j) { if (j.end <= now) { doneN++; doneT += j.end - j.arr; return false; } return true; });
          while (busy.length < c && queue.length) { var arr = queue.shift(); busy.push({ arr: arr, end: Math.max(now, arr) + expo(p) }); }
          areaL += (queue.length + busy.length) * TICK;
          hist.push(queue.length);
          if (hist.length > 600) hist.shift();
        }
        function paint() {
          var l = lam.get(), c = workers.get(), p = proc.get() / 1000, capR = c / p, rho = l / capR;
          sCap.set(fmt(capR, 1) + " jobs/s", c + " workers ÷ " + fmt(p * 1000) + " ms each");
          sUtil.set(pct(rho, 0), rho >= 1 ? "over 100%: unstable" : rho > 0.85 ? "busy: long waits likely" : "comfortable", rho >= 1 ? "hot" : rho < 0.85 ? "good" : null);
          sDepth.set(fmt(queue.length) + " jobs", "after " + fmt(now, 0) + " s simulated");
          clear(qBox);
          var show = Math.min(queue.length, 80);
          for (var i = 0; i < show; i++) qBox.appendChild(h("span", { class: "wg-q-job" }));
          if (queue.length > show) qBox.appendChild(h("span", { class: "wg-w1-note" }, " +" + fmt(queue.length - show) + " more"));
          if (!queue.length) qBox.appendChild(h("span", { class: "wg-w1-note" }, "empty"));
          clear(wBox);
          for (var k = 0; k < c; k++) wBox.appendChild(h("span", { class: "wg-q-worker" + (k < busy.length ? " wg-q-busy" : "") }));
          // chart
          clear(svg);
          var VW = fitW(svg, 170), L = 44, R = VW - 10, T = 10, B = 140;
          var mx = Math.max(10, Math.max.apply(null, hist.concat([0])));
          var niceMax = Math.pow(10, Math.ceil(Math.log10(mx)));
          if (niceMax / 2 >= mx) niceMax /= 2;
          [0, 0.5, 1].forEach(function (f) {
            var y = B - f * (B - T);
            svg.appendChild(s("line", { x1: L, x2: R, y1: y, y2: y, stroke: "var(--line)" }));
            svg.appendChild(s("text", { x: L - 6, y: y + 4, "text-anchor": "end", "font-size": 12, fill: "var(--muted)", "font-family": "var(--mono)", text: fmt(niceMax * f) }));
          });
          if (hist.length > 1) {
            var pts = hist.map(function (v, i) { return (R - (hist.length - 1 - i) / 599 * (R - L)).toFixed(1) + "," + (B - v / niceMax * (B - T)).toFixed(1); });
            svg.appendChild(s("polyline", { points: pts.join(" "), fill: "none", stroke: rho >= 1 ? "var(--packet)" : "var(--accent)", "stroke-width": 2.5 }));
          }
          svg.appendChild(s("text", { x: (L + R) / 2, y: B + 20, "font-size": 12, fill: "var(--muted)", "text-anchor": "middle", text: "queue depth, last 30 s (now at right)" }));
          var T0 = Math.max(1e-9, now - startT);
          var Lm = areaL / T0, lm = arrivals / T0, W = doneN ? doneT / doneN : 0;
          sL.set(fmt(Lm, 2) + " jobs", "average number waiting or being worked on");
          sLW.set(fmt(lm * W, 2) + " jobs", fmt(lm, 1) + " jobs/s × " + fmt(W * 1000, 0) + " ms average time in system");
          if (now < 3) m.set("Warming up... measurements need a few simulated seconds.");
          else if (rho >= 1) m.set("Jobs arrive at " + fmt(l) + "/s but workers can only finish " + fmt(capR, 1) + "/s, so the queue grows by about " + fmt(l - capR, 1) + " jobs every second, forever. Waits keep rising too. Add workers or make each job faster.");
          else m.set("Workers are " + pct(rho, 0) + " busy. On average " + fmt(Lm, 1) + " jobs are in the system, each for " + fmt(W * 1000, 0) + " ms; Little's law says L = λ × W, and indeed " + fmt(lm, 1) + " × " + fmt(W, 2) + " s ≈ " + fmt(lm * W, 1) + "." + (rho > 0.85 ? " Above ~85% busy, small bursts cause long queues." : ""));
        }
        reset();
        var lastPaint = 0;
        var timer = setInterval(function () {
          if (!host.isConnected) { clearInterval(timer); return; }
          if (!running) return;
          var steps = Math.round(parseFloat(speed.get()));
          for (var i = 0; i < steps; i++) tick();
          lastPaint++;
          paint();
        }, TICK * 1000);
      }
    },

    /* ================= observability ================= */
    observability: {
      title: "SLO and error budget calculator",
      intro: "Pick a reliability target and a time window to see how much failure you are allowed. Then enter how many requests have failed so far to see how fast you are burning the budget and whether someone should be paged.",
      render: function (host) {
        var w = shell(host);
        var target = select("SLO target (success rate)", [["99", "99% (two nines)"], ["99.5", "99.5%"], ["99.9", "99.9% (three nines)"], ["99.95", "99.95%"], ["99.99", "99.99% (four nines)"]], "99.9", draw);
        var windowD = select("SLO window", [["7", "7 days"], ["28", "28 days"], ["30", "30 days"]], "30", onWin);
        var vol = num("Requests per day", 1000000, { min: 1, fallback: 1 }, draw);
        var elapsed = slider("Days into the window so far", { min: 1, max: 30, value: 10, fmt: function (v) { return v + (v === 1 ? " day" : " days"); } }, draw);
        var errs = num("Failed requests so far", 15000, { min: 0, fallback: 0 }, draw);
        var sDown = stat("Allowed downtime"), sBudget = stat("Error budget"), sLeft = stat("Budget remaining"), sBurn = stat("Burn rate");
        var bar = s("svg", { viewBox: "0 0 600 78", class: "wg-w1-svg", role: "img", "aria-label": "Budget used versus time elapsed" });
        var alertBox = h("div", { class: "wg-obs-alert", "aria-live": "polite" });
        var tblHost = h("div");
        var m = meaning();
        add(w, [
          h("div", { class: "wg-w1-controls" }, target.el, windowD.el, vol.el, elapsed.el, errs.el),
          h("div", { class: "wg-w1-stats" }, sDown.el, sBudget.el, sLeft.el, sBurn.el),
          bar, alertBox, m.el,
          h("div", { class: "wg-w1-lab" }, "How much downtime each target allows"), tblHost
        ]);
        function onWin() { var d = +windowD.get(); elapsed.input.max = d; if (elapsed.get() > d) elapsed.set(d); else elapsed.set(elapsed.get()); draw(); }
        function mins(x) { if (x < 1) return fmt(x * 60, 0) + " s"; if (x < 120) return fmt(x, 1) + " min"; return fmt(x / 60, 1) + " h"; }
        function draw() {
          var slo = parseFloat(target.get()) / 100, e = 1 - slo, D = +windowD.get(), V = vol.get(), d = Math.min(elapsed.get(), D), E = errs.get();
          var downMin = D * 1440 * e, budget = V * D * e, used = E / budget, remain = budget - E;
          var rate = E / (V * d), burn = rate / e;
          sDown.set(mins(downMin), "per " + D + " days of full outage");
          sBudget.set(fmtBig(budget), "failed requests allowed in " + D + " days");
          sLeft.set(remain >= 0 ? pct(1 - used, 0) : "exhausted", remain >= 0 ? fmtBig(remain) + " failures left" : fmtBig(-remain) + " failures over budget", remain < 0 || used > d / D * 1.2 ? "hot" : "good");
          sBurn.set(fmt(burn, 2) + "×", burn <= 1 ? "sustainable (≤ 1×)" : "faster than sustainable", burn > 1 ? "hot" : "good");
          // bar
          clear(bar);
          var VW = fitW(bar, 78), L = 10, R = VW - 10;
          bar.appendChild(s("rect", { x: L, y: 22, width: R - L, height: 22, rx: 4, fill: "var(--accent-soft)", stroke: "var(--line)" }));
          bar.appendChild(s("rect", { x: L, y: 22, width: Math.min(1, used) * (R - L), height: 22, rx: 4, fill: used > d / D ? "var(--packet)" : "var(--accent)" }));
          var tx = L + d / D * (R - L);
          bar.appendChild(s("line", { x1: tx, x2: tx, y1: 17, y2: 52, stroke: "var(--ink)", "stroke-width": 2, "stroke-dasharray": "4 3" }));
          bar.appendChild(s("text", { x: Math.min(R - 4, Math.max(L + 4, tx)), y: 68, "font-size": 12, fill: "var(--ink)", "text-anchor": tx > VW * 0.75 ? "end" : tx < VW * 0.25 ? "start" : "middle", text: "day " + d + " of " + D + " (" + pct(d / D, 0) + " of time used)" }));
          bar.appendChild(s("text", { x: L, y: 13, "font-size": 12, fill: "var(--ink)", "font-weight": 600, text: "budget used: " + pct(used, 0) }));
          // alert
          var level, advice;
          if (burn >= 14.4) { level = "Page someone now"; advice = "Burn rate ≥ 14.4× (the common fast-burn threshold, measured over 1 hour): at this pace a 30-day budget is gone in about 2 days."; }
          else if (burn >= 6) { level = "Page someone"; advice = "Burn rate ≥ 6× (the common threshold over 6 hours): the budget runs out in about " + fmt(30 / burn, 0) + " days of a 30-day window."; }
          else if (burn > 1) { level = "Open a ticket"; advice = "Burning faster than 1× means you will run out before the window ends. Fix it during working hours and slow down risky releases."; }
          else { level = "No alert"; advice = "Burn rate ≤ 1×: you are spending the budget no faster than planned. Spare budget can pay for faster releases or experiments."; }
          clear(alertBox);
          add(alertBox, [h("strong", null, "Alert suggestion: " + level + ". "), advice]);
          alertBox.classList.toggle("wg-obs-hot", burn >= 6);
          var perDay = E / d, daysLeft = remain > 0 ? remain / Math.max(perDay, 1e-9) : 0;
          if (remain <= 0) m.set("You have already failed more requests than the " + target.get() + "% target allows for the whole " + D + "-day window. The SLO is missed; the usual response is to freeze risky changes and spend time on reliability.");
          else if (perDay === 0) m.set("No failures yet, so the whole budget of " + fmtBig(budget) + " failed requests (about " + mins(downMin) + " of full outage) is still available.");
          else m.set("A " + target.get() + "% target allows " + mins(downMin) + " of full outage per " + D + " days. You have used " + pct(used, 0) + " of the budget in " + pct(d / D, 0) + " of the time; at the current pace it " + (daysLeft < D - d ? "runs out in " + fmt(daysLeft, 1) + " days, before the window ends." : "lasts the rest of the window (" + fmt(daysLeft, 0) + " days of budget left)."));
          clear(tblHost);
          tblHost.appendChild(table(["Target", "Per day", "Per " + D + " days", "Failures allowed per " + D + " days"],
            ["99", "99.5", "99.9", "99.95", "99.99"].map(function (t) { var ee = 1 - parseFloat(t) / 100; return [t + "%", mins(1440 * ee), mins(D * 1440 * ee), fmtBig(V * D * ee)]; }), [1, 2, 3],
            function (i) { return ["99", "99.5", "99.9", "99.95", "99.99"][i] === target.get() ? "wg-w1-sel" : null; }));
        }
        onWin(); requestAnimationFrame(function () { if (host.isConnected) draw(); });
      }
    },

    /* ================= stats ================= */
    stats: {
      title: "A/B test significance and sample size",
      intro: "Enter visitors and conversions for two versions to see whether the difference is real or could be noise. Then estimate how many visitors you need before you even start.",
      render: function (host) {
        var w = shell(host);
        var nA = num("Visitors A", 10000, { min: 1, step: 1, fallback: 1 }, draw);
        var cA = num("Conversions A", 500, { min: 0, step: 1, fallback: 0 }, draw);
        var nB = num("Visitors B", 10000, { min: 1, step: 1, fallback: 1 }, draw);
        var cB = num("Conversions B", 580, { min: 0, step: 1, fallback: 0 }, draw);
        var conf = select("Confidence level", [["0.90", "90%"], ["0.95", "95% (common default)"], ["0.99", "99%"]], "0.95", draw);
        var err = h("p", { class: "wg-w1-note wg-w1-err", role: "status" });
        var sRates = stat("Conversion rates"), sLift = stat("Relative lift (B vs A)"), sZ = stat("z score"), sP = stat("p-value");
        var svg = s("svg", { viewBox: "0 0 600 90", class: "wg-w1-svg", role: "img", "aria-label": "Confidence interval for the difference B minus A" });
        var m = meaning();
        var Z = { "0.90": 1.6449, "0.95": 1.96, "0.99": 2.5758 };
        // sample size
        var base = num("Baseline conversion rate, %", 5, { min: 0.1, max: 99, fallback: 5 }, size);
        var mde = slider("Minimum detectable effect (relative lift)", { min: 1, max: 50, value: 10, fmt: function (v) { return "+" + v + "%"; } }, size);
        var power = select("Power (chance to detect a real effect)", [["0.8416", "80% (common default)"], ["1.2816", "90%"]], "0.8416", size);
        var daily = num("Visitors per day (total, split 50/50)", 2000, { min: 1, fallback: 1 }, size);
        var sN = stat("Visitors needed per variant"), sDays = stat("Test duration");
        var m2 = meaning();
        add(w, [
          sub("1. Is the difference significant?"),
          h("div", { class: "wg-w1-controls" }, nA.el, cA.el, nB.el, cB.el, conf.el),
          err,
          h("div", { class: "wg-w1-stats" }, sRates.el, sLift.el, sZ.el, sP.el),
          svg, m.el,
          sub("2. How many visitors do I need?"),
          h("div", { class: "wg-w1-controls" }, base.el, mde.el, power.el, daily.el),
          h("div", { class: "wg-w1-stats" }, sN.el, sDays.el),
          m2.el,
          h("p", { class: "wg-w1-note" }, "Decide the sample size first and check significance once at the end. Checking every day and stopping at the first p < 0.05 inflates false positives.")
        ]);
        function draw() {
          var a = Math.round(nA.get()), ca = Math.round(cA.get()), b = Math.round(nB.get()), cb = Math.round(cB.get());
          if (ca > a || cb > b) { err.textContent = "Conversions cannot be more than visitors."; return; }
          err.textContent = "";
          var pA = ca / a, pB = cb / b, pp = (ca + cb) / (a + b);
          var se0 = Math.sqrt(pp * (1 - pp) * (1 / a + 1 / b));
          var z = se0 > 0 ? (pB - pA) / se0 : 0;
          var p = 2 * (1 - phi(Math.abs(z)));
          var zc = Z[conf.get()], alpha = 1 - parseFloat(conf.get());
          var se = Math.sqrt(pA * (1 - pA) / a + pB * (1 - pB) / b);
          var lo = (pB - pA) - zc * se, hi = (pB - pA) + zc * se;
          var sig = p < alpha;
          sRates.set(pct(pA, 2) + " vs " + pct(pB, 2), "A vs B");
          sLift.set(pA > 0 ? (pB >= pA ? "+" : "") + pct((pB - pA) / pA, 1) : "n/a", "difference " + (pB >= pA ? "+" : "") + fmt((pB - pA) * 100, 2) + " points");
          sZ.set(fmt(z, 2), "|z| > " + zc + " needed at " + pct(1 - alpha, 0));
          sP.set(p < 0.0001 ? "< 0.0001" : fmt(p, 4), sig ? "significant" : "not significant", sig ? "good" : "hot");
          // CI chart
          clear(svg);
          var span = Math.max(Math.abs(lo), Math.abs(hi), 0.001) * 1.3;
          var VW = fitW(svg, 90), L = 20, R = VW - 20;
          function X(v) { return L + (v + span) / (2 * span) * (R - L); }
          svg.appendChild(s("line", { x1: L, x2: R, y1: 40, y2: 40, stroke: "var(--line)" }));
          svg.appendChild(s("line", { x1: X(0), x2: X(0), y1: 14, y2: 62, stroke: "var(--muted)", "stroke-dasharray": "4 3" }));
          svg.appendChild(s("text", { x: X(0), y: 11, "font-size": 12, fill: "var(--muted)", "text-anchor": "middle", text: "no difference" }));
          svg.appendChild(s("rect", { x: X(lo), y: 32, width: Math.max(2, X(hi) - X(lo)), height: 16, rx: 3, fill: sig ? "var(--accent)" : "var(--line-strong)", "fill-opacity": 0.8 }));
          svg.appendChild(s("circle", { cx: X(pB - pA), cy: 40, r: 5, fill: "var(--ink)" }));
          svg.appendChild(s("text", { x: X(lo), y: 78, "font-size": 12, fill: "var(--ink)", "text-anchor": X(lo) < L + 70 ? "start" : "end", "font-family": "var(--mono)", text: (lo >= 0 ? "+" : "") + fmt(lo * 100, 2) + " pts" }));
          svg.appendChild(s("text", { x: X(hi), y: 78, "font-size": 12, fill: "var(--ink)", "text-anchor": X(hi) > R - 70 ? "end" : "start", "font-family": "var(--mono)", text: (hi >= 0 ? "+" : "") + fmt(hi * 100, 2) + " pts" }));
          var better = pB > pA ? "B" : "A";
          var ptxt = p < 0.0001 ? "less than 0.01%" : pct(p, p < 0.01 ? 2 : 1);
          if (sig) m.set("If A and B were truly the same, a gap this big would appear by chance only " + ptxt + " of the time, below the " + pct(alpha, 0) + " cut-off. So " + better + " really does convert better; the true difference is likely between " + fmt(lo * 100, 2) + " and " + fmt(hi * 100, 2) + " percentage points.");
          else m.set("A gap this big would appear by pure chance " + ptxt + " of the time even if A and B were identical, which is above the " + pct(alpha, 0) + " cut-off. This could easily be noise: the true difference could be anywhere from " + fmt(lo * 100, 2) + " to " + fmt(hi * 100, 2) + " points, including zero. Keep collecting data or accept there is no detectable difference.");
          size();
        }
        function size() {
          var p1 = base.get() / 100, p2 = p1 * (1 + mde.get() / 100);
          if (p2 >= 1) { sN.set("n/a", "lift pushes the rate over 100%"); sDays.set("n/a", ""); m2.set("That lift would push the conversion rate above 100%; lower the effect size."); return; }
          var za = Z[conf.get()], zb = parseFloat(power.get()), pb = (p1 + p2) / 2;
          var n = Math.pow(za * Math.sqrt(2 * pb * (1 - pb)) + zb * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2)), 2) / Math.pow(p2 - p1, 2);
          n = Math.ceil(n);
          var days = 2 * n / daily.get();
          sN.set(fmtBig(n), fmtBig(2 * n) + " in total");
          sDays.set(days < 1 ? "under 1 day" : fmt(Math.ceil(days)) + " days", "at " + fmt(daily.get()) + " visitors/day");
          m2.set("To reliably notice a " + mde.get() + "% lift on a " + fmt(p1 * 100, 2) + "% baseline (" + fmt(p1 * 100, 2) + "% → " + fmt(p2 * 100, 2) + "%), you need about " + fmtBig(n) + " visitors per version, roughly " + (days < 1 ? "less than a day" : fmt(Math.ceil(days)) + " days") + " of traffic. Halving the effect you want to detect roughly quadruples this.");
        }
        draw(); requestAnimationFrame(function () { if (host.isConnected) draw(); });
      }
    }
  });
})();

WIDGET_CSS += `
.wg-w1 { display:flex; flex-direction:column; gap:14px; font-family:var(--body); color:var(--ink); min-width:0; }
.wg-w1 * { box-sizing:border-box; }
.wg-w1-h { margin:8px 0 0; font-size:15px; color:var(--ink); }
.wg-w1-controls { display:grid; grid-template-columns:repeat(auto-fit, minmax(190px, 1fr)); gap:12px 18px; }
.wg-w1-field { display:flex; flex-direction:column; gap:4px; min-width:0; }
.wg-w1-lab { font-size:13px; color:var(--muted); display:flex; justify-content:space-between; gap:8px; flex-wrap:wrap; }
.wg-w1-val { font-family:var(--mono); color:var(--ink); font-weight:600; }
.wg-w1 input[type=text], .wg-w1 input[type=number], .wg-w1 select, .wg-w1 textarea {
  font:14px var(--body); background:var(--surface); color:var(--ink); border:1px solid var(--line-strong);
  border-radius:6px; padding:6px 8px; width:100%; min-width:0; }
.wg-w1 textarea { font-family:var(--mono); font-size:13px; resize:vertical; }
.wg-w1 textarea:disabled { color:var(--muted); border-style:dashed; opacity:1; }
.wg-w1 .wg-w1-mono { font-family:var(--mono); }
.wg-w1 input[type=range] { width:100%; accent-color:var(--accent); }
.wg-w1 input:focus-visible, .wg-w1 select:focus-visible, .wg-w1 textarea:focus-visible, .wg-w1-btn:focus-visible { outline:2px solid var(--accent); outline-offset:1px; }
.wg-w1-check { font-size:13px; color:var(--ink); display:flex; gap:6px; align-items:center; }
.wg-w1-btn { background:var(--surface); border:1px solid var(--line-strong); color:var(--ink); border-radius:6px;
  padding:6px 12px; cursor:pointer; font:13px var(--body); }
.wg-w1-btn:hover:not(:disabled) { border-color:var(--accent); }
.wg-w1-btn:disabled { color:var(--muted); border-style:dashed; opacity:1; cursor:default; }
.wg-w1-btn.wg-w1-primary { background:var(--accent); color:var(--accent-ink); border-color:var(--accent); }
.wg-w1-btn[aria-pressed=true] { background:var(--accent-soft); border-color:var(--accent); font-weight:600; }
.wg-w1-row { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
.wg-w1-stats { display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:8px; }
.wg-w1-stat { border:1px solid var(--line); border-radius:8px; padding:8px 10px; background:var(--surface); min-width:0; }
.wg-w1-stat.wg-w1-hot { border-color:var(--packet); box-shadow:inset 3px 0 0 var(--packet); }
.wg-w1-stat.wg-w1-good { box-shadow:inset 3px 0 0 var(--accent); }
.wg-w1-stat-l { font-size:12px; color:var(--muted); }
.wg-w1-stat-v { font-family:var(--mono); font-size:17px; font-weight:700; color:var(--ink); overflow-wrap:anywhere; }
.wg-w1-stat-s { font-size:12px; color:var(--muted); }
.wg-w1-mean { background:var(--accent-soft); border-left:3px solid var(--accent); padding:8px 12px; border-radius:4px; margin:0; font-size:14px; line-height:1.5; color:var(--ink); }
.wg-w1-note { font-size:12px; color:var(--muted); margin:0; }
.wg-w1-err { color:var(--ink); font-weight:600; }
.wg-w1-err:empty { display:none; }
.wg-w1-pre { background:var(--code-bg); color:var(--ink); font-family:var(--mono); font-size:12.5px; padding:10px; border-radius:6px;
  white-space:pre-wrap; word-break:break-word; margin:0; border:1px solid var(--line); }
.wg-w1-tablewrap { overflow-x:auto; max-width:100%; }
.wg-w1-table { border-collapse:collapse; width:100%; font-size:13px; }
.wg-w1-table th, .wg-w1-table td { border-bottom:1px solid var(--line); padding:5px 8px; text-align:left; }
.wg-w1-table th { color:var(--muted); font-weight:600; }
.wg-w1-table .wg-w1-num { text-align:right; font-family:var(--mono); }
.wg-w1-table td.wg-w1-num { white-space:nowrap; }
.wg-w1-table tr.wg-w1-sel td { background:var(--accent-soft); font-weight:600; }
.wg-w1-svg { width:100%; height:auto; display:block; }
.wg-cmp-bits { display:flex; flex-wrap:wrap; gap:10px; }
.wg-cmp-byte { display:flex; flex-direction:column; gap:3px; }
.wg-cmp-byterow { display:flex; gap:2px; }
.wg-cmp-bit { width:28px; height:32px; border:1px solid var(--line-strong); border-radius:4px; background:var(--surface); color:var(--muted);
  font:600 14px var(--mono); cursor:pointer; padding:0; }
.wg-cmp-bit.wg-cmp-on { background:var(--accent); color:var(--accent-ink); border-color:var(--accent); }
.wg-cmp-cap { font-family:var(--mono); }
.wg-cmp-chips { display:flex; flex-wrap:wrap; gap:6px; }
.wg-cmp-chip { border:1px solid var(--line); border-radius:6px; padding:4px 8px; background:var(--surface); text-align:center; min-width:62px; }
.wg-cmp-chip.wg-cmp-b2, .wg-cmp-chip.wg-cmp-b3 { border-color:var(--accent); }
.wg-cmp-chip.wg-cmp-b4 { border-color:var(--packet); border-width:2px; }
.wg-cmp-ch { font-size:18px; }
.wg-cmp-cp, .wg-cmp-bytes { font:11px var(--mono); color:var(--muted); }
.wg-cmp-bytes { color:var(--ink); }
.wg-sql-list { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:4px; }
.wg-sql-item { display:flex; align-items:center; gap:8px; flex-wrap:wrap; border:1px solid var(--line); border-radius:6px; padding:5px 8px; background:var(--surface); }
.wg-sql-item.wg-sql-ok { background:var(--accent-soft); border-color:var(--accent); }
.wg-sql-code { font:13px var(--mono); flex:1 1 200px; min-width:0; overflow-wrap:anywhere; }
.wg-sql-runs { font-size:12px; color:var(--muted); }
.wg-sql-mv { padding:2px 10px; }
.wg-sql-execbox { border:1px dashed var(--line-strong); border-radius:8px; padding:8px 12px; }
.wg-sql-exec { margin:6px 0 0; padding-left:22px; font-size:13px; display:flex; flex-direction:column; gap:2px; }
.wg-sql-two, .wg-http-two { display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:12px; }
.wg-sql-two > *, .wg-http-two > * { min-width:0; }
.wg-w1-table tr.wg-sql-out td { color:var(--muted); text-decoration:line-through; }
.wg-http-codes { display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:8px; font-size:13px; }
.wg-http-card { border:1px solid var(--line); border-radius:8px; padding:8px 10px; background:var(--surface); display:flex; flex-direction:column; gap:3px; }
.wg-http-cc { font:700 14px var(--mono); }
.wg-q-box { display:flex; flex-wrap:wrap; gap:3px; min-height:18px; align-items:center; }
.wg-q-job { width:10px; height:10px; border-radius:2px; background:var(--accent); }
.wg-q-worker { width:22px; height:22px; border-radius:5px; border:2px solid var(--accent); background:var(--surface); }
.wg-q-worker.wg-q-busy { background:var(--accent); }
.wg-obs-alert { border:1px solid var(--line-strong); border-radius:8px; padding:8px 12px; font-size:14px; background:var(--surface); }
.wg-obs-alert.wg-obs-hot { border-color:var(--packet); box-shadow:inset 4px 0 0 var(--packet); }
`;
