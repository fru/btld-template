type index = number;

class VReplaceable {
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

// Every vnode has exactly one node and vise versa
// Except leave dom nodes - there children are not managed

class VNode extends VReplaceable {
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

class VContainer extends VReplaceable {
  parent?: VReplaceable; // Ensures, single or no vnode parent
  nodes: VNode[] = []; // Complete list of nodes in container
  shown: boolean = true;

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

interface VReplaceable {
  getPosition(): Position;
  getRootNodes(): Node[];
  actualize(detach: boolean, pos?: Position): void;
}

interface Position {
  parent: VNode;
  next: VNode | undefined;
}

VReplaceable.prototype.actualize = function (detach: boolean, pos?: Position) {
  for (const root of <Node[]>this.getRootNodes()) {
    if (detach) {
      if (root.parentElement) root.parentElement?.removeChild(root);
    } else {
      if (!pos) pos = <Position>this.getPosition();
      if (!pos?.parent?.standin) {
        // TODO
        pos.parent.insertBefore(this, pos.next);
      }
    }
  }
};

interface VContainer {
  getFirstNode(): VNode | undefined; // Used by getPosition().next
}

VContainer.prototype.getFirstNode = function (this: VContainer) {
  if (!this.standin) return this.nodes[0];
  for (let inner of this.standin) {
    // TODO Filter hidden VContainer
    let found = inner.getFirstNode();
    if (found) return found;
  }
};

VContainer.prototype.getPosition = function (this: VReplaceable): Position {
  return { parent: document.body, next: null };
};

VNode.prototype.getPosition = function (this: VNode): Position {
  let parent = this.container.nodes[this.parent];
  let next = this.container.nodes[this.next];

  if (parent) return { parent, next };
  if (next) {
    this.container.parent.
    // Only go up to find parent
  }


  if (this.parent) {
  } else {
  }
  return { parent: document.body, next: null };
};
