
# Stealth Browser Guide

This Guide is intended as a reference document for both the concept
and architecture, and their documentation of implementations.

The idea is that with this guide developer's can implement their
own Browser Frontend (or Client) that can reuse the Stealth Service
and its provided APIs or Data.


# Browser Architecture

The `Browser` inside [/browser/source](../browser/source) is strictly
free-of-DOM and its implementation does not contain any `document` or
`window` related code.

The `Browser UI` inside [/browser/design](../browser/design) receives
all data via events, and does all interaction with the [Browser](../browser/source/Browser.mjs)'s
public methods.

The `Browser UI` uses the Web Browser's (meaning another Web Browser
or Web View Client) APIs to make the UI interactive, so it uses HTML5
and CSS3 and ECMAScript Modules to render itself and make itself
interactive.

This allows to flexibly use the [Browser](../browser/source/Browser.mjs)
inside a `node.js` only context, and allows to scrape websites
automatically using an easy automateable and programmable API on server
environments or terminal-only environments.


# Browser Requirements

If you want to build a native Browser UI, these are the current requirements
(that can be looked at in the [/browser](../browser) implementation):

- Render `HTML5` and `CSS3` (if you want to reuse `/browser/index.html`).
- Either of `WebSocket` or `XMLHttpRequest` or `fetch` to send and receive `JSON` to peer-to-peer services.
- Something like an `<iframe>` or `<webview>` to make requests to `/stealth/<url>` and render the returned HTML and CSS.
- (Optionally) Transmission of a `Cookie: peer=<peer id>` header to `/stealth` to relate requests of "which peer was requesting what".
- (Optionally) Transmission of the `tab id` that is prefixed to `/stealth/tab:<tab id>/https://example.com` to relate requests of "which tab was requesting what".

Behind the scenes, the optional tracking allows the automatic efficient
scheduling part of network requests and the mapping of requests to tabs,
which is necessary for the [Request Service](./services/peer-to-peer/Request.md).

The scheduler then uses sockets as efficiently as possible. For example,
if `peer 1` downloads a large `zip` file and it is still being downloaded,
`peer 2` can receive the same file once it's ready. Additionally, if peers
can stream files via HTTP `Content-Range`, both peers will receive it in
parallel while it's being downloaded.

Note that the tracking of peers and tabs is per-session, and a session
is deleted directly after the peer has disconnected. The tracking data
is not accessible to any other peer than themselves.

Peers doing illegal requests (trying to access foreign Peer's history
or request data) will be blocked until the Stealth Instance is restarted.


# Stealth Architecture

The `Stealth` instance serves its own User Interface, in order to allow
usage via other Web Browsers.

- If peers connect via `WS/13`, they can use every peer-to-peer service.
- If peers connect via `HTTP/1.1` and to `/api`, they can use every peer-to-peer service.
- If browsers connect via `HTTP/1.1` to `/`, they will be redirected to `/browser/index.html`.
- Everything inside [/browser](../browser) is served publicly.

This allows to connect e.g. via Tablet or Smartphone to the Stealth instance
and read articles in offline mode when they were downloaded via a Desktop UI
(or any locally connected peer for that matter) already.


# Stealth Services

The Stealth Instance's API can be accessed via both `HTTP/1.1` and `WS/13`
sockets. HTTP sockets have to do requests to `/api`, otherwise they will
be redirected to the self-served Browser UI.

The [Usage](./services/Usage.md) document contains instructions and examples
on how to use the Stealth Instance's API.


## Peer-to-Peer Services

These services are available peer-to-peer.

- [Cache](./services/peer-to-peer/Cache.md)
- [Filter](./services/peer-to-peer/Filter.md)
- [Host](./services/peer-to-peer/Host.md)
- [Mode](./services/peer-to-peer/Mode.md)
- [Peer](./services/peer-to-peer/Peer.md)
- [Request](./services/peer-to-peer/Request.md)
- [Settings](./services/peer-to-peer/Settings.md)


## Local Services

These services are available only locally.

- [Error](./services/local/Error.md)
- [File](./services/local/File.md)
- [Redirect](./services/local/Redirect.md)

