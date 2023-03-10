import { _getUnobserved } from "./1_reactive";
import { f, BtldContext, BtldProp } from "./3_types";

function _initAttrsIterate(this: BtldContext, el: ParentNode): void {
    for(let e of Array.from(el.children)) {
        if (e.tagName === 'BTLD-ATTR') {
            this[f.initAttrSingle](e as HTMLElement);
        }
        this[f.initAttrsIterate](e as HTMLElement);
    }
}

function _initAttrSingle(this: BtldContext, el: HTMLElement): void {
    let cx = this;
    let [propName, attrName] = cx[f.attrGetName](el);
    let type = cx[f.attrGetType](el);
    let isArray = cx[f.attrGet](el, 'array') !== null;
    let attr: BtldProp = [propName, type, isArray, attrName];
    if (cx[f.attrGet](el, 'initonly') === null) {
        cx[f.attrsObserved].push(attrName)
    }
    cx[f.attrs][attrName] = attr;
}

function _initAttrsToProps(this: BtldContext): void {
    let cx = this;
    for (let [propName, type, isArray, attrName] of Object.values(cx[f.attrs])) {
        let value = cx[f.attrGet](cx[f.element], attrName);
        cx[f.prop](cx[f.element], propName, cx[f.attrParse](value, type, isArray))
    }
}

function _expression(this: BtldContext, exp: string, ...args: string[]): Function {
    let body = 'with(this[0]){return eval(this[1])}';
    let that = [this[f.element], exp];
    return Function(...args, body).bind(that);
};

function _render(this: BtldContext, el: ParentNode): void {
    let cx = this;
    el.childNodes.forEach(node => {
        let nodeType = node.nodeType;

        // Node.ELEMENT_NODE
        if (nodeType === 1) {
            cx[f.renderAttributes](node as Element);
            cx[f.renderListeners](node as Element);
            cx[f.render](node as Element)

        // Node.TEXT_NODE
        } else if (nodeType === 3) {
            let text = cx[f.renderText](node as Text);
            if (text) {
                let obs = cx[f.observe](() => node.textContent = text());
                cx[f.observables].push(obs);
            }
        }
    });
}

function _renderAttributes(this: BtldContext, el: Element): void {
    let cx = this;
    let prefixedProps = cx[f.attrGetAndRemovePrefixed];
    let observe = cx[f.observe];
    let attrSet = cx[f.attrSet]
    let stringify = cx[f.attrStringify];

    prefixedProps(el, '$', (name, value) => {
        let exp = cx[f.expression](value);
        let obs = observe(() => {
            let value = stringify(exp());
            attrSet(el, name, value);
        });
        cx[f.observables].push(obs);
    });
}

function _renderListeners(this: BtldContext, el: Element): void {
    let cx = this;
    let prefixedProps = cx[f.attrGetAndRemovePrefixed];

    prefixedProps(el, '@', (name, value) => {
        let exp = cx[f.expression](value, 'event');
        el.addEventListener(name, (ev) => exp(ev));
    });
}

function _renderText(this: BtldContext, text: Text, genProp = '_btld'): () => string {
    let result = text.nodeValue;

    if (!text[genProp]) {
        let split = result?.split(/\${(.*?)}/g);
        if (split && split.length > 1) {
            let parts = split.map((text, index) => 
                index % 2 === 0 
                ? () => text
                : this[f.expression](text));

            text[genProp] = true;
            return () => parts.map(t => t()).filter(t => t).join('');
        }
    }
}

let _connectObservables = (active: boolean) => function (this: {cx: BtldContext}): void {
    for(let o of this.cx[f.observables]) {
        this.cx[f.toggleActiv](o, active);
    }
};

function _attrChange(this: {cx: BtldContext}, attrName: string, _oldVal: string, newVal: string): void {
    let cx = this.cx;
    let attrs = cx[f.attrs];
    let stringify = cx[f.attrStringify];
    let parse = cx[f.attrParse];
    
    let [propName, type, isArray] = attrs[attrName] || [];

    if (propName) {
        let current = stringify(_getUnobserved(this, propName), type, isArray);
        if (newVal !== current) {
            this[propName] = parse(newVal, type, isArray);
        }
    }
}

export {
    _initAttrsIterate,
    _initAttrSingle,
    _expression,
    _render,
    _renderAttributes,
    _renderListeners,
    _renderText,
    _connectObservables,
    _attrChange,
    _initAttrsToProps
}