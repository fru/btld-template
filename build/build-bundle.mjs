import * as esbuild from 'esbuild';
import fs from 'node:fs';
import minimist from 'minimist';

var argv = minimist(process.argv.slice(2));
var { watch, out } = argv;

let mangleCache = JSON.parse(fs.readFileSync('./build/naming-cache.json'));
let options = {
  entryPoints: argv['_'],
  bundle: true,
  outfile: 'dist/' + out,
  format: 'esm',
  minify: true,
  mangleProps: /^\$/,
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
