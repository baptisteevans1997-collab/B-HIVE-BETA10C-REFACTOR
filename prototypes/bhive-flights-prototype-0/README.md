# B-HIVE Flights — isolated Prototype 0

Local preview: **http://127.0.0.1:8198/**

This prototype explores one send-off, one homecoming, and a lasting record. It is not a decision about B-HIVE's final core gameplay. It implements the approved Section D brief, with the user's override that every outcome produces an equally complete cell.

## Try it

1. Tap the Forager, or choose **Choose a flight**.
2. Choose **Gather**, **Look**, or **Rest**. Add an optional intention and send the bee.
3. Use **Skip to next visit**, or reload/reopen the page. Time is deliberately mocked; there is no countdown.
4. Choose what happened, add an optional note, and **Keep this homecoming**.
5. Tap the finished cell to read its date, flight kind, outcome, intention, and note. Reload to check that it stays.
6. Try another flight. More than seven records are kept on additional comb pages.
7. Compare with **Plain mode**, which changes states instantly. **Reset** clears only this prototype, after a confirmation.

One Health chamber and one Forager are intentional. There is no prioritisation between life areas.

## The visual language

The prototype uses the original beta's dark ground, restrained gold frame, faceted bee, hexagonal cells, and a cargo-to-cell homecoming. It uses simple SVG art and local system fonts. This is prototype art.

| Flight | Cargo / cell | Material pattern |
| --- | --- | --- |
| Gather | Honey | Diagonal bands |
| Look | Pollen | Dots |
| Rest | Wax | Faceted rim |

| Outcome | Mark | Finish |
| --- | --- | --- |
| Done | Star | Complete, sealed cell |
| Partly | Waves | Complete, sealed cell |
| Not this time | Circle | Complete, sealed cell |
| Plans changed | Turning arrow | Complete, sealed cell |

All outcomes have the same filled silhouette, seal, brightness treatment within their material, and place in the comb. No outcome produces a broken, empty, diminished, or partially filled reward. The dark empty slots are future spaces, not failed outcomes.

## References used before building

The three required references were captured from the actual beta in a disposable 390 × 844 browser context. Only the local reference server was allowed; external requests and service workers were blocked. Synthetic notes were used. No existing browser profile or real hive save was used.

- [Phone hive](references/01-phone-hive.png)
- [First Honey ceremony frame](references/02-first-honey-frame.png)
- [Health cell detail](references/03-cell-detail.png)

No required reference was missing. The First Honey image is a captured frame during the existing ceremony, not an invented storyboard. The Health detail capture shows the beta's real layout, including its navigation overlay.

## Isolation and persistence

- This directory is outside the existing B-HIVE beta repository.
- Runtime files are plain HTML, CSS, and JavaScript modules. There is no package install or build process.
- The only save key is `bhive-proto-flights-0`, on the separate origin `http://127.0.0.1:8198`.
- Reset removes that key only; it never calls `localStorage.clear()`.
- No beta scripts, memory systems, Queen logic, learning systems, cloud sync, telemetry, manifests, service workers, deployment settings, or original save keys are imported or accessed.
- No outgoing API requests are implemented. Content Security Policy sets `connect-src 'none'`; the page loads only its local static files and inline SVG/data favicon.
- A flight's UUID is also its cell ID. Completion checks existing records first. Repeated completion returns the original record without changing its outcome or notes.
- Web Locks serialize storage transactions across tabs where supported. Each transaction rereads the latest save. The fallback serializes synchronous storage mutations within one page; cross-tab races in a browser without Web Locks have not been verified.
- A record is saved before any homecoming animation. Interrupting motion cannot reverse a save or award an extra cell. Failed writes show an error and preserve the form draft for retry.
- Reloading or reopening an outgoing flight makes its homecoming available. Returning to a merely backgrounded tab is not treated as a new visit; use the explicit skip control.
- Browser storage remains subject to the browser's own clearing/private-mode policies. No cross-device or offline promise is made.

## Motion

Motion explains where the bee and cargo went. Send-off circles once and leaves the perch; arrival carries the chosen material; homecoming places the cargo and reveals a fully sealed cell. The deliberate flight sequences last 1.3 seconds out / 0.95 seconds in; cargo placement is 0.65 seconds plus a 0.25-second reveal. Motion uses transforms and opacity, with no external animation library.

Plain mode, a reduced-motion preference, keyboard activation, and an unavailable animation API all use settled states. Hiding the page or enabling plain mode cancels the current animation and shows the saved state. On a phone, animated actions bring the chamber into view so the bee or cell is visible.

## Run again locally

From this directory:

```sh
python3 -m http.server 8198 --bind 127.0.0.1
```

Keep the same host and port to see the same browser-local prototype save. Do not copy these files over the beta. Nothing was deployed.

The verification report records what was actually checked and what still needs human playtesting.
