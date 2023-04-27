# Base Store

This is the literary code that defines how data is stored and how reactivity is
implemented in the btld templating engine.

We use a technique that involves freezing all the data used for rendering
components. By using proxies, updates can be made without copying the entire
data structure. Instead, a new frozen state is generated, and only the modified
properties are updated, resulting in improved performance. This is heavily
inspired by the amazing [immer.js](https://github.com/immerjs/immer) library.

Since every change creates new frozen objects, we can simply use equality
comparisons to determine if there are any changes in the current state graph.

## Other Frameworks

Reactivity is a key differentiator among front-end frameworks. Each framework
has its unique approach to data synchronization and DOM adaptation.

For example, React uses a virtual DOM and compares two versions to detect
changes. Angular 2 re-evaluates expressions used in components and improves
performance with VM inline caching. Vue 2 uses a reactive system that watches
the properties accessed during rendering using getters and setters provided by
Object.defineProperty().

However, when dealing with deeply nested data, these approaches can present
challenges. Redux, a state management library commonly used with React,
addresses this issue by using pure reducers to produce a new state instead of
modifying the current state directly. Vue 3 has enhanced its capabilities from
version 2 by incorporating Proxies. Although, while retrieving data, Proxies are
also employed which can lead to inconsistent equality comparisons.

## A: Utilities

Let's start by defining some utilities for type checking, cloning, and caching.

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
`deleteProperty` traps. If unchanged, this property points to the frozen object.
Otherwise, it is set to false to indicate that the object has been modified.

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

We can now define the freezing function. This function takes any object and
returns a version of it that is frozen. It respects the `[[unchanged]]` property
and uses the property value when it is set.

To indicate that the entire subtree is frozen, we set the symbol `[[frozen]]` to
`true` on any frozen object. It is important to note that testing for
`Object.isFrozen()` only checks the shallow object, so using `[[frozen]]` allows
us to determine if the whole subtree is frozen.

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

## E: BaseStore

Finally, let's define the BaseStore class for which all the previous methods
were created. This class provides just two simple methods: one for retrieving
the current frozen state, and another for updating it.

```typescript
export { isUnfrozenObject, Cache };

export class BaseStore {
  __frozen = freeze({});

  frozen(prop: string) {
    return this.__frozen[prop];
  }

  update(action: (data: object) => void): void {
    const root = createProxy(this.__frozen, new Cache());
    action(root!);
    this.__frozen = freeze(root);
  }
}
```
