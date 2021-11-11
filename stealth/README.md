
# Stealth Service

The Stealth Service is a web daemon that allows to load, parse, filter
and render web sites from both a local cache and the interwebz.

The idea is that the [Browser UI](../browser) is also delivered by
the Stealth Service, so that other platforms (like Android or iOS
tablets and smartphones) can simply access a Stealth instance by
visiting it with any modern Web Browser and to use the Progressive
Web App in fullscreen mode.


## Quickstart

- Install [node.js](https://nodejs.org/en/download) latest (minimum version `12`).

```bash
cd /path/to/stealth;

# Build
node ./stealth/make.mjs;

# Show Help
node ./stealth/stealth.mjs;
```


## Building and Packaging

```bash
cd /path/to/stealth;

# Build
node ./stealth/make.mjs /path/to/sandbox;

# Package
node ./stealth/make.mjs pack /path/to/sandbox;
```


## ECMAScript Usage

The Stealth Library exports a `default` export that contains a namespaced
`Object`. Due to otherwise conflicting names, there are no separately
named exports available.

```javascript
// Import Stealth Library
import stealth from './stealth/index.mjs';
```


## NPM Usage

```javascript
// Import Stealth Library
import stealth from 'stealth/stealth';
```

