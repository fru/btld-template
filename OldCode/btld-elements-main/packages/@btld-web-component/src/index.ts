'use strict';
import { f, BtldContext } from "./context/3_types";
import { _buildContext } from "./context/5_context";

let plugins = (globalField = 'btld-plugins') => window[globalField] = window[globalField] || [[]]; 

let runPlugins = (cx: BtldContext) => {
    for(let plugin of plugins()[0]) plugin(cx);
};

class BtldComp extends HTMLTemplateElement {
    constructor() {
        super();
        defineFromTemplate(this);
    }
}

let define = (tag: string, C: any, extend?: string) => {
    customElements.define(tag, C, extend ? {extends: extend} : {});
};

let defineFromTemplate = (template: HTMLTemplateElement) => {
    let cx: BtldContext;
    let ExtendClass: new () => HTMLElement;

    function C() {
        let result = Reflect.construct(ExtendClass, [], new.target);
        let clone = cx[f.deepClone]();
        result.cx = clone;
        clone[f.element] = result;
        clone[f.initAttrsToProps]();
        clone[f.render](clone[f.content]);
        clone[f.renderAttributes](result);
        clone[f.renderListeners](result);
        result.replaceChildren(clone[f.content]);
        return result;
    }
    cx = _buildContext(template, C);
    runPlugins(cx);
    cx[f.initAttrsIterate](cx[f.content]);
    let defineArgs = cx[f.defineArgs];
    ExtendClass = defineArgs[2] || HTMLElement;

    C.__proto__ = ExtendClass;
    C.prototype.__proto__ = ExtendClass.prototype;
    C.prototype.attributeChangedCallback = cx[f.attrChange];
    C.prototype.connectedCallback = cx[f.connectObservables](true);
    C.prototype.disconnectedCallback = cx[f.connectObservables](false);
    C.observedAttributes = cx[f.attrsObserved];
    define(defineArgs[0], C, defineArgs[1]);
};

let init = (tag = 'btld-comp') => define(tag, BtldComp, 'template');

export { init, BtldComp, plugins };