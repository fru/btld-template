import * as esbuild from 'esbuild';
import fs from 'node:fs';
import minimist from 'minimist';

var argv = minimist(process.argv.slice(2));
var { tdd, watch } = argv;

let header = '';
if (tdd) header += "import { assert } from 'chai';";

let markdown = languages => ({
  name: 'md-code-extract',
  setup(build) {
    build.onLoad({ filter: /\.md$/ }, async args => {
      let text = await fs.promises.readFile(args.path, 'utf8');
      let language = '(' + languages.filter(x => x).join('|') + ')';
      let regex = new RegExp('```' + language + '([\\s\\S]+?)```', 'g');
      let code = [...text.matchAll(regex)].map(m => m[2].trim());

      return {
        contents: header + code.join('\n'),
        loader: 'ts',
      };
    });
  },
});

let mangleCache = JSON.parse(fs.readFileSync('./src/naming-cache.json'));
let options = {
  entryPoints: argv['_'],
  bundle: true,
  outfile: tdd ? 'dist/tdd.js' : 'dist/btld-template.js',
  plugins: [markdown(['typescript src', tdd && 'typescript test'])],
  format: 'esm',
  minify: true,
  mangleProps: /_$/,
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
    console.log('Update naming cache:', Object.fromEntries(mangleNew));
  }
}
