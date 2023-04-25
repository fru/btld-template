// AUTOGENERATED
// The original file is literate/0-state.md

// PLEASE DO NOT EDIT THIS FILE DIRECTLY !


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

export abstract class SimpleState {
  __frozen = freeze({});
  rootFrozen = () => this.__frozen;

  rootUpdate(action: (data: object) => void): void {
    const root = createProxyCached(this.__frozen, new Map());
    action(root);
    this.__frozen = freeze(root);
    this.onChange();
  }
  abstract onChange(): void;
}

export const isArrayProp = (prop: any) => +prop >= 0;

export function getExpectedObject(val: unknown, isArray: boolean) {
  if (val === null || val === undefined) return isArray ? [] : {};
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
  return () => undefined;
}

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
  onChange() {}
}