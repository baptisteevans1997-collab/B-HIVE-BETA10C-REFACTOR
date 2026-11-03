# B-HIVE prototype backup

Snapshot saved on 3 November 2026. These are isolated experiments, not an approved final direction for B-HIVE.

- [Flights Prototype 0](bhive-flights-prototype-0/README.md): one Health chamber, one Forager, send-off, homecoming, and equally finished record cells for every outcome.
- [Flights RPG study 1](bhive-flights-rpg-1/README.md): separate character, equipment, quest choices, and explicitly remembered approaches.

The original B-HIVE application remains at the repository root, unchanged from commit `99c75b747e04be31db04f5669d264a539c682abc`. These prototypes do not import its runtime or access its saves, learning, or memory systems. Neither study settles the final gameplay decision; the later request to be more like “Rise” still needs a specific reference.

## Local use

From the repository root, run each prototype on its own origin:

```sh
python3 -m http.server 8198 --bind 127.0.0.1 --directory prototypes/bhive-flights-prototype-0
```

```sh
python3 -m http.server 8199 --bind 127.0.0.1 --directory prototypes/bhive-flights-rpg-1
```

If the existing local previews are already running on these ports, use those previews instead of starting duplicate servers. Keep each prototype on its original host and port to retain access to that browser's saved progress. Browser-local saves are not part of this source backup.

## Verification

At backup time, 8 Flights state/storage tests and 14 RPG state/storage tests passed (22 total). The backup copies match all 48 source files byte for byte. The existing `VERIFICATION.md` files and browser evidence describe earlier checks; browser and human playtests were not rerun for this backup. Historical reports keep their original paths and dates. Some browser capture scripts contain machine-specific output paths, which must be adapted before running on another computer.

From the repository root:

```sh
node --test prototypes/bhive-flights-prototype-0/verification/model.test.mjs
node --test prototypes/bhive-flights-rpg-1/verification/model.test.mjs prototypes/bhive-flights-rpg-1/verification/rpg.test.mjs
```

## Backup scope

This branch adds the prototype snapshots and existing First Honey design specifications and storyboard references. Amber Arrival is a retired design retained for history; Comb Awakening supersedes it. Saving these documents is not new design approval.

The original working folders, browser saves, and deployment configuration are unchanged. The branch is for source backup; do not merge or deploy it as an approved product release. Local handoff/reward notes and Queen variants previously marked “do not commit,” generated ZIP/PDF exports, temporary files, and browser logs are excluded.
