import { expect } from 'chai';
import { skiplist2d } from '../src/btld-skiplist';
import { vertical, horizontal } from '../src/btld-skiplist/internal';

function check_public(data) {
    const hor = horizontal(data);
    const ver = vertical(data);

    it('horizontal, should return elements', () => {
        const n = hor.get(1.5, false);
        expect(n.sections.length).to.equal(3);
    });

    it('vertical, should return elements', () => {
        const n = ver.get(1.5);
        expect(n.sections.length).to.equal(4);
    });

    it('horizontal, should be iterable', () => {
        let a: any[] = Array.from(hor);
        expect(a).to.have.lengthOf(4);
        a.forEach((item, index) =>
            it('#' + index, () => {
                expect(item.sections.length).to.equal(3);
            })
        );
    });

    it('vertical, should be iterable', () => {
        let a: any[] = Array.from(ver);
        expect(a).to.have.lengthOf(3);
        a.forEach((item, index) =>
            it('#' + index, () => {
                expect(item.sections.length).to.equal(4);
            })
        );
    });

    it('data.count', () => {
        expect(data.count).to.equal(12);
    });

    it('data.first', () => {
        const n = data.first({ x: 1.5, y: 1.5 });
        expect(n.data).to.equal('e');
    });

    it('data.get', () => {
        const ns = data.get({ x: 1.5, y: 1.5 });
        expect(ns).to.have.lengthOf(1);
        expect(ns[0].data).to.equal('e');
    });

    it('data.remove', () => {
        data.remove(data.first({ x: 1.5, y: 1.5 }));
        expect(data.first({ x: 1.5, y: 1.5 })).to.equal(null);
        expect(data.count).to.equal(11);
    });
}

describe('Insert:', function () {
    describe('Simple', function () {
        const simple = skiplist2d();
        simple.add({ data: 'a', x: 0, y: 0, w: 1, h: 1, zindex: 1, id: 1 });
        simple.add({ data: 'b', x: 0, y: 1, w: 1, h: 1, zindex: 1, id: 2 });
        simple.add({ data: 'c', x: 0, y: 2, w: 1, h: 1, zindex: 1, id: 3 });
        simple.add({ data: 'd', x: 1, y: 0, w: 1, h: 1, zindex: 1, id: 4 });
        simple.add({ data: 'e', x: 1, y: 1, w: 1, h: 1, zindex: 1, id: 5 });
        simple.add({ data: 'f', x: 1, y: 2, w: 1, h: 1, zindex: 1, id: 6 });
        simple.add({ data: 'g', x: 2, y: 0, w: 1, h: 1, zindex: 1, id: 7 });
        simple.add({ data: 'h', x: 2, y: 1, w: 1, h: 1, zindex: 1, id: 8 });
        simple.add({ data: 'i', x: 2, y: 2, w: 1, h: 1, zindex: 1, id: 9 });
        simple.add({ data: 'j', x: 3, y: 0, w: 1, h: 1, zindex: 1, id: 10 });
        simple.add({ data: 'k', x: 3, y: 1, w: 1, h: 1, zindex: 1, id: 11 });
        simple.add({ data: 'l', x: 3, y: 2, w: 1, h: 1, zindex: 1, id: 12 });

        check_public(simple);
    });

    describe('Batch', function () {
        let batch = skiplist2d();
        batch.batch([
            { data: 'a', x: 0, y: 0, w: 1, h: 1, zindex: 1, id: 1 },
            { data: 'b', x: 0, y: 1, w: 1, h: 1, zindex: 1, id: 2 },
            { data: 'c', x: 0, y: 2, w: 1, h: 1, zindex: 1, id: 3 },
            { data: 'd', x: 1, y: 0, w: 1, h: 1, zindex: 1, id: 4 },
            { data: 'e', x: 1, y: 1, w: 1, h: 1, zindex: 1, id: 5 },
            { data: 'f', x: 1, y: 2, w: 1, h: 1, zindex: 1, id: 6 },
            { data: 'g', x: 2, y: 0, w: 1, h: 1, zindex: 1, id: 7 },
            { data: 'h', x: 2, y: 1, w: 1, h: 1, zindex: 1, id: 8 },
            { data: 'i', x: 2, y: 2, w: 1, h: 1, zindex: 1, id: 9 },
            { data: 'j', x: 3, y: 0, w: 1, h: 1, zindex: 1, id: 10 },
            { data: 'k', x: 3, y: 1, w: 1, h: 1, zindex: 1, id: 11 },
            { data: 'l', x: 3, y: 2, w: 1, h: 1, zindex: 1, id: 12 },
        ]);

        check_public(batch);
    });
});
