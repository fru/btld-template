// Tabs in react
// tab is react comp, how to continuesly get htmlelement?

// Reactive state
let tab = btld-tab({group: 'test-group'});
tab.header = 'Example tab' | {title: 'Example'};
tab.open = true;
tab.fragment = 'example-tab';
tab.name = Fallback to tab.fragment
tab.content = <div />;
tab.default = true;

// React
let {Tab, TabsHeader} = btld-tab-group(react);
<TabsHeader />
<Tab header='Example tab' fragment='example-tab' default={true}>
	Test content
</Tab>

?????
let {tab, header, state} = btld-tab-group(react);
header(domEl, createDomHeaderEl | template);
let t1 = tab(domElT1, {header: 'Header', fragment: 'example-tab', default: true});

tab('querySelector');
header('querySelector'); // default use data-attr's and then attr's

// Angular
todo

// Animate tab height, Animate tab open underscore

// Sortable tree


// Templating



// Reactive interface:

let x = reactive();
x(() => {...})

let d = x.data()
d('data'), console.log(d())

x.active(true/false)

x.prop(this, 'test', 123)
x(() => this.render(<test>{ x(() => <abc test={x(()=>123)}></abc> ) }</test>))

