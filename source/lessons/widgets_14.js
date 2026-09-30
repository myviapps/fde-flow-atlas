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
    if (arguments.length > 2) { for (var j = 1; j < arguments.length; j++) add(e, arguments[j]); return; }
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
  function uid() { return "wgw14-" + Math.random().toString(36).slice(2, 10); }
  function slider(label, min, max, step, value, show, onchange) {
    var id = uid();
    var val = h("output", { class: "wg-w14-val", for: id });
    var inp = h("input", { type: "range", id: id, min: min, max: max, step: step, value: value });
    function upd() { val.textContent = show(Number(inp.value)); }
    inp.addEventListener("input", function () { upd(); onchange(); });
    upd();
    var el = h("div", { class: "wg-w14-field" },
      h("label", { class: "wg-w14-lab", for: id }, h("span", null, label), val), inp);
    return { el: el, input: inp, get: function () { return Number(inp.value); } };
  }
  function checkbox(label, checked, onchange, extraCls) {
    var id = uid();
    var inp = h("input", { type: "checkbox", id: id });
    inp.checked = !!checked;
    inp.addEventListener("change", onchange);
    var el = h("div", { class: "wg-w14-check" + (extraCls ? " " + extraCls : "") }, inp, h("label", { for: id, text: label }));
    return { el: el, input: inp, get: function () { return inp.checked; } };
  }
  function meaning() {
    var t = h("span");
    var el = h("div", { class: "wg-w14-mean", role: "status" }, h("strong", { text: "What this means: " }), t);
    return { el: el, set: function (x) { t.textContent = x; } };
  }
  function btn(label, onclick, cls) {
    return h("button", { type: "button", class: "wg-w14-btn" + (cls ? " " + cls : ""), onclick: onclick, text: label });
  }
  function clock(min) {
    var t = 9 * 60 + 40 + min;
    var hh = Math.floor(t / 60), mm = t % 60;
    return (hh < 10 ? "0" : "") + hh + ":" + (mm < 10 ? "0" : "") + mm;
  }

  /* =====================================================================
     AIREADINESS: use-case scorer and 2x2
     ===================================================================== */
  var AIR_DEFAULTS = [
    ["Claims email triage", 4, 4, 2],
    ["Adjuster note summaries", 3, 5, 2],
    ["Fraud flagging", 5, 2, 5],
    ["Public policy chatbot", 4, 3, 4],
    ["Broker quote extraction", 4, 2, 2],
    ["Office party planner", 1, 5, 1]
  ];
  var AIR_W = { value: 0.5, feas: 0.3, safety: 0.2 };

  function airQuad(v, f) {
    var hv = v >= 3, hf = f >= 3;
    if (hv && hf) return "Quick win";
    if (hv) return "Big bet";
    if (hf) return "Filler";
    return "Avoid";
  }

  function renderAir(host) {
    var wrap = h("div", { class: "wg-w14-wrap" });
    host.appendChild(wrap);
    var rows = [];
    var list = h("div", { class: "wg-air-list" });
    AIR_DEFAULTS.forEach(function (d, i) {
      var nid = uid();
      var name = h("input", { type: "text", id: nid, value: d[0], class: "wg-w14-txt", maxlength: 40 });
      name.addEventListener("input", update);
      var v = slider("Value", 1, 5, 1, d[1], String, update);
      var f = slider("Feasibility", 1, 5, 1, d[2], String, update);
      var r = slider("Risk", 1, 5, 1, d[3], String, update);
      var card = h("div", { class: "wg-air-card" },
        h("label", { class: "wg-w14-lab", for: nid }, h("span", { text: "Use case " + (i + 1) })),
        name,
        h("div", { class: "wg-air-sl" }, v.el, f.el, r.el));
      list.appendChild(card);
      rows.push({ name: name, v: v, f: f, r: r, n: i + 1 });
    });

    var svgBox = h("div", { class: "wg-w14-panel" });
    var ranked = h("div", { class: "wg-w14-panel" });
    var mean = meaning();
    add(wrap,
      h("p", { class: "wg-w14-note", text: "Scores run 1 (poor) to 5 (great); risk runs 1 (low) to 5 (high). Score = 0.5 x value + 0.3 x feasibility + 0.2 x (6 - risk). These weights are an example: agree your own with the sponsor." }),
      list,
      h("div", { class: "wg-w14-two" }, svgBox, ranked),
      mean.el);

    function update() {
      var data = rows.map(function (r) {
        var v = r.v.get(), f = r.f.get(), k = r.r.get();
        var nm = r.name.value.trim() || ("Use case " + r.n);
        var score = AIR_W.value * v + AIR_W.feas * f + AIR_W.safety * (6 - k);
        return { n: r.n, name: nm, v: v, f: f, k: k, score: Math.round(score * 100) / 100, quad: airQuad(v, f) };
      });

      /* 2x2 plot */
      clear(svgBox);
      var W = 320, H = 300, L = 40, T = 14, P = 250;
      var svg = s("svg", { viewBox: "0 0 " + W + " " + H, class: "wg-w14-svg", role: "img", "aria-label": "Value against feasibility chart with four quadrants" });
      function x(f) { return L + (f - 0.5) / 5 * P; }
      function y(v) { return T + (5.5 - v) / 5 * P; }
      var mid = x(2.5), midY = y(2.5);
      svg.appendChild(s("rect", { x: mid, y: T, width: L + P - mid, height: midY - T, class: "wg-air-qw" }));
      svg.appendChild(s("rect", { x: L, y: T, width: P, height: P, class: "wg-air-frame" }));
      svg.appendChild(s("line", { x1: mid, y1: T, x2: mid, y2: T + P, class: "wg-air-mid" }));
      svg.appendChild(s("line", { x1: L, y1: midY, x2: L + P, y2: midY, class: "wg-air-mid" }));
      [["Big bet", L + 6, T + 14], ["Quick win", L + P - 6, T + 14], ["Avoid", L + 6, T + P - 6], ["Filler", L + P - 6, T + P - 6]].forEach(function (q, i) {
        svg.appendChild(s("text", { x: q[1], y: q[2], class: "wg-w14-svgt", "text-anchor": i % 2 ? "end" : "start", text: q[0] }));
      });
      svg.appendChild(s("text", { x: L + P / 2, y: T + P + 30, class: "wg-w14-svgt", "text-anchor": "middle", text: "Feasibility (easier to build) ->" }));
      svg.appendChild(s("text", { x: 12, y: T + P / 2, class: "wg-w14-svgt", "text-anchor": "middle", transform: "rotate(-90 12 " + (T + P / 2) + ")", text: "Value ->" }));
      /* place points, nudging duplicates */
      var seen = {};
      data.forEach(function (d) {
        var key = d.v + "," + d.f;
        var k = seen[key] = (seen[key] || 0) + 1;
        var ox = (k - 1) % 3 * 16 - 16 * (k > 1 ? 1 : 0), oy = Math.floor((k - 1) / 3) * 16;
        var cx = x(d.f) + ox, cy = y(d.v) + oy;
        var risky = d.k >= 4;
        svg.appendChild(s("circle", { cx: cx, cy: cy, r: 10, class: risky ? "wg-air-dot wg-air-risk" : "wg-air-dot" }));
        svg.appendChild(s("text", { x: cx, y: cy + 4, "text-anchor": "middle", class: risky ? "wg-air-num wg-air-numr" : "wg-air-num", text: String(d.n) }));
      });
      svgBox.appendChild(h("div", { class: "wg-w14-cap", text: "Value against feasibility (numbers match the use cases)" }));
      svgBox.appendChild(svg);
      svgBox.appendChild(h("div", { class: "wg-w14-legend" },
        h("span", null, h("span", { class: "wg-air-sw" }), "risk 1 to 3"),
        h("span", null, h("span", { class: "wg-air-sw wg-air-swr" }), "risk 4 or 5: needs a risk review")));

      /* ranking */
      clear(ranked);
      var sorted = data.slice().sort(function (a, b) { return b.score - a.score || a.n - b.n; });
      var tb = h("tbody");
      sorted.forEach(function (d, i) {
        tb.appendChild(h("tr", { class: i === 0 ? "wg-air-top" : null },
          h("td", { text: String(i + 1) }),
          h("td", { text: d.n + ". " + d.name }),
          h("td", { class: "wg-w14-mono", text: d.score.toFixed(2) }),
          h("td", { text: d.quad + (d.k >= 4 ? ", high risk" : "") })));
      });
      ranked.appendChild(h("div", { class: "wg-w14-cap", text: "Ranked by weighted score" }));
      ranked.appendChild(h("div", { class: "wg-w14-scroll" }, h("table", { class: "wg-w14-table" },
        h("thead", null, h("tr", null, h("th", { text: "#" }), h("th", { text: "Use case" }), h("th", { text: "Score" }), h("th", { text: "Where" }))), tb)));

      /* meaning: first pilot = best quick win with risk <= 3 */
      var pilot = sorted.filter(function (d) { return d.quad === "Quick win" && d.k <= 3; })[0];
      var top = sorted[0];
      var msg;
      if (!pilot) msg = "No use case is both valuable, feasible and low risk yet. Improve the data or narrow a big bet before you pick a pilot.";
      else if (pilot === top) msg = "Pilot \"" + pilot.name + "\" first: it has the highest score and is a quick win with manageable risk.";
      else msg = "\"" + top.name + "\" scores highest, but it is a " + top.quad.toLowerCase() + (top.k >= 4 ? " with high risk" : "") + ". \"" + pilot.name + "\" is the best quick win with manageable risk, so it makes a safer first pilot.";
      mean.set(msg);
    }
    update();
  }

  /* =====================================================================
     GOLIVE: go / no-go gate
     ===================================================================== */
  var GL_MUST = [
    ["uat", "UAT signed off by the business owner", true, "UAT is not signed off, so the business has not accepted the system."],
    ["rb", "Rollback method tested in staging", false, "The rollback has never been tested; an untested rollback is a hope, not a plan."],
    ["rec", "Migration dry run reconciled (counts match)", true, "Migrated data has not been reconciled, so records may be missing."],
    ["cab", "Change approved by the customer's CAB for this window", true, "There is no approved change, so the release would break the customer's change process."],
    ["run", "Runbook written and handed to support", true, "Support has no runbook for the first problems."],
    ["oc", "On-call named for every day of week one", true, "Nobody is named on call for week one."]
  ];
  var GL_SHOULD = [
    ["trn", "End users trained on their top tasks", true, "Some users are untrained: expect extra how-to tickets in week one."],
    ["com", "Go-live notice sent to users", false, "Users have not been told: send the notice before the window opens."],
    ["dash", "Dashboards and alerts live and tested", true, "No tested alerts: you may learn about problems from users first."],
    ["def", "Every open minor defect has a written workaround", true, "Some minor defects have no workaround: support will improvise."]
  ];

  function renderGolive(host) {
    var wrap = h("div", { class: "wg-w14-wrap" });
    host.appendChild(wrap);
    var must = [], should = [];
    var mBox = h("fieldset", { class: "wg-w14-panel wg-gl-fs" }, h("legend", { class: "wg-gl-leg", text: "Must have (any gap means no-go)" }));
    var sBox = h("fieldset", { class: "wg-w14-panel wg-gl-fs" }, h("legend", { class: "wg-gl-leg", text: "Should have (gaps are accepted risks)" }));
    GL_MUST.forEach(function (c) { var cb = checkbox(c[1], c[2], update); must.push({ c: c, cb: cb }); mBox.appendChild(cb.el); });
    GL_SHOULD.forEach(function (c) { var cb = checkbox(c[1], c[2], update); should.push({ c: c, cb: cb }); sBox.appendChild(cb.el); });
    var sev = slider("Open severity 1 or 2 defects", 0, 5, 1, 0, function (v) { return v + (v === 1 ? " defect" : " defects"); }, update);
    mBox.appendChild(sev.el);

    var gate = h("div", { class: "wg-gl-gate", role: "status" });
    var reasons = h("ul", { class: "wg-gl-reasons" });
    var mean = meaning();
    var actions = h("div", { class: "wg-w14-row" },
      btn("Tick everything", function () { must.concat(should).forEach(function (m) { m.cb.input.checked = true; }); update(); }),
      btn("Clear all", function () { must.concat(should).forEach(function (m) { m.cb.input.checked = false; }); update(); }));
    add(wrap,
      h("p", { class: "wg-w14-note", text: "You are chairing the go/no-go call the afternoon before cutover. Tick what is really true, then read the decision." }),
      h("div", { class: "wg-w14-two" }, mBox, sBox),
      actions,
      h("div", { class: "wg-w14-panel" }, gate, reasons),
      mean.el);

    function update() {
      var blockers = [], risks = [];
      must.forEach(function (m) { if (!m.cb.get()) blockers.push(m.c[3]); });
      if (sev.get() > 0) blockers.push(sev.get() + " open severity 1 or 2 " + (sev.get() === 1 ? "defect" : "defects") + ": fix, or agree a downgrade with evidence.");
      should.forEach(function (m) { if (!m.cb.get()) risks.push(m.c[3]); });
      clear(gate); clear(reasons);
      var state, cls;
      if (blockers.length) { state = "NO-GO"; cls = "wg-gl-no"; }
      else if (risks.length) { state = "GO WITH RISK"; cls = "wg-gl-risk"; }
      else { state = "GO"; cls = "wg-gl-go"; }
      gate.className = "wg-gl-gate " + cls;
      gate.appendChild(h("span", { class: "wg-gl-state", text: state }));
      gate.appendChild(h("span", { class: "wg-gl-count", text: blockers.length + " blocker" + (blockers.length === 1 ? "" : "s") + ", " + risks.length + " accepted risk" + (risks.length === 1 ? "" : "s") }));
      blockers.forEach(function (b) { reasons.appendChild(h("li", { class: "wg-gl-b" }, h("strong", { text: "Blocker: " }), b)); });
      risks.forEach(function (r) { reasons.appendChild(h("li", null, h("strong", { text: "Risk: " }), r)); });
      if (blockers.length) mean.set("Do not go live. Fix the " + (blockers.length === 1 ? "blocker" : blockers.length + " blockers") + ", then rerun the check, or move the window. Moving a date is cheaper than a failed cutover.");
      else if (risks.length) mean.set("You can go, but write the " + (risks.length === 1 ? "risk" : risks.length + " risks") + " in the go/no-go log with an owner each, and say them out loud so the sponsor accepts them.");
      else mean.set("Every criterion is met. Record 'go' with the time and the names of the people who agreed, then start the cutover plan.");
    }
    update();
  }

  /* =====================================================================
     SUPPORTOPS: ticket triage drill
     ===================================================================== */
  var SUP_ROUTES = [
    ["l1", "L1 service desk, KB article"],
    ["l2", "L2 support (investigate)"],
    ["l3", "L3 engineering (code fix, via L2)"],
    ["it", "Customer's own IT"],
    ["prod", "Product team (feature request)"]
  ];
  var SUP_TICKETS = [
    { t: "Since 08:00 no store can log in to the assistant. Staff are phoning head office. No workaround.",
      sev: [1], route: ["l2"], why: "Everyone is blocked with no workaround, so this is severity 1. L2 on-call takes it now and declares an incident; L3 joins if it is a code fault." },
    { t: "\"How do I export last week's answers to a spreadsheet?\"",
      sev: [4], route: ["l1"], why: "A how-to question is severity 4. L1 answers it from the knowledge base; if it keeps coming, improve the KB article." },
    { t: "Every answer about returns quotes the returns policy from last year. The new policy was uploaded on Monday.",
      sev: [2], route: ["l2"], why: "Confidently wrong answers for a whole topic are severity 2 even though nothing is down. L2 checks the indexing and document settings." },
    { t: "One pharmacist's password expired and she cannot sign in. Everyone else is fine.",
      sev: [3, 4], route: ["it"], why: "One user, a clear cause and an easy fix: severity 3 or 4. Sign-in uses the customer's own accounts, so their IT desk resets it." },
    { t: "L2 has reproduced it: tables in supplier price-list PDFs are dropped when the assistant reads them. Staff can open the PDF by hand.",
      sev: [3], route: ["l3"], why: "A real bug with a workaround is severity 3. It is already reproduced, so L2 escalates to L3 with the three sample files." },
    { t: "A user asked about shift cover and the assistant showed another store's staff rota with personal phone numbers.",
      sev: [1], route: ["l2"], why: "Personal data shown to the wrong people is severity 1 even for one report. L2 on-call starts an incident now and brings in security." },
    { t: "Since this morning answers take about 25 seconds instead of 4, for everyone. It still works.",
      sev: [2], route: ["l2"], why: "A major slowdown for all users, with a painful workaround (wait), is severity 2. L2 checks recent changes, load and the model provider status." },
    { t: "\"Could the assistant also answer in Welsh for our stores in Wales?\"",
      sev: [4], route: ["prod"], why: "A feature request is severity 4. Log it for the product team with who asked and why; do not promise a date." }
  ];

  function renderSupport(host) {
    var wrap = h("div", { class: "wg-w14-wrap" });
    host.appendChild(wrap);
    var st = { i: 0, answers: [] };
    var body = h("div", { class: "wg-sup-body" });
    var prog = h("div", { class: "wg-w14-cap", role: "status" });
    var mean = meaning();
    add(wrap,
      h("p", { class: "wg-w14-note", text: "Orrin Bay Pharmacy (made up) runs an AI assistant for 220 stores. Severity: 1 = down or harmful, no workaround; 2 = major feature broken or badly degraded; 3 = minor issue or workaround exists; 4 = question or request." }),
      prog, body, mean.el);

    function show() {
      clear(body);
      if (st.i >= SUP_TICKETS.length) return summary();
      var tk = SUP_TICKETS[st.i];
      prog.textContent = "Ticket " + (st.i + 1) + " of " + SUP_TICKETS.length;
      var sevName = uid(), rid = uid();
      var sevBox = h("fieldset", { class: "wg-sup-fs" }, h("legend", { class: "wg-w14-lab", text: "Severity" }));
      [1, 2, 3, 4].forEach(function (n) {
        var id = uid();
        sevBox.appendChild(h("span", { class: "wg-sup-radio" },
          h("input", { type: "radio", name: sevName, id: id, value: n, checked: n === 3 }),
          h("label", { for: id, text: "Sev " + n })));
      });
      var sel = h("select", { id: rid, class: "wg-w14-sel" });
      SUP_ROUTES.forEach(function (r) { sel.appendChild(h("option", { value: r[0], text: r[1] })); });
      var fb = h("div", { class: "wg-sup-fb", "aria-live": "polite" });
      var check = btn("Check", function () {
        var chosen = Number(body.querySelector("input[name='" + sevName + "']:checked").value);
        var route = sel.value;
        var sOk = tk.sev.indexOf(chosen) >= 0, rOk = tk.route.indexOf(route) >= 0;
        st.answers.push({ sOk: sOk, rOk: rOk, diff: chosen - tk.sev[0] });
        clear(fb);
        fb.className = "wg-sup-fb " + (sOk && rOk ? "wg-sup-ok" : "wg-sup-bad");
        fb.appendChild(h("div", null, h("strong", { text: (sOk ? "Severity right. " : "Severity: expected " + tk.sev.map(function (x) { return "Sev " + x; }).join(" or ") + ". ") + (rOk ? "Route right." : "Route: expected " + SUP_ROUTES.filter(function (r) { return tk.route.indexOf(r[0]) >= 0; })[0][1] + ".") })));
        fb.appendChild(h("div", { text: tk.why }));
        check.disabled = true;
        body.querySelectorAll("input,select").forEach(function (x) { x.disabled = true; });
        next.hidden = false;
        next.focus();
        tally();
      }, "wg-w14-primary");
      var next = btn(st.i === SUP_TICKETS.length - 1 ? "See results" : "Next ticket", function () { st.i++; show(); });
      next.hidden = true;
      add(body,
        h("blockquote", { class: "wg-sup-ticket", text: tk.t }),
        h("div", { class: "wg-w14-two" }, sevBox,
          h("div", { class: "wg-w14-field" }, h("label", { class: "wg-w14-lab", for: rid, text: "Route to" }), sel)),
        h("div", { class: "wg-w14-row" }, check, next),
        fb);
      tally();
    }
    function tally() {
      var a = st.answers;
      if (!a.length) { mean.set("Read the ticket, pick a severity and a route, then press Check."); return; }
      var s = a.filter(function (x) { return x.sOk; }).length, r = a.filter(function (x) { return x.rOk; }).length;
      var over = a.filter(function (x) { return !x.sOk && x.diff < 0; }).length;
      var under = a.filter(function (x) { return !x.sOk && x.diff > 0; }).length;
      var lean = over > under ? " You tend to rate tickets as more serious than they are; that burns on-call time." :
        under > over ? " You tend to rate tickets as less serious than they are; that is the costly mistake, because real outages wait." : "";
      mean.set("So far " + s + " of " + a.length + " severities and " + r + " of " + a.length + " routes are right." + lean);
    }
    function summary() {
      prog.textContent = "Drill complete";
      var a = st.answers;
      var both = a.filter(function (x) { return x.sOk && x.rOk; }).length;
      add(body,
        h("div", { class: "wg-sup-score" }, h("span", { class: "wg-sup-big", text: both + " / " + a.length }), h("span", { text: " tickets fully right (severity and route)" })),
        h("div", { class: "wg-w14-row" }, btn("Try again", function () { st = { i: 0, answers: [] }; show(); }, "wg-w14-primary")));
      tally();
    }
    show();
  }

  /* =====================================================================
     INCIDENTS: incident simulator with a comms timer
     ===================================================================== */
  var INC_CADENCE = 30;
  var INC_STEPS = [
    { q: "09:40. Alerts show 30% of claim summaries failing at Tollbury Mutual. A claims handler phones to complain. What do you do first?",
      o: [["Declare a Sev 2, open a channel, name an incident commander, scribe and comms lead", 4, 1, "Right. Declaring is cheap and gives everyone a role. The update timer is now running."],
          ["Open the logs and start debugging yourself", 20, 0, "Twenty minutes pass with nobody coordinating and nobody talking to the customer."],
          ["Wait 15 minutes to see if it clears", 15, 0, "It does not clear. Users are still failing and you have lost 15 minutes."]] },
    { q: "A release went out at 09:30. Errors started at 09:32. What next?",
      o: [["Roll back the 09:30 release now and watch the error rate", 10, 1, "Right. Stabilise first. Errors fall from 30% to 10%, so the release was part of it, but not all."],
          ["Find the exact bug in the release before touching anything", 40, 0, "Forty minutes of diagnosis while users keep failing. Stop the harm first, understand it later."],
          ["Restart all the servers", 12, 0, "Restarts change nothing and the errors return. Undo the recent change instead."]] },
    { q: "Tollbury's major incident manager opens bridge INC-40721 and asks for your status.",
      o: [["Give a 30-second status: impact, done, next, next update time; add their ticket number", 5, 1, "Right. Short, structured and in their process. They record it in their ITSM tool."],
          ["Send the engineer who is debugging to talk on the bridge", 10, 0, "The engineer stops fixing, gives a long technical answer, and nobody is debugging."],
          ["Skip the bridge and email them later", 2, 0, "They escalate to your manager because the vendor is missing from their incident."]] },
    { q: "The remaining failures are all scanned PDFs. Your calls to their document service started failing at 09:31. Their change log shows a firewall update at 09:30.",
      o: [["Share the log line and change time as a shared problem and ask their network team to check the rule", 25, 1, "Right. Evidence without blame. Their engineer fixes the rule and summaries recover."],
          ["Tell the bridge the outage is their fault", 40, 0, "Their team gets defensive and it takes 40 minutes of argument before anyone checks the rule."],
          ["Keep searching your own code in case it is yours", 45, 0, "Forty-five minutes later you find nothing; the cause was outside your code."]] },
    { q: "Summaries are working again. What now?",
      o: [["Send a resolved notice: start and end times, impact, fix, user actions, review date", 5, 1, "Right. Everyone knows it is over, what to do, and when the blameless review comes."],
          ["Close the ticket quietly; it is fixed", 1, 0, "Users keep using the manual workaround for hours because nobody told them it is over."],
          ["Write the review tonight naming the network engineer who made the change", 5, 0, "Blame makes people hide facts next time. Look for how the system allowed it."]] }
  ];

  function renderIncident(host) {
    var wrap = h("div", { class: "wg-w14-wrap" });
    host.appendChild(wrap);
    var st;
    var clockEl = h("div", { class: "wg-w14-stat" });
    var timerEl = h("div", { class: "wg-w14-stat" });
    var stats = h("div", { class: "wg-w14-stats" }, clockEl, timerEl);
    var sendBtn = btn("Send customer update (2 min)", function () { sendUpdate(); });
    var tl = h("div", { class: "wg-w14-panel" });
    var qBox = h("div", { class: "wg-inc-q" });
    var log = h("ol", { class: "wg-inc-log" });
    var mean = meaning();
    add(wrap,
      h("p", { class: "wg-w14-note", text: "You are the FDE on call. Each choice moves the clock. You promised the customer an update every " + INC_CADENCE + " minutes, so press the update button before the timer runs out, even when there is no news." }),
      stats,
      h("div", { class: "wg-w14-row" }, sendBtn),
      tl, qBox,
      h("div", { class: "wg-w14-panel" }, h("div", { class: "wg-w14-cap", text: "Timeline (scribe notes)" }), log),
      mean.el);

    function reset() {
      st = { t: 0, step: 0, due: INC_CADENCE, updates: [], missed: [], good: 0, events: [] };
      clear(log);
      note(0, "Alert: 30% of summaries failing");
      show();
    }
    function note(t, text, cls) {
      log.appendChild(h("li", { class: cls || null }, h("span", { class: "wg-w14-mono", text: clock(t) + " " }), text));
    }
    function advance(mins) {
      var end = st.t + mins;
      /* record each promised update time that passes without an update */
      while (st.due < end) {
        st.missed.push(st.due);
        note(st.due, "MISSED update (promised for " + clock(st.due) + ")", "wg-inc-miss");
        st.due += INC_CADENCE;
      }
      st.t = end;
    }
    function sendUpdate() {
      if (st.step >= INC_STEPS.length) return;
      advance(2);
      st.updates.push(st.t);
      st.due = st.t + INC_CADENCE;
      note(st.t, "Customer update sent. Next promised by " + clock(st.due));
      draw();
    }
    function choose(o) {
      advance(o[1]);
      if (o[2]) st.good++;
      st.events.push({ t: st.t, ok: !!o[2] });
      note(st.t, (o[2] ? "Good call: " : "Poor call: ") + o[0]);
      st.step++;
      st.last = o[3];
      show();
    }
    function show() {
      clear(qBox);
      if (st.last) qBox.appendChild(h("div", { class: "wg-inc-fb", text: st.last }));
      if (st.step < INC_STEPS.length) {
        var step = INC_STEPS[st.step];
        qBox.appendChild(h("p", { class: "wg-inc-qt", text: "Decision " + (st.step + 1) + " of " + INC_STEPS.length + ". " + step.q }));
        var opts = h("div", { class: "wg-inc-opts" });
        step.o.forEach(function (o) { opts.appendChild(btn(o[0] + " (" + o[1] + " min)", function () { choose(o); }, "wg-inc-opt")); });
        qBox.appendChild(opts);
        sendBtn.disabled = false;
      } else {
        sendBtn.disabled = true;
        qBox.appendChild(h("p", { class: "wg-inc-qt", text: "Incident closed at " + clock(st.t) + " after " + st.t + " minutes." }));
        qBox.appendChild(h("div", { class: "wg-w14-row" }, btn("Run it again", reset, "wg-w14-primary")));
      }
      draw();
    }
    function draw() {
      clear(clockEl); clear(timerEl);
      clockEl.appendChild(h("div", { class: "wg-w14-statl", text: "Clock" }));
      clockEl.appendChild(h("div", { class: "wg-w14-statv", text: clock(st.t) }));
      clockEl.appendChild(h("div", { class: "wg-w14-stats2", text: st.t + " min since the alert" }));
      var left = st.due - st.t;
      var done = st.step >= INC_STEPS.length;
      timerEl.className = "wg-w14-stat" + (!done && left <= 5 ? " wg-w14-warn" : "");
      timerEl.appendChild(h("div", { class: "wg-w14-statl", text: "Next customer update" }));
      timerEl.appendChild(h("div", { class: "wg-w14-statv", text: done ? "done" : "due " + clock(st.due) }));
      timerEl.appendChild(h("div", { class: "wg-w14-stats2", text: done ? st.updates.length + " sent, " + st.missed.length + " missed" : left + " min left" }));

      /* timeline strip */
      clear(tl);
      var span = Math.max(120, st.t + 10);
      var W = 640, L = 20, R = 20, Y = 40;
      function x(m) { return L + m / span * (W - L - R); }
      var svg = s("svg", { viewBox: "0 0 " + W + " 78", class: "wg-w14-svg", role: "img", "aria-label": "Incident timeline with decisions, updates and missed updates" });
      svg.appendChild(s("line", { x1: L, y1: Y, x2: W - R, y2: Y, class: "wg-inc-axis" }));
      for (var m = 0; m <= span; m += 30) {
        svg.appendChild(s("line", { x1: x(m), y1: Y - 4, x2: x(m), y2: Y + 4, class: "wg-inc-axis" }));
        svg.appendChild(s("text", { x: x(m), y: Y + 22, "text-anchor": "middle", class: "wg-w14-svgt", text: clock(m) }));
      }
      svg.appendChild(s("rect", { x: x(Math.min(st.t, span)) - 1, y: Y - 16, width: 2, height: 32, class: "wg-inc-now" }));
      st.events.forEach(function (e) {
        svg.appendChild(s("circle", { cx: x(e.t), cy: Y, r: 6, class: e.ok ? "wg-inc-good" : "wg-inc-poor" }));
      });
      st.updates.forEach(function (u) {
        svg.appendChild(s("path", { d: "M" + x(u) + " " + (Y - 10) + " l-6 -10 h12 z", class: "wg-inc-upd" }));
      });
      st.missed.forEach(function (u) {
        var cx = x(u), cy = Y - 16;
        svg.appendChild(s("path", { d: "M" + (cx - 5) + " " + (cy - 5) + " l10 10 M" + (cx + 5) + " " + (cy - 5) + " l-10 10", class: "wg-inc-x" }));
      });
      tl.appendChild(svg);
      tl.appendChild(h("div", { class: "wg-w14-legend" },
        h("span", null, h("span", { class: "wg-inc-sw wg-inc-swg" }), "good decision"),
        h("span", null, h("span", { class: "wg-inc-sw wg-inc-swp" }), "poor decision"),
        h("span", null, h("span", { class: "wg-inc-sw wg-inc-swu" }), "update sent"),
        h("span", null, h("span", { class: "wg-inc-swx", text: "X" }), "missed update")));

      var msg;
      if (st.step === 0 && !st.updates.length) msg = "The customer's users are failing now. Your first choice decides how fast anyone takes charge.";
      else if (done) {
        msg = "Resolved in " + st.t + " minutes with " + st.good + " of " + INC_STEPS.length + " good calls and " + st.missed.length + " missed update" + (st.missed.length === 1 ? "" : "s") + ". " +
          (st.missed.length ? "Each missed update is a period when the customer heard nothing; give the comms lead the timer." : "The customer heard from you on every promised update, which is what they will remember.");
      } else if (st.missed.length) msg = "You have missed " + st.missed.length + " promised update" + (st.missed.length === 1 ? "" : "s") + ". Silence makes customers assume the worst; send one now, even with no news.";
      else if (left <= 5) msg = "An update is due in " + left + " minutes. Send it before your next step, even if it only says 'no change, next update at " + clock(st.t + 2 + INC_CADENCE) + "'.";
      else msg = "No updates missed so far. Keep an eye on the timer: long steps like debugging can pass a deadline without you noticing.";
      mean.set(msg);
    }
    reset();
  }

  Object.assign(WIDGETS, {
    aireadiness: {
      title: "Use-case scorer",
      intro: "Rename the six ideas and move the sliders for value, feasibility and risk. Watch each idea move on the 2x2 and see which one makes the safest first pilot.",
      render: renderAir
    },
    golive: {
      title: "Go/no-go gate",
      intro: "Tick the criteria that are really met the day before cutover. The gate says go, go with risk, or no-go, and lists the reasons.",
      render: renderGolive
    },
    supportops: {
      title: "Ticket triage drill",
      intro: "Eight realistic tickets from a live AI assistant. Pick a severity and a route for each, then read why. Notice whether you tend to over- or under-rate.",
      render: renderSupport
    },
    incidents: {
      title: "Incident simulator",
      intro: "Run a customer incident through five decisions. Every choice costs time, and the comms timer flags any promised update you miss.",
      render: renderIncident
    }
  });
})();

