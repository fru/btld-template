export interface Definition {
    // Parsed: tag attr string paths
}

export class Vdom {
    tag: string;
    dom: HTMLElement;
    domListener: {[event: string]: DomListener[]};
    
    webComponents: HTMLElement[];
    webComponentsListener: (added: HTMLElement) => void;

    root: VdomRoot;
    parent: Vdom;
    attrs: {[attr: string]: ContentExp[]} = {};

    // Order of precedence:
    children: Vdom[] = [];
    content: ContentExp[] | InnerHTML;

    detached: {[mixin: string]: boolean}
    mixin: string;
    mixinDisabledDefaultRenderer: string;
    
    state: {[key: string]: unknown};
    stateListener: {[key: string]: StateListener[]};

    api = {
        getTag: () => { return this.tag; },
        setTag: (tag: string) => {
            // maybe dont allow this on root?
            if (tag !== this.tag) {
                this.tag = tag;
                // create new element etc. remove old
                // reapply listeners
                // move children + attach
            }
        },
        addDomListener: () => {},

        getRoot: () => { return this.root.vdom.api; },
        getParent: () => { return this.parent.api; },
        getChildren: () => { return this.children.map(c => c.api); },

        isDetachedByMixin: () => { return this.detached[this.mixin]; },
        setDetachedByMixin: (d: boolean) => { this.detached[this.mixin] = d; },
        setDetachedIfNotFirst: (_key: string) => {
            throw 'Not implemented exception - do $else later';
        },
        isDetached: () => {
            // Check detached if not first
            for (let mixin in this.detached) {
                if (this.detached[mixin]) return true;
            }
        },
        

        setState: (key: string, value: unknown) => {
            // Get previous + Update state
            // Trigger Listeners
            // Propagate down unless it was set down locally
        },
        setProperty: (key: string, value: unknown) => {
            this.dom && (this.dom[key] = value);
        },
        addStateListener: (key: string, listener: StateListener) => {
            this.stateListener[key] = this.stateListener[key] || [];
            this.stateListener[key].push(listener);
        },

        setAttribute: (name: string, value: ContentExp[]) => {
            // detach all old listeners
            this.attrs[name] = value;
            // set atttribute on dom
            // reattach listeners
        },
        
        wrap: (from: number, to: number) => {
            // return new wrapping vdom api
        },
        move: (index: number, to: number) => {

        },
        append: (nodes?: Definition) => {
            // Allows empty append, return singular appended vdom api
        },

        setContent: (content: ContentExp[] | InnerHTML) => {
            if (this.children.length) return; // cant override children
            // mainly used by i18n
            // maybe split into two functions: setContent Exp | HTML
            // detach all old listeners
            this.content = content;
            // execute for ContentExp:
            // 1. transformed to: object[]
            // 2. transformed to: HTMLElement[]
            // attach to dom .replaceChildren
            // reattach listeners
        },

        disableDefaultRenderer: () => {
            this.mixinDisabledDefaultRenderer = this.mixin;
        },
        queryFirstDetached: () => {
            // Get the first child that was detached by this mixin 
        }
    };
};

type DomListener = (...args: any[]) => void;
type StateListener = (before: unknown, after: unknown) => void;
type VdomRoot = { vdom: Vdom };
type ContentExp = string | { path: string[], listener: StateListener };
type InnerHTML = string;