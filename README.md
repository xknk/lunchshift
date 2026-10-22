# lunchshift 🦥

Give your repo the lunch shift.

`lunchshift scan` finds the chores a repo accumulates — TODO/FIXME markers,
missing README, missing LICENSE, no tests — and writes each one up as a ticket
for an open-source coding agent ([deepseeker-code](https://github.com/xknk/deepseeker-code),
powered by open-weight DeepSeek models). `lunchshift run` hands the tickets
over before you walk away. The agent works in an isolated git worktree, runs
each ticket's acceptance command under a hard per-ticket budget, and leaves a
written report. You come back from lunch, read the report, keep what you like.

## Quickstart

```bash
npm install -g lunchshift deepseeker-code   # agent harness comes separately

cd your-repo
lunchshift scan            # see the chores (add --dry to not write tickets)
lunchshift run --window 12:00-14:00   # start the shift, go eat
lunchshift report          # what got done
```

## How it works

- **scan** is deterministic and free: globs source files for `TODO`/`FIXME`/`HACK`,
  checks three hygiene basics. No API calls.
- **tickets** are markdown files (`.deepseeker-code/batch/pending/`) with a
  title, an `accept` command that proves the work happened, and a hard
  `budget-yuan` / `timeout-min` cap.
- **run** delegates everything to the deepseeker-code agent, which executes
  tickets serially inside an isolated worktree. Failed acceptance = reported,
  not merged. Nothing touches your branch without you.

## Requirements

- Node.js >= 18
- [deepseeker-code](https://github.com/xknk/deepseeker-code) CLI installed and
  configured with a DeepSeek API key

## Honest limits

- The scanner only finds chores it can see: comment markers and three hygiene
  checks. It will not invent work.
- The agent is good but not infallible — that is why every ticket carries an
  acceptance command and a budget, and why the worktree stays separate until
  a human looks.
- v0.1 targets npm-flavored JavaScript/TypeScript repos.

## License

MIT
