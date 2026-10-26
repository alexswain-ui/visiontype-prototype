# VisionType prototype: project rules for Claude Code

You are building a **clickable HTML prototype** of the VisionType portal (IFPI Global Data Platform, discovery phase). The designer is the only person on this project and is **not a developer**. Explain what you do in plain English, keep changes small, and commit often.

## What this is, and is not
- A high-fidelity **illustrative prototype** for stakeholder walkthroughs and light self-guided review. It is **not** the MVP and **not** wired to any real data or backend.
- All data is **fictional** and lives in `src/data/*.json`. Never add real DSP data, real streaming figures or real personal data.
- Anything not designed shows a friendly "Not part of this prototype" dialog, never a broken page.
- Show a small "Illustrative data" note somewhere visible (footer or About page).

## Sources of truth (read these, do not guess)
1. **Figma prototype file** key `ZzpfKWm3JAwOsVHv8yokGs`. Node IDs for every screen are in `docs/screens-manifest.md`. For any page, call the Figma tool `get_design_context` on that node ID (one frame at a time, smaller selections give cleaner output) before you build it.
2. **Figma design system file** key `S5RTgBPZtxtXRcsIiBT5XB` (Palette, Theme Light/Dark, Foundations, components). Already exported to `tokens/tokens.json` and `tokens/tokens.css`.
3. `docs/component-inventory.md` for components, props and states. `docs/screens-manifest.md` for routes, who sees what and links.
4. If the Figma frame and these docs disagree, the **Figma frame wins**, then tell the designer what you found.
- Figma read calls are rate limited (about 200 a day). Do not re-read frames you have already read. Prefer one call per component or page.

## Stack (keep it boring)
- Vite + React + TypeScript. React Router for routes. Tailwind CSS only as a thin layer over the token variables (or plain CSS modules, your choice, but be consistent).
- `lucide-react` for icons (stroke icons; the Figma file uses filled copies of the same Lucide shapes, same look at 16px).
- `country-flag-icons` for flags (rectangular 20x14, radius 3, 1px outline at 14% white). Do not hand-draw flags.
- Charts: small hand-written SVG components (see "Visual specs"). No heavy charting library.
- State: React context for **user** (Premium / Enterprise / IFPI) and **theme**. Keep everything else local.
- No backend, no API calls, no analytics, no external fonts or CDNs at runtime (self-host fonts and assets).
- Do not add a dependency without saying why and asking first.

## Non-negotiable rules
1. **No hard-coded colours, radii, spacing or font sizes.** Use the CSS variables in `tokens/tokens.css` (copy to `src/styles/tokens.css`). Component code uses **semantic** tokens (`--surface-card`, `--button-primary-bg`), never `--palette-*`. If a value is missing, stop and ask; do not invent one.
2. Standard orange is **`#f27743`** (`--primary-primary`). The older `#f77036` is retired. See `tokens/hex-snap-map.json` if you meet other off-palette hexes in Figma output: snap them, do not copy them.
3. **Both themes must work**: Dark (default for the presentation), Light, and System (follows the OS, using `matchMedia`). Theme is set with `data-theme="light|dark"` on `<html>`; the user's choice (light / dark / system) is remembered. The switch lives at the bottom of the avatar menu ("Appearance").
4. Every interactive component implements the states in `docs/component-inventory.md` (default, hover, pressed, focus-visible, disabled, loading where relevant). Focus ring: 2px gap plus 2px ring in `--line-ring`/primary.
5. Match Figma first, then ask. If you are choosing between "faster" and "matches the design", match the design.
6. One component = one file in `src/components/`. Pages in `src/pages/` are assembled from components plus data and should stay thin. Shared helpers in `src/lib/`.
7. Accessibility basics: real `<button>`/`<a>`, labels for icon-only buttons, visible focus, keyboard-operable menus and tabs, sufficient contrast in both themes.
8. Do not edit `tokens/tokens.json`, `tokens/tokens.css` or files in `docs/` without being asked. They are generated from Figma. If a token is wrong, say so.

## Users and tiers (the "Switch user" menu in the avatar menu)
| User | Tier | Lands on | Notes |
|---|---|---|---|
| Maya | Premium | Explorer dashboard | Scope chip "Top 100k per market". Standard sidebar. |
| Dev | Enterprise | Extractor dashboard | Direct dataset access. Standard sidebar. |
| IFPI user | IFPI | Rules (DSPs) | Standard sidebar **plus a "Rules" item** (list-ordered icon) after Issues. Only this user sees Rules. |
Switching user changes the sidebar, the landing page and the access chip. It never reloads the data.

