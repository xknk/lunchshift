---
id: ls-1-todo-let-budget-yuan-timeout-min
title: Resolve TODO in src/tickets.js (line 83)
status: passed
cost-yuan: 0.1180
rounds: 22
budget-truncated: false
session: batch-ls-1-todo-let-budget-yuan-timeout-min
worktree: C:\Users\24387\AppData\Local\Temp\deepseeker-code-worktrees\自研-lunchshift-7ee7513b\batch-ls-1-todo-let-budget-yuan-timeout-min\ls-1-todo-let-budget-yuan-timeout-min
branch: dsc-wt-batch-ls-ls-1-todo-let-budget-yuan-timeout-min
---

# 挂机任务报告：Resolve TODO in src/tickets.js (line 83)

- 状态：✅ 通过验收
- 结算单：22 轮 · ¥0.1180 · 缓存命中 97% · 1.7min
- 本轮 receipt：22 轮 · ¥0.1180 · 缓存命中 97% · 99s

## 任务

In src/tickets.js, line 83, there is this marker:

    // TODO: let --budget-yuan / --timeout-min CLI flags override the per-ticket defaults

Resolve it properly: implement the intent, or — if it is genuinely out of
scope — replace the marker with a one-line note explaining the decision.
Touch nothing unrelated to this marker.

## 模型收尾汇报

I'll start by reading the file to understand the context around that marker.Now let me find where these functions are called and how the CLI parses flags.I'm working inside a batch worktree. Let me read the CLI and tests fully.Now I understand the gap: `renderTicketMd` hardcodes `0.3`/`15`, and `cli.js` never parses those flags. I'll wire the override through properly.The indent-drift bug hit one block (as my memory warned). Let me read the actual state and fix it.Drift comes from the leading indent of the block's first line. I'll retry the same region with the anchor line unindented.The edit reported success but the text didn't actually change — the tool's tolerance matched a variant. I'll rewrite the file completely with the exact content (only the broken lines differ).Diffs are clean now. Two small robustness checks: the missing-value edge case and whether `report.js` parses this frontmatter.`report.js` only parses `title`, so nothing else depends on the shape. One last touch: a flag passed with no value should error, not be silently ignored.Fixing the last indentation slip by rewriting `src/cli.js` in full (I now have every line).Both diffs are minimal and correct. Let me record what I learned about the edit tool's drift behavior, since it cost extra rounds.The TODO is resolved by implementing it — the marker is gone and the flags now work end to end.

**What changed**

`src/tickets.js`
- Replaced the TODO with `DEFAULT_BUDGET_YUAN = 0.3` / `DEFAULT_TIMEOUT_MIN = 15` constants, so the defaults live in one named place.
- `findingToTicket(root, f, i, caps)` now stamps `budgetYuan`/`timeoutMin` onto every ticket (hygiene and marker tickets alike), falling back to the defaults when `caps` is empty.
- `renderTicketMd` writes `budget-yuan` / `timeout-min` from the ticket instead of the hardcoded literals.
- `writeTickets(repo, findings, caps)` passes the caps through.

`src/cli.js`
- `parseArgs` recognizes `--budget-yuan N` and `--timeout-min N`.
- A small `positiveNumber` guard rejects non-positive/non-numeric values (`--budget-yuan expects a positive number, got: abc`) and sets exit code 1 instead of silently writing a bogus cap; a flag given with no value at all also errors rather than being ignored.
- The `scan` branch validates first, then forwards `{ budgetYuan, timeoutMin }` to `writeTickets`.
- Usage text lists the new flags.

**Verification**: reviewed `git diff` per file — both diffs contain only the above hunks, no reflowed or unrelated lines. `report.ts`-style consumers are safe: `report.js` only parses `title`, so the frontmatter change breaks nothing. I did not run `npm test` (no shell execution available in this session), and I deliberately didn't add a test file, to stay inside the "touch nothing unrelated" boundary.

