# Screens manifest

Figma prototype file key: `ZzpfKWm3JAwOsVHv8yokGs`. Read each frame with `get_design_context` using the node ID below.
Priority: **M** = must be working for Thursday's presentation, **S** = should, **C** = could / after.
All frames are 1440 wide. Data and entity frames are the "final" versions; frames named WIRE or HI-FI are old exploration and are **not** to be built.

## 1. App shell (shared by every screen)
| What | Figma | Notes |
|---|---|---|
| Sidebar (collapsed, 200px) | any frame, "Sidebar - Collapsed" | Items: Dashboard, Data, Reports, Saved Searches, Issues, Connections, [Rules: IFPI user only], Ask, Settings. Active item uses the accent style. |
| Top-right group | "Frame 9" | Bell + avatar. Avatar opens the **Switch user** menu. |
| Page header | "Frame 203" on Data frames | Icon tile + title + supplementary line. |

## 2. Dashboards and customising (Beat 1)
| Priority | Screen | Node | Route | Who | Links out |
|---|---|---|---|---|---|
| M | Explorer dashboard (Maya, Premium) | `365:33581` | `/dashboard` | Premium | roster rows -> Artist page; Customise button -> customise; sidebar; avatar -> Switch user |
| C | Explorer dashboard, alternate state | `374:36533` | `/dashboard?state=alt` | Premium | same as above (variant: use for "quiet day" or "major change" content) |
| S | Extractor dashboard (Dev, Enterprise) | `416:2629` (use this; `381:2612` is the older B) | `/dashboard` | Enterprise | avatar -> Switch user |
| S | Customise dashboard (edit mode + widget gallery drawer) | `484:2894` | `/dashboard/customise` | Premium | Done/Cancel -> dashboard; "Create custom widget" -> widget builder |
| S | Custom widget (builder entry state) | `491:5545` | `/dashboard/customise/widget` | Premium | Close -> data page; Add -> dashboard |
| S | Widget builder modal (over Data page) | `490:3028` (modal over `488:2985`, an older Data page: rebuild the modal over the new `/data` page) | modal | Premium | Cancel -> back; Add to dashboard -> dashboard |
| M | Switch user menu (Premium current) | `614:6530` | overlay | all | options -> Premium dashboard / Enterprise dashboard / Rules |
| S | Switch user menu (Enterprise current) | `614:6903` | overlay | all | same |

## 3. Data and drilling (Beat 2)
| Priority | Screen | Node | Route | Notes |
|---|---|---|---|---|
| M | Canonical data (list) | `496:3121` | `/data` | Tabs: Canonical data, Song, Artist, Country (with icons). Search, Ask AI button, date range, Filters. Chips row (market chip, locked "Top 100k" chip). Header actions: Save search, Export (menu), More. Pagination footer. |
| M | Canonical + split view | `496:3560` | `/data/canonical/:id` | Row 2 selected. Sheet shows rights conflict card first, then version timeline. Close -> list. Columns beyond the card width scroll horizontally. |
| M | Song tab + split | `512:4213` | `/data/songs` and `/data/songs/:id` | Sheet: KPIs, performance by market table. Footer: Open song page, Add to dashboard. |
| M | Artist tab + split | `512:5052` | `/data/artists` | Sheet: filters, trend, songs table. Footer: Open artist page. |
| M | Country tab + split | `512:5893` | `/data/countries` | Sheet: trend, top 10 artists, top 10 songs. Footer: Open country page. |
| C | Filter panel open | `605:11982` | `/data?filters=open` | Per-entity filter lists (Markets, Artists, Songs, DSPs, Licensors, Labels). Opened by the Filters button. |
| C | Export menu / More menu | not designed (old Export menu frame `506:3785` is stale) | menu | Proposed: Export = CSV, Excel, Plain text, Databricks, Snowflake. More = Generate report, Add to dashboard, Add to dataset, Edit columns. |
| M | Song page | `515:4295` | `/song/:id` | Header card, trend chart, streams by DSP, market table (with Trend bars), weekly trend table (published Friday, "X of 51 DSPs reported"), data history and rights card. |
| M | Artist page | `516:4458` | `/artist/:id` | Header card, trend, top markets, songs table (Trend bars), labels and distributors, weekly trend. |
| M | Country page | `517:4547` | `/country/:code` | Header card, trend, DSP split, top 10 artists and songs (Trend bars), share by label (labelled "End-state, illustrative"), weekly trend. |

Tab navigation between `/data`, `/data/songs`, `/data/artists`, `/data/countries` is already wired in Figma; breadcrumbs on entity pages return to the list tab.

## 4. Rules (Beat 7), IFPI user only
| Priority | Screen | Node | Route |
|---|---|---|---|
| M | Rules, DSPs tab | `607:5060` | `/rules` |
| M | Add DSP picker (modal) | `608:5377` | `/rules` + modal |
| S | Unsaved change (6th DSP, save bar with required comment) | `608:5726` | `/rules` (edited state) |
| M | Enrichment tab (Song name: Soundsys only) | `607:5712` | `/rules/enrichment` |
| S | Licensor variant of Enrichment (RDx only) | `611:5507` | `/rules/enrichment?field=licensor` |
| M | History tab | `608:6057` | `/rules/history` |
| S | Switch user menu (IFPI current) | `612:6005` | overlay |
Rules logic to honour: field list on the left (Song Name, Artist Name, Licensor, Label, Distributor) with "last updated by" avatar; each field has its own DSP ranking (up to 10) and enrichment source (Song and Artist use Soundsys; Licensor, Label and Distributor use RDx). Reordering uses up/down chevrons. Saving requires a comment (the "why") and creates a new version in History.

## 5. Ask (Beat 3), scripted
| Priority | Screen | Node | Route |
|---|---|---|---|
| S | Ask home (new chat) | `478:2842` | `/ask` |
| S | Conversation 1: Odalie Brask vs Petra Lindqvane | `467:2701` | `/ask/odalie-vs-petra` |
| C | Conversation 2: What was restated this week | `467:2956` | `/ask/restated` |
| C | Conversation 3: Quillfern vs Larchway UK share | `467:3200` | `/ask/uk-share` |
| C | Model picker open | `468:3016` | overlay |
Behaviour and script text: `data/ask.json`. Typing a free-text question matches the nearest script by keywords; otherwise reply with the fallback and suggest the three prompts. "Open in Data" deep-links to `/data` with the filters named in the answer.

## 6. Not designed (show "Not part of this prototype")
Reports, Saved searches, Issues, Connections, Settings, notifications, the dashboards' other widgets' detail pages, Export and More menus (until designed), any free-text Ask beyond the scripts.

## 7. Legacy frames (ignore)
`303:1365`, `303:1594`, `311:1786`, `311:1960`, `315:1786`, `315:1947`, `304:26104`, `305:1365`, `305:1527`, `316:28504`, `297:1365`, `299:1365`, `300:24888`, `300:24955` (WIRE / HI-FI exploration); `304:26984` old Data page; `304:26754` old Artist page; `317:30786` and `322:31347` Rules PoC; `488:2985` older filtered Data page.

## 8. Access and scope behaviour (assumptions to confirm)
- Premium (Maya): all Data screens show the locked chip "Top 100k · your access level".
- Enterprise (Dev): same screens; the locked chip reads "All rows · your access level" (not designed, proposed).
- IFPI user: same sidebar plus Rules. Rules is read/write for this user; others never see it.
- Delivery wording everywhere: "X of 51 DSPs reported" (mostly 51 of 51). Data is published each Friday. No "provisional" data.
