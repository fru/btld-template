import { VContainer, VNode } from './2-vdom';

export { clone, cloneRecurse, attachNodeChildren, attachNodeListeners };

function clone(this: VContainer, deep: boolean): VContainer {
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
}

function cloneRecurse(this: VContainer, from: VContainer) {
  from.getNested().forEach(n => this.append(n.clone(true)));
}

function attachNodeChildren(this: VContainer) {
  // TODO
}

function attachNodeListeners(this: VContainer) {
  // TODO
}
