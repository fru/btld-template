import { VContainer, VNode } from './2-vdom';

VContainer.prototype.clone = function (deep) {
  let container = new VContainer();
  let nodes = this.getNodes().map(original => {
    let { self, next, parent, children } = original;
    let node = original.node.cloneNode() as Text | Element;
    return new VNode(container, self, next, parent, [...children], node);
  });
  container.setNodes(nodes);
  // TODO !!!! Clone state change listener
  nodes.forEach(n => n.triggerCreate());
  if (deep) container.cloneRecurse(this);
  return container;
};

VContainer.prototype.cloneRecurse = function (from) {
  from.getNested().forEach(n => this.append(n.clone(true)));
};

VNode.prototype.onCreate = function (cb) {
  if (!this.createCallbacks) this.createCallbacks = [];
  this.createCallbacks.push(cb);
  cb(this.node);
};

VNode.prototype.triggerCreate = function () {
  (this.createCallbacks || []).forEach(cb => cb(this.node));
};

VNode.prototype.clone = function (into) {
  let { self, next, parent, children } = this;
  let node = this.node.cloneNode() as Text | Element;
  return new VNode(into, self, next, parent, [...children], node);
};

VNode.prototype.attachChildren = function () {
  if (this.node instanceof Text) return;
  let nodes = this.container.getNodes();
  let children = this.children.map(i => nodes[i].node);
  this.node.replaceChildren(...children);
};
