import {o} from '../src/observable';

describe("Observable", () => {
    test('every time a prop is set, the observable should update', () => {
        const that: any = {};
        o.prop(that, 'a');
        that.a = 1;

        const mock = jest.fn(() => that.a);
        o(mock);

        that.a = 2;
        that.a = 3;
        that.a = 4;

        let observedA = mock.mock.results.map(x => x.value);
        expect(observedA).toEqual([1,2,3,4]);
    });

    test('observable can set another prop', () => {
        const that: any = {};
        o.prop(that, 'a');
        o.prop(that, 'b');
        that.a = 1;

        o(() => that.b = that.a);

        const mock = jest.fn(() => 'b' + that.b);
        o(mock);

        that.a = 2;
        that.a = 3;
        that.a = 4;

        let observedB = mock.mock.results.map(x => x.value);
        expect(observedB).toEqual(['b1','b2','b3','b4']);
    });

    test('circles are detected', () => {
        const that: any = {};
        o.prop(that, 'a');
        that.a = 1;

        const t = () => {
            o(() => that.a = that.a + 1);
        };
        
        expect(t).toThrow("Recursion in Observable from Prop: 'a'");
    });

    test('props can be closed', () => {
        const that: any = {};
        const prop = o.prop(that, 'a');
        that.a = 1;

        o.close(prop);

        const t = () => {
            that.a = 2;
        };
        
        expect(t).toThrow("The Prop: 'a' is closed");
    });

    test('observables can be closed', () => {
        const that: any = {};
        console.log(o.prop(that, 'c'));
        that.c = 1;

        const mock = jest.fn(() => that.c);
        const observe = o(mock);

        that.c = 2;
        o.close(observe);
        that.c = 3;
        that.c = 4;

        let observedC = mock.mock.results.map(x => x.value);
        expect(observedC).toEqual([1,2]);
    });
});