
# Base Library

The Base Library is a polyfilling abstraction layer that allows to use the
identical code bases among the Web Browser and node.js without having to
integrate a third-party build toolchain or build workflow.

The intention of this library is to have an ECMAScript Modules abstraction
that allows to include otherwise globally defined data types via a single
file, and allows cross-context and cross-sandbox serialization of data
types, which otherwise wouldn't be possible.

As data type instances in ECMAScript runtimes are instanciated per-sandbox,
this library also includes `is(Datatype)` replacements for `typeof` and
`instanceof`, and it is recommended to use the `[Symbol.toStringTag]` on
the prototype of custom Function Templates to stay compatible.


## Usage

The Base Library is using a simple [make.mjs](./make.mjs) script that
generates the [/build](./build) folder.

The `make.mjs` is called by other build scripts, too:

- [Browser's make.mjs](../browser/make.mjs)
- [Covert's make.mjs](../covert/make.mjs)
- [Stealth's make.mjs](../stealth/make.mjs)


```bash
cd /path/to/stealth;

# Build the Base Library
node ./base/make.mjs;

# Afterwards, simply copy/paste the generated ESM module and use import syntax
# cp ./base/build/browser.mjs ./to/a/browser/project/extern/base.mjs;
# cp ./base/build/node.mjs    ./to/a/node/project/extern/base.mjs;
```


## ECMAScript Usage

The Base Library exports a `default` export that contains an `Object` with
all exports. Additionally, all methods and data types are exported as named
exports.

```javascript
// Import Base Library
import base from './base/index.mjs';

// Import selected named exports
import { console, Emitter, isEmitter } from './base/index.mjs';
```


## NPM Usage

```javascript
// Import Base Library
import base from 'stealth/base';

// Import selected named exports
import { console, Emitter, isEmitter } from 'stealth/base';
```

