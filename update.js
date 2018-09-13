/*
React-compatible data-structure update utility

(C) 2016-2017 Doug Hoyte
2-clause BSD license
*/


function shallowCopy(x) {
  return Object.assign(new x.constructor(), x);
}

export default function update(view, upd) {
  if (typeof(upd) !== 'object') throw(new Error("update is not an object"));

  // Process commands:

  if (upd.hasOwnProperty('$set')) {
    return upd['$set'];
  }

  if (upd.hasOwnProperty('$push')) {
    if (view === undefined || view === null) view = [];

    if (!Array.isArray(view)) throw(new Error("view is not an array in push"));
    if (!Array.isArray(upd['$push'])) throw(new Error("update is not an array in push"));

    if (upd['$push'].length === 0) return view;

    let new_view = shallowCopy(view);

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

    let new_view = shallowCopy(view);

    for (let e of upd['$unshift'].reverse()) {
      new_view.unshift(e);
    }

    return new_view;
  }

  if (upd.hasOwnProperty('$splice')) {
    if (view === undefined || view === null) view = [];

    if (!Array.isArray(view)) throw(new Error("view is not an array in splice"));
    if (!Array.isArray(upd['$splice'])) throw(new Error("update is not an array in splice"));

    let new_view = shallowCopy(view);

    for (let s of upd['$splice']) {
      if (!Array.isArray(s)) throw(new Error("update element is not an array"));
      new_view.splice.apply(new_view, s);
    }

    return new_view;
  }

  if (upd.hasOwnProperty('$apply')) {
    if (typeof(upd['$apply']) !== 'function') throw(new Error("update is not a function in apply"));

    let new_view;

    if (Array.isArray(view) || (typeof(view) === 'object' && view !== null)) {
      new_view = shallowCopy(view);
    } else if (view !== Object(view)) {
      new_view = view;
    }

    return upd['$apply'](new_view);
  }


  // Commands that can be combined with same-level recursion

  if (view === undefined || view === null) view = {};

  let new_view = shallowCopy(view);
  let changed = false;

  if (upd.hasOwnProperty('$merge')) {
    if (typeof(view) !== 'object') throw(new Error("view is not an object in merge"));
    if (typeof(upd) !== 'object') throw(new Error("update is not an object in merge"));

    for (let k of Object.keys(upd['$merge'])) {
      if (!(k in view) || upd['$merge'][k] !== view[k]) {
        changed = true;
        break;
      }
    }

    if (changed) Object.assign(new_view, upd['$merge']);
  }

  if (upd.hasOwnProperty('$unset')) {
    if (typeof(view) !== 'object') throw(new Error("view is not an object in unset"));

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
  }


  // Recurse to handle nested commands in upd:

  if (Array.isArray(view)) {
    for (let key in upd) {
        const int = parseInt(key);
        if (key != int) throw(new Error("non-numeric key in array update")); // deliberate != instead of !==
        new_view[int] = update(new_view[int], upd[key]);
        if (new_view[int] !== view[int]) {
          changed = true;
        }
    }

    return changed ? new_view : view;
  } else if (typeof(view) === 'object') {
    for (let key in upd) {
        let upd_key = key;
        if (!(key[0] === '$' && key[1] !== '$')) {
          if (key.startsWith("$$")) key = key.substr(1);
          new_view[key] = update(new_view[key], upd[upd_key]);
          if (new_view[key] !== view[key] || (new_view[key] === undefined && !view.hasOwnProperty(key))) {
            changed = true;
          }
       }
    }

    return changed ? new_view : view;
  }

  throw(new Error("view not an array or object"));
}



function escapePathKey(k) {
  if (k.startsWith('$')) k = '$' + k;
  return k;
}

function compilePath(path, leaf) {
  if (Array.isArray(path)) {
    if (path.length > 0) {
      return { [escapePathKey(path[0])]: compilePath(path.slice(1), leaf) };
    }
  } else {
    let m = path.match(/^[^.]+/);
    if (m) {
      return { [escapePathKey(m[0])]: compilePath(path.substr(m[0].length+1), leaf) };
    }
  }

  return leaf;
}

export function updatePath(view, op, path, params) {
  return update(view, compilePath(path, { ['$' + op]: params }));
}
