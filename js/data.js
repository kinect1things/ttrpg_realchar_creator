// ---------------------------------------------------------------------------
// Question bank, rules tables, and system definitions.
// Ability questions score on the classic 3-18 scale; an ability is the
// rounded average of its questions. 10 is human average, 18 is Olympian.
// ---------------------------------------------------------------------------

const ABILITIES = ["str", "dex", "con", "int", "wis", "cha"];

const ABILITY_NAMES = {
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  wis: "Wisdom",
  cha: "Charisma",
};

// AD&D 2e PHB Table 1: Strength (the "max press" table).
// min/max = score range the row covers.
const STR_TABLE_2E = [
  { min: 3,  max: 3,  hit: -3, dmg: -1, allow: 5,   press: 10,  doors: 2,  bars: 0 },
  { min: 4,  max: 5,  hit: -2, dmg: -1, allow: 10,  press: 25,  doors: 3,  bars: 0 },
  { min: 6,  max: 7,  hit: -1, dmg: 0,  allow: 20,  press: 55,  doors: 4,  bars: 0 },
  { min: 8,  max: 9,  hit: 0,  dmg: 0,  allow: 35,  press: 90,  doors: 5,  bars: 1 },
  { min: 10, max: 11, hit: 0,  dmg: 0,  allow: 40,  press: 115, doors: 6,  bars: 2 },
  { min: 12, max: 13, hit: 0,  dmg: 0,  allow: 45,  press: 140, doors: 7,  bars: 4 },
  { min: 14, max: 15, hit: 0,  dmg: 0,  allow: 55,  press: 170, doors: 8,  bars: 7 },
  { min: 16, max: 16, hit: 0,  dmg: 1,  allow: 70,  press: 195, doors: 9,  bars: 10 },
  { min: 17, max: 17, hit: 1,  dmg: 1,  allow: 85,  press: 220, doors: 10, bars: 13 },
  { min: 18, max: 18, hit: 1,  dmg: 2,  allow: 110, press: 255, doors: 11, bars: 16 },
];

// 2e Dexterity: reaction adj, missile adj, defensive adj (descending AC).
const DEX_TABLE_2E = [
  { min: 3,  max: 3,  react: -3, missile: -3, def: 4 },
  { min: 4,  max: 4,  react: -2, missile: -2, def: 3 },
  { min: 5,  max: 5,  react: -1, missile: -1, def: 2 },
  { min: 6,  max: 6,  react: 0,  missile: 0,  def: 1 },
  { min: 7,  max: 14, react: 0,  missile: 0,  def: 0 },
  { min: 15, max: 15, react: 0,  missile: 0,  def: -1 },
  { min: 16, max: 16, react: 1,  missile: 1,  def: -2 },
  { min: 17, max: 17, react: 2,  missile: 2,  def: -3 },
  { min: 18, max: 18, react: 2,  missile: 2,  def: -4 },
];

// 2e Constitution: hp adjustment and system shock survival %.
const CON_TABLE_2E = [
  { min: 3,  max: 3,  hp: -2, shock: 35 },
  { min: 4,  max: 4,  hp: -1, shock: 40 },
  { min: 5,  max: 5,  hp: -1, shock: 45 },
  { min: 6,  max: 6,  hp: -1, shock: 50 },
  { min: 7,  max: 7,  hp: 0,  shock: 55 },
  { min: 8,  max: 8,  hp: 0,  shock: 60 },
  { min: 9,  max: 9,  hp: 0,  shock: 65 },
  { min: 10, max: 10, hp: 0,  shock: 70 },
  { min: 11, max: 11, hp: 0,  shock: 75 },
  { min: 12, max: 12, hp: 0,  shock: 80 },
  { min: 13, max: 13, hp: 0,  shock: 85 },
  { min: 14, max: 14, hp: 0,  shock: 88 },
  { min: 15, max: 15, hp: 1,  shock: 90 },
  { min: 16, max: 16, hp: 2,  shock: 95 },
  { min: 17, max: 17, hp: 2,  hpWarrior: 3, shock: 97 },
  { min: 18, max: 18, hp: 2,  hpWarrior: 4, shock: 99 },
];

