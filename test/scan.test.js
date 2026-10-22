import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanRepo, summarizeFindings } from '../src/scan.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const mini = path.join(here, 'fixtures', 'mini');

test('finds planted TODO markers', () => {
  const findings = scanRepo(mini);
  const comment = findings.find((f) => f.kind === 'comment');
  assert.ok(comment, 'expected at least one comment finding');
  assert.equal(comment.tag, 'TODO');
  assert.equal(comment.file.replaceAll('\\', '/'), 'sample.js');
  assert.match(comment.snippet, /TODO/);
});

test('flags missing README and LICENSE hygiene', () => {
  const ids = scanRepo(mini).filter((f) => f.kind === 'hygiene').map((f) => f.id);
  assert.ok(ids.includes('readme'));
  assert.ok(ids.includes('license'));
});

test('summary lines are human-readable', () => {
  const lines = summarizeFindings(scanRepo(mini));
  assert.ok(lines.length > 0);
  assert.ok(lines.every((l) => typeof l === 'string' && l.length > 0));
});
