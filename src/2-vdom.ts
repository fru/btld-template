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
    this.repositionRoots();
  }

  detach() {
    if (this._parent) {
      this._parent._nested.splice(this.index()!, 1);
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

  setHiddenByMixin(mixin: string, hidden: boolean) {
    let s = this._hiddenByMixin;
    hidden ? s.delete(mixin) : s.add(mixin);
    this.repositionRoots();
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

// Clone

interface VContainer {
  clone(deep: boolean): VContainer;
  cloneRecurse(from: VContainer): void;
}

VContainer.prototype.clone = function (this: VContainer, deep) {
  let container = new VContainer();
  let nodes = this.getNodes().map(original => {
    let { self, next, parent, children } = original;
    let node = original.node && (original.node.cloneNode() as Text | Element);
    return new VNode(container, self, next, parent, [...children], node);
  });
  container.setNodes(nodes);
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
  getRootAfterThis(): VNode;
  repositionRoots(): void;
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

VContainer.prototype.getRootAfterThis = function (this: VContainer) {
  // let current = this;
  // while (current && !current.getSibling()) current = curent.parent;
  // return current.getSibling().getRoots(true)[0];
  return null as VNode;
};

VContainer.prototype.repositionRoots = function (this: VContainer) {
  // Check visiblilty
  let after = this.getRootAfterThis().node;
  let roots = this.getRoots(false).map(r => r.node);
  let component = document.body; // TODO how to get the shadowRoot??? and check if attached
  roots.forEach(r => component.insertBefore(r, after));
};
