import { VContainer, VNode } from './2-vdom';

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
