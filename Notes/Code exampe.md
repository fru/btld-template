---
created: 2023-03-08T17:32:40+03:00
modified: 2023-03-08T21:35:36+03:00
---

# Code exampe

```ts
type StateListener = (after: any, before: any) => void;
type Path = {p: string, ref?: true, l?: StateListener}[];

let parsePath = (s: string): Path => s.split('.').map(p => {
  if (!p.startsWith(':')) return {p};
  return {p: p.substring(1), ref: true};
});

let parsePathErrorCheck = 
  
 function parseText(s: string): VdomContent[] {
   S.match(${})
   return {content: []}; 
 } 
  
 function parseTemplate(s: string): Vdom {
   if (s.contains('<') document.createElement('template')
   else new Vdom(parseText(s))
   return new Vdom(); 
 } 
  
  
  
 
 // Every listener is in a path or managed by a mixin 
 type VdomPathParsed = (string | {ref: string})[]; 
 type VdomPath = {path: VdomPathParsed, listener: VdomStateListener};
  
 interface VdomContent { 
   content: Node[] | Vdom, 
   producer?: VdomPath // Path can point to (api) => Node[] 
 } 
  
 interface VdomAttrPart { 
   content: unknown, // Stringified if multiple 
   producer?: VdomPath // Result mapped via middleware state 
 } 
  
 class VdomState { 
   dom: HTMLElement; 
   content: VdomContent[] = []; 
   state: {[key: string]: unknown} = {}; 
   listeners: {[key: string]: VdomStateListener[]} = {}; 
   attrs: {[attr: string]: VdomAttrPart[]} = {}; 
  
   // This shouldn't be needed as this would mean replaceChildren
   rerenderContent: boolean = false;
  
   setState = () => { 
     // Update state 
     // Call listeners 
     // Drill down into content Vdom 
   } 
  
   setAttr = (attr: string, value: unknown, {parse = false}) => { 
     if (parse) {} // parse as well? 
  
     // Produce listeners & detach old 
     //  - stringify if multiple 
     //  ? map via middleware states 
     //  - produce content or attr listeners 
  
     // Actually set the attribute 
   } 
  
   setContent = () => {} 
   addListener = () => {} 
 }
```


## Other Code

```ts
export class Vdom {
  tag: string;
  dom: HTMLElement;
  domListener: { [event: string]: DomListener[] };

  // TODO - contains all the webcomponents added to vdom - does this make sense?
  // Do we need this to pass default parameters to all web components
  // Can we do this with innerHTML
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
    if (this.children.length) {
      return this.children.flatMap((c) => c.dom || c.getDomChildren());
    }
    return this.contentDom || [];
  }

  reattachToDom() {
    let getNode = (vdom: Vdom) => vdom.dom || vdom.contentDom?.[0];

    function getNextDeep({ children }: Vdom, start: number): Node | null {
      for (let i = start; i < children.length; i++) {
        if (!children[i].api.isDetached()) {
          let next = getNode(children[i]) || getNextDeep(children[i], 0);
          if (next) return next;
        }
      }
      return null;
    }

    let next: Node | null = null;
    let current: Vdom = this;

    do {
      let index = current.parent?.children.indexOf(current);
      if (!next) next = getNextDeep(current.parent, index + 1);
      current = current.parent;
    } while (current && !current.dom);

    let nodes = this.getDomChildren();
    for (let node of nodes) current?.dom.insertBefore(node, next);
  }

  getPathValue(path: string[]): unknown[] {
    // Get path value 
    // Use mapping function in state to get array of values
    // If node return otherwise toString()
    return [];
  }

  concatinateIntoString(value: any) {

  }

  bindValueExp(values: ContentExp[], callback: (value: unknown) => void) {
    let result = values.slice();
    for (let i = 0; i < result.length; i++) {
      if (typeof result[i] === 'string') continue;
      let {path} = values[i];
      let setter = () => result[i] = this.getPathValue(path);
    }
    // TODO add listeners
  }

  unbindValueExp(value: ContentExp[]) {
    // TODO
  }

  createChild() {
    let wrapper = new Vdom();
    wrapper.root = this.root;
    wrapper.parent = this;
    wrapper.state = { ...this.state };
    return wrapper;
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
        created = definition.createVdom(this.root, this.state);
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
      let previous = this.state[key];
      if (value === previous) return;
      this.state[key] = value;
      for (var l of this.stateListener[key]) l(value, previous);
      for (var c of this.children) {
        if (c.state[key] === previous) c.api.setState(key, value);
      }
    },
    setProperty: (key: string, value: unknown) => {
      this.dom && (this.dom[key] = value);
    },
    addStateListener: (key: string, listener: StateListener) => {
      this.stateListener[key] = this.stateListener[key] || [];
      this.stateListener[key].push(listener);
    },

    // TODO handle content placeholder + (re)create listeners

    setAttribute: (name: string, value: ContentExp[]) => {
      if (this.attrs[name]) this.unbindValueExp(this.attrs[name]);
      this.attrs[name] = value;
      this.bindValueExp(this.attrs[name], (content) => {
        this.dom?.
      });
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
      for (let c of this.children) {
        if (c.api.isDetachedByMixin()) return c;
      }
    },
  };
}

type DomListener = (...args: any[]) => void;
type VdomRoot = { vdom: Vdom };
```
