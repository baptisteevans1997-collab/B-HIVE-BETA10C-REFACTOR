# AMBER ARRIVAL REV D — HONEYCOMB MEMORY CHIP
## Step 3E-B: First Flight reward ceremony (design spec)

Date: 2026-07-31 · Status: design locked, REV D — HONEYCOMB MEMORY CHIP · ready for Codex.
Scope: presentation ONLY. Do not modify, stage, commit, push or deploy any runtime files.

Revision history: Rev B introduced a tarot plate; Rev C added a snap-flip deal. REV D
RETIRES THE TAROT CARD ENTIRELY — tarot has no mechanical meaning in B-HIVE. The reward is
now a Honeycomb Memory Chip: a purpose-built object representing what the Hive permanently
gained. The approved opening beats (hush → Worker flight → chosen-cell impact) are kept
unchanged. The card sequence (deal → charge → snap-flip → tarot ignition) is replaced by:
chip arrival → physical lock-in → circuit boot → memory-node ignition → reward stamps →
Hive entry unlocked.

This remains a skin around the authoritative `.ff-reward-summary`. The DOM, strings, order,
excerpt handling, roles and button behaviour stay identical. State is committed before the
ceremony mounts; if the ceremony fails to mount, the player gets the plain summary and
loses nothing.

Grounding: `js/ui-experiments.js:206-248` (renderFirstFlightRewardSummary),
`js/app-main.js:3355-3380` (completion flow), `css/app.css:1727-1798` (3E-A styles),
tokens `css/app.css:6-23`. Drawn storyboard + timeline: the "Amber Arrival" artifact (Rev D).

---

## 1 · What the Honeycomb Memory Chip means

The chip is the Hive's permanent record of First Flight — the player's effort converted
into memory. It is the reward PRESENTATION, not a collectible: no inventory, no rarity, no
archive system is designed or promised now (a Memory Archive may exist later; do not build
toward it). Every element maps to a real gain, readable without a tutorial:

- Worker node (lit hex beside WORKER JOINED) = the one Worker earned, linked to the chosen cell.
- Two lit memory nodes = the two player answers stored as learnings, verbatim.
- Outward trace to a casing pad = one additional cell genuinely awakened (Variant A only).
- Fully powered chip = First Flight recorded as complete, permanently part of the Hive.

Feeling: "The Hive received your effort, converted it into memory and became permanently
stronger." Warm amber neo-tech, chunky and tactile, a living beehive computer — never
tarot, playing/bank card, generic HUD, glossy cyberpunk, loot box, crypto token, or a
motherboard of unreadable circuitry.

## 2 · Emotional arc

Hush → intent → impact → keepsake → invitation.

The hive holds its breath. One Worker carries the player's effort home along a single clean
arc. The cell answers with a chunky thump. Then the Hive prints its Memory Chip: it seats
into its socket, boots, and lights one node per gain — worker, first learning, second
learning, and (only when true) one outward connection to the awakened cell. The chip
reaches full power, the border gives one last quiet lock pulse, and the door opens. The
player leaves when they choose.

## 3 · Storyboard (6 frames, mobile portrait)

Drawn frames live in the artifact. Example shows HEALTH chosen, CRAFT awakened.

- F1 · 0.30s · HUSH — scrim at 55%; Core and chosen-cell emblems lit above it; SKIP
  ANIMATION top-right; ambient bee drift paused. (Unchanged.)
- F2 · 0.80s · FLIGHT — 18px Worker mid-arc, clockwise-bowed bezier, thin amber trail.
  (Unchanged.)
- F3 · 1.20s · IMPACT — Worker enters the cell; snap 0.94 → 1.05 → 1.00; flash 0.70; two
  hex pulses; impact tag "WORKER JOINED — HEALTH"; WORKERS 1 pops. (Unchanged; the floating
  label is called the IMPACT TAG from Rev D on, to avoid colliding with "chip".)
- F4 · 1.72s · LOCK-IN — the chip arrives DARK from the fed cell's direction (0.94 → 1.04 →
  1.00), corner facets seat, one amber pulse travels the casing perimeter, the page dims a
  notch. A component seating into a socket — no white-out, no shake.
