#!/usr/bin/env node
// lunchshift — give your repo the lunch shift.
// Scans a repo for chores, drops them as agent tickets under
// .deepseeker-code/batch/pending/, and hands the real work to the
// open-source deepseeker-code agent while you go eat.
import { runCli } from '../src/cli.js';

runCli(process.argv.slice(2));
