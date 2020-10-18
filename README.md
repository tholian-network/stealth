
# Stealth - Secure, Peer-to-Peer, Private and Automatable Web Browser/Scraper/Proxy

Tholian&reg; Stealth is the automateable Web Browser for the Web of Knowledge.

Its design goals are increased Privacy, increased Automation, adaptive Semantic Understanding
and efficient bandwidth usage, no matter the cost.

It is built by a former contributor to both Chromium and Firefox, and is built out of personal
opinion on how Web Browsers should try to understand the Semantic Web.

Stealth empowers its Users, not Website Developers that could (,will ,and did) abuse technologies
to compromise the freedom and rights of Web Browser End-Users.

**Architecture Notes**:

At this point in development, Stealth is implemented as a headless node.js Browser/Scraper/Proxy,
which also serves its own HTML5-based Browser UI and can act as a Web Proxy via SOCKS or HTTP/S.
At a later point in time, Stealth will probably use a forked Browser Engine with a reduced
featureset (e.g. without WebRTC and without WebUSB), but currently it uses a Webview that's
preinstalled on your target system. It is heavily recommended to use [Ungoogled Chromium](https://ungoogled-software.github.io)
here if you run Stealth on a Desktop environment.


## Downloads / Releases

Stealth is currently in the Prototype Stage. Non-Developing Users won't enjoy it much, as things
are quite buggy and incomplete for the moment.

However, due to the concept of using node.js and focussing on a privacy-oriented audience,
Stealth will initially be released for `MacOS` and `GNU/Linux`.

(Download Links will be inserted here once the Stealth Releases are ready for the public)


## Features

Stealth is both a Web Scraper, Web Service and Web Proxy that can serve its own
User Interface ("Browser UI") that is implemented using Web Technologies.

- It is secure by default, without compromise. It only supports `DNS via HTTPS`,
  and uses explicitely `https://` first, and fallsback to `http://` only when
  necessary and only when the website was not MITM-ed.

- It offers intelligent Error Page wizards that guide the user through scenarios
  when things are broken, from no domain resolved to download snapshot via web
  archive.

- It is peer-to-peer and always uses the most efficient way to share resources
  and to reduce bandwidth, which means downloaded websites are readable even
  when being completely offline.

- It uses blacklist-based `Blockers` that is on feature-parity with AdBlock Plus,
  AdGuard, Pi-Hole, uBlock Origin and uMatrix (in the sense of "all of the above").

- It uses `Optimizers` to render only the good parts of HTML and CSS. These Optimizers
  make sure that no Client or Peer ever receives any malicious or unwanted content,
  and it is written on-filesystem-cache (which is shared later to other peers) to
  ensure that particularly. All Optimizers are applied across all `Site Modes`, and
  the `Site Modes` decide what content or media is included.

- It uses whitelist-based `Site Modes` that decide what to load, with incrementally
  allowed features (or media types). By default, Stealth will load nothing. The Site
  Mode next to the address bar decides what is loaded.

- It uses whitelist-based `Site Beacons` that allow specific elements on a Site
  to be extracted as Knowledge - which in return help to train the Browser to understand
  future similar Sites on the web more easily. This can be seen as a learning mechanism
  that is similar to the "Reader Mode" in other Browsers, but whilst delivering the
  cleaned content to all connected Clients and Peers (including Smartphones and Tablets).

- It never requests anything unnecessary. The cache is persistent until the user tells
  it to refresh the Site manually (or a scheduled Download task runs for that URL).

- It uses trust-based `Peers` to share the local cache. Peers can receive, interchange,
  and synchronize their downloaded media. This is especially helpful in rural areas,
  where internet bandwidth is sparse; and redundant downloads can be saved. Just bookmark
  Stealh as a Web App on your Android phone and you have direct access to your downloaded
  wikis, yay!

- It can double-function as a Content-Auditing and Content-Filtering Web Proxy inside
  other Web Browsers, which allows corporate-like setups with a shared peer-to-peer
  Cache and a local Web Archive of the Internet.

- It has intelligent error handling. In case a website is not available anymore, the
  `stealth:fix-request` error page allows to download websites automagically from trusted
  Peers or from the [Web Archive](https://web.archive.org).

- This ain't your Mama's Web Browser. It completely disables to load ECMAScript in order
  to improve Privacy. Stealth also does not support Web Forms or any Web API that could
  potentially send data to the website.

- Stealth can be scripted as a Web Scraper inside `node.js`. The [Browser](./browser/source)
  is completely free-of-DOM, so every single task and interaction that the [Browser UI](./browser/design)
  does can be implemented in an automateable and programmable manner, even remotely through
  trusted Peers using Stealth's peer-to-peer network services.


## Stealth Guide (for Hackers?)

The [Guide](/guide/README.md) is currently meant for Developers that are new to the Project.
It explains all necessary topics to quickly get started to hack around with Stealth and modify
it to fit your needs.

A User's Guide probably will arrive at a later point in time, as Stealth currently has no
public release yet.


## Public Chat

Currently, there's a Telegram Chat available where most discussions happen. We love
to discuss ideas and we embrace Knowledge.

Telegram Chat: [t.me/tholian_beta](https://t.me/tholian_beta) or search for `Tholian Beta`.


## Quickstart

If you don't wanna deal with the native build toolchain, this
is how to get started as quickly as possible:


- Install [node.js](https://nodejs.org/en/download) version `12+`.
- Install [Ungoogled Chromium](https://github.com/Eloston/ungoogled-chromium/releases) version `70+`.
- (Only MacOS) Alternatively Install `Safari` version `12+`.
- (Only Linux) Alternatively Install `electron` version `8+`.
- (Only Linux) Alternatively Install `gjs` and `WebKit2 GTK` version `4+`.

```bash
git clone https://github.com/tholian-network/stealth.git;
cd ./stealth;

# Make everything
node ./make.mjs;

# Start Stealth Service (optional debug flag)
node ./stealth/stealth.mjs --debug=true;

# Open as Progressive Web App
node ./browser/browser.mjs;
```

**IMPORTANT**: On Android, Stealth can be used by visiting the URL and bookmarking it as
a Web App. The Stealth Icon will appear on your home screen, and it will behave like a
native offline-ready mobile app.


## Roadmap

The current roadmap is a mixture of the [/issues](./issues) section on GitHub/GitLab
and the features that are going to be implemented in the near future which are put
together in the [ROADMAP.md](./ROADMAP.md) file.

As this project in its current form is highly experimental software, those features
can change very rapidly; and lead to at least partial refactors of the codebase as
well.

If you have Problems, Suggestions or Ideas that would fit into Stealth, please open
up an Issue and we'll be happy to talk about it :)


## License

Usage of [Stealth](/stealth), including its [Browser](/browser/source) and
[Browser UI](/browser/design) is licensed under [GNU GPL 3](./LICENSE_GPL3.txt).

`(c) 2019-2020 Tholian(r) Network`

