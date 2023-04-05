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
    result.roots = iterate(content);
    return result;
  }
  return clone();
}

function iterate({ childNodes }: Node): (Text | Element)[] {
  for (const content of childNodes) {
    (content as Element).replaceChildren(...iterate(content));
  }
  return [];
}

function parseNode(node: Node) {
  if (node.nodeType === 2) return parseText((node as Text).data);
  let tag = node.nodeName;
  if (node.nodeType === 1) return { tag, attrs: parseAttributes(node) };
}

function create(node: Node): () => (Text | Element)[] {
  let creators = Array.from(node.childNodes, create);
  let children = () => creators.map(x => x()).flat();
  let data = parseNode(node);
  return () => {};
}
