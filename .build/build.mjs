import * as esbuild from 'esbuild';
import { mdCodeExtract } from './literate.mjs';
import path from 'node:path';
import fs from 'node:fs';

export async function bundle(prefix, paths, out, languages, test, watch) {
  let mangleCache = {}; //JSON.parse(fs.readFileSync('./build/naming-cache.json'));
  let options = {
    entryPoints: paths.map(p => path.resolve(prefix, p)),
    bundle: true,
    outfile: path.join(out, test ? 'test.js' : 'bundle.js'),
    format: 'esm',
    minify: true,
    mangleProps: /\$$/,
    mangleCache,
    plugins: [mdCodeExtract(languages, true)],
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
      const update = JSON.stringify(Object.fromEntries(mangleNew));
      console.log('Update naming cache:', update);
    }
  }
}

export function build({ prefix, paths }, out, languages) {
  bundle(prefix, paths, out, languages, false, false);
}
