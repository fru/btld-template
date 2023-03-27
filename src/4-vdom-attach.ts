import { VContainer } from './2-vdom';

VContainer.prototype.getRoots = function (this: VContainer, opts, o = []) {
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
  let first = sibling.getRoots({ onlyFirst: true });
  return first[0] || sibling.getRootAfterThis();
};

VContainer.prototype.attachRoots = function (this: VContainer) {
  let component = this.findComponentRoot();
  if (component && this.isVisible()) {
    let after = this.getRootAfterThis();
    let roots = this.getRoots({}).map(r => r.node);
    roots.forEach(r => component!.insertBefore(r, after?.node || null));
  } else {
    let roots = this.getRoots({ includeInvisible: true }).map(r => r.node);
    roots.forEach(r => r.remove());
  }
};
