#!/usr/bin/env node
'use strict';

import { Command } from 'commander';
import { globSync } from 'glob';
import path from 'node:path';
import fs from 'node:fs';

const program = new Command();
program
  .name('@btld-web/build')
  .description('CLI build tools used by @btld-web libraries')
  .version('0.0.1');

program
  .command('literate')
  .description('Extract code from .md files')
  .argument('<globs...>', 'File globs to be compiled')
  .option('-i, --ignore <paths>', 'Ignore files', 'node_modules/** dist/**')
  .option('-o, --out <dir>', 'Code block language', './dist')
  .option('-l, --languages <lang>', 'Code block languages csv', 'typescript')
  .option('-t, --test', 'Include test code sections')
  .action((globs, options) => {
    const files = resolveInputFiles(globs, options.ignore);
    let languages = options.languages.split(',');
    let out = resolveAndEnsureExists(options.out);
    let test = options.test;

    console.log(files, languages, out, test);
  });

program.parse();

function resolveAndEnsureExists(out) {
  out = path.resolve(out);
  if (!fs.existsSync(out)) fs.mkdirSync(out, { recursive: true });
  return out;
}

function resolveInputFiles(globs, ignoreRaw) {
  const ignore = ignoreRaw.split(' ').map(x => x.trim());
  const matchBase = true;
  const nodir = true;
  const files = globSync(globs, { ignore, matchBase, nodir });
  if (!files.length) {
    program.error('No input files found, use a glob like: src/**.md');
  }
  return files;
}
