# Prototype 0 verification

Completed 31 October 2026, local Melbourne date. This report describes implementation checks, not human playtesting.

**Result: 8 state/storage tests passed; 36 browser assertions passed.** The browser run used Chrome 156.0.8078.76 through Playwright, in disposable browser contexts. No browser console/runtime errors or external network attempts were observed in the main browser run.

## What was tested

| Area | Evidence / result |
| --- | --- |
| Send-off | One active flight; a second flight is rejected while the Forager is away. Intention is stored. Send-without-a-note ignores an entered draft. Animated send-off runs. |
| Homecoming | All 12 combinations of Gather/Look/Rest and Done/Partly/Not this time/Plans changed completed through the UI. No completion is allowed before arrival. |
| Persistence | Reload while the bee is away preserves the intention and makes homecoming available. Reload during sealing preserves a completed cell. Closing and reopening a tab in the same browser context preserves the record. Exact multiline/Unicode/markup-like notes round-trip and display as text. |
| Duplicate prevention | Two immediate form submits create one cell. Twenty repeated browser completion calls preserve one original cell, including its initial outcome and note. Simultaneous completion in two tabs also creates one cell. Model tests replay completion 25 times and verify replaying an old flight cannot consume a newer flight. |
| Lasting record | Date, kind, outcome, intention, and note can be reopened. Twelve records remain stored; the first seven and subsequent records are accessible through comb paging. The first record can still be read after twelve flights. |
| Reset | Cancelling preserves the hive. Confirming removes only `bhive-proto-flights-0`, preserving an unrelated sentinel key. The comb becomes empty. Reset during sealing remains empty after pending animation callbacks settle. |
| Plain mode | Persists across reload. Homecoming has no running animation. Enabling it during send-off cancels motion and leaves the settled empty perch. |
| Reduced motion | The browser's reduced-motion preference skips send-off and homecoming motion. |
| Keyboard | Enter activates the Forager, flight choice, send-off, and homecoming actions; Space selects the outcome radio button. The chosen outcome is recorded, with instant transitions. |
| Failed storage | Simulated quota failure awards no cell and preserves the typed homecoming note. Retrying after storage recovery succeeds. Corrupt JSON is reported without overwriting the save; Reset recovers it. |
| Layout | Inspected screenshots at 1440px desktop and 390px phone widths. Checked 320px phone width as well. Both phone widths have no horizontal page overflow. |
| Outcome appearance | Inspected the rendered comb and record views. All four outcomes use complete filled hexagons and the same sealing treatment. Kind is shown with material patterns; outcome is shown with a star, waves, circle, or turning arrow. |
| Isolation | All 59 original beta baseline files retained identical SHA-256 hashes. The beta's Git status retained only its pre-existing untracked files. Prototype files live outside that repository. No service worker, cloud integration, telemetry, deployment, or package installation was added. |
| Requests | Only prototype-local static requests were allowed in browser tests; the request observer saw zero attempts to other origins. The implementation has no fetch, XHR, beacon, WebSocket, or service-worker code, and its CSP blocks connections. |

## Evidence

- [State/storage tests](verification/model.test.mjs) — run with `node --test verification/model.test.mjs` from this directory.
- [Browser checks](verification/browser-checks.js) and [31-check result](verification/browser-results.json).
- [Motion/interruption/keyboard checks](verification/motion-checks.js) and [5-check result](verification/motion-results.json).
- [Original file integrity comparison](verification/original-integrity.json).
- [Desktop finished comb](verification/desktop-comb.png), [phone finished cell](verification/phone-finished-cell.png), and [small-phone layout](verification/phone-small.png).
- [Required original references](README.md#references-used-before-building).

The Playwright scripts are function expressions for `playwright-cli run-code --filename=…`. They create and discard synthetic browser contexts. Run them only against the isolated local prototype, never a real beta session. Preview images use synthetic demonstration records and do not seed the user-facing preview.

## What remains untested

- Whether the loop is meaningful, satisfying, understandable without help, or free of guilt pressure for real people.
- The Section D playtest with the user and 2–3 other people: five flights each, varied flight choices, reopening a record after reload, and whether people can comfortably leave while the bee is out.
- The boredom comparison: five animated flights followed by three plain-mode flights. Automation is not evidence of enjoyment or retention.
- Use over a week, real daily timing, and return behaviour on a physical phone.
- Physical touch devices, iOS Safari, Android browsers, Firefox, full screen-reader testing, browser restart/crash recovery, and browser storage eviction/private-mode policies.
- Simultaneous tabs in browsers without Web Locks. The tested Chrome path uses Web Locks; the single-page fallback is not a claim of cross-tab safety on every browser.
- Offline/PWA behaviour, cross-device sync, production deployment, final art, and integration with existing B-HIVE systems. These are outside Prototype 0.

The local prototype server remains on port **8198**. The temporary, read-only reference server on **8197** was stopped after capture. The existing **8188** and **4417** server configurations were not changed.
