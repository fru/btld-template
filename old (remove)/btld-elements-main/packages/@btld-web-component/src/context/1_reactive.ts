// Reactive
// --------
// This is a minimal reactive programming library for the btld-web component framework.

// It has two primary objects: Props and Observables. Props know which Observables are 
// _dependents. These are notified when the Prop._value changes. Observables, on the other
// hand, remember the ids of the Props they depend on via _dependsOn. This information
// is used so that Observables are only in a Props._dependents once, even though on every
// execution of an Observable we record which Props were used (via the getter). 

interface Prop {
    _id: number;
    _name: string;
    _value: any;
    _changeId?: number;
    _dependents: Observable[];
}

interface Observable {
    _watch: () => any;
    _onchange: () => any;
    _dependsOn: {[id: number]: boolean};
    _inactive?: boolean;
}

// There is a global state to record which Props are used in an Observable. 'recorder' is
// the Observable that is being recorded. This is set by the runAndRecord function and
// uses get for the actual updates to _dependsOn and _dependents

let recorder: Observable;

let runAndRecord = (observable: Observable) => {
    let oldRecorder = recorder;
    recorder = observable;
    try {
        observable?._watch(); // Uses Props which in turn call get
    } finally {
        recorder = oldRecorder;
    }
};

let get = (prop: Prop): any => {
    if (recorder) {
        if(!recorder._dependsOn[prop._id]) {
            prop._dependents.push(recorder);
            recorder._dependsOn[prop._id] = true;
        }
    }
    return prop._value;
};

// The changeId is a global unique id. Every time a Prop is changed outside an observable
// this id is incremented. This id is used to stop infinite recursion were Observables
// update Props in a loop. Setting a property twice with the same changeId is not allowed.

let changeId = 0;

let set = (prop: Prop, value: any) => {
    if (prop._value === value) return;

    if (!recorder) {
        changeId++;
        if (changeId >= Number.MAX_SAFE_INTEGER) changeId = 1;
    } else {
        if (changeId === prop._changeId) {
            throw 'Recursion when setting Prop: ' + prop._name;
        }
    }

    prop._changeId = changeId;
    prop._value = value;

    // Observables are run in a random order
    prop._dependents = prop._dependents.filter(p => !p._inactive);
    for (let d of prop._dependents) {
        try {
            runAndRecord(d);
            d._onchange?.(); 
        } catch (ex) {
            console.error(ex);
        }
    }
};

let _getUnobserved = (that: any, name: string) => {
    let oldRecorder = recorder;
    recorder = null;
    let result = that[name];
    recorder = oldRecorder;
    return result;
};

let propId = 0;

/**
 * Add a Prop to the `that` context
 * @param that 
 * @param name Name of the property
 * @param value Initial value
 */
let _prop = (that: any, name: string, value?: any): void => {
    let prop: Prop = {
        _id: propId++,
        _name: name,
        _value: value,
        _dependents: []
    };

    Object.defineProperty(that, name, {
        get: () => get(prop),
        set: (v) => set(prop, v)
    });
};

/**
 * Create Observable
 * @param watch 
 * @param onchange? Executed when a Prop used in `watch` changes 
 * @returns Created Observable
 */
let _observe = (watch: () => void, onchange?: () => void): Observable => {
    let observable: Observable = {
        _watch: watch,
        _onchange: onchange,
        _dependsOn: {}
    };
    runAndRecord(observable);
    return observable;
};

/**
 * Used to deactivate or reactivate an observable
 * @param o Observable
 * @param activ When true set active
 */
let _toggleActiv = (o: Observable, activ: boolean): void => {
    o._inactive = !activ;
    if (activ) runAndRecord(o);
};

export { _prop, _observe, _toggleActiv, _getUnobserved, Prop, Observable };