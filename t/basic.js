"use strict";

var update = require("../dist/update").default;
var clone = require('clone');


function apply_update(test, desc, input, update_v, expected) {
  var orig = clone(input);

  var output;

  try {
    output = update(input, update_v);
  } catch (err) {
    console.error("Caught exception in apply_update:", err);
    throw(err);
  }

  test.deepEqual(output, expected, "update applied correctly: " + desc);
  test.ok(input != output, "new structure created: " + desc);
  test.deepEqual(input, orig, "original not modified: " + desc);
}

function apply_update_unchanged(test, desc, input, update_v) {
  var orig = clone(input);

  var output;

  try {
    output = update(input, update_v);
  } catch (err) {
    console.error("Caught exception in apply_update_unchanged:", err);
    throw(err);
  }

  test.deepEqual(output, orig, "update applied correctly (no change): " + desc);
  test.ok(input === output, "shallow equality retained: " + desc);
}


exports.testUpdate = function(test){

// set

apply_update(test,
  "simple set",
  {},
  { a: { $set: 1} },
  { a: 1 }
);

apply_update_unchanged(test,
  "no-op",
  { a: 1 },
  {},
  { a: 1 }
);

apply_update(test,
  "nested set",
  { a: { b: 1 }, c: 2 },
  { a: { b: { '$set': 5 } } },
  { a: { b: 5 }, c: 2 }
);

apply_update(test,
  "set, auto-vivify",
  { c: 2 },
  { a: { b: { '$set': 5 } } },
  { a: { b: 5 }, c: 2 }
);

apply_update(test,
  "set array",
  { a: [ 0, ], },
  { a: { 0: { '$set': 9 } } },
  { a: [ 9 ] }
);

apply_update(test,
  "set array, new index",
  { a: [ 0, ], },
  { a: { 1: { '$set': 9 } } },
  { a: [ 0, 9 ] }
);

apply_update(test,
  "set array, new index leaving gap",
  { a: [ 0, ], },
  { a: { 4: { '$set': 9 } } },
  { a: [ 0,,,,9 ] }
);

{
  let input = { items: [ "a", "b" ] };
  input.items.top = 0;

  let output = { items: [ "a", "c" ] };
  output.items.top = 0;

  apply_update(test,
    "set array, non-numeric keys are preserved",
    input,
    { items: { 1: { '$set': "c" } } },
    output
  );
}

apply_update(test,
  "set key to undefined",
  { a: { y: 1 } },
  { a: { x: { '$set': undefined } } },
  { a: { x: undefined, y: 1 } }
);

apply_update(test,
  "set key to null",
  { a: { y: 1 } },
  { a: { x: { '$set': null } } },
  { a: { x: null, y: 1 } }
);

apply_update_unchanged(test,
  "set key to undefined, was already undefined",
  { a: { y: 1, x: undefined } },
  { a: { x: { '$set': undefined } } }
);

apply_update_unchanged(test,
  "set key to null, was already null",
  { a: { y: 1, x: null } },
  { a: { x: { '$set': null } } }
);

apply_update(test,
  "editing an update with update",
  { a: { $set: 1 } },
  { a: { $$set: { $set: 2 } } },
  { a: { $set: 2 } }
);

apply_update(test,
  "editing an update with update, nested key",
  { a: { $set: { b: 1 } } },
  { a: { $$set: { b: { $set: 2 } } } },
  { a: { $set: { b: 2 } } }
);

// unset

apply_update(test,
  "unset",
  { a: { b: 1, z: 2 }, c: 2 },
  { a: { '$unset': 'b' } },
  { a: { z: 2 }, c: 2 }
);

apply_update(test,
  "unset multiple keys",
  { a: { b: 1, z: 2, x: 3, y: 4 }, c: 2 },
  { a: { '$unset': ['b', 'z', 'y'] } },
  { a: { x: 3 }, c: 2 }
);

apply_update(test,
  "unset multiple keys, one doesn't exist",
  { a: { b: 1, z: 2, x: 3, y: 4 }, c: 2 },
  { a: { '$unset': ['b', 'q', 'y'] } },
  { a: { z: 2, x: 3 }, c: 2 }
);

apply_update(test,
  "unset auto-vivify",
  {},
  { a: { '$unset': 'b' } },
  { a: {} }
);

// merge

apply_update(test,
  "merge",
  { a: 1, b: 2 },
  { '$merge': { c: 3, d: { e: 4 } } },
  { a: 1, b: 2, c: 3, d: { e: 4 } }
);

apply_update(test,
  "merge overwrites",
  { a: 1, b: 2, c: 9 },
  { '$merge': { c: 3, d: { e: 4 } } },
  { a: 1, b: 2, c: 3, d: { e: 4 } }
);

apply_update(test,
  "merge auto-vivify",
  { a: 1, b: 2 },
  { q: { $merge: { b: 3, c: 4 } } },
  { a: 1, b: 2, q: { b: 3, c: 4 } }
);

apply_update(test,
  "merge undefined",
  { a: 1, b: 2 },
  { '$merge': { c: undefined } },
  { a: 1, b: 2, c: undefined }
);

// push

apply_update(test,
  "push",
  { a: [ 0, ], },
  { a: { '$push': [ 1, 2 ] } },
  { a: [ 0, 1, 2 ] }
);

apply_update(test,
  "push auto-vivify",
  {},
  { a: { '$push': [ 1, 2 ] } },
  { a: [ 1, 2 ] }
);

apply_update(test,
  "push auto-vivify null",
  { a: { b: null } },
  { a: { b: { '$push': [ 1, 2 ] } } },
  { a: { b: [ 1, 2 ] } }
);

{
  let input = { items: [ "a", "b" ] };
  input.items.top = 0;

  let output = { items: [ "a", "b", "c" ] };
  output.items.top = 0;

  apply_update(test,
    "push, non-numeric keys are preserved",
    input,
    { items: { '$push': ["c"] } },
    output
  );
}

// unshift

apply_update(test,
  "unshift",
  { a: [ 0 ] },
  { a: { '$unshift': [ 1, 2 ] } },
  { a: [ 1, 2, 0 ] }
);

apply_update(test,
  "unshift auto-vivify",
  {},
  { a: { '$unshift': [ 1, 2 ] } },
  { a: [ 1, 2 ] }
);

{
  let input = { items: [ "a", "b" ] };
  input.items.top = 0;

  let output = { items: [ "c", "a", "b" ] };
  output.items.top = 0;

  apply_update(test,
    "unshift, non-numeric keys are preserved",
    input,
    { items: { '$unshift': ["c"] } },
    output
  );
}

// splice

apply_update(test,
  "splice add",
  { a: [ 0, 1 ], },
  { a: { '$splice': [ [ 1, 0, 8, 9 ] ] } },
  { a: [ 0, 8, 9, 1 ] }
);

apply_update(test,
  "splice del",
  { a: [ 0, 1, 2 ] },
  { a: { '$splice': [ [ 1, 1, 8, 9 ] ] } },
  { a: [ 0, 8, 9, 2 ] }
);

apply_update(test,
  "splice multi",
  { a: [ 0, 1, 2 ] },
  { a: { '$splice': [ [ 1, 1, 8, 9 ], [ 0, 2, 6, {a: 1} ] ] } },
  { a: [ 6, { a: 1 }, 9, 2 ] }
);

apply_update(test,
  "splice auto-vivify",
  {},
  { a: { '$splice': [ [ 0, 0, 8, 9 ] ] } },
  { a: [ 8, 9 ] }
);

// apply

apply_update(test,
  "apply",
  { a: { b: 3, z: 2 }, c: 2 },
  { a: { b: { '$apply': function(val) { return val * 2 } } } },
  { a: { b: 6, z: 2 }, c: 2 }
);

apply_update(test,
  "apply, auto-vivify",
  { c: 2 },
  { a: { b: { '$apply': function(val) { test.deepEqual(val, undefined, "$apply value not autovified as undefined"); return 5 } } } },
  { a: { b: 5 }, c: 2 }
);

apply_update(test,
  "apply, auto-vivify null",
  { a: { b: null }, c: 2 },
  { a: { b: { '$apply': function(val) { test.deepEqual(val, null, "$apply value not null as expected"); return 5 } } } },
  { a: { b: 5 }, c: 2 }
);

apply_update(test,
  "apply array",
  { a: [ 2 ] },
  { a: { 0: { '$apply': function(val) { return val * 2 } } } },
  { a: [ 4 ] }
);

// Retain shallow equality

apply_update_unchanged(test,
  "simple set, no update",
  { a: 1 },
  { a: { $set: 1} }
);

apply_update_unchanged(test,
  "nested set, no update",
  { a: { b: 1 }, c: 2 },
  { a: { b: { '$set': 1 } } }
);

apply_update_unchanged(test,
  "set array, no update",
  { a: [ 9, ], },
  { a: { 0: { '$set': 9 } } }
);

apply_update_unchanged(test,
  "unset but already unset",
  { a: { b: 1 } },
  { a: { '$unset': 'c' } }
);

apply_update_unchanged(test,
  "unset multiple but already unset",
  { a: { b: 1 } },
  { a: { '$unset': ['c', 'd'] } }
);

apply_update_unchanged(test,
  "unset none",
  { a: { b: 1 } },
  { a: { '$unset': [] } }
);

apply_update_unchanged(test,
  "push empty array",
  { a: { b: [1, 2, 3] } },
  { a: { b: { '$push': [] } } }
);

apply_update_unchanged(test,
  "unshift empty array",
  { a: { b: [1, 2, 3] } },
  { a: { b: { '$unshift': [] } } }
);

apply_update_unchanged(test,
  "apply unchanged",
  { a: { b: 0, z: 2 }, c: 2 },
  { a: { b: { '$apply': function(val) { return val * 2 } } } }
);

apply_update_unchanged(test,
  "merge unchanged",
  { a: 1, b: 2 },
  { $merge: { b: 2 } }
);

apply_update_unchanged(test,
  "merge unchanged",
  { a: 1, b: 2 },
  { $merge: {} }
);


// misc

// https://github.com/kolodny/immutability-helper/issues/21

apply_update(test,
  "merge auto-vivfy 2.1",
  { items: {} },
  { items: { 15: { '$merge': { 1: { id: 1, name: 'One' }, 2: { id: 2, name: 'Two'} } } } },
  { items: { 15: { 1: { id: 1, name: 'One' }, 2: { id: 2, name: 'Two'} } } }
);

apply_update(test,
  "merge auto-vivfy 2.2",
  { items: { 15: { 1: { id: 1, name: 'One' }, 2: { id: 2, name: 'Two'} } } },
  { items: { 15: { '$merge': { 3: { id: 3, name: 'Three' } } } } },
  { items: { 15: { 1: { id: 1, name: 'One' }, 2: { id: 2, name: 'Two'}, 3: { id: 3, name: 'Three' } } } }
);


// multi-set

apply_update(test,
  "multiple modifications in a single update",
  { a: { b: 1 } },
  { c: { '$set': 2 }, a: { '$merge': { e: 3 } } },
  { a: { b: 1, e: 3 }, c: 2 }
);

apply_update(test,
  "unset same-level recursion",
  { a: 1 },
  { $unset: 'a', b: { $set: 2 } },
  { b: 2 }
);

apply_update(test,
  "unset same-level recursion 2",
  { a: { b: 1 }, c: [2] },
  { c: { $splice: [ [ 0, 1 ] ] }, $unset: 'a' },
  { c: [], }
);

apply_update(test,
  "unset same-level recursion 3",
  { a: { b: 1 }, c: [2] },
  { c: { $set: 'dog' }, $unset: 'a' },
  { c: 'dog', }
);

apply_update(test,
  "unset same-level recursion 4",
  { a: { b: 1 }, c: [2] },
  { a: { $unset: 'b' }, $unset: 'c' },
  { a: {}, }
);

apply_update(test,
  "merge same-level recursion",
  { a: 1, b: 2, c: 9 },
  { '$merge': { c: 3, d: { e: 4 } }, test: { $set: 123 } },
  { a: 1, b: 2, c: 3, d: { e: 4 }, test: 123 }
);

apply_update(test,
  "merge and unset same-level recursion",
  { a: 1, b: 2, c: 9 },
  { '$merge': { c: 3, d: { e: 4 } }, test: { $set: 123 }, $unset: 'a', },
  { b: 2, c: 3, d: { e: 4 }, test: 123 }
);

apply_update(test,
  "unset with auto-vivify at same-level of recursion",
  { a: 1 },
  { $unset: 'a', b: { c: { $set: 2 } } },
  { b: { c: 2 } }
);


    test.done();
};
