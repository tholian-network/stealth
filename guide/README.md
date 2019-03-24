
# Stealth Guide

This Guide is intended as a reference document for both the concept and architecture,
and their documentation of implementations.

The idea is that with this guide developers can implement their own Browser Frontend
(or Client or Peer) that can reuse the Stealth Service and its provided APIs or Data.


# Browser Architecture

The `Browser` inside [/browser/source](../browser/source) is strictly free-of-DOM and
its implementation does not contain any `document` or `window` related code.

The only used Web API is the [WebSocket API](https://developer.mozilla.org/en/docs/Web/API/WebSocket)
inside [Browser Client](../browser/source/Client.mjs) which can be interchanged with the
[Stealth Client](../stealth/source/Client.mjs).

The `Browser UI` inside [/browser/design](../browser/design) receives all data via events,
and does all interaction with the [Browser](../browser/source/Browser.mjs)'s public methods.

The `Browser UI` uses the Web Browser Engine to make the UI interactive, so it uses HTML5,
CSS3 and ES2018 (with respects to DOM APIs and Web APIs) to render itself and make itself
interactive.

This allows to use the [Browser](../browser/source/Browser.mjs) inside a `node.js` only
context, and allows to build a custom Web Scraper that runs only on servers or terminal
environments.


# Browser Requirements

If you want to build a native Browser Engine, these are the current requirements
(that can be seen in the [Browser](../browser) implementation):

- Render `HTML5`, `DOM Level 3` and `CSS3` (to reuse `/browser/design`).
- ECMAScript 2016 (with `<script type="module">` support).
- [WebSocket API](https://developer.mozilla.org/en/docs/Web/API/WebSocket) support.
- [iframe](https://developer.mozilla.org/en/docs/Web/HTML/Element/iframe) support.
- [HTMLIFrameElement](https://developer.mozilla.org/en/docs/Web/API/HTMLIFrameElement) support.
- [document.cookie](https://developer.mozilla.org/en/docs/Web/API/Document/cookie) support
  to transmit `Cookie: session=<id>;path=/stealth` headers for requests to `/stealth/`.
- [window.parent](https://developer.mozilla.org/en/docs/Web/API/Window/parent) support
  to access the `window.browser` property outside the `<iframe>` element that renders the
  Internal Pages.
- (Optionally) Transmission of `tab id` that is prefixed as `/stealth/:<id>:/` and `/stealth/:<id>,[flags]:/`.

**Session/Tab Tracking**

Behind the scenes, the optional Tracking of `tab id`s allows to efficiently schedule
Network Requests based on the current internet connection stability and performance.

The [Session](../stealth/source/Session.mjs) and [Request](../stealth/source/Request.mjs)
reuse open sockets as often as possible to optimize bandwidth usage. For example, `Peer #1`
downloads the `archlinux.iso` file and it is still being downloaded when `Peer #2` requests
the very same URL.

Now both sockets share the same end-to-end socket and they both receive the payload
simultaneously once it's downloaded. As long as downloads are in-progress, sockets stay
open in the local network.

Additionally, if the server supports `206 Partial Content`, `Content-Range: bytes=<from>-<to>`
and `Range: bytes=<from>-` headers, the same file will be streamed to both Peers while its
being downloaded.

Peers that try to abuse this API will be warned 3 times. They are blocked until the
Stealth instance is restarted.


# Stealth Service and Browser UI

Stealth serves its own Browser UI in order to allow usage via other Web Browsers or as a
Web Proxy. This allows to reuse the Stealth Browser in isolated and locally networked
environments, such as on Smartphones or Tablets and allows them to receive websites
even when no internet connection is available (given that the website was downloaded at
least once before).

- If Peers connect via `HTTP/1.1` with the `Upgrade: websocket` and `Sec-WebSocket-Protocol: stealth` header, they receive a `WS/13` handshake.
- If Peers connect via `WS/13`, they can use peer-to-peer network services.
- Everything inside [/browser](../browser) is served publicly.
- If Clients connect via `HTTP/1.1` to `/`, they receive a redirect to `/browser/index.html`.
- If Clients connect via `HTTP/1.1` to `/favicon.ico`, they receive a redirect to `/browser/favicon.ico`.
- If Clients connect via `HTTP/1.1` to `/browser/*`, they receive the file contents.
- Other Client or Peer connections and requests are immediately closed.

Stealth's API can be accessed via `WS/13` Sockets. The [Stealth API](./services/README.md)
document contains instructions and examples on how to use Stealth's API in practice.


## Peer-to-Peer Services

These services are available as peer-to-peer network services, and can be used directly
or proxied (which means remotely through another middle-man Peer) via `Peer.proxy()`.

- [Cache](./services/Cache.md)
- [Filter](./services/Filter.md)
- [Host](./services/Host.md)
- [Mode](./services/Mode.md)
- [Peer](./services/Peer.md)
- [Redirect](./services/Redirect.md)
- [Session](./services/Session.md)
- [Settings](./services/Settings.md)
- [Stash](./services/Stash.md)

