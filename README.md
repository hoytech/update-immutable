# update-immutable

[![Build Status](https://travis-ci.org/hoytech/update-immutable.svg?branch=master)](https://travis-ci.org/hoytech/update-immutable)


## Description

This is a mostly-compatible re-implementation of [react's update function](https://facebook.github.io/react/docs/update.html).

`update()` implements a mini-language that describes modifications to a data-structure consisting of nested objects and arrays. The updates can be applied to a data-structure without modifying it. Instead, a new data-structure is returned that has had the updates applied. The two structures share as much as possible. Only the intermediate structures that needed to be modified are shallow-copied prior to modification. Everything else is preserved and is therefore shared between the two structures.

In react this is useful for implementing an efficient [shouldComponentUpdate()](https://facebook.github.io/react/docs/react-component.html#shouldcomponentupdate), for example by sub-classing [React.PureComponent](https://facebook.github.io/react/docs/react-api.html#react.purecomponent). For more details, see this page on [optimizing react performance](https://facebook.github.io/react/docs/optimizing-performance.html#shouldcomponentupdate-in-action).

However, this module is independent of react, and is also suitable for passing updates between clients and servers so that a consistent data-structure can be maintained on both ends of a connection without transferring the entire structure on every modification. When used for both react component state updates and server-client communication, systems can be designed where server-side events directly cause modification of react components.


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


## Command reference

* `$set`: Sets a value in an object, replacing the previous value (if any). Example:

        update({}, { a: { $set: 1 } })
        => { a: 1 }

* `$unset`: Unsets the provided key or keys. Example:

        update({ a: 1, b: 2 }, { $unset: 'a' })
        => { b: 2 }

        update({ a: 1, b: 2 }, { $unset: ['a', 'b'] })
        => {}

* `$merge`: Does a shallow merge, replacing the previous values (if any). Example:

        update({ a: 1, b: 2 }, { $merge: { a: 3, c: 4 } })
        => { a: 3, b: 2, c: 4 }

    Note: This is a shallow merge only and will fully replace the values with the new values. For example, you may expect that both `b` and `c` keys will exist in the following output:

        update({ a: { b: 1 } }, { $merge: { a: { c: 1 } } })
        => { a: { c: 1 } }

    But in this case, the object containing `b` is fully replaced. There are various ways to solve this, such as using one of the many deep merging modules on npm. Here is an example using [deepmerge](https://www.npmjs.com/package/deepmerge):

        var orig = { a: { b: 1 } };
        update(orig, { a: { $set: deepmerge(orig.a, { c: 2 }) } })
        => { a: { b: 1, c: 2 } }

* `$push`: Appends new values to the end of an array. Example:

        update({ a: [1, 2] }, { a: { $push: [3, 4] } })
        => { a: [ 1, 2, 3, 4 ] }

    **NOTE**: The value to push must be an array otherwise you will see the error `update is not an array in push`. This is because `$push` supports pushing multiple elements at once and the value itself could be an array. This goes for `$unshift` too.

* `$unshift`: Prepends new values to the beginning of an array. Example:

        update({ a: [1, 2] }, { a: { $unshift: [3, 4] } })
        => { a: [ 3, 4, 1, 2 ] }

* `$splice`: Calls javascript's [splice](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice) method on the target array. Accepts an array of arrays, each of which are the arguments to a splice call. Example:

        update({ a: [0, 1, 2] }, { a: { $splice: [ [1, 0, 3] ] } })
        => { a: [ 0, 3, 1, 2 ] }

    As well as adding elements, `$splice` is also useful for removing elements:

        update({ a: [0, 1, 2, 3, 4, 5] }, { a: { $splice: [ [2, 2] ] } })
        => { a: [ 0, 1, 4, 5 ] }



## Features

The following new features/bugfixes have been implemented:

* **Simple recursive implementation without dependencies**

  The original version depends on react.

* **Implements `$unset`**

  The react team [refuses to merge](https://github.com/facebook/react/pull/2362/) this functionality. `$unset` is important for several use-cases, for example removing an item from a collection so that it will no longer be present when you iterate over that collection. `$unset` only works for objects, not arrays. Array elements can be deleted with `$splice`.

* **`$unshift` doesn't reverse**

  The react version of `$unshift` unshifts each element in a loop, thereby reversing the portion of the list provided in the update. This version fixes that bug and makes it work like [perl's unshift](http://perldoc.perl.org/functions/unshift.html).

* **Supports autovivification**

  [Autovivification](https://en.wikipedia.org/wiki/Autovivification) allows you to modify a nested data structure even if the nesting data-structures don't yet exist. They will be created so as to satisfy the update. This simplifies many use-cases, for example you don't need to maintain an initial-state skeleton. See below for more details.

* **Operation escaping**

  If you have a key in an object that is a reserved operation key, such as `$set`, and you wish to modify its value or use it as a path in an operation, the react implementation would not work for this. This module implements escaping where you can prefix such keys with an extra `$`. For example:

      > update({ $set: 1 }, { $$set: { $set: 2 } })
      { '$set': 2 }

  This is useful in cases where you would like to use `update` itself to modify updates.


## Autovivification

In the original `update` implementation, if you try to set a value in a nested structure where one of the intermediate keys doesn't exist, an error will be thrown:

    > update({}, {a: {b: {c: {$set: true}}}})
    TypeError: Cannot read property 'b' of undefined

However, in this module it will autovivify the nested structures into existence so as to satisfy the update:

    > update({}, {a: {b: {c: {$set: true}}}})
    { a: { b: { c: true } } }

Nested autovivification will only create objects however, because the update language unfortunately doesn't distinguish between object access and array access. Creating a nested array with autovivification is not supported and will create an object instead:

    > update({}, {a: {0: {c: {$set: true}}}})
    { a: { '0': { c: true } } }

Note however that autovivifying an array into existence with a push (for example) works fine since it's obvious you meant for that key to contain an array:

    > update({}, {a: {b: {c: {$push: [1,2,3]}}}})
    { a: { b: { c: [1, 2, 3] } } }

As of version 1.0.6, this module also autovivifies `null` into existence just as it does `undefined`. This can be useful since setting to `null` is often used instead of deleting an element from a collection.


## Preservation of equality

As of version 1.2.0, this module will attempt to preserve reference equality where possible. In other words, if you make an update that doesn't cause the structure to be modified, the original version of the data structure will be returned, not a shallow copy.

For example, none of the following will result in a copy being returned: using `$set` to modify a primitive value to the same value as it was before, `$push`ing an empty list, `$unset`ting a key that isn't present.

Note that for performance reasons it does not do a deep comparison of your modifications, so it will only detect identity updates to primitives. Also, due to a limitation, `$splice` will always return a shallow copy even if no changes were made (see Todo section below).


## Multiple updates

If you have multiple commands at the same level of an update, `$set` will always take priority and all of the other commands, as well as recursing into other keys, will be ignored.

For arrays, the first command found of `$push`, `$unshift`, or `$splice` will take priority, everything else will be ignored, and it will not recurse into other array indices (this may be fixed in the future).

After checking the above, if `$apply` is found then it will be executed. All other commands will be ignored and it will not recurse into other keys.

However, the `$unset` and `$merge` commands may be combined with each-other and same-level keys will be recursed into. The `$merge` will happen before `$unset` so you may unset keys added by the merge.

For example, here is how you can set one key and remove another in the same update:

    > update({ a: 1 }, { $unset: 'a', b: { $set: 2 } })
    { b: 2 }


## Incompatibilities

This module is mostly compatible with the react version except for the following:

* **`$unshift` behaviour**

  As described above, when passing multiple items in a single `$unshift` update, the order of the items is preserved, unlike react which reverses the list.

* **Operation escaping**

  If you have a key that begins with `$$` and you use this as the path in an operation, one of the `$` signs will be stripped in order to implement operation escaping. If you have such keys, add an extra `$` sign in front of them when porting from the react implementation.


## Server-side

There is a companion perl module [Update::Immutable](https://metacpan.org/pod/Update::Immutable) that implements functionality nearly identical to this module. This lets you process updates in the same way on both the server and the client (provided your server is implemented in perl that is).

If you do plan on performing server-client updates, you should avoid using `$apply` since functions generally cannot be serialised for transfer over the network. `$apply` is useful for react-compatibility and/or purely in-browser updates.


## updatePath

**EXPERIMENTAL FEATURE**: `updatePath` is currently experimental and may be changed or deprecated in the future.

Rather than encode your updates as a nested structure, the `updatePath` function allows you to encode them as a string. The function is used like so:

    var modified = updatePath(original, operation, path, parameter);

* `original`: The structure you wish to update.
* `operation`: A normal `update` command (documented above), **without** the `$` prefix.
* `path`: A string containing a `.`-separated list of, or an array of keys or array indices to recurse into. If keys may contain `.` characters you should not use the string version since there is no way to escape `.`.
* `parameter`: The leaf element in the `update` command.

Example using a string path:

    > updatePath({ a: { b: 1 } }, 'set', 'a.b', 2)
    { a: { b: 2 } }

Example using an array path:

    > updatePath({ a: { b: 1 } }, 'set', ['a', 'b'], 2)
    { a: { b: 2 } }

Note that keys containing `$`, including ones that are special `update` command keys, are supported:

    updatePath({ a: { $set: [2] } }, 'push', 'a.$set', [3])
    { a: { '$set': [ 2, 3 ] } }

One thing to be aware of is that `updatePath` may be less efficient than `update`. Besides the obvious overhead of parsing the path string, making multiple updates in a row with `updatePath` will require multiple recursive traversals of the structure (and multiple shallow copies), whereas a single `update` with multiple commands embedded can amortise this overhead over one call.


## See-also

Please add any bug reports or feature requests to the [update-immutable repo on github](https://github.com/hoytech/update-immutable).

As mentioned, this is a re-implementation of [react's update function](https://facebook.github.io/react/docs/update.html) which is now deprecated (but currently still available [as an add-on](https://www.npmjs.com/package/react-addons-update)).

There is another re-implementation called [immutability-helper](https://www.npmjs.com/package/immutability-helper). It allows you to define custom commands, although currently it doesn't provide autovivification. This module [now supports $unset](https://github.com/kolodny/immutability-helper/issues/18#issuecomment-295322966).

For certain use-cases, [immutable.js](https://facebook.github.io/immutable-js/) may be better than using `update()`, although this does not work for transferring updates between clients and servers (without creating another update protocol on top).

Perl companion module: [Update::Immutable](https://metacpan.org/pod/Update::Immutable)

I did a short talk on this module which you can [watch on YouTube](https://www.youtube.com/watch?v=pWuxwurtALc&t=1293).


## Todo

`$splice` will always shallow-copy the array, even if the splice operations cause no modifications to the array.

Currently combining `$splice`, `$push`, and `$unshift` with each-other or with array indices updates at the same level does not work.


## Copyright

(C) 2016-2017 Doug Hoyte

2-clause BSD license
