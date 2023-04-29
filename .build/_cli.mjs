#!/usr/bin/env node
'use strict';

import { Command } from 'commander';
import { resolveInputGlobs, resolveOutDir } from './helper.mjs';
import { literate } from './literate.mjs';
import { unittest } from './unittest.mjs';
import { build } from './build.mjs';

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
  .option('-o, --out <dir>', 'Output directory', './dist')
  .option('-l, --languages <lang>', 'Code block languages, csv', 'typescript')
  .option('-t, --test', 'Include test code sections')
  .action((globs, options) => {
    const files = resolveInputGlobs(globs, options.ignore);
    let languages = options.languages.split(',');
    let out = resolveOutDir(options.out);
    let test = options.test;
    literate(files, out, languages, test);
  });

program
  .command('unittest')
  .description('Run mocha unit tests')
  .argument('<globs...>', 'File globs to be tested')
  .option('-i, --ignore <paths>', 'Ignore files', 'node_modules/** dist/**')
  .option('-o, --out <dir>', 'Output directory', './dist')
  .option('-l, --literate <lang>', 'Extract literate code', 'typescript')
  .option('-w, --watch', 'Watch for changes')
  .action((globs, options) => {
    const files = resolveInputGlobs(globs, options.ignore);
    let literate = (options.literate || '').split(',');
    let out = resolveOutDir(options.out);
    unittest(files, out, literate, options.watch);
  });

program
  .command('build')
  .description('Build file')
  .argument('<entries...>', 'File globs to be build')
  .option('-i, --ignore <paths>', 'Ignore files', 'node_modules/** dist/**')
  .option('-o, --out <dir>', 'Output directory', './dist')
  .option('-l, --literate <lang>', 'Extract literate code', 'typescript')
  .option('-p, --mangleProps <file>', 'Use json file to mangle props')
  .action((globs, options) => {
    const files = resolveInputGlobs(globs, options.ignore);
    let literate = (options.literate || '').split(',');
    let out = resolveOutDir(options.out);
    build(files, out, literate);
  });

program.parse();
