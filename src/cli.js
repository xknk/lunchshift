import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { scanRepo, summarizeFindings } from './scan.js';
import { writeTickets } from './tickets.js';
import { printReport } from './report.js';

const VERSION = '0.1.0';

const usage = `
lunchshift — give your repo the lunch shift.

  lunchshift scan   [dir] [--dry]              find chores, write agent tickets (default)
  lunchshift run    [dir] [--window HH:MM-HH:MM]  hand tickets to the deepseeker-code agent
  lunchshift report [dir]                      what did the agent get done?
  lunchshift status [dir]                      alias of report
  lunchshift --version

The agent runs tickets inside an isolated git worktree, gated by each
ticket's accept command and budget. Nothing lands on your branch until
you say so.
`.trim();

const parseArgs = (args) => {
  const flags = {};
  const rest = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dry') flags.dry = true;
    else if (args[i] === '--window') flags.window = args[++i];
    else rest.push(args[i]);
  }
  return { flags, dir: rest[0] || '.' };
};

export const runCli = (argv) => {
  const [cmd, ...rest] = argv;
  if (cmd === '--version' || cmd === '-v') { console.log(VERSION); return; }
  if (!cmd || cmd === '--help' || cmd === '-h') { console.log(usage); return; }

  const { flags, dir } = parseArgs(rest);
  const repo = path.resolve(dir);

  if (cmd === 'scan') {
    const findings = scanRepo(repo);
    console.log(`found ${findings.length} chore(s):`);
    summarizeFindings(findings).forEach((l) => console.log(`  - ${l}`));
    if (flags.dry) { console.log('(dry run — no tickets written)'); return; }
    if (!findings.length) { console.log('nothing to do — go enjoy your lunch.'); return; }
    const files = writeTickets(repo, findings);
    console.log(`\nwrote ${files.length} ticket(s) to .deepseeker-code/batch/pending/`);
    console.log('hand them to the agent and go eat:');
    console.log('  lunchshift run --window 12:00-14:00');
    return;
  }

  if (cmd === 'run') {
    const args = ['batch', 'run'];
    if (flags.window) args.push('--wait-window', flags.window);
    const r = spawnSync('deepseeker-code', args, { stdio: 'inherit', shell: true, cwd: repo });
    if (r.error) {
      console.error('could not launch deepseeker-code — install it first:');
      console.error('  npm i -g deepseeker-code');
      process.exitCode = 1;
    } else if (r.status !== 0) {
      console.error(`deepseeker-code exited with code ${r.status}`);
      process.exitCode = 1;
    }
    return;
  }

  if (cmd === 'report' || cmd === 'status') { printReport(repo); return; }

  console.error(`unknown command: ${cmd}\n\n${usage}`);
  process.exitCode = 1;
};
