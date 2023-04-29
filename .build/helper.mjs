import { globSync } from 'glob';
import path from 'node:path';
import fs from 'node:fs';
import commonPathPrefix from 'common-path-prefix';

export function resolveOutDir(out) {
  out = path.resolve(out);
  if (!fs.existsSync(out)) fs.mkdirSync(out, { recursive: true });
  return out;
}

export function resolveInputGlobs(globs, ignoreRaw) {
  const ignore = ignoreRaw.split(' ').map(x => x.trim());
  const matchBase = true;
  const nodir = true;
  const files = globSync(globs, { ignore, matchBase, nodir });
  if (!files.length) {
    program.error('No input files found, use a glob like: src/**.md');
  }
  if (files.length === 1) {
    const f = path.parse(path.resolve(files[0]));
    return { prefix: f.dir, paths: [f.base] };
  }
  const prefix = commonPathPrefix(files);
  const paths = files.map(x => x.substring(prefix.length));
  return { prefix: path.resolve(prefix), paths };
}
