import { VContainer, VNode } from './2-vdom';

function getRoots(visible?: boolean, first?: boolean) {
  return function iter(this: VContainer, r: VNode[] = []) {
    if (first && r.length) return r;
    if (visible && !this.isVisible()) return r;
    if (this.hasNested()) {
      this.getNested().forEach(n => iter.call(n, r));
    } else {
      r.push(...this.getNodes().filter(n => !n.parent));
    }
    return r;
  };
}

VContainer.prototype.getRoots = getRoots();
VContainer.prototype.getVisibleRoots = getRoots(true);
VContainer.prototype.getFirstRoot = getRoots(true, true);

VContainer.prototype.findSibling = function (this: VContainer) {
  let parent = this.getParent();
  let sibling = this.getSibling();
  return sibling || (parent && parent.findSibling());
};

VContainer.prototype.findComponentRoot = function (this: VContainer) {
  let parent = this.getParent();
  return parent ? parent.findComponentRoot() : this.componentRoot;
};

VContainer.prototype.getRootAfterThis = function (this: VContainer) {
  let sibling = this.findSibling();
  return sibling && (sibling.getFirstRoot()[0] || sibling.getRootAfterThis());
};

VContainer.prototype.attachRoots = function (this: VContainer) {
  let component = this.findComponentRoot();
  if (component && this.isVisible()) {
    let after = this.getRootAfterThis();
    let roots = this.getVisibleRoots().map(r => r.node);
    roots.forEach(r => component!.insertBefore(r, after?.node || null));
  } else {
    this.getRoots().forEach(r => r.node.remove());
  }
};
