# VisionType prototype

Clickable HTML prototype of the VisionType portal (IFPI Global Data Platform, discovery phase).
Illustrative data only. Not the MVP, not connected to any real data.

## The 3 commands

Install (first time, or after a dependency changes):

```bash
npm install
```

Run on your Mac while you work (then open http://localhost:5173):

```bash
npm run dev
```

Build the finished site into the `dist/` folder (also checks for TypeScript errors):

```bash
npm run build
```

## Where things live

- `src/pages/` pages (for now only `/gallery`, a temporary token check page)
- `src/components/` shared components, one per file
- `src/lib/` helpers, including the theme (Light / Dark / System)
- `src/styles/tokens.css` copy of `tokens/tokens.css` (generated from Figma, do not edit by hand)
- `src/assets/fonts/` Special Gothic, self-hosted (SIL Open Font License 1.1)
- `tokens/`, `docs/`, `data/` the design kit from Figma
