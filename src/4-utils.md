Based on jquery: https://github.com/jquery/jquery/blob/main/src/core/ready.js

```typescript

let isReady = false
if ( document.readyState !== "loading" ) {
  document.addEventListener( "DOMContentLoaded", completed );
document.removeEventListener( "DOMContentLoaded", completed );
```

Error handling

```typescript
const box = 'padding:0 3px;border-radius:3px;font-weight:900;';
const logo = box + 'color:#f4bec3;background-color:#3d0b10';
const highlight = box + 'color:#990000;background-color:#ffccd5';

function error(error: string, segments: string[]) {
  let colors = segments?.map((_, i) => (i % 2 ? highlight : ''));
  let msg = '%cbtld-template%c ' + error;
  if (segments) msg += ': %c' + segments.join('%c');
  console.error(msg, logo, '', ...(colors || []));
}
```

Called via `error('Unexpected token', ['test.','123','.test'])`
