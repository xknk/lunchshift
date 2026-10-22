// Deterministic repo scanner: finds chores a coding agent could do unattended.
// v1 is local-only on purpose: comment markers (TODO/FIXME/HACK) and three
// hygiene checks. No network, no API calls — the agent bills tokens, the scanner is free.
import fs from 'node:fs';
import path from 'node:path';

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'coverage', '.deepseeker-code']);
const TEXT_EXTS = new Set([
  '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.vue',
  '.py', '.go', '.rs', '.java', '.rb', '.php',
  '.css', '.scss', '.html',
]);
// colon-style markers only — a bare marker word followed by a colon —
// which cuts false hits inside prose, regex literals and test assertions
const CHORE_RE = /\b(TODO|FIXME|HACK)\s*:/;

const walk = (dir, root, out = []) => {
  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out; // unreadable dir: skip quietly
  }
  for (const entry of entries) {
    const fp = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(fp, root, out);
      continue;
    }
    if (!TEXT_EXTS.has(path.extname(entry.name))) continue;
    let text = '';
    try {
      text = fs.readFileSync(fp, 'utf8');
    } catch {
      continue; // unreadable file: skip quietly
    }
    const file = path.relative(root, fp).split(path.sep).join('/');
    text.split('\n').forEach((line, i) => {
      const m = line.match(CHORE_RE);
      if (m) out.push({ kind: 'comment', tag: m[1], file, line: i + 1, snippet: line.trim().slice(0, 120) });
    });
  }
  return out;
};

const readPkg = (root) => {
  const p = path.join(root, 'package.json');
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
};

export const scanRepo = (root) => {
  const findings = walk(root, root);
  const pkg = readPkg(root);
  if (!fs.existsSync(path.join(root, 'README.md'))) {
    findings.push({ kind: 'hygiene', id: 'readme', file: '', line: 0, snippet: 'no README.md — newcomers bounce off' });
  }
  if (!fs.existsSync(path.join(root, 'LICENSE'))) {
    findings.push({ kind: 'hygiene', id: 'license', file: '', line: 0, snippet: 'no LICENSE — legally nobody may use this' });
  }
  if (!pkg?.scripts?.test) {
    findings.push({ kind: 'hygiene', id: 'tests', file: 'package.json', line: 0, snippet: 'no test script — nothing proves the repo still works' });
  }
  return findings;
};

export const summarizeFindings = (findings) =>
  findings.map((f) =>
    f.kind === 'comment'
      ? `${f.tag} ${f.file}:${f.line} — ${f.snippet}`
      : `${f.id.toUpperCase()} — ${f.snippet}`,
  );
