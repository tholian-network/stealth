
# Base Library

The Base Library is a polyfilling abstraction layer that allows to use the
identical code bases among the Web Browser and node.js without having to
integrate a third-party build toolchain or build workflow.

The intention of this library is to have an ECMAScript Modules abstraction
that allows to include otherwise globally defined data types via a single
file.


## Usage

The Base Library is using a simple [base.sh](./bin/base.sh) build script that
generates the [/build](./build) folder. The build script is called by both the
[browser.sh](../browser/bin/browser.sh) and [stealth.sh](../stealth/bin/stealth.sh).

```bash
cd /path/to/base;

# Build the Base Library
bash ./bin/base.sh;

# Afterwards, simply copy/paste the BASE.mjs and use ES6 import syntax
# cp ./build/browser/BASE.mjs ./to/a/browser/project/;
# cp ./build/node/BASE.mjs    ./to/a/node/project/;
```

