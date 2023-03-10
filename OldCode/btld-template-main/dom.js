function getHTMLElement(tag) /*: new () => HTMLElement*/ {
	if (!tag) return HTMLElement;
	const upper = tag.charAt(0).toUpperCase() + tag.slice(1);
	const possible = window['HTML' + upper + 'Element'];
	if (possible && possible.DOCUMENT_NODE) return possible;
	return document.createElement(tag).constructor;
}

function define(tag, extend, prototype) {
	const ExtendClass = getHTMLElement(extend) ;
	const BtldWrapper = function() {
		let result = Reflect.construct(ExtendClass, [], new.target);
		if (result.init) result.init();
		return result;
	}
	Object.assign(BtldWrapper.prototype, prototype);
	Object.setPrototypeOf(BtldWrapper.prototype, ExtendClass.prototype);
	customElements.define(tag, BtldWrapper, extend ? {extends: extend} : {});
}


// Custom elements without class