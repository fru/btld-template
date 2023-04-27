class VContainer {
  roots: (Text | Element)[];
  hiddenBy = new Set<string>();
  clone?: () => VContainer;
  actualize(parent: Node, list: VContainer[]) {
    if (this.visible()) {
      let start = list.indexOf(this) + 1;
      let found = start > 0 && list.slice(start).find(x => x.visible());
      let after = (found && found.roots && found.roots[0]) || null;
      (this.roots || []).forEach(r => parent.insertBefore(r, after));
    } else {
      this.roots && this.roots.forEach(r => r.remove());
    }
  }
  visible() {
    return !this.hiddenBy.size && this.roots.length;
  }
}

function build(template: HTMLTemplateElement): VContainer {
  let { content } = template;
  function clone() {
    let result = new VContainer();
    // Parse Attr Template
    result.clone = clone;
    result.roots = create(content)?.() || [];
    return result;
  }
  return clone();
}

type Children = (() => (Text | Element)[]) | undefined;
type ParsedNode = { tag?: string };
type ParsedText = {};

function create({ childNodes }: Node): Children {
  if (!childNodes.length) return undefined;
  let result: (ParsedNode | ParsedText)[] = [];
  for (const c of childNodes) {
    if (c.nodeType === 2) result.push(parseText((c as Text).data));
    if (c.nodeType === 1) {
      let attrs = parseAttributes(c);
      result.push({ tag: c.nodeName, attrs, children: create(c) });
    }
  }
  return () => result.map(x => createNodes(x)).flat();
}

function createNodes(parsed: ParsedNode | ParsedText): (Text | Element)[] {
  let children = (parsed as any).children();
  let node = undefined as any;
  node.replaceChildren(...children);
  return [];
}

/// 1. Run file and run inline tests
/// 2. dom -> jsx -> jsx paths
/// 3. Get path value (simple)
/// 3. attrs state + no mixins -> render
/// 4. bind text and attributes

/*
h(
  "h1",
  null,
  h(
    "span",
    { test: "123", abc: true },
    "Test"
  ),
  "123"
);
*/
