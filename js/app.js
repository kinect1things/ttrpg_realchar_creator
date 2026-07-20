// ---------------------------------------------------------------------------
// Quiz flow and character sheet rendering. No frameworks, no build step —
// this runs straight off GitHub Pages.
// ---------------------------------------------------------------------------

(function () {
  "use strict";

  const app = document.getElementById("app");

  const state = {
    name: "",
    system: "dnd5e",
    step: -1, // -1 = start screen, 0..N-1 = questions, N = results
    answers: {}, // questionId -> option index, or array of indices for multi
    otherSkills: "",
  };

  // ------------------------------------------------------------------
  // Character computation
  // ------------------------------------------------------------------

  function computeCharacter() {
    // Abilities: rounded average of each ability's answered questions,
    // capped at ABILITY_CAP — no real human gets an 18.
    const abilities = {};
    let capped = false;
    for (const ab of ABILITIES) {
      const scores = QUESTIONS.filter((q) => q.type === "ability" && q.ability === ab)
        .map((q) => (state.answers[q.id] != null ? q.options[state.answers[q.id]].score : null))
        .filter((s) => s != null);
      const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 10;
      const raw = Math.max(3, Math.round(avg));
      if (raw > ABILITY_CAP) capped = true;
      abilities[ab] = Math.min(ABILITY_CAP, raw);
    }

    // Class: tally votes, break ties by the archetype's key ability.
    const votes = {};
    for (const q of QUESTIONS.filter((q) => q.type === "class")) {
      const idx = state.answers[q.id];
      if (idx == null) continue;
      for (const [arch, n] of Object.entries(q.options[idx].votes)) {
        votes[arch] = (votes[arch] || 0) + n;
      }
    }
    const archetype = Object.keys(ARCHETYPES).sort((a, b) => {
      const dv = (votes[b] || 0) - (votes[a] || 0);
      if (dv) return dv;
      return abilities[ARCHETYPES[b].key] - abilities[ARCHETYPES[a].key];
    })[0];

    // Alignment
    let law = "N", good = "N";
    for (const q of QUESTIONS.filter((q) => q.type === "alignment")) {
      const idx = state.answers[q.id];
      if (idx == null) continue;
      if (q.axis === "law") law = q.options[idx].value;
      else good = q.options[idx].value;
    }
    const trueNeutral = law === "N" && good === "N";
    const alignment = trueNeutral
      ? "True Neutral"
      : ALIGNMENT_NAMES[law] + " " + ALIGNMENT_NAMES[good];
    const alignShort = trueNeutral ? "TN" : law + good;

    // Skills
    const skillsQ = QUESTIONS.find((q) => q.type === "skills");
    const picked = (state.answers[skillsQ.id] || []).map((i) => {
      const label = skillsQ.options[i].label;
      return label === "Collecting things of no measurable worth"
        ? "Skill of no measurable worth"
        : label;
    });
    const extra = state.otherSkills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    let skills = picked.concat(extra);
    if (!skills.length) skills = ["Skill of no measurable worth ×3"];

    // Feats
    let feats = FEATS.filter((f) => f.when(abilities)).slice(0, 3);
    if (!feats.length) feats = [FALLBACK_FEAT];

    return { abilities, archetype, alignment, alignShort, skills, feats, capped };
  }

  // ------------------------------------------------------------------
  // Rendering helpers
  // ------------------------------------------------------------------

  // Escapes for BOTH element and attribute context — user input lands in
  // value="..." attributes, so quotes must be encoded too.
  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function render() {
    if (state.step === -1) renderStart();
    else if (state.step >= QUESTIONS.length) renderResults();
    else renderQuestion(QUESTIONS[state.step]);
    window.scrollTo(0, 0);
  }

  // ------------------------------------------------------------------
  // Start screen
  // ------------------------------------------------------------------

  function renderStart() {
    app.innerHTML = `
      <div class="card start">
        <h1 class="title">Real Character Creator</h1>
        <p class="tagline">What would your <em>real-life</em> stats be?<br>
        10 is human average. 18 is genius or Olympian. Answer honestly — the dice already know.</p>

        <label class="field-label" for="name-input">Character name (that's you)</label>
        <input id="name-input" type="text" maxlength="40" placeholder="Your name, hero"
               value="${esc(state.name)}" autocomplete="off">

        <p class="field-label">Choose your system</p>
        <div class="system-grid">
          ${Object.entries(SYSTEMS)
            .map(
              ([id, sys]) => `
            <button class="system-card ${state.system === id ? "selected" : ""}" data-system="${id}">
              <span class="system-name">${sys.name}</span>
              <span class="system-blurb">${sys.blurb}</span>
            </button>`
            )
            .join("")}
        </div>

        <button id="start-btn" class="primary">Roll for Reality</button>
        <p class="fine-print">18 questions · ~2 minutes · capped at 17 — no real human gets an 18</p>
      </div>`;

    app.querySelectorAll(".system-card").forEach((btn) =>
      btn.addEventListener("click", () => {
        state.system = btn.dataset.system;
        state.name = document.getElementById("name-input").value;
        renderStart();
      })
    );
    document.getElementById("start-btn").addEventListener("click", () => {
      state.name = document.getElementById("name-input").value.trim();
      state.step = 0;
      render();
    });
  }

  // ------------------------------------------------------------------
  // Question screens
  // ------------------------------------------------------------------

  function renderQuestion(q) {
    const n = state.step + 1;
    const total = QUESTIONS.length;
    const pct = Math.round((n / total) * 100);
    const multi = !!q.multi;
    const current = state.answers[q.id];

    app.innerHTML = `
      <div class="card">
        <div class="progress"><div class="progress-bar"></div></div>
        <p class="q-count">Question ${n} of ${total}</p>
        <h2 class="q-text">${esc(q.text)}</h2>
        ${q.note ? `<p class="q-note">${esc(q.note)}</p>` : ""}
        <div class="options">
          ${q.options
            .map((opt, i) => {
              const sel = multi
                ? Array.isArray(current) && current.includes(i)
                : current === i;
              return `<button class="option ${sel ? "selected" : ""}" data-i="${i}">
                ${multi ? `<span class="checkbox">${sel ? "✕" : ""}</span>` : ""}${esc(opt.label)}
              </button>`;
            })
            .join("")}
        </div>
        ${
          multi
            ? `<input id="other-input" type="text" class="other-input"
                 placeholder="${esc(q.otherPlaceholder || "Other")}" value="${esc(state.otherSkills)}">`
            : ""
        }
        <div class="nav">
          <button id="back-btn" class="ghost">← Back</button>
          ${multi ? `<button id="next-btn" class="primary">Continue →</button>` : ""}
        </div>
      </div>`;

    // Width set via CSSOM, not a style attribute — the CSP (style-src 'self')
    // blocks inline style attributes but allows script-driven styling.
    app.querySelector(".progress-bar").style.width = pct + "%";

    app.querySelectorAll(".option").forEach((btn) =>
      btn.addEventListener("click", () => {
        const i = Number(btn.dataset.i);
        if (multi) {
          const cur = Array.isArray(state.answers[q.id]) ? state.answers[q.id] : [];
          state.answers[q.id] = cur.includes(i) ? cur.filter((x) => x !== i) : cur.concat(i);
          renderQuestion(q);
        } else {
          state.answers[q.id] = i;
          state.step++;
          render();
        }
      })
    );

    document.getElementById("back-btn").addEventListener("click", () => {
      if (multi) state.otherSkills = document.getElementById("other-input").value;
      state.step--;
      render();
    });

    if (multi) {
      document.getElementById("next-btn").addEventListener("click", () => {
        state.otherSkills = document.getElementById("other-input").value;
        if (!Array.isArray(state.answers[q.id])) state.answers[q.id] = [];
        state.step++;
        render();
      });
    }
  }

  // ------------------------------------------------------------------
  // Results
  // ------------------------------------------------------------------

  function renderResults() {
    const c = computeCharacter();
    const sys = SYSTEMS[state.system];
    const derived = sys.derive(c.abilities, c.archetype);
    const name = state.name || "Nameless Commoner";
    const className = sys.classes[c.archetype];

    const abilityRows = ABILITIES.map((ab) => {
      const score = c.abilities[ab];
      const mod = derived.mods ? `<span class="mod">${derived.mods[ab]}</span>` : "";
      return `
        <div class="stat">
          <span class="stat-name">${ABILITY_NAMES[ab]}</span>
          <span class="stat-score">${score}</span>
          ${mod}
        </div>`;
    }).join("");

    app.innerHTML = `
      <div class="card results">
        <div class="sheet" id="sheet">
          <div class="sheet-header">
            <h2 class="char-name">${esc(name)}</h2>
            <p class="char-sub">Level 1 ${esc(className)} · ${esc(c.alignment)} · ${esc(sys.name)}</p>
          </div>

          <div class="combat-row">
            <div class="combat-box"><span class="combat-num">${derived.hp}</span><span class="combat-label">HP<small> (${esc(derived.hpNote || "")})</small></span></div>
            <div class="combat-box"><span class="combat-num">${derived.ac}</span><span class="combat-label">AC<small> (${esc(derived.acNote)})</small></span></div>
          </div>

          <div class="stat-grid">${abilityRows}</div>
          ${c.capped ? `<p class="sheet-note cap-note">* An 18 was on the table. The quiz didn't believe you. No real human gets an 18.</p>` : ""}

          <div class="sheet-section">
            <h3>Details</h3>
            <table class="extras">
              ${derived.extras.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(String(v))}</td></tr>`).join("")}
            </table>
          </div>

          <div class="sheet-section">
            <h3>Skills</h3>
            <p>${c.skills.map(esc).join(", ")}</p>
            ${sys.skillsNote ? `<p class="sheet-note">${esc(sys.skillsNote)}</p>` : ""}
          </div>

          <div class="sheet-section">
            <h3>Equipment</h3>
            <p>Armor: None &nbsp;·&nbsp; Weapons: ${esc(derived.weapons)}</p>
          </div>

          <div class="sheet-section">
            <h3>${esc(sys.featsTitle || "Feats")}</h3>
            ${c.feats.map((f) => `<p><strong>${esc(f.name)}</strong> — ${esc(f.desc)}</p>`).join("")}
            ${sys.featNote ? `<p class="sheet-note">${esc(sys.featNote)}</p>` : ""}
          </div>
        </div>

        <div class="result-actions">
          <p class="field-label">View this character in:</p>
          <div class="system-switch">
            ${Object.entries(SYSTEMS)
              .map(
                ([id, s]) =>
                  `<button class="chip ${id === state.system ? "selected" : ""}" data-system="${id}">${s.short}</button>`
              )
              .join("")}
          </div>
          <div class="nav">
            <button id="copy-btn" class="primary">Copy for chat</button>
            <button id="link-btn" class="ghost">Copy link</button>
            <button id="print-btn" class="ghost">Print</button>
            <button id="restart-btn" class="ghost">Start over</button>
          </div>
          <p id="copy-done" class="fine-print" hidden></p>
        </div>
      </div>`;

    // Keep a shareable permalink in the URL bar while on the results screen.
    history.replaceState(null, "", "#" + encodeShare());

    app.querySelectorAll(".system-switch .chip").forEach((btn) =>
      btn.addEventListener("click", () => {
        state.system = btn.dataset.system;
        renderResults();
      })
    );
    document.getElementById("copy-btn").addEventListener("click", () => {
      copyText(chatText(c, name), "Copied — go make your friends feel things.");
    });
    document.getElementById("link-btn").addEventListener("click", () => {
      const url = location.origin + location.pathname + "#" + encodeShare();
      copyText(url, "Link copied — anyone who opens it sees this exact sheet.");
    });
    document.getElementById("print-btn").addEventListener("click", () => window.print());
    document.getElementById("restart-btn").addEventListener("click", () => {
      state.step = -1;
      state.answers = {};
      state.otherSkills = "";
      history.replaceState(null, "", location.pathname);
      render();
    });
  }

  // ------------------------------------------------------------------
  // Shareable links: quiz answers packed into the URL hash. All state is
  // client-side; opening a shared link recomputes the sheet locally.
  // ------------------------------------------------------------------

  function encodeShare() {
    const payload = JSON.stringify({
      n: state.name,
      s: state.system,
      a: state.answers,
      o: state.otherSkills,
    });
    return btoa(String.fromCharCode(...new TextEncoder().encode(payload)))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  // Strictly validates untrusted hash data: unknown systems, question ids, or
  // out-of-range option indices are rejected wholesale.
  function decodeShare(hash) {
    try {
      const b64 = hash.replace(/-/g, "+").replace(/_/g, "/");
      const bytes = Uint8Array.from(atob(b64), (ch) => ch.charCodeAt(0));
      const p = JSON.parse(new TextDecoder().decode(bytes));
      if (!SYSTEMS[p.s] || typeof p.a !== "object" || p.a === null) return null;
      const answers = {};
      for (const [id, v] of Object.entries(p.a)) {
        const q = QUESTIONS.find((x) => x.id === id);
        if (!q) return null;
        const okIndex = (i) => Number.isInteger(i) && i >= 0 && i < q.options.length;
        if (q.multi) {
          if (!Array.isArray(v) || !v.every(okIndex)) return null;
        } else if (!okIndex(v)) {
          return null;
        }
        answers[id] = v;
      }
      return {
        name: String(p.n || "").slice(0, 40),
        system: p.s,
        answers,
        otherSkills: String(p.o || "").slice(0, 200),
      };
    } catch (e) {
      return null;
    }
  }

  // Plain-text sheet in the style of the original group-chat post.
  function chatText(c, name) {
    const sys = SYSTEMS[state.system];
    const d = sys.derive(c.abilities, c.archetype);
    const lines = [
      name,
      `Hp: ${d.hp} Ac: ${d.ac} Align: ${c.alignShort}`,
      `Class: ${sys.classes[c.archetype]} (${sys.short})`,
    ];
    for (const ab of ABILITIES) {
      const mod = d.mods ? ` (${d.mods[ab]})` : "";
      lines.push(`${ABILITY_NAMES[ab].slice(0, 3)}: ${c.abilities[ab]}${mod}`);
    }
    if (c.capped) lines.push("(The quiz withheld an 18. No real human gets an 18.)");
    lines.push("Skills:", c.skills.join(", "));
    lines.push("Armor: None", "Weapons: " + d.weapons);
    lines.push("Feats:");
    for (const f of c.feats) lines.push(`${f.name} - ${f.desc}`);
    for (const [k, v] of d.extras) lines.push(`${k}: ${v}`);
    return lines.join("\n");
  }

  function copyText(text, doneMessage) {
    const showToast = (msg) => {
      const done = document.getElementById("copy-done");
      if (!done) return;
      done.textContent = msg;
      done.hidden = false;
      setTimeout(() => (done.hidden = true), 3000);
    };
    const fallback = () => {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      showToast(ok ? doneMessage : "Couldn't copy — select the sheet and copy manually.");
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => showToast(doneMessage), fallback);
    } else {
      fallback();
    }
  }

  const versionEl = document.getElementById("app-version");
  if (versionEl && typeof APP_VERSION !== "undefined") {
    versionEl.textContent = "v" + APP_VERSION;
  }

  // A shared link drops you straight onto that character's sheet.
  const shared = location.hash.length > 1 ? decodeShare(location.hash.slice(1)) : null;
  if (shared) {
    state.name = shared.name;
    state.system = shared.system;
    state.answers = shared.answers;
    state.otherSkills = shared.otherSkills;
    state.step = QUESTIONS.length;
  }

  render();
})();