One caveat worth knowing: `renderTicketMd` keeps its `?? DEFAULT_*` fallback, so any caller that hands it a hand-built ticket without caps still yields `0.3`/`15`, as before.

## 验收

命令：`npm test` → exit 0

输出尾部：

```
npm warn Unknown user config "NODE_OPTIONS". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown user config "NODE_OPTIONS". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm notice run lunchshift@0.1.0 test
npm notice run node --test
TAP version 13
# Subtest: test\\fixtures\\mini\\sample.js
ok 1 - test\\fixtures\\mini\\sample.js
  ---
  duration_ms: 61.4333
  type: 'test'
  ...
# Subtest: finds planted TODO markers
ok 2 - finds planted TODO markers
  ---
  duration_ms: 2.4056
  type: 'test'
  ...
# Subtest: flags missing README and LICENSE hygiene
ok 3 - flags missing README and LICENSE hygiene
  ---
  duration_ms: 0.6253
  type: 'test'
  ...
# Subtest: summary lines are human-readable
ok 4 - summary lines are human-readable
  ---
  duration_ms: 0.5463
  type: 'test'
  ...
1..4
# tests 4
# suites 0
# pass 4
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 118.8708
```


## 被拒工具调用（fail-closed 记录）

无。

## Diff 摘要（worktree 相对基座，未提交，待人工处置）

改动在独立 worktree（分支 `dsc-wt-batch-ls-ls-1-todo-let-budget-yuan-timeout-min`，路径 C:\Users\24387\AppData\Local\Temp\deepseeker-code-worktrees\自研-lunchshift-7ee7513b\batch-ls-1-todo-let-budget-yuan-timeout-min\ls-1-todo-let-budget-yuan-timeout-min）。处置：检查满意 → 在 worktree 内 commit 并合回主仓；丢弃 → 删除该 worktree 目录 + `git worktree prune` + `git branch -D <分支>`。

`````diff
[Worktree Diff | 省略中间约 4 行，保留首 60 + 末 60 行]
diff --git a/src/cli.js b/src/cli.js
index d137f13..9fa8c23 100644
--- a/src/cli.js
+++ b/src/cli.js
@@ -9,7 +9,8 @@ const VERSION = '0.1.0';
 const usage = `
 lunchshift — give your repo the lunch shift.
 
-  lunchshift scan   [dir] [--dry]              find chores, write agent tickets (default)
+  lunchshift scan   [dir] [--dry] [--budget-yuan N] [--timeout-min N]
+                                               find chores, write agent tickets (default)
   lunchshift run    [dir] [--window HH:MM-HH:MM]  hand tickets to the deepseeker-code agent
   lunchshift report [dir]                      what did the agent get done?
   lunchshift status [dir]                      alias of report
@@ -26,11 +27,25 @@ const parseArgs = (args) => {
   for (let i = 0; i < args.length; i++) {
     if (args[i] === '--dry') flags.dry = true;
     else if (args[i] === '--window') flags.window = args[++i];
+    else if (args[i] === '--budget-yuan') flags.budgetYuan = args[++i] ?? '';
+    else if (args[i] === '--timeout-min') flags.timeoutMin = args[++i] ?? '';
     else rest.push(args[i]);
   }
   return { flags, dir: rest[0] || '.' };
 };
 
