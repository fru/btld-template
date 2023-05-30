function mutation1(data) {
  data.abc = data.abc || {};
  data.abc.test = 123;
}

function mutation2(data, value) {
  data.xyz = value;
}

function mutation3(data, element) {
  data.arr = data.arr || [];
  data.arr.push(element);
}

function mutation4(data) {
  if (Array.isArray(data.arr)) {
    data.arr.sort();
  }
}

function mutation5(data, value) {
  data.nested = data.nested || {};
  data.nested.prop = value;
}

function mutation6(data) {
  if (typeof data.num === 'number') {
    data.num = Math.abs(data.num);
  }
}

function mutation7(data, prop) {
  delete data[prop];
}

function mutation8(data, arr1, arr2) {
  data.concatenated = (data.arr1 || []).concat(data.arr2 || []);
}

function mutation9(data) {
  if (typeof data.str === 'string') {
    data.str = data.str.toUpperCase();
  }
}

function mutation10(data) {
  if (Array.isArray(data.arr)) {
    data.arr.reverse();
  }
}

function mutation12(data) {
  if (typeof data.numStr === 'string') {
    data.numStr = parseFloat(data.numStr);
  }
}

function mutation13(data, suffix) {
  if (typeof data.str === 'string') {
    data.str += suffix;
  }
}

function mutation14(data) {
  if (Array.isArray(data.arr)) {
    data.arr.length = 0;
  }
}

function mutation15(data, value) {
  data.nested = data.nested || {};
  data.nested.prop = data[value];
}

function mutation16(data, prop) {
  data.exists = data.hasOwnProperty(prop);
}

function mutation17(data) {
  if (typeof data.str === 'string') {
    data.str = data.str.trim();
  }
}

function mutation18(data, increment) {
  if (typeof data.count === 'number') {
    data.count += increment;
  }
}

function mutation19(data, element) {
  data.arr = data.arr || [];
  data.arr.unshift(element);
}

function mutation20(data) {
  if (typeof data.bool === 'boolean') {
    data.bool = !data.bool;
  }
}

function mutation21(data) {
  for (let prop in data) {
    if (typeof data[prop] === 'string') {
      data[prop] = data[prop].toLowerCase();
    }
  }
}
