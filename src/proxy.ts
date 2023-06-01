// Our approach relies on first freezing the data. However, with the help of the following update proxy, the data can still be modified while also marking which
// parts of the data remain unchanged.

// Specifically, the symbol `[[unchanged]]` is used to indicate whether a shallow
// object has been modified through the update proxy using the `set` and
// `deleteProperty` traps. If unchanged, this property points to the frozen object.
// Otherwise, it is set to false to indicate that the object has been modified.

export function createProxy(frozen: object, cache: Cache<object>) {
  return cache.caching(frozen, setCache => {
    const clone = shallowCloneObject(frozen);
    clone[unchanged] = frozen;

    const proxy = new Proxy(clone, {
      setPrototypeOf: () => false, // Disallow prototype

      // Write traps:
      set: function (target: any, p: PropertyKey, value: any) {
        target[unchanged] = false;
        return Reflect.set(target, p, value);
      },
      deleteProperty: function (target: any, p: PropertyKey) {
        target[unchanged] = false;
        return Reflect.deleteProperty(target, p);
      },

      // Read trap:
      get: function (target: any, p: PropertyKey) {
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
