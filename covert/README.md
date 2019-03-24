
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

Covert does not offer command-line flags. However, if a second parameter
is given, it can be used to filter the Reviews; which can come in handy
when debugging a single or multiple Reviews:

```bash
./bin/covert.sh Client;  # Execute review/Client.mjs
./bin/covert.sh client*; # Execute review/client/*.mjs
./bin/covert.sh *Cache;  # Execute review/**/Cache.mjs
```


## Quickstart

- Install [node.js](https://nodejs.org/en/download) version `10+`.

```bash
cd /path/to/stealth;

bash ./bin/covert.sh;
```


## Requirements

As Covert also includes peer-to-peer tests for end-to-end network services,
it requires a machine to be reachable under at least two different IPs.

As the only failsafe way to do this (without requiring a network card or
WAN/LAN connection), there's the requirement to reach the local machine
via the IPs `127.0.0.1` and `127.0.0.2`.

On some systems you may have to create an alias for the loopback interface:

```bash
# Required only on MacOS
sudo ifconfig lo0 alias 127.0.0.2 up;

cd /path/to/stealth;
bash ./bin/covert.sh;
```


## Implementation Notes

- Reviews can have a single `before()` entry for preparation.
- Reviews can have a single `after()` entry for cleanup.
- Reviews can have multiple stateless `describe()` entries.
- Reviews need to `export default` via `finish()` to ensure `ESM` compatibility.
- `assert()` calls have to be in a separate line.
- `assert()` calls have to be branch-less, surrounding `if/elseif/else` conditions are not allowed.

