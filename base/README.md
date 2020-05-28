
# Base Library

The Base Library is a polyfilling abstraction layer that allows to use the
identical code bases among the Web Browser and node.js without having to
integrate a third-party build toolchain or build workflow.

The intention of this library is to have an ECMAScript Modules abstraction
that allows to include otherwise globally defined data types via a single
file.


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

