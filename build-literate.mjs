import chokidar from 'chokidar';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const watch = path.join(__dirname, 'literate');
const destination = path.join(__dirname, 'src');

const persistent = false;
const watcher = chokidar.watch('.', { cwd: watch, persistent });

watcher.on('add', compile).on('change', compile);

async function compile(relative) {
  let file = path.join(watch, relative);
  let text = await fs.promises.readFile(file, 'utf8');
  let code = extract(text);
  fs.promises.writeFile(path.join(destination, relative), code, 'utf8');
  console.log(`Extract code: ${relative}`);
}

function extract(text, languages = ['typescript']) {
  let language = '(' + languages.filter(x => x).join('|') + ')';
  let regex = new RegExp('```' + language + '([\\s\\S]+?)```', 'g');
  let code = [...text.matchAll(regex)].map(m => m[2].trim());

  return code.join('\n');
}
