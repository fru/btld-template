/** 
 * Parse Exp, Text or Html. 
 *  
 * Example Exp:  'test.2.:a'
 *         Text: 'Test ${test.2.:a} Test'
 *         Html: '<b $a1="test.2.:a" b="Test${a}">${a}</b>'
 * 
 * Error cases unexpected-token
 *    'test123', ':123', '123test', '..', ''
 */

interface Vdom { getNodes(): Node[] }
type StateListener = (after: any, before: any) => void;
type Path = { p: string, ref?: true, l?: StateListener }[];
type Content = { dom: Node[] | Vdom, producer?: Path };

const box = 'padding:0 3px;border-radius:3px;font-weight:900;';
const logo = box + 'color:#f4bec3;background-color:#3d0b10';
const highlight = box + 'color:#990000;background-color:#ffccd5';

function error(error, segments) {
  let colors = segments.map((_,i) => i % 2 ? highlight : '');
  let msg = '%cbtld-template%c ' + error + ': %c' + segments.join('%c');
  console.error(msg, logo, '', ...colors);
}

error('Unexpected token', ['test.','123','.test'])


console.warn('%c Unexpected char in expression: %c.123%ctest.', logo, '', highlight, ''); 

let parsePath = (s: string): Path => s.split('.').map(p => {
  if (!p.startsWith(':')) return {p};
  return {p: p.substring(1), ref: true};
});

let validatePath = (path: Path, i: number = 0) => {
  if (!path[i].p.match(/^[^\s<>:+\/]+$/)) throw 'path-syntax';
  return i < path.length ? validatePath(path, i+1) : path;
};


let parseText => (s: string): Content[] {
  s.match(\$\{[^\s<>]+\})
  return {dom: []};
} 
  
 function parseTemplate(s: string): Vdom {
   if (s.contains('<') document.createElement('template')
   else new Vdom(parseText(s))
   return new Vdom(); 
 } 