# Component inventory and proposed states

Build these once as shared components (`src/components/`) and show every state on a hidden **/gallery** page (Dark and Light side by side). Anything marked *proposed* was not designed in Figma: build it, and the designer will approve or change it.

**Universal state rules**
- Hover: slightly lighter/stronger fill or border, 120ms (`--motion-duration-fast`, `--ease-standard`).
- Pressed: darker fill, no movement.
- Focus-visible: 2px gap then 2px ring (`--line-ring`/primary). Never remove outlines.
- Disabled: 40% opacity (`--opacity-disabled`), no hover, `cursor: not-allowed`.
- Loading: replace leading icon with a spinner, dim label to 72%, ignore clicks.
- Empty: icon + one line of text + (optional) one action. Error: inline message in `--status-destructive-text`, never a blank area.
- Reduced motion: respect `prefers-reduced-motion`.

## Core
| Component | Figma source | Props / variants | States |
|---|---|---|---|
| **Button** | Design system, Components: Buttons, "Button v2" | variant: primary, secondary, brand, tertiary, destructive, ghost; size: small 32 / medium 40 / large 48; label; leadingIcon; trailingIcon | default, hover, pressed, focus, disabled, loading. Radii 8/10/12. Horizontal padding with an icon on that side: 10/12/16; without: 12/16/20. Gap 8 (6 on small). |
| **IconButton** | "Icon button v2" | same variants and sizes; square 32/40/48; icon 14 on small, 16 otherwise | same six states |
| Chip (filter) | "Chip" instance on Data pages | text, removable (x), locked (lock icon, not removable), tone: neutral/orange | default, hover, focus; locked has no hover |
| Chip (status/tag) | status chips, "Current", "New", "Restated" | tone: neutral, orange, amber, green, red; icon optional | static |
| Tabs (segmented) | "Tabs (segmented) - Nova" | items with optional icon; active | default, hover, active, focus |
| Search field | "Input / Email" (search) | placeholder, leading icon, clear | default, hover, focus (ring), filled, disabled |
| Text input / comment input | save bar comment | label, placeholder, error message | default, focus, filled, error, disabled (*proposed*) |
| Select / dropdown button | date range, Filters, results-per-page | label, leading icon, chevron, count badge | default, hover, open (secondary pressed), focus |
| Avatar | header avatar, History rows, "last updated by" | size 18/24/32/40/56; image | static |
| Flag | country flags | code, size (20x14, 26x19, 56x40) | static |
| DSP tile | Spotify, Apple Music, YouTube, Deezer, iTunes | name; fallback tile with two letters | static |
| Delta | change with arrow | value, direction | static |
| Trend bars | 7-bar sparkline | direction, magnitude, seed | static |
| Area chart | trend card | current, previous series, y labels, x labels | static, plus hover tooltip (*proposed*: vertical guide, small card with week and value) |
| Share bar | thin horizontal bar | value 0-1 | static |

## Layout and containers
| Component | Notes |
|---|---|
| App shell | sidebar 200px + content area; content max 1160px wide at 1440 viewport; page background `--surface-background`. |
| Sidebar + SidebarItem | states: default, hover, active (accent fill + accent text), focus. Items by user (Rules only for IFPI user). |
| PageHeader | icon tile, title, supplementary line, bell + avatar. |
| Card | 20px radius, 22px padding, `--surface-card`, 1px border at 8%. Header row with title, optional sub, optional right actions. |
| DataTable | column headers with sort (click toggles ascending/descending, *proposed*), row hover, selected row, horizontal scroll inside the card, pagination footer (Prev, 1 2 3 ... N, Next; results per page). Loading: 6 skeleton rows (*proposed*). Empty: "No results for these filters" with Clear filters button (*proposed*). |
| SplitSheet | 444px right sheet, header with media, title, chips, expand and close; body scrolls; footer with 1-2 buttons. Opens with a 200ms slide/fade; Esc closes. |
| StatTile | label, value, change, optional sub. |
| Timeline | vertical rail, dots, title/meta/detail lines. |
| ConflictCard | amber tint, icon, title, description, meta, "Open issue" link. |

## Overlays
| Component | Notes |
|---|---|
| Menu / Popover | used for Switch user, Export, More, Add. Keyboard: arrows move, Enter selects, Esc closes. Click outside closes. |
| Modal | scrim (`--component-scrim`), 520-900px, header/body/footer, Esc closes, focus trapped. Used for Add DSP, Widget builder, "Not part of this prototype". |
| Toast | bottom-centre, 3s, for "Saved" and "Added to dashboard" (*proposed*). |
| Tooltip | on icon-only buttons, 120ms delay (*proposed*). |

## Feature-specific
| Component | Notes |
|---|---|
| RankList + RankRow | rank number, grip, DSP tile, name, remove (x), up/down **chevron** buttons (disabled at the ends: first row's up and last row's down). Reordering is real (state), also drag if cheap. "Add" dashed row with count "5 of 10". Save bar appears when changed: unsaved count, required comment, Discard, Save changes (disabled until comment typed). Saving prepends a row to History. |
| HistoryRow | avatar, "X changed", change title, comment (message icon), date, version chip ("Current" on top row). |
| Widget (dashboard) | card with drag handle + remove pill and resize handle in edit mode; blue (brand) outline in edit mode. |
| Widget gallery drawer | search, category chips, Create custom widget (dashed), suggested widgets with Add / Added / locked states. |
| Ask: AnswerCard | no bubble; summary text, stat tiles, chart, table, "How this was answered", message actions (Open in Data, Download CSV, Add to report, Save question), follow-up chips. |
| Ask: Composer | text field, model selector (visual), send button (tertiary/purple). Typing shows a short "thinking" row then streams the answer in about 1.5s (*proposed*). |
| Ask: ChatRow (Recents) | title, active state. |

## Gallery page
`/gallery` (not linked from the UI): every component above, in all states, in Dark and Light, so the designer can review them in one place. This is the main way to check theming and states quickly.
