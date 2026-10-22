// After the agent's shift: read the batch folders and tell the human
// what happened without making them open ten files.
import fs from 'node:fs';
import path from 'node:path';
import { doneDir, pendingDir } from './tickets.js';

const mdFiles = (dir) =>
  fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort() : [];

const frontmatterTitle = (md) => (md.match(/^title:\s*(.+)$/m) || [])[1] || '(untitled)';
// The batch runner stamps every done report with `status:`; only `passed` is a pass.
const frontmatterStatus = (md) => (md.match(/^status:\s*(.+?)\s*$/m) || [])[1] || '';

export const printReport = (repo) => {
  const pending = mdFiles(pendingDir(repo));
  const all = mdFiles(doneDir(repo));
  // a ticket file is superseded by its `.report.md` twin once the runner writes one
  const superseded = new Set(
    all.filter((f) => f.endsWith('.report.md')).map((f) => f.replace(/\.report\.md$/, '.md')),
  );
  const done = all.filter((f) => !superseded.has(f));

  console.log(`pending tickets: ${pending.length}`);
  pending.forEach((f) => console.log(`  - ${f}`));
  console.log(`done reports: ${done.length}`);
  done.forEach((f) => {
    const md = fs.readFileSync(path.join(doneDir(repo), f), 'utf8');
    const verdict = frontmatterStatus(md) === 'passed' ? '[pass]' : '[FAIL]';
    const label = f.replace(/\.report\.md$/, '').replace(/\.md$/, '');
    console.log(`  - ${verdict} ${label} — ${frontmatterTitle(md)}`);
  });
  console.log(
    done.length
      ? 'full text in .deepseeker-code/batch/done/'
      : 'no reports yet — start the shift:  lunchshift run --window 12:00-14:00',
  );
};
