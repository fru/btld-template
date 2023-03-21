READ this to understand the public api of the btld-template framework

```typescript src
import { define } from './1-custom-element.md';
import { parseTopLevel } from './4-parse.md';
```

```typescript src
function defineBtldComponent() {
  let {tag, extends} = this.attributes;
  let {vdom, observedAttributes} = parseTopLevel(this.children);

  define({
    tag, extends, observedAttributes,
    definition: this,
    render: function () {
      this.attachShadow({ mode: 'open' });
      this.__vdom = vdom.clone().attach(this);
    }
  });
}

export function init() {
  define({ tag: 'btld-template', render: defineBtldComponent });
}
```
