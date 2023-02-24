export class Vdom {
    tag: string;
    dom: HTMLElement;
    domListener: {[event: string]: DomListener};

    root: VdomRoot;
    parent: Vdom;
    children: Vdom[] = [];

    detached: {[mixin: string]: boolean};
    mixin: string;
    
    state: {[key: string]: unknown};
    stateListener: {[key: string]: StateListener[]};

    api = vdomApi(this);
    renderer = vdomRenderer(this);
    // attrs, text
};

type DomListener = (...args: any[]) => void;
type StateListener = (before: unknown, after: unknown) => void;
type VdomRoot = { root: Vdom };

function vdomApi(that: Vdom) {
    return {
        get tag() { return that.tag; },
        setTag(tag: string) {
            if (tag !== that.tag) {
                that.tag = tag;
                // create new element etc. remove old
            }
        },
        addDomListener() {},

        get root() { return that.root.root.api; },
        get parent() { return that.parent.api; },
        get children() { return that.children.map(c => c.api); },

        get detached() { return that.detached[that.mixin]; },
        set detached(d) { that.detached[that.mixin] = d; },
        isAnyDetached() {
            for (let mixin in that.detached) {
                if (that.detached[mixin]) return true;
            }
        },

        setState(key: string, value: unknown) {

        },
        addStateListener() {},


        wrap() {
            // 
        },
        move(i: number) {

        },
        append(nodes: HTMLTemplateElement | string) {

        },
    }
}

function vdomRenderer(that) {
    // maybe this want be needed since vdom changes dom directly???
}










/*

type BtldCurrent = { node: BtldVdom, root: BtldVdom, mixin: string };

export function BtldVdom2(current: BtldCurrent) {

	let renderedByMixin: string;
	let children: BtldVdom[];
	let tag: string;
    let synchronizeRender: boolean;
    let dom: HTMLElement;

    // Open questions
    // 1. 

    function runRenderer(func) {
        let builder = { tag, children };
        func(builder);
        tag = builder.tag;
        children = [...builder.children];
        synchronizeRender = true;

        // TODO directly make dom changes
        // Use replaceChildren  to render into dom
    }

	this.render = function (func) {
		if (!renderedByMixin) renderedByMixin = current.mixin;
		if (func && renderedByMixin === current.mixin) runRenderer(func);
	};

	const detachedByMixin: {[mixin: string]: boolean} = {};
    const dataListeners: {order: number, listener: DataListener}[] = [];
	
	this.detach = function (detached: boolean = true) {
		detachedByMixin[current.mixin] = detached;
    }

    let localState: {[key: string]: unknown};

    this.setState = function (key: string, state: unknown) {
        (localState = localState || {})[key] = state;
    };

    this.getDom = function () {
        if (tag) return [dom || (dom = document.createElement(tag))];
        return this.children.flatMap(c => c && c.getDom());
    };

    this.synchronizeDom = function () {
        
        
    };
};
*/