type index = number;

class VNode {
  constructor(
    public readonly container: VContainer,
    public readonly self: index,
    public readonly parent: index,
    public readonly children: index[]
  ) {}

  // Priority case: dynamic nested vcontainer

  private _nested?: VContainer;

  get nested() {
    return this._nested;
  }

  set nested(attach: VContainer | undefined) {
    if (attach?.parent && attach.parent !== this) attach = undefined;
    if (attach) attach.parent = this;
    this._nested = attach;

    // Detach old
    // Reattach all ????
  }

  // Static case: consistent node tree, used if there is no nested vcontainer

  content?: Text | Element;
}

class VContainer {
  parent?: VNode; // Ensures, single or no vnode parent
  nodes: VNode[] = []; // Complete list of nodes in container

  clone(deep: boolean) {
    let container = new VContainer();
    for (let node of this.nodes) {
      let { self, parent, children } = node;

      let copy = new VNode(container, self, parent, [...children]);
      container.nodes.push(copy);

      if (deep && node.nested) copy.nested = node.nested.clone(deep);
      copy.content = node.content && <any>node.content.cloneNode();
    }

    return container;
  }

  reattach() {
    // TODO
  }
}
