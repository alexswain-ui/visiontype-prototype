# VisionType prototype: starter kit

Read in this order:
1. docs/SETUP-GUIDE-MAC.md  (install, Figma connection, repo, how to work; about 45 minutes)
2. CLAUDE.md                (the rules Claude Code follows; do not edit unless you change the plan)
3. docs/BUILD-PROMPTS.md    (copy-and-paste prompts, phase by phase)

Reference (Claude reads these for you):
- docs/screens-manifest.md   every screen: Figma node id, route, who sees it, priority
- docs/component-inventory.md components, props and proposed states (approve or change them)
- tokens/                    colours, spacing, type, as JSON and CSS variables (Light and Dark)
- data/                      fictional data used by every screen; data/ask.json has the Ask scripts

Decisions already made
- Orange standard is #f27743. Buttons: Primary / Secondary / Brand / Tertiary / Destructive / Ghost, 32 / 40 / 48.
- Light, Dark and System themes. Dark is the default for presentations.
- Delivery wording: "X of 51 DSPs reported". Data publishes each Friday. No provisional data.
- Ask is scripted, not live. Everything not designed shows "Not part of this prototype".

Open points for you (also listed in CLAUDE.md and data/ask.json)
- Numbers in the Ask scripts do not match the Country page (see consistencyNotes in data/ask.json).
- Export and More menus are not designed; the manifest proposes contents.
- Enterprise access chip text is proposed ("All rows · your access level").
