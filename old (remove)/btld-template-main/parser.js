////////!!!   Parser - Regex: https://regex101.com/r/h4Drju/3
//buildExpressionAST('test/test/1/*/./test')
//buildExpressionAST('round(./test)')

const tokenize = /(?:[\s]+)|([,\(\)])|([a-z_$]+\s*\()|([^\(\)\,\s]+)/ig;
const throwError = (t, error) => { throw (error || 'Unexpected') + ': ' + t };

function buildExpressionAST(e) {
	const tokens = e.match(tokenize).map(x => x.trim()).filter(x => x);
	let pos = 0;
	
	const exp = getExpression(getNextToken());
	if (tokens.length > pos) throwError(getNextToken());
	return exp;

	function getNextToken() {
		return tokens[pos++] || throwError('end');
	}

	function getExpression(t) {
		if (t === '(' || t === ')' || t === ',') throwError(t);
		const last = t.slice(-1), rest = t.slice(0,-1).trim();
		if (last === '(') return { f: rest, p: getParameters([], true) };
		if (!isNaN(parseFloat(t))) return { c: parseFloat(t) };
		return normalizeConstant(t) || normalizePath(t);
	}

	function getParameters(prev, first) {
		let t = getNextToken();
		if (t === ')') return prev;
		if (!first) {
			if (t !== ',') throwError(t);
			t = getNextToken();
		}
		return getParameters([...prev, getExpression(t)]);
	}
	
	function normalizeConstant(raw) {
		if (raw === 'true') return {c: true};
		if (raw === 'false') return {c: false};
		if (raw === 'NaN') return {c: NaN};
		if (raw === 'undefined') return {c: undefined};
		if (raw === 'null') return {c: null};
	}
	
	function normalizePath(raw) {
		let split = raw.split('/');
		if (!split[0]) throwError(raw, 'Path should not start with "/"');
		if (split.find(x => !x)) throwError(raw, 'Double "/" is not allowed');
		if (split.slice(1).find(x => x === '.')) {
			throwError(raw, '"." can only be at start');
		}
	
		return { v: split };	
	}
}
