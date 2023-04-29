import { bundle } from './build.mjs';

export async function unittest({ prefix, paths }, out, languages, watch) {
  await bundle(prefix, paths, out, languages, true, watch);
  console.log('!!!!!!!!!!!!!!!!');
}
