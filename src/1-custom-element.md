# Define custom elements

Usually the js class syntax is required to define web components aka. custom
elements. This is a problem because we want to allow inheritance from dynamic
html elements. A new tag can `extend` an existing tag. We use the following
[workaround](https://github.com/WICG/webcomponents/issues/587) to allow plain
objects to create custom elements.

```typescript src
export function define(tag: string, extend: string, attrs: string[], methods) {
  const Extend = getHTMLElementClass(extend);
  const BtldWrapper = () => render(Reflect.construct(Extend, [], new.target));
  Object.assign(BtldWrapper.prototype, methods);
  Object.setPrototypeOf(BtldWrapper.prototype, Extend.prototype);
  BtldWrapper.observedAttributes = attrs;
  if (window) window[getExpectedHTMLClassName(tag)] = BtldWrapper;
  customElements.define(tag, BtldWrapper, { extend });
}
```

## Element Class e.g. 'ul' to HTMLUListElement

For this to work we also need to resolve the extends tag name into the js
constructor for that tag. First we try using the expected class name. If that
fails we construct an instance of the element and get the constructor.

```typescript src
function getExpectedHTMLClassName(tag: string): string {
  const upper = s => s.charAt(0).toUpperCase() + s.slice(1);
  return 'HTML' + tag.split('-').map(upper).join('') + 'Element';
}

function getHTMLElementClass(tag: string): new () => HTMLElement {
  if (!tag) return HTMLElement;
  const possible = window && window[getExpectedHTMLClassName(tag)];
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

function render(that) {
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
