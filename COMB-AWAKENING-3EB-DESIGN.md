# COMB AWAKENING: FIRST HONEY
## B-HIVE Step 3E-B — final synthesis design spec

Date: 2026-07-31 · Status: FINAL DESIGN, awaiting Baptiste's approval · design only.
No runtime files were modified, staged, committed, pushed or deployed.

VISUAL HANDOFF: `comb-awakening-3eb-visuals/` holds the storyboard as a self-contained
HTML vector source (`comb-awakening-3eb.html` — the source of truth for shapes/coordinates/
crest paths) plus rendered PNG reference in `frames/`, and a `README.md` mapping each image
to this spec. Give Codex that folder together with this document.

SUPERSEDES: the Honeycomb Memory Chip direction (AMBER-ARRIVAL-3EB-DESIGN.md, Rev B–D) is
RETIRED and MUST NOT be implemented. Those artifacts are kept for history only. This
document and `comb-awakening-3eb.html` (storyboard artifact) are the only current design.

Grounded in a read-only inspection of this Beta clone:
- 14 authoritative domains + coordinates: `js/bhive-engine.js:68-81`
- `BHIVE.UNLOCK_START = ['lw','health','people']` (engine:94); `UNLOCK_ORDER` (engine:105)
- `BHIVE.unlocks` is the ONLY visibility authority — locked cells are never rendered
  (engine:305); `unlockFromAnswer` wakes at most ONE cell per teach (engine:351-354)
- Board: `#hivesvg` viewBox 0 0 600 600; FLAT-TOP hexes (vertices on the horizontal axis,
  `clampToHex` comment app-main.js); Core drawn at cx=300, cy=300, r=40 (app-main.js:947+)
- Reward model: `{cellKey, cellLabel, worker{age,b,p}, learningExcerpts[2],
  unlocked:{cellKey,label}|null, supportingLabel}` frozen in app-main.js:3359-3366
- Summary markup + strings: `renderFirstFlightRewardSummary` ui-experiments.js:206-248;
  `firstFlightExcerpt` 80-codepoint clamp; announcement in `.ff-reward-live`;
  reduced-motion flag `reduce` app-main.js:6

---

## 1 · Final concept and gameplay meaning

COMB AWAKENING is B-HIVE's general cell-unlock system: when a domain genuinely unlocks,
the living Hive GROWS — six dark structural comb segments assemble at the cell's canonical
coordinates, the chamber locks into the comb, a Worker provisions it with the first honey,
and the domain's crest cures into the wax. The message, without a tutorial:

> Your action caused the living Hive to grow, store experience and permanently expand.

FIRST HONEY is the First Flight version of that ceremony — the first time the player ever
sees the Hive grow (or, when nothing unlocks, the first time they see the Hive store
memory). It is not a collectible, card, badge, chip, inventory item or currency. Nothing
is minted; the Hive itself changes.

## 2 · Comb Awakening vs First Honey — exact relationship

- COMB AWAKENING = the reusable unlock ceremony: supply line → six-segment construction →
  chamber lock → provisioning → crest → signature beat. Any future genuine unlock
  (runtime `unlockFromAnswer`, one cell per teach) uses this same ceremony.
- FIRST HONEY = First Flight's completion presentation. It always contains: hush, Worker
  flight, chosen-cell impact, and the completion register. When the authoritative reward
  model has `unlocked != null`, it embeds ONE full Comb Awakening for that cell. When
  `unlocked == null`, it embeds none — no fake growth — and the two learnings register as
  two honey-memory beats inside the completion register instead.
- Naming in copy: the system is never called a reward object. The register's strings stay
  exactly the authoritative 3E-A strings.

## 3 · The awakened cell — one living design

A chunky six-sided chamber, flat-top like every real B-HIVE hex, part biological, part
built by intelligent bees. Matte wax, never wet or glossy.

