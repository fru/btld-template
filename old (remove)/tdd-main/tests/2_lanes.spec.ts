// internal(node) ->
// - laneNext
// - lanePrev
// - level
// - isHead
// - isTail
// - from
// - to
// - sections

import { expect } from 'chai';
//import { skiplist2d } from '../src/btld-skiplist';
import { maxLevelDepth, randomLevelDepth } from '../src/btld-skiplist/insert';

describe('Lanes', function () {
    describe('should have a max level depth', function () {
        it('should give levels', () => {
            expect(maxLevelDepth(1, 0.25)).to.equal(1);
            expect(maxLevelDepth(3, 0.25)).to.equal(1);
            expect(maxLevelDepth(7, 0.25)).to.equal(2);
            expect(maxLevelDepth(10, 0.25)).to.equal(3);
            expect(maxLevelDepth(20, 0.25)).to.equal(3);
            expect(maxLevelDepth(30, 0.25)).to.equal(4);
            expect(maxLevelDepth(40, 0.25)).to.equal(4);
            expect(maxLevelDepth(100, 0.25)).to.equal(5);
            expect(maxLevelDepth(1000, 0.25)).to.equal(7);
        });
    });

    describe('level depth', function () {
        function seed(seed = 1) {
            return function notRealyRandom() {
                const x = Math.sin(seed++) * 10000;
                return x - Math.floor(x);
            };
        }

        it('should be randomly assigned # 50', () => {
            const random = seed(1);
            const range = Array.from(Array(50).keys());
            const result = range.map((count) =>
                randomLevelDepth(count, 0.25, random)
            );
            expect(result).to.deep.equal([
                1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 2, 1, 3, 1, 1, 1, 1, 2, 1, 1,
                2, 1, 1, 1, 2, 3, 1, 1, 2, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 2, 1,
                1, 1, 1, 1, 1, 2, 1, 1,
            ]);
        });

        it('should be randomly assigned # 500', () => {
            const random = seed(2);
            const range = Array.from(Array(500).keys());
            const result = range.map((count) =>
                randomLevelDepth(count, 0.25, random)
            );
            expect(result).to.deep.equal([
                1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 2, 1, 3, 1, 1, 1, 1, 2, 1, 1, 2,
                1, 1, 1, 2, 3, 1, 1, 2, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1,
                1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 4, 1, 3, 1, 1, 2, 1,
                1, 1, 1, 1, 1, 2, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 3,
                1, 1, 2, 1, 4, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1,
                2, 1, 1, 1, 1, 1, 1, 2, 3, 1, 2, 3, 1, 1, 1, 1, 1, 1, 1, 1, 2,
                1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 1, 2, 2, 1, 2, 1, 5,
                5, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1,
                3, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 4, 2, 1, 1, 1, 1,
                3, 3, 1, 1, 1, 1, 2, 2, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2,
                1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 3, 1, 2, 2, 1, 1, 1, 1, 1,
                4, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 2, 3, 4, 1, 1, 1, 1, 2, 2,
                1, 6, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 3, 2, 1, 2,
                1, 1, 2, 3, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 3, 1, 3, 1, 1, 1,
                2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2,
                3, 1, 1, 6, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1,
                1, 1, 2, 1, 2, 1, 1, 3, 1, 2, 1, 1, 3, 1, 1, 2, 1, 1, 1, 1, 1,
                1, 1, 2, 2, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 3, 1, 1, 3, 1,
                2, 1, 1, 1, 3, 1, 1, 1, 1, 2, 1, 1, 2, 4, 1, 1, 4, 1, 2, 2, 1,
                1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1,
                1, 1, 1, 1, 1, 1, 3, 3, 1, 2, 1, 1, 1, 3, 1, 2, 3, 1, 1, 1, 1,
                1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1,
                1, 4, 2, 1, 2, 1, 2, 2, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1,
                1, 2, 1, 1, 1, 2, 3, 1, 2, 1, 1, 1, 1, 1, 2, 2, 1,
            ]);
        });
    });
});
