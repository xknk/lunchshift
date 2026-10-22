---
title: Resolve TODO in test/fixtures/mini/sample.js (line 2)
accept: npm test
budget-yuan: 0.3
timeout-min: 15
---

In test/fixtures/mini/sample.js, line 2, there is this marker:

    // TODO: intentional fixture, not a chore — scan.test.js asserts on this marker, so keep the "TODO:" prefix

Resolve it properly: implement the intent, or — if it is genuinely out of
scope — replace the marker with a one-line note explaining the decision.
Touch nothing unrelated to this marker.
