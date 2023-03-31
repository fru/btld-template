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
    let refrozen = this._update.freeze();
    if (this.listener) this.listener(refrozen);
    this._frozen = refrozen;
    this._update = undefined;
  }
}

const isEdited = (v: unknown) => v instanceof Edited;

function ensureEdited(v: unknown): unknown {
  if (isEdited(v) || v === null || typeof v !== 'object') return v;
  return new Edited(freezeDeep(v) as object);
}

class Edited {
  constructor(public frozen: object) {}
  static empty = () => new Edited(Object.freeze([]));
  data = Array.isArray(this.frozen) ? [...this.frozen] : { ...this.frozen };
  proxy = new Proxy(this.data, {
    setPrototypeOf: () => false,
    get: (o, prop) => (o[prop] = ensureEdited(o[prop])),
    set: (o, prop, value) => ((o[prop] = ensureEdited(value)), true),
  });

  freeze(): object {
    if (!Object.isFrozen(this.data)) {
      for (var p in this.data) {
        if (isEdited(this.data[p])) this.data[p] = this.data[p].freeze();
      }
      if (isShallowEqual(this.frozen, this.data)) return this.frozen;
      Object.freeze(this.data);
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

function freezeDeep(v: unknown, maxDepth = 30): unknown {
  if (maxDepth === 0) return;
  if (isFrozen(v, maxDepth)) return v;
  const c = copyShallow(v);
  if (typeof c !== 'object') return c;
  for (var p in c) c[p] = freezeDeep(c[p], maxDepth - 1);
  return Object.freeze(c);
}

function copyShallow(v: unknown): unknown {
  if (v === null && typeof v !== 'object') return v;
  if (Array.isArray(v)) return v.slice(0);
  if (v instanceof Date) return { date: +v };
  return Object.assign({}, v);
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
