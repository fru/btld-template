// Freeze full object tree
class State {
  frozen: unknown; // Freeze full object tree
}

// On update proxy is used to return EditPoint

// Create "State" from existing object // deep clone - delayed?

// Navigate using JUST normal properties: string | symbol
// Navigation replaces typeof object with other proxies
// Edit is disabled in these proxies
// Not needed?: Parent, Prop or State references

function clone(data: unknown) {}

function readonly(data: unknown) {
  if (data === null || typeof data !== 'object') return data;
  // TODO Clone data if it has not been done yet?
  return new Proxy(clone(data), {
    setPrototypeOf: () => false,
    set: () => false,
    get: (target, prop) => readonly(target[prop]),
  });
}

type Prop = string | symbol;

class EditContext {
  constructor(
    public data: unknown,
    public parent: EditContext,
    public prop?: Prop
  ) {}
  cascade(prop: Prop, value: any) {
    // Check if we are still in edit mode
    // TODO how to cascade, what to do when you reach the top?
  }
}

function writable(data: unknown, ctx: EditContext, prop?: Prop) {
  if (data === null || typeof data !== 'object') return data;
  let child = new EditContext(data, ctx, prop);
  return new Proxy(data, {
    setPrototypeOf: () => false,
    get: (target, prop) => writable(target[prop], child, prop),
    set: (_, prop, value) => (ctx.cascade(prop, value), true),
  });
}

class Writable {
  constructor(private data: unknown, private parent?: Writable) {}

  cascade(prop: string | symbol, value: unknown) {}
}

// Subscribe or Edit can only be done on state
// Paths are required for subscripe
// GetPath might as well be implemented here - should be faster

// State is not Proxy

type Section = { p: string | Symbol; ref?: true };
type Path = Section[];
type PathSegment = Path | Primitive;

type Primitive = Prop | number | boolean | bigint;

interface Frozen<T> {
  $get(...paths: PathSegment[]): Frozen<T>;
  $getState(): State<T>;
  $update(action: (f: Frozen<T>) => void): void;
  //[d: string | symbol]: Function | Frozen<T> | Primitive;
}

class Frozen<T> {
  constructor(state: State<T>, parent: Frozen<T>, prop: Prop, data: object) {
    return readonlyProxy(state, this, data);
  }
}

function readonlyProxy<T>(state: State<T>, current: Frozen<T>, data: any) {
  return new Proxy<Frozen<T>>(data, {
    setPrototypeOf: () => false,
    set: () => false,
    get: (target, prop) => {
      let data = target[prop];
      if (data === null || typeof data !== 'object') return data;
      return new Frozen(state, current, prop, data);
    },
  });
}

type OnPaths<T> = (Frozen<T> | Path)[];
type OnAction<T> = (this: T, ...values: Frozen<T>[]) => void;

interface State<T> extends Frozen<T> {
  $context: T;
  $clone(context: T): State<T>;
  $subscribe(paths: OnPaths<T>, cb: OnAction<T>): void;
}

const fields = [
  '$get',
  '$update',
  '$state',
  '$path',
  '$secretData',
  '$context',
  '$clone',
  '$subscribe',
];

/*class Frozen<T> {
  constructor() {
    return new Proxy(this, {
      setPrototypeOf: () => false,
      set: (target, prop, value) => {
        if (fields.includes(prop as string)) return false;
        this.$state.trigger();
        console.log('PROXY SET', prop, value);
        return true;
      },

      get: (target, prop) => {
        console.log('PROXY GET', key);
        return object[key];
      },
    });
  }
}*/

// 1. Deep clone and freeze + Wrap in class: Frozen
// 2. that + list of properties -> Freeze + Add to state
// 3. that + list of properties -> Add getter + setter into state
// 4. Frozen -> get ('test')
// 5. Should we proxy to get properties: (x as Frozen).test -> y is Frozen

// 6. new State() has one frozen obj, contains change listeners, can be cloned
// 7. new Frozen() is path + state, can be used to edit state
// 8. data() extracts immutable to be assigned to another State

// 9. get(1, [{p: 't1'}, {p: 't2', ref: true}], 'val')
// 10. special ":state"
/*
class Fro {
  constructor() {
    return new Proxy(this, {
      set: (object, key, value) => {
        object[key] = value;
        console.log('PROXY SET', key, value);
        return true;
      },
      get: (object, key) => {
        console.log('PROXY GET', key);
        return object[key];
      },
    });
  }
}

class State extends Frozen {
  constructor(root) {
    super();
  }
  test = 'test';
}

let s = new State();

class Array {
  constructor() {
    return new Proxy([1, 2, 3, 4, 5], {
      set: (object, key, value, proxy) => {
        object[key] = value;

        console.log('PROXY SET', key, value);
        return true;
        return proxy;
      },
      get: (object, key) => {
        console.log('PROXY GET', key);
        return object[key];
      },
      deleteProperty: (object, key) => {
        console.log('PROXY DELETE', key);
        return true;
      },
    });
  }
}

let a = new Array();

a.splice(2, 2, 50);
Array.from(a);*/

// TODO all edits:
// defineProperty
// setPrototypeOf
// preventExtensions
//
