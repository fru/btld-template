import { BtldContext, f } from "./3_types";
import { _prop, _observe, _toggleActiv } from "./1_reactive";
import { _getAttribute, _getNameAttribute, _getTypeAttribute, _setAttribute } from "./2_attributes";
import { _stringifyProp, _parseAttribute, _getAndRemovePrefixedProps } from "./2_attributes";
import { _attrChange, _connectObservables, _initAttrSingle, _expression, _initAttrsToProps } from "./4_dom";
import { _initAttrsIterate, _render, _renderAttributes, _renderListeners, _renderText } from "./4_dom";

function _deepClone(this: BtldContext): BtldContext {
    let clone = (x: any) => JSON.parse(JSON.stringify(x));
    let result = <BtldContext>[...this];
    result[f.observables] = [];
    result[f.element] = null;
    result[f.attrs] = clone(this[f.attrs]);
    result[f.attrsObserved] = [...this[f.attrsObserved]];
    result[f.defineArgs] = [...this[f.defineArgs]];
    result[f.content] = this[f.content].cloneNode(true) as DocumentFragment;
    return result;
}

let _buildContext = (template: HTMLTemplateElement, ElementClass: any): BtldContext => {
    let tag = _getAttribute(template, 'tag');

    return <BtldContext> [
        [],
        {},
        [],
        [tag, null, null],
        template,
        template.content.cloneNode(true) as DocumentFragment,
        null,
        
        _prop,
        _observe,
        _toggleActiv,
        _expression,

        _getAttribute,
        _getNameAttribute,
        _getTypeAttribute,
        _setAttribute,
        _stringifyProp,
        _parseAttribute,
        _getAndRemovePrefixedProps,

        _deepClone,
        _initAttrsIterate,
        _initAttrSingle,
        _render,
        _renderAttributes,
        _renderListeners,
        _renderText,
        _connectObservables,
        _attrChange,
        _initAttrsToProps
    ];
};

export { _buildContext };