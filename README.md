# Real Character Creator

What would your **real-life** stats be? 10 is human average. 18 is genius or Olympian.

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
- `css/style.css` — dark tavern theme + parchment sheet + print styles
- `js/data.js` — question bank, 2e ability tables, system definitions (add a system here)
- `js/app.js` — quiz flow, scoring, sheet rendering
