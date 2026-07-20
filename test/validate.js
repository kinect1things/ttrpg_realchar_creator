// Data-integrity checks for the question bank, rules tables, and systems.
// Run with: node test/validate.js
// The app files are plain browser scripts, so we evaluate them in a VM
// sandbox and assert over the globals they define.

"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const ctx = vm.createContext({});
for (const file of ["js/version.js", "js/data.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), ctx, { filename: file });
}

let failures = 0;
function check(cond, msg) {
  if (!cond) {
    failures++;
    console.error("FAIL: " + msg);
  }
}

// Top-level const/let in a VM script bind to the context's lexical scope,
// not the sandbox object, so pull them out with an in-context expression.
const {
  APP_VERSION, ABILITIES, ABILITY_NAMES, ABILITY_CAP, QUESTIONS, ARCHETYPES,
  ALIGNMENT_NAMES, FEATS, FALLBACK_FEAT, SYSTEMS,
  STR_TABLE_2E, DEX_TABLE_2E, CON_TABLE_2E,
} = vm.runInContext(
  "({ APP_VERSION, ABILITIES, ABILITY_NAMES, ABILITY_CAP, QUESTIONS, ARCHETYPES, " +
  "ALIGNMENT_NAMES, FEATS, FALLBACK_FEAT, SYSTEMS, " +
  "STR_TABLE_2E, DEX_TABLE_2E, CON_TABLE_2E })",
  ctx
);

// ----- version -----
check(/^\d+\.\d+\.\d+$/.test(APP_VERSION), `APP_VERSION "${APP_VERSION}" is not semver`);

// ----- abilities & questions -----
check(ABILITIES.length === 6, "expected 6 abilities");
for (const ab of ABILITIES) {
  check(ABILITY_NAMES[ab], `missing display name for ability ${ab}`);
  const qs = QUESTIONS.filter((q) => q.type === "ability" && q.ability === ab);
  check(qs.length >= 2, `ability ${ab} has ${qs.length} question(s); need >= 2`);
}

const ids = new Set();
for (const q of QUESTIONS) {
  check(!ids.has(q.id), `duplicate question id ${q.id}`);
  ids.add(q.id);
  check(q.text && q.options && q.options.length >= 2, `question ${q.id} malformed`);
  if (q.type === "ability") {
    for (const o of q.options) {
      check(
        Number.isInteger(o.score) && o.score >= 3 && o.score <= 18,
        `question ${q.id} option "${o.label}" score ${o.score} outside 3-18`
      );
    }
  }
  if (q.type === "class") {
    for (const o of q.options) {
      for (const arch of Object.keys(o.votes)) {
        check(ARCHETYPES[arch], `question ${q.id} votes for unknown archetype "${arch}"`);
      }
    }
  }
  if (q.type === "alignment") {
    const valid = q.axis === "law" ? ["L", "N", "C"] : ["G", "N", "E"];
    check(["law", "good"].includes(q.axis), `alignment question ${q.id} has bad axis`);
    for (const o of q.options) {
      check(valid.includes(o.value), `alignment ${q.id} option value "${o.value}" invalid`);
    }
  }
}
check(QUESTIONS.some((q) => q.type === "skills"), "no skills question");
check(
  QUESTIONS.filter((q) => q.type === "alignment").length === 2,
  "need exactly 2 alignment questions (law + good axes)"
);

// ----- 2e tables must cover 3..18 with no gaps or overlaps -----
for (const [name, table] of [
  ["STR_TABLE_2E", STR_TABLE_2E],
  ["DEX_TABLE_2E", DEX_TABLE_2E],
  ["CON_TABLE_2E", CON_TABLE_2E],
]) {
  for (let s = 3; s <= 18; s++) {
    const rows = table.filter((r) => s >= r.min && s <= r.max);
    check(rows.length === 1, `${name}: score ${s} matched by ${rows.length} rows`);
  }
}

// Max press must be monotonically non-decreasing with strength.
for (let s = 4; s <= 18; s++) {
  const prev = STR_TABLE_2E.find((r) => s - 1 >= r.min && s - 1 <= r.max);
  const cur = STR_TABLE_2E.find((r) => s >= r.min && s <= r.max);
  check(cur.press >= prev.press, `max press decreases from Str ${s - 1} to ${s}`);
}

// ----- archetypes & systems -----
for (const [arch, def] of Object.entries(ARCHETYPES)) {
  check(ABILITIES.includes(def.key), `archetype ${arch} key ability ${def.key} invalid`);
}

const cornerCases = [3, 10, 18].map((n) =>
  Object.fromEntries(ABILITIES.map((ab) => [ab, n]))
);
for (const [sysId, sys] of Object.entries(SYSTEMS)) {
  check(sys.name && sys.short && sys.blurb, `system ${sysId} missing metadata`);
  for (const arch of Object.keys(ARCHETYPES)) {
    check(sys.classes[arch], `system ${sysId} has no class name for archetype ${arch}`);
    for (const abilities of cornerCases) {
      let d;
      try {
        d = sys.derive(abilities, arch);
      } catch (e) {
        check(false, `${sysId}.derive(${abilities.str}s, ${arch}) threw: ${e.message}`);
        continue;
      }
      check(Number.isInteger(d.hp) && d.hp >= 1, `${sysId}/${arch} hp=${d.hp} at all-${abilities.str}s`);
      check(Number.isInteger(d.ac), `${sysId}/${arch} ac=${d.ac} not an integer`);
      check(Array.isArray(d.extras) && d.extras.length > 0, `${sysId}/${arch} has no extras`);
    }
  }
}

// ----- score reachability: the app's promises must be mathematically true -----
// House rule: no real human gets an 18 — the cap, not weak questions, must be
// what stops you. All-max answers must clear the cap (so top rungs matter and
// the "quiz didn't believe you" note actually fires), and the cap must be 17.
check(ABILITY_CAP === 17, `ABILITY_CAP is ${ABILITY_CAP}, expected 17`);
for (const ab of ABILITIES) {
  const qs = QUESTIONS.filter((q) => q.type === "ability" && q.ability === ab);
  const maxAvg = qs.reduce((s, q) => s + Math.max(...q.options.map((o) => o.score)), 0) / qs.length;
  check(
    Math.round(maxAvg) >= ABILITY_CAP,
    `ability ${ab}: all-max answers average ${maxAvg.toFixed(2)} — the cap never binds; a ${ABILITY_CAP} is unreachable`
  );
  const minAvg = qs.reduce((s, q) => s + Math.min(...q.options.map((o) => o.score)), 0) / qs.length;
  check(
    Math.round(minAvg) <= 6,
    `ability ${ab}: all-min answers average ${minAvg.toFixed(2)} — low-stat feats are unreachable`
  );
}

// ----- feats -----
const featNames = new Set();
for (const f of FEATS) {
  check(f.name && f.desc && typeof f.when === "function", `feat ${f.name || "?"} malformed`);
  check(!featNames.has(f.name), `duplicate feat name ${f.name}`);
  featNames.add(f.name);
}
check(FALLBACK_FEAT.name && FALLBACK_FEAT.desc, "fallback feat malformed");
// The founding feat must fire for an all-average-or-below character.
check(
  FEATS.some((f) => f.name === "Pity Able" && f.when(Object.fromEntries(ABILITIES.map((a) => [a, 8])))),
  "Pity Able must trigger when every ability is <= 10"
);

// ----- result -----
if (failures) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log(`All data-integrity checks passed (v${APP_VERSION}).`);