WIDGET_CSS += `
.wg-w14-wrap { display: flex; flex-direction: column; gap: 14px; font-family: var(--body); color: var(--ink); min-width: 0; }
.wg-w14-two { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; }
.wg-w14-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.wg-w14-lab { display: flex; justify-content: space-between; gap: 8px; font-size: 13px; color: var(--muted); flex-wrap: wrap; }
.wg-w14-val { font-family: var(--mono); color: var(--ink); font-size: 13px; }
.wg-w14-field input[type=range] { width: 100%; accent-color: var(--accent); }
.wg-w14-txt, .wg-w14-sel { font: inherit; font-size: 14px; color: var(--ink); background: var(--surface); border: 1px solid var(--line-strong); border-radius: 6px; padding: 6px 8px; width: 100%; box-sizing: border-box; }
.wg-w14-check { display: flex; gap: 8px; align-items: flex-start; font-size: 14px; padding: 3px 0; }
.wg-w14-check input { margin-top: 3px; accent-color: var(--accent); flex: none; }
.wg-w14-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.wg-w14-btn { font: inherit; font-size: 14px; padding: 7px 14px; border-radius: 6px; border: 1px solid var(--line-strong); background: var(--surface); color: var(--ink); cursor: pointer; }
.wg-w14-btn:hover:not(:disabled) { border-color: var(--accent); }
.wg-w14-btn:disabled { color: var(--muted); border-style: dashed; cursor: default; }
.wg-w14-btn[hidden] { display: none; }
.wg-w14-primary { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
.wg-w14-primary:disabled { background: var(--surface); }
.wg-w14-panel { border: 1px solid var(--line); border-radius: 8px; padding: 10px; background: var(--surface); min-width: 0; }
.wg-w14-cap { font-size: 12px; color: var(--muted); margin-bottom: 6px; }
.wg-w14-svg { width: 100%; max-width: 640px; height: auto; display: block; margin: 0 auto; }
.wg-w14-svgt { font-family: var(--mono); font-size: 11px; fill: var(--muted); }
.wg-w14-legend { display: flex; flex-wrap: wrap; gap: 14px; font-size: 12px; color: var(--muted); margin-top: 6px; }
.wg-w14-legend > span { display: inline-flex; align-items: center; gap: 6px; }
.wg-w14-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
.wg-w14-stat { border: 1px solid var(--line); border-radius: 8px; padding: 8px 10px; background: var(--surface); }
.wg-w14-statl { font-size: 12px; color: var(--muted); }
.wg-w14-statv { font-size: 20px; font-weight: 600; font-family: var(--mono); margin-top: 2px; }
.wg-w14-stats2 { font-size: 12px; color: var(--muted); }
.wg-w14-warn { border-color: var(--accent); border-width: 2px; }
.wg-w14-warn .wg-w14-statv { color: var(--accent); }
.wg-w14-mean { background: var(--accent-soft); border-left: 3px solid var(--accent); padding: 10px 12px; border-radius: 6px; font-size: 14px; line-height: 1.5; color: var(--ink); }
.wg-w14-note { font-size: 13px; color: var(--muted); margin: 0; line-height: 1.5; }
.wg-w14-mono { font-family: var(--mono); }
.wg-w14-scroll { overflow-x: auto; max-width: 100%; }
.wg-w14-table { border-collapse: collapse; font-size: 13px; width: 100%; }
.wg-w14-table th, .wg-w14-table td { border-bottom: 1px solid var(--line); padding: 5px 6px; text-align: left; vertical-align: top; }
.wg-w14-table th { color: var(--muted); font-weight: 600; font-size: 12px; }
.wg-air-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px; }
.wg-air-card { border: 1px solid var(--line); border-radius: 8px; padding: 8px 10px; background: var(--surface); display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.wg-air-sl { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.wg-air-frame { fill: none; stroke: var(--line-strong); }
.wg-air-qw { fill: var(--accent-soft); }
.wg-air-mid { stroke: var(--line-strong); stroke-dasharray: 4 4; }
.wg-air-dot { fill: var(--surface); stroke: var(--ink); stroke-width: 1.5; }
.wg-air-risk { fill: var(--hl); stroke: var(--packet); stroke-width: 2.5; }
.wg-air-num { font-family: var(--mono); font-size: 11px; font-weight: 600; fill: var(--ink); }
.wg-air-sw { display: inline-block; width: 12px; height: 12px; border-radius: 50%; border: 1.5px solid var(--ink); background: var(--surface); }
.wg-air-swr { border: 2.5px solid var(--packet); background: var(--hl); }
.wg-air-top td { font-weight: 600; }
.wg-gl-fs { margin: 0; }
.wg-gl-leg { font-size: 13px; font-weight: 600; color: var(--ink); padding: 0 4px; }
.wg-gl-gate { display: flex; flex-wrap: wrap; align-items: baseline; gap: 12px; padding: 10px 12px; border-radius: 8px; border: 2px solid var(--line-strong); background: var(--bg); }
.wg-gl-state { font-family: var(--mono); font-size: 24px; font-weight: 700; color: var(--ink); }
.wg-gl-count { font-size: 13px; color: var(--muted); }
.wg-gl-go { border-color: var(--ink); }
.wg-gl-risk { border-color: var(--packet); border-style: dashed; }
.wg-gl-no { border-color: var(--accent); background: var(--accent-soft); }
.wg-gl-no .wg-gl-state { color: var(--accent); }
.wg-gl-reasons { margin: 10px 0 0; padding-left: 20px; font-size: 14px; line-height: 1.5; }
.wg-gl-reasons:empty { display: none; }
.wg-gl-b strong { color: var(--accent); }
.wg-sup-body { display: flex; flex-direction: column; gap: 12px; }
.wg-sup-ticket { margin: 0; padding: 12px 14px; border-left: 3px solid var(--line-strong); background: var(--code-bg); border-radius: 6px; font-size: 15px; line-height: 1.5; }
.wg-sup-fs { border: 1px solid var(--line); border-radius: 8px; padding: 6px 10px 10px; margin: 0; display: flex; flex-wrap: wrap; gap: 6px 14px; }
.wg-sup-radio { display: inline-flex; gap: 5px; align-items: center; font-size: 14px; }
.wg-sup-radio input { accent-color: var(--accent); }
.wg-sup-fb { font-size: 14px; line-height: 1.5; display: flex; flex-direction: column; gap: 4px; }
.wg-sup-fb:empty { display: none; }
.wg-sup-ok, .wg-sup-bad { padding: 10px 12px; border-radius: 6px; border: 1px solid var(--line-strong); background: var(--surface); }
.wg-sup-bad { border-color: var(--accent); border-width: 2px; }
.wg-sup-bad strong { color: var(--accent); }
.wg-sup-score { font-size: 14px; }
.wg-sup-big { font-family: var(--mono); font-size: 28px; font-weight: 700; }
.wg-inc-q { display: flex; flex-direction: column; gap: 8px; }
.wg-inc-qt { margin: 0; font-size: 15px; line-height: 1.5; }
.wg-inc-fb { font-size: 14px; line-height: 1.5; padding: 8px 12px; border-radius: 6px; background: var(--code-bg); border: 1px solid var(--line); }
.wg-inc-opts { display: flex; flex-direction: column; gap: 6px; }
.wg-inc-opt { text-align: left; line-height: 1.4; }
.wg-inc-log { margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.6; max-height: 220px; overflow-y: auto; }
.wg-inc-miss { color: var(--accent); font-weight: 600; }
.wg-inc-axis { stroke: var(--line-strong); stroke-width: 1.5; }
.wg-inc-now { fill: var(--ink); }
.wg-inc-good { fill: var(--surface); stroke: var(--ink); stroke-width: 2; }
.wg-inc-poor { fill: var(--packet); stroke: var(--ink); stroke-width: 1; }
.wg-inc-upd { fill: var(--accent); }
.wg-inc-x { stroke: var(--accent); stroke-width: 2.5; fill: none; }
.wg-inc-sw { display: inline-block; width: 12px; height: 12px; border-radius: 50%; border: 2px solid var(--ink); background: var(--surface); box-sizing: border-box; }
.wg-inc-swp { background: var(--packet); border-width: 1px; }
.wg-inc-swu { border-radius: 0; border: 0; background: var(--accent); clip-path: polygon(0 0, 100% 0, 50% 100%); }
.wg-inc-swx { font-family: var(--mono); font-weight: 700; color: var(--accent); }
`;