- F5 · 2.50s · CIRCUIT BOOT — power line lights from the plate edge into the honeycomb
  core; the five core cells light in order; header comes online (identity line + FIRST
  FLIGHT COMPLETE); the memory bus extends down; worker node ignites first (WORKER JOINED,
  HEALTH); memory node 1 ignites and its inscription stamps; node 2 still dark.
- F6 · 3.18s · POWERED — everything lit: both memory nodes + inscriptions, the outward
  trace and casing pad for CELL AWAKENED — CRAFT, one final restrained border pulse, ENTER
  THE HIVE active. No scrim, no SKIP. Waits forever.

## 4 · Timeline (seconds from mount)

Variant A (cell awakened) → stable at 3.18s. Variant B (none) → stable at 3.02s. Both
inside the 2.8–3.2s envelope. The summary NEVER auto-dismisses.

Beats 0.00–1.50 are unchanged from the approved design:

| t | beat | detail |
|---|---|---|
| 0.00–0.30 | ARRIVAL | scrim 0 → 0.55 (E-OUT); actors fade in 150ms; ambient drift paused |
| 0.10–0.25 | control | SKIP ANIMATION fades in |
| 0.30–0.50 | target lock | chosen-cell rim 0.6 → 1.0 |
| 0.35–0.55 | launch | Core recoil 1 → 0.98 → 1 (200ms); Worker spawns, scale 0.6 → 1.0 (120ms) |
| 0.47–1.07 | FLIGHT | 620ms quadratic bezier (E-DIVE); trail draws behind |
| 1.07–1.16 | entry | Worker into cell centre, scale → 0.5, opacity → 0 (90ms) |
| 1.07–1.35 | IMPACT snap | cell 1.00 / 0.94 (25%) / 1.05 (64%) / 1.00 — 280ms |
| 1.07–1.55 | flash | 0 → 0.70 (80ms) → 0.18 (400ms), holds |
| 1.14–1.76 | pulses | hex pulse 1 ×1.6 (450ms); pulse 2 ×2.0 (500ms, +120ms) |
| 1.19–1.39 | impact tag | "WORKER JOINED — [CELL]" pops near the cell |
| 1.27–1.45 | reveal | "WORKERS 1" pops under the cell label |

Rev D chip beats:

| t | beat | detail |
|---|---|---|
| 1.50–1.90 | HANDOFF | scrim 0.55 → 0 (400ms); actors fade 300–350ms; impact tag fades 1.57–1.72 |
| 1.50–1.68 | CHIP ARRIVAL | chip lands FACE-FORWARD but DARK, at final size, arriving from the fed cell's direction (28px travel): scale 0.94 → 1.04 → 1.00 slam. Weighty, never a polite fade |
| 1.64–1.76 | LOCK-IN | 4 corner facets seat 6px → 0 (120ms); background dims an extra 4% for 120ms. No white-out, no shake, no particles |
| 1.74–1.98 | border lock pulse | one amber pulse travels the casing perimeter (dash-offset, 240ms, 0.9 → 0 tail) |
| 1.76–1.92 | CIRCUIT BOOT — power line | 2.5px amber line draws from the plate edge (fed-cell side) into the core socket (160ms, ease-in) |
| 1.86–2.04 | header online | identity line + FIRST FLIGHT COMPLETE stamp in (1.05 → 1.00, 180ms) |
| 1.90–2.10 | CIRCUIT BOOT — core | the 5 honeycomb core cells light in order, 40ms stagger; core glow 0 → 0.5; 3 of 5 edge pads light. Deliberate, never all at once |
| 2.10–2.32 | WORKER LINK | worker node LED lights (140ms, scale 1.2 → 1.0, one ring ×1.3 0.5 → 0); WORKER JOINED + chosen-cell label stamp at 2.14 (180ms). `lw` displays exactly MAIN PROJECT |
| 2.32–2.44 | receipts | "2 LEARNINGS KEPT" stamps; the memory bus extends down to the nodes |
| 2.42–2.68 | MEMORY 1 | node 1 ignites (140ms) → inscription 1 stamps: inset(0 0 100% 0) → inset(0) + 1.03 → 1.00 (200ms) |
| 2.62–2.88 | MEMORY 2 | node 2 ignites → inscription 2 stamps, same treatment. One gain at a time |
| 2.86–3.08 | AWAKENED (Variant A only) | one outward trace pulse (120ms) from the bus to the register + through to the casing edge pad; register + socket node light (160ms). Node ×0.7, single pulse, no clamp — clearly secondary |
| 3.02–3.18 | FINAL UNLOCK | one restrained perimeter pulse at 0.4 (200ms); the remaining edge pads light (all 5 lit); supporting footer line (lw only) + ENTER THE HIVE stamp in; button interactive at 3.18; focus → `#ff-reward-title` |
| 3.18 | STABLE | SKIP fades (150ms); overlay DOM removed; watchdog 3.9s |

