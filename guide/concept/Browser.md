
# Browser Guide

The Usage is documented in the Browser's [README.md](/browser/README.md) file.


## Architecture

The `Browser` inside [/browser/source](/browser/source) is strictly free-of-DOM and
its implementation does not contain any `document` or `window` related code.

The only used Web API is the [WebSocket API](https://developer.mozilla.org/en/docs/Web/API/WebSocket)
inside [Browser Client](/browser/source/Client.mjs) which can be interchanged with the
[Stealth Client](/stealth/source/Client.mjs).

The `Browser UI` inside [/browser/design](/browser/design) receives all data via events,
and does all interaction with the [Browser](/browser/source/Browser.mjs)'s public methods.

The `Browser UI` uses the Web Browser Engine to make the UI interactive, so it uses HTML5,
CSS3 and ES2018 (with respects to DOM APIs and Web APIs) to render itself and make itself
interactive.

This allows to use the [Browser](/browser/source/Browser.mjs) inside a `node.js` only
context, and allows to build a custom Web Scraper that runs only on servers or terminal
environments.


## Codebase

The Stealth Service contains a [Browser](/stealth/source/Browser.mjs),
so it might be confusing which implementations can run in which environment.

As there's also the technological limitation that `iframes` are different
ECMAscript sandboxes, you'll see custom data types and validations mechanisms
across the codebase as the `instanceof` and `typeof` operators don't work.

The below table shows which file of the `Browser` codebase is imported from
where. The vision of this is that building a new (custom) Browser should require
only writing a new `Client.mjs` that can reuse all Network Services in order
to communicate to the Stealth Service.

Everything in the [Browser UI](/browser/design) is nothing more than a remote
control for the Stealth Service, whereas the `Browser.mjs` file is isomorphic
and allows to create `node.js` based scrapers out of the box, too.

- `Browser`, `Covert` and `Stealth` have the `extern/base.mjs` file that is imported from the [Base](/base/source) Library.
- `Browser` only has a `Client.mjs` and `ENVIRONMENT.mjs`, everything else in [/browser/source](/browser/source) is imported from [/stealth/source](/stealth/source).
- `/browser/extern/base.mjs` is imported via [browser.sh](/browser/bin/browser.sh) from `/base/build/browser.mjs`.
- `/covert/extern/base.mjs` is imported via [covert.sh](/covert/bin/covert.sh) from `/base/build/node.mjs`.
- `/stealth/extern/base.mjs` is imported via [stealth.sh](/stealth/bin/stealth.sh) from `/base/build/node.mjs`.


| Path                     | Browser | Stealth | Notes                                  |
|:-------------------------|:-------:|:-------:|:---------------------------------------|
| `extern/base.mjs`        |->       |->       | built via [base.sh](/base/bin/base.sh) |
| `source/client/*.mjs`    |       <-|    x    |                                        |
| `source/parser/*.mjs`    |       <-|    x    |                                        |
| `source/Browser.mjs`     |       <-|    x    |                                        |
| `source/Tab.mjs`         |       <-|    x    |                                        |
| ------------------------ | ------- | ------- | -------------------------------------- |
| `design/*.mjs`           |    x    |         | requires Browser or Webview            |
| `internal/*.mjs`         |    x    |         | requires Browser or Webview            |
| `source/Client.mjs`      |    x    |    x    | always Platform-specific               |
| `source/ENVIRONMENT.mjs` |    x    |    x    | always Platform-specific               |


## Execution Process

As explained above, the [Browser](/browser/source) Project reuses most of the
implementations from the [Stealth](/stealth/source) Service.

The [browser.sh](/browser/bin/browser.sh) script imports necessary files from
the [Base](/base/source) Library and [Stealth](/stealth/source) Service before
it starts a preinstalled Browser Engine to open itself as a Progressive Web App.

The only difference between the Browser codebase and the Stealth codebase are
these files:

- [ENVIRONMENT.mjs](/browser/source/ENVIRONMENT.mjs) parses the `window.location`.
- [Client.mjs](/browser/source/Client.mjs) implements a Client via the `WebSocket` API.

The [Browser UI](/browser/design) needs an HTML5/CSS3 environment as it is
implemented using Web Components and requires either the `webview` or an `iframe`
element available.

The [browser.sh](/browser/bin/browser.sh) script uses one of the following (pre-)
installed Browser Engines in order to open itself as a Progressive Web App:


On **GNU/Linux** either of these is required:

- `chromium` (requires (Ungoogled) `Chromium` version `70+`)
- `electron` (requires `Electron` version `8+`)
- `gjs` (included with GNOME, requires `WebKit2 GTK` version `4+`)
- `qmlscene` (included with KDE, requires `Qt5 WebView` version `5+` and `Qt5 QuickControls` version `2+`)

On **MacOS** either of these is required:

- `Chromium.app` (requires (Ungoogled) `Chromium` version `70+`)
- `Safari.app` (requires `Safari` version `12+`)


## Engine / Webview Requirements

If you want to build a native Browser Engine, these are the current requirements
for the [Browser UI](/browser/design) and [Internal Pages](/browser/internal):

- Render `HTML5`, `DOM Level 3` and `CSS3` (to reuse `/browser/design`).
- ECMAScript 2016 (with `<script type="module">` support).
- [WebSocket API](https://developer.mozilla.org/en/docs/Web/API/WebSocket) support.
- [iframe](https://developer.mozilla.org/en/docs/Web/HTML/Element/iframe) support.
- [HTMLIFrameElement](https://developer.mozilla.org/en/docs/Web/API/HTMLIFrameElement) support.
- [document.cookie](https://developer.mozilla.org/en/docs/Web/API/Document/cookie)
  support to transmit `Cookie: session=<id>;path=/stealth` headers for requests
  to `/stealth/` URLs.
- [window.parent](https://developer.mozilla.org/en/docs/Web/API/Window/parent)
  support to access the `window.browser` property outside the `<iframe>` element
  that renders the Internal Pages.
- (Optionally) Transmission of `tab id` that is prefixed as `/stealth/:<id>:/`
  and `/stealth/:<id>,[flags]:/`.


## Site Modes

The `Site Modes` decide what type of content to load from a specific URL
and what to optimize in the loaded HTML content in regards to what is being
displayed and what not.


### Media Types

Media Types and their representations in Stealth are compliant with
[IANA Assignments](https://www.iana.org/assignments/media-types).

Media Types are represented by the `MIME Object` that is returned by the
[URL Parser](../../stealth/source/parser/URL.mjs)'s `parse(url)` method.

A typical `MIME` Object looks like this:

```json
{
	"ext":    "abw",
	"type":   "other",
	"binary": true,
	"format": "application/x-abiword"
}
```

The Definition of a `MIME` Object's `type` property influences the loading
behaviour (and is equivalent to the `Site Modes` menu bar in the Browser UI).

- `text` loads text files.
- `image` loads image files.
- `audio` loads audio files.
- `video` loads video files.
- `other` downloads files that cannot be rendered.