Anatomy (all sizes relative to the cell's authoritative `hexRadius` R):

1. SIX STRUCTURAL WALL SEGMENTS — dark comb beams (stroke ≈ 0.14R, near-black with a thin
   amber inner edge). Heavy outline first; this is the silhouette.
2. WAX INTERIOR — warm amber fill, matte, resting opacity 0.18 (gradient underlay only —
   the house dimension rule; no gloss, no liquid shading).
3. RECESSED DOMAIN CREST — engraved glyph at (0, −0.25R), width ≈ 0.5R; dark groove line
   plus a hairline light under-edge; resting opacity 0.30.
4. MEMORY ROW — two small comb cells (≈ 0.18R each) at the interior base (±0.28R, +0.42R),
   representing the two preserved learnings; filled and SEALED (flat cap line) after First
   Honey; resting opacity 0.25. They are decorative capacity — the excerpts' text never
   appears anywhere but the authoritative summary nodes.
5. WORKER ARRIVAL NOTCH — a small lip cut into the wall at the vertex facing the
   connection stub; where Workers dock. Subtle at rest.
6. CONNECTION STUB — one 1.5px line, length ≈ 0.5R, from the arrival vertex toward the
   nearest already-unlocked neighbour (toward the Core side on ties); resting opacity 0.20.
   The restrained "part of the Hive" tie-back.

No idle animation at rest. The optional "living cue" is deliberately DECLINED — the
professional mind map wins; life is expressed only during ceremonies.

## 4 · Full ceremony — CELL AWAKENED (Variant A) — stable at 3.20s

Easing tokens: E-OUT `cubic-bezier(0.16,0.84,0.28,1)` · E-DIVE `cubic-bezier(0.55,0.04,0.85,0.50)`
· E-SNAP = keyframed squash · opacity fades linear unless noted. State commits BEFORE the
ceremony mounts; the ceremony is presentation only and can always be skipped or finalized.

| t | beat | detail |
|---|---|---|
| 0.00–0.28 | 1 · HUSH | scrim 0 → 0.55 (E-OUT); stage actors in 140ms; ambient drift paused |
| 0.10–0.24 | control | SKIP ANIMATION fades in |
| 0.26–0.42 | target lock | chosen-cell rim 0.6 → 1.0 (160ms) |
| 0.32–0.50 | launch | Core recoil 1 → 0.98 → 1 (180ms); Worker spawns scale 0.6 → 1.0, α 0 → 1 (120ms) |
| 0.42–0.94 | 2 · FLIGHT | 520ms quadratic bezier (E-DIVE), clockwise bow 33% clamped 90px, tilt ≤15°, single 2px trail α0.35 draw-on |
| 0.94–1.02 | entry | Worker into cell centre: scale → 0.5, α → 0 (80ms) |
| 0.94–1.20 | 3 · IMPACT | snap 1.00 / 0.94 @25% / 1.05 @64% / 1.00 (260ms); interior flash 0 → 0.70 (70ms) → 0.18 hold (330ms); "WORKERS 1" pops 1.10 |
| 1.00–1.46 | pulses | hex pulse ×1.6 (400ms, 2px) and ×2.0 (+110ms, 450ms, 1px) — flat-top hexagonal, never circles |
| 1.04–1.60 | impact tag | "WORKER JOINED — [CELL]" chip near cell; fades 1.46–1.60 |
| 1.16–1.34 | 4 · SUPPLY LINE | a 2.5px amber line with a leading bead draws from the chosen cell's edge toward the awakened cell's CANONICAL coordinates (180ms ease-in). Before this instant, NOTHING exists at that location — locked cells are hidden and stay hidden |
| 1.34–1.72 | 5 · CONSTRUCTION | six dark wall segments assemble around the destination, bottom wall first, 55ms cadence — five taks and a heavier final TAK (70ms). Each segment slides 8px inward + snaps 1.06 → 1.00 |
| 1.72–1.86 | 6 · CHAMBER LOCK | whole hex squash 0.96 → 1.03 → 1.00 (140ms) + ONE hex ring pulse ×1.4, α 0.7 → 0 (260ms); wax interior tone 0 → 0.25 (200ms). The one satisfying construction lock |
| 1.86–2.02 | 7 · DELIVERY | the Worker re-emerges from the chosen cell, dashes along the supply line (140ms linear), dips at the arrival notch; one honey drop falls (60ms) |
| 2.02–2.24 | 8 · MEMORY CELL 1 | fills bottom-up (140ms E-OUT), seal cap draws (80ms) |
| 2.28–2.50 | 9 · MEMORY CELL 2 | same — one learning at a time |
| 2.52–2.72 | 10 · CREST | the domain crest rises out of the cured wax: α 0 → 1, scale 1.06 → 1.00, engraved (200ms) |
| 2.72–2.90 | 11 · SIGNATURE | the domain's own beat (≤200ms; §8 matrix) |
| 2.82–3.06 | 12 · SETTLE + REGISTER | scrim 0.55 → 0 (240ms); the stage chamber crossfades onto the real board cell; the completion register rises COMPLETE at final size (12px rise, 240ms E-OUT) with every authoritative row incl. `CELL AWAKENED — [label]` |
| 3.02–3.20 | 13 · DOOR | ENTER THE HIVE stamps in (180ms); interactive at 3.20 |
| 3.20 | STABLE | SKIP fades 140ms; overlay DOM removed; watchdog 3.9s |

## 5 · Compressed ceremony — NO CELL AWAKENED (Variant B) — stable at 2.62s

Identical through the impact beats (0.00–1.60). Then: no supply line, no construction, no
empty chamber, no unexplained socket — nothing appears anywhere on the board.

| t | beat | detail |
|---|---|---|
| 1.30–1.54 | HANDOFF | scrim → 0 (240ms); register rises with FIRST FLIGHT COMPLETE + WORKER JOINED + chosen-cell label |
| 1.58–1.70 | receipts | "2 LEARNINGS KEPT" stamps (120ms) |
| 1.74–2.02 | MEMORY BEAT 1 | a small hex honey bead beside excerpt row 1 fills + seals (120ms) as the excerpt stamps in (200ms: clip inset(0 0 100% 0) → inset(0) + 1.03 → 1.00) |
| 2.08–2.36 | MEMORY BEAT 2 | same |
| 2.42–2.60 | DOOR | ENTER THE HIVE stamps; interactive 2.62 |
| 2.62 | STABLE | watchdog 3.2s |

First Flight still completes meaningfully: the Worker visibly joined, and the Hive
visibly stored both learnings — the same honey-memory language, in the register.

## 6 · Cell states

- HIDDEN — locked cells render NOTHING, ever. `BHIVE.unlocks` remains the only visibility
  authority. The ceremony never previews, silhouettes or padlocks a locked cell.
- CONSTRUCTING — exists only inside the ceremony overlay (segments, supply line, drop).
- NEWLY AWAKENED — end-of-ceremony settle: crest 0.45, wax 0.25, both memory cells sealed,
  stub lit 0.35 — eases to resting values over the final 240ms.
- PERMANENT RESTING — crest 0.30, wax 0.18, memory cells 0.25, stub 0.20, no motion.
  KEEPS: crest, restrained wax interior, one connection stub. NEVER keeps: celebration
  labels, intense glow, moving honey, continuous pulses, extra reward objects.

## 7 · Stage anchoring and the hidden-cell correction

- The overlay plays ABOVE the live app. Real board visible in viewport (≥70% of both the
  chosen cell and the awakened cell's canonical position, ≥120px apart) → actors anchor to
  real positions. Otherwise CANONICAL stage: chosen cell at (38vw, 34vh), and the awakened
  location placed along the REAL direction vector between the two cells' engine
  coordinates (bhive-engine.js:68-81), scaled to fit, clamped 12vw from edges.
- Never scroll the page to locate a cell. Never restyle live board cells — focus comes
  from clones above the scrim. The real board underneath already holds the committed
  post-unlock state, muted by the scrim.
- Demo scenario used in the storyboard (canonical to the runtime): chosen `health`
  (371,162) → awakened `craft` (278,108) — `craft` is first in `UNLOCK_ORDER`.

## 8 · The fourteen domains — authoritative crest & signature matrix

Shared family: every crest is a 1–2 stroke engraved glyph built from hex grammar
(vertices, spokes, half-walls); same stroke weight; no emoji, no app icons, no badges.
One shared construction ceremony; only the ≤200ms signature beat and interior geometry
differ. Source of names/keys/coords: `js/bhive-engine.js:68-81` — nothing invented,
renamed or omitted. (Display labels come from `cell.label`; `lw` renders MAIN PROJECT
via existing CSS uppercase.)

| # | key | label | crest | crest meaning | interior geometry | signature beat (≤200ms) | resting note |
|---|-----|-------|-------|---------------|-------------------|--------------------------|--------------|
| 1 | lw | Main Project | KEYSTONE — three-peak top block | the load-bearing chamber | one heavier top wall + two braces to centre | top wall seats LAST with a single deeper thud | slightly thicker top wall (only cell allowed one) |
| 2 | free | Freedom | OPEN GATE — bottom wall with a clean gap | a chamber with its own door | five walls + one deliberate opening | sixth wall builds, then SLIDES open | subtle gap notch in the bottom wall |
| 3 | craft | Craft | THREE-FACET SPLIT — Y to alternating vertices | raw material split true | interior faceted into three planes | facets snap into alignment, three quick settles | faint facet lines |
| 4 | money | Money | STACKED CELLS — two offset small hexes | reserves laid down in comb, never coins | base-heavy: two shallow store cells low in the interior | the two stores cap click-click | slightly denser base band |
| 5 | career | Career | LEVEL COURSE — two parallel horizontals | the steady floor everything stands on | horizontal strata lines | a tilted course settles level | one faint course line |
| 6 | growth | Growth | CONCENTRIC RING — hex within hex | a chamber that thickens from within | one inner ring wall | inner ring expands once from centre (geometric, no glow) | faint inner ring |
| 7 | finance | Next Path | FORK — one spoke splitting in two | a direction being weighed | a single interior path line that forks | both branches draw; one brightens briefly | faint fork line |
| 8 | health | Health | PULSE — the heartbeat line | the engine's beat | pulse line at mid-height | ONE controlled living pulse — wax breathes once (scale 1.015, 300ms) | pulse crest only |
| 9 | people | People | TWO LINKED POINTS — dots + bridge | no chamber stands alone | two nodes joined by a wall bridge | nodes light, the bridge draws BETWEEN them | linked-points crest |
| 10 | identity | Identity | MIRROR AXIS — vertical line, dot at top | the through-line of becoming | a single vertical axis wall | axis draws bottom-to-top; the dot seats on top | faint axis |
| 11 | clients | Client Work | HANDOFF — two half-hexes sharing a wall | work made to be handed across a wall | interior split by one shared wall | the two halves slide together, one click | faint shared-wall line |
| 12 | ink | Play | LOOSE LOOP — a single open curve | the one chamber allowed to be un-straight | emptiest interior; just the loop | the loop draws in one 120ms flick — fastest signature | faint loop |
| 13 | side | Side Builds | ANNEX — small hex on the outer wall | a build parked beside the main comb | one exterior annex notch | the annex docks onto the wall from outside | tiny annex bump |
| 14 | recruit | New Ideas | BENCH ROW — three short dashes | ideas waiting their turn | three faint dash slots along the top | the dashes tick in sequence | faint dash row |

Individual without messy: identity lives in ONE engraved glyph + ONE signature beat per
domain; walls, wax, memory row, stub and all timings are identical family-wide.

## 9 · Full-Hive before / after (professionalism proof)

Rendered in the storyboard artifact using the real 600×600 coordinates, flat-top hexes,
Core at (300,300): BEFORE = Core + lw + health + people (the `UNLOCK_START` set). AFTER =
the same board + craft (278,108) in its permanent resting state (crest 0.30, wax 0.18,
sealed memory row, one stub toward lw). The delta at rest is one quiet cell — no labels,
no glow bloom, no leftover ceremony objects. The mind map stays readable and mature.

## 10 · Reward summary — a completion register, not an object

The existing `.ff-reward-summary` keeps its DOM, order and strings and becomes a quiet
COMB-FRAME REGISTER: a hairline top rule with one small flat-top hex tick; k-rows with
small hex bullets; the two excerpt rows carry the honey-bead hexes (sealed static in
Variant A — the fills already happened in the chamber; they fill live in Variant B).
No plate, no casing, no card, no chip, no collectible object of any kind.

Authoritative content preserved exactly: `FIRST FLIGHT COMPLETE` · `WORKER JOINED` ·
chosen-cell label (lw → MAIN PROJECT) · `2 LEARNINGS KEPT` · both verbatim excerpts ·
optional `CELL AWAKENED — [label]` · `ENTER THE HIVE` · supporting line
`Your Life & Work choice` (lw only). Announcement exactly:
`First Flight complete. Two learnings kept.` Excerpts never enter any live region and are
never duplicated into decorative graphics — the memory cells and beads hold honey, not text.

## 11 · Skip, interruption, fallback, reduced motion

- SKIP ANIMATION: visible from 0.10s, top-right, safe-area offset, 44×44px target. Tap /
  Enter / Space → finalize(): cancel all animations and timers, remove overlay, present
  the settled board + complete register, focus `#ff-reward-title`. Fast-forward only;
  never dismisses; idempotent.
- ONE finished state for everything: normal completion, skip, `visibilitychange`
  (backgrounding/interruption), animation failure, and the watchdog (3.9s / 3.2s) all
  route through the same finalize(). The ceremony can never strand, restart or replay.
- Reduced motion (`reduce`, app-main.js:6): no overlay, no flight, no construction, no
  fills, no staged delays — the settled board (awakened cell already resting, if any) and
  the complete register appear with a single 160ms opacity fade. The existing live region
  announces once. All construction, honey and crest decoration is `aria-hidden`.
- No focus trap: focus moves once to `#ff-reward-title` at stable; ENTER THE HIVE is the
  next tab stop; nothing loops.

## 12 · Small-iPhone layout solutions

- Canonical stage keeps both cells inside a safe box (12vw margins); the awakened cell is
  drawn ≥64px wide even on 320px screens.
- Memory cells render only when the drawn cell is ≥48px wide; below that they merge into a
  single base honey line. Crest hides at rest below 12px drawn size (still full-size in
  ceremony frames). Board labels never shrink below 9px.
- Register: full width, excerpts full width, ENTER THE HIVE always visible above the fold
  on representative small (SE / 320×568pt) and modern (390×844pt) viewports; if content
  exceeds 70vh the register scrolls internally with the button pinned.
- The impact tag and supply line clamp to 16px gutters; the supply line may shorten but
  never exits the viewport.

## 13 · Performance & accessibility requirements (iPhone Safari)

- Transform + opacity only; clip-path only on the two excerpt rows; supply line, seal
  caps, stubs and crest strokes are SVG dash-offset; all glows are pre-baked gradients.
- No filters, no animated shadows, no backdrop-filter, no layout animation, no rAF loops;
  CSS/WAAPI with finished-promises + a single orchestrator.
- Animated-node budget: ≤8 concurrent in flight beats; ≤10 brief peak during construction
  (6 segments + ring + wax tone + bead + scrim).
- `will-change` applied at mount, removed at stable; `contain: layout style paint` on the
  overlay; overlay DOM removed at stable; zero cost on other screens.
- Decorative elements (segments, honey, crest, beads, stubs) are `aria-hidden`; the
  announcement string and excerpt handling are unchanged.

## 14 · Discarded Memory Chip elements (complete list)

Retired outright: machined casing + stepped chamfer facets · pin-1 index notch + dot ·
recessed identity strip + `HONEYCOMB MEMORY CHIP // 001` · five edge-connector pads ·
circuit-boot power line · LED node bus (worker node / memory nodes as electronics) ·
outward trace + casing edge pad · chip perimeter lock pulses · etched initial badge ·
the chip object itself and all electronic-hardware anatomy. None of it may be reskinned
into Comb Awakening.

DNA that survives, translated to comb: one gain = one ignition (memory cells + register
rows) · physical lock-in weight (chamber lock squash) · boot anticipation (supply line +
construction cadence) · deliberate one-at-a-time reward order.

## 15 · Codex preservation contract (design contract — implementation NOT authorized yet)

1. Mechanics untouched: First Flight completion + persistence, Worker creation
   (`{age:3,b:0.5,p:0.5}` guards), learnings storage, cell unlocking
   (`unlockFromAnswer`, at most one cell per teach, engine:351), reward-proof
   construction/freeze (app-main.js:3359-3366), replay behaviour, event store
   (`cell_unlocked`, engine:338).
2. `BHIVE.unlocks` stays the ONLY visibility authority (engine:305);
   `UNLOCK_START = ['lw','health','people']` (engine:94); `UNLOCK_ORDER` (engine:105);
   locked cells render nothing; no new saved-state data — the runtime keeps only the
   authoritative locked/unlocked and reward states.
3. Cell identities: keys, labels, `full`, `desc`, x/y coordinates exactly as
   bhive-engine.js:68-81. No domain invented, renamed or omitted. `lw` displays exactly
   MAIN PROJECT (engine label + existing CSS uppercase).
4. `renderFirstFlightRewardSummary` markup, classes, order, casing, `role="dialog"`,
   `#ff-reward-title` tabindex; new CSS classes only for reveal states and the comb
   register / awakening skin; every decorative addition `aria-hidden`.
5. `firstFlightExcerpt` 80-codepoint clamp; excerpts verbatim, never re-cased, classified,
   duplicated into graphics, or placed in any live region. Announcement exactly
   `First Flight complete. Two learnings kept.` — no second live region.
6. ENTER THE HIVE: dismisses the presentation only; no replay, no re-grant, no
   auto-activation; the register never auto-dismisses. Dialog semantics unchanged.
7. Board: `drawCore` (cx 300, cy 300, r 40), flat-top hex drawing (`BHIVE.hex`),
   `hexRadius(en/imp)` sizing, `.ff-worker-marker`, `applyLockStates`, ambient bees
   (drift paused only while the overlay is mounted) — all preserved; the ceremony adds an
   overlay and additive resting decoration to UNLOCKED cells only.
8. Tone guard: no sound or vibration this checkpoint; no cards, tarot, chips, circuits,
   loot boxes, coins/XP/currencies, confetti, particle clouds, screen shake, gloss, neon,
   or busy idle animation. Tokens only (`--gold --gold-2 --ink --ink-2 --sage --mono
   --serif`).
9. The ceremony writes NO state and mounts only after commit; on mount failure the plain
   3E-A summary renders with rewards intact.
10. The Memory Chip direction (Rev B–D) is superseded and must not be implemented.
