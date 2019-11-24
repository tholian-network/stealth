
# Roadmap

## X0 (Q2 2019) - Prototype

### Current

- [ ] Implement CSS Properties (shorthands and list in transition-property as guide)

- [ ] Create a Review Process that is executed _inside_ multiple Browser instances and
  uses the `Element.query()` method and the Browser API in order to load and execute
  tests. Offer a `Browser.execute()` and `browser.on('execute')` workflow that executes
  a callback in the currently loaded iframe (via the browser/design adapters).

### Session

- [ ] Render `session` result from client service correctly.
- [ ] Implement `stealth/source/server/Session.mjs` service that is used for the sidebar.
- [ ] Implement `stealth/source/client/Session.mjs` (and add it to the `./bin/*.sh` files).
- [ ] Implement `pause` button event handling that should kill all requests that are part of
      the same Tab in the same Session.

### UI

- [ ] Implement Beacon Sidebar (a Dummy View, as it is released with X1).
- [ ] Implement Peer Sidebar.
- [ ] Implement Site Sidebar.
- [ ] `stealth:fix-request` Page (Download Assistant for Peers and the Web Archive).

### Other

- [ ] Implement `browser.download(url)` method (that schedules Requests via `Client`).
- [ ] Optimizer for HTML files.
- [ ] Optimizer for CSS files.
- [ ] Re-Generate Vendor Profile.
- [ ] Clarify whether Win10 crypt32.dll supports `TLS_Method` or really only `SSLv3`.

## X1 (no date) - Optimizers

- [ ] `Content-Disposition` header support for dynamically generated downloads (e.g. `download.php?id=1337`).
- [ ] `Content-Location` header support for redirects.
- [ ] `stealth:search` Page (Search Assistant for in-offline-cache, searx.me and wiby.me).
- [ ] `stealth:cache` Page (Cache Assistant to clear, remove, update cache).
- [ ] `Site Optimizers` to allow selecting DOM/HTML via whitelist-based selectors.
- [ ] `Image Optimizers` to compress images on-disk-cache (`optipng`, `libjpeg-turbo`, `convert` from `bmp` to `jpeg`).
- [ ] `Video Optimizers` to compress videos on-disk-cache (convert to `mp4` or `mkv`).

## X2 (no date) - Adapters

- [ ] `stealth:media` Media Player for easier media playback (image, audio, video).
- [ ] Site Adapters to allow automatic URL fetches and rewrites.
- [ ] Site Scrapers to allow scheduled downloads and requests.

## X4 (no date) - Browser Engine

- [ ] Decide on a Web Browser Engine, fork it and reduce its featureset to remove non-essential features (like `WebRTC`, `Web Forms` etc.).

