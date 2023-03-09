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

const logo = 
  'background-color:#222222;border-radius:3px;padding:1px 6px;' + 
  'font-size:11px;font-weight:900;color:#dc3545';

const highlight =
  'background-color:rgba(255,0,0,0.2);border-bottom: 1px solid red';

function error(error, segments) {
  let colors = segments.map((_,i) => i % 2 ? highlight : '');
  let msg = '%cBTLD%c ' + error + ': %c' + segments.join('%c');
  console.warn(msg, logo, '', ...colors);
}

error('Unexpected token', ['','123','test'])


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