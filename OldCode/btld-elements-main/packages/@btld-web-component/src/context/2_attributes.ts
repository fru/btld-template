// Attribute Helper
// ----------------
// These helper functions are used to parse, get, set, stringify and iterate Attributes.

// There are three basic property types. String is the default. The btld-web component
// framework also supports arrays of all three types (number[], boolean[] & string[]).
// When an array is written to a dom attribute, comma separated strings are used. 

enum BtldPropType {
    Number = 1,
    Boolean = 2,
    String = undefined
}

/**
 * Returns a BtldPropType from a dom element e.g. <btld-prop type="bool" name="loading">
 * @param el The BTLD-PROP Element
 * @returns BtldPropType
 */
let _getTypeAttribute = (el: Element): BtldPropType => {
    switch(_getAttribute(el, 'type')?.toLowerCase()) {
        case 'number':
            return BtldPropType.Number;
        case 'boolean':
            return BtldPropType.Boolean; 
    }
}

/**
 * Wrapps get attribute for smaller bundle sizes
 * @param el
 * @param name 
 * @returns The attribute value
 */
let _getAttribute = (el: Element, name: string) => {
    return el.getAttribute(name);
};

/**
 * When we get an attribute from the dom as a string, this helper converts it to a type
 * @param attr The attribute value
 * @param type 
 * @param isArray 
 * @returns The parsed value
 */
let _parseAttribute = (attr: string|null, type?: BtldPropType, isArray?: boolean) => {
    if (attr === null) {
        return type === BtldPropType.Boolean ? false : null;
    }
    let parse = (v) => {
        if (type === BtldPropType.Boolean) return v !== 'false';
        return type === BtldPropType.Number ? +v : v;
    };
    return isArray ? attr.split(',').map(parse) : parse(attr);
};

/**
 * When we have a property e.g: <btld-prop name="label-button-left"> we need a normalized
 * version of its name attribute: ['labelButtonLeft', 'label-button-left']. It also
 * validates that the result is a valid js variable name.
 * @param el 
 * @returns [camelCased, hypen-ed]
 */
let _getNameAttribute = (el: Element): [camelcase: string, hypened: string] => {
    let n = _getAttribute(el, 'name');

    // Normalize attribute name to [camelCased, hypen-ed]
    let result: [camelcase: string, hypened: string] = 
        n.indexOf('-') > 0
        ? [n.replace(/-./g, m => m[1].toUpperCase()), n]
        : [n, n.replace(/[a-z][A-Z]/g, m => m[0]+'-'+m[1].toLowerCase())];

    // After normalization we still have to validate
    if (!/^[a-zA-Z_$][\w$]*$/.test(result[0])) {
        throw 'Prop name invalid: ' + n;
    }

    return result;
};

/**
 * Removes all attribute with a given prefix. For every removed attribute we call found
 * with the unmatched name postfix and the value of the attribute.
 * @param el 
 * @param prefix 
 * @param found 
 */
let _getAndRemovePrefixedProps = (el: Element, prefix: string, found: (name: string, value: string) => void) => {
    let attrs = el.attributes;
    let i = 0;
    while(i < attrs.length) {
        let item = attrs.item(i);
        let name = item.name;
        if (name.startsWith(prefix)) {
            found(name.substring(prefix.length), item.value);
            el.removeAttribute(name);
        } else {
            i++;
        }
    }
};

/**
 * Convert a property value to string attribute, given the type information. These types
 * are only used as hints. E.g: an array value is returned as a comma seperated string even
 * if isArray is not true. Likewise a value === false returns null even if no type boolean
 * is given.
 * @param value
 * @param type 
 * @param isArray 
 * @returns 
 */
let _stringifyProp = (value: unknown, type?: BtldPropType, isArray?: boolean): string => {
    let valueIsArray = Array.isArray(value);

    if (valueIsArray || isArray) {
        let values = valueIsArray ? value as any[] : [value]; 
        return values.map(v => _stringifyProp(v, type)).join();
    }

    if (value === undefined || value === null) {
        return null;
    }

    if (typeof value === 'boolean' || type === BtldPropType.Boolean) {
        return value === false ? null : '';
    }

    return ''+(type === BtldPropType.Number ? +value : value);
};

/**
 * Set or remove an attribute
 * @param el 
 * @param name 
 * @param stringified 
 */
let _setAttribute = (el: Element, name: string, stringified: string) => {
    if (stringified === null) {
        el.removeAttribute(name);
    } else {
        el.setAttribute(name, stringified);
    }
};

export {    
    _getAttribute,
    _getNameAttribute,
    _getTypeAttribute,
    _setAttribute,
    _stringifyProp,
    _parseAttribute,
    _getAndRemovePrefixedProps,
    BtldPropType
};