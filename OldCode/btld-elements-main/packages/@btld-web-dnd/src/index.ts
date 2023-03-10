'use strict';

interface bounds {
    0: number, // x0
    1: number, // y0
    2: number, // x1
    3: number, // y1
    4: number, // Depth
    5: number, // Count
};

type node<T> = bounds & [
    x0: number, y0: number,
    x1: number, y1: number,
    depth: number,
    count: number,
    value: T,
    parent: node<T>,
    children: node<T>[],
];

function combine(args: bounds[]): bounds {
    if (args.length <= 1) return args[0];
    let [a, ...rest] = args;
    let result = <bounds>[a[0], a[1], a[2], a[3], a[4]+1, a[5]];
    for (let r of rest) {
        result[0] = Math.min(result[0], r[0]);
        result[1] = Math.min(result[1], r[1]);
        result[2] = Math.max(result[2], r[2]);
        result[3] = Math.max(result[3], r[3]);
        result[4] = Math.max(result[4], r[4]+1);
        result[5] += r[5]; 
    }
    return result;
}

function updateMBR(node: node<unknown>): void {
    let b = combine(node[8]);
    node[0] = b[0];
    node[1] = b[1];
    node[2] = b[2];
    node[3] = b[3];
    node[4] = b[4];
    node[5] = b[5];
    if (node[7]) updateMBR(node[7]);
}

function insert<T>(wrapper: node<T>, nodes: node<T>[], replace = false) {
    wrapper[8] = replace ? nodes : [...wrapper[8], ...nodes];
    for (let node of nodes) node[7] = wrapper;
    updateMBR(wrapper);
    return wrapper;
}

function wrap<T>(nodes: node<T>[]): node<T> {
    let empty = <node<T>>[0,0,0,0,0,0,null,null,[]];
    return nodes.length ? insert<T>(empty, nodes) : empty;
}

function leaf<T>(b: bounds, value: T): node<T> {
    return [b[0], b[1], b[2], b[3], 0, 1, value, null, null];
}

// Split Direction

function center(splitHorizontal: boolean, box: bounds): number {
    let offset = splitHorizontal ? 1 : 0;
    return box[offset] + (box[offset + 2] - box[offset]) / 2;
}

// (x=0,y=0) => c[0]    (x=1,y=0) => c[1]
// (x=0,y=1) => c[2]    (x=1,y=1) => c[3] 
function corner(parent: bounds, child: bounds) {
    let h = center(false, parent) < center(false, child);
    let v = center(true, parent) < center(true, child);
    return (h ? 1 : 0) + (v ? 2 : 0);
}

function isSplitHorizontal(node: node<unknown>) {
    let c = [0, 0, 0, 0];
    for(let child of node[8]) {
        c[corner(node, child)]++;
    }
    return (c[0] > c[3]) === (c[2] > c[1]);
}

// Split & Rebuild

type sorted<T> = [horizontal: boolean, nodes: node<T>[]];

function sort<T>(node: node<T>): sorted<T> {
    let h = isSplitHorizontal(node);
    let children = [...node[8]];
    children.sort((a, b) => center(h, a) - center(h, b));
    return [h, children];
}

function split<T>(elements: sorted<T>[], times = 1, min = 2): sorted<T>[] {
    let result = [];
    for (let element of elements) {
        let [h, children] = element;
        if (children.length < 2 * min) result.push(element);
        else {
            let boxCenter = center(h, combine(children));
            let a1 = children.slice(0, min);
            let a2 = [];
            for (var i = min; i < children.length - min; i++) {
                let lower = center(h, children[i]) < boxCenter;
                (lower ? a1 : a2).push(children[i]);
            }
            a2.push(...children.slice(-min));
            result.push([h, a1], [h,a2]);
        }
    }
    return times <= 1 ? result : split<T>(result, times - 1, min);
}

function isWrapper(node: node<unknown>): boolean {
    return node[8]?.length > 0;
}

function flat<T>(node: node<T>, result: node<T>[] = []): node<T>[] {
    if (isWrapper(node)) {
        for(let c of node[8]) flat<T>(c, result);
    } else {
        result.push(node);
    }
    return result;
}

