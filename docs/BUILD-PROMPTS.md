# Build prompts (copy and paste, one phase at a time)

How to use: open Claude Code, start a **new session** for each phase, paste the prompt, press Enter. Use **Plan** mode for the first message of a phase, read the plan, then say "go". After each phase: look at the preview, then ask Claude to commit.
Do not skip phases. Phase 2 and 3 are what make everything after them fast.

---
## Phase 0: check the connections (10 minutes)
```
Read CLAUDE.md and docs/screens-manifest.md. Then check you can reach Figma:
use the Figma tool "whoami", then read node 365:33581 in file ZzpfKWm3JAwOsVHv8yokGs
with get_design_context and describe in 5 lines what you see.
Don't build anything yet. Tell me if anything in CLAUDE.md is unclear or missing.
```
Done when: Claude names the Figma account and describes the Home dashboard.

---
## Phase 1: scaffold, tokens and theme switch (about 1 hour)
```
Set up the project in this folder using Vite, React and TypeScript, with React Router.
Add .gitignore, and a README with the 3 commands I need (install, run, build).
Copy tokens/tokens.css to src/styles/tokens.css and load it globally. Self-host the font
"Special Gothic" if you can find it freely licensed; if not, use the system fallback in
the tokens and tell me.
Build the theme switch: Light, Dark, System. Set data-theme on <html>, follow the OS when
System is chosen, and remember my choice. Default to Dark.
Create a temporary page at /gallery showing colour swatches from the semantic tokens
(not the palette) in both themes side by side.
Make sure "npm run dev" works and tell me the address to open. Commit when it works.
```
Done when: the gallery shows both themes and the toggle works (try switching your Mac between light and dark).

---
## Phase 2: core components and the gallery (about 3-4 hours, the most important phase)
```
Read docs/component-inventory.md. Build the shared components listed under "Core",
"Layout and containers" and "Overlays", one file each in src/components/, using only
semantic tokens. Start with Button and IconButton exactly as specified (sizes 32/40/48,
variants primary/secondary/brand/tertiary/destructive/ghost, states default/hover/pressed/
focus/disabled/loading). Then Chip, Tabs (segmented, with icons), Search field, Select button,
Avatar, Flag, DSP tile, Delta, Trend bars, Area chart, Share bar, Card, DataTable (sort,
pagination, selected row, horizontal scroll), SplitSheet, Menu, Modal, Toast.
For anything with a Figma source, read it with get_design_context first, one component at a time.
Show EVERY component in EVERY state at /gallery, in Dark and Light side by side.
Do this in 3 commits: (1) buttons, chips, tabs, inputs, (2) data display, (3) overlays.
```
Done when: you can scroll the gallery in both themes and nothing looks broken. Fix problems **here**, not later.

---
## Phase 3: app shell, routes and the user switch (about 1-2 hours)
```
Build the app shell: sidebar (200px), page header, and the top-right bell and avatar.
Add all routes from docs/screens-manifest.md as empty placeholder pages that say what they will be.
Sidebar items: Dashboard, Data, Reports, Saved Searches, Issues, Connections, Rules (IFPI user only,
after Issues, list-ordered icon), Ask, Settings. Items without a design open the dialog
"Not part of this prototype".
Avatar opens the Switch user menu (Enterprise, Premium, IFPI user, with the tick on the current one,
and an "Appearance: Light | Dark | System" control at the bottom). Switching user changes the
sidebar and navigates to that user's landing page (see CLAUDE.md). Read data/rules.json for the users.
Add a small "Illustrative data" note in the footer of the sidebar or the page.
Commit when it works.
```
Done when: you can click through every sidebar item, switch user, and see Rules only as the IFPI user.

---
## Phase 4: the pages (run these in PARALLEL, one session per page group)
Before starting, tell Claude: "Create a new branch for this task." Each session only touches its own files.

**4A: dashboards (must: Premium dashboard; should: Enterprise dashboard, Customise, widget builder)**
```
Branch page/dashboard. Build /dashboard for Premium (Figma 365:33581) and Enterprise (416:2629),
then /dashboard/customise (484:2894) with edit mode, the widget gallery drawer and the
custom widget builder modal (490:3028, 491:5545). Use shared components only. Data is in
data/cast.json. Roster rows link to /artist/:id. Done = matches Figma in both themes, links work,
build passes. Commit.
```
**4B: Data (must)**
```
Branch page/data. Build /data with its four tabs (Canonical data, Song, Artist, Country) from
Figma 496:3121, 496:3560, 512:4213, 512:5052, 512:5893 and the filter panel 605:11982 if time allows.
Real behaviour: sort, pagination, search, selecting a row opens the split view, Close returns to the list,
tabs switch without losing the filters. Header actions: Save search, Export (menu), More (menu).
Menus are not designed; use the proposals in docs/component-inventory.md. Data from data/cast.json.
"Open page" in the sheet goes to the entity page. Commit.
```
**4C: entity pages (must)**
```
Branch page/entities. Build /song/:id, /artist/:id and /country/:code from Figma 515:4295,
516:4458, 517:4547 as ONE shared page template with three configurations. Include the area chart
with previous-period comparison, Delta, Trend bars, the weekly trend table (published Fridays,
"X of 51 DSPs reported") and breadcrumbs back to the list tab. Data from data/cast.json.
Only Saffron Ferry, Luna Sky and GB are fully populated; other ids show the same template
with the closest data or a friendly empty state. Commit.
```
**4D: Rules (must)**
```
Branch page/rules. Build /rules, /rules/enrichment and /rules/history from Figma 607:5060, 607:5712,
608:6057, plus the Add DSP modal (608:5377), the unsaved-change state with the required comment
(608:5726) and the Licensor enrichment variant (611:5507). Real behaviour: choose a field on the left,
reorder with up/down chevrons, remove, add a DSP (max 10), Save requires a comment and prepends a
History row with a new version. Only the IFPI user can open it. Data from data/rules.json. Commit.
```
**4E: Ask (should)**
```
Branch page/ask. Build /ask and the three scripted conversations from Figma 478:2842, 467:2701,
467:2956, 467:3200, 468:3016. Read data/ask.json for all text. Behaviour: chips and saved prompts
start the matching script, a short "thinking" row, then the answer appears over about 1.5 seconds,
follow-up chips, Recents, model picker (visual), "Open in Data" deep links. Typed questions are
matched by keywords, otherwise show the fallback. Read the consistencyNotes in the JSON and
tell me about any mismatch you see. Commit.
```

**Merging**: when a page is done and committed, ask: "Merge branch page/xxx into main, resolve any conflicts carefully and run the build."

---
## Phase 5: light mode and polish (about 2-4 hours)
```
Go through every route in both themes and with System selected. List every problem you find
(contrast, textures or gradients designed only for dark, charts, images, shadows, focus rings)
as a checklist, fix the ones that are token or component issues, and show me a before/after for
anything that needs a design decision. Check keyboard use on menus, tabs and modals. Run the build.
```

## Phase 6: present and share
```
Run the production build and preview it locally so I can present offline. Then write a
one-page SHARING.md explaining how to deploy this as a static site with a passcode, in plain
English, with the exact clicks. Do not deploy anything yet.
```

---
## Tips that save time and money
- One task per message; say what "done" looks like. Interrupt early if it goes the wrong way (Stop button).
- Paste a **screenshot of the problem** and say what you expected, instead of describing it.
- If Claude says it is unsure, answer in one line. Do not let it guess on design details.
- Ask for the plan first (Plan mode) on anything that touches more than 3 files.
- Commit after every working step. If something breaks: "Undo the last change" or "go back to the last commit".