Variant B: the outward trace, socket node and register DO NOT EXIST — no empty socket, no
dead stub, no reserved gap. FINAL UNLOCK runs 2.86–3.02; stable 3.02; watchdog 3.6s.

## 5 · Motion values, chip anatomy, states and node logic

Easing tokens (unchanged):

- E-OUT `cubic-bezier(0.16, 0.84, 0.28, 1)` — reveals, scrim, pulses
- E-DIVE `cubic-bezier(0.55, 0.04, 0.85, 0.50)` — Worker flight
- E-SNAP — the 280ms keyframed squash (impact); the chip slam reuses its settle feel
- Opacity fades linear unless noted

Flight geometry (unchanged): Worker 18px min 16, tilt ≤15°; bezier control at midpoint +33%
perpendicular clockwise, clamp 90px, constant 620ms; trail 2px at 0.35; hexagonal pulses
only; impact tag placement 12px above the cell (lower half) or 6px below its label (upper
half), clamped to 16px gutters.

Chip anatomy (one decisive form):

- Substantial vertical plate on the existing mobile reward footprint; STEPPED double-facet
  hex-corner silhouette (machined look; a STATIC clip-path, never animated) with a pin-1
  index notch + dot at the top-left shoulder — the silhouette alone should be recognisable.
- Thick dark outer casing (≈12px band, near-black) + warm amber inner frame
  (rgba(226,200,144) family, tokens only). Dimension via the house SVG technique — additive
  gradient underlays only: 1px top-light bevel (≤0.16 alpha), socket-well inner shadow, and
  a soft seat shadow under the plate. Matte and chunky — never gloss, never brushed texture.
- Five gold edge-connector pads along the bottom rim — decorative power rails that charge
  with the ceremony: dark at arrival, three lit at boot, all five at full power. Min 12px
  wide on small screens.
- Identity line `HONEYCOMB MEMORY CHIP // 001` — mono, 6.5–8px, letter-spaced, dim amber,
  engraved in a recessed strip at the top. Ornament, `aria-hidden`, NOT a
  numbering/collectible system.
- Individual mark: a small etched hex badge beside the identity strip carrying the chosen
  cell's initial (MP / H / P) — deterministic per flight, three variants only, decorative,
  `aria-hidden`. It makes the chip read as THIS player's chip, not a template.
- Recessed socket well (darker inset panel) holding the five-cell honeycomb memory core
  (the 5 comb hexes, R≈9 at storyboard scale) with the simple Worker bee symbol beneath.
- LEFT MEMORY BUS: one vertical 2px trace linking worker node → memory node 1 → memory
  node 2, with honeycomb-angle bends (120°, never 90° PCB grids). Few, thick, readable.
- Nodes: hex LEDs — worker node R7-equivalent, memory nodes same, awakened socket ×0.7.
- Registers top → bottom: identity · FIRST FLIGHT COMPLETE · core well · WORKER JOINED +
  cell label · 2 LEARNINGS KEPT · inscription 1 · inscription 2 · [awakened register +
  outward trace to a small casing-edge pad, Variant A only] · supporting footer line (lw
  only) · ENTER THE HIVE.
- Headers centred; node rows and inscriptions left-set for reading. Inscriptions keep the
  authoritative excerpt styling (2px gold left bar, dark ground) and full mobile width.

Chip states:

- INACTIVE (1.50–1.76): casing and inner frame visible, face dark — no header, registers
  hidden, core hexes as faint strokes (~0.16), all five edge pads dark. The chip must
  clearly read as "not yet on".
- BOOTING (1.76–2.10): power line lit, core cells igniting in order, header + identity
  strip + cell badge stamping in, glow rising to 0.5, three edge pads lighting with the core.
- POWERED (stable): all nodes lit, traces at 0.25 rest glow, core glow 0.5–0.6, casing
  border at full amber, all five edge pads lit; one restrained perimeter pulse marks the
  moment, then rest.

