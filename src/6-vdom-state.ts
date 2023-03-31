export class State {
  private _frozen: object;
  private _update: Edited | undefined;

  listener?: (update: object) => void;

  constructor(data: object) {
    this._frozen = freezeDeep(data) as object;
  }

  get data() {
    return this._frozen;
  }

  update(action: (data: object) => void) {
    if (this._update) return;
    this._update = new Edited(this._frozen);
    action(this._update.proxy);
    let refrozen = this._update.freeze(new Map());
    if (this.listener) this.listener(refrozen);
    this._frozen = refrozen;
    this._update = undefined;
  }
}

// Why Edited? Why not just full unfreeze and refreeze?
// Performance => Edited marks retrieved & unfrozen parts of frozen tree

const symbolEdited = Symbol('edited');

const ensureEdited = (e: Edited) => (o: object, p: string | symbol) => {
  if (p === symbolEdited) return e;
  if (o[p] === null || typeof o[p] !== 'object' || !Object.isFrozen(o[p])) {
    return o[p];
  }
  return (o[p] = new Edited(o[p]).proxy);
};

class Edited {
  constructor(public frozen: object) {}

  data = copyShallow(this.frozen);
  proxy = new Proxy(this.data, {
    setPrototypeOf: () => false,
    get: ensureEdited(this),
    set: (o, prop, value) => ((o[prop] = value), true),
  });

  freeze(cache: Map<any, any>): object {
    let o = this.data;
    if (!Object.isFrozen(o)) {
      for (var p in o) {
        if (o[p] !== null && typeof o[p] === 'object' && !o[p][symbolEdited]) {
          o[p] = freezeDeep(o[p], cache);
        }
      }

      // TODO Before we even freeze -> Calc and Set hasChanged in edited tree !!!!
      // TODO freezeDeep can find frozen and unfrozen Edited.proxy objects

      // Are there any changes in the Edited subtree?: hasChangesDeep
      // We should probably not compare but use a flag
      if (isEqual(this.frozen, o)) return (this.data = this.frozen);

      Object.freeze(this.data); // Doing this early stops recursion;

      for (var p in o) {
        o[p] && (o[p][symbolEdited] as Edited).freeze(cache);
      }
    }
    return this.data;
  }
}

function isFrozen(v: unknown, maxDepth: number): boolean {
  if (!Object.isFrozen(v)) return false;
  if (typeof v !== 'object') return true;
  for (var p in v) if (!isFrozen(v[p], maxDepth - 1)) return false;
  return true;
}

function freezeDeep(v: any, map?: Map<any, any>, maxDepth = 30): any {
  if (maxDepth === 0) return;
  if (isFrozen(v, maxDepth)) return v;
  const c = copyShallow(v, map);
  if (typeof c !== 'object') return c;
  for (var p in c) c[p] = freezeDeep(c[p], map, maxDepth - 1);
  return Object.freeze(c);
}

function copyShallow(v: any, map?: Map<any, any>): any {
  let cached = (c: any) => (!map ? c : map.has(v) ? map[v] : (map[v] = c));
  if (v === null && typeof v !== 'object') return v;
  if (Array.isArray(v)) return cached(v.slice(0));
  if (v instanceof Date) return cached({ date: +v });
  return cached(Object.assign({}, v));
}

function isShallowEqual(a: any, b: any) {
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    return a.every((v, i) => v === b[i]);
  } else {
    if (Object.keys(a).length !== Object.keys(b).length) return false;
    return Object.keys(a).every(key => {
      return b.hasOwnProperty(key) && a[key] === b[key];
    });
  }
}
