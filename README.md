# Real Character Creator

What would your **real-life** stats be? 10 is human average. 18 is genius or Olympian —
and capped out of reach, because no real human gets an 18. The best you can prove
with a web quiz is a 17.

Answer ~18 simple questions about actual real-life things — how much you can lift over
your head, whether you can catch keys tossed at you, how you arrive at the top of four
flights of stairs — and get an honest level-1 character sheet in your system of choice:

- **D&D 5th Edition**
- **AD&D 2nd Edition** — Strength is scored against the genuine 2e *Max Press* table,
  and the sheet reports your Max Press, Open Doors, and Bend Bars/Lift Gates odds back to you
- **Pathfinder 2nd Edition**

Once generated, you can flip the same character between systems, print the sheet, or
**Copy for chat** to paste a plain-text stat block at your friends.

Inspired by a group-chat legend who statted themselves as a Scholar with 4 HP and the feat
*Pity Able — on a successful Cha check, the target feels sorry for you and your
incompetence in the area.*

## Running it

It's a static site — no build step, no dependencies.

- Live: https://kinect1things.github.io/ttrpg_realchar_creator/
- Local: open `index.html` in a browser, or `python3 -m http.server` and visit `http://localhost:8000`

## Structure

- `index.html` — page shell
- `css/style.css` — dark UI theme + white sheet + print styles
- `js/version.js` — the app version (semver, single source of truth)
- `js/data.js` — question bank, 2e ability tables, system definitions (add a system here)
- `js/app.js` — quiz flow, scoring, sheet rendering
- `test/validate.js` — data-integrity checks run by CI (`node test/validate.js`)
- `.claude/agents/` — consultable experts: `player-expert`, `game-master-expert`, `security-expert`

## Development workflow

Versioned, CI-gated, deployed from `main`:

1. Branch from `main` (`feature/...` or `release/...`) and make your changes.
2. Bump `APP_VERSION` in `js/version.js` (semver) — CI fails the PR if app files
   changed without a version bump.
3. Open a PR to `main`. CI syntax-checks all scripts and runs `test/validate.js`.
4. Merge. The Deploy workflow validates again, publishes to GitHub Pages, and
   tags a `vX.Y.Z` release automatically if that version tag doesn't exist yet.

When making changes, consult the resident experts (Claude Code agents):
the **player expert** for question/scoring/rules-accuracy feedback, the
**game master expert** for table-runnability and tone, and the
**security expert** before releases and for anything touching user input or
the workflows.