Node logic:

- Worker node lights FIRST, always, immediately after core boot — then its strings.
- Exactly two memory nodes, ignited one after another; each node's inscription stamps only
  after its node lights. Excerpts stay verbatim inside their authoritative summary nodes —
  never duplicated into decorative graphics, never in a live region.
- The awakened pathway (trace + socket + register + edge pad) renders ONLY in Variant A.
- Full power = recorded. ENTER THE HIVE activates last, never auto-fires.

## 6 · Final layout & hierarchy (stable state)

The stable screen is the existing `.ff-reward-summary` DOM in its normal slot wearing the
chip skin: same section, children, strings and order. The ceremony never re-parents it; the
decorative casing/traces/nodes live in one `aria-hidden` SVG layer behind the content. The
chip lands at final size, so excerpt length (clamped upstream at 80 codepoints by
`firstFlightExcerpt`) never causes a layout jump. Desktop: plate max-width ≈ 420–480px,
centred in its panel. Layer stack while playing (top → bottom): SKIP → impact-tag/actors/
pulses → scrim → live app; the chip is page-owned, below the scrim until HANDOFF.
Stage anchoring for the flight beats is unchanged (ANCHORED when board nodes are ≥70%
visible and ≥120px apart, else CANONICAL Core (35vw, 30vh) / cell (65vw, 58vh); never
scroll mid-ceremony; never restyle live board cells).

## 7 · Skip, interruption, reduced motion

- SKIP ANIMATION: top-right, safe-area offset, mono 10px, 44×44px target, visible 0.10s →
  stable. Activation → finalize(): cancel every animation and timer, remove overlay DOM,
  present the chip FULLY POWERED, focus `#ff-reward-title`. Fast-forward only — it never
  dismisses the summary, never re-fires rewards. Idempotent.
- The same finalize() runs on `visibilitychange` (backgrounded/interrupted tab) and on the
  watchdog (3.9s / 3.6s). The ceremony can never strand or restart.
- Reduced motion (`app-main.js:6` `reduce` flag): no overlay, no chip travel, no slam, no
  circuit-travelling animation, no staged delays — the complete POWERED chip appears with a
  single 160ms opacity fade; board marker present from first paint. The existing in-markup
  live region announces exactly once: "First Flight complete. Two learnings kept."
  Excerpts never enter any live region. All decorative chip components are `aria-hidden`.

## 8 · Performance (iPhone Safari)

- Animate `transform` and `opacity` only; `clip-path` solely on the two inscription blocks
  (the chamfered casing clip-path is static). Power line, bus, border pulses and the
  outward trace are SVG stroke dash-offset. Never animate filters, shadows, layout
  properties, or `backdrop-filter` (unused).
- Glow and node halos are pre-baked gradient elements toggled by opacity.
- CSS animations / WAAPI with finished-promises; one orchestrator; no rAF loops, no
  setTimeout chains. Low Power Mode / throttling covered by finalize() paths.
- `will-change` at mount, removed at stable; ≤8 concurrently animated nodes during the
  flight and a brief ≤10 peak in the boot window (power line, border pulse, comb cells,
  node ring); `contain: layout style paint` on the overlay; overlay DOM removed at stable.
- Ceremony code additive and lazy — zero cost on every other screen.

## 9 · Removed from Rev C (exact list)

1. Card deal face-down + the card back (honeycomb lattice + Queen sigil) — the chip
   arrives face-forward, dark.
2. The 200ms scaleX SNAP FLIP and its amber edge flash — replaced by lock-in + circuit boot.
3. The hard-edged shine sweep — gone entirely, no replacement.
4. Tarot numeral `· I ·` — replaced by the identity line `HONEYCOMB MEMORY CHIP // 001`.
5. Corner hex-diamond sigils — replaced by the casing's chamfered corner facets.
6. The ornament divider (line + diamond) — replaced by honeycomb-angle traces/bus.
7. The self-drawing inner hairline — its energy moves into the power line + border pulse.
8. All tarot vocabulary (deal, face, plate-as-card) from labels, class names and docs.

The five-cell comb + Worker emblem survives, recast as the memory core in its socket well.

## 10 · Preserve unchanged (Codex contract)

