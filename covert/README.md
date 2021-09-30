
# Covert Suite

The Covert Suite is a test framework and test runner that allows to test
and verify implementations of peer-to-peer network services, and the
simulation of network behaviours (2G, 3G, 4G).

The idea of its concept is that it can help Developers understand their
code, and that Reviews can be executed multiple times in a stateless
manner; even in parallel while fixing bugs in an implementation.

All Reviews have been implemented and maintained in a manner so that they
can be used as a reference point for future third-party clients.

By default, it uses the [stealth/Client](../stealth/source/Client.mjs)
which is written for node.js, so no external libraries and no external
programs are necessary.


## Requirements

Currently, Covert runs officially only on Arch Linux, though it might be
possible to run it on MacOS Mojave and later, too.

In order to simulate end-to-end throttled peer-to-peer Networking correctly,
Covert requires these external packages on minimalistic Unix/Linux systems:

```bash
# Install necessary packages
pacman -S --needed iproute2 kmod net-tools sudo tcpdump
```

Additionally, the following ports have to be allowed in the Firewall to
transmit and receive of both UDP/TCP data:

- `80` (`--internet=true`) for [stealth/connection/HTTP](../stealth/review/connection/HTTP.mjs) and [stealth/connection/WS](../stealth/review/connection/WS.mjs).
- `443` (`--internet=true`) for [stealth/connection/HTTPS](../stealth/review/connection/HTTPS.mjs) and [stealth/connection/WSS](../stealth/review/connection/WSS.mjs).
- `13337` (`--internet=true`) for [stealth/connection/HTTP](../stealth/review/connection/HTTP.mjs) and [stealth/connection/WS](../stealth/review/connection/WS.mjs).
- `65432` for [stealth/Client](../stealth/review/Client.mjs) and [stealth/Server](../stealth/review/Server.mjs).


## Quickstart

- Install [node.js](https://nodejs.org/en/download) latest (minimum version `12`).

```bash
cd /path/to/stealth;

# Build Stealth and Covert
node ./covert/make.mjs;

# Show Help
node ./covert/covert.mjs;
```


## ECMAScript Usage

The Covert Library exports a `default` export that contains a namespaced
`Object`. Due to otherwise conflicting names, there are no separately
named exports available.

```javascript
// Import Covert Library
import covert from './covert/index.mjs';
```


## NPM Usage

```javascript
// Import Covert Library
import covert from 'stealth/covert';
```

