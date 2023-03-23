type index = number;

class VReplacable {
  standin?: VContainer[] = undefined;

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

  remove(count: number) {}

  order(moveTo: (item: VContainer) => number | undefined) {
    if (!this.standin) return;

    // Phase 1: Update standin
    let result = [] as VContainer[];
    let filler = [] as VContainer[];
    // Phase 2: Modify dom
    let modified = [] as VContainer[];

    for (let [index, item] of this.standin.entries()) {
      let to = moveTo(item);

      if (to !== index || result[to]) modified.push(item);
      if (to && to >= 0 && !result[to]) result[to] = item;
      else filler.push(item);
    }

    for (let i = 0; i < this.standin.length; i++) {
      if (!result[i]) result[i] = filler.shift()!;
    }
    this.standin = result;

    // TODO dom manipulation
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
}

interface VReplacable {
  getPosition(): Position;
  getRootNodes(): Node[];
  actualize(detach: boolean, pos?: Position): void;
}

interface Position {
  parent: HTMLElement;
  next: Node | null;
}

VReplacable.prototype.actualize = function (detach: boolean, pos?: Position) {
  for (const root of <Node[]>this.getRootNodes()) {
    if (detach) {
      if (root.parentElement) root.parentElement?.removeChild(root);
    } else {
      if (!pos) pos = <Position>this.getPosition();
      pos.parent.insertBefore(pos.parent, pos.next);
    }
  }
};

interface VContainer {
  getFirstNode(): Node; // Used by getPosition().next
}

VReplacable.prototype.getPosition = function (): Position {
  return { parent: document.body, next: null };
};
