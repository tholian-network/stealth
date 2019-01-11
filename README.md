
# Stealth Browser

The Stealth Browser is a different kind of web browser that
aims to achieve increased privacy and automation through
conventions and efficient bandwidth usage, no matter the cost.

It is built by a former contributor to both Chromium and Firefox,
and is built out of personal opinion on how Web Browsers should
actually browse the web in regards of letting users decide what
they want to see - and not web developers.


## Architecture

The "Browser" in this context is not a Web Browser as you might
have it in mind. It is a completely separated "Frontend" view
and remote control of the actual "Backend" that is implemented
in node.js.

When loading and parsing websites, nothing is done in the Browser
that is not related to the presentation of a website and its
contents. That means that the "Browser" and the rendering engine
is interchangeable at any time.

The "Browser" itself is actually just a website (which can also
be remotely used, for example with Chrome on Android connecting
to a running Stealth instance on an Internet Gateway).

-----------------------------------------------------------------

The "Backend" in this context is the Stealth instance that is
running in the background. It is the program that loads, parses,
filters and optimizes all content that is loaded via its public
API.

The "Browser" is connected to the Stealth instance by using a
peer-to-peer capable WebSocket (WS13+ with custom protocol)
implementation, which has both remote control functionality
and network services for doing requests and getting responses.

As the Stealth instance is peer-to-peer, every "Browser" in the
local network shares its resources by default, so that bandwidth
is automatically reduced.

Additionally Stealth can be run completely isolated as a scraper,
which means it only requires node.js and even runs on low-end
ARM devices like a Raspberry PI or an odroid XU4.


## Design Decisions

**AdBlock Filter list support on Parser level**

All requests and all loaded content is filtered. This means all
"Browser" instances never receive any data related to advertisement
or tracking networks.

As you cannot rely on backends from Russia or China actually
respecting the `Do-Not-Track` header, it's just a waste of time
and it has to be enforced on the user-side anyways.

**CSS Filters**

All loaded content is optimized. This means that also stylesheets
are filtered for bad things in regards to user experience.

No annoying "You are from EU, we track you with Cookie" popups
that you always have to confirm. No `overflow:hidden` anymore,
no `:hover` via background images to tracking backends. No
CDN-side cache busting to track user behaviour. No webfonts,
because webfonts never are cached; in any Web Browser.

There's more to it than this. The different modes of the Stealh
Browser influence how things are loaded, filtered (and replaced)
and layouted.

**HTML and CSS, no JS by default**

JavaScript is deactivated by default and only available in
`Online` mode and additionally in a Private Tab sandbox that
runs in a completely isolated cache inside `/tmp/stealth-<random>`
and can never influence any other Web Browser behaviour or
other Sandboxes.

Only trusted websites are allowed to load JavaScripts, and it
is allowed only in `Online` mode. (See Stealth/Site Modes).

**No Web APIs**

This ain't your mama's Web Browser. As the intention of this
Web Browser is doing research online, advanced (and
privacy-compromising) Web APIs are simply stripped away and
not implemented.

These include for example `WebGL`, `WebAudio`, `WebSocket`,
`WebRTC`, `XMLHttpRequest`, `fetch`, `addEventListener('mousemove')`
and other Web- or DOM Level APIs.

So there's no way to track you via ultrasonic noise that runs
in the background on your TV and is integrated with the
Browser's ad network on your Desktop computer.


## Stealth/Site Modes

The Stealth Browser embraces user-side control and disregards
developer-side control on how websites behave. You can imagine
it as the next-gen screen reader that embraces the semantic web
and therefore tries to load as less content as possible in order
to make the website readable.

This can be achieved using user-configured Site Modes.

**Stealth Modes**

The Stealth Modes are changeable at any time (right next to the
address bar) and influence how websites and their linked or
embedded content are loaded.

- `Offline` requests nothing from the internet, never ever. It
  loads only from the local cache in a guaranteed manner.

- `Covert` requests only texts (such as plain texts, pdf or
  html/css files) from the internet and translates them to
  commonmark and back before it renders them. This can be seen
  as an improved `Reader Mode` in other Web Browsers and it
  guarantees that malicious content is never displayed in the
  "Browser".

- `Stealth` requests only texts and images from the internet,
  excluding webfonts, background images or border images and
  other bandwidth-consuming content that is not necessary to
  display the website.

- `Online` requests texts, images, audios, videos and other
  binary files from the internet, including web fonts and
  background images or border images. This can be seen as the
  default mode in other Web Browsers, though it will still
  filter out all advertisements and other unnecessary
  HTML and CSS.

**Site Modes**

As the default mode influences all requests that are done in
the current session, the idea behind "Site Modes" embraces the
whitelist-based concept.

Site-specific Modes override the defaulted mode incrementally,
which means that for example when the Stealth Mode is set to
Covert, but the domain rule is set to Stealth, it will still
load the necessary content incrementally from the website if
it would be forbidden by the Stealth Mode alone.

As the Site Modes are a whitelist-based concept it means that
no requests are done by default, unless the user tells Stealth
Browser to do so.


## Installation and Usage

Quickstart:

- Install `node` version `10+` for ES6 modules support.
- Install either a Web Browser of your choice or [nw.js](https://nwjs.io/downloads).

If you want to use your own Web Browser, do the following:

```bash
cd /path/to/stealth-browser;

bash ./bin/stealth.sh;

# Open in web browser
gio open http://localhost:65432;
```

If you want a bundled nw.js installation, do the following:

```bash
cd /path/to/stealth-browser;

bash ./bin/stealth-webview.sh;
```

Please read the `README.md` of both [Stealth](./stealth) and
[Browser](./browser).

