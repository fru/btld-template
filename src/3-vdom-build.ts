import { VContainer } from './2-vdom';

VContainer.prototype.append = function (this: VContainer, child) {
  if (child._parent) child.detach();
  child._parent = this;
  this._nested.push(child);
  this.attachRoots();
};

VContainer.prototype.detach = function () {
  if (this._parent) {
    this._parent._nested.splice(this.index()!, 1);
    this._parent = undefined;
    this.attachRoots();
  }
};

VContainer.prototype.move = function (from, to) {
  let max = this._nested.length - 1;
  if (from >= 0 && to >= 0 && from <= max && to < max) {
    let moved = this._nested.splice(from, 1)[0];
    this._nested.splice(to, 0, moved);
    this.attachRoots();
  }
};

VContainer.prototype.setHiddenByMixin = function (mixin, hidden) {
  let s = this._hiddenByMixin;
  hidden ? s.delete(mixin) : s.add(mixin);
  this.attachRoots();
};
