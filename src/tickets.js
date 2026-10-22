// Turns findings into deepseeker-code batch tickets: markdown files with
// frontmatter (title, accept, budget-yuan, timeout-min). The agent does the
// work; `accept` is the shell command that proves it actually happened.
import fs from 'node:fs';
import path from 'node:path';

export const pendingDir = (repo) => path.join(repo, '.deepseeker-code', 'batch', 'pending');
export const doneDir = (repo) => path.join(repo, '.deepseeker-code', 'batch', 'done');

const slug = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 32) || 'chore';

// Cross-platform acceptance probes. `node -e` keeps them shell-agnostic.
const fileExistsAccept = (name) =>
  `node -e "process.exit(require('fs').existsSync('${name}') ? 0 : 1)"`;
const worktreeChangedAccept =
  `node -e "process.exit(require('child_process').execSync('git status --porcelain').toString().trim() ? 0 : 1)"`;

const hasTestScript = (root) => Boolean(readPkg(root)?.scripts?.test);
const readPkg = (root) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  } catch {
    return null;
  }
};

const HYGIENE_TICKETS = {
  readme: {
    title: 'Write a README.md',
    accept: () => fileExistsAccept('README.md'),
    body: [
      'This repo has no README.md. Write a short one:',
      '- what the project does (infer it from the code, be concrete)',
      '- how to install and run it',
      '- one realistic usage example',
      '',
      'Keep it under 60 lines. Plain and factual, no marketing voice.',
    ].join('\n'),
  },
  license: {
    title: 'Add a MIT LICENSE file',
    accept: () => fileExistsAccept('LICENSE'),
    body: [
      'This repo has no LICENSE file, so legally nobody may use it.',
      'Add the full MIT License text with "Copyright (c) 2026" and the author',
      'name from package.json (or git config user.name). Change no other file.',
    ].join('\n'),
  },
  tests: {
    title: 'Add a minimal test setup',
    accept: () => 'npm test',
    body: [
      'package.json has no test script, so nothing proves the repo still works.',
      'Add the smallest honest setup: a "test" script (node --test or the',
      "project's idiomatic runner) and at least one small real test over",
      'existing code. Do not change production code beyond what the tests require.',
    ].join('\n'),
  },
};

export const findingToTicket = (root, f, i) => {
  if (f.kind === 'hygiene') {
    const h = HYGIENE_TICKETS[f.id];
    return { id: `ls-${i + 1}-${f.id}`, title: h.title, accept: h.accept(), body: h.body };
  }
  return {
    id: `ls-${i + 1}-${slug(f.snippet)}`,
    title: `Resolve ${f.tag} in ${f.file} (line ${f.line})`,
    accept: hasTestScript(root) ? 'npm test' : worktreeChangedAccept,
    body: [
      `In ${f.file}, line ${f.line}, there is this marker:`,
      '',
      `    ${f.snippet}`,
      '',
      'Resolve it properly: implement the intent, or — if it is genuinely out of',
      'scope — replace the marker with a one-line note explaining the decision.',
      'Touch nothing unrelated to this marker.',
    ].join('\n'),
  };
};

// TODO: let --budget-yuan / --timeout-min CLI flags override the per-ticket defaults
export const renderTicketMd = (t) =>
  [
    '---',
    `title: ${t.title}`,
    `accept: ${t.accept}`,
    'budget-yuan: 0.3',
    'timeout-min: 15',
    '---',
    '',
    t.body,
    '',
  ].join('\n');

export const writeTickets = (repo, findings) => {
  const dir = pendingDir(repo);
  fs.mkdirSync(dir, { recursive: true });
  return findings.map((f, i) => {
    const t = findingToTicket(repo, f, i);
    const file = path.join(dir, `${t.id}.md`);
    fs.writeFileSync(file, renderTicketMd(t));
    return file;
  });
};
