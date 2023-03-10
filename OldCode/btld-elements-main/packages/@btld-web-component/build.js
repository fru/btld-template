const esbuild = require('esbuild');
const { exec } = require('child_process');

let api = {
    '_test': 'a'
};

build('cjs', 'dist/index.js', ['src/index.ts']);
build('esm', 'dist/index.mjs', ['src/index.ts']);
build('iife', 'dist/browser.js', ['src/browser.ts']);

exec('tsc ./src/index.ts --declaration --emitDeclarationOnly --out dist/index.js');
exec('gzip ./dist/browser.js --extension=gz --extension=br');

function build(format, outfile, entryPoints) {
    esbuild
        .build({
            entryPoints,
            outfile,
            bundle: true,
            sourcemap: true,
            minify: true,
            minifyIdentifiers: true,
            minifyWhitespace: true,
            minifySyntax: true,
            mangleProps: /^_/,
            mangleCache: api,
            format,
            target: ['esnext'] //chrome58,firefox57,safari11,edge16
        });
}
