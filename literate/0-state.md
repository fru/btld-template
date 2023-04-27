# Reactivity aka. Model Change Detection

Reactivity is a key differentiator among front-end frameworks. Each framework
has its unique approach to data synchronization and DOM manipulation.

We employ a technique that involves freezing all the data utilized for rendering
components. With the use of proxies, updates can still be made without the need
to copy the entire data structure. Instead, a new frozen state is generated, and
only the modified properties are updated, leading to improved performance. This
is heavily inspired by the amazing [immer.js](https://github.com/immerjs/immer)
library.

### Other Frameworks

Other frameworks have their own approaches. For example, React uses a virtual
DOM and compares two versions to detect changes. Angular 2 re-evaluates
expressions used in components and improves performance with VM inline caching.
Vue 2 uses a reactive system that watches the properties accessed during
rendering using getters and setters provided by Object.defineProperty().

However, when dealing with deeply nested data, these approaches can present
challenges. Redux, a state management library commonly used with React,
addresses this issue by using pure reducers to produce a new state instead of
modifying the current state directly. Vue 3 has enhanced its capabilities from
version 2 by incorporating Proxies. Although, while retrieving data, Proxies are
also employed which can lead to inconsistent equality comparisons.

## A: Utilities

Okay, so lets start with some utilities for type checking, cloning and caching.

```typescript
function isObject(value: unknown): value is object {
  return value !== null && typeof value === 'object';
}

function shallowCloneObject(value: object): object {
  if (Array.isArray(value)) return value.slice(0);
  return Object.assign({}, value);
}

class Cache<V> extends Map<any, V> {
  caching(key: any, creator?: (setCache: (V) => void) => void): V | undefined {
    if (!this.has(key) && creator) {
      // Stops infinite recursion issues
      this.set(key, undefined as V);
      // Create cache entry
      creator(c => this.set(key, c));
    }
    return this.get(key);
  }
}
```

## B: Update Proxy

Our approach relies on first freezing the data. However, with the help of the
following update proxy, the data can still be modified while also marking which
parts of the data remain unchanged.

Specifically, the symbol `[[unchanged]]` is used to indicate whether a shallow
object has been modified through the update proxy using the `set` and
`deleteProperty` traps. If unchanged this property points to the frozen object
otherwise it is set to false.

```typescript
const unchanged = Symbol('unchanged');

function createProxy(frozen: object, cache: Cache<object>) {
  return cache.caching(frozen, setCache => {
    const clone = shallowCloneObject(frozen);
    clone[unchanged] = frozen;

    const proxy = new Proxy(clone, {
      setPrototypeOf: () => false, // Disallow prototype

      // Write traps:
      set: function (target) {
        target[unchanged] = false;
        // @ts-ignore: next-line
        return Reflect.set(...arguments);
      },
      deleteProperty: function (target) {
        target[unchanged] = false;
        // @ts-ignore: next-line
        return Reflect.deleteProperty(...arguments);
      },

      // Read trap:
      get: function (target, p) {
        if (p === unchanged) return target[p];
        if (target[p] !== frozen[p]) return target[p];
        // Functions are still returned frozen
        if (!isObject(target[p])) return target[p];
        return createProxy(frozen[p], cache);
      },
    });
    setCache(proxy);
  });
}
```

## C: Normalize `[[unchanged]]`

The previously defined update proxy only marks direct objects that have been
changed. However, for the refreezing operation, it's important to know not only
if a direct object has changed, but also whether there are any changes in its
child objects. To accomplish this, a normalization function is used to set the
appropriate parent property `[[unchanged]]` to `false`.

This is achieved in two steps: first, all directly changed objects are collected
into `changedDirectly`, and all parent-child relationships are identified and
stored in `childToParents`. Second, these relationships are iterated, and the
parent objects that were identified in the previous step are marked as changed.

```typescript
function normalizeUnchangedMarker(root: object) {
  // Because this is an object graph, any object can have many parents
  const childToParents = new Map<object, object[]>();
  const changedDirectly = new Set<object>();

  const stopIterating = new Set();

  (function fillMappings(val: object) {
    if (val && !val[unchanged]) changedDirectly.add(val);
    stopIterating.add(val);

    for (var p in val) {
      let child = val[p];
      if (!isUnfrozenObject(child)) continue;
      // Fill parent map
      if (!childToParents.has(child)) childToParents.set(child, []);
      childToParents.get(child)!.push(val);
      // Recurse
      if (!stopIterating.has(child)) fillMappings(child);
    }
  })(root);

  function normalizeIterateParents(changed: object) {
    let parents = childToParents.get(changed) || [];
    for (let parent of parents) {
      if (!parent[unchanged]) continue;
      parent[unchanged] = false;
      normalizeIterateParents(parent);
    }
  }
  changedDirectly.forEach(normalizeIterateParents);
}
```

## D: Freeze

Now its time to recursively clone all objects that are not fully marked as
unchanged. This is used when freezing an object tree.

Recurse with the following stop conditions:

- value does not need deep freeze
- changedObjectCache contains value
- value and all deep children have unchanged marker set

We set the symbol `[[frozen]]` to true on any frozen object. This indicates that
the whole subtree is frozen. Testing for `Object.isFrozen()` only checks the
shallow object.

```typescript
const frozen = Symbol('frozen');

function isUnfrozenObject(val: unknown): val is object {
  return isObject(val) && !val[frozen];
}

function freeze(root: unknown) {
  if (!isObject(root)) return Object.freeze(root);
  normalizeUnchangedMarker(root);
  const cloneCache = new Cache<object>();
  const result = cloneChanged(root, cloneCache);

  cloneCache.forEach(obj => {
    obj[frozen] = true;
    Object.freeze(obj);
  });
  return result;
}

function cloneChanged(val: unknown, cache: Cache<object>) {
  // Simple Cases - No cloning needed
  if (typeof val === 'function') return Object.freeze(val);
  if (!isUnfrozenObject(val)) return val;
  if (val[unchanged]) return val[unchanged];
  if (val instanceof Date) return val.toISOString();

  // Clone and recurse
  return cache.caching(val, setCache => {
    const cloned = shallowCloneObject(val);
    setCache(cloned);

    for (var prop in cloned) {
      cloned[prop] = cloneChanged(cloned[prop], cache);
    }
  });
}
```

TODO the most minimal interface.

```typescript
abstract class StateMinimal {
  __frozen = freeze({});

  root = (prop: string) => this.__frozen[prop];
  update(action: (data: object) => void): void {
    const root = createProxy(this.__frozen, new Cache());
    action(root!);
    this.__frozen = freeze(root);
    this.onChange();
  }
  abstract onChange(): void;
}
```

The more useable state object

```typescript
export class State extends StateMinimal {
  __cacheGet = new Cache<Get>();

  get(path: string) {
    return createGet(path, this.__cacheGet)(this);
  }
  set(path: string, value: unknown) {
    this.update(path, ({ parent, key }) => (parent[prop] = value));
  }
  map(path: string, action: (ctx: WriteCtx) => void) {
    this.update(data => action(initialize(path, data)));
  }
  onChange() {
    __cacheGet.clear();
  }
}
```

Layer that manages computable's

```typescript
type Computable = (state: State) => unknown;
type ComputableObj = { [prop: string]: Computable };

export function computed(state: State, comp: ComputableObj): State {
  let cacheResult = new Cache<unknown>();
  let cacheFrozen = null;

  function root(prop: string) {
    const that = this;
    if (!comp[prop]) return state.root(prop);

    // root(...) is not cached so no other cache invalidation is needed
    if (cacheFrozen !== state.__frozen) {
      cacheResult.clear();
      cacheFrozen = state.__frozen;
    }

    return cacheResult.caching(comp[prop], setCache => {
      try {
        setCache(freeze(comp[prop](that)));
      } catch (e) {
        console.error(e);
      }
    });
  }
  return Object.setPrototypeOf({ root }, state);
}
```

Paths and accessors

Interface: Get, WriteCtx, createGet, initialize

```typescript
const isArrayProp = (prop: any) => +prop >= 0;

function getExpectedObject(val: unknown, isArray: boolean) {
  if (val === null || val === undefined) return isArray ? [] : {};
  if (!isUnfrozenObject(val)) return false;
  if (Array.isArray(val) !== isArray) return false;
  return val;
}

type Segment = { p: string; ref?: true };
type WriteCtx = { parent: object; prop: string | number };
type Getter = () => unknown;
type Writer = () => WriteCtx;

function parsePath(input: string): Segment[] {
  // TODO 2 - cache!
  function section(p) {
    return p.startsWith(':') ? { p: p.substring(1), ref: true } : { p };
  }
  return input.split('/').map(section);
}

function createGetter(path: string, cache: Cache<Getter>): Getter {
  return cache.caching(path, setCache => {
    let segments = parsePath(path);
    // TODO 1 - actually compile
  });
}

function createBuilder(path: string, from?: WriteCtx): WriteCtx {
  let segments = parsePath(path);
  return () => ({ parent: {}, prop: 123 });
}
```
