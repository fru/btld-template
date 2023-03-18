// READ this to understand the public api of the btld-template framework

```typescript src
import { define } from './1-custom-element.md';
import { parseTemplate } from './2-parse.md';
```

```typescript src
function render() {
  const getChildren = (tag: string) => {
    let filter = (el: HTMLElement) => el.tagName === tag.toUpperCase();
    return Array.from(this.children).filter(filter);
  };

  function renderBtldComponent() {
    console.log(this.innerHTML);
    console.log(this);
    console.log(this.templates);
  }

  const attributes = getChildren('attr');
  define({
    tag: this.getAttribute('tag'),
    extends: this.getAttribute('extends'),
    observedAttributes: attributes.map(el => el.content),
    definition: this,
    render: renderBtldComponent,
    attributes,
    templates: getChildren('template'),
  });
}

export function init() {
  define({ tag: 'btld-template', render });
}
```
