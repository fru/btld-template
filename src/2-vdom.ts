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

export interface VContainer {
  append(this: VContainer, child: VContainer): void;
  detach(): void;
  move(from: number, to: number): void;
  setHiddenByMixin(mixin: string, hidden: boolean): void;
}

type GetRootOpts = { onlyFirst?: boolean; includeInvisible?: boolean };

export interface VContainer {
  getRoots(opts: GetRootOpts, result?: VNode[]): VNode[];
  componentRoot?: Node;
  getRootAfterThis(): VNode | undefined;
  findPossibleSibling(): VContainer | undefined;
  findComponentRoot(): Node | undefined;
  attachRoots(): void;
}

export interface VContainer {
  clone(deep: boolean): VContainer;
  cloneRecurse(from: VContainer): void;
  attachNodeChildren(): void;
  attachNodeListeners(): void;
}

export interface VContainer {
  setNodes(nodes: VNode[]): void;
  getNodes(): VNode[];
}
