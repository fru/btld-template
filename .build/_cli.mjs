#!/usr/bin/env node
'use strict';

import { Command } from 'commander';
const program = new Command();

program
  .name('@btld-web/build')
  .description('CLI build tools used by @btld-web libraries')
  .version('0.0.1');

program
  .command('literate')
  .description('Extract code from .md files')
  .argument('<location>', 'Files or directories to be compiled')
  .option('-o, --out <dir>', 'Code block language', './dist')
  .option('-l, --language <lang>', 'Code block language', 'typescript')
  .option('-t, --test', 'Include test code sections')
  .action((locations, options) => {
    console.log('!!!!!!!??', locations, options);
  });

program.parse();
console.log('!!!!!!!!!!');
