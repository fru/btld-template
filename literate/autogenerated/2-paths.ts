// AUTOGENERATED
// The original file is literate/2-paths.md

// PLEASE DO NOT EDIT THIS FILE DIRECTLY !


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