function setChildren<T>(root: node<T>, splitted: sorted<T>[]) {
    insert(root, splitted.map(c => wrap(c[1])), true);
}

function build<T>(root: node<T>) {
    let sorted = sort(root);
    let splitted = split([sorted], 2);
    if (splitted.length > 1) {
        setChildren<T>(root, splitted);
        for (let c of root[8]) build(c);
    }
}

function rebuild<T>(root: node<T>) {
    let leafs = wrap(flat<T>(root));
    build(leafs);
    insert(root, leafs[8], true);
}

// Add

const MAX_SIZE = 9;

type target<T> = [sizeIncrease: number, node: node<T>];

function size(box: bounds): number {
    if (!box) return 0;
    return (box[2] - box[0]) * (box[3] - box[1]);
}

function sizeIncrease(parent: bounds, insert: bounds) {
    return size(combine([parent, insert])) - size(parent);
}

function improved<T>(prev: target<T>, next: target<T>) {
    if (!prev) return next;
    if (prev[0] > next[0]) return next;
    // Least total size
    return size(prev[1]) > size(next[1]) ? next : prev;
}

function insertion<T>(node: node<T>, insert: node<T>, prev: target<T>) {
    let increase = sizeIncrease(node, insert);
    if (increase > prev?.[0]) return prev;

    let next = improved(prev, [increase, node]);

    for(let child of node[8].filter(c => isWrapper(c))) {
        next = insertion<T>(child, insert, next);
    }
    return next;
}

function balance<T>(node: node<T>) {
    let depth = node[4];
    let count = node[5];
    if (count > 25 && (depth >= count / 6 || depth >= 150)) {
        rebuild(node);
    }
}

// Rect to bounds

type DomRect = {x: number, y: number, width: number, height: number};

function toBounds(rect: DomRect): bounds {
    return [
        rect.x,
        rect.y,
        rect.x + rect.width,
        rect.y + rect.height,
        0,
        1
    ];
}

function get<T>(box: bounds, node: node<T>, result: node<T>[] = []): node<T>[] {
    if (sizeIncrease(node, box) === 0) {
        if (!isWrapper(node)) {
            result.push(node);
        } else {
            for(let child of node[8]) get<T>(box, child, result);
        }
    }
    return result;
}

interface removable { remove: () => void }

function createRemovable<T>(node: node<T>): removable {
    return { remove() {
        let index = node[7]?.[8]?.indexOf(node);
        if (index >= 0) {
            node[7][8].splice(index);
            updateMBR(node[7]);
            node[7] = null;
        }
    }};
}

class RTree<T> {
    public _tree: node<T> = wrap([]);
    private buffer: node<T>[] = [];

    // Balancing strategy:
    // Initially and if more than 50 elements are added without a get, any elements
    // are being added to the buffer.
    // On the next get the buffer is added to the root and the tree is rebuild
    // On normal insert we balance.

    private beforeFirstGet = true;
    private insertionsSinceLastGet = 0;

    public add(rect: DomRect, value: T): removable {
        let added = leaf(toBounds(rect), value);
        this.insertionsSinceLastGet++;

        if (this.beforeFirstGet || this.insertionsSinceLastGet > 5000) {
            this.buffer.push(added);
        } else {
            let place = insertion<T>(this._tree, added, null);
            insert(place[1], [added]);

            if (place[1][8].length >= MAX_SIZE) {
                let sorted = sort(place[1]);
                let splitted = split([sorted], 1);
                setChildren<T>(place[1], splitted);
            }
            balance(this._tree);
        }
        return createRemovable(added);
    }

    public get([x,y]: [x: number, y: number]): T[] {
        if (this.buffer.length) {
            insert(this._tree, this.buffer);
            this.buffer = [];
            rebuild(this._tree);
        }
        this.beforeFirstGet = false;
        this.insertionsSinceLastGet = 0;
        return get([x,y,x,y,0,1], this._tree).map(n => n[6]);
    }

    public clear() {
        this.beforeFirstGet = true;
        this.insertionsSinceLastGet = 0;
        this.buffer = [];
        this._tree = wrap([]);
    }
}

export {
    combine, size, center, corner, isSplitHorizontal, isWrapper,
    sizeIncrease, insertion, split, toBounds, RTree, bounds, node
};