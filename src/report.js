// After the agent's shift: read the batch folders and tell the human
// what happened without making them open ten files.
import fs from 'node:fs';
import path from 'node:path';
import { doneDir, pendingDir } from './tickets.js';

const mdFiles = (dir) =>
  fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort() : [];

const frontmatterTitle = (md) => (md.match(/^title:\s*(.+)$/m) || [])[1] || '(untitled)';

export const printReport = (repo) => {
  const pending = mdFiles(pendingDir(repo));
  const done = mdFiles(doneDir(repo));

  console.log(`pending tickets: ${pending.length}`);
  pending.forEach((f) => console.log(`  - ${f}`));
  console.log(`done reports: ${done.length}`);
  done.forEach((f) => {
    const md = fs.readFileSync(path.join(doneDir(repo), f), 'utf8');
    console.log(`  - ${f.replace(/\.md$/, '')} — ${frontmatterTitle(md)}`);
  });
  // FIXME: surface per-ticket verdict lines once the report format settles
  console.log(
    done.length
      ? 'full text in .deepseeker-code/batch/done/'
      : 'no reports yet — start the shift:  lunchshift run --window 12:00-14:00',
  );
};
