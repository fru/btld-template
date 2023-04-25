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

export function freeze(root: object) {
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
export abstract class SimpleState {
  __frozen = freeze({});
  frozen = () => this.__frozen;

  update(action: (data: object) => void): void {
    const root = createProxyCached(this.__frozen, new Map());
    action(root);
    this.__frozen = freeze(root);
    this.onChange();
  }
  abstract onChange(): void;
}
```

Helper functions for complex state:

- Parse path

```typescript
export const isArrayProp = (prop: unknown) => +prop >= 0;

export function getExpectedObject(val: unknown, isArray: boolean) {
  if (val === null || val === undefined) return num ? [] : {};
  if (!isUnfrozenObject(val)) return false;
  if (Array.isArray(val) !== isArray) return false;
  return val;
}

export type Path = { get: PathGetter; write: PathWriter };
export type PathGetter = () => unknown;
export type PathWriter = () => {
  parent: object;
  prop: string | number;
};

export function parse(path: string, cache: Map<string, Path>): Path {
  if (!cache.has(path)) {
    // TODO 1 - actually parse

    cache.set(path, {
      get: compileCachedGetter(['test', 123]),
      write: function write() {
        // TODO 2 - actually write recurse
        return { parent: {}, prop: 123 };
      },
    });
  }
  return cache.get(path)!;
}

export function compileCachedGetter(props: (string | number)[]): PathGetter {
  // TODO 3 - actually compile
}
```

- ensureExists(parent: )

```typescript
export class State extends SimpleState {
  __cachePaths = new Map<string, Path>();
  __cacheComputed = new Map<string, unknown>();

  __computed = new Map<string, Function>();

  watchers = new Set<Function>();

  get(path: string) {
    // TODO 4: How to pass computed + compCache + state to paths
    // - Just arguments?
    // - root(key) function that resolves the state / computable on root
    // !!! wait __cacheComputed needs to autoclear when value of different state is passed to getter
  }
  set(path: string, value: unknown) {}
  update(path: string, action: (data: object) => void) {}
  setComputed(root: string, computable: Function) {}
}
```

## TODO's

Root override state:

- item, index & formatters are computed
- Only mixins provide computable's
- Separate from state (always on root level)
- Frozen and cached
- Cleared on state change or by mixins
- Can access each other with just a simple get(path);

TODO 5 !!!!!!! => How to change index but keep specialized CompState with
formatters Use prototype chain? ComputableState + add computable -> Child
ComputableState changes
