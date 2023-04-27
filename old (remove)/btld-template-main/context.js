/*//////!!!   BtldContext

let p1 = 'test'.split('/')
let p2 = 'test/a'.split('/')
let p3 = 'test/a/*'.split('/')
let p4 = 'test/a'.split('/')
let p5 = 'test/a/*/1/*'.split('/')
let p6 = './1/*'.split('/')
		
ctx = buildContext();
ctx.set(['a', 'b', 'c'], 123)
ctx.listen(['a', 'b'], [x => console.log(x, '!!!!!!'), 1])
ctx.listen(['a', '*'], [x => console.log(x, '??????'), 1])
ctx.set(['a', 'b'], 123)
JSON.stringify(ctx.get())

ctx.set(['a', 'b2'], 123)
JSON.stringify(ctx.get())

ctx.set(['a'], 123)
JSON.stringify(ctx.get())
*/

function buildContext() {

	let frozenData = {};
	const changeListerners = {};
	
	function clone(v) {
		if (Array.isArray(v)) return v.slice(0);
		if (v instanceof Object) return Object.assign({}, v);
	}
	
	function deepFreeze(v) {
		const c = clone(v);
		if (!c) return v;
		for (var p in c) c[p] = deepFreeze(c[p]);
		return Object.freeze(c);
	}
	
	const array = Symbol();
	function listen(path, listener /*[()=>do(), 123]*/) {
		let cursor = changeListerners;
		for (let p of path) {
			cursor = !cursor[p] ? cursor[p] = {} : cursor[p];
		}
		(cursor[array] = cursor[array] || []).push(listener);
	}
	
	function get(path) {
		let cursor = frozenData;
		if (path) for (let p of path) {
			if (!cursor || !cursor.hasOwnProperty(p)) return undefined;
			cursor = cursor[p];
		}
		return cursor;
	}
	
	function collectListeners(path, _changeListeners, foundListeners) {
		(_changeListeners[array] || []).map(l => foundListeners.add(l));
		if (!path.length) {
			for (let l in _changeListeners) {
				collectListeners(path, _changeListeners[l] || {}, foundListeners);
			}
		} else {
			let [first, ...rest] = path;
			collectListeners(rest, _changeListeners[first] || {}, foundListeners);
			collectListeners(rest, _changeListeners['*'] || {}, foundListeners);
		}
	}
	
	function replace(path, value, _frozenData) {
		if (!path.length) return deepFreeze(value);
		let [first, ...rest] = path;
		let c = clone(_frozenData);
		c[first] = replace(rest, value, _frozenData[first] || {});
		return Object.freeze(c);
	}
	
	function set(path, value) {
		let listeners = new Set();
		collectListeners(path, changeListerners, listeners);
		frozenData = replace(path, value, frozenData);
		let callOrder = Array.from(listeners).sort((a,b) => a[1] - b[1]);
		callOrder.forEach(c => c[0]());
	}
	
	return  { listen, get, set };
}