+// Numeric flag guard: undefined = flag absent (keep the default), NaN = bad input.
+const positiveNumber = (raw, flag) => {
+  if (raw === undefined) return undefined;
+  const n = Number(raw);
+  if (!Number.isFinite(n) || n <= 0) {
+    console.error(`${flag} expects a positive number, got: ${raw}`);
+    process.exitCode = 1;
+    return NaN;
+  }
+  return n;
+};
+
 export const runCli = (argv) => {
   const [cmd, ...rest] = argv;
   if (cmd === '--version' || cmd === '-v') { console.log(VERSION); return; }
@@ -40,12 +55,15 @@ export const runCli = (argv) => {
   const repo = path.resolve(dir);
 
   if (cmd === 'scan') {
+    const budgetYuan = positiveNumber(flags.budgetYuan, '--budget-yuan');
+    const timeoutMin = positiveNumber(flags.timeoutMin, '--timeout-min');
+    if (Number.isNaN(budgetYuan) || Number.isNaN(timeoutMin)) return;
     const findings = scanRepo(repo);
     console.log(`found ${findings.length} chore(s):`);
     summarizeFindings(findings).forEach((l) => console.log(`  - ${l}`));
     if (flags.dry) { console.log('(dry run — no tickets written)'); return; }
     if (!findings.length) { console.log('nothing to do — go enjoy your lunch.'); return; }
-    const files = writeTickets(repo, findings);
+    const files = writeTickets(repo, findings, { budgetYuan, timeoutMin });
     console.log(`\nwrote ${files.length} ticket(s) to .deepseeker-code/batch/pending/`);
     console.log('hand them to the agent and go eat:');
     console.log('  lunchshift run --window 12:00-14:00');
diff --git a/src/tickets.js b/src/tickets.js
index 8ed1540..1e40807 100644
--- a/src/tickets.js

[... ⚠️ 中间 4 行已隐藏 ...]
 
+// Per-ticket caps written into the frontmatter. `scan` overrides them with
+// --budget-yuan / --timeout-min; these are the defaults when it does not.
+export const DEFAULT_BUDGET_YUAN = 0.3;
+export const DEFAULT_TIMEOUT_MIN = 15;
+
 const slug = (s) =>
   s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 32) || 'chore';
 
@@ -59,10 +64,12 @@ const HYGIENE_TICKETS = {
   },
 };
 
-export const findingToTicket = (root, f, i) => {
+export const findingToTicket = (root, f, i, caps = {}) => {
+  const budgetYuan = caps.budgetYuan ?? DEFAULT_BUDGET_YUAN;
+  const timeoutMin = caps.timeoutMin ?? DEFAULT_TIMEOUT_MIN;
   if (f.kind === 'hygiene') {
     const h = HYGIENE_TICKETS[f.id];
-    return { id: `ls-${i + 1}-${f.id}`, title: h.title, accept: h.accept(), body: h.body };
+    return { id: `ls-${i + 1}-${f.id}`, title: h.title, accept: h.accept(), body: h.body, budgetYuan, timeoutMin };
   }
   return {
     id: `ls-${i + 1}-${slug(f.snippet)}`,
@@ -77,28 +84,29 @@ export const findingToTicket = (root, f, i) => {
       'scope — replace the marker with a one-line note explaining the decision.',
       'Touch nothing unrelated to this marker.',
     ].join('\n'),
+    budgetYuan,
+    timeoutMin,
   };
 };
 
-// TODO: let --budget-yuan / --timeout-min CLI flags override the per-ticket defaults
 export const renderTicketMd = (t) =>
   [
     '---',
     `title: ${t.title}`,
     `accept: ${t.accept}`,
-    'budget-yuan: 0.3',
-    'timeout-min: 15',
+    `budget-yuan: ${t.budgetYuan ?? DEFAULT_BUDGET_YUAN}`,
+    `timeout-min: ${t.timeoutMin ?? DEFAULT_TIMEOUT_MIN}`,
     '---',
     '',
     t.body,
     '',
   ].join('\n');
 
-export const writeTickets = (repo, findings) => {
+export const writeTickets = (repo, findings, caps = {}) => {
   const dir = pendingDir(repo);
   fs.mkdirSync(dir, { recursive: true });
   return findings.map((f, i) => {
-    const t = findingToTicket(repo, f, i);
+    const t = findingToTicket(repo, f, i, caps);
     const file = path.join(dir, `${t.id}.md`);
     fs.writeFileSync(file, renderTicketMd(t));
     return file;

`````
