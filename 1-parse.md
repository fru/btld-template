# BTLD Parser

This file has the parsers for the btld templating engine. We also define the
virtual dom which acts as the intermediate representation (IR) and also holdes
the state, listeners and functionality used during the runtime in the browser.

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

```typescript
class VContainer {
  nodes: VNode[]; // Complete list of nodes in container
  parent: VNode;
  append: VNode; // Used during initialization - new nodes are appended here
}

class VNode {
  // Priority Case: Dynamic VContainer
  vdom: VContainer;

  // Static Case: Consistent node tree, used if there is no vdom
  content: Node;
  children: VNode[];
  parent: VNode;

  // Structure
  container: VContainer;
  id: number;

  // Helper
  isStatic = () => !this.vdom;
}
```

## Path Expression

Exp: 'test.2.:a'

Text: 'Test ${test.2.:a} Test'

```typescript
function hasExpression(input: string) {
  return /\$\{([^\}\s]+)\}/.test(input);
}

function parseText(input) {
  const regex = /\$\{([^\}\s]+)\}|[^\$]+|\$/g;
  const result = [];
  let last = null;

  for (let [text, path] of input.matchAll(regex)) {
    if (path) {
      result.push((last = { path: parsePath(path) }));
    } else if (last?.text) {
      last.text += text;
    } else {
      result.push((last = { text }));
    }
  }
  return result;
}

function parsePath(input: string) {}
```

## VdomBuilder

Iterate DOM Nodes via node.childNodes.forEach((child => ...))

Template is identifierd via node.content.childNodes

Some Node + Attribute combinations are wrapped in a new VContainer

Close means:

- until append != null -> iterate: container = parent.container
- then: append = append.parent

```typescript
class VdomBuilder {
  current: VContainer = new VContainer();

  nodeStart(node: Node) {
    // TODO
  }

  nodeClose() {
    // TODO
  }

  static parse(nodes: NodeList): VContainer {
    // isContainer(node)
    // TODO
  }
}
```

Error cases unexpected-token: 'test123', ':123', '123test', '..', ''

## Populating the virtual dom from html templates

## Attach state listeners

-

-

```typescript
class VNode {
  isCustomElement() {
    return this.isStatic() && this.content?.tagName?.includes('-');
  }
}
```

# OLD !!!!!!!!!

Extract Error handling to utils

Every VNode is created once and then doesn't get moved around. It has a closest
Vdom instance which does not change.

```typescript
type StateListener = (after: any, before: any) => void;
type Path = { p: string; ref?: true }[];
type PathWithListener = { path: Path; listener?: StateListener };
type Content = { nodes: Node[] | VNode; producer?: Path };
```

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

```typescript
/**
 * Parse Exp, Text or Html.
 *
 * Example Exp:  'test.2.:a'
 *         Text: 'Test ${test.2.:a} Test'
 *         Html: '<b $a1="test.2.:a" b="Test${a}">${a}</b>'
 *
 * Error cases unexpected-token
 *    'test123', ':123', '123test', '..', ''
 */
```

```typescript test
function check(p: Path) {
  const r = ''; //;
}
```

```typescript
// What interface would be need to build the Vdom?
interface VNode { getNodes(): Node[] }

// What attributes are mixins?

console.warn('%c Unexpected char in expression: %c.123%ctest.', logo, '', highlight, '');

let parsePath = (s: string): Path => s.split('.').map(p => {
  if (!p.startsWith(':')) return {p};
  return {p: p.substring(1), ref: true};
});

let validatePath = (path: Path, i: number = 0) => {
  if (!path[i].p.match(/^[^\s<>:+\/]+$/)) throw 'path-syntax';
  return i < path.length ? validatePath(path, i+1) : path;
};


let parseText => (s: string): Content[] {
  s.match(\$\{[^\s<>]+\})
  return {dom: []};
}

 function parseTemplate(s: string): Vdom {
   if (s.contains('<') document.createElement('template')
   else new Vdom(parseText(s))
   return new Vdom();
 }
```
