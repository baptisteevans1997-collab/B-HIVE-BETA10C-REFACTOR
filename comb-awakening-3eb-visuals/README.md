# Comb Awakening: First Honey — visual handoff for Codex

B-HIVE Step 3E-B, final synthesis. Design only — implement nothing until Baptiste approves.
This folder is the VISUAL companion to the written spec.

## Read these two together
1. `../COMB-AWAKENING-3EB-DESIGN.md` — the canonical spec (the source of truth for
   behaviour, timings, strings and the preservation contract). Read this first.
2. `comb-awakening-3eb.html` — the storyboard as a single self-contained HTML file. This is
   the VECTOR SOURCE: open it (or read the SVG markup directly) for exact geometry —
   hexagon points, crest paths, coordinates, spacing. When a PNG and the spec seem to
   disagree, the spec wins on behaviour and this HTML wins on shape.

## PNG reference (folder `frames/`) — for eyeballing, not for measuring
- `00-full-overview.png` — the whole storyboard page in one image.
- `01-awakened-storyboard.png` — the 8-frame ceremony when a cell awakens (Variant A).
- `02-no-unlock-storyboard.png` — the 3-frame compressed ceremony when nothing awakens (Variant B).
- `03-cell-anatomy.png` — the six labelled parts of an awakened cell.
- `04-timeline.png` — both variants on one time track (§04 of the spec).
- `05-domain-matrix.png` — all 14 authoritative domains: crest, meaning, geometry, signature beat.
- `06-cell-states.png` — hidden / constructing / newly-awakened / resting, plus future visual capacity.
- `07-hive-before-after.png` — the full Hive at rest, before and after one unlock (real coordinates).

## Ground truth already baked into these visuals (from the runtime, read-only)
- 14 domains + coordinates: `js/bhive-engine.js:68-81`; `lw` displays as MAIN PROJECT.
- `BHIVE.unlocks` is the ONLY visibility authority — locked cells render nothing; the
  ceremony never previews or silhouettes a hidden cell.
- Flat-top hexes; Core at (300,300) r40 in the 600×600 `#hivesvg` space.
- Reward model + strings are unchanged from 3E-A (see spec §10 and §15).

## Hard rules the visuals encode (do not "improve" away)
- No cards, chips, circuits, tarot, loot, coins/XP, confetti, screen shake, gloss, neon, or
  busy idle animation. The retired Memory Chip (../AMBER-ARRIVAL-3EB-DESIGN.md) must NOT be
  implemented or reskinned.
- Resting cells keep only: crest, restrained wax, one connection stub. No permanent glow,
  labels, or motion.
- Excerpt text lives ONLY in the authoritative summary nodes — never inside a crest,
  memory cell, or live region.
