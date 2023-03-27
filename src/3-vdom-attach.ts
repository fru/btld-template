import type { VContainer, VNode } from './2-vdom';

export { getRoots, findPossibleSibling, findComponentRoot };
export { getRootAfterThis, attachRoots };

type Opts = { onlyFirst?: boolean; includeInvisible?: boolean };

function getRoots(this: VContainer, opts: Opts, o: VNode[] = []): VNode[] {
  if (this.isVisible() || opts.includeInvisible) {
    if (!o.length || !opts.onlyFirst) {
      if (this.hasNested()) {
        this.getNested().forEach(n => n.getRoots(opts, o));
      } else {
        o.push(...this.getNodes().filter(n => !n.parent));
      }
    }
  }
  return o;
}

function findPossibleSibling(this: VContainer): VContainer | undefined {
  let parent = this.getParent();
  let sibling = this.getSibling();
  return sibling || (parent && parent.findPossibleSibling());
}

function findComponentRoot(this: VContainer): Node | undefined {
  let parent = this.getParent();
  return parent ? parent.findComponentRoot() : this.componentRoot;
}

function getRootAfterThis(this: VContainer): VNode | undefined {
  let sibling = this.findPossibleSibling();
  if (!sibling) return;
  let first = sibling.getRoots({ onlyFirst: true });
  return first[0] || sibling.getRootAfterThis();
}

function attachRoots(this: VContainer): void {
  let component = this.findComponentRoot();
  if (component && this.isVisible()) {
    let after = this.getRootAfterThis();
    let roots = this.getRoots({}).map(r => r.node);
    roots.forEach(r => component!.insertBefore(r, after?.node || null));
  } else {
    let roots = this.getRoots({ includeInvisible: true }).map(r => r.node);
    roots.forEach(r => r.remove());
  }
}
