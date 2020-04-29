
# Covert Suite

The Covert Suite is a test framework and test suite that allows to test
and verify that the peer-to-peer network services implemented on either
side are working as expected.

The idea is that it can be used to understand the different states that
all its data can have, and that it can be used as a reference point for
future Peer Client implementations.

By default, it uses the node.js [Client.mjs](../stealth/source/Client.mjs),
so no external libraries and no external programs are necessary.


## Command-Line Flags

- `--debug` is a boolean flag to toggle the `console.clear()` that is
  otherwise called after each Review's test has been processed.
  If set to `true`, it allows explicit debugging in code without loss of
  `process.stdout` data. The default value is `false`.

- `--internet` is a boolean flag to toggle the inclusion of network
  protocol tests against the internet or online reference test suites.
  The default value is `true`.

- `--network` is a string flag to emulate a traffic-controlled internet
  connection. It can be set to either of `1G`, `2G`, `3G` or `4G`.
  The default value is `null`.

- `--timeout` is a string flag to override the timeout in seconds after
  which a waiting test is being skipped automatically.
  The default value is `10s`.

If a non-flag parameter is given, it is assumed to be a Query to filter
the Reviews. This allows to debug a single Review or a Suite of related
Reviews.

```bash
cd /path/to/covert;

./bin/covert.sh stealth/Client;       # Execute Stealth's review/Client.mjs
./bin/covert.sh stealth/client*;      # Execute Stealth's reviews starting with "client"
./bin/covert.sh *Cache;               # Execute all reviews ending with "Cache"
./bin/covert.sh stealth/client*Cache; # Execute Stealth's reviews starting with "client" and ending with "Cache"

./bin/covert.sh --debug=true;     # Execute reviews in debug mode
./bin/covert.sh --internet=false; # Execute reviews in offline mode
```


## Quickstart

- Install [node.js](https://nodejs.org/en/download) version `10+`.

```bash
cd /path/to/stealth;

# Execute and validate all Reviews
bash ./covert/bin/covert.sh;
```


## Requirements

Covert requires a locally installed `SOCKS` proxy that is shipped in the
[socks-proxy](/covert/sketch/socks-proxy) folder and needs to be compiled
before Covert itself can actually run.

Therefore on most systems, `gcc` and `make` are required, unless you've
installed another compatible C compiler.

