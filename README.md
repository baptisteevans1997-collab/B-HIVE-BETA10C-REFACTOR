# B HIVE Beta 10C

Audited refactor build with a local-first schema v4 learning foundation.

- App: `index.html`
- Engine regressions: `tests/test-engine.html`
- Learning regressions: `tests/test-learning.html`
- Inference regressions: `tests/test-inference.html`
- Insight UI regressions: `tests/test-insights.html`
- Experiment-loop regressions: `tests/test-experiments.html`
- Trusted-memory regressions: `tests/test-memory.html`

The v4 snapshot preserves the v3 hive state and adds append-only learning events. Existing
v3 check-ins, learnings, and unlocks migrate locally on load; no network service is required.

Stage 2 inference is deterministic and read-only. It derives distinct-day trends, neglect,
and repeated user themes, then ranks at most one primary and one secondary evidence-backed read.

Stage 3 surfaces one ranked read in the existing Today panel, shows its dated evidence, and
records user corrections as append-only feedback events. The panel stays quiet when evidence
is insufficient and closes the insight loop for the day after a response.

Stage 4 turns confirmed reads into one bounded experiment at a time. Accept, edit, decline,
and completion outcomes remain append-only events; recorded outcomes deterministically adjust
which action strategy the Hive prefers when similar evidence returns.

Stage 5A derives a bounded personal-memory model from user-confirmed insights and repeated,
independent experiment outcomes. Every memory retains its evidence, confidence, scope, and
user correction state; the module is pure and does not access the DOM, storage, or network.