function tableRow(table, score) {
  return table.find((r) => score >= r.min && score <= r.max) || table[table.length - 1];
}

// ---------------------------------------------------------------------------
// Questions. type: "ability" | "class" | "skills" | "alignment"
// ---------------------------------------------------------------------------

const QUESTIONS = [
  // ----- Strength -----
  {
    id: "str_press",
    type: "ability",
    ability: "str",
    text: "What's the heaviest thing you could lift over your head, one big push?",
    note: "Be honest. The AD&D 2nd Edition Max Press table is watching.",
    options: [
      { label: "A case of bottled water (~25 lbs)", score: 5 },
      { label: "A bag of concrete (~50 lbs)", score: 7 },
      { label: "A very heavy suitcase (~90 lbs)", score: 9 },
      { label: "Around 115 lbs — a whole other small person, briefly", score: 10 },
      { label: "~140 lbs — a loaded barbell, one determined heave", score: 12 },
      { label: "A full keg (~160 lbs)", score: 14 },
      { label: "200+ lbs — I own a squat rack and use it", score: 16 },
      { label: "255+ lbs — I compete, or should", score: 18 },
    ],
  },
  {
    id: "str_pushups",
    type: "ability",
    ability: "str",
    text: "How many push-ups can you do right now, no training montage?",
    options: [
      { label: "Zero. Next question.", score: 5 },
      { label: "A handful (1–5)", score: 7 },
      { label: "6–15", score: 9 },
      { label: "16–30", score: 11 },
      { label: "31–50", score: 13 },
      { label: "More than 50", score: 15 },
      { label: "More than 50, some of them one-armed, for content", score: 18 },
    ],
  },
  {
    id: "str_groceries",
    type: "ability",
    ability: "str",
    text: "How do the groceries get from the car to the kitchen?",
    options: [
      { label: "Multiple trips, and I resent each one", score: 6 },
      { label: "Two trips, like a reasonable person", score: 9 },
      { label: "One trip, fingers turning purple", score: 12 },
      { label: "One trip, water jugs included. I am the forklift.", score: 15 },
      { label: "One trip, and I bring the neighbor's groceries in too", score: 17 },
    ],
  },

  // ----- Dexterity -----
  {
    id: "dex_catch",
    type: "ability",
    ability: "dex",
    text: "Someone tosses you their keys without warning. What happens?",
    options: [
      { label: "They hit me in the chest and fall", score: 5 },
      { label: "I flinch, then pick them up off the floor", score: 7 },
      { label: "Caught, two hands, slightly panicked", score: 10 },
      { label: "Caught one-handed like it's nothing", score: 13 },
      { label: "Caught without looking up from my phone", score: 16 },
      { label: "Caught behind my back. I've been waiting for this.", score: 18 },
    ],
  },
  {
    id: "dex_balance",
    type: "ability",
    ability: "dex",
    text: "Stand on one foot, eyes closed. How long do you last?",
    options: [
      { label: "I fell over just reading this", score: 5 },
      { label: "A few wobbly seconds", score: 8 },
      { label: "10–20 seconds, no problem", score: 11 },
      { label: "As long as I want — I do yoga / skate / climb", score: 14 },
      { label: "Indefinitely, possibly on a slackline", score: 17 },
    ],
  },

  // ----- Constitution -----
  {
    id: "con_stairs",
    type: "ability",
    ability: "con",
    text: "Four flights of stairs. How do you arrive at the top?",
    options: [
      { label: "I don't. I found the elevator.", score: 5 },
      { label: "Winded, but pretending I'm not", score: 8 },
      { label: "Fine. Slightly warm.", score: 11 },
      { label: "I take stairs two at a time, for fun", score: 14 },
      { label: "I run stairs for cardio, voluntarily", score: 17 },
    ],
  },
  {
    id: "con_sick",
    type: "ability",
    ability: "con",
    text: "How often do you get properly sick?",
    options: [
      { label: "I catch everything. I'm sick right now.", score: 5 },
      { label: "A few times a year", score: 9 },
      { label: "Rarely — one cold a year, maybe", score: 12 },
      { label: "Almost never, and it's over in a day", score: 15 },
      { label: "Illness fears me", score: 18 },
    ],
  },

  // ----- Intelligence -----
  {
    id: "int_rules",
    type: "ability",
    ability: "int",
    text: "A new board game hits the table. Who reads the rules?",
    options: [
      { label: "I move my piece when someone points at me", score: 5 },
      { label: "I wait for someone to just tell me when it's my turn", score: 7 },
      { label: "I skim and figure it out as we go", score: 10 },
      { label: "I've already watched three strategy videos", score: 12 },
      { label: "I read them, I explain them. I am the rules.", score: 15 },
      { label: "I've submitted errata, and been thanked", score: 17 },
    ],
  },
  {
    id: "int_trivia",
    type: "ability",
    ability: "int",
    text: "At trivia night, you are the one who…",
    options: [
      { label: "Is there for the snacks", score: 7 },
      { label: "Gets a few in my specialty", score: 10 },
      { label: "Carries a category or two", score: 13 },
      { label: "Carries most categories, quietly", score: 15 },
      { label: "Is the reason the team got banned", score: 18 },
    ],
  },

  // ----- Wisdom -----
  {
    id: "wis_keys",
    type: "ability",
    ability: "wis",
    text: "How often do you lose your keys, wallet, or phone?",
    options: [
      { label: "They are currently lost, as we speak", score: 5 },
      { label: "It's a weekly ritual", score: 7 },
      { label: "Occasionally, briefly", score: 10 },
      { label: "Never. Everything has a place.", score: 14 },
      { label: "Never, and I know where YOUR keys are too", score: 17 },
    ],
  },
  {
    id: "wis_advice",
    type: "ability",
    ability: "wis",
    text: "When friends have a real problem, do they come to you?",
    options: [
      { label: "No, and frankly they're right not to", score: 6 },
      { label: "Sometimes, mostly to vent", score: 9 },
      { label: "Often — I give solid advice", score: 13 },
      { label: "I am the group's unpaid therapist", score: 15 },
      { label: "Strangers on public transit tell me their life story, then thank me", score: 18 },
    ],
  },

  // ----- Charisma -----
  {
    id: "cha_party",
    type: "ability",
    ability: "cha",
    text: "You're at a party where you know exactly one person, and they just left. You…",
    options: [
      { label: "Also leave. Immediately.", score: 6 },
      { label: "Guard the snack table and check my phone", score: 8 },
      { label: "Talk to whoever ends up next to me at the snack table", score: 10 },
      { label: "Find a conversation and slide in", score: 12 },
      { label: "Know everyone's name by the end of the night", score: 16 },
      { label: "It's my party now. The host is taking notes.", score: 18 },
    ],
  },
  {
    id: "cha_refund",
    type: "ability",
    ability: "cha",
    text: "Could you talk your way into a refund without a receipt?",
    options: [
      { label: "I can't even ask for extra ketchup", score: 6 },
      { label: "I'd try, apologizing the entire time", score: 9 },
      { label: "Usually, politely", score: 12 },
      { label: "I once got the refund AND a coupon", score: 15 },
      { label: "The manager apologized to ME. We're friends now.", score: 17 },
    ],
  },

  // ----- Class -----
  {
    id: "class_job",
    type: "class",
    text: "Your day job — or the thing you actually spend your days doing — is closest to:",
    options: [
      { label: "Building, fixing, or physical work", votes: { fighter: 2 } },
      { label: "Teaching, research, or endless spreadsheets", votes: { wizard: 2 } },
      { label: "Healthcare, caregiving, or keeping people alive", votes: { cleric: 2 } },
      { label: "Art, music, writing, or performing", votes: { bard: 2 } },
      { label: "Sales, negotiation, or convincing people of things", votes: { rogue: 2, bard: 1 } },
      { label: "Computers. It's computers.", votes: { wizard: 2, rogue: 1 } },
      { label: "Outdoors, animals, or anything but a desk", votes: { ranger: 2 } },
    ],
  },
  {
    id: "class_weekend",
    type: "class",
    text: "Given a totally free Saturday, you'd rather:",
    options: [
      { label: "Hit the gym or play a sport", votes: { fighter: 2 } },
      { label: "Fall down a wiki rabbit hole learning something", votes: { wizard: 2 } },
      { label: "Help a friend move, or volunteer", votes: { cleric: 2 } },
      { label: "Make something — music, art, a very serious dinner", votes: { bard: 2 } },
      { label: "Take something apart to see how it works", votes: { rogue: 2, wizard: 1 } },
      { label: "Get outside — hike, fish, touch grass professionally", votes: { ranger: 2 } },
    ],
  },

  // ----- Skills -----
  {
    id: "skills",
    type: "skills",
    multi: true,
    text: "Check everything you actually do:",
    note: "These become your skill list. Choose honestly, or don't — we can't check.",
    options: [
      { label: "Gaming" },
      { label: "Cooking" },
      { label: "Art" },
      { label: "Music" },
      { label: "Teaching" },
      { label: "Sports" },
      { label: "Gardening" },
      { label: "DIY / repair" },
      { label: "Writing" },
      { label: "Fishing / hunting" },
      { label: "Collecting things of no measurable worth" },
    ],
    otherPlaceholder: "Anything else? (comma-separated)",
  },

  // ----- Alignment -----
  {
    id: "align_law",
    type: "alignment",
    axis: "law",
    text: "The sticker says \"WARNING: do not open this panel.\" You…",
    options: [
      { label: "Do not open the panel", value: "L" },
      { label: "Open it if I have a good reason", value: "N" },
      { label: "The panel is already open", value: "C" },
    ],
  },
  {
    id: "align_good",
    type: "alignment",
    axis: "good",
    text: "A cashier accidentally gives you an extra $20 in change. You…",
    options: [
      { label: "Hand it back before they even notice", value: "G" },
      { label: "Depends on the week I'm having, honestly", value: "N" },
      { label: "Consider it a tax on carelessness", value: "E" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Archetypes → per-system class names
// ---------------------------------------------------------------------------

const ARCHETYPES = {
  fighter: { key: "str" },
  wizard:  { key: "int" },
  cleric:  { key: "wis" },
  bard:    { key: "cha" },
  rogue:   { key: "dex" },
  ranger:  { key: "con" },
};

const ALIGNMENT_NAMES = {
  L: "Lawful", N: "Neutral", C: "Chaotic",
  G: "Good", E: "Evil",
};

// ---------------------------------------------------------------------------
// Feats: checked in order, first three matches win. Pity Able is the
// founding feat of this project and always takes precedence.
// ---------------------------------------------------------------------------

const FEATS = [
  {
    name: "Pity Able",
    when: (a) => ABILITIES.every((k) => a[k] <= 10),
    desc: "On a successful Charisma check, the target feels sorry for you and your incompetence in the area.",
  },
  {
    name: "Free Moving Service",
    when: (a) => a.str >= 14,
    desc: "Friends roll with advantage when asking you to help them move.",
  },
  {
    name: "Two-Trip Rule",
    when: (a) => a.str <= 6,
    desc: "You may not carry more than one grocery bag, but you have advantage on Charisma (Performance) checks made to complain about it.",
  },
  {
    name: "Catlike Reflexes",
    when: (a) => a.dex >= 14,
    desc: "Once per day, you may reroll one dropped phone.",
  },
  {
    name: "Butterfingers",
    when: (a) => a.dex <= 6,
    desc: "Any object you hold gains the Thrown property, whether you like it or not.",
  },
  {
    name: "Iron Stomach",
    when: (a) => a.con >= 14,
    desc: "Advantage on saving throws against gas-station sushi and questionable leftovers.",
  },
  {
    name: "Patient Zero",
    when: (a) => a.con <= 6,
    desc: "You automatically catch any cold within 30 feet.",
  },
  {
    name: "Well, Actually",
    when: (a) => a.int >= 14,
    desc: "Once per conversation, interrupt with a correction. It is always accurate. Nobody is happy.",
  },
  {
    name: "Unpaid Therapist",
    when: (a) => a.wis >= 14,
    desc: "Allies within 30 feet may dump their problems on you as a bonus action; the ally gains 1 temporary HP. You sigh.",
  },
  {
    name: "Saw It in a Movie Once",
    when: (a) => a.int <= 6,
    desc: "Once per day, state a confident fact. Roll a d20: on 11 or higher, it is somehow true.",
  },
  {
    name: "Where Are My Keys?",
    when: (a) => a.wis <= 6,
    desc: "Disadvantage on all checks to locate your own belongings.",
  },
  {
    name: "Silver Tongue",
    when: (a) => a.cha >= 14,
    desc: "Once per day, talk your way out of a consequence.",
  },
  {
    name: "Resting Menace",
    when: (a) => a.cha <= 6,
    desc: "Strangers assume you are mad at them. You are not. Probably. Disadvantage on first-impression Charisma checks; advantage on Intimidation against strangers.",
  },
];

const FALLBACK_FEAT = {
  name: "Aggressively Average",
  desc: "Once per day, reroll any d20. The new result is a 10.",
};

// ---------------------------------------------------------------------------
// Systems
// ---------------------------------------------------------------------------

function mod5e(score) {
  return Math.floor((score - 10) / 2);
}

function fmtMod(n) {
  return (n >= 0 ? "+" : "") + n;
}

// AD&D 2e PHB Table 60: level-1 saving throws by class group.
// Order: Paralyzation/Poison/Death, Rod/Staff/Wand, Petrification/Polymorph,
// Breath Weapon, Spell. Roll d20, meet or beat.
const SAVES_2E = {
  fighter: [14, 16, 15, 17, 17], ranger: [14, 16, 15, 17, 17], // warrior group
  wizard:  [14, 11, 13, 15, 12],                                // wizard group
  cleric:  [10, 14, 13, 16, 15],                                // priest group
  rogue:   [13, 14, 12, 16, 15], bard: [13, 14, 12, 16, 15],    // rogue group
};

// AD&D 2e class ability minimums (PHB) — for the class-legality footnote.
const REQS_2E = {
  fighter: { str: 9 },
  ranger:  { str: 13, dex: 13, con: 14, wis: 14 },
  wizard:  { int: 9 },
  cleric:  { wis: 9 },
  rogue:   { dex: 9 },
  bard:    { dex: 12, int: 13, cha: 15 },
};

// PF2e level-1 proficiencies (CRB): T = trained (+3), E = expert (+5).
const PF2E_PROF = { T: 3, E: 5 };
const PF2E_SAVES = { // [Fortitude, Reflex, Will]
  fighter: ["E", "E", "T"], ranger: ["E", "E", "T"], rogue: ["T", "E", "E"],
  bard: ["T", "T", "E"], wizard: ["T", "T", "E"], cleric: ["T", "T", "E"],
};
const PF2E_PERCEPTION = { fighter: "E", ranger: "E", rogue: "E", bard: "E", wizard: "T", cleric: "T" };

const SYSTEMS = {
  dnd5e: {
    name: "D&D 5th Edition",
    short: "D&D 5e",
    blurb: "The one everyone's playing on D&D Beyond.",
    classes: {
      fighter: "Fighter", wizard: "Wizard", cleric: "Cleric",
      bard: "Bard", rogue: "Rogue", ranger: "Ranger",
    },
    hitDie: { fighter: 10, wizard: 6, cleric: 8, bard: 8, rogue: 8, ranger: 10 },
    saveProfs: {
      fighter: ["str", "con"], wizard: ["int", "wis"], cleric: ["wis", "cha"],
      bard: ["dex", "cha"], rogue: ["dex", "int"], ranger: ["str", "dex"],
    },
    skillsNote: "Proficient (+2 + ability mod) when one of these plausibly applies. GM's call.",
    featsTitle: "Feats",
    derive(a, archetype) {
      const con = mod5e(a.con);
      const str = mod5e(a.str);
      const profs = this.saveProfs[archetype];
      const saves = ABILITIES.map((ab) => {
        const p = profs.includes(ab);
        return ABILITY_NAMES[ab].slice(0, 3) + " " + fmtMod(mod5e(a[ab]) + (p ? 2 : 0)) + (p ? "*" : "");
      }).join(", ");
      return {
        mods: Object.fromEntries(ABILITIES.map((k) => [k, fmtMod(mod5e(a[k]))])),
        hp: Math.max(1, this.hitDie[archetype] + con),
        hpNote: "max hit die at level 1",
        ac: 10 + mod5e(a.dex),
        acNote: "unarmored",
        weapons: "Fists (" + Math.max(0, 1 + str) + " bludgeoning, nonlethal" + (1 + str <= 0 ? " — a stern pat" : "") + ")",
        extras: [
          ["Initiative", fmtMod(mod5e(a.dex))],
          ["Unarmed Strike", fmtMod(2 + str) + " to hit, " + Math.max(0, 1 + str) + " bludgeoning" + (1 + str <= 0 ? " (a harmless slap)" : "")],
          ["Proficiency Bonus", "+2"],
          ["Saving Throws", saves + "  (* proficient)"],
          ["Carrying Capacity", (a.str * 15) + " lbs (Str × 15)"],
          ["Speed", "30 ft (25 ft before coffee)"],
        ],
      };
    },
  },

  adnd2e: {
    name: "AD&D 2nd Edition",
    short: "AD&D 2e",
    blurb: "THAC0, descending AC, and the sacred Max Press table.",
    classes: {
      fighter: "Fighter", wizard: "Mage", cleric: "Cleric",
      bard: "Bard", rogue: "Thief", ranger: "Ranger",
    },
    hitDie: { fighter: 10, wizard: 4, cleric: 8, bard: 6, rogue: 6, ranger: 10 },
    skillsNote: "Nonweapon proficiencies: roll d20 equal-or-under the relevant ability.",
    featsTitle: "Special Abilities (self-reported)",
    featNote: "Translation for 2e: advantage/disadvantage = +4/−4; bonus action = free action; a \"save\" = the appropriate saving throw above.",
    derive(a, archetype) {
      const str = tableRow(STR_TABLE_2E, a.str);
      const dex = tableRow(DEX_TABLE_2E, a.dex);
      const con = tableRow(CON_TABLE_2E, a.con);
      const isWarrior = archetype === "fighter" || archetype === "ranger";
      const conHp = isWarrior && con.hpWarrior != null ? con.hpWarrior : con.hp;
      const avgHp = Math.ceil((this.hitDie[archetype] + 1) / 2);
      const sv = SAVES_2E[archetype];
      // Class-legality footnote: 2e classes have ability minimums.
      const unmet = Object.entries(REQS_2E[archetype] || {})
        .filter(([ab, min]) => a[ab] < min)
        .map(([ab, min]) => ABILITY_NAMES[ab].slice(0, 3) + " " + min);
      const legality = unmet.length
        ? "The 2e class police note you need " + unmet.join(", ") + " for this class. You are one anyway. Don't tell them."
        : "You genuinely qualify for this class. The 2e class police salute you.";
      const extras2e = [
          ["THAC0", "20"],
          ["Initiative", "d10, low wins" + (dex.react ? " (Reaction Adj. " + fmtMod(dex.react) + ")" : "")],
          ["Melee Attack Adj.", fmtMod(str.hit) + " to hit, " + fmtMod(str.dmg) + " damage"],
          ["Missile Attack Adj.", fmtMod(dex.missile)],
          ["Max Press", str.press + " lbs"],
          ["Open Doors", str.doors + "-in-20"],
          ["Bend Bars / Lift Gates", str.bars + "%"],
          ["Weight Allowance", str.allow + " lbs"],
          ["System Shock", con.shock + "% (chance to survive being polymorphed)"],
          ["Movement", "12"],
          ["Save vs. Para/Poison/Death", sv[0] + " (d20, meet or beat)"],
          ["Save vs. Rod/Staff/Wand", sv[1]],
          ["Save vs. Petrify/Polymorph", sv[2]],
          ["Save vs. Breath Weapon", sv[3]],
          ["Save vs. Spell", sv[4]],
          ["Class Legality", legality],
      ];
      if (a.str === 18 && isWarrior) {
        extras2e.splice(5, 0, ["Exceptional Strength", "Roll d100 and start bragging"]);
      }
      return {
        mods: null, // 2e has no universal modifier; the tables ARE the character
        hp: Math.max(1, avgHp + conHp),
        hpNote: "average roll — the coward's option",
        ac: 10 + dex.def,
        acNote: "descending — lower is better",
        weapons: "Fists (1d2" + (str.dmg ? fmtMod(str.dmg) : "") + ", punching chart, mostly temporary)",
        extras: extras2e,
      };
    },
  },

  pf2e: {
    name: "Pathfinder 2nd Edition",
    short: "Pathfinder 2e",
    blurb: "Like 5e, but with more numbers and three kinds of actions.",
    classes: {
      fighter: "Fighter", wizard: "Wizard", cleric: "Cleric",
      bard: "Bard", rogue: "Rogue", ranger: "Ranger",
    },
    classHp: { fighter: 10, wizard: 6, cleric: 8, bard: 8, rogue: 8, ranger: 10 },
    skillsNote: "Treat as trained (+3 + ability mod).",
    featsTitle: "Feats",
    featNote: "Translation for PF2e: advantage = roll twice, keep better; bonus action = one action (◆).",
    derive(a, archetype) {
      const con = mod5e(a.con);
      const str = mod5e(a.str);
      const perception = mod5e(a.wis) + PF2E_PROF[PF2E_PERCEPTION[archetype]];
      const [fort, ref, will] = PF2E_SAVES[archetype];
      // PF2e Ranger's key attribute is Str or Dex (never Con — that's only
      // our internal tie-break whimsy). Take the better of the two.
      const keyMod =
        archetype === "ranger"
          ? Math.max(mod5e(a.str), mod5e(a.dex))
          : mod5e(a[ARCHETYPES[archetype].key]);
      return {
        mods: Object.fromEntries(ABILITIES.map((k) => [k, fmtMod(mod5e(a[k]))])),
        hp: Math.max(1, 8 + this.classHp[archetype] + con), // human ancestry + class
        hpNote: "8 ancestry + class HP",
        ac: 13 + mod5e(a.dex), // 10 + dex + trained unarmored (+2 prof +1 level)
        acNote: "unarmored, trained",
        weapons: "Fists (" + fmtMod(3 + str) + " to hit, 1d4" + (str ? fmtMod(str) : "") + " nonlethal; agile, finesse)",
        extras: [
          ["Perception", fmtMod(perception) + " (" + (PF2E_PERCEPTION[archetype] === "E" ? "expert" : "trained") + " — also your initiative)"],
          ["Fortitude", fmtMod(con + PF2E_PROF[fort])],
          ["Reflex", fmtMod(mod5e(a.dex) + PF2E_PROF[ref])],
          ["Will", fmtMod(mod5e(a.wis) + PF2E_PROF[will])],
          ["Class DC", String(13 + keyMod)],
          ["Speed", "25 ft"],
          ["Ancestry", "Human (Versatile Heritage: Tired)"],
          ["Edicts / Anathema", "Coffee / Mornings"],
          ["Hero Points", "1"],
        ],
      };
    },
  },
};
