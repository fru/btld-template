import * as esbuild from 'esbuild';
import fs from 'node:fs';

let markdown = language => ({
  name: 'md-code-extract',
  setup(build) {
    build.onLoad({ filter: /\.md$/ }, async args => {
      let text = await fs.promises.readFile(args.path, 'utf8');
      let regex = new RegExp('```' + language + '([\\s\\S]+?)```', 'g');
      let code = [...text.matchAll(regex)].map(m => m[1].trim());

      return {
        contents: code.join('\n'),
        loader: 'ts',
      };
    });
  },
});

let mangleCache = JSON.parse(fs.readFileSync('./src/naming-cache.json'));

let result = await esbuild.build({
  entryPoints: ['src/0-main.md'],
  bundle: true,
  outfile: 'dist/out.js',
  plugins: [markdown('typescript src')],
  minify: true,
  mangleProps: /_$/,
  mangleCache,
});

let mangleEntries = Object.entries(result.mangleCache);
let mangleNew = mangleEntries.filter(v => !mangleCache[v[0]]);
if (mangleNew.length) {
  console.log('Update naming cache:', Object.fromEntries(mangleNew));
}
