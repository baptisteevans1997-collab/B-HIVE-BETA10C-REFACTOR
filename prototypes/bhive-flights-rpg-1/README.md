# B-HIVE Flights — RPG study 1

Local preview: **http://127.0.0.1:8199/**

Original Flights comparison: **http://127.0.0.1:8198/**

The user chose two RPG priorities: (1) growing a bee character through abilities/equipment, and (3) quests with objectives and choices. This separate local study adds those to Flights. It keeps one Health chamber, one Forager, equally finished cells for every outcome, plain mode, reduced motion, Reset, and independent storage.

## What to try

1. Open **Character & kit**. Name your Forager and equip the **Moss Cloak**. Save.
2. Visit the quest board. Choose **A Quiet Landing**, then **Find a quiet moment**.
3. Select **Take the gentler version**. The objective changes. Add an optional personal plan.
4. Send your Forager. Use **Skip to next visit** to test the homecoming now.
5. Choose any outcome and keep the homecoming. Every outcome gets a complete, sealed cell.
6. Choose **Remember this approach**, give it a name, and teach it to your Forager.
7. Return to camp. The approach is now in your Forager's field guide. Selecting it restores the route, tool, and plan for another quest.

Character growth here means building a personal repertoire that can actually be reused. It is explicitly chosen by the user. It does not infer personal ability or mastery from a task count and does not call the beta's memory or learning systems.

## Equipment and abilities

| Tool | Ability | Actual effect |
| --- | --- | --- |
| Amber Lantern | Scout | Adds a homecoming field for a clue about what helped, surprised you, or got in the way. The clue stays in the record. |
| Gatherer's Satchel | Prepare | Lets you pack an optional first step. It stays visible during the quest and homecoming and is kept in the record. |
| Moss Cloak | Lighten | Changes the selected quest to a gentler objective. That choice is saved with the quest and any remembered approach. |

All three starter tools are available immediately. One is equipped at a time and appears on the bee. Equipment can be changed before a quest or after its homecoming. The bee's name can be edited during a quest; homecoming drafts are preserved. Each completed record keeps the name and equipment that were present at send-off.

## Quests and choices

| Quest | Flight | Approaches |
| --- | --- | --- |
| The Small Provision | Gather / honey | Prepare something; take the open path |
| The Hidden Clue | Look / pollen | Follow your energy; read your surroundings |
| A Quiet Landing | Rest / wax | Find a quiet moment; leave something behind |

Approaches change the objective and prompts. Equipment changes the available action or observation. This is a small prototype of choice and character development, not a complete RPG campaign, combat system, or procedural world.

Every outcome uses the same complete cell finish. Done = star; Partly = waves; Not this time = circle; Plans changed = turning arrow. Any outcome may become a remembered approach if the user explicitly chooses it. There are no XP bars, numeric levels, coins, streaks, loot drops, or loss of progress for time away.

## Isolation

- Directory: a separate sibling of Prototype 0, outside the beta repository.
- Origin: `http://127.0.0.1:8199`.
- Save key: `bhive-proto-flights-rpg-1`; schema version 2.
- No imports from or migrations of the original Flights save.
- Reset removes only the RPG key. It resets the character, gear, records, and field guide in this study.
- The original beta, Prototype 0, original saves, memory systems, and deployment are unchanged.
- No new plugin, MCP, framework, package, cloud service, telemetry, service worker, or build step is required or installed.
- The runtime uses local HTML, CSS, JavaScript, and SVG; CSP blocks outgoing connections.

## Reference and art continuity

The original beta references captured before Prototype 0 are retained in the adjacent `bhive-flights-prototype-0/references/` folder: phone hive, First Honey ceremony frame, and Health detail panel. The chamber, cell finish, bee silhouette, and palette continue that study. No reference was missing for the inherited visual direction.

The three equipment icons and wearable shapes are simple new SVG prototype art, not claimed to reproduce an existing RPG equipment reference. No final RPG art reference has been supplied or selected.

## Running locally

From this directory:

```sh
python3 -m http.server 8199 --bind 127.0.0.1
```

Run state tests with `node --test verification/model.test.mjs verification/rpg.test.mjs`.

The scripts in `verification/` are for disposable Playwright browser contexts. Test outcomes and remaining limits are recorded in `VERIFICATION.md`.

## Plugins / MCPs

No extra integration is necessary for this stage. Coding, local browser checks, documentation lookup, and simple SVG assets are already covered. A plugin or MCP gives the assistant access to an external tool or service; it does not automatically add a feature to the shipped app. Add a service only when there is a concrete need, such as a chosen external art workflow or an approved account/cloud-save design.
