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
  function uid() { return "wgw6-" + Math.random().toString(36).slice(2, 10); }
  function fmt(x) { return Math.round(x).toLocaleString("en-US"); }
  function field(labelText, control) {
    var id = control.id || (control.id = uid());
    return h("div", { class: "wg-w6-field" }, h("label", { for: id }, labelText), control);
  }
  function btn(label, onclick, cls) {
    return h("button", { type: "button", class: "wg-w6-btn" + (cls ? " " + cls : ""), onclick: onclick }, label);
  }
  function select(options, value) {
    var sel = h("select", { class: "wg-w6-in" });
    options.forEach(function (o) {
      var opt = h("option", { value: o[0] }, o[1]);
      if (o[0] === value) opt.selected = true;
      sel.appendChild(opt);
    });
    return sel;
  }
  function meaning() {
    var span = h("span");
    var el = h("p", { class: "wg-w6-mean", "aria-live": "polite" }, h("strong", null, "What this means: "), span);
    return { el: el, set: function (t) { span.textContent = t; } };
  }
  function table(head, rows, rowClass) {
    return h("div", { class: "wg-w6-tablewrap" },
      h("table", { class: "wg-w6-table" },
        h("thead", null, h("tr", null, head.map(function (x) { return h("th", { scope: "col" }, x); }))),
        h("tbody", null, rows.map(function (r, i) {
          return h("tr", { class: rowClass ? rowClass(r, i) : null }, r.map(function (x) { return h("td", null, x); }));
        }))));
  }

  /* =====================================================================
     git: commit graph playground
     ===================================================================== */
  function renderGit(host) {
    var st;
    function reset0() {
      st = { commits: [], byId: {}, branches: {}, head: "main", lanes: {}, nextLane: 0, n: 0, log: [] };
      laneOf("main");
      var c1 = mk([], "main", "initial commit"); st.branches.main = c1.id;
      var c2 = mk([c1.id], "main", "add README"); st.branches.main = c2.id;
      st.branches.feature = c2.id; st.head = "feature";
      var c3 = mk([c2.id], "feature", "start login page"); st.branches.feature = c3.id;
      st.log = ['git commit -m "initial commit"', 'git commit -m "add README"', "git branch feature",
        "git checkout feature", 'git commit -m "start login page"'];
    }
    function laneOf(b) { if (!(b in st.lanes)) st.lanes[b] = st.nextLane++; return st.lanes[b]; }
    function mk(parents, branch, msg) {
      st.n++;
      var c = { id: "C" + st.n, parents: parents, lane: laneOf(branch), msg: msg, seq: st.n };
      st.commits.push(c); st.byId[c.id] = c; return c;
    }
    function headC() { return st.branches[st.head]; }
    function ancestors(id) {
      var seen = {}, stack = [id];
      while (stack.length) {
        var x = stack.pop(); if (seen[x]) continue; seen[x] = true;
        st.byId[x].parents.forEach(function (p) { stack.push(p); });
      }
      return seen;
    }
    function reachable() {
      var all = {};
      Object.keys(st.branches).forEach(function (b) {
        var a = ancestors(st.branches[b]); for (var k in a) all[k] = true;
      });
      return all;
    }

    var msgIn = h("input", { class: "wg-w6-in", type: "text", placeholder: "e.g. add login form", maxlength: "40" });
    var nameIn = h("input", { class: "wg-w6-in", type: "text", placeholder: "e.g. bugfix", maxlength: "24", value: "bugfix" });
    var targetSel = h("select", { class: "wg-w6-in" });
    var svgWrap = h("div", { class: "wg-git-svgwrap" });
    var logEl = h("pre", { class: "wg-w6-pre wg-git-log", "aria-label": "Equivalent git commands" });
    var status = h("p", { class: "wg-git-status" });
    var mean = meaning();

    function act(fn) { var r = fn(); if (r) { mean.set(r.text); status.className = "wg-git-status" + (r.err ? " wg-git-err" : ""); status.textContent = r.err ? "Refused: " + r.err : ""; } draw(); }

    function doCommit() {
      if (st.n >= 30) return { err: "playground limit of 30 commits reached. Use Start over.", text: "Start over to keep experimenting." };
      var m = msgIn.value.trim() || "change " + (st.n + 1);
      var parent = headC();
      var c = mk([parent], st.head, m);
      st.branches[st.head] = c.id;
      st.log.push('git commit -m "' + m.replace(/"/g, "'") + '"');
      msgIn.value = "";
      return { text: "Made " + c.id + " whose parent is " + parent + ", and moved " + st.head + " (the branch HEAD points to) forward to it. No other branch moved." };
    }
    function doBranch() {
      var n = nameIn.value.trim();
      if (!/^[A-Za-z0-9][A-Za-z0-9._\/-]{0,23}$/.test(n)) return { err: "use a name with letters, digits, - _ . or /, no spaces.", text: "Branch names cannot contain spaces." };
      if (st.branches[n]) return { err: "a branch named '" + n + "' already exists.", text: "Each branch name must be unique." };
      st.branches[n] = headC();
      st.log.push("git branch " + n);
      targetSel.dataset.want = n;
      return { text: "Created branch " + n + " pointing at " + headC() + ". A branch is just a label, so this copied nothing. HEAD is still on " + st.head + "; use checkout to switch." };
    }
    function doCheckout() {
      var t = targetSel.value;
      if (t === st.head) return { err: "already on '" + t + "'.", text: "HEAD already points to " + t + "." };
      st.head = t;
      st.log.push("git checkout " + t);
      return { text: "HEAD now points to " + t + ", so your files match " + st.branches[t] + " and the next commit will extend " + t + ". (Newer Git also has git switch " + t + ".)" };
    }
    function doMerge() {
      var t = targetSel.value;
      if (t === st.head) return { err: "cannot merge a branch into itself. Pick another branch.", text: "Merge brings another branch's commits into the branch you are on." };
      var hc = headC(), tc = st.branches[t];
      st.log.push("git merge " + t);
      if (ancestors(hc)[tc]) return { text: "Already up to date: every commit on " + t + " is already part of " + st.head + ", so nothing changed." };
      if (ancestors(tc)[hc]) {
        st.branches[st.head] = tc;
        return { text: "Fast-forward: " + st.head + " had no commits of its own since " + t + " split off, so Git just slid " + st.head + " forward to " + tc + ". No merge commit was needed." };
      }
      if (st.n >= 30) { st.log.pop(); return { err: "playground limit of 30 commits reached. Use Start over.", text: "Start over to keep experimenting." }; }
      var c = mk([hc, tc], st.head, "Merge branch '" + t + "' into " + st.head);
      st.branches[st.head] = c.id;
      return { text: "Made merge commit " + c.id + " with two parents (" + hc + " and " + tc + "). It combines both lines of work; " + t + " itself did not move. If both sides had changed the same lines, you would resolve a conflict here." };
    }
    function doReset() {
      var hc = headC(), p = st.byId[hc].parents[0];
      if (!p) return { err: hc + " is the first commit and has no parent.", text: "HEAD~1 means the parent of the current commit." };
      st.branches[st.head] = p;
      st.log.push("git reset --hard HEAD~1");
      var lost = !reachable()[hc];
      return { text: "Moved " + st.head + " back from " + hc + " to its parent " + p + ". " + (lost
        ? hc + " is now on no branch (drawn faded); git reflog can still recover it for a while. --hard also discards uncommitted edits, and never do this to commits you already pushed."
        : hc + " is still reachable from another branch, so nothing is lost.") };
    }

    function fillTargets() {
      var want = targetSel.dataset.want || targetSel.value;
      clear(targetSel);
      var names = Object.keys(st.branches);
      if (!st.branches[want] || want === st.head) want = names.filter(function (b) { return b !== st.head; })[0] || st.head;
      names.forEach(function (b) {
        var o = h("option", { value: b }, b + (b === st.head ? " (current)" : ""));
        if (b === want) o.selected = true;
        targetSel.appendChild(o);
      });
      delete targetSel.dataset.want;
    }

    function draw() {
      fillTargets();
      var reach = reachable();
      var labelsAt = {};
      Object.keys(st.branches).forEach(function (b) {
        var id = st.branches[b]; (labelsAt[id] = labelsAt[id] || []).push(b);
      });
      for (var k in labelsAt) labelsAt[k].sort(function (a, b) { return (b === st.head) - (a === st.head) || (a < b ? -1 : 1); });
      var GAPX = 62, X0 = 40;
      var W = Math.max(360, X0 + (st.n - 1) * GAPX + 70);
      function X(c) { return X0 + (c.seq - 1) * GAPX; }
      // place branch labels above their commit, bumping up a row when they would overlap
      var placed = {}, labels = [], levels = {};
      st.commits.forEach(function (c) {
        (labelsAt[c.id] || []).forEach(function (b) {
          var txt = b === st.head ? "HEAD → " + b : b;
          var w = txt.length * 6.6 + 12, x = Math.max(4, Math.min(W - w - 4, X(c) - w / 2));
          var pl = placed[c.lane] = placed[c.lane] || [], lvl = 0;
          while (pl.some(function (q) { return q.lvl === lvl && q.x1 < x + w + 4 && x < q.x2 + 4; })) lvl++;
          pl.push({ x1: x, x2: x + w, lvl: lvl });
          levels[c.lane] = Math.max(levels[c.lane] || 1, lvl + 1);
          labels.push({ c: c, b: b, txt: txt, x: x, w: w, lvl: lvl });
        });
      });
      var laneY = [], cursor = 4;
      for (var l = 0; l < st.nextLane; l++) { var L = levels[l] || 1; laneY[l] = cursor + 18 + 18 * L; cursor = laneY[l] + 30; }
      var H = cursor + 4;
      function Y(c) { return laneY[c.lane]; }
      var svg = s("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": "Commit graph with " + st.n + " commits", class: "wg-git-svg" });
      if (W > 560) svg.style.minWidth = Math.round(W * 0.8) + "px";
      st.commits.forEach(function (c) {
        c.parents.forEach(function (pid) {
          var p = st.byId[pid], x1 = X(p), y1 = Y(p), x2 = X(c), y2 = Y(c);
          var d = y1 === y2 ? "M" + x1 + " " + y1 + " L" + x2 + " " + y2
            : "M" + x1 + " " + y1 + " C" + (x1 + GAPX * 0.6) + " " + y1 + " " + (x2 - GAPX * 0.6) + " " + y2 + " " + x2 + " " + y2;
          svg.appendChild(s("path", { d: d, fill: "none", stroke: "var(--line-strong)", "stroke-width": "2",
            "stroke-dasharray": reach[c.id] ? null : "4 4", opacity: reach[c.id] ? "1" : "0.4" }));
        });
      });
      var hc = headC();
      st.commits.forEach(function (c) {
        var isHead = c.id === hc, g = s("g", {});
        g.appendChild(s("title", { text: c.id + ": " + c.msg + (c.parents.length ? " (parent" + (c.parents.length > 1 ? "s " : " ") + c.parents.join(", ") + ")" : " (no parent)") }));
        g.appendChild(s("circle", { cx: X(c), cy: Y(c), r: 14, fill: isHead ? "var(--accent)" : "var(--surface)", stroke: reach[c.id] ? "var(--accent)" : "var(--line-strong)", "stroke-width": "2",
          "stroke-dasharray": reach[c.id] ? null : "3 3" }));
        g.appendChild(s("text", { x: X(c), y: Y(c) + 4, "text-anchor": "middle", "font-size": "10", "font-family": "var(--mono)",
          fill: isHead ? "var(--accent-ink)" : reach[c.id] ? "var(--ink)" : "var(--muted)", text: c.id }));
        svg.appendChild(g);
      });
      labels.forEach(function (lb) {
        var y = Y(lb.c) - 36 - lb.lvl * 18, cur = lb.b === st.head;
        svg.appendChild(s("rect", { x: lb.x, y: y, width: lb.w, height: 16, rx: 4,
          fill: cur ? "var(--accent)" : "var(--accent-soft)", stroke: "var(--accent)", "stroke-width": "1" }));
        svg.appendChild(s("text", { x: lb.x + lb.w / 2, y: y + 12, "text-anchor": "middle", "font-size": "11", "font-family": "var(--mono)",
          fill: cur ? "var(--accent-ink)" : "var(--ink)", text: lb.txt }));
      });
      clear(svgWrap); svgWrap.appendChild(svg);
      logEl.textContent = st.log.map(function (l) { return "$ " + l; }).join("\n");
      logEl.scrollTop = logEl.scrollHeight;
    }

    reset0();
    host.appendChild(h("div", { class: "wg-w6-box" },
      h("div", { class: "wg-w6-row" },
        field("Commit message (optional)", msgIn),
        btn("Commit", function () { act(doCommit); }, "wg-w6-primary")),
      h("div", { class: "wg-w6-row" },
        field("New branch name", nameIn),
        btn("Branch", function () { act(doBranch); })),
      h("div", { class: "wg-w6-row" },
        field("Existing branch", targetSel),
        btn("Checkout", function () { act(doCheckout); }),
        btn("Merge into current", function () { act(doMerge); })),
      h("div", { class: "wg-w6-row" },
        btn("Reset --hard HEAD~1", function () { act(doReset); }),
        btn("Start over", function () { reset0(); act(function () { return { text: "Back to the start: you are on feature, which is one commit ahead of main." }; }); })),
      status,
      svgWrap,
      h("p", { class: "wg-w6-note" }, "Circles are commits (filled = where HEAD is). Boxes are branch names. Lines point from a parent to its child. Faded, dashed commits are on no branch."),
      mean.el,
      h("div", null, h("div", { class: "wg-w6-sub" }, "Equivalent git commands"), logEl)));
    draw();
    mean.set("You are on feature (HEAD → feature), one commit ahead of main. Try Commit, then Checkout main, make a commit there, and Merge feature to see a merge commit.");
  }

  /* =====================================================================
     terminal: sandboxed fake shell
     ===================================================================== */
  function renderTerminal(host) {
    var HOME = "/home/learner";
    function F(t) { return { type: "f", t: t }; }
    function D(c) { return { type: "d", c: c || {} }; }
    var root = D({ home: D({ learner: D({
      projects: D({ "report.py": F('print("monthly report")\n'), "README.md": F("# Projects\nScripts for the customer pilot.\n") }),
      data: D({ "sales.csv": F("date,region,amount\n2026-09-01,North,1200\n2026-09-02,South,950\n") }),
      "notes.txt": F("Remember: never commit API keys.\n")
    }) }), tmp: D() });
    var cwd = HOME, prev = HOME;
    var env = { HOME: HOME, USER: "learner", SHELL: "/bin/bash", PATH: "/usr/local/bin:/usr/bin:/bin" };
    var hist = [], hpos = 0;
    var flags = { pwd: false, cdproj: false, echoVar: false };

    function norm(p) {
      if (p === "~" || p.indexOf("~/") === 0) p = HOME + p.slice(1);
      if (p.charAt(0) !== "/") p = cwd + "/" + p;
      var out = [];
      p.split("/").forEach(function (seg) {
        if (!seg || seg === ".") return;
        if (seg === "..") out.pop(); else out.push(seg);
      });
      return "/" + out.join("/");
    }
    function get(abs) {
      var n = root; if (abs === "/") return n;
      var parts = abs.slice(1).split("/");
      for (var i = 0; i < parts.length; i++) {
        if (!n || n.type !== "d" || !Object.prototype.hasOwnProperty.call(n.c, parts[i])) return null;
        n = n.c[parts[i]];
      }
      return n;
    }
    function parentOf(abs) {
      var i = abs.lastIndexOf("/");
      return { dir: get(abs.slice(0, i) || "/"), name: abs.slice(i + 1) };
    }
    function show(abs) { return abs === HOME ? "~" : abs.indexOf(HOME + "/") === 0 ? "~" + abs.slice(HOME.length) : abs; }
    function prompt() { return "learner@sandbox:" + show(cwd) + "$"; }

    function tokenize(line) {
      var toks = [], cur = null, q = null, used = [];
      function push() { if (cur !== null) { toks.push({ v: cur }); cur = null; } }
      for (var i = 0; i < line.length; i++) {
        var ch = line.charAt(i);
        if (q) {
          if (ch === q) { q = null; continue; }
          if (ch === "$" && q === '"') { var r = varAt(i); if (r) { cur = (cur || "") + r.val; used.push(r.name); i = r.end - 1; continue; } }
          cur = (cur || "") + ch; continue;
        }
        if (ch === "'" || ch === '"') { q = ch; cur = cur || ""; continue; }
        if (/\s/.test(ch)) { push(); continue; }
        if (ch === ">") { push(); if (line.charAt(i + 1) === ">") { toks.push({ op: ">>" }); i++; } else toks.push({ op: ">" }); continue; }
        if (ch === "$") { var r2 = varAt(i); if (r2) { cur = (cur || "") + r2.val; used.push(r2.name); i = r2.end - 1; continue; } }
        cur = (cur || "") + ch;
      }
      if (q) return { err: "unexpected end of line: a quote (" + q + ") was never closed" };
      push();
      return { toks: toks, used: used };
      function varAt(i) {
        var m = /^\$(?:\{([A-Za-z_][A-Za-z0-9_]*)\}|([A-Za-z_][A-Za-z0-9_]*))/.exec(line.slice(i));
        if (!m) return null;
        var name = m[1] || m[2];
        return { name: name, val: Object.prototype.hasOwnProperty.call(env, name) ? env[name] : "", end: i + m[0].length };
      }
    }

    var out = h("div", { class: "wg-term-out", role: "log", "aria-live": "polite", "aria-label": "Terminal output" });
    var inp = h("input", { class: "wg-w6-in wg-term-in", type: "text", autocomplete: "off", autocapitalize: "off", spellcheck: "false", placeholder: "type a command, e.g. ls" });
    var promptEl = h("span", { class: "wg-term-prompt" });
    var mean = meaning();
    var missionList = h("ol", { class: "wg-term-missions" });
    var progress = h("p", { class: "wg-w6-sub" });

    function line(text, cls) { out.appendChild(h("div", { class: "wg-term-line" + (cls ? " " + cls : "") }, text)); }

    var missions = [
      ["Find out which folder you are in.", "pwd", function () { return flags.pwd; }],
      ["Move into the projects folder.", "cd projects", function () { return flags.cdproj; }],
      ["Inside projects, make a folder called analysis.", "mkdir analysis", function () { var n = get(HOME + "/projects/analysis"); return n && n.type === "d"; }],
      ["Create an empty file notes.md inside analysis.", "touch analysis/notes.md", function () { var n = get(HOME + "/projects/analysis/notes.md"); return n && n.type === "f"; }],
      ["Write a line of text into that notes.md, then read it back with cat.", "echo \"first idea\" > analysis/notes.md  then  cat analysis/notes.md", function () { var n = get(HOME + "/projects/analysis/notes.md"); return n && n.type === "f" && n.t.trim() !== "" && flags.catNotes; }],
      ["Set API_URL with export, then print it with echo $API_URL.", "export API_URL=https://api.example.com", function () { return flags.echoVar; }]
    ];
    var done = missions.map(function () { return false; });
    function drawMissions() {
      missions.forEach(function (m, i) { if (!done[i] && m[2]()) done[i] = true; });
      clear(missionList);
      missions.forEach(function (m, i) {
        missionList.appendChild(h("li", { class: done[i] ? "wg-term-done" : null },
          h("span", { class: "wg-term-tick", "aria-hidden": "true" }, done[i] ? "✓" : "○"),
          h("span", null, m[0], done[i] ? h("span", { class: "wg-w6-vh" }, " (done)") : h("span", { class: "wg-term-try" }, " Try: ", h("code", null, m[1])))));
      });
      var n = done.filter(Boolean).length;
      progress.textContent = "Missions: " + n + " of 6 done" + (n === 6 ? ". All done, nicely typed." : "");
    }

    function run(raw) {
      var text = raw.trim();
      line(prompt() + " " + raw, "wg-term-cmd");
      if (!text) { mean.set("Pressing Enter on an empty line just shows a new prompt."); return; }
      hist.push(text); hpos = hist.length;
      var t = tokenize(text);
      if (t.err) { line("bash: " + t.err, "wg-term-err"); mean.set("Quotes must come in pairs: 'like this' or \"like this\"."); return; }
      var toks = t.toks, redir = null, args = [];
      for (var i = 0; i < toks.length; i++) {
        if (toks[i].op) {
          if (!toks[i + 1] || toks[i + 1].op) { line("bash: syntax error: expected a file name after " + toks[i].op, "wg-term-err"); mean.set("> must be followed by the file to write to."); return; }
          redir = { op: toks[i].op, file: toks[i + 1].v }; i++;
        } else args.push(toks[i].v);
      }
      if (!args.length) { line("bash: syntax error: no command before " + (redir ? redir.op : ""), "wg-term-err"); return; }
      var cmd = args[0], a = args.slice(1), lines = [], errs = [], why = "";
      function E(m) { errs.push(cmd + ": " + m); }
      switch (cmd) {
        case "help":
          lines = ["Commands in this practice shell:",
            "  pwd                  print the folder you are in",
            "  ls [path]            list what is in a folder",
            "  cd [path]            change folder (cd .. goes up, cd alone goes home)",
            "  mkdir [-p] name      make a folder",
            "  touch name           create an empty file",
            "  cat file             print a file",
            "  echo text [> file]   print text, or write it to a file (>> appends)",
            "  rm [-r] path         delete a file (-r for a folder)",
            "  export NAME=value    set an environment variable; read it with $NAME",
            "  env                  list environment variables",
            "  history              list commands you typed",
            "  clear                clear the screen",
            "Nothing here touches your real computer."];
          why = "help lists what this sandbox understands. On a real machine, try man ls or ls --help.";
          break;
        case "pwd":
          lines = [cwd]; flags.pwd = true;
          why = "pwd printed your current folder as an absolute path. ~ in the prompt is short for your home folder, " + HOME + ".";
          break;
        case "ls": {
          var targets = a.filter(function (x) { return x.charAt(0) !== "-"; });
          if (!targets.length) targets = ["."];
          targets.forEach(function (p) {
            var n = get(norm(p));
            if (!n) { E("cannot access '" + p + "': No such file or directory"); return; }
            if (targets.length > 1) lines.push(p + ":");
            if (n.type === "f") { lines.push(p); return; }
            var names = Object.keys(n.c).sort().map(function (k) { return n.c[k].type === "d" ? k + "/" : k; });
            lines.push(names.length ? names.join("  ") : "(empty folder)");
          });
          why = "ls listed the folder's contents. Names ending in / are folders (real ls shows them in a different colour).";
          break;
        }
        case "cd": {
          var p = a[0] || "~";
          var target = p === "-" ? prev : norm(p), n = get(target);
          if (!n) { E(p + ": No such file or directory"); why = "cd failed: there is no " + p + " here. Use ls to see what exists."; break; }
          if (n.type !== "d") { E(p + ": Not a directory"); why = p + " is a file, and you can only cd into folders."; break; }
          prev = cwd; cwd = target;
          if (cwd === HOME + "/projects") flags.cdproj = true;
          why = "You moved to " + show(cwd) + ". The prompt changed to show where you are; commands now run relative to this folder.";
          break;
        }
        case "mkdir": {
          var pflag = a.indexOf("-p") >= 0, names2 = a.filter(function (x) { return x !== "-p"; });
          if (!names2.length) { E("missing operand (give a folder name)"); break; }
          names2.forEach(function (nm) {
            var abs = norm(nm);
            if (get(abs)) { if (!pflag) E("cannot create directory '" + nm + "': File exists"); return; }
            if (pflag) {
              var cur = root; abs.slice(1).split("/").forEach(function (seg) {
                if (!cur || cur.type !== "d") { cur = null; return; }
                if (!cur.c[seg]) cur.c[seg] = D(); cur = cur.c[seg];
              });
              if (!cur) E("cannot create directory '" + nm + "': Not a directory");
              return;
            }
            var po = parentOf(abs);
            if (!po.dir || po.dir.type !== "d") { E("cannot create directory '" + nm + "': No such file or directory (use -p to create parents)"); return; }
            po.dir.c[po.name] = D();
          });
          why = errs.length ? "mkdir could not make that folder; read the error message." : "mkdir made a new, empty folder. Check with ls.";
          break;
        }
        case "touch":
          if (!a.length) { E("missing file operand"); break; }
          a.forEach(function (nm) {
            var abs = norm(nm);
            if (get(abs)) return;
            var po = parentOf(abs);
            if (!po.dir || po.dir.type !== "d") { E("cannot touch '" + nm + "': No such file or directory"); return; }
            po.dir.c[po.name] = F("");
          });
          why = errs.length ? "touch failed because the folder in that path does not exist." : "touch created an empty file (on an existing file it just updates the modified time).";
          break;
        case "cat":
          if (!a.length) { E("give a file name, e.g. cat notes.txt"); break; }
          a.forEach(function (nm) {
            var abs = norm(nm), n = get(abs);
            if (!n) { E(nm + ": No such file or directory"); return; }
            if (n.type === "d") { E(nm + ": Is a directory"); return; }
            if (abs === HOME + "/projects/analysis/notes.md" && n.t.trim()) flags.catNotes = true;
            if (n.t) n.t.replace(/\n$/, "").split("\n").forEach(function (l) { lines.push(l); });
          });
          why = errs.length ? "cat only prints files that exist." : "cat printed the file's contents to the screen.";
          break;
        case "echo":
          lines = [a.join(" ")];
          if (t.used.indexOf("API_URL") >= 0 && env.API_URL) flags.echoVar = true;
          why = t.used.length ? "The shell replaced $" + t.used[0] + " with its value before echo ran" + (env[t.used[0]] === undefined ? "; it is not set, so it became empty text." : ".") : "echo printed its arguments.";
          break;
        case "rm": {
          var rflag = a.some(function (x) { return /^-[rRf]+$/.test(x) && /[rR]/.test(x); });
          var targs = a.filter(function (x) { return x.charAt(0) !== "-"; });
          if (!targs.length) { E("missing operand"); break; }
          targs.forEach(function (nm) {
            var abs = norm(nm), n = get(abs);
            if (!n) { E("cannot remove '" + nm + "': No such file or directory"); return; }
            if (abs === "/" || HOME.indexOf(abs) === 0 && (HOME === abs || HOME.charAt(abs.length) === "/")) { E("refusing to remove '" + nm + "' in this sandbox"); return; }
            if (n.type === "d" && !rflag) { E("cannot remove '" + nm + "': Is a directory (use rm -r)"); return; }
            if (cwd === abs || cwd.indexOf(abs + "/") === 0) { E("cannot remove '" + nm + "': you are inside it; cd out first"); return; }
            var po = parentOf(abs); delete po.dir.c[po.name];
          });
          why = errs.length ? "rm refused; read the message." : "rm deleted it. On a real machine there is no recycle bin, so check the path before pressing Enter.";
          break;
        }
        case "export":
          if (!a.length) { Object.keys(env).sort().forEach(function (k) { lines.push("declare -x " + k + '="' + env[k] + '"'); }); why = "With no arguments, export lists exported variables."; break; }
          a.forEach(function (kv) {
            var m = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(kv);
            if (!m) { E("'" + kv + "': use NAME=value with no spaces around ="); return; }
            env[m[1]] = m[2];
          });
          why = errs.length ? "Write export NAME=value with no spaces around the = sign." : "The variable is set for this shell and every program it starts. Read it with $NAME. Real API keys go in variables like this, never in code.";
          break;
        case "env":
          Object.keys(env).sort().forEach(function (k) { lines.push(k + "=" + env[k]); });
          why = "env listed every environment variable programs started from this shell would see.";
          break;
        case "history":
          hist.forEach(function (c, i) { lines.push(String(i + 1).padStart(4, " ") + "  " + c); });
          why = "history lists your past commands. On a real shell, the up arrow recalls them (it works here too).";
          break;
        case "clear":
          clear(out); mean.set("The screen is cleared; your files and variables are unchanged."); return;
        case "sudo": case "python": case "python3": case "pip": case "curl": case "git": case "npm": case "node":
          E("not available: this practice shell cannot run real programs");
          why = cmd + " is a real program on your computer. This sandbox only has the commands listed by help.";
          break;
        default:
          errs.push("bash: " + cmd + ": command not found");
          why = "The shell did not recognise " + cmd + ". Check spelling, or type help for the commands this sandbox knows.";
      }
      if (redir && !errs.length || redir && lines.length) {
        var abs = norm(redir.file), po = parentOf(abs), ex = get(abs);
        if (ex && ex.type === "d") errs.push("bash: " + redir.file + ": Is a directory");
        else if (!po.dir || po.dir.type !== "d") errs.push("bash: " + redir.file + ": No such file or directory");
        else {
          var body = lines.length ? lines.join("\n") + "\n" : "";
          if (redir.op === ">>" && ex) ex.t += body; else po.dir.c[po.name] = F(body);
          why = (redir.op === ">" ? "> wrote the output into " : ">> added the output to the end of ") + redir.file + " instead of the screen" + (redir.op === ">" ? " (replacing what was there)." : ".") + " Use cat to read it.";
          lines = [];
        }
      }
      lines.forEach(function (l) { line(l); });
      errs.forEach(function (l) { line(l, "wg-term-err"); });
      mean.set(why || "Done.");
    }

    function refresh() { promptEl.textContent = prompt(); drawMissions(); out.scrollTop = out.scrollHeight; }
    var form = h("form", { class: "wg-term-form" });
    var inId = uid(); inp.id = inId;
    form.appendChild(h("label", { for: inId, class: "wg-w6-sub" }, "Command"));
    form.appendChild(h("div", { class: "wg-term-inrow" }, promptEl, inp, h("button", { type: "submit", class: "wg-w6-btn wg-w6-primary" }, "Run")));
    form.addEventListener("submit", function (e) { e.preventDefault(); run(inp.value); inp.value = ""; refresh(); });
    inp.addEventListener("keydown", function (e) {
      if (e.key === "ArrowUp") { if (hpos > 0) { hpos--; inp.value = hist[hpos]; } e.preventDefault(); }
      else if (e.key === "ArrowDown") { if (hpos < hist.length) { hpos++; inp.value = hist[hpos] || ""; } e.preventDefault(); }
    });

    line("Practice shell. Nothing here runs on your computer; files live only in this page.", "wg-term-muted");
    line("Type help to see the commands. Your home folder has projects/, data/ and notes.txt.", "wg-term-muted");
    host.appendChild(h("div", { class: "wg-w6-box" },
      h("div", { class: "wg-term-grid" },
        h("div", { class: "wg-term-shell" }, out, form),
        h("div", null, progress, missionList)),
      mean.el));
    mean.set("A shell reads one command at a time: a program name, then arguments. Start with the first mission: type pwd and press Enter.");
    refresh();
  }

  /* =====================================================================
     planner: query plan explorer
     ===================================================================== */
  function renderPlanner(host) {
    var N = 1000000, PAGES = 10000, SEQ = 1, RAND = 4, CPU = 0.01, ICPU = 0.005, PER_LEAF = 300;
    var IX = {
      cust: { name: "idx_orders_customer", cols: "(customer_id)", label: "Index on customer_id", descent: 3 },
      created: { name: "idx_orders_created", cols: "(created_at)", label: "Index on created_at", descent: 3 },
      comp: { name: "idx_orders_cust_created", cols: "(customer_id, created_at)", label: "Composite index on (customer_id, created_at)", descent: 4 }
    };
    function seqCost() { return PAGES * SEQ + N * CPU; }
    function idxScan(m, ix) { return ix.descent + Math.ceil(m / PER_LEAF) + m * RAND + m * CPU; }
    function idxOnly(m, ix) { return ix.descent + Math.ceil(m / PER_LEAF) + m * ICPU; }
    function fullIdx(ix) { return ix.descent + Math.ceil(N / PER_LEAF) + N * ICPU; }
    function sortCost(n) { return n > 1 ? n * Math.log2(n) * CPU : 0; }
    function c(x) { return fmt(x); }

    var Q = [
      { id: "a", label: "A. One customer's orders", sql: "SELECT * FROM orders\nWHERE customer_id = 4217;",
        cands: function (on) {
          var m = 20, out = [], sc = seqCost();
          out.push({ key: "seq", type: "Seq Scan", cost: sc, plan: ["Seq Scan on orders  (cost=" + c(sc) + " rows=" + m + ")", "  Filter: (customer_id = 4217)"],
            why: "With no usable index, the only option is to read all 10,000 pages and test every one of the 1,000,000 rows. About 20 rows match." });
          ["cust", "comp"].forEach(function (k) {
            if (!on[k]) return; var ix = IX[k], cost = idxScan(m, ix);
            out.push({ key: k, type: "Index Scan", ix: ix, cost: cost, plan: ["Index Scan using " + ix.name + " on orders  (cost=" + c(cost) + " rows=" + m + ")", "  Index Cond: (customer_id = 4217)"],
              why: k === "cust" ? "The index jumps straight to customer 4217 in a few steps, then fetches its ~20 rows from the table. Reading 20 rows instead of 1,000,000 is far cheaper."
                : "customer_id is the first column of the composite index, so it can seek on it just like a single-column index." });
          });
          if (on.created) out.push({ unusable: true, ix: IX.created, reason: "the query does not filter on created_at" });
          return out;
        } },
      { id: "b", label: "B. One customer's recent orders, sorted", sql: "SELECT * FROM orders\nWHERE customer_id = 4217\n  AND created_at >= '2026-07-01'\nORDER BY created_at;",
        cands: function (on) {
          var m = 5, out = [], sc = seqCost() + sortCost(m);
          out.push({ key: "seq", type: "Seq Scan", cost: sc, plan: ["Sort  (cost=" + c(sc) + " rows=" + m + ")", "  Sort Key: created_at", "  ->  Seq Scan on orders  (cost=" + c(seqCost()) + " rows=" + m + ")", "        Filter: (customer_id = 4217 AND created_at >= '2026-07-01')"],
            why: "No index narrows this down, so the whole table is read, filtered, and the few matches are sorted." });
          if (on.cust) { var ic = idxScan(20, IX.cust), tc = ic + sortCost(m);
            out.push({ key: "cust", type: "Index Scan", ix: IX.cust, cost: tc, plan: ["Sort  (cost=" + c(tc) + " rows=" + m + ")", "  Sort Key: created_at", "  ->  Index Scan using idx_orders_customer on orders  (cost=" + c(ic) + " rows=20)", "        Index Cond: (customer_id = 4217)", "        Filter: (created_at >= '2026-07-01')"],
              why: "The customer_id index finds the customer's ~20 rows; each is fetched from the table, 15 are thrown away by the date filter, and 5 are sorted. Good, but the composite index would do better." }); }
          if (on.created) { var m2 = 90000, cc = idxScan(m2, IX.created) + sortCost(m);
            out.push({ key: "created", type: "Index Scan", ix: IX.created, cost: cc, plan: ["Sort  (cost=" + c(cc) + " rows=" + m + ")", "  ->  Index Scan using idx_orders_created on orders  (cost=" + c(cc - sortCost(m)) + " rows=90,000)", "        Index Cond: (created_at >= '2026-07-01')", "        Filter: (customer_id = 4217)"],
              why: "Picked the created_at index: about 90,000 recent rows would each be fetched." }); }
          if (on.comp) { var pc = idxScan(m, IX.comp);
            out.push({ key: "comp", type: "Index Scan", ix: IX.comp, cost: pc, plan: ["Index Scan using idx_orders_cust_created on orders  (cost=" + c(pc) + " rows=" + m + ")", "  Index Cond: (customer_id = 4217 AND created_at >= '2026-07-01')"],
              why: "The composite index is sorted by customer_id, then created_at within each customer. So it seeks to exactly the 5 matching rows and returns them already in created_at order: no filter, no Sort step." }); }
          return out;
        } },
      { id: "c", label: "C. Count of last week's orders", sql: "SELECT count(*) FROM orders\nWHERE created_at >= '2026-09-20';",
        cands: function (on) {
          var m = 7000, agg = m * CPU, out = [], sc = seqCost() + agg;
          out.push({ key: "seq", type: "Seq Scan", cost: sc, plan: ["Aggregate  (cost=" + c(sc) + " rows=1)", "  ->  Seq Scan on orders  (cost=" + c(seqCost()) + " rows=7,000)", "        Filter: (created_at >= '2026-09-20')"],
            why: "Without a created_at index the planner reads the whole table to count about 7,000 rows." });
          if (on.created) { var oc = idxOnly(m, IX.created) + agg;
            out.push({ key: "created", type: "Index Only Scan", ix: IX.created, cost: oc, plan: ["Aggregate  (cost=" + c(oc) + " rows=1)", "  ->  Index Only Scan using idx_orders_created on orders  (cost=" + c(oc - agg) + " rows=7,000)", "        Index Cond: (created_at >= '2026-09-20')"],
              why: "count(*) needs no columns beyond created_at, and the index already holds created_at. So the planner reads only the index (an Index Only Scan) and never touches the table pages." }); }
          if (on.comp) { var fc = fullIdx(IX.comp) + agg;
            out.push({ key: "comp", type: "Index Only Scan", ix: IX.comp, cost: fc, note: "reads the whole index", plan: ["Aggregate  (cost=" + c(fc) + " rows=1)", "  ->  Index Only Scan using idx_orders_cust_created on orders  (cost=" + c(fc - agg) + " rows=7,000)", "        Index Cond: (created_at >= '2026-09-20')", "        -- whole index read: created_at is not its first column"],
              why: "The composite index is sorted by customer_id first, so it cannot jump to last week. But it is smaller than the table and holds created_at, so reading all of it beats a table scan. A created_at index would be far cheaper." }); }
          if (on.cust) out.push({ unusable: true, ix: IX.cust, reason: "the query does not filter on customer_id" });
          return out;
        } },
      { id: "d", label: "D. Everything from the last 12 months", sql: "SELECT * FROM orders\nWHERE created_at >= '2025-10-01';",
        cands: function (on) {
          var m = 360000, out = [], sc = seqCost();
          out.push({ key: "seq", type: "Seq Scan", cost: sc, plan: ["Seq Scan on orders  (cost=" + c(sc) + " rows=360,000)", "  Filter: (created_at >= '2025-10-01')"],
            why: "About 36% of the table matches. Fetching each of 360,000 rows through an index costs a random page read per row, so reading the whole table in order is cheaper. Indexes help when a query needs a small fraction of rows." });
          if (on.created) { var ic = idxScan(m, IX.created);
            out.push({ key: "created", type: "Index Scan", ix: IX.created, cost: ic, plan: ["Index Scan using idx_orders_created on orders  (cost=" + c(ic) + " rows=360,000)", "  Index Cond: (created_at >= '2025-10-01')"], why: "" }); }
          if (on.comp) { var fc = fullIdx(IX.comp) + m * RAND + m * CPU;
            out.push({ key: "comp", type: "Index Scan", ix: IX.comp, cost: fc, note: "reads the whole index", plan: ["Index Scan using idx_orders_cust_created on orders  (cost=" + c(fc) + " rows=360,000)"], why: "" }); }
          if (on.cust) out.push({ unusable: true, ix: IX.cust, reason: "the query does not filter on customer_id" });
          return out;
        } }
    ];

    var on = { cust: true, created: false, comp: false };
    var boxes = h("fieldset", { class: "wg-plan-fs" }, h("legend", null, "Indexes on orders (the primary key on order_id always exists)"));
    Object.keys(IX).forEach(function (k) {
      var id = uid();
      var cb = h("input", { type: "checkbox", id: id });
      cb.checked = on[k];
      cb.addEventListener("change", function () { on[k] = cb.checked; draw(); });
      boxes.appendChild(h("div", { class: "wg-plan-cb" }, cb, h("label", { for: id }, IX[k].label, " ", h("code", null, IX[k].name))));
    });
    var qsel = select(Q.map(function (q) { return [q.id, q.label]; }), "a");
    qsel.addEventListener("change", draw);
    var sqlEl = h("pre", { class: "wg-w6-pre" });
    var planEl = h("pre", { class: "wg-w6-pre wg-plan-explain", "aria-label": "Chosen plan" });
    var candEl = h("div", { class: "wg-plan-cands" });
    var whyEl = h("p", { class: "wg-plan-why" });
    var writeEl = h("p", { class: "wg-w6-note" });
    var mean = meaning();

    function draw() {
      var q = Q.filter(function (x) { return x.id === qsel.value; })[0];
      var cs = q.cands(on), usable = cs.filter(function (x) { return !x.unusable; });
      usable.sort(function (x, y) { return x.cost - y.cost; });
      var best = usable[0], seq = usable.filter(function (x) { return x.key === "seq"; })[0];
      sqlEl.textContent = "EXPLAIN " + q.sql;
      planEl.textContent = best.plan.join("\n");
      clear(candEl);
      var lo = 1, hi = Math.log10(2e6);
      usable.forEach(function (x) {
        var w = Math.max(2, Math.min(100, (Math.log10(Math.max(x.cost, 10)) - lo) / (hi - lo) * 100));
        candEl.appendChild(h("div", { class: "wg-plan-cand" + (x === best ? " wg-plan-best" : "") },
          h("div", { class: "wg-plan-cname" }, (x === best ? "Chosen: " : "") + x.type + (x.ix ? " on " + x.ix.name : "") + (x.note ? " (" + x.note + ")" : "")),
          h("div", { class: "wg-plan-barrow" },
            h("div", { class: "wg-plan-bar", style: "width:" + w.toFixed(1) + "%" }),
            h("span", { class: "wg-plan-cost" }, c(x.cost)))));
      });
      cs.filter(function (x) { return x.unusable; }).forEach(function (x) {
        candEl.appendChild(h("div", { class: "wg-plan-cand wg-plan-unusable" },
          h("div", { class: "wg-plan-cname" }, "Cannot use " + x.ix.name + ": " + x.reason)));
      });
      var nextBest = usable[1];
      whyEl.textContent = "Why: " + best.why + (nextBest ? " Next best: " + nextBest.type + (nextBest.ix ? " on " + nextBest.ix.name : "") + " at " + c(nextBest.cost) + "." : "");
      var k = Object.keys(on).filter(function (x) { return on[x]; }).length;
      writeEl.textContent = "Trade-off: with " + k + " extra index" + (k === 1 ? "" : "es") + ", every INSERT into orders also updates " + (k + 1) + " B-tree" + (k ? "s" : "") + " (including the primary key). Indexes speed reads and slow writes.";
      if (best.key === "seq") {
        var hint = q.id === "d" ? " Even ticking every index will not change that: too many rows match." : q.id === "a" ? " Tick the customer_id index." : q.id === "b" ? " Tick the composite index." : " Tick the created_at index.";
        mean.set("No available index beats reading the whole table (" + c(seq.cost) + " units), so the planner scans all 1,000,000 rows." + hint);
      } else {
        var ratio = seq.cost / best.cost;
        mean.set("The planner uses " + (best.type.charAt(0) === "I" ? "an " : "a ") + best.type + " on " + best.ix.name + " at about " + c(best.cost) + " units versus " + c(seq.cost) + " for a full table scan, roughly " + (ratio >= 10 ? fmt(ratio) : ratio.toFixed(1)) + "× cheaper.");
      }
    }

    host.appendChild(h("div", { class: "wg-w6-box" },
      h("p", { class: "wg-w6-note" }, "Toy table: orders, 1,000,000 rows on 10,000 pages, about 50,000 customers (~20 orders each), about 1,000 orders per day."),
      h("div", { class: "wg-plan-grid" }, boxes, h("div", null, field("Query", qsel), sqlEl)),
      h("div", null, h("div", { class: "wg-w6-sub" }, "Plan the planner picks (EXPLAIN-style)"), planEl),
      h("div", null, h("div", { class: "wg-w6-sub" }, "Candidate plans, estimated cost (log scale, lower is better)"), candEl),
      whyEl, mean.el, writeEl,
      h("p", { class: "wg-w6-note" }, "Illustrative cost units, a simplified version of PostgreSQL's model: reading a page in order = 1, a random page read = 4, checking a row = 0.01 (0.005 inside an index). Real plans depend on your data, statistics and settings; PostgreSQL also has Bitmap Heap Scans, a middle ground not shown here.")));
    draw();
  }

  /* =====================================================================
     acid: two-transaction stepper
     ===================================================================== */
  function renderAcid(host) {
    var LEVELS = [["ru", "READ UNCOMMITTED"], ["rc", "READ COMMITTED"], ["rr", "REPEATABLE READ"], ["s", "SERIALIZABLE"]];
    var HAPPENS = { dirty: { ru: 1 }, nonrep: { ru: 1, rc: 1 }, lost: { ru: 1, rc: 1 }, phantom: { ru: 1, rc: 1, rr: 1 } };
    function pick(v, hp) { return Array.isArray(v) ? v[hp ? 0 : 1] : v; }
    var A = {
      dirty: { label: "Dirty read", cols: ["name", "balance (committed)", "uncommitted change"], init: [["Alice", "100", ""]],
        def: "reading another transaction's change before it commits",
        steps: [
          { t: 1, sql: "BEGIN;", res: "transaction started" },
          { t: 1, sql: "UPDATE accounts SET balance = 50\n WHERE name = 'Alice';", res: "1 row updated, not committed yet", tbl: [["Alice", "100", "50 (by T1)"]], hl: [0] },
          { t: 2, sql: "BEGIN;\nSELECT balance FROM accounts\n WHERE name = 'Alice';", res: ["50  ← sees T1's uncommitted change", "100  ← only committed data is visible"] },
          { t: 1, sql: "ROLLBACK;", res: "T1 cancels its change", tbl: [["Alice", "100", ""]] },
          { t: 2, sql: "COMMIT;", res: ["T2 acted on 50, a balance that never really existed", "T2 used real, committed data"] }
        ],
        mean: ["T2 read 50 from T1's unfinished work, then T1 rolled back. Anything T2 did with 50 is now wrong.", "T2 only ever saw the committed balance of 100, so T1's rollback did not affect it."] },
      nonrep: { label: "Non-repeatable read", cols: ["name", "balance"], init: [["Alice", "100"]],
        def: "reading the same row twice in one transaction and getting different values",
        steps: [
          { t: 1, sql: "BEGIN;\nSELECT balance FROM accounts\n WHERE name = 'Alice';", res: "100" },
          { t: 2, sql: "BEGIN;\nUPDATE accounts SET balance = 50\n WHERE name = 'Alice';\nCOMMIT;", res: "1 row updated and committed", tbl: [["Alice", "50"]], hl: [0] },
          { t: 1, sql: "SELECT balance FROM accounts\n WHERE name = 'Alice';", res: ["50  ← same query, different answer", "100  ← T1 keeps reading its snapshot"] },
          { t: 1, sql: "COMMIT;", res: "done" }
        ],
        mean: ["Inside one transaction T1 read Alice's balance twice and got 100, then 50. Any calculation mixing both reads is inconsistent.", "T1 saw 100 both times: at this level the whole transaction reads one consistent snapshot. T2's change is visible to transactions that start later."] },
      lost: { label: "Lost update", cols: ["item", "stock (committed)", "uncommitted change"], init: [["Widget", "10", ""]],
        def: "two transactions read the same value, both change it, and one change overwrites the other",
        steps: [
          { t: 1, sql: "BEGIN;\nSELECT stock FROM items\n WHERE item = 'Widget';", res: "10" },
          { t: 2, sql: "BEGIN;\nSELECT stock FROM items\n WHERE item = 'Widget';", res: "10" },
          { t: 1, sql: "UPDATE items SET stock = 9  -- 10 - 1\n WHERE item = 'Widget';", res: "1 row updated", tbl: [["Widget", "10", "9 (by T1)"]], hl: [0] },
          { t: 1, sql: "COMMIT;", res: "committed: stock is 9", tbl: [["Widget", "9", ""]], hl: [0] },
          { t: 2, sql: "UPDATE items SET stock = 9  -- also 10 - 1\n WHERE item = 'Widget';",
            res: ["1 row updated: overwrites T1's result", "ERROR: could not serialize access due to concurrent update"],
            tbl: [[["Widget", "9", "9 (by T2)"]], [["Widget", "9", ""]]], hl: [0] },
          { t: 2, sql: ["COMMIT;", "ROLLBACK;  -- then retry:\nBEGIN; SELECT stock ...;  -- 9\nUPDATE items SET stock = 8 ...;\nCOMMIT;"],
            res: ["final stock 9, but two widgets were sold", "retry read 9 and wrote 8: both sales counted"],
            tbl: [[["Widget", "9", ""]], [["Widget", "8", ""]]], hl: [0] }
        ],
        mean: ["Two sales happened but stock only dropped by one: T2 wrote a value computed from a stale read and silently erased T1's update.", "The database stopped T2 because the row changed after T2 read it. The app retries, re-reads 9 and writes 8. (SELECT ... FOR UPDATE or UPDATE ... SET stock = stock - 1 also avoid this at any level.)"] },
      phantom: { label: "Phantom read", cols: ["order_id", "customer_id", "total"], init: [["1", "7", "20"], ["2", "7", "35"], ["3", "9", "12"]],
        def: "re-running a query and seeing new rows that another transaction inserted",
        steps: [
          { t: 1, sql: "BEGIN;\nSELECT count(*) FROM orders\n WHERE customer_id = 7;", res: "2" },
          { t: 2, sql: "BEGIN;\nINSERT INTO orders VALUES (4, 7, 50);\nCOMMIT;", res: "1 row inserted and committed", tbl: [["1", "7", "20"], ["2", "7", "35"], ["3", "9", "12"], ["4", "7", "50"]], hl: [3] },
          { t: 1, sql: "SELECT count(*) FROM orders\n WHERE customer_id = 7;", res: ["3  ← a new 'phantom' row appeared", "2  ← rows added after T1 began are invisible"] },
          { t: 1, sql: "COMMIT;", res: "done" }
        ],
        mean: ["The same query in one transaction returned 2 rows, then 3. Existing rows did not change; a new matching row appeared.", "T1 counted 2 both times. Only SERIALIZABLE rules this out in the SQL standard (PostgreSQL's REPEATABLE READ also does)."] }
    };

    var aSel = select(Object.keys(A).map(function (k) { return [k, A[k].label]; }), "nonrep");
    var lSel = select(LEVELS, "rc");
    var step = 0;
    var timeline = h("div", { class: "wg-acid-tl" });
    var dataEl = h("div");
    var verdict = h("p", { class: "wg-acid-verdict", "aria-live": "polite" });
    var counter = h("span", { class: "wg-w6-sub" });
    var bBack = btn("Back", function () { if (step > 0) { step--; draw(); } });
    var bNext = btn("Next step", function () { var n = A[aSel.value].steps.length; if (step < n) { step++; draw(); } }, "wg-w6-primary");
    var matrixEl = h("div");
    var pgNote = h("p", { class: "wg-w6-note" });
    var mean = meaning();
    aSel.addEventListener("change", function () { step = 0; draw(); });
    lSel.addEventListener("change", function () { step = 0; draw(); });

    function draw() {
      var a = A[aSel.value], lv = lSel.value, hp = !!HAPPENS[aSel.value][lv], n = a.steps.length;
      var lvName = LEVELS.filter(function (x) { return x[0] === lv; })[0][1];
      counter.textContent = "Step " + step + " of " + n;
      bBack.disabled = step === 0; bNext.disabled = step === n;
      clear(timeline);
      timeline.appendChild(h("div", { class: "wg-acid-th" }, "T1"));
      timeline.appendChild(h("div", { class: "wg-acid-th" }, "T2"));
      var tbl = a.init, hl = [];
      a.steps.forEach(function (st, i) {
        var doneStep = i < step, cur = i === step - 1;
        var cell = h("div", { class: "wg-acid-cell" + (doneStep ? "" : " wg-acid-future") + (cur ? " wg-acid-cur" : "") },
          h("div", { class: "wg-acid-num" }, (i + 1) + "."),
          h("pre", { class: "wg-acid-sql" }, pick(st.sql, hp)),
          doneStep ? h("div", { class: "wg-acid-res" }, "→ " + pick(st.res, hp)) : null);
        var empty = h("div", { class: "wg-acid-empty", "aria-hidden": "true" });
        if (st.t === 1) { timeline.appendChild(cell); timeline.appendChild(empty); }
        else { timeline.appendChild(empty); timeline.appendChild(cell); }
        if (doneStep && st.tbl) { tbl = Array.isArray(st.tbl[0][0]) ? st.tbl[hp ? 0 : 1] : st.tbl; }
        if (cur) hl = st.tbl ? st.hl || [] : [];
      });
      clear(dataEl);
      dataEl.appendChild(h("div", { class: "wg-w6-sub" }, "Data after step " + step));
      dataEl.appendChild(table(a.cols, tbl, function (r, i) { return hl.indexOf(i) >= 0 ? "wg-acid-hlrow" : null; }));
      var expect = hp ? "can happen" : "is prevented";
      verdict.className = "wg-acid-verdict " + (hp ? "wg-acid-yes" : "wg-acid-no");
      verdict.textContent = step === n
        ? (hp ? "Result: the " + a.label.toLowerCase() + " happened at " + lvName + "." : "Result: no " + a.label.toLowerCase() + " at " + lvName + ".")
        : "At " + lvName + ", a " + a.label.toLowerCase() + " " + expect + ". Step through to see it.";
      mean.set(step === n ? a.mean[hp ? 0 : 1] : "A " + a.label.toLowerCase() + " is " + a.def + ". At " + lvName + " the SQL standard says it " + expect + ".");
      clear(matrixEl);
      matrixEl.appendChild(h("div", { class: "wg-w6-sub" }, "Which anomalies each level allows (SQL standard)"));
      var head = ["Anomaly"].concat(LEVELS.map(function (x) { return x[1].replace("READ ", "R. ").replace("REPEATABLE", "REPEAT."); }));
      var t = h("table", { class: "wg-w6-table wg-acid-matrix" },
        h("thead", null, h("tr", null, head.map(function (x) { return h("th", { scope: "col" }, x); }))),
        h("tbody", null, Object.keys(A).map(function (k) {
          return h("tr", null, h("th", { scope: "row" }, A[k].label + (k === "lost" ? " *" : "")), LEVELS.map(function (l) {
            var yes = !!HAPPENS[k][l[0]];
            return h("td", { class: (yes ? "wg-acid-m-yes" : "wg-acid-m-no") + (k === aSel.value && l[0] === lv ? " wg-acid-m-sel" : "") }, yes ? "possible" : "prevented");
          }));
        })));
      matrixEl.appendChild(h("div", { class: "wg-w6-tablewrap" }, t));
      matrixEl.appendChild(h("p", { class: "wg-w6-note" }, "* Lost update is not one of the standard's three named phenomena; the row shows the common textbook reading of the levels."));
      var notes = ["PostgreSQL note: READ UNCOMMITTED is treated as READ COMMITTED, so dirty reads never happen in PostgreSQL."];
      if (lv === "ru" && aSel.value === "dirty") notes = ["PostgreSQL note: you would NOT see this dirty read in PostgreSQL, because it runs READ UNCOMMITTED as READ COMMITTED. Some other databases (e.g. SQL Server) do allow it."];
      notes.push("Its REPEATABLE READ is also stricter than the standard: it prevents phantoms and aborts the second writer in a lost update.");
      pgNote.textContent = notes.join(" ");
    }

    host.appendChild(h("div", { class: "wg-w6-box" },
      h("div", { class: "wg-w6-row" }, field("Anomaly", aSel), field("Isolation level (both transactions)", lSel)),
      h("div", { class: "wg-w6-row wg-acid-ctrl" }, bBack, bNext, btn("Reset", function () { step = 0; draw(); }), counter),
      timeline, dataEl, verdict, mean.el, matrixEl, pgNote));
    draw();
  }

  /* =====================================================================
     sqlbank: practice cards
     ===================================================================== */
  var SQLB = {
 "schema": "CREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY, name TEXT NOT NULL,\n  region TEXT,                      -- NULL = unknown\n  signup_date TEXT NOT NULL         -- ISO date 'YYYY-MM-DD'\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY, name TEXT NOT NULL,\n  category TEXT NOT NULL, list_price REAL NOT NULL\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER NOT NULL REFERENCES customers(customer_id),\n  order_date TEXT NOT NULL,\n  status TEXT NOT NULL CHECK (status IN ('completed', 'cancelled'))\n);\nCREATE TABLE order_items (\n  order_id INTEGER NOT NULL REFERENCES orders(order_id),\n  product_id INTEGER NOT NULL REFERENCES products(product_id),\n  quantity INTEGER NOT NULL, unit_price REAL NOT NULL,  -- price actually charged\n  PRIMARY KEY (order_id, product_id)\n);\n\nINSERT INTO customers VALUES\n (1,'Arden Bakery','North','2024-01-05'), (2,'Bluefin Cafe','South','2024-01-12'),\n (3,'Cobalt Deli','North','2024-02-02'),  (4,'Dunmore Grocers','East','2024-02-20'),\n (5,'Elmstead Market','South','2024-03-01'), (6,'Fairlow Kitchen',NULL,'2024-03-15'),\n (7,'Gorsey Foods','East','2024-03-28');\nINSERT INTO products VALUES\n (1,'Flour 25kg','Baking',30), (2,'Yeast 1kg','Baking',12),\n (3,'Coffee beans 1kg','Beverages',18), (4,'Oat milk 12x1L','Beverages',24),\n (5,'Paper cups x500','Packaging',40), (6,'Takeaway boxes x200','Packaging',35);\nINSERT INTO orders VALUES\n (101,1,'2024-01-10','completed'), (102,2,'2024-01-15','completed'),\n (103,1,'2024-01-28','completed'), (104,3,'2024-02-05','cancelled'),\n (105,3,'2024-02-18','completed'), (106,4,'2024-02-25','completed'),\n (107,2,'2024-03-03','completed'), (108,1,'2024-03-09','completed'),\n (109,5,'2024-03-20','cancelled'), (110,4,'2024-03-30','completed'),\n (111,5,'2024-04-02','completed'), (112,2,'2024-04-15','completed');\nINSERT INTO order_items VALUES\n (101,1,4,30),(101,2,2,12), (102,3,5,18),(102,5,1,40), (103,1,2,30),(103,6,1,35),\n (104,3,2,18), (105,4,3,24),(105,5,2,40), (106,1,6,30),(106,2,3,12),(106,3,2,18),\n (107,3,4,18),(107,4,2,24), (108,1,3,30),(108,5,1,40), (109,6,2,35),\n (110,1,5,29),(110,4,1,24), (111,3,6,18),(111,6,2,35), (112,5,3,40),(112,4,2,24);",
 "ex": [
  {
   "n": 2,
   "level": "Easy",
   "skill": "Group and count",
   "q": "How many orders are there in each status? Show the status and the count, largest first.",
   "hint": "GROUP BY status, then COUNT(*) counts rows in each group.",
   "sql": "SELECT status, COUNT(*) AS n_orders\nFROM orders\nGROUP BY status\nORDER BY n_orders DESC;",
   "head": [
    "status",
    "n_orders"
   ],
   "rows": [
    [
     "completed",
     "10"
    ],
    [
     "cancelled",
     "2"
    ]
   ],
   "tables": [
    "orders"
   ]
  },
  {
   "n": 3,
   "level": "Easy",
   "skill": "Handling NULL",
   "q": "Count customers per region. Customers with no region should appear as 'Unknown'.",
   "hint": "GROUP BY puts NULLs in their own group, but you still need to label it. COALESCE returns the first non-NULL value.",
   "sql": "SELECT COALESCE(region, 'Unknown') AS region, COUNT(*) AS n_customers\nFROM customers\nGROUP BY COALESCE(region, 'Unknown')\nORDER BY n_customers DESC, region;",
   "head": [
    "region",
    "n_customers"
   ],
   "rows": [
    [
     "East",
     "2"
    ],
    [
     "North",
     "2"
    ],
    [
     "South",
     "2"
    ],
    [
     "Unknown",
     "1"
    ]
   ],
   "tables": [
    "customers"
   ]
  },
  {
   "n": 4,
   "level": "Medium",
   "skill": "Joining three tables",
   "q": "Total revenue per product category from completed orders only. Revenue is quantity times the unit price charged. Sort by revenue, highest first.",
   "hint": "Join order_items to orders (for status) and to products (for category). Filter status before grouping.",
   "sql": "SELECT p.category,\n       SUM(oi.quantity * oi.unit_price) AS revenue\nFROM order_items AS oi\nJOIN orders   AS o ON o.order_id = oi.order_id\nJOIN products AS p ON p.product_id = oi.product_id\nWHERE o.status = 'completed'\nGROUP BY p.category\nORDER BY revenue DESC;",
   "head": [
    "category",
    "revenue"
   ],
   "rows": [
    [
     "Baking",
     "655"
    ],
    [
     "Beverages",
     "498"
    ],
    [
     "Packaging",
     "385"
    ]
   ],
   "tables": [
    "order_items",
    "orders",
    "products"
   ]
  },
  {
   "n": 6,
   "level": "Medium",
   "skill": "Monthly totals and the fan-out trap",
   "q": "For completed orders, show each month (YYYY-MM), the number of orders and the revenue.",
   "hint": "strftime('%Y-%m', date) gives the month. After joining to order_items each order appears once per item, so COUNT(*) would overcount. Use COUNT(DISTINCT ...).",
   "sql": "SELECT strftime('%Y-%m', o.order_date) AS month,\n       COUNT(DISTINCT o.order_id)         AS n_orders,   -- not COUNT(*)\n       SUM(oi.quantity * oi.unit_price)   AS revenue\nFROM orders AS o\nJOIN order_items AS oi ON oi.order_id = o.order_id\nWHERE o.status = 'completed'\nGROUP BY month\nORDER BY month;",
   "head": [
    "month",
    "n_orders",
    "revenue"
   ],
   "rows": [
    [
     "2024-01",
     "3",
     "369"
    ],
    [
     "2024-02",
     "2",
     "404"
    ],
    [
     "2024-03",
     "3",
     "419"
    ],
    [
     "2024-04",
     "2",
     "346"
    ]
   ],
   "tables": [
    "orders",
    "order_items"
   ]
  },
  {
   "n": 7,
   "level": "Harder",
   "skill": "CTE and HAVING",
   "q": "Find customers whose total completed revenue is over 300. Show the number of completed orders, total revenue and average order value.",
   "hint": "First build a CTE with one row per order and its total. Then group by customer and filter groups with HAVING.",
   "sql": "WITH order_totals AS (\n  SELECT o.order_id, o.customer_id,\n         SUM(oi.quantity * oi.unit_price) AS order_total\n  FROM orders AS o\n  JOIN order_items AS oi ON oi.order_id = o.order_id\n  WHERE o.status = 'completed'\n  GROUP BY o.order_id, o.customer_id\n)\nSELECT c.name, COUNT(*) AS n_orders,\n       SUM(t.order_total) AS revenue,\n       ROUND(AVG(t.order_total), 2) AS avg_order_value\nFROM order_totals AS t\nJOIN customers AS c ON c.customer_id = t.customer_id\nGROUP BY c.customer_id, c.name\nHAVING SUM(t.order_total) > 300\nORDER BY revenue DESC;",
   "head": [
    "name",
    "n_orders",
    "revenue",
    "avg_order_value"
   ],
   "rows": [
    [
     "Dunmore Grocers",
     "2",
     "421",
     "210.5"
    ],
    [
     "Bluefin Cafe",
     "3",
     "418",
     "139.33"
    ],
    [
     "Arden Bakery",
     "3",
     "369",
     "123"
    ]
   ],
   "tables": [
    "orders",
    "order_items",
    "customers"
   ]
  },
  {
   "n": 9,
   "level": "Hard",
   "skill": "Top item per group with a window function",
   "q": "For each category, find the product with the highest completed revenue. If two products tie, show both.",
   "hint": "Compute revenue per product in a CTE, then RANK() OVER (PARTITION BY category ORDER BY revenue DESC) and keep rank 1. RANK keeps ties, ROW_NUMBER would not.",
   "sql": "WITH product_rev AS (\n  SELECT p.category, p.name,\n         SUM(oi.quantity * oi.unit_price) AS revenue\n  FROM order_items AS oi\n  JOIN orders   AS o ON o.order_id = oi.order_id AND o.status = 'completed'\n  JOIN products AS p ON p.product_id = oi.product_id\n  GROUP BY p.product_id, p.category, p.name\n), ranked AS (\n  SELECT *, RANK() OVER (PARTITION BY category ORDER BY revenue DESC) AS rnk\n  FROM product_rev\n)\nSELECT category, name, revenue\nFROM ranked\nWHERE rnk = 1\nORDER BY category;",
   "head": [
    "category",
    "name",
    "revenue"
   ],
   "rows": [
    [
     "Baking",
     "Flour 25kg",
     "595"
    ],
    [
     "Beverages",
     "Coffee beans 1kg",
     "306"
    ],
    [
     "Packaging",
     "Paper cups x500",
     "280"
    ]
   ],
   "tables": [
    "order_items",
    "orders",
    "products"
   ]
  }
 ]
};
  var SQLB_COLS = {
    customers: "customers(customer_id, name, region, signup_date)   -- region may be NULL",
    products: "products(product_id, name, category, list_price)",
    orders: "orders(order_id, customer_id, order_date, status)   -- status: completed | cancelled",
    order_items: "order_items(order_id, product_id, quantity, unit_price)   -- unit_price = price charged"
  };
  function renderSqlbank(host) {
    var marks = SQLB.ex.map(function () { return null; });
    var answers = SQLB.ex.map(function () { return ""; });
    var shown = SQLB.ex.map(function () { return { hint: false, sol: false }; });
    var cur = 0;
    var tabs = h("div", { class: "wg-sqlb-tabs", role: "group", "aria-label": "Choose exercise" });
    var card = h("div", { class: "wg-sqlb-card" });
    var tally = h("p", { class: "wg-sqlb-tally", "aria-live": "polite" });
    var mean = meaning();

    function drawTabs() {
      clear(tabs);
      SQLB.ex.forEach(function (e, i) {
        var m = marks[i];
        tabs.appendChild(h("button", { type: "button", class: "wg-w6-btn wg-sqlb-tab" + (i === cur ? " wg-w6-primary" : ""), "aria-pressed": i === cur ? "true" : "false",
          onclick: function () { cur = i; drawTabs(); drawCard(); } },
          "Ex " + e.n + (m === "got" ? " ✓" : m === "not" ? " …" : "")));
      });
      var g = marks.filter(function (x) { return x === "got"; }).length, nt = marks.filter(function (x) { return x === "not"; }).length;
      tally.textContent = "Tally: got it " + g + " · not yet " + nt + " · unmarked " + (marks.length - g - nt) + " (of " + marks.length + ")";
      if (g === marks.length) mean.set("All six marked as got it. Try exercises 5, 8 and 10 in the lesson next, running each in SQLite.");
      else if (g + nt === 0) mean.set("Write your query first, then reveal the solution and compare its result with what your query returns in SQLite. Mark honestly.");
      else mean.set("You have " + g + " of " + marks.length + " solid" + (nt ? "; come back to the " + nt + " marked not yet tomorrow and write them from scratch." : ". Keep going."));
    }
    function drawCard() {
      var e = SQLB.ex[cur], i = cur;
      clear(card);
      var ta = h("textarea", { class: "wg-w6-in wg-sqlb-ta", rows: "7", spellcheck: "false", placeholder: "SELECT ..." });
      ta.value = answers[i];
      ta.addEventListener("input", function () { answers[i] = ta.value; });
      var hintEl = h("p", { class: "wg-sqlb-hint", hidden: !shown[i].hint }, h("strong", null, "Hint: "), e.hint);
      var solEl = h("div", { class: "wg-sqlb-sol", hidden: !shown[i].sol },
        h("div", { class: "wg-w6-sub" }, "Solution (tested in SQLite)"),
        h("pre", { class: "wg-w6-pre" }, e.sql),
        h("div", { class: "wg-w6-sub" }, "Expected result (" + e.rows.length + " row" + (e.rows.length === 1 ? "" : "s") + ")"),
        table(e.head, e.rows));
      var hb = btn(shown[i].hint ? "Hide hint" : "Show hint", function () { shown[i].hint = hintEl.hidden; hintEl.hidden = !hintEl.hidden; hb.textContent = hintEl.hidden ? "Show hint" : "Hide hint"; });
      var sb = btn(shown[i].sol ? "Hide solution" : "Reveal solution and expected result", function () { shown[i].sol = solEl.hidden; solEl.hidden = !solEl.hidden; sb.textContent = solEl.hidden ? "Reveal solution and expected result" : "Hide solution"; });
      function mark(v) { marks[i] = marks[i] === v ? null : v; drawTabs(); drawCard(); }
      card.appendChild(h("div", { class: "wg-sqlb-meta" }, "Exercise " + e.n + " · " + e.level + " · " + e.skill));
      card.appendChild(h("p", { class: "wg-sqlb-q" }, e.q));
      card.appendChild(h("div", null, h("div", { class: "wg-w6-sub" }, "Tables you need"),
        h("pre", { class: "wg-w6-pre wg-sqlb-cols" }, e.tables.map(function (t) { return SQLB_COLS[t]; }).join("\n"))));
      card.appendChild(field("Your answer (SQL)", ta));
      card.appendChild(h("div", { class: "wg-w6-row" }, hb, sb));
      card.appendChild(hintEl);
      card.appendChild(solEl);
      card.appendChild(h("div", { class: "wg-w6-row wg-sqlb-mark", role: "group", "aria-label": "Mark yourself" },
        h("span", { class: "wg-w6-sub" }, "Mark yourself:"),
        h("button", { type: "button", class: "wg-w6-btn" + (marks[i] === "got" ? " wg-w6-primary" : ""), "aria-pressed": marks[i] === "got" ? "true" : "false", onclick: function () { mark("got"); } }, "Got it"),
        h("button", { type: "button", class: "wg-w6-btn" + (marks[i] === "not" ? " wg-w6-primary" : ""), "aria-pressed": marks[i] === "not" ? "true" : "false", onclick: function () { mark("not"); } }, "Not yet")));
    }

    var setup = h("details", { class: "wg-sqlb-setup" },
      h("summary", null, "Full schema and data (save as schema.sql)"),
      h("pre", { class: "wg-w6-pre" }, SQLB.schema),
      h("pre", { class: "wg-w6-pre" }, "# Run it with Python's built-in sqlite3:\nimport sqlite3\ncon = sqlite3.connect(':memory:')\ncon.executescript(open('schema.sql').read())\nfor row in con.execute('''PASTE YOUR QUERY HERE'''):\n    print(row)\n\n# or in a terminal:  sqlite3  then  .read schema.sql"));
    host.appendChild(h("div", { class: "wg-w6-box" },
      h("p", { class: "wg-sqlb-warn" }, h("strong", null, "This page does not run SQL. "), "Write your answer here, then run it in SQLite (it ships with Python) using the schema below, and compare with the expected result."),
      tabs, card, tally, mean.el, setup));
    drawTabs(); drawCard();
  }

  Object.assign(WIDGETS, {
    git: { title: "Commit graph playground", intro: "Commit, branch, checkout, merge and reset, and watch the graph redraw. Notice that branches and HEAD are just labels pointing at commits.", render: renderGit },
    terminal: { title: "Practice shell", intro: "Type real shell commands into a pretend computer and complete the six missions. Notice how the prompt changes as you move between folders.", render: renderTerminal },
    planner: { title: "Query plan explorer", intro: "Tick indexes and switch queries to see which plan the planner picks and why. Notice that an index does not always win.", render: renderPlanner },
    acid: { title: "Isolation level stepper", intro: "Pick an anomaly and an isolation level, then step through two transactions side by side. Notice which levels stop which problems.", render: renderAcid },
    sqlbank: { title: "SQL practice cards", intro: "Six exercises on the practice schema. Write your query, check the hint if stuck, reveal the solution and expected result, and mark yourself honestly.", render: renderSqlbank }
  });
})();
WIDGET_CSS += `
.wg-w6-box { display:flex; flex-direction:column; gap:12px; font-family:var(--body); color:var(--ink); min-width:0; }
.wg-w6-row { display:flex; flex-wrap:wrap; gap:8px; align-items:flex-end; }
.wg-w6-field { display:flex; flex-direction:column; gap:4px; flex:none; min-width:0; }
.wg-w6-row > .wg-w6-field { flex:1 1 180px; }
.wg-w6-field label, .wg-w6-sub { font-size:13px; color:var(--muted); }
.wg-w6-sub { margin-bottom:4px; }
.wg-w6-in { font:inherit; font-size:14px; padding:6px 8px; border:1px solid var(--line-strong); border-radius:6px; background:var(--bg); color:var(--ink); width:100%; box-sizing:border-box; min-width:0; }
.wg-w6-in:focus-visible, .wg-w6-btn:focus-visible { outline:2px solid var(--accent); outline-offset:1px; }
.wg-w6-btn { font:inherit; font-size:14px; padding:6px 12px; border:1px solid var(--line-strong); border-radius:6px; background:var(--surface); color:var(--ink); cursor:pointer; }
.wg-w6-btn:hover:not(:disabled) { border-color:var(--accent); }
.wg-w6-btn:disabled { color:var(--muted); border-style:dashed; opacity:1; cursor:default; }
.wg-w6-primary { background:var(--accent); color:var(--accent-ink); border-color:var(--accent); }
.wg-w6-mean { background:var(--accent-soft); border-left:3px solid var(--accent); padding:8px 12px; border-radius:4px; margin:0; font-size:14px; line-height:1.5; color:var(--ink); }
.wg-w6-pre { font-family:var(--mono); font-size:12.5px; line-height:1.5; background:var(--code-bg); color:var(--ink); padding:10px 12px; border-radius:6px; margin:0; overflow-x:auto; white-space:pre; max-width:100%; box-sizing:border-box; }
.wg-w6-note { color:var(--muted); font-size:13px; margin:0; line-height:1.5; }
.wg-w6-tablewrap { overflow-x:auto; max-width:100%; }
.wg-w6-table { border-collapse:collapse; font-size:13px; width:100%; }
.wg-w6-table th, .wg-w6-table td { border:1px solid var(--line); padding:4px 8px; text-align:left; font-family:var(--mono); white-space:nowrap; }
.wg-w6-table thead th { white-space:normal; background:var(--surface); color:var(--muted); font-family:var(--body); font-weight:600; }
.wg-w6-vh { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); }
.wg-git-svgwrap { overflow-x:auto; border:1px solid var(--line); border-radius:6px; background:var(--surface); }
.wg-git-svg { display:block; width:100%; height:auto; }
.wg-git-log { max-height:160px; overflow-y:auto; }
.wg-git-status { margin:0; font-size:13px; min-height:0; }
.wg-git-status:empty { display:none; }
.wg-git-err { background:var(--hl); padding:4px 8px; border-radius:4px; }
.wg-term-grid { display:grid; grid-template-columns:minmax(0,3fr) minmax(0,2fr); gap:14px; }
@media (max-width:640px) { .wg-term-grid { grid-template-columns:minmax(0,1fr); } }
.wg-term-shell { display:flex; flex-direction:column; gap:8px; min-width:0; }
.wg-term-out { font-family:var(--mono); font-size:12.5px; line-height:1.5; background:var(--code-bg); border:1px solid var(--line); border-radius:6px; padding:8px 10px; height:260px; overflow-y:auto; }
.wg-term-line { white-space:pre-wrap; word-break:break-word; }
.wg-term-cmd { color:var(--accent); }
.wg-term-err { background:var(--hl); }
.wg-term-muted { color:var(--muted); }
.wg-term-form { display:flex; flex-direction:column; gap:4px; }
.wg-term-inrow { display:flex; gap:6px; align-items:center; flex-wrap:wrap; }
.wg-term-prompt { font-family:var(--mono); font-size:12px; color:var(--muted); flex:1 1 100%; }
.wg-term-in { font-family:var(--mono); flex:1 1 150px; width:auto; }
.wg-term-missions { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:6px; font-size:14px; }
.wg-term-missions li { display:flex; gap:8px; align-items:flex-start; line-height:1.4; }
.wg-term-tick { font-weight:700; color:var(--muted); width:1em; flex:none; }
.wg-term-done .wg-term-tick { color:var(--accent); }
.wg-term-done { color:var(--muted); }
.wg-term-try { color:var(--muted); font-size:12.5px; }
.wg-term-try code { font-family:var(--mono); background:var(--code-bg); padding:0 4px; border-radius:3px; }
.wg-plan-grid { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:14px; }
@media (max-width:640px) { .wg-plan-grid { grid-template-columns:minmax(0,1fr); } }
.wg-plan-grid > div { display:flex; flex-direction:column; gap:8px; min-width:0; }
.wg-plan-fs { border:1px solid var(--line); border-radius:6px; padding:8px 12px; margin:0; display:flex; flex-direction:column; gap:6px; min-width:0; }
.wg-plan-fs legend { font-size:13px; color:var(--muted); padding:0 4px; }
.wg-plan-cb { display:flex; gap:8px; align-items:flex-start; font-size:14px; }
.wg-plan-cb input { margin-top:3px; accent-color:var(--accent); }
.wg-plan-cb code { font-family:var(--mono); font-size:12px; color:var(--muted); word-break:break-all; }
.wg-plan-explain { border-left:3px solid var(--accent); }
.wg-plan-cands { display:flex; flex-direction:column; gap:8px; }
.wg-plan-cname { font-size:13px; }
.wg-plan-best .wg-plan-cname { font-weight:700; }
.wg-plan-barrow { display:flex; align-items:center; gap:8px; }
.wg-plan-bar { height:12px; background:var(--line-strong); border-radius:3px; flex:none; max-width:calc(100% - 80px); }
.wg-plan-best .wg-plan-bar { background:var(--accent); }
.wg-plan-cost { font-family:var(--mono); font-size:12px; color:var(--muted); white-space:nowrap; }
.wg-plan-unusable .wg-plan-cname { color:var(--muted); font-style:italic; }
.wg-plan-why { margin:0; font-size:14px; line-height:1.5; }
.wg-acid-ctrl { align-items:center; }
.wg-acid-tl { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:6px 10px; }
.wg-acid-th { font-weight:700; font-size:14px; border-bottom:2px solid var(--line-strong); padding-bottom:4px; }
.wg-acid-cell { border:1px solid var(--line); border-radius:6px; padding:6px 8px; background:var(--surface); min-width:0; }
.wg-acid-future { border-style:dashed; color:var(--muted); }
.wg-acid-future .wg-acid-sql { color:var(--muted); }
.wg-acid-cur { border-color:var(--accent); box-shadow:0 0 0 1px var(--accent); }
.wg-acid-num { font-size:12px; color:var(--muted); }
.wg-acid-sql { font-family:var(--mono); font-size:12px; margin:2px 0; white-space:pre-wrap; word-break:break-word; }
.wg-acid-res { font-family:var(--mono); font-size:12px; color:var(--accent); font-weight:600; word-break:break-word; }
.wg-acid-hlrow td { background:var(--hl); }
.wg-acid-verdict { margin:0; padding:8px 12px; border-radius:6px; font-weight:600; font-size:14px; border:1px solid var(--line-strong); }
.wg-acid-yes { background:var(--hl); }
.wg-acid-no { background:var(--surface); }
.wg-acid-matrix td, .wg-acid-matrix th { font-family:var(--body); font-size:12px; white-space:normal; }
.wg-acid-m-yes { background:var(--hl); }
.wg-acid-m-sel { outline:2px solid var(--accent); outline-offset:-2px; font-weight:700; }
.wg-sqlb-warn { margin:0; padding:8px 12px; border:1px dashed var(--line-strong); border-radius:6px; font-size:14px; line-height:1.5; }
.wg-sqlb-tabs { display:flex; flex-wrap:wrap; gap:6px; }
.wg-sqlb-tab { padding:4px 10px; }
.wg-sqlb-card { display:flex; flex-direction:column; gap:10px; border:1px solid var(--line); border-radius:8px; padding:12px; background:var(--surface); min-width:0; }
.wg-sqlb-meta { font-size:12px; text-transform:uppercase; letter-spacing:.04em; color:var(--muted); }
.wg-sqlb-q { margin:0; font-size:15px; line-height:1.5; }
.wg-sqlb-ta { font-family:var(--mono); font-size:13px; resize:vertical; }
.wg-sqlb-hint { margin:0; font-size:14px; line-height:1.5; background:var(--accent-soft); padding:8px 10px; border-radius:4px; }
.wg-sqlb-sol { display:flex; flex-direction:column; gap:6px; }
.wg-sqlb-sol[hidden], .wg-sqlb-hint[hidden] { display:none; }
.wg-sqlb-mark { align-items:center; }
.wg-sqlb-tally { margin:0; font-weight:600; font-size:14px; }
.wg-sqlb-cols { white-space:pre-wrap; word-break:break-word; }
.wg-sqlb-setup summary { cursor:pointer; font-size:14px; color:var(--accent); }
.wg-sqlb-setup pre { margin-top:8px; }
`;
