import {iterExpressions} from '../src/context';

describe("Helpers Iterate", () => {

    let element = document.createElement('template');
    element.innerHTML = `
        <span $a="exp1">a\${exp1}a</span>
        <custom-el $bTest123="exp2">b<span>\${exp2}</span>b</custom-el>
    `;


    test('Find expressions in text', () => {
        iterExpressions(element.content, (tx, parts)=>{
            tx.textContent = parts
                .map((t, i) => i % 2 === 1 ? '--'+t+'--' : t)
                .join('');
        }, ()=>{});
        expect(element.content.textContent).toContain('a--exp1--a');
        expect(element.content.textContent).toContain('b--exp2--b');
    });

    test('Find attribute expressions', () => {
        iterExpressions(element.content, ()=>{}, (el, attr, val)=>{
            el.setAttribute(attr, val+'!!!');
        });
        expect(element.innerHTML).toContain('a="exp1!!!"')
        expect(element.innerHTML).toContain('btest123="exp2!!!"')
    });
});