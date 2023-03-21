# VDOM

In this file we define the virtual dom which acts as the intermediate
representation (IR) and also holdes the state, listeners and functionality used
during the runtime in the browser.

## Virtual dom tree structure

The virtual dom is made of `VContainer` and `VNode` instances. The container
holds the state, it knows if it is detached by a mixin and it can be cloned
(including dom and state listeners). VNode instances form a mostly static tree
of dom nodes, both text or tags.

At the root of this virtual dom is allways a dynamic VContainer with static
VNode children. In order for mixins or state mapping functions to create more
dynamic dom we can assign a VContainer to replace existing content of a VNode.
This allows for well defined alternating layeres of dynamic containers and
static nodes.

VContainers have the property `nodes` which holds a flat list of all the VNodes
that are managed by the container, ordered by the precedence in the dom. The
VNode order is static and can't be changed after creation. So the index in this
array gives an easy way to `id` VNodes given a specific VContainer. This is
usefull if we want to reattach dom listeners etc. on cloning. Also this list
makes it easier to find the previous sibling of a VContainer. Just traverse the
`VContainer.parent.container.nodes` to find the sibling VNode that is static.

```typescript src
export type Path = { p: string; ref?: true }[];
export type ParsedText = { text?: string; path: Path }[];

export class VContainer {
  // Priority Case: Nodes
  nodes: VNode[] = []; // Complete list of nodes in container

  // Template Case: Render Template
  template: VContainer;
  templateNode: HTMLTemplateElement;

  parent: VNode;
  attrs: { [key: string]: ParsedText };
}

export class VNode {
  // Priority Case: Dynamic VContainer
  vdom: VContainer;

  // Static Case: Consistent node tree, used if there is no vdom
  content: Node;
  children: VNode[] = [];
  parent: VNode;
  attrs: { [key: string]: ParsedText };

  // Structure
  container: VContainer;
  id: number;

  // Helper
  isStatic = () => !this.vdom;

  constructor(init?: Partial<VNode>) {
    Object.assign(this, init);
  }
}
```

```typescript src
class VContainer {
  clone() {
    // TODO
  }
}
```

```typescript src
class VNode {
  reattachChildren() {
    // TODO
  }
}
```

```typescript src
class VNode {
  reattachSelf() {
    // TODO shows which fields of vdom are used for this traversal
  }
}
```

```typescript src
function mutateState(path: Path, state: unknown, value: unknown) {
  // mutate + freeze
  // TODO
}

function extractKey(path: Path) {
  // TODO
}

function cloneFrozen(object, options: { deep: boolean } = {}) {
  // TODO
}
```

```typescript src
export type VdomStateListener = (after: any, before: any) => void;

class VContainer {
  _state: { [key: string]: unknown } = {};
  _listener: { [key: string]: VdomStateListener[] } = {};

  listen(path: Path, do: VdomStateListener) {
    // TODO
  }

  setState(path: Path, value: unknown) {
    // TODO
  }

  getState(path: Path) {
    // TODO
  }
}
```