## Visual specs for repeated patterns (build these once as shared components)
- **Delta (change)**: value then arrow, e.g. `5.8%` + up arrow. Up = `--status-success-text`/green (`#2b9a66` family), down = red (`#e5484d` family), 14px, arrow 12px, 4px gap. Never show a leading + or minus sign. Stat tiles add muted "vs last week".
- **Trend bars**: 7 vertical bars, 2px wide, 4px pitch, bottom-aligned in a 32x16 box, green for up, red for down. Heights grow (up) or shrink (down) left to right.
- **Trend chart (area)**: smooth curves (Catmull-Rom to Bezier), 2px round-cap line, gradient area under it (colour at 25% fading to 0), 3 faint gridlines (`--line-gridline`), y labels 11px muted. Current period orange (`#ff6a13` line / `#f27743` area); previous period blue (`#2d67f7` line / `#3d7bff` area), as on the dashboard.
- **Status chips**: Conflict = amber, Restated = orange, 8px radius, tinted fill (about 16%) with matching icon. Locked chip (access limit) = muted with lock icon, not removable.
- **Table**: card with 20px radius; header row 56px (count text 16px plus actions), column header 40px (12px muted, sort arrow on the **left** of right-aligned numeric headers, on the **right** of left-aligned headers), rows 56px, 1px 5% bottom borders, selected row = orange 12% fill with a 2px orange left bar. Numeric columns right-aligned, SemiBold.
- **Split view**: table narrows, a 444px sheet slides in on the right, same height as the table. Sheet header has artwork/photo/flag, title, chips, "expand to page" and close buttons.
- **Menus/popovers**: 14-16px radius, `--surface-popover`, 1px border at 12%, large soft shadow, 56px two-line option rows, tick for the current option.
- **Toasts / dialogs** for "Not part of this prototype": small centred dialog, secondary button "OK".
- **Tabs**: the segmented control from the Figma component "Tabs (segmented) - Nova" (container `--surface-secondary`, 4px padding, 12px radius; active tab has the page background colour and a soft shadow). Tabs on the Data page have icons.
- **Page header**: icon tile + title (32px SemiBold) with supplementary line beneath; bell and avatar top right.
- **Buttons**: see `docs/component-inventory.md` (Button v2). Heights 32/40/48 = Small/Medium/Large; radii 8/10/12; 14px Medium label. Variants Primary (orange, one per view), Secondary (neutral glass, default), Brand (blue, edit/customise only), Tertiary (purple, AI only), Destructive, Ghost.

## Definition of done for a page
- Built from the matching Figma node (read with `get_design_context`), using shared components.
- Looks right in Dark **and** Light **and** when the OS is set to Dark/Light with System selected.
- All links in the manifest work; anything else shows the "Not part of this prototype" dialog.
- Keyboard: tab order is sensible, menus open and close with keyboard.
- `npm run build` passes with no TypeScript errors; no console errors in the browser.
- Committed with a clear message, and the designer has seen it in the preview.

## Working style
- Before a big task, give a 5-line plan and wait for a go. Use Plan mode for anything touching many files.
- After each task: say what changed, how to see it (`npm run dev`, which URL), what is still missing.
- Commit after every working step (`git add -A && git commit -m "..."`). Never leave the app broken at the end of a session.
- When running parallel sessions, each session works on its **own branch** (e.g. `page/data`, `page/rules`) and only touches its own page files and data. Shared components are changed only in a session that says so, then merged first.
- If something is ambiguous, ask one question at a time.

## Known gaps in Figma (do not copy these)
- Sidebar links in the Figma prototype still point at older frames (Data goes to the old Data page, Issues goes to the Rules PoC). In code: Data -> `/data`, Rules -> `/rules`, Reports / Saved searches / Issues / Connections / Settings -> "Not part of this prototype".
- Many buttons inherited reactions from Vlad's PoC (links to nodes such as 141:1994, 185:5257, 185:5263, 185:5282, 185:5875, 232:*, 235:*, 280:*). Ignore them.
- Not designed: Export menu and "More" menu on the new Data header, Ask free-text beyond the three scripts, Reports, Saved searches, Connections, Issues, Settings, empty/error/loading states. Use the proposals in `docs/component-inventory.md`.
- Ask screens greet "Alex"; the dashboard greets "Maya". Use the signed-in user's name.
- Font tracking tokens (`font/tracking-base` = 2) have no unit in Figma; check on a text node whether it is percent before using it.
