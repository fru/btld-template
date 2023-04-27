import {normalizeProps, isValidJsVar} from '../src/context';

describe("Helpers Normalize", () => {

    let cases = [
        // IN               // Out
        ['test',            ['test', 'test']],
        ['testTest',        ['testTest', 'test-test']],
    ];

    test.each(cases)(
        "given %p as arguments, returns %p",
        ((i: string, expected: string[]) => {
            let out = normalizeProps(i);
            expect(out).toEqual(expected);
        })
    );
});