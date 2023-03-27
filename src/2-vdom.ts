// VContainer

class VContainer {
  private _parent: VContainer | undefined;
  private _nested: VContainer[] = [];

  getParent = () => this._parent;
  getNested = () => [...this._nested];
  hasNested = () => !!this._nested.length;

  index = () => this._parent && this._parent._nested.indexOf(this);
  getSibling = () => this._parent && this._parent._nested[this.index()! + 1];

  private _hiddenByMixin = new Set<string>();

  isVisible = () => !this._hiddenByMixin.size;

  append(child: VContainer) {
    if (child._parent) child.detach();
    child._parent = this;
    this._nested.push(child);
    this.attachRoots();
  }

  detach() {
    if (this._parent) {
      this._parent._nested.splice(this.index()!, 1);
      this._parent = undefined;
      this.attachRoots();
    }
  }

  move(from: number, to: number) {
    let max = this._nested.length - 1;
    if (from >= 0 && to >= 0 && from <= max && to < max) {
      let moved = this._nested.splice(from, 1)[0];
      this._nested.splice(to, 0, moved);
      this.attachRoots();
    }
  }

  setHiddenByMixin(mixin: string, hidden: boolean) {
    let s = this._hiddenByMixin;
    hidden ? s.delete(mixin) : s.add(mixin);
    this.attachRoots();
  }
}

// VNode + Full interface

interface VContainer {
  setNodes(nodes: VNode[]): void;
  getNodes(): VNode[];
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

export { VContainer, VNode };

// Clone

interface VContainer {
  clone(deep: boolean): VContainer;
  cloneRecurse(from: VContainer): void;
}

VContainer.prototype.clone = function (this: VContainer, deep) {
  let container = new VContainer();
  let nodes = this.getNodes().map(original => {
    let { self, next, parent, children } = original;
    let node = original.node.cloneNode() as Text | Element;
    return new VNode(container, self, next, parent, [...children], node);
  });
  container.setNodes(nodes);
  container.attachNodeChildren();
  container.attachNodeListeners();
  if (deep) container.cloneRecurse(this);
  return container;
};

VContainer.prototype.cloneRecurse = function (this: VContainer, from) {
  from.getNested().forEach(n => this.append(n.clone(true)));
};

// Reattach

interface VContainer {
  componentRoot?: Node;
  getRoots(onlyFirst: boolean, result?: VNode[]): VNode[];
  getRootAfterThis(): VNode | undefined;
  findPossibleSibling(): VContainer | undefined;
  findComponentRoot(): Node | undefined;
  attachRoots(): void;
  attachNodeChildren(): void;
  attachNodeListeners(): void;
}

VContainer.prototype.getRoots = function (this: VContainer, onlyFirst, o = []) {
  if (this.isVisible() && (!onlyFirst || !o.length)) {
    if (this.hasNested()) {
      this.getNested().forEach(n => n.getRoots(onlyFirst, o));
    } else {
      o.push(...this.getNodes().filter(n => !n.parent));
    }
  }
  return o;
};

VContainer.prototype.findPossibleSibling = function (this: VContainer) {
  let parent = this.getParent();
  let sibling = this.getSibling();
  return sibling || (parent && parent.findPossibleSibling());
};

VContainer.prototype.findComponentRoot = function (this: VContainer) {
  let parent = this.getParent();
  return parent ? parent.findComponentRoot() : this.componentRoot;
};

VContainer.prototype.getRootAfterThis = function (this: VContainer) {
  let sibling = this.findPossibleSibling();
  if (!sibling) return;
  let first = sibling.getRoots(true);
  return first[0] || sibling.getRootAfterThis();
};

VContainer.prototype.attachRoots = function (this: VContainer) {
  // Check visiblilty
  let component = this.findComponentRoot();
  if (!component) return;
  let after = this.getRootAfterThis();
  let roots = this.getRoots(false).map(r => r.node);
  roots.forEach(r => component!.insertBefore(r, after?.node || null));
};

VContainer.prototype.attachNodeChildren = function (this: VContainer) {
  // TODO
};

VContainer.prototype.attachNodeListeners = function (this: VContainer) {
  // TODO
};
