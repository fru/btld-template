import { assert } from 'chai';

export function testProxy(createProxy, Cache, unchanged) {
  let frozen, cache, proxy;

  beforeEach(function () {
    frozen = Object.freeze({ foo: 42, bar: { baz: 'hello' } });
    cache = new Cache();
    proxy = createProxy(frozen, cache);
  });

  it('should return a proxy object', function () {
    assert.isTrue(
      typeof proxy === 'object' && proxy !== null && !Array.isArray(proxy)
    );
  });

  it('should disallow setting prototype', function () {
    assert.throws(() => Object.setPrototypeOf(proxy, {}), TypeError);
  });

  it('should mark unchanged property', function () {
    assert.strictEqual(proxy[unchanged], frozen);
  });

  it('should allow setting property', function () {
    proxy.foo = 100;
    assert.strictEqual(proxy.foo, 100);
    assert.isFalse(proxy[unchanged]);
  });

  it('should allow deleting property', function () {
    delete proxy.foo;
    assert.isUndefined(proxy.foo);
    assert.isFalse(proxy[unchanged]);
  });

  it('should return frozen function', function () {
    const func = Object.freeze(function () {});
    proxy.func = func;
    assert.strictEqual(proxy.func, func);
    assert.isTrue(Object.isFrozen(proxy.func));
    assert.isFalse(proxy[unchanged]);
  });

  it('should create nested proxy', function () {
    proxy.bar.baz = 'world';
    assert.strictEqual(proxy.bar.baz, 'world');
    assert.isFalse(proxy.bar[unchanged]);
    assert.isObject(proxy[unchanged]);
  });

  it('Once changed it should return the new object; even frozen', function () {
    proxy.bar.baz = [1, 2, 3];
    assert.equal(proxy.bar.baz.length, 3);
    assert.isFalse(proxy.bar[unchanged]);
    Object.freeze(proxy.bar.baz);
    assert.isTrue(Object.isFrozen(proxy.bar.baz));
  });
}
