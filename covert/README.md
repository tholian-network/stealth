
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

If a non-flag parameter is given, it is assumed to be a Query to filter
the Reviews. This allows to debug a single Review or a Suite of related
Reviews.

```bash
./bin/covert.sh Client;              # Execute review/Client.mjs
./bin/covert.sh client/Cache#offline # Execute review/client/Cache.mjs and only tests that include "offline"
./bin/covert.sh client*;             # Execute reviews starting with "client"
./bin/covert.sh *Cache;              # Execute reviews ending with "Cache"
./bin/covert.sh client*Cache;        # Execute reviews starting with "client" and ending with "Cache"

./bin/covert.sh --debug=true;     # Execute reviews in debug mode
./bin/covert.sh --internet=false; # Execute reviews in offline mode
```


## Quickstart

- Install [node.js](https://nodejs.org/en/download) version `10+`.

```bash
cd /path/to/stealth;

bash ./bin/covert.sh;
```


## Requirements

Covert requires a locally installed `SOCKS` proxy that is shipped in the
[socks-proxy](/covert/sketch/socks-proxy) folder and needs to be compiled
before Covert itself can actually run.

The requirements are a C-compiler and `make`. If you run `./bin/covert.sh`,
the `socks-proxy` is automatically being compiled and executed in parallel.

```bash
cd /path/to/stealth;
bash ./bin/covert.sh;
```


## Network Requirements

As Covert also includes peer-to-peer tests for end-to-end network services,
it requires a machine to be reachable under at least two different IPs.

If the machine has no internet connection, some network-protocol related
tests will fail, such as `protocol/DNS`, `protocol/HTTPS`, `protocol/HTTP`
or `client/Host`.

As the only failsafe way to do this (without requiring a network card or
WAN/LAN connection), there's the requirement to reach the local machine
via the IPs `127.0.0.1`, `127.0.0.2` and `127.0.0.3`.

**MacOS / Darwin**

On MacOS it is necessary to create an alias for the loopback interface
before Covert itself is run. The `./bin/covert.sh` automatically creates
an alias for above mentioned additional IPs on MacOS and will ask for
your password in order to do so.

Currently there's no way to simulate network connections as there's no
`netem` and neither `tc` available on MacOS.


## Implementation Notes

- Reviews can have a single `before()` entry for preparation.
- Reviews can have a single `after()` entry for cleanup.
- Reviews can have multiple stateless `describe()` entries.
- Reviews need to `export default` via `finish()` to ensure `ESM` compatibility.
- `assert()` calls have to be in a separate line.
- `assert()` calls have to be branch-less, surrounding `if/elseif/else` conditions are not allowed.


## Roadmap - Untested Implementations

These implementations are currently untested and need end-to-end reviews.

- [ ] `review/client/Settings.mjs`

