export class VNode {
  constructor(
    public readonly container: VContainer,
    public readonly self: number,
    public readonly next: number,
    public readonly parent: number,
    public readonly children: number[],
    public node: Text | Element
  ) {}
}

export interface VNode {
  createCallbacks: ((node: Element | Text) => void)[];
  onCreate(this: VNode, cb: (node: Element | Text) => void): void;
  triggerCreate(this: VNode): void;
  clone(this: VNode, into: VContainer): VNode;
  attachChildren(this: VNode): void;
}

export class VContainer {
  _parent: VContainer | undefined;
  _nested: VContainer[] = [];
  _hiddenByMixin = new Set<string>();

  isVisible = () => !this._hiddenByMixin.size;
  getParent = () => this._parent;
  getNested = () => [...this._nested];
  hasNested = () => !!this._nested.length;

  index = () => this._parent && this._parent._nested.indexOf(this as any);
  getSibling = () => this._parent && this._parent._nested[this.index()! + 1];
}

// Build

export interface VContainer {
  append(this: VContainer, child: VContainer): void;
  detach(this: VContainer): void;
  move(this: VContainer, from: number, to: number): void;
  setHiddenByMixin(this: VContainer, mixin: string, hidden: boolean): void;
}

// Attach

export interface VContainer {
  componentRoot?: Node;
  getRoots(this: VContainer): VNode[];
  getVisibleRoots(this: VContainer): VNode[];
  getFirstRoot(this: VContainer): VNode[];
  findSibling(this: VContainer): VContainer | undefined;
  findComponentRoot(this: VContainer): Node | undefined;
  getRootAfterThis(this: VContainer): VNode | undefined;
  attachRoots(this: VContainer): void;
}

// Clone

export interface VContainer {
  clone(this: VContainer, deep: boolean): VContainer;
  cloneRecurse(this: VContainer, from: VContainer): void;
}

// TODO

export interface VContainer {
  setNodes(this: VContainer, nodes: VNode[]): void;
  getNodes(this: VContainer): VNode[];
}
