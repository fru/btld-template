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

## A: Freezing

Our approach relies on freezing the data first and then unfreezing it for the
update proxy, just to freeze again after the changes are done.

We set the symbol `[[frozen]]` to true on any frozen object. This indicates that
the whole subtree is frozen. Testing for `Object.isFrozen()` only checks the
shallow object.

```typescript
export function isObject(value: unknown): value is object {
  return value !== null && typeof value === 'object';
}

export function shallowCloneObject(value: object): object {
  if (Array.isArray(value)) return value.slice(0);
  return Object.assign({}, value);
}

export type ObjectCache = Map<object, object>;

export function createProxyCached(frozen: object, proxies: ObjectCache) {
  if (!proxies.has(frozen)) {
    proxies.set(frozen, createProxy(frozen, proxies));
  }
  return proxies.get(frozen)!;
}
```

Another symbol `[[unchanged]]` is used to mark if a shallow object has been
modified trough the update proxy using the traps `set` and `deleteProperty`

```typescript
export const unchanged = Symbol('unchanged');

export function createProxy(frozen: object, proxies: ObjectCache) {
  let clone = shallowCloneObject(frozen);
  clone[unchanged] = frozen;

  return new Proxy(clone, {
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
      return createProxyCached(frozen[p], proxies);
    },
  });
}
```

We set the unchanged marker on set and delete only on the direct parent. In
order to refreeze the changes we need to normalize the unchanged marker. This
means that every parent of an object with [unchanged] === false is also set to
false.

```typescript
export function normalizeUnchangedMarker(root: object) {
  const changedDirectly = new Set<object>();
  const stopIterating = new Set();
  // One object can have many parents
  const childToParents = new Map<object, object[]>();

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

Now its time to recursively clone all objects that are not fully marked as
unchanged. This is used when freezing an object tree.

Recurse with the following stop conditions:

- value does not need deep freeze
- changedObjectCache contains value
- value and all deep children have unchanged marker set

```typescript
export const frozen = Symbol('frozen');

export function isUnfrozenObject(val: unknown): val is object {
  return isObject(val) && !val[frozen];
}

export function freeze(root: unknown) {
  if (!isObject(root)) return Object.freeze(root);
  normalizeUnchangedMarker(root);
  const cloneCache = new Map();
  const result = cloneChanged(root, cloneCache);

  cloneCache.forEach(obj => {
    obj[frozen] = true;
    Object.freeze(obj);
  });
  return result;
}

export function cloneChanged(val: unknown, cloneCache: ObjectCache) {
  // Simple Cases - No cloning needed
  if (typeof val === 'function') return Object.freeze(val);
  if (!isUnfrozenObject(val)) return val;
  if (val[unchanged]) return val[unchanged];
  if (val instanceof Date) return val.toISOString();
  if (cloneCache.has(val)) return cloneCache.get(val);

  // Clone and recurse
  const cloned = shallowCloneObject(val);
  cloneCache.set(val, cloned);
  for (var prop in cloned) {
    cloned[prop] = cloneChanged(cloned[prop], cloneCache);
  }
  return cloned;
}
```

TODO the most minimal interface.

```typescript
export abstract class StateMinimal {
  __frozen = freeze({});

  rootProp = (prop: string) => this.__frozen[prop];
  rootUpdate(action: (data: object) => void): void {
    const root = createProxyCached(this.__frozen, new Map());
    action(root);
    this.__frozen = freeze(root);
    this.onChange();
  }
  abstract onChange(): void;
}
```

Layer that manages computable's

```typescript
export type Computable = (state: State) => unknown;
export type ComputableObj = { [prop: string]: Computable };

export function deriveComputable(state: State, comp: ComputableObj): State {
  let derived = Object.create(state);
  let isRunning = false; // Stops infinite recursion issues

  let cacheFrozen = null;
  let cacheComputed = new Map<Computable, unknown>();

  derived.rootProp = function (prop: string) {
    let func = comp[prop];
    if (!func) return state.rootProp(prop);
    // This is enough, since rootProps aren't cached no top level cache invalidation is needed
    if (cacheFrozen !== state.__frozen) cacheComputed.clear();
    if (cacheComputed.has(func)) return cacheComputed.get(func);
    if (isRunning) return undefined;
    let result: unknown = undefined;
    try {
      isRunning = true;
      result = freeze(func(this));
    } catch (e) {
      console.error(e);
    } finally {
      isRunning = false;
      cacheComputed.set(func, result);
    }
    return result;
  };
  return derived;
}
```

Helper functions for complex state:

- Parse path

```typescript
export const isArrayProp = (prop: any) => +prop >= 0;

export function getExpectedObject(val: unknown, isArray: boolean) {
  if (val === null || val === undefined) return isArray ? [] : {};
  if (!isUnfrozenObject(val)) return false;
  if (Array.isArray(val) !== isArray) return false;
  return val;
}

export type PathSection = { p: string; ref?: true };
export type Path = { get: () => unknown; write: () => WriteCtx };
export type WriteCtx = { parent: object; prop: string | number };

export function parsePath(input: string): PathSection[] {
  return input.split('/').map(p => {
    if (!p.startsWith(':')) return { p };
    return { p: p.substring(1), ref: true };
  });
}

export function parse(path: string, cache: Map<string, Path>): Path {
  if (!cache.has(path)) {
    let sections = parsePath(path);
    cache.set(path, {
      get: compileCachedGetter(sections),
      write: compileWriter(sections),
    });
  }
  return cache.get(path)!;
}

export function compileCachedGetter(path: PathSection[]) {
  // TODO 3 - actually compile
  return () => undefined;
}

export function compileWriter(path: PathSection[], from?: WriteCtx) {
  return () => ({ parent: {}, prop: 123 });
}
```

```typescript
export class State extends StateMinimal {
  __cachePaths = new Map<string, Path>();

  watchers = new Set<Function>();

  get(path: string) {}
  set(path: string, value: unknown) {}
  update(path: string, action: (data: object) => void) {}
  onChange() {}
}
```
