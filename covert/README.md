
# Covert Suite

The Covert Suite is a test framework and test suite that allows to test
and verify that the peer-to-peer network services implemented on either
side are working as expected.

The idea is that it can be used to understand the different states that
all its data can have, and that it can be used as a reference point for
future Peer Client implementations.

By default, it uses the node.js [Client.mjs](../stealth/source/Client.mjs),
so no external libraries and no external programs are necessary.


## Requirements

Currently, Covert runs officially only on Arch Linux, though it might be
possible to run it on MacOS Mojave and later, too.

In order to simulate end-to-end throttled peer-to-peer Networking correctly,
Covert requires these external packages on minimalistic Unix/Linux systems:

```bash
# Install necessary packages
pacman -S --needed iproute2 kmod net-tools sudo
```

Additionally, the following ports have to be allowed in the Firewall to
transmit and receive of both UDP/TCP data:

- `80` (`--internet=true`) for [stealth/protocol/HTTP](../stealth/review/protocol/HTTP.mjs) and [stealth/protocol/WS](../stealth/review/protocol/WS.mjs).
- `443` (`--internet=true`) for [stealth/protocol/HTTPS](../stealth/review/protocol/HTTPS.mjs) and [stealth/protocol/WSS](../stealth/review/protocol/WSS.mjs).
- `13337` (`--internet=true`) for [stealth/protocol/HTTP](../stealth/review/protocol/HTTP.mjs) and [stealth/protocol/WS](../stealth/review/protocol/WS.mjs).
- `65432` for [stealth/Client](../stealth/review/Client.mjs) and [stealth/Server](../stealth/review/Server.mjs).


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

node ./covert.mjs stealth/Client;       # Execute Stealth's review/Client.mjs
node ./covert.mjs stealth/client*;      # Execute Stealth's reviews starting with "client"
node ./covert.mjs *Cache;               # Execute all reviews ending with "Cache"
node ./covert.mjs stealth/client*Cache; # Execute Stealth's reviews starting with "client" and ending with "Cache"

node ./covert.mjs --debug=true;     # Execute reviews in debug mode
node ./covert.mjs --internet=false; # Execute reviews in offline mode
```


## Quickstart

- Install [node.js](https://nodejs.org/en/download) version `10+`.

```bash
cd /path/to/stealth;

# Show Help
node ./covert/covert.mjs;
```

