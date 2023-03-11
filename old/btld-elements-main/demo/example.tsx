import { h, prop, define, Fragment, Component } from "@btld-web/component";

@define
class MyCounter extends Component {

    @prop.number() count = 2;

    init = () => <Fragment>
        <button onClick={() => this.count -= 1}>-</button>
        <span>{() => this.count}</span>
        <button onClick={() => this.count += 1}>+</button>
    </Fragment>;
}