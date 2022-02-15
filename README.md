
# Tholian® Stealth - Secure, Peer-to-Peer, Private and Automatable Web Browser/Scraper/Proxy

Tholian® Stealth is the automateable Web Browser for the Web of Truth and Knowledge.

Its design goals are increased Privacy, increased Automation, adaptive Semantic
Understanding and efficient Bandwidth Usage, no matter the cost.

Stealth empowers its Users, not Website Developers that could (,will ,and did) abuse
technologies to compromise the freedom and rights of Web Browser End-Users.


## Implemented Features

Stealth is both a Web Scraper, Web Service and Web Proxy that can serve its own
User Interface ("Browser UI") that is implemented using Web Technologies.

- It is secure by default, without compromise. It only supports `DNS via HTTPS`,
  and uses explicitly `https://` first, and falls back to `http://` only when
  necessary and only when the website was not MITM-ed.

- It is peer-to-peer and all its features can be reused by standardized network
  protocols in order to share resources and reduce bandwidth everywhere. It can
  be used as a `SOCKS Proxy`, as an adblocking `DNS Proxy`, and even as a peer-to-peer
  `DNS Resolver` or as a peer-to-peer `HTTP/S Proxy` that acts as a transparent
  reverse caching proxy for its networked external clients.

- It always prioritizes efficient bandwidth use and optimizes for sharing local
  resources with Trusted Peers. Sites continue to be readable, even when being
  completely offline.

