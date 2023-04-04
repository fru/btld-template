class VContainer {
  roots: (Text | Element)[];
  hiddenBy = new Set<string>();
  clone?: () => VContainer;
  actualize(parent: Node, list: VContainer[]) {
    if (this.visible()) {
      let start = list.indexOf(this) + 1;
      let found = start > 0 && list.slice(start).find(x => x.visible());
      let after = (found && found.roots && found.roots[0]) || null;
      (this.roots || []).forEach(r => parent.insertBefore(r, after));
    } else {
      this.roots && this.roots.forEach(r => r.remove());
    }
  }
  visible() {
    return !this.hiddenBy.size && this.roots.length;
  }
}
