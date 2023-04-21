# Reactivity aka. Model Change Detection

Reactivity is a key differentiator among front-end frameworks. Each framework
has its unique approach to data synchronization and DOM manipulation.

We employ a technique that involves freezing all the data utilized for rendering
components. With the use of proxies, updates can still be made without the need
to copy the entire data structure. Instead, a new frozen state is generated, and
only the modified properties are updated, leading to improved performance. This
is heavily inspired by the amazing [immer.js](https://github.com/immerjs/immer)
library.

## Other Frameworks

Other frameworks have their own approaches. For example, React uses a virtual
DOM and compares two versions to detect changes. Angular 2 re-evaluates
expressions used in components and improves performence with VM inline caching.
Vue 2 uses a reactive system that watches the properties accessed during
rendering using getters and setters provided by Object.defineProperty().

However, when dealing with deeply nested data, these approaches can present
challenges. Redux, a state management library commonly used with React,
addresses this issue by using pure reducers to produce a new state instead of
modifying the current state directly. Vue 3 has enhanced its capabilities from
version 2 by incorporating Proxies. Although, while retrieving data, Proxies are
also employed which can lead to inconsistent equality comparisons.

## Interface

We introduce the `State` class which is used to freeze initial data.

```typescript
let data = new State({ tasks: [] });
data.get('/tasks/length');
data.get().tasks.length;

data.set(d => d.tasks.push('New Task'));
data.set('tasks', d => d.push('New Task'));
data.set('tasks', ['New Task']);

let listener = data.listener(action, index, formaters);
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

In order to refreeze every non froozen object has to be copied But again another
cache is used: in unfrozen -> out unfrozen

After copy freeze all objects in cloneCache

In order to reduce copying whem an object is placed in proxyCache Place the
clone that is proxyied directly in cloneCache[proxy] = underlying;

Even during update "functions" are still froozen The original "functions" are
frozen - they are not copied.

Iterate to freeze: - function: Object.freeze - else is primitve: return
original - is in cloneCache return cloneCache - let clone = cloneShallow(object,
cloneCache) - continue freeze iteration if not allready in hasIterated - return
clone

Iterate cloneCache: Object.freeze + set [[frozen]] until allready [[frozen]]

State.update running = true local: cloneCache, proxyCache //
createWritableProxy(frozen, cloneCache, proxyCache) freeze(cloneCache,
hasIterated: Map) + freezeCache(cloneCache) inline in update? //
copyShallow(cloneCache)

Order of definition

```typescript src
function isObject(value: unknown): value is object {
  return value !== null && typeof value === 'object';
}

function cloneObject(value: object): object {
  if (Array.isArray(value)) return value.slice(0);
  return Object.assign({}, value);
}

const frozen = Symbol('frozen');
```

```typescript test
it('Copy is configurable', () => {
  let frozen = Object.freeze([1234]);
  let cloned = cloneObject(frozen);
  cloned.push(2);
});
```

TODO

```typescript src
function freeze(value: unknown) {
  const stopIterate = new Set<object>();
  const cloneCache = new Map();
  const result = cloneFreeze(value);
  cloneCache.forEach(c => ((c[frozen] = true), Object.freeze(c)));
  return result;

  function iterate(v: object, copy: object) {
    if (stopIterate.has(v)) return copy;
    stopIterate.add(v);
    for (var p in v) copy[p] = cloneFreeze(v[p]);
    return copy;
  }

  function cloneFreeze(v: unknown) {
    if (v && v[frozen]) return v;
    if (v instanceof Date) return v.toISOString();
    if (!isObject(v)) return Object.freeze(v);
    if (!cloneCache.has(v)) cloneCache.set(v, cloneObject(v));
    return iterate(v, cloneCache.get(v));
  }
}
```

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
// All should be froozen
// Listener is called
```
