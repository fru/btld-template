import { Observable } from "./1_reactive";
import { BtldPropType } from "./2_attributes";

type BtldProp = [propName: string, type: BtldPropType, isArray: boolean, attrName: string];
type BtldDefineArgs = [tag: string, extend: string, ExtendClass?: new () => HTMLElement];

const enum f {
    
    // State
    observables,
    attrs,
    attrsObserved,
    defineArgs,
    template,
    content,
    element,

    // Reactive Helper
    prop,
    observe,
    toggleActiv,
    expression,

    // Attribute Helper
    attrGet,
    attrGetName,
    attrGetType,
    attrSet,
    attrStringify,
    attrParse,
    attrGetAndRemovePrefixed,

    // Lifecycle Methods
    deepClone,
    initAttrsIterate,
    initAttrSingle,
    render,
    renderAttributes,
    renderListeners,
    renderText,
    connectObservables,
    attrChange,
    initAttrsToProps
}

type BtldContext = any[] & {
    [f.observables]: Observable[],
    [f.attrs]: {[attrName: string]: BtldProp},
    [f.attrsObserved]: string[],
    [f.defineArgs]: BtldDefineArgs,
    [f.template]: HTMLTemplateElement,
    [f.content]: DocumentFragment,
    [f.element]: any,

    [f.prop]: (that: any, name: string, value?: any) => void,
    [f.observe]: (watch: () => void, onchange?: () => void) => Observable,
    [f.toggleActiv]: (o: Observable, activ: boolean) => void,
    [f.expression]: (this: BtldContext, exp: string, ...args: string[]) => Function,

    [f.attrGet]: (el: Element, name: string) => any,
    [f.attrGetName]: (el: Element) => [camelcase: string, hypened: string],
    [f.attrGetType]: (el: Element) => BtldPropType,
    [f.attrSet]: (el: Element, name: string, stringified: string) => void,
    [f.attrStringify]: (value: unknown, type?: BtldPropType, isArray?: boolean) => string,
    [f.attrParse]: (attr: string|null, type?: BtldPropType, isArray?: boolean) => any,
    [f.attrGetAndRemovePrefixed]: (el: Element, prefix: string, found: (name: string, value: string) => void) => void,

    [f.deepClone]: (this: BtldContext) => BtldContext,
    [f.initAttrsIterate]: (this: BtldContext, el: ParentNode) => void,
    [f.initAttrSingle]: (this: BtldContext, el: HTMLElement) => void,
    [f.render]: (this: BtldContext, node: ParentNode) => void,
    [f.renderAttributes]: (this: BtldContext, element: Element) => void,
    [f.renderListeners]: (this: BtldContext, element: Element) => void,
    [f.renderText]: (this: BtldContext, text: Text, genProp?: string) => () => string,
    [f.connectObservables]: (active: boolean) => (this: {cx: BtldContext}) => void,
    [f.attrChange]: (this: {cx: BtldContext}, attrName: string, oldVal: string, newVal: string) => void,
    [f.initAttrsToProps]: (this: BtldContext) => void
}

export { f, BtldContext, BtldProp };