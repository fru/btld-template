type index = number;

class VReplacable {
  standin?: (VContainer | undefined)[] = undefined;

  attach(added: VContainer, index?: number) {
    // TODO
    //if (attach?.parent && attach.parent !== this) attach = undefined;
    //if (attach) attach.parent = this;
    //this._nested = attach;
    // Detach old
    // Reattach all ????
    //
    // get root vnodes -> recurse into standin replacements and get there root nodes
    // get parent & get next
    // insertBefore all root nodes
  }

  modify(map: (item: VContainer) => number | '?' | 'x') {
    let change = [] as number[];
    let result = [];
    for (let item of this.standin || []) {
    }

    // TODO dom manipulation
    this.standin = result;

    // TODO
    // How can this be easily used by for loop?
    // 1. Map to index of new array
    // 2.
  }
}

class VNode extends VReplacable {
  constructor(
    public readonly container: VContainer,
    public readonly self: index,
    public readonly next: index,
    public readonly parent: index,
    public readonly children: index[],
    public node: Text | Element
  ) {
    super();
  }

  actualize(detach: boolean, parent?: Node, next?: Node) {
    // TODO
  }
}

class VContainer {
  parent?: VNode; // Ensures, single or no vnode parent
  nodes: VNode[] = []; // Complete list of nodes in container

  clone(deep: boolean) {
    let container = new VContainer();
    for (let original of this.nodes) {
      let { self, next, parent, children } = original;
      let node = original.node && <any>original.node.cloneNode();
      let copy = new VNode(container, self, next, parent, [...children], node);

      if (deep && original.standin) {
        copy.standin = original.standin.map(x => x?.clone(deep));
      }
      container.nodes.push(copy);
    }

    return container;
  }

  reattach() {
    // TODO
  }
}

interface VReplacable {
  getPosition(): { parent?: Node; next?: Node };
  getRootNodes(): Node[];
}

interface VContainer {
  getFirstNode(): Node;
}

VReplacable.prototype.getPosition = function () {
  return {};
};
