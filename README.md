# update-immutable

## Features

This is a re-implementation of [react's update function](https://facebook.github.io/react/docs/update.html) with the following differences:

* **Simple recursive implementation without dependencies**
  The original version depends on react.

* **Implements `$unset`**
  The react team [refuses to merge](https://github.com/facebook/react/pull/2362/) this functionality for some pretty dubious reasons. `$unset` is important for several use-cases.

* **unshift doesn't reverse**
  The react version of `$unshift` unshifts each element in a loop, thereby reversing the provided list. This version fixes that bug and makes it work like [perl's unshift](http://perldoc.perl.org/functions/unshift.html).

* **Supports auto-vivification**
  [Auto-vivification](https://en.wikipedia.org/wiki/Autovivification) allows you to modify a nested data structure even if the nesting data-structures don't yet exist. They will be created so as to satisfy the update. This simplifies many use-cases, for example you don't need to maintain an initial-state skeleton.


## Server-side

There is a companion perl module [Update::Immutable](https://metacpan.org/pod/Update::Immutable) that implements functionality identical to this module. This lets you process updates both server-side and on the client (provided your server is implemented in perl that is).


## Copyright

(C) 2016 Doug Hoyte

2-clause BSD license
