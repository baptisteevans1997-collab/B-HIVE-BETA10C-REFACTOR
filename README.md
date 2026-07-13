# B HIVE Beta 10C

Audited refactor build with a local-first schema v4 learning foundation.

- App: `index.html`
- Engine regressions: `tests/test-engine.html`
- Learning regressions: `tests/test-learning.html`

The v4 snapshot preserves the v3 hive state and adds append-only learning events. Existing
v3 check-ins, learnings, and unlocks migrate locally on load; no network service is required.
