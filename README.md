# update-immutable


## Description

This is a mostly-compatible re-implementation of [react's update function](https://facebook.github.io/react/docs/update.html).


## Usage (ES6)

    import update from 'update-immutable';

    let orig = { a: 1 };
    let next = update(orig, { b: { $set: 2 } });

    ## next: { a: 1, b: 2 }
    ## orig: { a: 1 }

## Usage (ES5)

    var update = require("update-immutable").default;

    var orig = { a: 1 };
    var next = update(orig, { b: { $set: 2 } });

    ## next: { a: 1, b: 2 }
    ## orig: { a: 1 }


## Features

The following new features/bugfixes have been implemented:

* **Simple recursive implementation without dependencies**

  The original version depends on react.

* **Implements `$unset`**

  The react team [refuses to merge](https://github.com/facebook/react/pull/2362/) this functionality. `$unset` is important for several use-cases, for example removing an item from a collection. `$unset` only works for objects, not arrays.

* **`$unshift` doesn't reverse**

  The react version of `$unshift` unshifts each element in a loop, thereby reversing the provided list. This version fixes that bug and makes it work like [perl's unshift](http://perldoc.perl.org/functions/unshift.html).

* **Supports autovivification**

  [Autovivification](https://en.wikipedia.org/wiki/Autovivification) allows you to modify a nested data structure even if the nesting data-structures don't yet exist. They will be created so as to satisfy the update. This simplifies many use-cases, for example you don't need to maintain an initial-state skeleton.


## Autovivification

In the original `update` implementation, if you try to set a value in a nested structure where one of the the intermediate keys doesn't exist, an error will be thrown:

    > update({}, {a: {b: {c: {$set: true}}}})
    TypeError: Cannot read property 'b' of undefined

However, in this module it will autovivify the nested structures into existence so as to satisfy the update:

    > update({}, {a: {b: {c: {$set: true}}}})
    { a: { b: { c: true } } }

Nested autovivification will only create objects however, because the update language unfortunately doesn't distinguish between object access and array access. So if creating a nested array with autovivification is not supported:

    > update({}, {a: {0: {c: {$set: true}}}})
    { a: { '0': { c: true } } }

So don't do that. But note that autovivifying an array into existence with a push (for example) works fine since it's obvious you mean that key to be an array:

    > update({}, {a: {b: {c: {$push: [1,2,3]}}}})
    { a: { b: { c: [1, 2, 3] } } }



## Incompatibilities

This module is mostly compatible with the react version except for the following:

* **Doesn't implement `$apply`**

  This module is primarily intended for transferring incremental updates between browsers and server-side web apps. For this use case, `$apply` is not possible since functions cannot be serialised. If there is interest we may eventually implement `$apply` (pull requests welcome).

* **`$unshift` behaviour**

  As described above, when passing multiple items in a single `$unshift` update, the order of the items is preserved, unlike react which reverses the list.


## Server-side

There is a companion perl module [Update::Immutable](https://metacpan.org/pod/Update::Immutable) that implements functionality identical to this module. This lets you process updates in the same way on both the server and the client (provided your server is implemented in perl that is).


## See-also

As mentioned, this is a re-implementation of [react's update function](https://facebook.github.io/react/docs/update.html) which is now deprecated.

There is another re-implementation called [immutability-helper](https://www.npmjs.com/package/immutability-helper).

For certain use-cases, [immutable.js](https://facebook.github.io/immutable-js/) may be better than using `update()`, although this does not work for transferring updates between clients and servers (without creating another update protocol on top).


## Copyright

(C) 2016-2017 Doug Hoyte

2-clause BSD license
