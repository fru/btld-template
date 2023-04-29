import { bundle, getFile } from './build.mjs';
import { spawn } from 'node:child_process';

export async function unittest({ prefix, paths }, out, languages, watch) {
  await bundle(prefix, paths, out, languages, true, watch);

  let params = [getFile(out, true, false)];
  if (watch) params.push('--watch');

  let mocha = spawn('npx mocha', params, {
    cwd: process.cwd(),
    detached: false,
    stdio: 'inherit',
    shell: true,
  });
}
