# BTLD Parser

TODO parseTopLevel, parseMetadata

TODO vdom, observedAttributes,

TODO attach (rootNodes reattachChildren, read out state, getter setter)

TODO reattachChildren (used by attach) reattachSelf (used by mixins)

TODO reattach\* uses insertBefore -> find preceding node

This file has the parsers for the btld templating engine. We also

## Path Expression

Text: 'Test ${test/2/:a} Test'

```typescript
function parseText(input: string): ParsedText {
  if (!/\$\{([^\}\s]+)\}/.test(input)) return [{ text: input }];

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

function parsePath(input: string): Path {
  return input.split('/').map(p => (
    p.startsWith(':') ? { p: p.substring(1), ref: true } : { p };
  ));
}
```

## VdomBuilder

Iterate DOM Nodes via node.childNodes.forEach((child => ...))

Template is identifierd via node.content.childNodes

Some Node + Attribute combinations are wrapped in a new VContainer

Close means:

- until append != null -> iterate: container = parent.container
- then: append = append.parent

```typescript
document.body.innerHTML += `
  <template id="abc">
    <div>
      <div>test ${}</div>
    </div>
  </template>
`;
```

topLevel => !container

topLevel => querySelectorAll('template')

```typescript
function parseAttributes(node: Node) {
  let attrs = Array.from(node.attributes);
  let parse = ({ name, value }) => [name, parseText(value)];
  return Object.fromEntries(attrs.map(parse));
}

function parseHtml(nodes: NodeList, parent: VNode, container: VContainer) {
  for (const content of nodes) {
    let template = (content as HTMLTemplateElement).content;
    let attrs = parseAttributes(content);

    let vnode = new VNode({ content, parent, container });
    vnode.id = container.nodes.length;
    container.nodes.push(vnode);
    if (parent) parent.children.push(vnode);

    if (template) {
      vnode.vdom = new VContainer();
      vnode.vdom.parent = container;
      vnode.vdom.attrs = attrs;
      parseHtml(template.childNodes, undefined, vnode.vdom);
    } else {
      vnode.attrs = attrs;
      parseHtml(content.childNodes, vnode, container);
    }
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

```typescript
const getChildren = (tag: string) => {
  let filter = (el: HTMLElement) => el.tagName === tag.toUpperCase();
  return Array.from(this.children).filter(filter);
};

const attributes = getChildren('attr');
const container = parse(getChildren('template'));
```

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
