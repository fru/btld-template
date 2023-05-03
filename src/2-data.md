# Data

This layer improves the practical usability of the minimal base store defined
earlier. One way we accomplish this is by introducing "computables," which can
be defined at the root of the store. They can then be accessed just like any
other property. Computables produce results that are cached as long as the
underlying data remains unchanged, and the results are also frozen to ensure
consistency.

Another improvement over the base store is the ability to access data through
simple path expressions, which can be used for both getting and setting data.
These path expressions are also utilized in the HTML template for binding
values, and they provide inline caching to improve access performance compared
to naive programmatic access.

## Computable

This layer manages computables using the `computable(state, comp)` function.
When this function is called with a state, it returns a new state that includes
additional computables. This enables multiple inheriting state objects with
different computables to be created for each base state.

Later in the framework, the `computable` function is also used to set the
current index during a loop. This allows each web component to have a single
base store, but still access a different item. As a result, this layer
significantly simplifies the management of state within a web component.

```typescript
type ComputableFunc = (state: State) => unknown;
type Computables = { [prop: string]: ComputableFunc };

function computable(state: State, comp: Computables): State {
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

## Paths

```typescript
type Segment = { p?: string; ref?: number };
type Path = { refs: string[]; path: Segment[] };

// TODO cache
function parsePath(input: string): Path {
  let refs = [];
  let path = input.split('/').map(function (p) {
    if (!p.startsWith(':')) return { p };
    refs.push(p.substring(1));
    return { ref: refs.length - 1 };
  });
  return { refs, path };
}

function retrieveRoots({ refs, path }: Path, state: State) {
  // TODO retrieve refs and check
  // TOOD retrieve parent
  return { parent, key, roots };
}

function compare(arr1: any[], arr2: any[]): boolean | undefined {
  if (arr1 && arr2 && arr1.length === arr2.length) {
    return arr1.every((_, i) => arr1[i] === arr2[i]);
  }
}

// PROBLEM Path 'test' -> frozen: {state.root('test')
// Proxy: {parent: proxy, key: 'test', value: proxy.test

function accessor(path: string, initialize: boolean, cached: boolean) {
  let parsed = parsePath(path);
  let cachedRoots = [];
  let cachedResult = undefined;

  return (state: State) => {
    let { value, key, roots } = retrieveRoots(parsed, state);
    if (cached && compare(cachedRoots, roots)) return cachedResult;
    cachedRoots = roots;

    let value;
    for (let { ref, p } of parsed.path) {
    }

    return (cachedResult = { parent, key, value });
  };
  // Retrieve Roots  => array of objects
  // Compare to last array and return cached
  //

  let path = path.map(x => (x.ref ? retrieveRef(x) : x));
  let parent, key, value;

  return { parent, key, value };
}
```

### Parsing

### Accessor

## Data

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
