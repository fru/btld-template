#!/usr/bin/env node
'use strict';

import { Command } from 'commander';
import { resolveInputGlobs, resolveOutDir } from './helper.mjs';

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
    const files = resolveInputGlobs(globs, options.ignore);
    let languages = options.languages.split(',');
    let out = resolveOutDir(options.out);
    let test = options.test;

    console.log(files, languages, out, test);
  });

program.parse();
