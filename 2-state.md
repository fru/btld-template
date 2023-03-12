# BTLD State storage and change listeners

Attributes, Text and Mixins can bind to the state of an individual VNode. The
state comes from the the web component attributes and mixins. The listeners for
attribute and text changes are created here, so this is also where text nodes
are edited.

We also need to know which attributes are mixins, since we have to set the
properties of custom components here. `isCustomElement`

State updates also have to iterate the VNode Tree and also set the state if the
current value equals the old.

## Vdom tree structure

The virtual dom is made of `Vdom` and `Vnode` instances. The Vdom contains
state, it knows if it is detached by a mixin and we can clone it (including dom
and state listeners). Vnode instances contain all the dom nodes, text or tags.
Every Vnode is created once and then doesn't get moved around. It has a closest
Vdom instance which does not change.

PROBLEM: Nodes need to be retrieved to by constant ids given a vdom instance,
even after copy.

PROBLEM: What if a placeholder becomes a Vdom - can we use a vdom even after the
fact, how do we know where to insert and remvoe?

```typescript
class VContainer {
  nodeList: VNode[]; // Complete list of nodes in container
  rootList: VNode[]; // Just the root level nodes
  parent: VContainer;
}

class VNode {
  // Priority Case: Dynamic VContainer
  vdom: VContainer;

  // Fallback Case: Static dom node tree
  content: Node;
  children: VNode[];
  parent: VNode;
  container: VContainer;

  isCustomElement = () => !this.vdom && this.content?.tagName?.includes('-');
}
```

Any Tree of HTMLElements and TextNode Leafs is allowed. Vdom may stand for any
contiguous sections of nodes in the tree.

It needs to be possible to clone any vdom (including listeners for state or dom
events and references to the copied node)

A root tag element realy complicates things because the we need to be abble to
reduce the listeners and attr etc. logic from inner nodes. Solution the vdom
allways consist of the same node array forrest and a list of vdom children and a
index to which node the vdom is appended.

## Store state and call listeners

- state, listen, attr, nodes

## Create and update TextNode

## Call state mapping functions & produce string | VNode

## Set and update custom element Properties

# Old code:

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
