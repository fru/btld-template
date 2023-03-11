# BTLD State storage and change listeners

Attributes, Text and Mixins can bind to the state of an individual VNode. The
state comes from the the web component attributes and mixins. The listeners for
attribute and text changes are created here, so this is also where text nodes
are edited.

We also need to know which attributes are mixins, since we have to set the
properties of custom components here.

State updates also have to iterate the VNode Tree and also set the state if the
current value equals the old.

## Old code:

```typescript
class VdomState {
  dom: HTMLElement;
  content: VdomContent[] = [];
  state: { [key: string]: unknown } = {};
  listeners: { [key: string]: VdomStateListener[] } = {};
  attrs: { [attr: string]: VdomAttrPart[] } = {};

  // Is this need - or is every change directly mirrored?
  rerenderContent: boolean = false;

  // ??? Expose api as state??

  setState = () => {
    // Update state
    // Call listeners
    // Drill down into content Vdom
  };

  setAttr = (attr: string, value: unknown, { parse = false }) => {
    if (parse) {
    } // parse as well?

    // Produce listeners & detach old
    //  - stringify if multiple
    //  ? map via middleware states
    //  - produce content or attr listeners

    // Actually set the attribute
  };

  setContent = () => {};
  addListener = () => {};
}
```

```typescript
setState: (key: string, value: unknown) => {
    let previous = this.state[key];
    if (value === previous) return;
    this.state[key] = value;
    for (var l of this.stateListener[key]) l(value, previous);
    for (var c of this.children) {
    if (c.state[key] === previous) c.api.setState(key, value);
    }
},
setProperty: (key: string, value: unknown) => {
    this.dom && (this.dom[key] = value);
},
addStateListener: (key: string, listener: StateListener) => {
    this.stateListener[key] = this.stateListener[key] || [];
    this.stateListener[key].push(listener);
},
```
