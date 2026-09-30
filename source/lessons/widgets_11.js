(function () {
  /* ---------- shared helpers (scoped to this file) ---------- */
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
  function clear(e) { while (e.firstChild) e.removeChild(e.firstChild); }
  function uid() { return "wgw11-" + Math.random().toString(36).slice(2, 10); }
  function field(labelText, control, cls) {
    var id = control.id || (control.id = uid());
    return h("div", { class: "wg-w11-field" + (cls ? " " + cls : "") }, h("label", { for: id }, labelText), control);
  }
  function btn(label, onclick, cls) {
    return h("button", { type: "button", class: "wg-w11-btn" + (cls ? " " + cls : ""), onclick: onclick }, label);
  }
  function select(options, value) {
    var sel = h("select", { class: "wg-w11-in" });
    options.forEach(function (o) {
      var opt = h("option", { value: o[0] }, o[1]);
      if (o[0] === value) opt.selected = true;
      sel.appendChild(opt);
    });
    return sel;
  }
  function meaning() {
    var span = h("span");
    var el = h("p", { class: "wg-w11-mean", "aria-live": "polite" }, h("strong", null, "What this means: "), span);
    return { el: el, set: function (t) { span.textContent = t; } };
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  var DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  /* =====================================================================
     dataformats: regex tester + time zone and date format tester
     ===================================================================== */
  var REGEX_PRESETS = [
    { id: "email", name: "Email addresses", pattern: "[\\w.+-]+@[\\w-]+(\\.[\\w-]+)+", i: false, m: false,
      text: "Contact ap@brindle-clinics.co.uk for invoices.\nSecond contact: j.okafor+billing@harlowvale.example\nBroken: finance@ or @thornquist.example\nPhone only: 0113 496 0000" },
    { id: "invoice", name: "Invoice numbers", pattern: "\\bINV-(\\d{4})-(\\d{5})\\b", i: true, m: false,
      text: "Invoice INV-2026-00042 due 14/05/2026\ninv-2026-417 (paid)\nRef: INV-2025-10077, second copy\nINV 2026 00043 typed with spaces\nPaid INV-2026-00108 and INV-2026-00109" },
    { id: "date", name: "Dates (day first or ISO)", pattern: "\\b(\\d{2})/(\\d{2})/(\\d{4})\\b|\\b(\\d{4})-(\\d{2})-(\\d{2})\\b", i: false, m: false,
      text: "Delivered 03/04/2026 at depot 7\nBooked 2026-04-03T09:15:00+02:00\nShort form 3/4/26 is not matched\nReturned 29/03/2026, refunded 2026-04-10" },
    { id: "postcode", name: "UK postcodes", pattern: "\\b[A-Z]{1,2}\\d[A-Z\\d]? ?\\d[A-Z]{2}\\b", i: true, m: false,
      text: "Ship to LS6 2QT, Leeds\nReturn address: m1 1ae\nPO box only: 4417\nDepot EC1A 1BB and B33 8TH" },
  ];

  function renderRegex(root) {
    var preset = select(REGEX_PRESETS.map(function (p) { return [p.id, p.name]; }).concat([["custom", "Custom (type your own)"]]), "invoice");
    var pat = h("input", { class: "wg-w11-in wg-df-mono", type: "text", spellcheck: "false", autocomplete: "off" });
    var ci = h("input", { type: "checkbox" }); var ciId = uid(); ci.id = ciId;
    var ml = h("input", { type: "checkbox" }); var mlId = uid(); ml.id = mlId;
    var txt = h("textarea", { class: "wg-w11-in wg-df-mono wg-df-ta", rows: "6", maxlength: "3000", spellcheck: "false" });
    var status = h("p", { class: "wg-w11-note", "aria-live": "polite" });
    var hl = h("div", { class: "wg-df-hl", "aria-label": "Test text with matches highlighted" });
    var tableHost = h("div", { class: "wg-w11-tablewrap" });
    var mean = meaning();

    function loadPreset(id) {
      var p = REGEX_PRESETS.filter(function (x) { return x.id === id; })[0];
      if (!p) return;
      pat.value = p.pattern; ci.checked = p.i; ml.checked = p.m; txt.value = p.text;
      update();
    }
    function update() {
      clear(hl); clear(tableHost);
      var text = txt.value, re;
      var flags = "g" + (ci.checked ? "i" : "") + (ml.checked ? "m" : "");
      if (!pat.value) {
        hl.appendChild(document.createTextNode(text));
        status.textContent = "Type a pattern to start.";
        mean.set("An empty pattern matches nothing useful. Pick a preset to see a working example.");
        return;
      }
      try { re = new RegExp(pat.value, flags); }
      catch (err) {
        hl.appendChild(document.createTextNode(text));
        status.textContent = "Pattern error: " + err.message;
        status.className = "wg-w11-note wg-df-err";
        mean.set("The pattern is not valid yet, often an unclosed bracket or a stray backslash. Fix it and the matches will appear.");
        return;
      }
      status.className = "wg-w11-note";
      var matches = [], m, guard = 0;
      re.lastIndex = 0;
      while ((m = re.exec(text)) !== null && guard < 500) {
        guard++;
        if (m[0].length === 0) { re.lastIndex++; continue; }
        matches.push({ start: m.index, end: m.index + m[0].length, text: m[0], groups: m.slice(1) });
      }
      // highlighted text
      var pos = 0;
      matches.forEach(function (mt, i) {
        if (mt.start > pos) hl.appendChild(document.createTextNode(text.slice(pos, mt.start)));
        hl.appendChild(h("mark", { class: "wg-df-mark", title: "Match " + (i + 1) }, mt.text));
        pos = mt.end;
      });
      if (pos < text.length) hl.appendChild(document.createTextNode(text.slice(pos)));
      // lines with and without matches
      var lines = text.split("\n"), lineStarts = [], acc = 0;
      lines.forEach(function (ln) { lineStarts.push(acc); acc += ln.length + 1; });
      function lineOf(idx) { var l = 0; for (var k = 0; k < lineStarts.length; k++) if (lineStarts[k] <= idx) l = k; return l; }
      var hitLines = {};
      matches.forEach(function (mt) { mt.line = lineOf(mt.start) + 1; hitLines[mt.line] = true; });
      var nonEmpty = [], missed = [];
      lines.forEach(function (ln, i) { if (ln.trim()) { nonEmpty.push(i + 1); if (!hitLines[i + 1]) missed.push(i + 1); } });
      status.textContent = matches.length + " match" + (matches.length === 1 ? "" : "es") + " on " +
        Object.keys(hitLines).length + " of " + nonEmpty.length + " lines. Flags: " + flags + ".";
      if (matches.length) {
        var t = h("table", { class: "wg-w11-table" },
          h("thead", null, h("tr", null, [h("th", { scope: "col" }, "#"), h("th", { scope: "col" }, "Line"), h("th", { scope: "col" }, "Match"), h("th", { scope: "col" }, "Groups")])),
          h("tbody", null, matches.slice(0, 50).map(function (mt, i) {
            var g = mt.groups.map(function (x, gi) { return x === undefined ? null : "(" + (gi + 1) + ") " + x; }).filter(Boolean).join("  ");
            return h("tr", null, [h("td", null, String(i + 1)), h("td", null, String(mt.line)), h("td", null, mt.text), h("td", null, g || "none")]);
          })));
        tableHost.appendChild(t);
      }
      if (!matches.length) {
        mean.set("No matches. Check case (try the ignore case box), separators such as spaces or dashes, and whether \\b word boundaries fit your data.");
      } else if (missed.length) {
        mean.set("Lines " + missed.join(", ") + " had no match. Read each one: if it holds a value you need, loosen the pattern or send such rows to a review queue; if not, the pattern is correctly strict.");
      } else {
        mean.set("Every non-empty line matched. Now add ugly real examples, such as extra spaces or lowercase, to see where the pattern breaks before you trust it.");
      }
    }
    preset.addEventListener("change", function () { if (preset.value !== "custom") loadPreset(preset.value); });
    [pat, txt].forEach(function (el) { el.addEventListener("input", function () { if (el === pat) preset.value = "custom"; update(); }); });
    [ci, ml].forEach(function (el) { el.addEventListener("change", update); });

    root.appendChild(h("div", { class: "wg-w11-row" },
      field("Preset", preset),
      field("Pattern (JavaScript regex, global)", pat, "wg-df-wide")));
    root.appendChild(h("div", { class: "wg-w11-row wg-df-checks" },
      h("label", { for: ciId, class: "wg-df-check" }, ci, " Ignore case (i)"),
      h("label", { for: mlId, class: "wg-df-check" }, ml, " ^ and $ per line (m)")));
    root.appendChild(field("Test text (one example per line, up to 3000 characters)", txt));
    root.appendChild(status);
    root.appendChild(h("div", { class: "wg-w11-sub" }, "Matches highlighted"));
    root.appendChild(hl);
    root.appendChild(tableHost);
    root.appendChild(mean.el);
    root.appendChild(h("p", { class: "wg-w11-note" }, "Python uses almost the same syntax; named groups are written (?P<name>...) in Python and (?<name>...) here."));
    loadPreset("invoice");
  }

  /* ---- time zone helpers (Intl only, no libraries) ---- */
  var fmtCache = {};
  function partsAt(t, zone) {
    var f = fmtCache[zone] || (fmtCache[zone] = new Intl.DateTimeFormat("en-US", {
      timeZone: zone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", weekday: "short" }));
    var o = {};
    f.formatToParts(new Date(t)).forEach(function (p) { o[p.type] = p.value; });
    return { y: +o.year, mo: +o.month, d: +o.day, h: +o.hour % 24, mi: +o.minute, s: +o.second, wd: o.weekday };
  }
  function offsetAt(t, zone) {
    var p = partsAt(t, zone);
    return Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi, p.s) - Math.floor(t / 1000) * 1000;
  }
  function wallToUtc(w, zone) {
    var guess = Date.UTC(w.y, w.mo - 1, w.d, w.h, w.mi, 0);
    var offs = [offsetAt(guess - 86400000, zone), offsetAt(guess, zone), offsetAt(guess + 86400000, zone)];
    var seen = {}, out = [];
    offs.forEach(function (o) {
      if (seen[o]) return; seen[o] = true;
      var t = guess - o, p = partsAt(t, zone);
      if (p.y === w.y && p.mo === w.mo && p.d === w.d && p.h === w.h && p.mi === w.mi) out.push(t);
    });
    out.sort(function (a, b) { return a - b; });
    return { valid: out, fallback: guess - offs[0] };
  }
  function offStr(ms) {
    var m = Math.round(ms / 60000), sign = m < 0 ? "-" : "+"; m = Math.abs(m);
    return "UTC" + sign + pad(Math.floor(m / 60)) + ":" + pad(m % 60);
  }
  function showIn(t, zone) {
    var p = partsAt(t, zone);
    return p.wd + " " + p.d + " " + MONTHS[p.mo - 1] + " " + p.y + ", " + pad(p.h) + ":" + pad(p.mi) + " (" + offStr(offsetAt(t, zone)) + ")";
  }
  var SRC_ZONES = [["UTC", "UTC"], ["America/New_York", "America/New_York"], ["America/Chicago", "America/Chicago"],
    ["Europe/London", "Europe/London"], ["Europe/Berlin", "Europe/Berlin"], ["Asia/Kolkata", "Asia/Kolkata"],
    ["Asia/Tokyo", "Asia/Tokyo"], ["Australia/Sydney", "Australia/Sydney"]];
  var SHOW_ZONES = ["UTC", "America/New_York", "Europe/London", "Asia/Kolkata"];

  function renderTime(root) {
    var dt = h("input", { class: "wg-w11-in", type: "datetime-local", value: "2026-11-01T01:30", step: "60" });
    var zone = select(SRC_ZONES, "America/New_York");
    var out = h("div", { class: "wg-w11-tablewrap" });
    var warn = h("p", { class: "wg-w11-note", "aria-live": "polite" });
    var mean = meaning();

    function parseWall(v) {
      var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(v || "");
      return m ? { y: +m[1], mo: +m[2], d: +m[3], h: +m[4], mi: +m[5] } : null;
    }
    function update() {
      clear(out); warn.textContent = ""; warn.className = "wg-w11-note";
      var w = parseWall(dt.value);
      if (!w) { mean.set("Enter a full date and time to convert it."); return; }
      var r = wallToUtc(w, zone.value);
      var local = pad(w.d) + " " + MONTHS[w.mo - 1] + " " + w.y + " " + pad(w.h) + ":" + pad(w.mi) + " in " + zone.value;
      var cols = [], heads = [h("th", { scope: "col" }, "Zone")];
      if (r.valid.length === 2) {
        heads.push(h("th", { scope: "col" }, "First " + pad(w.h) + ":" + pad(w.mi)), h("th", { scope: "col" }, "Second " + pad(w.h) + ":" + pad(w.mi)));
        cols = r.valid;
        warn.textContent = "Ambiguous: clocks went back, so " + local + " happened twice, one hour apart.";
        warn.className = "wg-w11-note wg-df-err";
        mean.set("A file that stores this local time with no offset cannot tell you which moment it was. Store UTC or an offset, or flag these rows for review; Python picks between them with fold=0 or fold=1.");
      } else if (r.valid.length === 0) {
        heads.push(h("th", { scope: "col" }, "If read with the earlier offset"));
        cols = [r.fallback];
        warn.textContent = "Does not exist: clocks jumped forward, so no clock in " + zone.value + " ever showed this time.";
        warn.className = "wg-w11-note wg-df-err";
        mean.set("A row with this time is either a bug or was written by a system that ignores daylight saving. Ask the source for UTC instead of guessing; a silent guess shifts the event by an hour.");
      } else {
        heads.push(h("th", { scope: "col" }, "Same moment"));
        cols = r.valid;
        var utc = partsAt(r.valid[0], "UTC");
        mean.set(local + " is " + pad(utc.h) + ":" + pad(utc.mi) + " UTC. Store that UTC value and convert only when you show it to a person in their own zone.");
      }
      var body = SHOW_ZONES.map(function (z) {
        return h("tr", null, [h("th", { scope: "row" }, z)].concat(cols.map(function (t) { return h("td", null, showIn(t, z)); })));
      });
      out.appendChild(h("table", { class: "wg-w11-table" }, h("thead", null, h("tr", null, heads)), h("tbody", null, body)));
    }
    function preset(v, z) { dt.value = v; zone.value = z; update(); }
    dt.addEventListener("input", update); dt.addEventListener("change", update);
    zone.addEventListener("change", update);

    root.appendChild(h("div", { class: "wg-w11-row" },
      field("Local date and time (as written in the file)", dt),
      field("Zone of the system that wrote it", zone)));
    root.appendChild(h("div", { class: "wg-w11-row wg-df-presets", role: "group", "aria-label": "Time presets" },
      btn("US clocks go back", function () { preset("2026-11-01T01:30", "America/New_York"); }),
      btn("UK clocks go forward", function () { preset("2026-03-29T01:30", "Europe/London"); }),
      btn("Normal day, Berlin", function () { preset("2026-04-03T09:15", "Europe/Berlin"); }),
      btn("Half-hour zone", function () { preset("2026-04-03T09:15", "Asia/Kolkata"); })));
    root.appendChild(warn);
    root.appendChild(out);
    root.appendChild(mean.el);    update();
  }

  function renderFormats(root) {
    var inp = h("input", { class: "wg-w11-in wg-df-mono", type: "text", value: "03/04/2026", spellcheck: "false", autocomplete: "off" });
    var out = h("div", { class: "wg-w11-tablewrap" });
    var mean = meaning();
    function validDate(y, m, d) {
      if (m < 1 || m > 12 || d < 1) return false;
      var t = new Date(Date.UTC(y, m - 1, d));
      return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
    }
    function nice(y, m, d) {
      var wd = DAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
      return wd + " " + d + " " + MONTHS_LONG[m - 1] + " " + y + "  (ISO " + y + "-" + pad(m) + "-" + pad(d) + ")";
    }
    function niceT(t) {
      var p = partsAt(t, "UTC");
      return nice(p.y, p.mo, p.d) + " " + pad(p.h) + ":" + pad(p.mi) + ":" + pad(p.s) + " UTC";
    }
    function update() {
      clear(out);
      var v = inp.value.trim(), rows = [], msg, m;
      if ((m = /^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/.exec(v))) {
        var a = +m[1], b = +m[2], y = +m[3];
        var us = validDate(y, a, b), eu = validDate(y, b, a);
        rows.push(["US reading (month first)", us ? nice(y, a, b) : "impossible: no month " + a]);
        rows.push(["UK and EU reading (day first)", eu ? nice(y, b, a) : "impossible: no month " + b]);
        if (us && eu && a !== b) msg = "Both readings are valid dates " + Math.abs(Date.UTC(y, a - 1, b) - Date.UTC(y, b - 1, a)) / 86400000 + " days apart, and nothing in the value says which one is meant. Confirm the format with the data owner and parse with an explicit format string.";
        else if (us && eu) msg = "Day and month are equal, so both readings agree here. Other rows in the same file can still be ambiguous.";
        else if (us || eu) msg = "Only one reading is possible, which is a useful clue: check a few such rows to confirm the whole file's format.";
        else msg = "Neither reading is a real date. The field may be corrupted or use another format.";
      } else if ((m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?(Z|[+\-]\d{2}:?\d{2})?$/.exec(v))) {
        var ok = validDate(+m[1], +m[2], +m[3]);
        rows.push(["ISO 8601", ok ? nice(+m[1], +m[2], +m[3]) + (m[4] ? " at " + m[4] + ":" + m[5] : "") : "not a real date"]);
        rows.push(["Offset or zone", m[7] ? m[7] : (m[4] ? "none: local time, zone unknown" : "date only")]);
        msg = ok ? (m[4] && !m[7] ? "The date order is unambiguous, but the time has no offset, so you still need to know the source zone." : "Year-month-day is read the same way everywhere. Ask for this format whenever you can.") : "The shape is ISO but the date does not exist.";
      } else if ((m = /^\d{13}$/.exec(v))) {
        rows.push(["Unix time in milliseconds", niceT(+v)]);
        rows.push(["If read as seconds", "year " + partsAt(Math.min(+v * 1000, 8.64e15), "UTC").y + " or beyond: clearly wrong"]);
        msg = "Thirteen digits is almost always milliseconds since 1970 UTC. Dividing by 1000 by mistake, or forgetting to, moves the date by decades.";
      } else if ((m = /^\d{10}$/.exec(v))) {
        rows.push(["Unix time in seconds", niceT(+v * 1000)]);
        rows.push(["If read as milliseconds", niceT(+v)]);
        msg = "Ten digits is usually seconds since 1 January 1970 UTC. Read as milliseconds it lands in January 1970, a common sign of a units bug.";
      } else if ((m = /^\d{5}(\.\d+)?$/.exec(v))) {
        var n = Math.floor(+v), frac = +v - n;
        var t1900 = Date.UTC(1899, 11, 30) + n * 86400000 + Math.round(frac * 86400) * 1000;
        var t1904 = Date.UTC(1904, 0, 1) + n * 86400000 + Math.round(frac * 86400) * 1000;
        var p1 = partsAt(t1900, "UTC"), p2 = partsAt(t1904, "UTC");
        rows.push(["Excel serial, 1900 system (default)", nice(p1.y, p1.mo, p1.d) + (frac ? " " + pad(p1.h) + ":" + pad(p1.mi) : "")]);
        rows.push(["Excel serial, 1904 system", nice(p2.y, p2.mo, p2.d)]);
        msg = "A five-digit number in a date column is usually an Excel serial date: days counted from 30 December 1899. The fraction, if any, is the time of day.";
      } else {
        rows.push(["Not recognised", "Try 03/04/2026, 13/04/2026, 2026-04-03T09:15, 46115, 1775174400 or 1775174400000"]);
        msg = "This tester knows slash dates, ISO 8601, Unix seconds and milliseconds, and Excel serial numbers.";
      }
      out.appendChild(h("table", { class: "wg-w11-table" },
        h("thead", null, h("tr", null, [h("th", { scope: "col" }, "Reading"), h("th", { scope: "col" }, "Result")])),
        h("tbody", null, rows.map(function (r) { return h("tr", null, [h("th", { scope: "row" }, r[0]), h("td", null, r[1])]); }))));
      mean.set(msg);
    }
    inp.addEventListener("input", update);
    root.appendChild(field("A date value from a file", inp));
    root.appendChild(h("div", { class: "wg-w11-row wg-df-presets", role: "group", "aria-label": "Date value presets" },
      ["03/04/2026", "13/04/2026", "2026-04-03T09:15", "46115", "1775174400", "1775174400000"].map(function (s) {
        return btn(s, function () { inp.value = s; update(); }, "wg-df-mono");
      })));
    root.appendChild(out);
    root.appendChild(mean.el);
    update();
  }

  function renderDataformats(host) {
    var box = h("div", { class: "wg-w11-box" });
    var tabs = [["regex", "Regex tester"], ["time", "Time zones and date formats"]];
    var tablist = h("div", { class: "wg-df-tabs", role: "tablist", "aria-label": "Tools" });
    var panels = {}, buttons = {};
    tabs.forEach(function (t) {
      var pid = uid(), bid = uid();
      var b = h("button", { type: "button", role: "tab", id: bid, "aria-controls": pid, class: "wg-df-tab" }, t[1]);
      var p = h("div", { role: "tabpanel", id: pid, "aria-labelledby": bid, class: "wg-df-panel" });
      b.addEventListener("click", function () { show(t[0]); });
      b.addEventListener("keydown", function (ev) {
        if (ev.key === "ArrowRight" || ev.key === "ArrowLeft") {
          var i = tabs.map(function (x) { return x[0]; }).indexOf(t[0]);
          var n = tabs[(i + (ev.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length][0];
          show(n); buttons[n].focus();
        }
      });
      buttons[t[0]] = b; panels[t[0]] = p;
      tablist.appendChild(b);
    });
    function show(k) {
      tabs.forEach(function (t) {
        var on = t[0] === k;
        buttons[t[0]].setAttribute("aria-selected", on ? "true" : "false");
        buttons[t[0]].tabIndex = on ? 0 : -1;
        panels[t[0]].hidden = !on;
      });
    }
    renderRegex(panels.regex);
    var tz = h("div", { class: "wg-w11-box" });
    tz.appendChild(h("h4", { class: "wg-df-h" }, "Convert a local timestamp"));
    renderTime(tz);
    tz.appendChild(h("h4", { class: "wg-df-h" }, "Read an ambiguous date value"));
    renderFormats(tz);
    panels.time.appendChild(tz);
    box.appendChild(tablist);
    box.appendChild(panels.regex);
    box.appendChild(panels.time);
    host.appendChild(box);
    show("regex");
  }

  /* =====================================================================
     entnetwork: "works on my laptop, not in their network" diagnosis tree
     ===================================================================== */
  var LAYERS = ["Client", "DNS", "TCP", "Proxy", "TLS", "HTTP"];
  var NET_TREE = {
    start: { layer: "TLS", q: "Does the error mention SSL, TLS or a certificate?",
      hint: "For example CERTIFICATE_VERIFY_FAILED, 'self-signed certificate in certificate chain' or 'unable to get local issuer certificate'.",
      yes: "curlcert", no: "is407" },
    curlcert: { layer: "Client", q: "On the same machine, does curl -v to the same URL also fail with a certificate error?",
      hint: "curl usually uses the operating system's trust store, which IT keeps updated. Run it where your program runs, inside the container if there is one.",
      yes: "issuer", no: "L_appstore" },
    issuer: { layer: "TLS", q: "In the curl -v output, is the certificate issuer the customer's own CA or security product rather than a public CA?",
      hint: "Look for the 'issuer:' line, for example 'CN=Garnetvale Inspection CA'. openssl s_client -connect host:443 shows it too.",
      yes: "L_inspect", no: "L_servercert" },
    is407: { layer: "Proxy", q: "Is the HTTP status 407 Proxy Authentication Required?",
      hint: "curl -v shows it as the reply to CONNECT; Python may raise ProxyError with 407 in the message.",
      yes: "L_407", no: "hang" },
    hang: { layer: "TCP", q: "Does the request hang and then time out, or fail with 'connection refused' or 'connection reset'?",
      hint: "A timeout means nothing answered. Refused means something answered and said no.",
      yes: "proxyset", no: "dnsfail" },
    proxyset: { layer: "Proxy", q: "Is HTTPS_PROXY (or the tool's own proxy setting) set where the program actually runs?",
      hint: "Check with: env | grep -i proxy, from the same shell, scheduler job or container. Scheduled jobs and containers often start with an empty environment.",
      yes: "internal", no: "browser" },
    browser: { layer: "Client", q: "Can a browser or curl with the proxy on the same network reach the site?",
      hint: "Browsers often find the proxy through a PAC file, so they work while command-line tools do not.",
      yes: "L_noproxy", no: "L_firewall" },
    internal: { layer: "Proxy", q: "Is the target an internal or private address (10.x, 172.16-31.x, 192.168.x, *.internal, a private endpoint)?",
      hint: "The proxy lives at the edge of the network and usually cannot route back to internal services.",
      yes: "L_noproxylist", no: "L_proxyblock" },
    dnsfail: { layer: "DNS", q: "Does the error say the name could not be resolved?",
      hint: "For example 'Name or service not known', 'getaddrinfo failed', 'nodename nor servname', NXDOMAIN.",
      yes: "privname", no: "block403" },
    privname: { layer: "DNS", q: "Is the host an internal name or private endpoint that only exists inside their network?",
      hint: "Private endpoints for cloud services need a private DNS zone linked to the network or VPN.",
      yes: "L_splitdns", no: "L_extdns" },
    block403: { layer: "HTTP", q: "Is it a 403 with an HTML block page from a security product instead of the API's usual JSON error?",
      hint: "Block pages often name a URL category such as 'Uncategorised' or 'Generative AI'.",
      yes: "L_category", no: "L_notnet" },

    L_appstore: { layer: "Client", cause: "Your program uses a different trust store from curl",
      text: "curl trusts the operating system's store, which includes the corporate CA. Python requests uses the certifi bundle, Java uses its own cacerts keystore and Node.js has a built-in list, so they do not see it.",
      fix: ["Get the corporate root CA as a PEM file from IT.", "Point the runtime at a bundle that includes it: REQUESTS_CA_BUNDLE, SSL_CERT_FILE, NODE_EXTRA_CA_CERTS, or keytool for Java.", "For Python 3.10+, the truststore package can use the OS store instead.", "Never set verify=False or NODE_TLS_REJECT_UNAUTHORIZED=0."],
      cmds: "cat \"$(python -m certifi)\" corp-root-ca.pem > ca-bundle.pem\nexport REQUESTS_CA_BUNDLE=$PWD/ca-bundle.pem SSL_CERT_FILE=$PWD/ca-bundle.pem",
      mean: "The network is fine; your program just does not trust the company's CA yet. This is a configuration fix you can usually make yourself." },
    L_inspect: { layer: "TLS", cause: "TLS inspection by the corporate proxy",
      text: "The proxy decrypts and re-signs HTTPS traffic with the company's own CA. Nothing on this machine trusts that CA yet, not even curl.",
      fix: ["Ask the security team for the inspection root CA as a PEM file.", "Add it to the OS store on servers you control, and to each runtime's bundle in containers.", "If the vendor uses certificate pinning, ask for a TLS inspection exception for its hostnames."],
      cmds: "openssl s_client -connect api.vendor.example:443 -servername api.vendor.example </dev/null \\\n  | openssl x509 -noout -issuer",
      mean: "You need one file from the security team, and then every tool on this machine must be pointed at it." },
    L_servercert: { layer: "TLS", cause: "A real problem with the server's certificate",
      text: "The certificate comes from a public CA or the service itself, so inspection is not the cause. It may be expired, issued for a different hostname, or served without its intermediate certificates.",
      fix: ["Check the expiry date and the names (SAN) on the certificate.", "Make sure you use the exact hostname the certificate covers, not an IP address or alias.", "For internal services, ask the owner to serve the full chain, or trust their internal CA properly."],
      cmds: "openssl s_client -connect host:443 -servername host -showcerts </dev/null \\\n  | openssl x509 -noout -dates -ext subjectAltName",
      mean: "This is a server-side fix. Send the owner the exact openssl output instead of 'SSL is broken'." },
    L_407: { layer: "Proxy", cause: "The proxy wants you to log in",
      text: "407 means the proxy accepted the connection but needs credentials before it will forward it. Servers usually cannot answer the login prompts that staff laptops handle automatically.",
      fix: ["Ask for a service account allowed through the proxy and put it in the proxy URL, URL-encoding special characters.", "If the proxy only accepts NTLM or Kerberos, use a local helper proxy or ask for an exception for your server.", "Better still, ask for your server's address to be exempt from proxy login for the listed hostnames."],
      cmds: "export HTTPS_PROXY=\"http://svc-ai:P%40ss%21word@proxy.corp.internal:8080\"\ncurl -v https://api.vendor.example/ -o /dev/null",
      mean: "Your traffic reaches the proxy, so routing is fine. You need an identity the proxy accepts, which is a request to the network team." },
    L_noproxy: { layer: "Proxy", cause: "Your program is not using the proxy",
      text: "Direct connections out of the network are blocked, and only the proxy may reach the internet. The browser finds the proxy through a PAC file or system settings; your program does not.",
      fix: ["Find the proxy address from IT or the PAC file.", "Set HTTPS_PROXY, HTTP_PROXY and NO_PROXY in the environment the program really runs in (job definition, service file, container).", "Set tool-specific settings too where needed: git, npm, pip, the Docker daemon."],
      cmds: "export HTTPS_PROXY=http://proxy.corp.internal:8080 HTTP_PROXY=http://proxy.corp.internal:8080\nexport NO_PROXY=localhost,127.0.0.1,.corp.internal",
      mean: "A one-line configuration change fixes this; no ticket to the network team is needed." },
    L_firewall: { layer: "TCP", cause: "Egress to this destination is blocked",
      text: "Nothing on this network can reach the host, with or without the proxy, so it is not on the allowlist.",
      fix: ["Write an access request: source machines or subnet, destination hostnames, port 443, outbound, via proxy or not, purpose, data, owner.", "Allow by hostname if the vendor does not publish stable IP ranges.", "Send it early: change boards often meet weekly."],
      cmds: "nc -vz -w 5 api.vendor.example 443\ncurl -v --max-time 15 https://api.vendor.example/ -o /dev/null",
      mean: "Only the customer's network team can fix this. A precise written request is the fastest route." },
    L_noproxylist: { layer: "Proxy", cause: "Internal traffic is being sent to the proxy",
      text: "HTTPS_PROXY is set, but the target is internal. The request goes to the proxy at the edge, which cannot reach back inside, so it times out.",
      fix: ["Add internal domains and ranges to NO_PROXY, for example .corp.internal and 10.0.0.0/8.", "Check that each tool understands your NO_PROXY format; wildcard and CIDR support varies.", "Include the cloud metadata address (169.254.169.254) and localhost."],
      cmds: "export NO_PROXY=localhost,127.0.0.1,169.254.169.254,.corp.internal,10.0.0.0/8\nexport no_proxy=$NO_PROXY",
      mean: "The proxy is doing its job; your settings just need to say which traffic stays inside." },
    L_proxyblock: { layer: "Proxy", cause: "The proxy cannot or will not reach this host",
      text: "Your program uses the proxy and the target is public, yet nothing comes back. The proxy's own egress rules or a firewall behind it block this destination, or the proxy address itself is wrong.",
      fix: ["Check the proxy URL: scheme http://, right host and port.", "Test with curl -v using the same proxy and read the CONNECT reply.", "Ask the network team to allow the hostnames through the proxy."],
      cmds: "curl -v -x http://proxy.corp.internal:8080 https://api.vendor.example/ -o /dev/null",
      mean: "Confirm the proxy settings yourself first; if they are right, this needs an allowlist change." },
    L_splitdns: { layer: "DNS", cause: "You are not using the network's internal DNS",
      text: "Internal names and private endpoints only resolve through the customer's DNS servers, which you get on their network or VPN. A private endpoint also needs its private DNS zone linked to that network.",
      fix: ["Connect to the VPN, or run from a machine inside the network.", "Check which DNS server you use and what the name resolves to.", "For private endpoints, ask for the private DNS zone or a conditional forwarder for the VPN."],
      cmds: "nslookup claims-db.corp.internal\nnslookup myresource.openai.azure.com   # expect a private 10.x address",
      mean: "The service may be fine; your machine just cannot see its name. It is a DNS or VPN setting, not an outage." },
    L_extdns: { layer: "DNS", cause: "External names do not resolve directly here",
      text: "Many locked-down networks do not resolve public names for servers at all. All external traffic must go through the proxy, which resolves names itself.",
      fix: ["Set HTTPS_PROXY so the proxy resolves the name.", "Make sure your client sends the hostname to the proxy (CONNECT host:443), not an IP it looked up itself.", "If direct access is truly needed, request it with the hostnames and a reason."],
      cmds: "nslookup api.vendor.example\ncurl -v -x http://proxy.corp.internal:8080 https://api.vendor.example/ -o /dev/null",
      mean: "This is expected in a locked-down network. Using the proxy is the intended path, not a workaround." },
    L_category: { layer: "HTTP", cause: "The proxy's URL policy blocks this site",
      text: "The request reached the proxy, which classified the site into a blocked category and returned its own block page.",
      fix: ["Save the block page text, including any category name and reference number.", "Ask the security team for an exception for the exact hostnames and the business reason.", "Do not route around it with a personal hotspot or VPN; that breaks policy and trust."],
      cmds: "curl -s https://api.vendor.example/ | head -n 20   # read the block page",
      mean: "This is a policy decision, so it needs an approved exception with a clear business reason." },
    L_notnet: { layer: "HTTP", cause: "Probably not the network",
      text: "Name resolution, connection, proxy and TLS all seem to work. The error is likely from the service itself: a wrong key (401), missing permission (403 in JSON), wrong path (404) or a region or model not enabled.",
      fix: ["Read the response body; APIs explain their errors there.", "Repeat the call with curl and the same headers to separate your code from the service.", "Check keys, scopes, region and the service's status page."],
      cmds: "curl -sS https://api.vendor.example/v1/health -H \"Authorization: Bearer $TOKEN\" -w \"\\nstatus=%{http_code}\\n\"",
      mean: "The network team cannot fix this one. Look at credentials and the request itself." },
  };

  function renderEntnetwork(host) {
    var box = h("div", { class: "wg-w11-box" });
    var layerRow = h("ol", { class: "wg-net-layers", "aria-label": "Network layers, the current one is highlighted" });
    var layerEls = {};
    LAYERS.forEach(function (l) { var li = h("li", { class: "wg-net-layer" }, l); layerEls[l] = li; layerRow.appendChild(li); });
    var trail = h("ol", { class: "wg-net-trail", "aria-label": "Your answers so far" });
    var card = h("div", { class: "wg-net-card", "aria-live": "polite" });
    var mean = meaning();
    var path = [];      // [{id, ans}]
    var cur = "start";

    function setLayer(l) {
      LAYERS.forEach(function (x) { layerEls[x].className = "wg-net-layer" + (x === l ? " wg-net-on" : ""); });
    }
    function go(next, ans) { path.push({ id: cur, ans: ans }); cur = next; draw(true); }
    function back() { if (!path.length) return; cur = path.pop().id; draw(true); }
    function restart() { path = []; cur = "start"; draw(true); }
    function draw(focus) {
      clear(trail); clear(card);
      var n = NET_TREE[cur];
      setLayer(n.layer);
      path.forEach(function (p, i) {
        trail.appendChild(h("li", null, h("span", { class: "wg-net-q" }, NET_TREE[p.id].q), " ",
          h("strong", { class: "wg-net-ans" }, p.ans === "yes" ? "Yes" : "No")));
      });
      trail.hidden = path.length === 0;
      var nav = h("div", { class: "wg-w11-row" },
        btn("Back", back, path.length ? "" : "wg-net-hide"), btn("Start over", restart));
      if (n.q) {
        var head = h("p", { class: "wg-net-qbig", tabindex: "-1" }, "Question " + (path.length + 1) + ": " + n.q);
        card.appendChild(head);
        card.appendChild(h("p", { class: "wg-w11-note" }, n.hint));
        card.appendChild(h("div", { class: "wg-w11-row" },
          btn("Yes", function () { go(n.yes, "yes"); }, "wg-w11-primary"),
          btn("No", function () { go(n.no, "no"); }, "wg-w11-primary")));
        if (path.length) card.appendChild(nav);
        mean.set(path.length === 0
          ? "Start from the exact error text on the machine that fails. Each answer narrows the problem to one layer of the path."
          : "So far you have ruled out " + path.length + " possibilit" + (path.length === 1 ? "y" : "ies") + ". This question checks the " + n.layer + " layer.");
        if (focus) head.focus();
      } else {
        var t = h("p", { class: "wg-net-cause", tabindex: "-1" }, "Likely cause: " + n.cause);
        card.appendChild(t);
        card.appendChild(h("p", { class: "wg-net-text" }, n.text));
        card.appendChild(h("div", { class: "wg-w11-sub" }, "How to fix it"));
        card.appendChild(h("ul", { class: "wg-net-fix" }, n.fix.map(function (f) { return h("li", null, f); })));
        card.appendChild(h("div", { class: "wg-w11-sub" }, "Commands to confirm"));
        card.appendChild(h("pre", { class: "wg-w11-pre" }, n.cmds));
        card.appendChild(nav);
        mean.set(n.mean);
        if (focus) t.focus();
      }
    }
    box.appendChild(layerRow);
    box.appendChild(trail);
    box.appendChild(card);
    box.appendChild(mean.el);
    box.appendChild(h("p", { class: "wg-w11-note" }, "Host names and addresses are examples. Always run checks from the machine, job or container that actually fails."));
    host.appendChild(box);
    draw(false);
  }

  Object.assign(WIDGETS, {
    dataformats: {
      title: "Regex and date tester",
      intro: "Test a regular expression against messy example lines and see every match highlighted, then convert a local timestamp across time zones and see how one date string reads in the US and in Europe. Try the daylight saving presets.",
      render: renderDataformats
    },
    entnetwork: {
      title: "Network diagnosis tree",
      intro: "Answer yes or no about the error you see, such as a certificate error, a timeout or a 407, and follow the tree to the likely cause, the fix and the commands that confirm it.",
      render: renderEntnetwork
    }
  });
})();

WIDGET_CSS += `
.wg-w11-box { display:flex; flex-direction:column; gap:12px; font-family:var(--body); color:var(--ink); min-width:0; }
.wg-w11-row { display:flex; flex-wrap:wrap; gap:8px; align-items:flex-end; }
.wg-w11-field { display:flex; flex-direction:column; gap:4px; min-width:0; }
.wg-w11-row > .wg-w11-field { flex:1 1 180px; }
.wg-w11-row > .wg-df-wide { flex:3 1 240px; }
.wg-w11-field label, .wg-w11-sub { font-size:13px; color:var(--muted); }
.wg-w11-in { font:inherit; font-size:14px; padding:6px 8px; border:1px solid var(--line-strong); border-radius:6px; background:var(--bg); color:var(--ink); width:100%; box-sizing:border-box; min-width:0; }
.wg-w11-in:focus-visible, .wg-w11-btn:focus-visible, .wg-df-tab:focus-visible { outline:2px solid var(--accent); outline-offset:1px; }
.wg-w11-btn { font:inherit; font-size:14px; padding:6px 12px; border:1px solid var(--line-strong); border-radius:6px; background:var(--surface); color:var(--ink); cursor:pointer; }
.wg-w11-btn:hover { border-color:var(--accent); }
.wg-w11-primary { background:var(--accent); color:var(--accent-ink); border-color:var(--accent); min-width:72px; }
.wg-w11-mean { background:var(--accent-soft); border-left:3px solid var(--accent); padding:8px 12px; border-radius:4px; margin:0; font-size:14px; line-height:1.5; color:var(--ink); }
.wg-w11-pre { font-family:var(--mono); font-size:12.5px; line-height:1.5; background:var(--code-bg); color:var(--ink); padding:10px 12px; border-radius:6px; margin:0; overflow-x:auto; white-space:pre; max-width:100%; box-sizing:border-box; }
.wg-w11-note { color:var(--muted); font-size:13px; margin:0; line-height:1.5; }
.wg-w11-tablewrap { overflow-x:auto; max-width:100%; }
.wg-w11-table { border-collapse:collapse; font-size:13px; width:100%; }
.wg-w11-table th, .wg-w11-table td { border:1px solid var(--line); padding:4px 8px; text-align:left; vertical-align:top; }
.wg-w11-table td { font-family:var(--mono); word-break:break-word; }
.wg-w11-table thead th { background:var(--surface); color:var(--muted); font-weight:600; }
.wg-w11-table tbody th { font-weight:600; font-size:12.5px; }
.wg-df-mono { font-family:var(--mono); }
.wg-df-ta { resize:vertical; min-height:110px; line-height:1.5; }
.wg-df-tabs { display:flex; flex-wrap:wrap; gap:4px; border-bottom:1px solid var(--line); }
.wg-df-tab { font:inherit; font-size:14px; padding:6px 12px; border:1px solid var(--line); border-bottom:none; border-radius:6px 6px 0 0; background:var(--surface); color:var(--muted); cursor:pointer; margin-bottom:-1px; }
.wg-df-tab[aria-selected="true"] { background:var(--bg); color:var(--ink); border-color:var(--line-strong); font-weight:600; }
.wg-df-panel { padding-top:4px; display:flex; flex-direction:column; gap:12px; }
.wg-df-panel[hidden] { display:none; }
.wg-df-checks { gap:16px; }
.wg-df-check { display:flex; align-items:center; gap:6px; font-size:14px; color:var(--ink); cursor:pointer; }
.wg-df-hl { font-family:var(--mono); font-size:13px; line-height:1.7; white-space:pre-wrap; word-break:break-word; background:var(--code-bg); border:1px solid var(--line); border-radius:6px; padding:8px 10px; }
.wg-df-mark { background:var(--hl); color:var(--ink); border-bottom:2px solid var(--accent); border-radius:2px; padding:0 1px; }
.wg-df-err { color:var(--ink); background:var(--hl); padding:4px 8px; border-radius:4px; }
.wg-df-presets .wg-w11-btn { font-size:13px; padding:4px 10px; }
.wg-df-h { margin:4px 0 0; font-size:15px; color:var(--ink); }
.wg-net-layers { list-style:none; display:flex; flex-wrap:wrap; gap:4px; padding:0; margin:0; }
.wg-net-layer { font-size:12px; padding:3px 10px; border:1px solid var(--line); border-radius:999px; color:var(--muted); background:var(--surface); }
.wg-net-on { background:var(--accent); color:var(--accent-ink); border-color:var(--accent); font-weight:600; }
.wg-net-trail { margin:0; padding-left:20px; font-size:13px; color:var(--muted); display:flex; flex-direction:column; gap:4px; }
.wg-net-ans { color:var(--ink); }
.wg-net-card { border:1px solid var(--line-strong); border-radius:8px; padding:12px 14px; background:var(--surface); display:flex; flex-direction:column; gap:10px; }
.wg-net-qbig, .wg-net-cause { margin:0; font-size:16px; font-weight:600; line-height:1.4; color:var(--ink); outline:none; }
.wg-net-cause { color:var(--accent); }
.wg-net-text { margin:0; font-size:14px; line-height:1.5; }
.wg-net-fix { margin:0; padding-left:20px; font-size:14px; line-height:1.5; display:flex; flex-direction:column; gap:4px; }
.wg-net-hide { display:none; }
`;
