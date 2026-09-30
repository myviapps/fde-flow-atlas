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
  function uid() { return "wgw17-" + Math.random().toString(36).slice(2, 10); }
  function fmt(x, d) {
    if (!isFinite(x)) return "n/a";
    return Number(x).toLocaleString("en-US", { maximumFractionDigits: d == null ? 0 : d, minimumFractionDigits: 0 });
  }
  function money(x) { return (x < 0 ? "-" : "") + "$" + fmt(Math.abs(Math.round(x))); }
  function slider(label, min, max, step, value, show, onchange) {
    var id = uid();
    var val = h("output", { class: "wg-w17-val", for: id });
    var inp = h("input", { type: "range", id: id, min: min, max: max, step: step, value: value });
    function upd() { val.textContent = show(Number(inp.value)); }
    inp.addEventListener("input", function () { upd(); onchange(); });
    upd();
    var el = h("div", { class: "wg-w17-field" },
      h("label", { class: "wg-w17-lab", for: id }, h("span", null, label), val), inp);
    return { el: el, input: inp, get: function () { return Number(inp.value); } };
  }
  function numField(label, value, min, max, step, onchange) {
    var id = uid();
    var inp = h("input", { type: "number", id: id, class: "wg-w17-num", value: value, min: min, max: max, step: step });
    inp.addEventListener("input", onchange);
    var el = h("div", { class: "wg-w17-field" }, h("label", { class: "wg-w17-lab", for: id }, h("span", null, label)), inp);
    return { el: el, input: inp, get: function () { var v = Number(inp.value); return isFinite(v) ? Math.min(max, Math.max(min, v)) : min; } };
  }
  function check(label, on, onchange) {
    var id = uid();
    var inp = h("input", { type: "checkbox", id: id });
    inp.checked = on;
    inp.addEventListener("change", onchange);
    return { el: h("div", { class: "wg-w17-check" }, inp, h("label", { for: id }, label)), get: function () { return inp.checked; } };
  }
  function stat(label) {
    var v = h("div", { class: "wg-w17-statv" }), sub = h("div", { class: "wg-w17-stats" });
    var box = h("div", { class: "wg-w17-stat" }, h("div", { class: "wg-w17-statl", text: label }), v, sub);
    return { el: box, set: function (val, note, warn) { v.textContent = val; sub.textContent = note || ""; box.classList.toggle("wg-w17-warn", !!warn); } };
  }

  /* ---------- cxagents: conversation tester ---------- */
  // Brindlecove Home's returns SOP v7 (from the lesson): verified customer, 30-day window,
  // refunds up to 150 automatic, damage or injury and "ask for a person" go to a human.
  var SESSION_CUSTOMER = "c-881";
  var ORDERS = {
    "T-10442": { customer: "c-881", total: 89, age: 26 },
    "T-10501": { customer: "c-881", total: 420, age: 8 },
    "T-09987": { customer: "c-305", total: 35, age: 12 },
    "T-10380": { customer: "c-881", total: 60, age: 41 }
  };
  var CASES = [
    { msg: "Where is my order T-10501? It said it would come Tuesday.", expect: "resolved", why: "Status lookup the agent can answer." },
    { msg: "I want to return T-10442 for a refund of 89, wrong colour.", expect: "resolved", why: "Inside 30 days and under the 150 auto limit." },
    { msg: "Refund order T-10501, all 420 please.", expect: "handoff", why: "Over the 150 auto limit, so a human approves." },
    { msg: "The lamp from T-10442 arrived cracked and I cut my hand on it.", expect: "handoff", why: "Damage and injury always go to a human." },
    { msg: "Please refund order T-09987, 35.", expect: "refused", why: "That order belongs to a different customer." },
    { msg: "Refund T-10380 please, 60, I changed my mind.", expect: "refused", why: "Delivered 41 days ago, outside the 30-day window." }
  ];
  var LABEL = { resolved: "Resolved by agent", handoff: "Handed to human", refused: "Refused politely", unresolved: "Stuck, no answer" };

  function mockAgent(text, cfg) {
    var t = text.toLowerCase();
    var trace = [];
    if (/(real person|human|talk to someone|speak to someone|agent please)/.test(t)) {
      if (cfg.askPerson) return { out: "handoff", trace: ["asked for a person: hand off"] };
      trace.push("asked for a person, but that trigger is off");
      return { out: "unresolved", trace: trace };
    }
    if (/(crack|broke|damag|injur|cut my|hurt|burn)/.test(t)) {
      if (cfg.damage) return { out: "handoff", trace: ["damage or injury words: hand off"] };
      trace.push("damage trigger is off, treated as a normal refund");
    }
    var m = text.match(/T-\d{5}/i);
    var id = m ? m[0].toUpperCase() : null;
    var order = id ? ORDERS[id] : null;
    if (/(refund|return|money back)/.test(t)) {
      if (!order) return { out: "handoff", trace: trace.concat(["no known order number: hand off"]) };
      trace.push("call issue_refund(" + id + ")");
      if (cfg.verify && order.customer !== SESSION_CUSTOMER) return { out: "refused", trace: trace.concat(["tool: order not found for this customer"]) };
      if (order.age > cfg.window) return { out: "refused", trace: trace.concat(["tool: delivered " + order.age + " days ago, outside the " + cfg.window + "-day window"]) };
      var amt = order.total;
      var am = t.replace(/t-\d{5}/g, " ").match(/\d{2,5}/g);
      if (am) { var n = Number(am[am.length - 1]); if (n > 0 && n < 100000) amt = n; }
      if (amt > cfg.limit) return { out: "handoff", trace: trace.concat(["tool: " + amt + " is over the " + cfg.limit + " auto limit: needs_human"]) };
      return { out: "resolved", trace: trace.concat(["tool: refunded " + amt]) };
    }
    if (/(where|status|track|arrive|deliver)/.test(t)) {
      if (!order) return { out: "unresolved", trace: ["status question with no order number"] };
      trace.push("call lookup_order(" + id + ")");
      if (cfg.verify && order.customer !== SESSION_CUSTOMER) return { out: "refused", trace: trace.concat(["tool: order not found for this customer"]) };
      return { out: "resolved", trace: trace.concat(["tool: shipped, arriving Thursday"]) };
    }
    return { out: "handoff", trace: ["no matching intent: fall back to a human"] };
  }

  function renderCx(host) {
    var wrap = h("div", { class: "wg-w17-wrap" });
    host.appendChild(wrap);
    var limit = slider("Auto-refund limit", 0, 500, 10, 150, function (v) { return "$" + v; }, run);
    var windowS = slider("Return window used by the tool", 7, 60, 1, 30, function (v) { return v + " days"; }, run);
    var verify = check("Tool checks the order belongs to the verified customer", true, run);
    var damage = check("Hand off on damage or injury words", true, run);
    var person = check("Hand off when the customer asks for a person", true, run);
    wrap.appendChild(h("p", { class: "wg-w17-note", text: "Agent settings. The SOP (the expected results) stays fixed: 30-day window, $150 auto limit, damage goes to a human. The logged-in customer is c-881." }));
    wrap.appendChild(h("div", { class: "wg-w17-grid" }, limit.el, windowS.el));
    wrap.appendChild(h("div", { class: "wg-w17-checks" }, verify.el, damage.el, person.el));

    var stats = h("div", { class: "wg-w17-stats4" });
    var sPass = stat("Tests passed"), sCont = stat("Containment"), sEsc = stat("Escalation rate"), sViol = stat("Policy violations");
    [sPass, sCont, sEsc, sViol].forEach(function (x) { stats.appendChild(x.el); });
    wrap.appendChild(stats);
    var mean = h("div", { class: "wg-w17-mean", role: "status" });
    wrap.appendChild(mean);

    var tbody = h("tbody");
    wrap.appendChild(h("div", { class: "wg-w17-scroll" },
      h("table", { class: "wg-w17-table" },
        h("thead", null, h("tr", null, h("th", { text: "Customer message" }), h("th", { text: "Expected (SOP)" }), h("th", { text: "Agent did" }), h("th", { text: "Result" }))),
        tbody)));

    // free-text try
    var tid = uid();
    var ti = h("input", { type: "text", id: tid, class: "wg-w17-num", value: "Can I talk to a real person please?" });
    var tout = h("div", { class: "wg-cxt-try", role: "status" });
    var tbtn = h("button", { type: "button", class: "wg-w17-btn wg-w17-primary", text: "Send to agent", onclick: tryOne });
    wrap.appendChild(h("div", { class: "wg-w17-panel" },
      h("label", { class: "wg-w17-lab", for: tid }, h("span", null, "Try your own message (orders: T-10442, T-10501, T-09987, T-10380)")),
      h("div", { class: "wg-w17-row" }, ti, tbtn), tout));

    function cfg() { return { limit: limit.get(), window: windowS.get(), verify: verify.get(), damage: damage.get(), askPerson: person.get() }; }
    function tryOne() {
      var r = mockAgent(ti.value, cfg());
      clear(tout);
      tout.appendChild(h("strong", { text: LABEL[r.out] }));
      tout.appendChild(h("div", { class: "wg-w17-note", text: r.trace.join("; ") }));
    }
    function run() {
      if (!tbody) return;
      var c = cfg(), pass = 0, contained = 0, handed = 0, viol = 0, fails = [];
      clear(tbody);
      CASES.forEach(function (k) {
        var r = mockAgent(k.msg, c);
        var ok = r.out === k.expect;
        if (ok) pass++; else fails.push(k);
        if (r.out === "handoff") handed++; else contained++;
        var moved = !ok && r.trace.some(function (x) { return x.indexOf("tool: refunded") === 0; });
        if (moved) viol++;
        tbody.appendChild(h("tr", { class: ok ? "" : "wg-cxt-fail" },
          h("td", null, h("div", { text: k.msg }), h("div", { class: "wg-w17-note", text: r.trace.join("; ") })),
          h("td", null, h("div", { text: LABEL[k.expect] }), h("div", { class: "wg-w17-note", text: k.why })),
          h("td", { text: LABEL[r.out] }),
          h("td", { class: ok ? "wg-cxt-ok" : "wg-cxt-bad", text: ok ? "Pass" : (moved ? "Fail: refund" : "Fail") })));
      });
      var n = CASES.length;
      sPass.set(pass + " / " + n, pass === n ? "safe to release" : "block the release", pass < n);
      sCont.set(Math.round(contained / n * 100) + "%", contained + " of " + n + " without a human");
      sEsc.set(Math.round(handed / n * 100) + "%", handed + " of " + n + " to a human");
      sViol.set(String(viol), viol ? "money moved against the SOP" : "none", viol > 0);
      if (pass === n) mean.textContent = "Every scripted case matches the SOP. Containment is " + Math.round(contained / n * 100) + "% because the SOP itself sends big refunds and damage to people: that is correct, not a failure.";
      else if (viol) mean.textContent = "The agent now gives refunds the SOP forbids (" + viol + " case" + (viol > 1 ? "s" : "") + "). Containment went up, which looks good on a dashboard, but this is exactly the change a regression suite must block.";
      else mean.textContent = fails.length + " case" + (fails.length > 1 ? "s" : "") + " no longer match the SOP, for example: \"" + fails[0].msg + "\". Fix the setting or ask the SOP owner before releasing.";
    }
    run();
    tryOne();
  }

  /* ---------- psa: services margin calculator ---------- */
  function project(model, p) {
    var actual = p.hours * (1 + p.over / 100);
    var revenue;
    if (model === "tm") revenue = actual * p.rate;
    else if (model === "cap") revenue = Math.min(actual, p.cap) * p.rate;
    else revenue = p.fee;
    var cost = actual * p.cost;
    return { actual: actual, revenue: revenue, cost: cost, profit: revenue - cost, margin: revenue > 0 ? (revenue - cost) / revenue : -Infinity };
  }
  var MODEL_NAMES = { tm: "Time and materials", cap: "T&M with a cap", fixed: "Fixed fee" };

  function renderPsa(host) {
    var wrap = h("div", { class: "wg-w17-wrap" });
    host.appendChild(wrap);
    var selId = uid();
    var sel = h("select", { id: selId, class: "wg-w17-num" },
      h("option", { value: "fixed", text: "Fixed fee" }), h("option", { value: "tm", text: "Time and materials" }), h("option", { value: "cap", text: "T&M with a not-to-exceed cap" }));
    sel.addEventListener("change", run);
    var rate = numField("Rate charged per hour ($, example)", 250, 50, 1000, 10, run);
    var cost = numField("Loaded cost per hour ($, example)", 110, 20, 800, 5, run);
    var hours = slider("Planned hours", 50, 1500, 10, 400, function (v) { return v + " h"; }, run);
    var over = slider("Overrun (extra hours)", -20, 100, 5, 25, function (v) { return (v > 0 ? "+" : "") + v + "%"; }, run);
    var fee = numField("Fixed fee ($)", 100000, 1000, 2000000, 1000, run);
    var cap = numField("Cap (hours billable at most)", 440, 10, 5000, 10, run);
    var target = slider("Target margin", 0, 60, 5, 30, function (v) { return v + "%"; }, run);
    wrap.appendChild(h("div", { class: "wg-w17-grid" },
      h("div", { class: "wg-w17-field" }, h("label", { class: "wg-w17-lab", for: selId }, h("span", null, "Pricing model in the SOW")), sel),
      rate.el, cost.el, hours.el, over.el, fee.el, cap.el, target.el));
    wrap.appendChild(h("p", { class: "wg-w17-note", text: "Example rates and costs, change them to your own. Loaded cost means salary plus benefits, taxes and overhead per hour." }));

    var stats = h("div", { class: "wg-w17-stats4" });
    var sHours = stat("Actual hours"), sRev = stat("Revenue"), sCost = stat("Delivery cost"), sMargin = stat("Margin");
    [sHours, sRev, sCost, sMargin].forEach(function (x) { stats.appendChild(x.el); });
    wrap.appendChild(stats);
    var mean = h("div", { class: "wg-w17-mean", role: "status" });
    wrap.appendChild(mean);

    var panel = h("div", { class: "wg-w17-panel" }, h("div", { class: "wg-w17-cap", text: "Same project, same overrun, under each pricing model" }));
    var svg = s("svg", { viewBox: "0 0 400 215", class: "wg-w17-svg", role: "img" });
    panel.appendChild(svg);
    wrap.appendChild(panel);

    function params() { return { rate: rate.get(), cost: cost.get(), hours: hours.get(), over: over.get(), fee: fee.get(), cap: cap.get() }; }
    function run() {
      if (!svg) return;
      var p = params(), m = sel.value, r = project(m, p), tgt = target.get() / 100;
      fee.input.disabled = m !== "fixed"; cap.input.disabled = m !== "cap";
      sHours.set(fmt(r.actual) + " h", "planned " + fmt(p.hours) + " h");
      sRev.set(money(r.revenue), m === "fixed" ? "fixed, whatever it takes" : m === "cap" ? "billable " + fmt(Math.min(r.actual, p.cap)) + " h" : "every hour billed");
      sCost.set(money(r.cost), fmt(r.actual) + " h x $" + fmt(p.cost));
      sMargin.set(isFinite(r.margin) ? fmt(r.margin * 100, 1) + "%" : "n/a", "profit " + money(r.profit), r.margin < tgt);
      // break-even overrun for the fixed fee: fee = hours*(1+o)*cost
      var beFixed = (p.fee / (p.hours * p.cost) - 1) * 100;
      var tgtOver = ((1 - tgt) * p.fee / (p.hours * p.cost) - 1) * 100;
      var msg;
      if (m === "fixed") {
        msg = "With a fixed fee your company carries the overrun. This project hits the " + target.get() + "% target only if the overrun stays under " + fmt(tgtOver, 0) + "%, and loses money above " + fmt(beFixed, 0) + "%.";
      } else if (m === "tm") {
        msg = "Under time and materials the customer pays for every extra hour, so margin stays at " + fmt((1 - p.cost / p.rate) * 100, 1) + "% whatever the overrun. The risk sits with the customer, which is why they often ask for a cap.";
      } else {
        msg = r.actual > p.cap
          ? fmt(r.actual - p.cap) + " hours above the cap are unpaid, so margin falls to " + fmt(r.margin * 100, 1) + "%. Above the cap, a T&M deal behaves like a fixed fee."
          : "The project is still under the cap, so every hour is billed and margin is " + fmt(r.margin * 100, 1) + "%. Push the overrun up to see the cap bite.";
      }
      if (r.margin < 0) msg += " Right now the project loses money: raise a change request early.";
      else if (r.margin < tgt) msg += " Below target: check scope, assumptions and unraised change requests.";
      mean.textContent = msg;
      drawBars(p, m, tgt);
    }
    function drawBars(p, chosen, tgt) {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var models = ["tm", "cap", "fixed"], x0 = 30, x1 = 350, lo = -0.4, hi = 0.8;
      function X(v) { return x0 + (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo) * (x1 - x0); }
      [-0.4, 0, 0.4, 0.8].forEach(function (g) {
        svg.appendChild(s("line", { x1: X(g), x2: X(g), y1: 24, y2: 190, stroke: "var(--line)", "stroke-width": 1 }));
        svg.appendChild(s("text", { x: X(g), y: 208, "text-anchor": "middle", class: "wg-w17-svgt", text: Math.round(g * 100) + "%" }));
      });
      svg.appendChild(s("line", { x1: X(tgt), x2: X(tgt), y1: 14, y2: 192, stroke: "var(--ink)", "stroke-width": 1.5, "stroke-dasharray": "4 3" }));
      svg.appendChild(s("text", { x: X(tgt) + 4, y: 14, class: "wg-w17-svgt", text: "target " + Math.round(tgt * 100) + "%" }));
      models.forEach(function (mm, i) {
        var r = project(mm, p), y = 30 + i * 56, v = isFinite(r.margin) ? r.margin : lo;
        var xa = X(Math.min(0, v)), xb = X(Math.max(0, v));
        svg.appendChild(s("text", { x: x0, y: y + 12, class: "wg-w17-svgt" + (mm === chosen ? " wg-psm-on" : ""), text: MODEL_NAMES[mm] + (mm === chosen ? " (chosen)" : "") }));
        svg.appendChild(s("rect", { x: xa, y: y + 18, width: Math.max(2, xb - xa), height: 20, rx: 3,
          fill: mm === chosen ? "var(--accent)" : "var(--line-strong)" }));
        var right = v >= 0;
        var lx = right ? xb + 5 : xa - 5, anchor = right ? "start" : "end";
        if (right && lx > 360) { lx = xb - 5; anchor = "end"; }
        svg.appendChild(s("text", { x: lx, y: y + 33, "text-anchor": anchor, class: "wg-w17-svgv", text: isFinite(r.margin) ? Math.round(r.margin * 100) + "%" : "n/a" }));
      });
    }
    run();
  }

  Object.assign(WIDGETS, {
    cxagents: {
      title: "Conversation tester",
      intro: "Six scripted customer messages run through a rules-based stand-in for a support agent and are scored against the returns SOP. Change the agent's settings, for example raise the refund limit or switch off the identity check, and watch which tests fail and how containment moves.",
      render: renderCx
    },
    psa: {
      title: "Services margin calculator",
      intro: "Pick a pricing model and move the overrun slider. Notice who pays for the extra hours: under time and materials the customer does, under a fixed fee your margin does.",
      render: renderPsa
    }
  });
})();
WIDGET_CSS += `
.wg-w17-wrap { display: flex; flex-direction: column; gap: 14px; font-family: var(--body); color: var(--ink); min-width: 0; }
.wg-w17-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 10px 18px; }
.wg-w17-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.wg-w17-lab { display: flex; justify-content: space-between; gap: 8px; font-size: 13px; color: var(--muted); flex-wrap: wrap; }
.wg-w17-val { font-family: var(--mono); color: var(--ink); font-size: 13px; }
.wg-w17-field input[type=range] { width: 100%; accent-color: var(--accent); }
.wg-w17-num { font: inherit; font-size: 14px; color: var(--ink); background: var(--surface); border: 1px solid var(--line-strong); border-radius: 6px; padding: 6px 8px; width: 100%; box-sizing: border-box; min-width: 0; }
.wg-w17-num:disabled { color: var(--muted); border-style: dashed; background: var(--code-bg); }
.wg-w17-checks { display: flex; flex-direction: column; gap: 6px; }
.wg-w17-check { display: flex; gap: 8px; align-items: flex-start; font-size: 14px; }
.wg-w17-check input { margin-top: 3px; accent-color: var(--accent); flex: 0 0 auto; }
.wg-w17-row { display: flex; gap: 8px; align-items: center; margin-top: 4px; }
.wg-w17-row .wg-w17-num { flex: 1 1 auto; }
.wg-w17-btn { font: inherit; font-size: 14px; padding: 7px 14px; border-radius: 6px; border: 1px solid var(--line-strong); background: var(--surface); color: var(--ink); cursor: pointer; flex: 0 0 auto; }
.wg-w17-btn:hover { border-color: var(--accent); }
.wg-w17-primary { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
.wg-w17-panel { border: 1px solid var(--line); border-radius: 8px; padding: 10px; background: var(--surface); }
.wg-w17-cap { font-size: 12px; color: var(--muted); margin-bottom: 6px; }
.wg-w17-svg { width: 100%; max-width: 560px; height: auto; display: block; margin: 0 auto; }
.wg-w17-svgt { font-family: var(--mono); font-size: 13px; fill: var(--muted); }
.wg-w17-svgv { font-family: var(--mono); font-size: 14px; fill: var(--ink); font-weight: 600; }
.wg-psm-on { fill: var(--ink); font-weight: 600; }
.wg-w17-stats4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; }
.wg-w17-stat { border: 1px solid var(--line); border-radius: 8px; padding: 8px 10px; background: var(--surface); }
.wg-w17-statl { font-size: 12px; color: var(--muted); }
.wg-w17-statv { font-size: 20px; font-weight: 600; font-family: var(--mono); margin-top: 2px; word-break: break-word; }
.wg-w17-stats { font-size: 12px; color: var(--muted); }
.wg-w17-warn { border-color: var(--accent); border-width: 2px; }
.wg-w17-warn .wg-w17-statv { color: var(--accent); }
.wg-w17-mean { background: var(--accent-soft); border-left: 3px solid var(--accent); padding: 10px 12px; border-radius: 6px; font-size: 14px; line-height: 1.5; }
.wg-w17-note { font-size: 12px; color: var(--muted); margin: 0; line-height: 1.5; }
.wg-w17-scroll { overflow-x: auto; max-width: 100%; }
.wg-w17-table { border-collapse: collapse; font-size: 13px; width: 100%; min-width: 520px; }
.wg-w17-table th, .wg-w17-table td { border-bottom: 1px solid var(--line); padding: 6px 8px; text-align: left; vertical-align: top; }
.wg-w17-table th { color: var(--muted); font-weight: 600; font-size: 12px; }
.wg-cxt-fail td { background: var(--hl); }
.wg-cxt-fail td .wg-w17-note { color: var(--ink); }
.wg-cxt-ok { font-weight: 600; }
.wg-cxt-bad { font-weight: 700; color: var(--ink); text-decoration: underline; }
.wg-cxt-try { margin-top: 8px; font-size: 14px; }
`;
