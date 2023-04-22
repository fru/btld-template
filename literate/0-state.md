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
function isObject(value: unknown): value is object {
  return value !== null && typeof value === 'object';
}

function shallowCloneObject(value: object): object {
  if (Array.isArray(value)) return value.slice(0);
  return Object.assign({}, value);
}

type ObjectCache = Map<object, object>;

function createProxyCached(frozen: object, proxies: ObjectCache) {
  if (!proxies.has(frozen)) {
    proxies.set(frozen, createProxy(frozen, proxies));
  }
  return proxies.get(frozen);
}
```

Another symbol `[[unchanged]]` is used to mark if a shallow object has been
modified trough the update proxy using the traps `set` and `deleteProperty`

```typescript
const unchanged = Symbol('unchanged');

function createProxy(frozen: object, proxies: ObjectCache) {
  let clone = shallowCloneObject(frozen);
  clone[unchanged] = frozen;

  return new Proxy(clone, {
    setPrototypeOf: () => false, // Disallow prototype

    // Write traps:
    set: function (target) {
      target[unchanged] = false;
      return Reflect.set(...arguments);
    },
    deleteProperty: function (target) {
      target[unchanged] = false;
      return Reflect.deleteProperty(...arguments);
    },

    // Read trap:
    get: function (target, p) {
      if (p === unchanged) return target[prop];
      if (target[p] !== frozen[p]) return target[prop];
      // Functions are still returned frozen
      if (!isObject(target[p])) return target[prop];
      return createProxyCached(frozen[prop], proxies);
    },
  });
}
```

We set the unchanged marker on set and delete only on the direct parent. In
order to refreeze the changes we need to normalize the unchanged marker. This
means that every parent of an object with [unchanged] === false is also set to
false.

```typescript
function normalizeUnchangedMarker(root: object) {
  const changedDirectly = new Set();
  const stopIterating = new Set();
  // One object can have many parents
  const childToParents = new Map<object, object[]>();

  (function fillMappings(val: unknown) {
    if (val && !val[unchanged]) changedDirectly.add(val);
    stopIterating.add(val);

    for (var p in val) {
      let child = val[p];
      if (!isUnfrozenObject(child)) continue;
      // Fill parent map
      if (!childToParents.has(child)) childToParents.set(child, []);
      childToParents.get(child).push(val);
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
const frozen = Symbol('frozen');

function isUnfrozenObject(val: unknown) {
  return isObject(val) && !val[frozen];
}

function freeze(root: object) {
  normalizeUnchangedMarker(root);
  const cloneCache = new Map();
  const result = cloneChanged(root, cloneCache);

  cloneCache.forEach(obj => {
    obj[frozen] = true;
    Object.freeze(obj);
  });
  return result;
}

function cloneChanged(val: unknown, cloneCache: ObjectCache) {
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

Now the first simple interface

```typescript
export class SimpleState {
  constructor(private _frozen: object) {
    this._frozen = freeze(_frozen);
  }
  get = () => this._frozen;

  update(action: (data: object) => void): void {
    const updateRoot = createProxyCached(data);
    action(updateRoot);
    let refrozen = freeze(updateRoot);
    if (this.listener) this.listener(refrozen);
    this._frozen = refrozen;
  }

  listener?: (update: object) => void;
}
```

// TODO check if there are changes or if we can use the old frozen object again:

1. We need the old frozen object

- We need the key count of the old object
- Alternatively we need a flag that indicates that there are no changes

Now the actual implementation has to make sure that recursive data does not lead
to an infinite loop. Every object that is encountered is added to `stopIterate`.

## Interface

We introduce the `State` class which is used to freeze initial data.

```typescript
let data = new State({ tasks: [] });
data.get('/tasks/length');
data.get().tasks.length;

data.set(d => d.tasks.push('New Task'));
data.set('tasks', d => d.push('New Task'));
data.set('tasks', ['New Task']);

let listener = data.listener(action, index, formatters);
listener.watch('/tasks');
listener.watch('/tasks/:index');
```

Layers:

1. Freeze & Update + Single Callback
2. Parse paths & caching
3. Compile path lookup for performance
4. Call functions when a path directly points to it
5. Get and set with paths and listen to gets

### Old

Deep freeze uses symbols to mark a subtree as deepFrozen Get returns proxy
(without [[frozen]])

state.a.b.c = state.a set [[frozen]] = false -> a,b (because get) set [[actual]]
= clone that is wrapped by proxy

Order 1 state.a.b.d = {t1: {t2: 3}}; state.a.b.d.t1 = state.z;

Order 2 (same as Order 1) state.a.b.d = {t1: state.z};

...t1 is not proxy - only ever proxy frozen objects state.z called multiple
times returns the same proxy Now setting state.z.i1 will update the proxy target
and therefore t1

state.test is still [[frozen]] - freeze() returns original

There is one cache of all proxies (proxyCache) if state.a === state.b when
updates they also produce the same proxy

NOW REFREEZING:

In order to refreeze every non frozen object has to be copied But again another
cache is used: in unfrozen -> out unfrozen

After copy freeze all objects in cloneCache

In order to reduce copying when an object is placed in proxyCache Place the
clone that is proxies directly in cloneCache[proxy] = underlying;

Even during update "functions" are still frozen The original "functions" are
frozen - they are not copied.

Iterate to freeze: - function: Object.freeze - else is primitive: return
original - is in cloneCache return cloneCache - let clone = cloneShallow(object,
cloneCache) - continue freeze iteration if not already in hasIterated - return
clone

Iterate cloneCache: Object.freeze + set [[frozen]] until already [[frozen]]

State.update running = true local: cloneCache, proxyCache //
createWritableProxy(frozen, cloneCache, proxyCache) freeze(cloneCache,
hasIterated: Map) + freezeCache(cloneCache) inline in update? //
copyShallow(cloneCache)

Order of definition

```typescript test
it('Copy is configurable', () => {
  let frozen = Object.freeze([1234]);
  let cloned = cloneObject(frozen);
  cloned.push(2);
});
```

TODO

```typescript test
let f = function () {};
let d = { d2: { d3: [1, 2, 3, 4, 5] } };
let data = { abc: 123, f, d, data: new Date() };
let o = {};
o.recurse = o;

it('Should freeze objects', () => {
  let lock = freeze(data);
  let wrapped = freeze({ lock });
  assert(Object.isFrozen(lock));
  assert(Object.isFrozen(lock.f));
  assert(Object.isFrozen(lock.d.d2.d3));
  assert.equal(JSON.stringify(data), JSON.stringify(lock));
  assert.equal(lock, wrapped.lock);
  let circular = freeze(o);
  assert.equal(circular, circular.recurse);
});
```

TODO

```typescript src
export class State {
  listener?: (update: object) => void;
  constructor(private _frozen: object) {
    this._frozen = freeze(_frozen);
  }
  get = () => this._frozen;
}

export interface State {
  update(this: State, action: (data: object) => void): void;
}
```

```typescript src
State.prototype.update = function (action) {
  const proxyCache = new Map();
  const updateRoot = createUpdateProxy(this._frozen);

  action(updateRoot);
  let refrozen = freeze(updateRoot);
  if (this.listener) this.listener(refrozen);
  this._frozen = refrozen;

  function createUpdateProxy(frozen: object): object {
    if (!proxyCache.has(frozen)) {
      let clone = cloneObject(frozen);
      let proxy = new Proxy(clone, {
        setPrototypeOf: () => false,
        get: (o, prop) => getIterator(o[prop], frozen[prop]),
        set: (o, prop, value) => ((o[prop] = value), true),
      });
      proxyCache.set(frozen, proxy);
    }
    let res = proxyCache.get(frozen);
    return res;
  }

  function getIterator(value: any, frozen: any) {
    if (value !== frozen || !isObject(frozen)) return value;
    return createUpdateProxy(frozen);
  }
};
```

```typescript test
it('Updates should be possible', () => {
  let state = new State({ d: ['123'] });
  state.update(u => {
    u.d.push('test');
  });
  console.log(JSON.stringify(state.get()));

  // Object
  // State
  // Mapping
  // update
  // modified
  // Compare JSON modified === state
  // update to recursive
  // state.get === state.get.recursion
});

// Array operations should work the same
// All should be frozen
// Listener is called
```
