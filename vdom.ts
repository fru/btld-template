export interface Definition {
    // Parsed: tag attr string paths
}

export class Vdom {
    tag: string;
    dom: HTMLElement;
    domListener: {[event: string]: DomListener[]};

    root: VdomRoot;
    parent: Vdom;
    attrs: {[attr: string]: ContentExp[]} = {};

    // Order of precedence:
    content: ContentExp[] | InnerHTML;
    children: Vdom[] = [];

    detached: {[mixin: string]: boolean}
    detachedIfNotFirst: string;
    mixin: string;
    mixinDisabledDefaultRenderer: string;
    
    state: {[key: string]: unknown};
    stateListener: {[key: string]: StateListener[]};

    api = vdomApi(this);
};

type DomListener = (...args: any[]) => void;
type StateListener = (before: unknown, after: unknown) => void;
type VdomRoot = { vdom: Vdom };
type ContentExp = string | { path: string[], listener: StateListener };
type InnerHTML = string;

function vdomApi(that: Vdom) {
    return {
        get tag() { return that.tag; },
        setTag(tag: string) {
            // maybe dont allow this on root?
            if (tag !== that.tag) {
                that.tag = tag;
                // create new element etc. remove old
                // reapply listeners
                // move children + attach
            }
        },
        addDomListener() {},

        get root() { return that.root.vdom.api; },
        get parent() { return that.parent.api; },
        get children() { return that.children.map(c => c.api); },

        get detached() { return that.detached[that.mixin]; },
        set detached(d) { that.detached[that.mixin] = d; },
        setDetachedIfNotFirst(key: string) {
            that.detachedIfNotFirst = key || '';
            // Check and change dom
        },
        isAnyDetached() {
            // Check detached if not first
            for (let mixin in that.detached) {
                if (that.detached[mixin]) return true;
            }
        },
        

        setState(key: string, value: unknown) {
            // Get previous + Update state
            // Trigger Listeners
            // Propagate down unless it was set down locally
        },
        addStateListener(key: string, listener: StateListener) {
            that.stateListener[key] = that.stateListener[key] || [];
            that.stateListener[key].push(listener);
        },

        setAttribute(name: string, value: ContentExp[]) {
            // detach all old listeners
            that.attrs[name] = value;
            // set atttribute on dom
            // reattach listeners
        },
        
        wrap(from: number, to: number) {
            // return new wrapping vdom api
        },
        move(index: number, to: number) {

        },
        append(nodes?: Definition) {
            // Allows empty append, return singular appended vdom api
        },

        setContent(content: ContentExp[] | InnerHTML) {
            // mainly used by i18n
            // maybe split into two functions: setContent Exp | HTML
            // detach all old listeners
            that.content = content;
            // execute for ContentExp:
            // 1. transformed to: object[]
            // 2. transformed to: HTMLElement[]
            // attach to dom .replaceChildren
            // reattach listeners
        },

        disableDefaultRenderer() {
            that.mixinDisabledDefaultRenderer = that.mixin;
        }
    }
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