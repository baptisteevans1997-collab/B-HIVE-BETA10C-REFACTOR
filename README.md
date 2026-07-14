# B HIVE Beta 10C

Audited refactor build with a local-first schema v4 learning foundation.

- App: `index.html`
- Engine regressions: `tests/test-engine.html`
- Learning regressions: `tests/test-learning.html`
- Inference regressions: `tests/test-inference.html`
- Insight UI regressions: `tests/test-insights.html`

The v4 snapshot preserves the v3 hive state and adds append-only learning events. Existing
v3 check-ins, learnings, and unlocks migrate locally on load; no network service is required.

Stage 2 inference is deterministic and read-only. It derives distinct-day trends, neglect,
and repeated user themes, then ranks at most one primary and one secondary evidence-backed read.

Stage 3 surfaces one ranked read in the existing Today panel, shows its dated evidence, and
records user corrections as append-only feedback events. The panel stays quiet when evidence
is insufficient and closes the insight loop for the day after a response.