- It is multicast [DNS-based Service Discovery](https://dns-sd.org) compatible,
  so it's able to discover other (local) Peers without any centralized network
  service which could be potentially blocked and/or compromised.

- It uses `Blockers` that is on feature-parity with AdBlock Plus, AdGuard, Pi-Hole,
  uBlock Origin and uMatrix (in the sense of "all of the above").

- It uses `Optimizers` to render only the good parts of HTML and CSS. These ensure that
  no Client or Peer ever receives any malicious or unwanted content. All Optimizers are
  applied across all `Site Modes`, and the `Site Modes` decide what content or media is
  included.

- It uses `Site Modes` that decide what to load, with incrementally allowed features
  (or media types). By default, Stealth will load nothing. The Site Mode next to the
  address bar decides what is being loaded.

- It uses `Site Beacons` that label data on a Site for automated extraction purposes
  which help to train Stealth to understand similar Sites on the Web more easily.
  This is similar to the "Reader Mode" in other Browsers, but allows integrations with
  third-party databases and both exports/imports from/to third-party software in an
  automated manner.

- It never requests anything unnecessary. The cache is persistent and time sensitive
  until the user tells it to `refresh` the Site manually or the manually configured
  Internet History lifetime has expired.

- It uses trust-based `Peers` to share the local cache. Peers can receive, interchange,
  and synchronize their downloaded contents. This is especially helpful in rural areas,
  where internet bandwidth is sparse; and redundant downloads can be saved.

- It can act as a Content-Auditing and Content-Filtering Web Proxy for other Web Browsers,
  which allows corporate-like setups with a shared peer-to-peer Cache and a local Archive
  of the Web. Simply point your SOCKS4/5 or HTTP/S client to `http://stealth-service:65432/proxy.pac`.

- It offers intelligent solutions for Error scenarios. In case a Site is not available
  anymore, the `stealth:fix-request` Page allows to download the Site automagically from
  trusted Peers or from the [Web Archive](https://web.archive.org).

- This ain't your Mama's Web Browser. It completely disables ECMAScript in order to improve
  Privacy. Stealth also does not support any Web API that could potentially send data to
  malicious Sites.

- Stealth can be scripted as a Web Scraper inside `node.js`. The [Browser](./browser/source)
  is completely headless, so every single interaction that the [Browser UI](./browser/design)
  reflects can be implemented in a programmable manner, even remotely through trusted Peers
  using Stealth's peer-to-peer network services.


## Upcoming Features

- Stealth will receive an easy-to-follow Wizard for synchronizing cached content with other
  Peers in a Wi-Fi / Meshnet setup, so that users can easily select which Sites to backup
  and synchronize to other Peers.

- Stealth in combination with a connected Radar instance will allow to discover global Peers,
  and will allow to share and reuse `Beacons` and `Echoes` that help to automate even more
  tasks on the Web.

- Stealth will allow peer-to-peer TLS encryption by using intermediary certificates which are
  shipped with each release and allow to download cached content in a trustless manner by
  implementing a TLS-based notary mechanism for signing and validating the correctness of
  content (additionally to the encrypted transport layer).


## Quickstart

If you don't wanna deal with the native build toolchain, this
is how to get started as quickly as possible:

- Install [node.js](https://nodejs.org/en/download) latest (minimum version `12`).
- Install [Ungoogled Chromium](https://github.com/Eloston/ungoogled-chromium/releases) latest (minimum version `70`).
- (Only MacOS) Alternatively Install `Safari` latest (minimum version `12`).
- (Only Linux) Alternatively Install `electron` latest (minimum version `8`).
- (Only Linux) Alternatively Install `gjs` and `WebKit2 GTK` latest (minimum version `4`).

```bash
git clone https://github.com/tholian-network/stealth.git;

# Make everything
node ./make.mjs;

# Start Stealth Service (optional debug flag)
node ./stealth/stealth.mjs serve --debug=true;

# Open as Progressive Web App
node ./browser/browser.mjs;

# Alternatively open Stealth's Browser UI in a Web Browser
# gio open "http://localhost:65432"
```

**IMPORTANT**: On mobile phones, Stealth can be used as a Web App by visiting the URL and
adding it to the Home Screen. It will behave like an offline-ready App, and allow to visit
downloaded Sites from the Cache; given that the Stealth Service is reachable via Wi-Fi or LAN
from your mobile phone.


## Releases

At this point in Development, Stealth is implemented as a headless node.js Browser/Scraper/Proxy
which serves its own HTML5-based User Interface.

At a later point in time, Stealth will be released as a bundle of a node.js fork and with a WebKit
fork called [RetroKit](https://github.com/tholian-network/retrokit.git).

As Stealth is implemented in node.js, RetroKit only functions as a WebView for rendering, and its
purpose is to be a WebView with a reduced attack surface, so it removes a lot of APIs that could
otherwise be used for tracking and exploitation.

As of today, it is heavily recommended to use [Ungoogled Chromium](https://ungoogled-software.github.io)
as a Webview if you want to run Stealth via [browser/browser.mjs](/browser/browser.mjs).

(Links will be inserted here once the Stealth releases are ready for the public)


## Stealth Guide (for Hackers?)

The [Guide](/guide/README.md) is currently meant for Developers that are new to the Project.
It explains all necessary topics to quickly get started to hack around with Stealth and modify
it to fit your needs.

A User's Guide probably will arrive at a later point in time, as Stealth currently has no
public release yet.


## Community

There's a Telegram Chat available where most technical discussions happen.
You can join it via [t.me/tholian_beta](https://t.me/tholian_beta) or search for `Tholian Beta`.


## Roadmap

The current roadmap is reflected by unimplemented [/issues](./issues) in this
GitHub repository.

A high-level overview is available at our Website's [Roadmap](https://tholian.network/roadmap.html),
which also lists other projects that will be built in order to integrate Stealth
with larger featuresets.

As this project in its current form is highly experimental software, those features
can change very rapidly; and lead to at least partial refactors of the codebase as
well.

If you have Problems, Suggestions or Ideas that would fit into Stealth, please open
up an Issue and we'll be happy to talk about it :)


## License

Private Usage of [Stealth](/stealth), including its [Browser](/browser) and the
[Covert Testsuite](/covert) is licensed under [GNU GPL 3](./LICENSE_GPL3.txt).

Commercial Usage of [Stealth](/stealth), including its [Browser](/browser) and the
[Covert Testsuite](/covert) is only allowed under under a custom available license.

If you want to commercially use the technology behind Stealth, please contact us on
[https://tholian.network](https://tholian.network) for a license.

`(c) 2019-2021 Tholian(r) Network`

