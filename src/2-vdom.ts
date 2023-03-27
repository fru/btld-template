// VContainer

import { getRoots, getRootAfterThis, attachRoots } from './3-vdom-attach';
import { findPossibleSibling, findComponentRoot } from './3-vdom-attach';

import { clone, cloneRecurse } from './3-vdom-clone';
import { attachNodeChildren, attachNodeListeners } from './3-vdom-clone';

class VContainer {
  private _parent: VContainer | undefined;
  private _nested: VContainer[] = [];

  componentRoot?: Node;

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

  getRoots = getRoots;
  findPossibleSibling = findPossibleSibling;
  findComponentRoot = findComponentRoot;
  getRootAfterThis = getRootAfterThis;
  attachRoots = attachRoots;

  clone = clone;
  cloneRecurse = cloneRecurse;
  attachNodeChildren = attachNodeChildren;
  attachNodeListeners = attachNodeListeners;
}

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
