---
title: Resolve FIXME in src/report.js (line 23)
accept: npm test
budget-yuan: 0.3
timeout-min: 15
---

In src/report.js, line 23, there is this marker:

    // FIXME: surface per-ticket verdict lines once the report format settles

Resolve it properly: implement the intent, or — if it is genuinely out of
scope — replace the marker with a one-line note explaining the decision.
Touch nothing unrelated to this marker.
