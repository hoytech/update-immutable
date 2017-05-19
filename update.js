/*
React-compatible data-structure update utility

(C) 2016-2017 Doug Hoyte
2-clause BSD license
*/


function shallowCopyObject(x) {
  return Object.assign(new x.constructor(), x);
}

function shallowCopyArray(x) {
    return x.concat();
}


export default function update(view, upd) {
  if (typeof(upd) !== 'object') throw(new Error("update is not an object"));

  // Process commands:

  if (upd.hasOwnProperty('$set')) {
    return upd['$set'];
  }

  if (upd.hasOwnProperty('$unset')) {
    if (view === undefined || view === null) view = {};

    if (typeof(view) !== 'object') throw(new Error("view is not an object in unset"));

    let new_view = shallowCopyObject(view);

    let changed = false;

    if (typeof(upd['$unset']) === 'object') {
      for (let k of upd['$unset']) {
        if (k in new_view) {
          delete new_view[k];
          changed = true;
        }
      }
    } else {
      if (upd['$unset'] in new_view) {
        delete new_view[upd['$unset']];
        changed = true;
      }
    }

    return changed ? new_view : view;
  }

  if (upd.hasOwnProperty('$merge')) {
    if (view === undefined || view === null) view = {};

    if (typeof(view) !== 'object') throw(new Error("view is not an object in merge"));
    if (typeof(upd) !== 'object') throw(new Error("update is not an object in merge"));

    let changed = false;

    for (let k of Object.keys(upd['$merge'])) {
      if (!(k in view) || upd['$merge'][k] !== view[k]) {
        changed = true;
        break;
      }
    }

    if (!changed) return view;

    let new_view = shallowCopyObject(view);

    Object.assign(new_view, upd['$merge']);

    return new_view;
  }

  if (upd.hasOwnProperty('$push')) {
    if (view === undefined || view === null) view = [];

    if (!Array.isArray(view)) throw(new Error("view is not an array in push"));
    if (!Array.isArray(upd['$push'])) throw(new Error("update is not an array in push"));

    if (upd['$push'].length === 0) return view;

    let new_view = shallowCopyArray(view);

    for (let e of upd['$push']) {
      new_view.push(e);
    }

    return new_view;
  }

  if (upd.hasOwnProperty('$unshift')) {
    if (view === undefined || view === null) view = [];

    if (!Array.isArray(view)) throw(new Error("view is not an array in unshift"));
    if (!Array.isArray(upd['$unshift'])) throw(new Error("update is not an array in unshift"));

    if (upd['$unshift'].length === 0) return view;

    let new_view = shallowCopyArray(view);

    for (let e of upd['$unshift'].reverse()) {
      new_view.unshift(e);
    }

    return new_view;
  }

  if (upd.hasOwnProperty('$splice')) {
    if (view === undefined || view === null) view = [];

    if (!Array.isArray(view)) throw(new Error("view is not an array in splice"));
    if (!Array.isArray(upd['$splice'])) throw(new Error("update is not an array in splice"));

    let new_view = shallowCopyArray(view);

    for (let s of upd['$splice']) {
      if (!Array.isArray(s)) throw(new Error("update element is not an array"));
      new_view.splice.apply(new_view, s);
    }

    return new_view;
  }

  if (upd.hasOwnProperty('$apply')) {
    if (view === undefined || view === null) view = {};
    if (typeof(upd['$apply']) !== 'function') throw(new Error("update is not a function in apply"));

    let new_view;

    if (Array.isArray(view)) {
      new_view = shallowCopyArray(view);
    } else if (typeof(view) === 'object') {
      new_view = shallowCopyObject(view);
    } else if (view !== Object(view)) {
      new_view = view;
    }

    if (new_view === undefined) throw(new Error("view is not an object, array or primitive"));
    return upd['$apply'](new_view);
  }


  // Recurse to handle nested commands in upd:

  if (view === undefined || view === null) view = {};

  if (Array.isArray(view)) {
    let output = shallowCopyArray(view);
    let changed = false;

    for (let key in upd) {
        const int = parseInt(key);
        if (key != int) throw new Error('non-numeric key in array update'); // deliberate != instead of !==
        output[int] = update(output[int], upd[key]);
        if (output[int] !== view[int]) {
          changed = true;
        }
    }

    return changed ? output : view;
  } else if (typeof(view) === 'object') {
    let output = shallowCopyObject(view);
    let changed = false;

    for (let key in upd) {
        output[key] = update(output[key], upd[key]);
        if (output[key] !== view[key]) {
          changed = true;
        }
    }

    return changed ? output : view;
  }

  throw(new Error("view not an array or hash"));
}
