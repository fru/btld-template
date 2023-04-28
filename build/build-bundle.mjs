import * as esbuild from 'esbuild';
import fs from 'node:fs';
import minimist from 'minimist';
import { exec } from 'node:child_process';

exec('npm run literate-w');

var argv = minimist(process.argv.slice(2));
var { watch, test } = argv;

let mangleCache = JSON.parse(fs.readFileSync('./build/naming-cache.json'));
let options = {
  entryPoints: argv['_'],
  bundle: true,
  outfile: 'dist/' + (test ? 'test.js' : 'bundle.js'),
  format: 'esm',
  minify: true,
  mangleProps: /./,
  mangleCache,
};

if (watch) {
  let ctx = await esbuild.context(options);
  await ctx.watch();
  console.log('Watching...');
} else {
  let result = await esbuild.build(options);
  let mangleEntries = Object.entries(result.mangleCache);
  let mangleNew = mangleEntries.filter(v => !mangleCache[v[0]]);
  if (mangleNew.length) {
    console.log(
      'Update naming cache:',
      JSON.stringify(Object.fromEntries(mangleNew))
    );
  }
}
