# BTLD parser and error handling

```typescript
type StateListener = (after: any, before: any) => void;
type Path = { p: string, ref?: true }[];
type PathWithListener = { path: Path, listener?: StateListener };
type Content = { dom: Node[] | Vdom, producer?: Path };
```


```typescript
const box = 'padding:0 3px;border-radius:3px;font-weight:900;';
const logo = box + 'color:#f4bec3;background-color:#3d0b10';
const highlight = box + 'color:#990000;background-color:#ffccd5';

function error(error: string, segments: string[]) {
  let colors = segments?.map((_,i) => i % 2 ? highlight : '');
  let msg = '%cbtld-template%c ' + error;
  if(segments) msg += ': %c' + segments.join('%c');
  console.error(msg, logo, '', ...(colors || []));
}
```

Called via `error('Unexpected token', ['test.','123','.test'])`





```typescript
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
```





```typescript
const parse = (s: string): Path => s.split('.').map(p => {
  if (!p.startsWith(':')) return {p};
  return {p: p.substring(1), ref: true};
});
```


```typescript test
function check(p: Path) {
  const r = '';//;
}
```
