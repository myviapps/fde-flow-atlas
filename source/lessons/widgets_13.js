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
  function uid() { return "wgw13-" + Math.random().toString(36).slice(2, 10); }

  /* ================= fderoles: role sorter ================= */
  var ROLES = [
    ["se", "Sales Engineer"],
    ["sa", "Solutions Architect"],
    ["fde", "Forward Deployed Engineer"],
    ["cse", "Customer Success Engineer"],
    ["con", "Consultant"]
  ];
  var ROLE_NAME = {};
  ROLES.forEach(function (r) { ROLE_NAME[r[0]] = r[1]; });
  var TASKS = [
    ["Run a 45-minute product demo for a buyer who has not signed yet", "se", "Demos before the contract are pre-sales work. The Sales Engineer supports the Account Executive to win the technical decision."],
    ["Answer 200 technical questions in a buyer's request for proposal (RFP)", "se", "An RFP is part of evaluation, before the sale, so the Sales Engineer usually leads the answers."],
    ["Draw the reference architecture: which data flows where, which cloud services and security controls", "sa", "Designing how the product fits the customer's systems is the Solutions Architect's main output."],
    ["Review a customer's network and identity setup and recommend a hosting pattern", "sa", "This is design work at the architecture level. The SA may never write the production code for it."],
    ["Write and deploy the pipeline that pulls invoices from the customer's ERP into the model", "fde", "Building and shipping production code inside the customer's environment is the core of the FDE role."],
    ["Debug why extraction accuracy dropped on scanned documents in week 3 of implementation", "fde", "The FDE owns the working deployment through go-live, including fixing quality problems on real data."],
    ["Write up the three features customers keep asking for and send them to the product team", "fde", "Feeding what customers need back into the product is what separates an FDE from a consultant."],
    ["Run a quarterly health check on a customer who has been live for a year", "cse", "After go-live, keeping a live account healthy and growing is Customer Success work."],
    ["Help a live customer's second team turn on a feature they already pay for", "cse", "Adoption of a live product is measured on the Customer Success side, often with the CSM."],
    ["Troubleshoot a configuration problem reported by a customer live for 8 months", "cse", "Post-go-live configuration and troubleshooting is typical CSE work; the FDE has usually moved on."],
    ["Write a 40-page process-improvement report billed by the hour", "con", "Selling hours and delivering reports under a contract is consulting. The work does not feed back into a product."],
    ["Build a one-off custom app for a client under a time-and-materials contract", "con", "Custom builds billed by time, with no product behind them, are the consultant's model."]
  ];

  function renderRoles(host) {
    var wrap = h("div", { class: "wg-rs" });
    var list = h("ol", { class: "wg-rs-list" });
    var picks = [];
    var feedback = [];
    TASKS.forEach(function (t, i) {
      var id = uid();
      var sel = h("select", { id: id, class: "wg-rs-sel" },
        h("option", { value: "", text: "Choose a role" }),
        ROLES.map(function (r) { return h("option", { value: r[0], text: r[1] }); }));
      sel.addEventListener("change", update);
      var fb = h("p", { class: "wg-rs-fb", "aria-live": "polite" });
      picks.push(sel); feedback.push(fb);
      list.appendChild(h("li", { class: "wg-rs-item" },
        h("p", { class: "wg-rs-task", text: t[0] }),
        h("label", { class: "wg-rs-lab", for: id, text: "Who owns this task?" }),
        sel, fb));
    });
    var score = h("div", { class: "wg-rs-score", "aria-live": "polite" });
    var mean = h("p", { class: "wg-rs-mean" });
    var checkBtn = h("button", { type: "button", class: "wg-rs-btn", text: "Check my answers" });
    var resetBtn = h("button", { type: "button", class: "wg-rs-btn wg-rs-btn2", text: "Start again" });
    var checked = false;
    checkBtn.addEventListener("click", function () { checked = true; update(); });
    resetBtn.addEventListener("click", function () {
      checked = false;
      picks.forEach(function (p) { p.value = ""; });
      update();
    });

    function update() {
      var answered = 0, right = 0, missed = {}, wrong = 0;
      TASKS.forEach(function (t, i) {
        var v = picks[i].value, fb = feedback[i];
        fb.className = "wg-rs-fb";
        fb.textContent = "";
        if (v) answered++;
        if (v === t[1]) right++;
        else if (v) { wrong++; missed[t[1]] = (missed[t[1]] || 0) + 1; }
        if (checked && v) {
          if (v === t[1]) {
            fb.className = "wg-rs-fb wg-rs-ok";
            fb.appendChild(h("strong", { text: "Right. " }));
          } else {
            fb.className = "wg-rs-fb wg-rs-no";
            fb.appendChild(h("strong", { text: "Not quite: " + ROLE_NAME[t[1]] + ". " }));
          }
          fb.appendChild(document.createTextNode(t[2]));
        }
      });
      score.textContent = checked
        ? right + " of " + TASKS.length + " correct (" + answered + " answered)"
        : answered + " of " + TASKS.length + " answered";
      if (!checked) {
        mean.textContent = "What this means: pick a role for each task, then press Check. Ask yourself what the task produces and whether the customer has signed yet.";
      } else {
        var worst = null, n = 0;
        for (var k in missed) if (missed[k] > n) { n = missed[k]; worst = k; }
        if (right === TASKS.length) mean.textContent = "What this means: you can tell the five roles apart by output and lifecycle stage. That is the one-minute interview answer.";
        else if (!wrong) mean.textContent = "What this means: every answer so far is right. Choose a role for the " + (TASKS.length - answered) + " tasks left and check again.";
        else mean.textContent = "What this means: your most missed role is " + ROLE_NAME[worst] + ". Re-read its row in the lesson table: what it produces and when it works.";
      }
    }
    add(wrap, [
      list,
      h("div", { class: "wg-rs-actions" }, checkBtn, resetBtn),
      score, mean
    ]);
    host.appendChild(wrap);
    update();
  }

  /* ================= fdeskills: skills radar ================= */
  var AXES = [
    { name: "Technical depth", short: "Technical", topics: "sql, fastapi, rag, evals, projects", out: "a deployed project with tests" },
    { name: "Problem finding", short: "Problems", topics: "discovery, case, debugging", out: "a written problem statement" },
    { name: "Customer empathy", short: "Empathy", topics: "discovery, exec, change", out: "a user interview summary" },
    { name: "Product judgment", short: "Product", topics: "moat, roi, poc", out: "a one-page build-or-not case" },
    { name: "Ownership", short: "Ownership", topics: "observability, lastmile, fieldlife", out: "a runbook and a handoff note" }
  ];
  var LEVEL = ["", "just starting", "some exposure", "can do it with help", "can do it alone", "can teach it"];

  function renderRadar(host) {
    var wrap = h("div", { class: "wg-rad" });
    var controls = h("div", { class: "wg-rad-controls" });
    var vals = [4, 2, 3, 2, 3];
    var target = 3;
    var inputs = [];
    AXES.forEach(function (a, i) {
      var id = uid();
      var out = h("output", { class: "wg-rad-val", for: id });
      var inp = h("input", { type: "range", id: id, min: 1, max: 5, step: 1, value: vals[i] });
      inp.addEventListener("input", function () { vals[i] = Number(inp.value); draw(); });
      inputs.push({ inp: inp, out: out });
      controls.appendChild(h("div", { class: "wg-rad-field" },
        h("label", { class: "wg-rad-lab", for: id }, h("span", { text: a.name }), out), inp));
    });
    var tid = uid();
    var tout = h("output", { class: "wg-rad-val", for: tid });
    var tinp = h("input", { type: "range", id: tid, min: 2, max: 5, step: 1, value: target });
    tinp.addEventListener("input", function () { target = Number(tinp.value); draw(); });
    controls.appendChild(h("div", { class: "wg-rad-field wg-rad-tfield" },
      h("label", { class: "wg-rad-lab", for: tid }, h("span", { text: "Target level (dashed line)" }), tout), tinp));

    var svg = s("svg", { viewBox: "-78 -8 476 334", class: "wg-rad-svg", role: "img", "aria-label": "Skills radar chart" });
    var plan = h("div", { class: "wg-rad-plan", "aria-live": "polite" });
    var mean = h("p", { class: "wg-rad-mean" });

    var cx = 160, cy = 170, R = 120;
    function pt(i, v) {
      var ang = -Math.PI / 2 + i * 2 * Math.PI / AXES.length;
      return [cx + Math.cos(ang) * R * v / 5, cy + Math.sin(ang) * R * v / 5];
    }
    function poly(values) {
      return values.map(function (v, i) { var p = pt(i, v); return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ");
    }
    function draw() {
      inputs.forEach(function (x, i) { x.out.textContent = vals[i] + " of 5, " + LEVEL[vals[i]]; });
      tout.textContent = target + " of 5";
      clear(svg);
      for (var lv = 1; lv <= 5; lv++) {
        svg.appendChild(s("polygon", { points: poly([lv, lv, lv, lv, lv]), fill: "none", stroke: "var(--line)", "stroke-width": 1 }));
      }
      AXES.forEach(function (a, i) {
        var e = pt(i, 5);
        svg.appendChild(s("line", { x1: cx, y1: cy, x2: e[0], y2: e[1], stroke: "var(--line)", "stroke-width": 1 }));
        var l = pt(i, 5.9);
        var anchor = Math.abs(l[0] - cx) < 8 ? "middle" : (l[0] > cx ? "start" : "end");
        svg.appendChild(s("text", { x: l[0], y: l[1] + 6, "text-anchor": anchor, fill: "var(--ink)", "font-size": 18, "font-family": "var(--body)", text: a.short }));
      });
      svg.appendChild(s("polygon", { points: poly([target, target, target, target, target]), fill: "none", stroke: "var(--muted)", "stroke-width": 2, "stroke-dasharray": "6 5" }));
      svg.appendChild(s("polygon", { points: poly(vals), fill: "var(--accent-soft)", "fill-opacity": 0.8, stroke: "var(--accent)", "stroke-width": 2.5 }));
      vals.forEach(function (v, i) {
        var p = pt(i, v);
        svg.appendChild(s("circle", { cx: p[0], cy: p[1], r: 5, fill: "var(--accent)" }));
      });

      // gaps sorted by size, ties keep axis order
      var gaps = AXES.map(function (a, i) { return { a: a, i: i, gap: target - vals[i] }; })
        .filter(function (g) { return g.gap > 0; })
        .sort(function (x, y) { return y.gap - x.gap || x.i - y.i; });
      clear(plan);
      var total = vals.reduce(function (x, y) { return x + y; }, 0);
      var spike = Math.max.apply(null, vals);
      if (!gaps.length) {
        plan.appendChild(h("p", { text: "No axis is below your target. Raise the target, or pick the axis the jobs you want care about most." }));
      } else {
        plan.appendChild(h("p", { class: "wg-rad-ph", text: "Your route, biggest gap first" }));
        var ol = h("ol", { class: "wg-rad-ol" });
        gaps.forEach(function (g, n) {
          ol.appendChild(h("li", null,
            h("strong", { text: g.a.name }),
            " (" + vals[g.i] + " now, gap " + g.gap + "): study " + g.a.topics + ". Output that proves it: " + g.a.out + "."));
        });
        plan.appendChild(ol);
      }
      var weakest = gaps.length ? gaps[0].a.name : null;
      var msg;
      if (vals.every(function (v) { return v <= 2; })) msg = "every axis is at 2 or below. Start with technical depth: the people skills need something to attach to.";
      else if (!gaps.length) msg = "you meet the target everywhere (total " + total + " of 25). Re-rate with evidence to make sure the scores are honest.";
      else if (spike >= 4) msg = "you have a spike (a 4 or 5), the T-shape hiring panels like. Close the " + weakest + " gap next, one or two topics a week, and re-rate in about six weeks.";
      else msg = "no axis is above 3 yet, so you have breadth without a spike. Close the " + weakest + " gap, then pick one axis to push to 4.";
      mean.textContent = "What this means: " + msg;
    }
    add(wrap, [h("div", { class: "wg-rad-grid" }, controls, svg), mean, plan]);
    host.appendChild(wrap);
    draw();
  }

  /* ================= asyncwriting: message checker ================= */
  var SAMPLES = [
    ["Buried lead", "Hi all, so we have been looking at the invoice pipeline this week and there are a few things going on with the vendor file, which seems to be in a different encoding from the others, and we think that is why some rows fail. Anyway it would be good if someone could look at converting it at some point."],
    ["Good BLUF", "@grace can you send the vendor file in UTF-8 by Thursday 12:00? We need it to keep the June 8 pilot date. Context: 41 rows fail because the file is in Latin-1. Details in the ticket."],
    ["End-of-day note", "Done: retry logic merged (PR 214). Next: load test. Blocked: staging DB password expired. Needs: @arun please rotate it in the vault by your 11:00. Heads-up: deploy to staging at my 9:00."]
  ];
  var DAY_RE = /\b(today|tonight|tomorrow|eod|end of day|monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b|\b\d{1,2}[:.]\d{2}\b|\b\d{1,2}\s?(am|pm)\b|\bby (the )?\d{1,2}(st|nd|rd|th)?\b|\b\d{1,2}\/\d{1,2}\b/i;
  var ASK_RE = /\?|\bplease\b|\bcan you\b|\bcould you\b|\bneed(s|ed)?\b|\bwould you\b|\bdecide\b|\bapprove\b/i;
  var OWNER_RE = /@[A-Za-z][\w.-]*/;
  var VAGUE_RE = /\b(someone|anyone|somebody|the team|at some point|when you get a chance|whenever|asap)\b/i;
  var RISKY_RE = /\b(password|passwd|api[_ -]?key|secret|token)\b\s*[:=]|\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b|sk-[A-Za-z0-9]{8,}/i;

  function checkMessage(msg) {
    var text = msg.trim();
    var firstMatch = text.split(/(?<=[.?!])\s+/);
    var first = firstMatch[0] || "";
    var words = text ? text.split(/\s+/).length : 0;
    var firstWords = first ? first.split(/\s+/).length : 0;
    var askPos = text.search(ASK_RE);
    var res = [];
    res.push({ ok: firstWords > 0 && firstWords <= 25, label: "Point first", fix: "put the point first", why: firstWords > 25 ? "First sentence is " + firstWords + " words. Put the ask or answer in the first 25." : "First sentence is short enough to read in a notification." });
    res.push({ ok: askPos >= 0, label: "Clear ask", fix: "add a clear ask", why: askPos >= 0 ? "There is a question or request." : "No question mark, 'please', 'can you' or 'need'. What do you want the reader to do?" });
    var buried = askPos > 0 && askPos > first.length;
    res.push({ ok: askPos >= 0 && !buried, label: "Ask not buried", fix: "move the ask to the top", why: askPos < 0 ? "No ask found." : (buried ? "The ask appears after the first sentence. Move it to the top." : "The ask is in the first sentence.") });
    res.push({ ok: OWNER_RE.test(text), label: "Named owner", fix: "tag an owner", why: OWNER_RE.test(text) ? "Someone is tagged by name." : "Tag one person with @name so it is clear who acts." });
    res.push({ ok: DAY_RE.test(text), label: "Deadline", fix: "add a deadline", why: DAY_RE.test(text) ? "A day or time is given." : "Add a day and, across time zones, a time." });
    var vague = text.match(VAGUE_RE);
    res.push({ ok: !vague, label: "No vague words", fix: "replace vague words", why: vague ? "'" + vague[0] + "' hides who and when. Replace it with a name or a date." : "No 'someone', 'at some point' or 'asap'." });
    res.push({ ok: words <= 120, label: "Brief", fix: "cut it down", why: words + " words. " + (words > 120 ? "Over 120: move detail to a doc or ticket and link it." : "Short enough for chat.") });
    res.push({ ok: !RISKY_RE.test(text), label: "Nothing secret", fix: "remove the secret", why: RISKY_RE.test(text) ? "Looks like a password, key or card number. Never paste secrets in chat." : "No obvious secrets or card numbers." });
    return { words: words, checks: res };
  }

  function renderMsg(host) {
    var wrap = h("div", { class: "wg-msg" });
    var id = uid();
    var ta = h("textarea", { id: id, class: "wg-msg-ta", rows: 6, spellcheck: "true" });
    ta.value = SAMPLES[0][1];
    ta.addEventListener("input", update);
    var sampleRow = h("div", { class: "wg-msg-samples" }, h("span", { class: "wg-msg-sl", text: "Load a sample:" }));
    SAMPLES.forEach(function (smp) {
      sampleRow.appendChild(h("button", { type: "button", class: "wg-msg-btn", text: smp[0], onclick: function () { ta.value = smp[1]; update(); } }));
    });
    var scoreEl = h("div", { class: "wg-msg-score", "aria-live": "polite" });
    var list = h("ul", { class: "wg-msg-list" });
    var mean = h("p", { class: "wg-msg-mean" });
    function update() {
      var r = checkMessage(ta.value);
      var passed = r.checks.filter(function (c) { return c.ok; }).length;
      scoreEl.textContent = passed + " of " + r.checks.length + " checks passed";
      clear(list);
      r.checks.forEach(function (c) {
        list.appendChild(h("li", { class: c.ok ? "wg-msg-ok" : "wg-msg-no" },
          h("span", { class: "wg-msg-mark", text: c.ok ? "Pass" : "Fix" }),
          h("strong", { text: c.label + ": " }), c.why));
      });
      var fails = r.checks.filter(function (c) { return !c.ok; }).map(function (c) { return c.fix; });
      if (!ta.value.trim()) mean.textContent = "What this means: type or paste a draft message to check it.";
      else if (!fails.length) mean.textContent = "What this means: a busy reader can act on this from the notification alone.";
      else mean.textContent = "What this means: fix these first: " + fails.slice(0, 3).join("; ") + ". This is a rough checklist, so read your draft once more too.";
    }
    add(wrap, [
      sampleRow,
      h("label", { class: "wg-msg-lab", for: id, text: "Your draft message" }),
      ta, scoreEl, mean, list
    ]);
    host.appendChild(wrap);
    update();
  }

  /* ================= ethics: dilemma cards ================= */
  var DILEMMAS = [
    { q: "You want to test a new prompt tonight on 20 real insurance claims. The approved workspace is slow to open from home.",
      c: ["Paste the claims into a free AI chat app, then delete the chat", "Use a masked sample in the approved workspace, even if it is slower", "Email the claims to your personal account and test tomorrow"],
      a: 1, why: "Only approved tools covered by the data agreement, with the minimum masked data. Deleting a chat does not undo sharing, and personal email is not approved storage." },
    { q: "The customer's operations lead asks you to leave the hard scanned invoices out of the test set so the board sees a higher accuracy.",
      c: ["Do it, it is their report", "Decline, show the real number with its conditions, and offer a plan to improve scans", "Report both numbers but hide the scans number in an appendix"],
      a: 1, why: "An honest number states conditions and weak spots. The board's decision depends on it. Offer a useful alternative, and escalate in writing if pushed." },
    { q: "Bank B asks what other banks are doing about card fraud. You saw Bank A's new scoring rules last month.",
      c: ["Share Bank A's rules without naming Bank A", "Share general public patterns and your own product's features, and say you cannot share other customers' work", "Say nothing at all about fraud"],
      a: 1, why: "Information from one customer never goes to another, even anonymised. General skills and your own product's capabilities are fine to share." },
    { q: "At year-end a customer offers you concert tickets worth several hundred dollars.",
      c: ["Accept, it would be rude to refuse", "Check your company's gift policy, then decline or declare as it requires", "Accept and pass them to a colleague"],
      a: 1, why: "Gift rules are in your code of conduct and often require declaring or declining anything above a small value. Public-sector customers are stricter still." },
    { q: "On a train, you need to finish a slide about a retailer's store-closure plan. The passenger next to you can see your screen.",
      c: ["Finish quickly, they will not understand it", "Close the file and work on something that is not confidential", "Turn the brightness down and carry on"],
      a: 1, why: "Confidentiality covers what others can see. Use a privacy filter, and do not work on sensitive material where it can be read." },
    { q: "A friend at dinner asks which company you are working with this month.",
      c: ["Name the customer, it is only a friend", "Say 'a large retailer in the north' and change the subject", "Show them the demo on your phone"],
      a: 1, why: "Do not name customers unless your company has written permission, often called logo rights. Describe them generically." },
    { q: "The sponsor asks you not to tell the clerks you are interviewing that the system will automate most of their data entry.",
      c: ["Agree and keep the purpose hidden", "Ask how staff will be told, align with an honest message, and raise it if the purpose must stay hidden", "Tell the clerks yourself that their jobs are at risk"],
      a: 1, why: "Staffing decisions belong to the customer, but you should not mislead users. Guessing about job cuts yourself is also wrong. Align on an honest message." },
    { q: "Your account executive wants you to tell the steering group the model 'handles all claim types'. It handles 14 of 20 well.",
      c: ["Say it handles all types; the other 6 will come later", "Say it handles the 14 most common types, 88 percent of volume, with the other 6 planned for phase two", "Refuse to present at all"],
      a: 1, why: "You can support a positive message with accurate facts. A claim that falls apart later costs far more trust than a precise one now." },
    { q: "A customer asks you to add a report showing each clerk's speed and errors. Staff have not been told, and the site is in Germany.",
      c: ["Build it, it is a simple feature", "Treat it as a concern: ask HR or legal whether staff and the works council must be consulted first", "Build it but hide it from the clerks' screens"],
      a: 1, why: "Hidden monitoring of individuals is a concern to raise, not a feature request. In Germany works councils have rights over systems that can monitor performance." },
    { q: "During testing, you see the triage model sometimes marks urgent medical messages as routine. Go-live is tomorrow.",
      c: ["Log a ticket for after go-live", "Pause the rollout if you can and escalate straight away with the evidence", "Mention it quietly to one engineer"],
      a: 1, why: "When there is an immediate risk of harm to people, stop or pause first, then escalate immediately. You do not need to climb the ladder step by step." }
  ];
  var ORDERS = [[1, 0, 2], [0, 2, 1], [2, 1, 0], [0, 1, 2], [2, 0, 1], [1, 2, 0], [0, 2, 1], [2, 1, 0], [1, 0, 2], [0, 1, 2]];

  function renderEthics(host) {
    var wrap = h("div", { class: "wg-eth" });
    var idx = 0, score = 0, answered = [];
    var counter = h("p", { class: "wg-eth-count", "aria-live": "polite" });
    var qEl = h("p", { class: "wg-eth-q" });
    var choices = h("div", { class: "wg-eth-choices", role: "group", "aria-label": "Choices" });
    var fb = h("div", { class: "wg-eth-fb", "aria-live": "polite" });
    var mean = h("p", { class: "wg-eth-mean" });
    var nextBtn = h("button", { type: "button", class: "wg-eth-next", text: "Next scenario" });
    var restartBtn = h("button", { type: "button", class: "wg-eth-next wg-eth-restart", text: "Start again" });
    nextBtn.addEventListener("click", function () { idx++; show(); });
    restartBtn.addEventListener("click", function () { idx = 0; score = 0; answered = []; show(); });

    function show() {
      clear(choices); clear(fb);
      nextBtn.hidden = true;
      if (idx >= DILEMMAS.length) {
        counter.textContent = "Done: " + score + " of " + DILEMMAS.length + " matched the recommended choice";
        qEl.textContent = "You finished all " + DILEMMAS.length + " scenarios.";
        mean.textContent = "What this means: " + (score >= 9
          ? "your instincts match the rules. In an interview, say the reasoning out loud, not only the answer."
          : score >= 6
            ? "most choices were sound. Re-read the explanations you missed; they are the rules the lesson teaches."
            : "several choices would put the customer's trust at risk. Read the lesson subtopics on data, honesty and raising concerns, then try again.");
        return;
      }
      var d = DILEMMAS[idx], ord = ORDERS[idx % ORDERS.length];
      counter.textContent = "Scenario " + (idx + 1) + " of " + DILEMMAS.length + ", score so far " + score;
      qEl.textContent = d.q;
      mean.textContent = "What this means: pick what you would actually do. There is no penalty for a wrong answer; the explanation is the point.";
      var btns = [];
      ord.forEach(function (ci) {
        var b = h("button", { type: "button", class: "wg-eth-choice", text: d.c[ci] });
        b.addEventListener("click", function () {
          var right = ci === d.a;
          if (right) score++;
          answered.push(right);
          btns.forEach(function (x) {
            x.btn.disabled = true;
            if (x.ci === d.a) x.btn.classList.add("wg-eth-right");
            else if (x.ci === ci) x.btn.classList.add("wg-eth-wrong");
          });
          clear(fb);
          fb.className = "wg-eth-fb " + (right ? "wg-eth-ok" : "wg-eth-no");
          fb.appendChild(h("strong", { text: right ? "Recommended choice. " : "Not the recommended choice. " }));
          fb.appendChild(document.createTextNode(d.why));
          counter.textContent = "Scenario " + (idx + 1) + " of " + DILEMMAS.length + ", score so far " + score;
          mean.textContent = "What this means: " + (right
            ? "this protects the customer's trust, which is the foundation of the FDE job."
            : "the other choice could cost the customer's trust or break a rule. Note the reason above.");
          nextBtn.textContent = idx === DILEMMAS.length - 1 ? "See my result" : "Next scenario";
          nextBtn.hidden = false;
          nextBtn.focus();
        });
        btns.push({ btn: b, ci: ci });
        choices.appendChild(b);
      });
    }
    add(wrap, [counter, qEl, choices, fb, mean, h("div", { class: "wg-eth-actions" }, nextBtn, restartBtn)]);
    host.appendChild(wrap);
    show();
  }

  Object.assign(WIDGETS, {
    fderoles: {
      title: "Role sorter",
      intro: "Twelve real tasks from a software company. Pick which role owns each one, then check. Notice that the answer depends on what the task produces and whether the customer has signed yet.",
      render: renderRoles
    },
    fdeskills: {
      title: "Skills radar",
      intro: "Rate yourself from 1 to 5 on the five FDE axes and set a target. The radar shows your shape, and the route below lists atlas topics for your biggest gaps first.",
      render: renderRadar
    },
    asyncwriting: {
      title: "Message checker",
      intro: "Paste or type a draft chat message or email. The checker flags a missing ask, owner or deadline, a buried lead, vague words and secrets. Try the samples, then fix the first one.",
      render: renderMsg
    },
    ethics: {
      title: "Dilemma cards",
      intro: "Ten situations an FDE really meets on site. Choose what you would do and read why. Notice how often the right move is to check a rule, say it honestly, or raise it early.",
      render: renderEthics
    }
  });
})();
WIDGET_CSS += `
.wg-rs { display: flex; flex-direction: column; gap: 12px; }
.wg-rs-list { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 10px; }
.wg-rs-item { border: 1px solid var(--line); border-radius: 8px; background: var(--surface); padding: 10px 12px; display: flex; flex-direction: column; gap: 6px; }
.wg-rs-task { margin: 0; font-size: 15px; line-height: 1.4; color: var(--ink); }
.wg-rs-lab { font-size: 13px; color: var(--muted); }
.wg-rs-sel { font: inherit; font-size: 14px; padding: 6px 8px; border-radius: 6px; border: 1px solid var(--line-strong); background: var(--surface); color: var(--ink); max-width: 100%; }
.wg-rs-fb { margin: 0; font-size: 14px; line-height: 1.45; color: var(--ink); }
.wg-rs-fb:empty { display: none; }
.wg-rs-ok { border-left: 4px solid var(--packet); padding-left: 8px; }
.wg-rs-no { border-left: 4px solid var(--accent); padding-left: 8px; }
.wg-rs-no strong { color: var(--accent); }
.wg-rs-actions, .wg-eth-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.wg-rs-btn, .wg-eth-next, .wg-msg-btn { font: inherit; font-size: 14px; padding: 8px 14px; border-radius: 6px; border: 1px solid var(--accent); background: var(--accent); color: var(--accent-ink); cursor: pointer; }
.wg-rs-btn2, .wg-eth-restart, .wg-msg-btn { background: var(--surface); color: var(--accent); }
.wg-rs-score, .wg-msg-score { font-family: var(--mono); font-size: 18px; font-weight: 700; color: var(--ink); }
.wg-rs-mean, .wg-rad-mean, .wg-msg-mean, .wg-eth-mean { margin: 0; font-size: 15px; line-height: 1.5; background: var(--accent-soft); color: var(--ink); padding: 8px 12px; border-radius: 6px; }
.wg-rad { display: flex; flex-direction: column; gap: 12px; }
.wg-rad-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; align-items: center; }
.wg-rad-controls { display: flex; flex-direction: column; gap: 10px; }
.wg-rad-field { display: flex; flex-direction: column; gap: 4px; }
.wg-rad-field input { width: 100%; accent-color: var(--accent); }
.wg-rad-tfield { border-top: 1px solid var(--line); padding-top: 8px; }
.wg-rad-lab { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4px 10px; font-size: 14px; color: var(--ink); }
.wg-rad-val { font-family: var(--mono); font-size: 13px; color: var(--muted); }
.wg-rad-svg { width: 100%; max-width: 420px; height: auto; display: block; margin: 0 auto; }
.wg-rad-plan { font-size: 15px; line-height: 1.5; color: var(--ink); }
.wg-rad-plan p { margin: 0 0 4px; }
.wg-rad-ph { font-weight: 700; }
.wg-rad-ol { margin: 0; padding-left: 22px; }
.wg-rad-ol li { margin-bottom: 4px; }
.wg-msg { display: flex; flex-direction: column; gap: 10px; }
.wg-msg-samples { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.wg-msg-sl { font-size: 14px; color: var(--muted); }
.wg-msg-btn { padding: 6px 10px; font-size: 13px; }
.wg-msg-lab { font-size: 14px; font-weight: 600; color: var(--ink); }
.wg-msg-ta { font: inherit; font-size: 15px; line-height: 1.45; width: 100%; box-sizing: border-box; padding: 10px; border-radius: 6px; border: 1px solid var(--line-strong); background: var(--surface); color: var(--ink); resize: vertical; }
.wg-msg-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.wg-msg-list li { font-size: 14px; line-height: 1.45; color: var(--ink); padding: 6px 10px; border-radius: 6px; border: 1px solid var(--line); background: var(--surface); }
.wg-msg-mark { display: inline-block; min-width: 34px; font-family: var(--mono); font-size: 12px; font-weight: 700; margin-right: 8px; padding: 1px 6px; border-radius: 4px; text-align: center; }
.wg-msg-ok .wg-msg-mark { background: var(--code-bg); color: var(--muted); border: 1px solid var(--line); }
.wg-msg-no { border-left: 4px solid var(--accent) !important; }
.wg-msg-no .wg-msg-mark { background: var(--accent); color: var(--accent-ink); }
.wg-eth { display: flex; flex-direction: column; gap: 10px; }
.wg-eth-count { margin: 0; font-family: var(--mono); font-size: 13px; color: var(--muted); }
.wg-eth-q { margin: 0; font-size: 17px; line-height: 1.45; color: var(--ink); }
.wg-eth-choices { display: flex; flex-direction: column; gap: 8px; }
.wg-eth-choice { font: inherit; font-size: 15px; line-height: 1.4; padding: 10px 12px; border-radius: 6px; border: 1px solid var(--line-strong); background: var(--surface); color: var(--ink); cursor: pointer; text-align: left; }
.wg-eth-choice:hover:not(:disabled) { border-color: var(--accent); }
.wg-eth-choice:disabled { cursor: default; color: var(--muted); opacity: 1; }
.wg-eth-choice.wg-eth-right { border: 2px solid var(--packet); color: var(--ink); font-weight: 600; }
.wg-eth-choice.wg-eth-wrong { border: 2px solid var(--accent); color: var(--ink); text-decoration: line-through; }
.wg-eth-fb { font-size: 15px; line-height: 1.5; color: var(--ink); }
.wg-eth-fb:empty { display: none; }
.wg-eth-no strong { color: var(--accent); }
.wg-eth-next[hidden] { display: none; }
`;
