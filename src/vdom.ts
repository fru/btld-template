class VComponent {
  list: VContainer[] = [];
}

interface State {}

interface VNodeBuilder {
  build: (this: VNode) => void;
  parent?: number;
}

interface VNode {
  node: Text | Element;
  parent: Element;
  container: VContainer;
}

class VContainer {
  constructor(private builder: VNodeBuilder[]) {}
  nodes: VNode[];
  state: State;
  clone() {
    return new VContainer(this.builder);
  }
  attach(parent: Node, before?: Node) {
    if (!this.nodes) {
      // new VNode()
      // Attach to parent
      // Add to nodes array
      // this.container.nodes[this.parent as number]?.node;
    }
    this.roots().forEach(r => parent.insertBefore(r.node, before || null));
  }
  roots() {
    return (this.nodes || []).filter(x => !x.parent);
  }
  detach() {
    this.roots().forEach(r => r.node.remove());
  }
}
