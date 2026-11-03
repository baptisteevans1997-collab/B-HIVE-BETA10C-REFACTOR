# RPG study verification

31 October 2026. Local implementation checks, not human playtesting.

**14 state/storage tests and 29 browser assertions passed.** Browser: Chrome 156.0.8078.76. All browser tests used disposable contexts and synthetic data.

## Confirmed

- Character name and equipped tool survive reload.
- Each tool has its specified effect: Lantern saves an observation; Satchel carries and saves a first step; Cloak changes the objective to the gentler route.
- Equipment cannot change during an active quest. The bee's name remains editable.
- Switching equipment before departure preserves the personal plan and packed-step draft.
- Renaming during homecoming preserves the selected outcome, observation and note; those fields save correctly afterwards.
- Both branches of all three quests work through the UI. The model additionally checks all 18 tool/quest/branch combinations.
- All four outcomes remain complete records; the inherited model tests cover all 12 flight/outcome combinations. The rendered complete cells retain the original outcome symbols and finishes.
- A remembered approach survives reload. Reusing it restores its plan, equipment and gentler-route choice without awarding a cell or starting a quest automatically.
- Any outcome can become a remembered approach when explicitly chosen by the user.
- Repeated homecoming submits and 20 completion replays preserve one original record. Repeated teaching submits preserve one field-guide entry.
- Existing state tests continue to pass for one active Forager, arrival gating, exact note persistence, replay protection, stale IDs, quota failure, corrupt saves, and Reset isolation.
- RPG Reset removes only the RPG save, resets character and field guide, and leaves unrelated and original-key sentinel entries intact.
- Plain mode and reduced motion work with the RPG interactions.
- Desktop at 1440px, phone at 390px, and small phone at 320px were checked. Both phone widths have no horizontal page overflow. The character sheet fits the phone width and can scroll vertically.
- No browser errors or attempted external network requests were recorded in the main browser suite.
- All 24 files in the Prototype 0 baseline and all 59 original beta baseline files retain their SHA-256 hashes. Neither existing app was changed.

## Evidence

- [State/storage tests](verification/model.test.mjs) and [RPG model tests](verification/rpg.test.mjs).
- [Main browser checks](verification/browser-checks.js) and [27 results](verification/browser-results.json).
- [Draft-preservation checks](verification/draft-check.js) and [2 results](verification/draft-results.json).
- [Isolation comparison](verification/isolation-results.json).
- [Character sheet](verification/character-desktop.png), [quest and ability](verification/quest-desktop.png), [phone character sheet](verification/character-phone.png), and [phone quest record](verification/rpg-comb-phone.png).

## Remaining limits

- No real-person test of enjoyment, comprehension, motivation, or whether the equipment and quests feel sufficiently like an RPG.
- No physical-device, Safari, Firefox, full screen-reader, browser restart/crash, or storage-eviction testing for this study.
- No dedicated cross-tab race test was rerun for the RPG additions. The inherited completion path still uses Web Locks; repeated same-page actions and model replays were tested here. Prototype 0's two-tab completion check remains documented separately.
- No claim that a saved approach proves real-world mastery. Learning is an explicit user choice in this isolated prototype, with no beta memory-engine inference.
- No campaign, combat, world exploration, procedural content, XP, levels, currency, cloud accounts, offline/PWA support, production integration, or deployment was added.
- The RPG equipment is new SVG prototype art. No final equipment art reference has been supplied or selected.

The local RPG server remains on port **8199**. The original Flights comparison remains on **8198**. No new plugin, MCP, dependency, or account was installed or connected for the build.
