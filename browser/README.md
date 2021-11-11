
# Stealth Browser

The Stealth Browser is a Browser UI which is implemented using
Web Technologies, so that it is possible to change the Browser
Engine or Web View easily.


## URL-Parameter Flags

- `/browser/index.html?debug=true` is a parameter to toggle
   loading/debugging of the UI by disabling the Service Worker.
   The default value is `false`.


## Quickstart

- Install [node.js](https://nodejs.org/en/download) latest (minimum version `12`).
- Install [Electron](https://www.electronjs.org/releases/stable) latest (minimum version `12`).
- (Alternatively) Install [Ungoogled Chromium](https://github.com/Eloston/ungoogled-chromium/releases) latest (minimum version `70`).

```bash
cd /path/to/stealth;

# Build
node ./stealth/make.mjs;

# Start Stealth Service
node ./stealth/stealth.mjs serve;

# Build
node ./browser/make.mjs;

# Open Progressive Web App
node ./browser/browser.mjs;
```


## Building and Packaging

```bash
cd /path/to/stealth;

# Build
node ./browser/make.mjs /path/to/sandbox;

# Package
node ./browser/make.mjs pack /path/to/sandbox;
```


## ECMAScript Usage

The Browser Library exports a `default` export that contains a namespaced
`Object`. Due to otherwise conflicting names, there are no separately
named exports available.

As the [extern/base.mjs](./extern/base.mjs) file uses the HTML5 Polyfills
variant of the [Base Library](../base), the Browser Library is also only
compatible with HTML5 Environments.

```html
<script type="module">
// Import Browser Library
import browser from './browser/index.mjs';
</script>
```

