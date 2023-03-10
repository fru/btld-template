// From: .first my-test
// To: .second my-test
// Use: el.replaceWith
// Triggeres connectedCallback()

// 1. S(() => {...}) S.data()

// 2. construct, build, connect, disconnect
// 3. Render all child elements
// 4. Render out dom and fill in {data}, $attributes and @events
// 5. ref="arrayname" $inner $show $hide

// dom('string' || document fragment || '#id') warn after first call
// 1. Watching attributes (observedAttributes) use btld-attr(name='count' $default='0')
// script(watch='count').
// script(event='name').

// is='btld' tag='my-counter' if='true' for='[1,2,3]' for-key='' 
// Allways leave element with attribute: [anchor]

// Allow global two way binding $$value="forms.apply.firstName"
// Translate before insertion


customElements.define('test-component', class extends HTMLElement {
    constructor() {
        super();
        const p = document.createElement('p');
        p.textContent = 'It works!';
        this.appendChild(p);
    }

    connectedCallback() {}
    disconnectedCallback() {}
    attributeChangedCallback() {}
})

test('custom elements in JSDOM', () => {
    document.body.innerHTML = `<h1>Custom element test</h1> <test-component></test-component>`
    let html = document.body.innerHTML;
    expect(html).toContain('It works!')
});