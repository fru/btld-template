VContainer.prototype.clone = function (this: VContainer, deep) {
  let container = new VContainer();
  let nodes = this.getNodes().map(original => {
    let { self, next, parent, children } = original;
    let node = original.node.cloneNode() as Text | Element;
    return new VNode(container, self, next, parent, [...children], node);
  });
  container.setNodes(nodes);
  container.attachNodeChildren();
  container.attachNodeListeners();
  if (deep) container.cloneRecurse(this);
  return container;
};

VContainer.prototype.cloneRecurse = function (this: VContainer, from) {
  from.getNested().forEach(n => this.append(n.clone(true)));
};
