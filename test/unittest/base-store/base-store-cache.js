import { assert } from 'chai';

export function testCache(Cache) {
  let cache;
  beforeEach(() => (cache = new Cache()));

  it('should cache a value', function () {
    const value = 42;
    cache.caching('key', setCache => setCache(value));
    assert.equal(cache.caching('key'), value);
  });

  it('should return undefined for uncached value', function () {
    assert.isUndefined(cache.caching('non-existent-key'));
  });

  it('should only call create once on requests for the same key', function () {
    const value1 = 42;
    const value2 = 'hello';
    cache.caching('key', setCache => setCache(value1));
    assert.equal(cache.caching('key'), value1);
    cache.caching('key', setCache => setCache(value2));
    assert.equal(cache.caching('key'), value1);
  });

  it('should handle cache requests with no creator', function () {
    assert.isUndefined(cache.caching('key'));
  });

  it('should handle cache requests with creator that does not set value', function () {
    cache.caching('key', setCache => {});
    assert.isUndefined(cache.caching('key'));
  });
}
