// READ this to understand the public api of the btld-template framework

```typescript src
import { define } from './1-custom-element.md';
```

```typescript src
function getChildrenWithTag(tag: string, children: HTMLCollection) {
  let filter = (el: HTMLElement) => el.tagName === tag.toUpperCase();
  return Array.from(document.body.children).filter(filter);
}
```

```typescript src
function render() {
  console.log(this.innerHTML);
}

export function init() {
  define('btld-template', null, null, { render });
}
```
