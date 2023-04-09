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

TODO

```typescript src
function freeze(value: unknown, cloneCache = new Map()) {
  const stopIterate = new Set<object>();
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
  const cloneCache = new Map();
  const proxyCache = new Map();
  const updateRoot = createUpdateProxy(this._frozen);

  action(updateRoot);
  let refrozen = freeze(updateRoot, cloneCache);
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
      cloneCache.set(proxy, clone);
      proxyCache.set(frozen, proxy);
    }
    return proxyCache.get(frozen);
  }

  function getIterator(value: any, frozen: any) {
    if (value !== frozen || !isObject(frozen)) return value;
    return createUpdateProxy(frozen);
  }
};
```

```typescript test
it('Updates should be possible', () => {
  // TODO
});

it('Array operations should work the same', () => {
  // TODO
});

it('All should be froozen', () => {
  // TODO
});

it('Listener is called', () => {
  // TODO
});
```
