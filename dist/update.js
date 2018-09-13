'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = update;
exports.updatePath = updatePath;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/*
React-compatible data-structure update utility

(C) 2016-2017 Doug Hoyte
2-clause BSD license
*/

function shallowCopy(x) {
  return Object.assign(new x.constructor(), x);
}

function update(view, upd) {
  if ((typeof upd === 'undefined' ? 'undefined' : _typeof(upd)) !== 'object') throw new Error("update is not an object");

  // Process commands:

  if (upd.hasOwnProperty('$set')) {
    return upd['$set'];
  }

  if (upd.hasOwnProperty('$push')) {
    if (view === undefined || view === null) view = [];

    if (!Array.isArray(view)) throw new Error("view is not an array in push");
    if (!Array.isArray(upd['$push'])) throw new Error("update is not an array in push");

    if (upd['$push'].length === 0) return view;

    var _new_view = shallowCopy(view);

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = upd['$push'][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var e = _step.value;

        _new_view.push(e);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return _new_view;
  }

  if (upd.hasOwnProperty('$unshift')) {
    if (view === undefined || view === null) view = [];

    if (!Array.isArray(view)) throw new Error("view is not an array in unshift");
    if (!Array.isArray(upd['$unshift'])) throw new Error("update is not an array in unshift");

    if (upd['$unshift'].length === 0) return view;

    var _new_view2 = shallowCopy(view);

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = upd['$unshift'].reverse()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var _e = _step2.value;

        _new_view2.unshift(_e);
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    return _new_view2;
  }

  if (upd.hasOwnProperty('$splice')) {
    if (view === undefined || view === null) view = [];

    if (!Array.isArray(view)) throw new Error("view is not an array in splice");
    if (!Array.isArray(upd['$splice'])) throw new Error("update is not an array in splice");

    var _new_view3 = shallowCopy(view);

    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = upd['$splice'][Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var s = _step3.value;

        if (!Array.isArray(s)) throw new Error("update element is not an array");
        _new_view3.splice.apply(_new_view3, s);
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }

    return _new_view3;
  }

  if (upd.hasOwnProperty('$apply')) {
    if (typeof upd['$apply'] !== 'function') throw new Error("update is not a function in apply");

    var _new_view4 = void 0;

    if (Array.isArray(view) || (typeof view === 'undefined' ? 'undefined' : _typeof(view)) === 'object' && view !== null) {
      _new_view4 = shallowCopy(view);
    } else if (view !== Object(view)) {
      _new_view4 = view;
    }

    return upd['$apply'](_new_view4);
  }

  // Commands that can be combined with same-level recursion

  if (view === undefined || view === null) view = {};

  var new_view = shallowCopy(view);
  var changed = false;

  if (upd.hasOwnProperty('$merge')) {
    if ((typeof view === 'undefined' ? 'undefined' : _typeof(view)) !== 'object') throw new Error("view is not an object in merge");
    if ((typeof upd === 'undefined' ? 'undefined' : _typeof(upd)) !== 'object') throw new Error("update is not an object in merge");

    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = Object.keys(upd['$merge'])[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var k = _step4.value;

        if (!(k in view) || upd['$merge'][k] !== view[k]) {
          changed = true;
          break;
        }
      }
    } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion4 && _iterator4.return) {
          _iterator4.return();
        }
      } finally {
        if (_didIteratorError4) {
          throw _iteratorError4;
        }
      }
    }

    if (changed) Object.assign(new_view, upd['$merge']);
  }

  if (upd.hasOwnProperty('$unset')) {
    if ((typeof view === 'undefined' ? 'undefined' : _typeof(view)) !== 'object') throw new Error("view is not an object in unset");

    if (_typeof(upd['$unset']) === 'object') {
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = upd['$unset'][Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var _k = _step5.value;

          if (_k in new_view) {
            delete new_view[_k];
            changed = true;
          }
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
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
    for (var key in upd) {
      var int = parseInt(key);
      if (key != int) throw new Error("non-numeric key in array update"); // deliberate != instead of !==
      new_view[int] = update(new_view[int], upd[key]);
      if (new_view[int] !== view[int]) {
        changed = true;
      }
    }

    return changed ? new_view : view;
  } else if ((typeof view === 'undefined' ? 'undefined' : _typeof(view)) === 'object') {
    for (var _key in upd) {
      var upd_key = _key;
      if (!(_key[0] === '$' && _key[1] !== '$')) {
        if (_key.startsWith("$$")) _key = _key.substr(1);
        new_view[_key] = update(new_view[_key], upd[upd_key]);
        if (new_view[_key] !== view[_key] || new_view[_key] === undefined && !view.hasOwnProperty(_key)) {
          changed = true;
        }
      }
    }

    return changed ? new_view : view;
  }

  throw new Error("view not an array or object");
}

function escapePathKey(k) {
  if (k.startsWith('$')) k = '$' + k;
  return k;
}

function compilePath(path, leaf) {
  if (Array.isArray(path)) {
    if (path.length > 0) {
      return _defineProperty({}, escapePathKey(path[0]), compilePath(path.slice(1), leaf));
    }
  } else {
    var m = path.match(/^[^.]+/);
    if (m) {
      return _defineProperty({}, escapePathKey(m[0]), compilePath(path.substr(m[0].length + 1), leaf));
    }
  }

  return leaf;
}

function updatePath(view, op, path, params) {
  return update(view, compilePath(path, _defineProperty({}, '$' + op, params)));
}