1. `renderFirstFlightRewardSummary()` markup, classes, order and casing — `.ff-reward-live`
   text "First Flight complete. Two learnings kept.", `FIRST FLIGHT COMPLETE`,
   `WORKER JOINED`, chosen-cell label, `2 LEARNINGS KEPT`, both verbatim excerpts,
   `CELL AWAKENED — [label]` (em-dash), `ENTER THE HIVE`, `role="dialog"`,
   `#ff-reward-title` tabindex. New CSS classes only for reveal states and the Rev D chip
   skin (arrival, lock, boot, node states); casing, traces, nodes, identity line are
   decorative `aria-hidden` additions.
2. `firstFlightExcerpt()` 80-codepoint clamp; excerpts verbatim — never retyped, re-cased,
   classified, duplicated into graphics, or placed in any live region.
3. First Flight mechanics: completion, persistence, Worker creation (worker
   `{age:3, b:0.5, p:0.5}`), learnings, cell unlocking, reward-proof construction, replay
   behaviour — untouched. The ceremony writes NO state and mounts only after commit.
4. Cell naming: displayed destination = `model.cellLabel` (engine `Main Project` → CSS
   uppercase → MAIN PROJECT); the impact tag uses the same string; never invent
   "Life & Work · Main Project". `supportingLabel: 'Your Life & Work choice'` for `lw`.
   Chooser strings in `FIRST_FLIGHT_LABELS` untouched.
5. Board rendering: `.ff-worker-marker`, workers count, cell resting styles, ambient bees
   (drift paused only while the overlay is mounted), status chip, sector/grid labels,
   legend, help tile.
6. Accessibility: NO new live region, no second announcement, announcement string unchanged.
7. ENTER THE HIVE: dismisses the presentation only — no replay, no re-completion, no
   auto-activation; the summary never auto-dismisses. Dialog semantics unchanged.
8. Tone guard: no sound, vibration, confetti, coins, XP, loot, white-outs, screen shake,
   Queen dialogue; tokens only (`--gold --gold-2 --ink --ink-2 --sage --mono --serif`).
   `// 001` is ornament — no inventory, collectible or Memory Archive system.
9. `css/app.css:1727-1798` (3E-A block) — additive changes only.

## 11 · Visual risks and small-iPhone solutions

1. The 3E-A summary screenshot never transmitted — settle state grounded in live markup/CSS
   (`ui-experiments.js:206`, `app.css:1727`); verify the running screen before sign-off.
2. Bright MAIN PROJECT resting outline during the hush — uniform scrim + clones; never dim
   cells individually. (Unchanged.)
3. Ambient bees near the Core mid-flight — drift paused while the overlay is mounted.
4. Board off-viewport at completion on mobile — CANONICAL anchor mode; never scroll.
5. Desktop: board right, chip left — the impact tag → chip baton pass crosses the screen;
   150ms overlap + identical wording carry the eye; the tag fades only after the chip
   header is online.
6. SMALL iPHONES (SE width): the casing band, chamfers and socket well compress FIRST
   (core min 96px tall, nodes min 12px); inscriptions keep full width; ENTER THE HIVE must
   never approach the fold. The identity line may drop to 6px or hide below 320px width.
7. Trace discipline: few, thick, 120° honeycomb-angled traces. If the face starts reading
   as a motherboard of fine circuitry, DELETE traces — never thin them.
8. Lock-in discipline: flat translate/scale only — no 3D tilt, no white-out, no shake; the
   chip is DARK until boot; never pre-light registers.
9. The awakened socket/trace/pad exists only in Variant A — Variant B renders no empty
   socket, no dead stub, no reserved gap, no unexplained inactive element.
10. The awakened connection stays subordinate: one outward pulse, ×0.7 node, no clamp.
11. If the awakened cell equals the chosen cell (edge case), light the awakened register
    and socket only; skip the board echo — the fed cell already glows.
12. `role="dialog"` focus deferred to stable/skip (no mid-flight viewport jump).
13. Chakra Petch is a webfont, loaded long before the reward — no FOUT during stamps;
    confirm once on device.
14. Realism discipline: physicality comes from FORM (stepped facets, notch, pads, recessed
    strip) plus gradient underlays only — the house SVG rule. No gloss, no brushed
    textures, no photoreal shading; if a feature needs soft shadows everywhere, cut the
    feature. Edge pads min 12px on SE screens; the index notch may collapse below 340px
    width; the cell badge hides before the identity strip does.
