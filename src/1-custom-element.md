# Define custom elements

The `define` function is used to globally register the `BtldWebComponent` with
the browser to create the web components aka. custom elements.

```typescript src
export interface BtldWebComponent {
  tag: string;
  observedAttributes: string[];
  extends: string;
  render?: () => {};
  attributeChangedCallback?: (name, oldValue, newValue) => {};
  connectedCallback: () => {};
  disconnectedCallback: () => {};
}
```

Usually the js class syntax is required to define web components. This is a
problem because we want to dynamically extend different html elements. We use
the following [workaround](https://github.com/WICG/webcomponents/issues/587) to
allow plain objects to create custom elements.

```typescript src
export function define(def: BtldWebComponent) {
  const Extend = getHTMLElementClass(def.extends);
  function BtldWrapper() {
    return doDelayedRender(Reflect.construct(Extend, [], new.target));
  }
  Object.assign(BtldWrapper.prototype, def);
  Object.setPrototypeOf(BtldWrapper.prototype, Extend.prototype);
  BtldWrapper.observedAttributes = def.observedAttributes;
  if (window) window[getExpectedClassName(def.tag)] = BtldWrapper;
  customElements.define(def.tag, BtldWrapper, { extends: def.extends });
}
```

## Element Class e.g. 'ul' to HTMLUListElement

For this to work we also need to resolve the extends tag name into the js
constructor for that tag. First we try using the expected class name. If that
fails we construct an instance of the element and get the constructor.

```typescript src
function getExpectedClassName(tag: string): string {
  const upper = s => s.charAt(0).toUpperCase() + s.slice(1);
  return 'HTML' + tag.split('-').map(upper).join('') + 'Element';
}

function getHTMLElementClass(tag: string): new () => HTMLElement {
  if (!tag) return HTMLElement;
  const possible = window && window[getExpectedClassName(tag)];
  if (possible && possible.DOCUMENT_NODE) return possible;
  return document.createElement(tag).constructor;
}
```

## Render after DOMContentLoaded

After the construction of the web component the render method is triggered. To
allow for consistent dom access this call is delayed until the dom content is
loaded. This is loosely based on
[JQuery.Ready](https://github.com/jquery/jquery/blob/main/src/core/ready.js).

```typescript src
const renderLater = [];

function doDelayedRender(that) {
  const run = t => t && t.render && t.render();
  const event = () => {
    renderLater.forEach(run);
    renderLater.length = 0; // Clear array
  };
  const ready = document.readyState !== 'loading';

  if (!ready && !renderLater.length) {
    document.addEventListener('DOMContentLoaded', event, { once: true });
  }

  ready ? run(that) : renderLater.push(that);
  return that;
}
```
