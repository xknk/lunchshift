---
title: Show per-ticket pass/fail verdicts in lunchshift report
accept: npm test
budget-yuan: 0.3
timeout-min: 15
---

`lunchshift report` currently lists done reports by title only. Each done
report's frontmatter carries a machine-readable `status:` field (the batch
runner writes it; value seen so far: `passed`).

Surface it: in `src/report.js` `printReport`, parse `status:` from each done
report's frontmatter and show a verdict marker per ticket line, e.g.:

    - [pass] ls-1-... — Resolve FIXME in src/report.js
    - [FAIL] ls-2-... — Resolve TODO in test/fixtures/mini/sample.js

Treat any status other than `passed` as FAIL. Also update the now-outdated
comment in `src/report.js` that claims verdicts cannot be surfaced — that is
no longer true once this ticket lands. Change nothing else about the output,
and extend the tests if practical.
