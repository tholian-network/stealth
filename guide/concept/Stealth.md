
# Stealth Guide

The Usage is documented in the Stealth Service's [README.md](/stealth/README.md) file.


## Architecture

The `Browser` inside [/stealth/source](/stealth/source) is strictly free-of-DOM and
its implementation does not contain any `document` or `window` related code.

This allows to script the `Browser` headlessly in `node.js` and to allow Stealth
Services to connect peer-to-peer to other Stealth Services running headlessly.

As the `Browser` itself only transfers commands via web sockets (WS13) to a Stealth
instance, it can also be used without the [Browser UI](/browser/design).

The Stealth Service is a standalone Browser, Scraper and Proxy that runs in `node.js`
version `12+`. This is the only requirement, as Stealth has zero external dependencies.


## Execution Process

The [stealth/make.mjs](/stealth/make.mjs) script builds the [Base](/base) Library and
the [Browser](/browser) before the Stealth Service is built.

This guarantees that the Browser UI available at `http://localhost:65432` is correctly
built and available if a Browser Engine, Webview or other Web Browser connects to the
Stealth Service.

On both **GNU/Linux** and **MacOS**, `node.js` version `12+` is required.


## Stealth Service

Stealth serves its own Browser UI in order to allow usage via other Web Browsers
or as a Web Proxy. This allows to use Stealth in an air-gapped environment or as
a local Web Archive, so that e.g. Smartphone or Tablets can browse and receive
websites that are already cached.

Any Stealth Service is running always on port `65432` for simplicity reasons.

- If Peers connect via `HTTP/1.1` with the `Upgrade: websocket` and `Sec-WebSocket-Protocol: stealth` header, they receive a `WS/13` handshake.
- If Peers connect via `WS/13`, they can use peer-to-peer network services.

In case of an HTTP request:

- Everything inside [/browser](/browser) is served publicly.
- If Clients connect via `HTTP/1.1` to `/`, they receive a redirect to `/browser/index.html`.
- If Clients connect via `HTTP/1.1` to `/favicon.ico`, they receive a redirect to `/browser/design/other/favicon.ico`.
- If Clients connect via `HTTP/1.1` to `/browser/*`, they receive the file contents.
- Other Client or Peer connections and requests are immediately closed.

Stealth's API can be accessed via `WS/13` Sockets. The [Stealth API](../services/README.md)
document contains instructions and examples on how to use Stealth's API in practice.


## Session/Tab History

The History integration for Sessions and Tabs is optional. The tracking of active Tabs
and its contents is realized by transmitting a `tab id` as a prefix in every URL that
is requested by the `iframe` or `webview` element.

Requests without History integration look like this:
`/stealth/https://example.com/index.html`

Requests with History integration look like this:
`/stealth/:<tab id>,[...flags]:/https://example.com/index.html`

The following request flags are implemented and influence the behaviour of error handling
and redirects:

- `proxy` indicates the request is done by a client that uses Stealth as a proxy.
- `webview` indicates the request is done by an `iframe` or `webview`.
- `refresh` indicates the request's contents should be refreshed.


## Peer Streaming

Behind the scenes, the optional History integration allows to efficiently schedule
Network Requests based on the current internet connection stability and performance.

The [Session](/stealth/source/Session.mjs) and [Request](/stealth/source/Request.mjs)
reuse open sockets as often as possible to optimize bandwidth usage.

In the example scenario, `Peer #1` downloads the `archlinux.iso` file and it is still
being downloaded by the Stealth Service when `Peer #2` requests the very same URL.

Now both sockets share the same end-to-end socket and they both receive the payload
simultaneously once it's downloaded. As long as downloads are in-progress, sockets
stay open in the local network.

Additionally, if the server supports the `206 Partial Content` and
`Content-Range: bytes=<from>-<to>` and `Range: bytes=<from>-` headers, the same
file will be streamed to both Peers in parallel while its being downloaded.

Peers that try to abuse this API will receive a warning 3 times. Peers that further
violate/abuse this API will be blocked until the Stealth Service is restarted.


## Network Communication

All network services are peer-to-peer and allow multiple Peers per Stealth Service.
They can either be used in direct connections (e.g. a Web Browser pointing to
`http://localhost:65432`) or through a middle-man Peer via the `Peer.proxy()` API.

This allows Peers without direct internet access to browse the Web via middle-man
Peers that have internet access. As long as one Peer has internet access, all trusted
Peers that are listed in the [Settings Page](/browser/internal/settings.html) have
internet access, too.


These are the available Peer-to-Peer network services that can be used with the
[Browser Client](/browser/source/Client.mjs) or the [Stealth Client](/stealth/source/Client.mjs):

- [Beacon](/stealth/source/client/Beacon.mjs)
- [Blocker](/stealth/source/client/Blocker.mjs)
- [Cache](/stealth/source/client/Cache.mjs)
- [Host](/stealth/source/client/Host.mjs)
- [Mode](/stealth/source/client/Mode.mjs)
- [Peer](/stealth/source/client/Peer.mjs)
- [Policy](/stealth/source/client/Policy.mjs)
- [Redirect](/stealth/source/client/Redirect.mjs)
- [Session](/stealth/source/client/Session.mjs)
- [Settings](/stealth/source/client/Settings.mjs)

