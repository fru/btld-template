// READ this to understand the public api of the btld-template framework

```typescript src
import { define } from './1-custom-element.md';
import { parseToplevel } from './2-parse.md';
```

```typescript src
function render() {
  //let { vdom, observedAttributes } = parseToplevel(this.children);

  const getChildren = (tag: string) => {
    let filter = (el: HTMLElement) => el.tagName === tag.toUpperCase();
    return Array.from(this.children).filter(filter);
  };

  const attributes = getChildren('attr');
  const container = parse(getChildren('template'));

  function renderBtldComponent() {
    this.attachShadow({ mode: 'open' });
    const vdom = container.clone();
    vdom.attach();
    console.log(this.innerHTML);
  }

  define({
    tag: this.getAttribute('tag'),
    extends: this.getAttribute('extends'),
    observedAttributes: attributes.map(el => el.textContent.trim()),
    definition: this,
    render: renderBtldComponent,
    attributes,
  });
}

export function init() {
  define({ tag: 'btld-template', render });
}
```
