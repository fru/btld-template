import {
    combine, size, center, corner, isSplitHorizontal, isWrapper,
    sizeIncrease, insertion, split, toBounds, RTree, bounds, node
} from '../src/index';

var a: bounds = [30,30,50,50,0,1];
var b: bounds = [20,50,80,70,0,1];
var c: bounds = [10,40,10,90,0,1];
var abc: bounds = [10,30,80,90,2, 3];

function toString(node: node<unknown>, depth = 0) {
    let prefix = '  '.repeat(depth);
    let content = node[6] || 'size-'+size(node)+'-depth-'+node[4]+'-count-'+node[5];
    let result = prefix + '[' + node.slice(0, 4).join() + ']: '+ content;
    if (node[8]?.length > 0) {
        for (let child of node[8]) {
            result += '\n' + prefix + toString(child, depth + 1);
        }
    }
    return result;
}

function count(node: node<unknown>) {
    if (!isWrapper(node)) return 1;
    return node[8].map(c => count(c)).reduce((a,b)=>a+b);
}

function isValid(node: node<unknown>) {
    if (node[8]?.length > 9) {
        throw 'Too many children in: ' + toString(node);
    }
    for (let child of node[8] || []) {
        if (sizeIncrease(node, child) !== 0) {
            throw 'Bounding box too small: ' + toString(node);
        }
        isValid(child);
    }
}

test('combine', () => {
    let _abc = combine([combine([a,b]), c]);
    expect(_abc).toEqual(abc);
});

test('size', () => {
    expect(size(a)).toEqual(400);
    expect(size(b)).toEqual(1200);
    expect(size(c)).toEqual(0);
});

test('center', () => {
    expect(center(false, a)).toEqual(40);
    expect(center(false, b)).toEqual(50);
    expect(center(false, c)).toEqual(10);
    expect(center(true, a)).toEqual(40);
    expect(center(true, b)).toEqual(60);
    expect(center(true, c)).toEqual(65);
});

test('corner', () => {
    let nodeA = {mbr: a, children: []};
    expect(corner(a, [30,30,40,40,0,1])).toEqual(0);
    expect(corner(a, [34,34,45,45,0,1])).toEqual(0);
    expect(corner(a, [36,36,45,45,0,1])).toEqual(3);
    expect(corner(a, [40,40,50,50,0,1])).toEqual(3);

    expect(corner(a, [40,40,40,40,0,1])).toEqual(0);

    expect(corner(a, [36,30,45,40,0,1])).toEqual(1);
    expect(corner(a, [40,30,50,40,0,1])).toEqual(1);
    expect(corner(a, [30,36,40,45,0,1])).toEqual(2);
    expect(corner(a, [30,40,40,50,0,1])).toEqual(2);
});
/*
let c0_0 = RTree.leaf([30,30,40,40], 'c0_0');
let c0_1 = RTree.leaf([34,34,45,45], 'c0_1');
let c0_2 = RTree.leaf([40,40,40,40], 'c0_2');
let c1_0 = RTree.leaf([36,30,45,40], 'c1_0');
let c1_1 = RTree.leaf([40,30,50,40], 'c1_1');
let c2_0 = RTree.leaf([30,36,50,45], 'c2_0');
let c2_1 = RTree.leaf([30,40,40,50], 'c2_1');
let c3_0 = RTree.leaf([36,36,45,45], 'c3_0');
let c3_1 = RTree.leaf([40,40,50,50], 'c3_1');

test('isSplitHorizontal', () => {
    expect(isSplitHorizontal(new RTree([c0_0, c0_1, c1_0, c1_0]))).toBe(true);
    expect(isSplitHorizontal(new RTree([c0_0, c0_1, c0_2, c3_0, c3_1]))).toBe(false);
    expect(isSplitHorizontal(new RTree([c0_0, c0_1, c3_0, c3_1]))).toBe(true);
    expect(isSplitHorizontal(new RTree([c0_0, c0_1, c2_0, c2_1]))).toBe(true);
});

test('isLeaf', () => {
    expect(isLeaf(RTree.leaf([0,0,0,0], ''))).toBe(true);
    expect(isLeaf(new RTree(null))).toBe(true);
    expect(isLeaf(new RTree([]))).toBe(true);

});

test('sizeIncrease', () => {
    expect(sizeIncrease(RTree.leaf([0,0,1,1], ''), RTree.leaf([0,0,0.5,1], ''))).toBe(0);
    expect(sizeIncrease(RTree.leaf([0,0,1,1], ''), RTree.leaf([0,0,1.5,1], ''))).toBe(0.5);
    expect(sizeIncrease(RTree.leaf([0,0,1,1], ''), RTree.leaf([-1,-1,2,2], ''))).toBe(8);
});*/

function randomNode(root: RTree<string>, i: number) {
    let x = Math.ceil(Math.random()*40);
    let y = Math.ceil(Math.random()*40);
    let width = Math.ceil(Math.random()*20);
    let height = Math.ceil(Math.random()*20);
    root.add({x,y,width,height}, 'r'+i);
}

function squareNode(root: RTree<string>, x: number, y: number) {
    root.add({x,y,width: 0.5,height: 0.5}, 's'+x+'-'+y);
}

function listNode(root: RTree<string>, i: number) {
    let y = i*2;
    root.add({x:0,y,width: 40,height: 1}, 'i'+i);
}

test('RTree', () => {
    let root = new RTree<string>();
    /*root.add(c0_0);
    root.add(c0_1);
    root.add(c0_2);
    root.add(c1_0);
    root.add(c1_1);
    expect(count(root)).toBe(5);
    root.add(c2_0);
    expect(count(root)).toBe(6);
    root.add(c2_1);
    expect(count(root)).toBe(7);
    root.add(c3_0);
    expect(count(root)).toBe(8);
    root.add(c3_1);
    expect(count(root)).toBe(9);
    root.add(c3_1);
    expect(count(root)).toBe(10);
    root.add(c3_1);
    expect(count(root)).toBe(11);*/
    for(var i = 0; i < 250; i++) {
        randomNode(root, i);  
        listNode(root, i);
    }

    for(var x = 0; x < 50; x++) {
        for(var y = 0; y < 50; y++) {
            squareNode(root, x, y);
        }
    }

    for(var i = 0; i < 2000; i++) {
        root.get([Math.random()*30,Math.random()*30]);
    }

    console.log(root.get([31,31]));

    // 250 => random, 13
    // 5000 => random, 44
    // 50.000 => random, 96
    // 100.000 => random, 101
    // 25/6 => list, 6
    // 250/6 => list, 62
    // 2500/6 => list, 624
    // console.log(toString(root._tree));
    console.log('depth:', root._tree[4], 'count:', root._tree[5]);
    //isValid(root._tree);
});