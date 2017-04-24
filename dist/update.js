'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = update;
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

function update(view, upd) {
    if ((typeof upd === 'undefined' ? 'undefined' : _typeof(upd)) !== 'object') throw new Error("update is not an object");

    // Process commands:

    if (upd.hasOwnProperty('$set')) {
        return upd['$set'];
    }

    if (upd.hasOwnProperty('$unset')) {
        if (view === undefined || view === null) view = {};

        if ((typeof view === 'undefined' ? 'undefined' : _typeof(view)) !== 'object') throw new Error("view is not an object in unset");

        var new_view = shallowCopyObject(view);
        delete new_view[upd['$unset']];

        return new_view;
    }

    if (upd.hasOwnProperty('$merge')) {
        if (view === undefined || view === null) view = {};

        if ((typeof view === 'undefined' ? 'undefined' : _typeof(view)) !== 'object') throw new Error("view is not an object in merge");
        if ((typeof upd === 'undefined' ? 'undefined' : _typeof(upd)) !== 'object') throw new Error("update is not an object in merge");

        var _new_view = shallowCopyObject(view);

        Object.assign(_new_view, upd['$merge']);

        return _new_view;
    }

    if (upd.hasOwnProperty('$push')) {
        if (view === undefined || view === null) view = [];

        if (!Array.isArray(view)) throw new Error("view is not an array in push");
        if (!Array.isArray(upd['$push'])) throw new Error("update is not an array in push");

        var _new_view2 = shallowCopyArray(view);

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = upd['$push'][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var e = _step.value;

                _new_view2.push(e);
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

        return _new_view2;
    }

    if (upd.hasOwnProperty('$unshift')) {
        if (view === undefined || view === null) view = [];

        if (!Array.isArray(view)) throw new Error("view is not an array in unshift");
        if (!Array.isArray(upd['$unshift'])) throw new Error("update is not an array in unshift");

        var _new_view3 = shallowCopyArray(view);

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = upd['$unshift'].reverse()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var _e = _step2.value;

                _new_view3.unshift(_e);
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

        return _new_view3;
    }

    if (upd.hasOwnProperty('$splice')) {
        if (view === undefined || view === null) view = [];

        if (!Array.isArray(view)) throw new Error("view is not an array in splice");
        if (!Array.isArray(upd['$splice'])) throw new Error("update is not an array in splice");

        var _new_view4 = shallowCopyArray(view);

        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            for (var _iterator3 = upd['$splice'][Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var s = _step3.value;

                if (!Array.isArray(s)) throw new Error("update element is not an array");
                _new_view4.splice.apply(_new_view4, s);
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

        return _new_view4;
    }

    if (upd.hasOwnProperty('$apply')) {
        if (view === undefined || view === null) view = {};
        if (typeof upd['$apply'] !== 'function') throw new Error("update is not a function in apply");

        var _new_view5 = void 0;

        if (Array.isArray(view)) {
            _new_view5 = shallowCopyArray(view);
        } else if ((typeof view === 'undefined' ? 'undefined' : _typeof(view)) === 'object') {
            _new_view5 = shallowCopyObject(view);
        } else if (view !== Object(view)) {
            _new_view5 = view;
        }

        if (_new_view5 === undefined) throw new Error("view is not an object, array or primitive");
        return upd['$apply'](_new_view5);
    }

    // Recurse to handle nested commands in upd:

    if (view === undefined || view === null) view = {};

    if (Array.isArray(view)) {
        var output = shallowCopyArray(view);

        for (var key in upd) {
            var int = parseInt(key);
            if (key != int) throw new Error("non-numeric key in array update"); // deliberate != instead of !==
            output[int] = update(output[int], upd[key]);
        }

        return output;
    } else if ((typeof view === 'undefined' ? 'undefined' : _typeof(view)) === 'object') {
        var _output = shallowCopyObject(view);

        for (var _key in upd) {
            _output[_key] = update(_output[_key], upd[_key]);
        }

        return _output;
    }

    throw new Error("view not an array or hash");
}