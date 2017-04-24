var update = require("../dist/update").default;


function clone(a) {
   return JSON.parse(JSON.stringify(a));
}

function apply_update(test, desc, input, update_v, expected) {
    var orig = clone(input);

    var output = update(input, update_v);

    test.deepEqual(output, expected, "update applied correctly: " + desc);
    test.ok(input != output, "new structure created: " + desc);
    test.deepEqual(input, orig, "original not modified: " + desc);
}


exports.testUpdate = function(test){

// set

apply_update(test,
  "simple set",
  {},
  { a: { $set: 1} },
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

// unset

apply_update(test,
  "unset",
  { a: { b: 1, z: 2 }, c: 2 },
  { a: { '$unset': 'b' } },
  { a: { z: 2 }, c: 2 }
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
  { a: { b: { '$apply': (val) => val * 2} } },
  { a: { b: 6, z: 2 }, c: 2 }
);

apply_update(test,
  "apply, auto-vivify",
  { c: 2 },
  { a: { b: { '$apply': (val) => 5 } } },
  { a: { b: 5 }, c: 2 }
);

apply_update(test,
  "apply array",
  { a: [ 2, ], },
  { a: { 0: { '$apply': (val) => val * 2 } } },
  { a: [ 4 ] }
);


    test.done();
};
