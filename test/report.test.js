import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { printReport } from '../src/report.js';
import { doneDir, pendingDir } from '../src/tickets.js';

// printReport writes to the terminal, so read the captured lines back.
const captureLog = (fn) => {
  const lines = [];
  const original = console.log;
  console.log = (...args) => lines.push(args.join(' '));
  try {
    fn();
  } finally {
    console.log = original;
  }
  return lines;
};

// A throwaway repo with the batch folders in place; returns the printed lines.
const reportLines = (setup) => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'lunchshift-report-'));
  try {
    fs.mkdirSync(doneDir(repo), { recursive: true });
    fs.mkdirSync(pendingDir(repo), { recursive: true });
    setup(repo);
    return captureLog(() => printReport(repo));
  } finally {
    fs.rmSync(repo, { recursive: true, force: true });
  }
};

const doneReport = (repo, name, frontmatter) =>
  fs.writeFileSync(
    path.join(doneDir(repo), `${name}.md`),
    ['---', ...frontmatter, '---', '', 'report body', ''].join('\n'),
  );

test('a passed report gets a [pass] verdict', () => {
  const lines = reportLines((repo) => {
    doneReport(repo, 'ls-1-fixme-thing', [
      'title: Resolve FIXME in src/a.js (line 3)',
      'status: passed',
    ]);
  });
  assert.ok(
    lines.includes('  - [pass] ls-1-fixme-thing — Resolve FIXME in src/a.js (line 3)'),
    `expected a [pass] verdict line, got: ${JSON.stringify(lines)}`,
  );
});

test('any status other than passed is a [FAIL]', () => {
  const lines = reportLines((repo) => {
    doneReport(repo, 'ls-1-a', ['title: First chore', 'status: failed']);
    doneReport(repo, 'ls-2-b', ['title: Second chore', 'status: budget-truncated']);
    doneReport(repo, 'ls-3-c', ['title: Third chore']); // no status field at all
  });
  assert.ok(lines.includes('  - [FAIL] ls-1-a — First chore'), JSON.stringify(lines));
  assert.ok(lines.includes('  - [FAIL] ls-2-b — Second chore'), JSON.stringify(lines));
  assert.ok(lines.includes('  - [FAIL] ls-3-c — Third chore'), JSON.stringify(lines));
});

test('the rest of the report is unchanged', () => {
  const lines = reportLines((repo) => {
    fs.writeFileSync(path.join(pendingDir(repo), 'ls-9-todo-thing.md'), 'ticket\n');
    doneReport(repo, 'ls-1-a', ['title: First chore', 'status: passed']);
  });
  assert.deepEqual(lines, [
    'pending tickets: 1',
    '  - ls-9-todo-thing.md',
    'done reports: 1',
    '  - [pass] ls-1-a — First chore',
    'full text in .deepseeker-code/batch/done/',
  ]);
});

test('no reports yet keeps the hint line', () => {
  const lines = reportLines(() => {});
  assert.deepEqual(lines, [
    'pending tickets: 0',
    'done reports: 0',
    'no reports yet — start the shift:  lunchshift run --window 12:00-14:00',
  ]);
});
