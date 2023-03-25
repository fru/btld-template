// VContainer

class VContainer {
  // TODO remove - this is just too soon
  constructor(protected readonly vnodes: VNode[]) {}

  private _parent: VContainer | undefined;
  private _nested: VContainer[] = [];

  getParent = () => this._parent;
  getNested = () => [...this._nested];
  hasNested = () => !!this._nested.length;

  append(child: VContainer) {
    if (child._parent) child.detach();
    child._parent = this;
    this._nested.push(child);
    this.repositionRoots();
  }

  getIndex = () => this._parent && this._parent._nested.indexOf(this);

  detach() {
    if (this._parent) {
      this._parent._nested.splice(this.getIndex()!, 1);
      this._parent = undefined;
      this.repositionRoots();
    }
  }

  move(from: number, to: number) {
    let max = this._nested.length - 1;
    if (from >= 0 && to >= 0 && from <= max && to < max) {
      let moved = this._nested.splice(from, 1)[0];
      this._nested.splice(to, 0, moved);
      this.repositionRoots();
    }
  }

  private _hiddenByMixin = new Set<string>();

  isVisible = () => !this._hiddenByMixin.size;
  setHiddenByMixin(mixin: string, hidden: boolean) {
    let s = this._hiddenByMixin;
    hidden ? s.delete(mixin) : s.add(mixin);
    this.repositionRoots();
  }
}

// VNode + Full interface

interface VContainer {
  // vnodes
}

class VNode {
  constructor(
    public readonly container: VContainer,
    public readonly self: number,
    public readonly next: number,
    public readonly parent: number,
    public readonly children: number[],
    public node: Text | Element
  ) {}
}

// Clone

interface VContainer {
  clone(deep: boolean): VContainer;
  cloneRecurse(from: VContainer): void;
}

VContainer.prototype.clone = function (this: VContainer, deep) {
  let vnodes: VNode[] = [];
  let container = new VContainer(vnodes);
  for (let original of this.vnodes) {
    let { self, next, parent, children } = original;
    let node = original.node && (original.node.cloneNode() as Text | Element);
    vnodes.push(new VNode(container, self, next, parent, [...children], node));
  }
  if (deep) container.cloneRecurse(this);
  return container;
};

VContainer.prototype.cloneRecurse = function (this: VContainer, from) {
  from.getNested().forEach(n => this.append(n.clone(true)));
};

// Reattach

type Position = { parent: VNode; next?: VNode };
interface VContainer {
  getRoots(onlyFirst: boolean, result?: VNode[]): VNode[];
  getRootAfter(): VNode;
  repositionRoots(): void;
}

VContainer.prototype.getRoots = function (this: VContainer, onlyFirst, o = []) {
  if (this.isVisible() && (!onlyFirst || !o.length)) {
    if (this.hasNested()) {
      this.getNested().forEach(n => n.getRoots(onlyFirst, o));
    } else {
      o.push(...this.vnodes.filter(n => !n.parent));
    }
  }
  return o;
};

VContainer.prototype.getRootAfter = function (this: VContainer) {
  // let next = sibling
  // let

  return null as VNode;
};

VContainer.prototype.repositionRoots = function (this: VContainer) {
  // TODO
};

/*

VContainer.prototype.order = function (this: VContainer, moveTo) {
  if (!this.nested) return;

  // Phase 1: Update standin
  let result = [] as VContainer[];
  let filler = [] as VContainer[];

  // Phase 2: Modify dom
  let modified = [] as VContainer[];

  for (let [index, item] of this.nested.entries()) {
    let to = moveTo(item);

    if (to !== index || result[to]) modified.push(item);
    if (to && to >= 0 && !result[to]) result[to] = item;
    else filler.push(item);
  }

  for (let i = 0; i < this.nested.length; i++) {
    if (!result[i]) result[i] = filler.shift()!;
  }

  this.nested = result;
  for (let m of modified) m.reattachRoots(true);
};

*/

/*

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
*/
