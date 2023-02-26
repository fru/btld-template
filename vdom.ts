export interface Definition {
  // Parsed: tag attr string paths
  createVdom(root: VdomRoot): Vdom {

  }
}

function root() {
  let root = { vdom: new Vdom() };
  root.vdom.root = root;
  return root.vdom;
}

export class Vdom {
  tag: string;
  dom: HTMLElement;
  domListener: { [event: string]: DomListener[] };

  webComponents: HTMLElement[];
  webComponentsListener: (added: HTMLElement) => void;

  root: VdomRoot;
  parent: Vdom;
  attrs: { [attr: string]: ContentExp[] } = {};

  // Order of precedence:
  children: Vdom[] = [];
  content: ContentExp[] | InnerHTML;
  contentDom: Node[];

  getDomChildren(): Node[] {
    if (this.children) {
      return this.children.flatMap(c => c.dom || c.getDomChildren());
    }
    return this.contentDom || [];
  }

  getDomParent(): HTMLElement | undefined {
    let parent = this.parent;
    do {
      if (parent.dom) return parent.dom;
    } while (parent = parent.parent);
  }

  getDomPrevious(): HTMLElement | undefined {

  }

  createChild() {
    let wrapper = new Vdom();
    wrapper.root = this.root;
    wrapper.parent = this;
    return wrapper;
  }

  reattachToDom() {
    let previous = this.getDomPrevious();
    if (previous) {
      previous.before(this.dom);
    } else {
      this.getDomParent()?.prepend(this.dom);
    }
  }

  detached: { [mixin: string]: boolean };
  mixin: string;
  mixinDisabledDefaultRenderer: string;

  state: { [key: string]: unknown };
  stateListener: { [key: string]: StateListener[] };

  api = {
    getTag: () => this.tag,
    setTag: (tag: string) => {
      if (parent === null) return;
      if (tag && tag !== this.tag) {
        this.tag = tag;
        if (this.dom) this.dom.remove();
        this.dom = document.createElement(tag);
        for (let [ev, listeners] of Object.entries(this.domListener)) {
          for (let l of listeners) this.dom.addEventListener(ev, l);
        }
        this.dom.replaceChildren(...this.getDomChildren());
        this.reattachToDom();
      }
    },
    addDomListener: (name: string, listener: DomListener) => {
      this.domListener[name] = this.domListener[name] || [];
      this.domListener[name].push(listener);
      this.dom?.addEventListener(name, listener);
    },

    getRoot: () => this.root.vdom.api,
    getParent: () => this.parent.api,
    getChildren: () => this.children.map((c) => c.api),

    wrap: (start: number, count: number) => {
      let wrapper = this.createChild();
      wrapper.children = this.children.splice(start, count, wrapper);
      for (let c of wrapper.children) c.parent = wrapper;
    },
    move: (from: number, to: number) => {
      let moved = this.parent.children.splice(from, 1);
      this.parent.children.splice(to, 0, ...moved);
      this.reattachToDom();
    },
    append: (definition?: Definition) => {
      let created: Vdom;
      if (definition) {
        created = definition.createVdom(this.root);
      } else {
        created = this.createChild();
      }
      this.children.push(created);
      this.reattachToDom();
      return created;
    },

    isDetachedByMixin: () => this.detached[this.mixin],
    setDetachedByMixin: (d: boolean) => (this.detached[this.mixin] = d),
    isDetached: () => {
      for (let mixin in this.detached) {
        if (this.detached[mixin]) return true;
      }
    },

    setState: (key: string, value: unknown) => {
      // Get previous + Update state
      // Trigger Listeners
      // Propagate down unless it was set down locally
    },
    setProperty: (key: string, value: unknown) => {
      this.dom && (this.dom[key] = value);
    },
    addStateListener: (key: string, listener: StateListener) => {
      this.stateListener[key] = this.stateListener[key] || [];
      this.stateListener[key].push(listener);
    },

    setAttribute: (name: string, value: ContentExp[]) => {
      // detach all old listeners
      this.attrs[name] = value;
      // set atttribute on dom
      // reattach listeners
    },

    setContent: (content: ContentExp[] | InnerHTML) => {
      if (this.children.length) return; // cant override children
      // mainly used by i18n
      // maybe split into two functions: setContent Exp | HTML
      // detach all old listeners
      this.content = content;
      // execute for ContentExp:
      // 1. transformed to: object[]
      // 2. transformed to: HTMLElement[]
      // attach to dom .replaceChildren
      // reattach listeners
    },

    disableDefaultRenderer: () => {
      this.mixinDisabledDefaultRenderer = this.mixin;
    },
    queryFirstDetached: () => {
      // Get the first child that was detached by this mixin
    },
  };
}

type DomListener = (...args: any[]) => void;
type StateListener = (before: unknown, after: unknown) => void;
type VdomRoot = { vdom: Vdom };
type ContentExp = string | { path: string[]; listener: StateListener };
type InnerHTML = string;
