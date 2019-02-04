
# Stealth Browser

The Stealth Browser is a different kind of Web Browser that aims to achieve increased privacy,
increased automation through macro-like tasks and efficient bandwidth usage, no matter the cost.

It is built by a former contributor to both Chromium and Firefox, and is built out of personal
opinion on how Web Browsers should try to understand the Semantic Web in regards on letting the
user decide what they want to see - and not irresponsible web developers.


## Downloads / Releases

Currently the Stealth Browser is just a couple days old and is in a prototypical stage. If you
are a Software Developer and want to help, you are welcome to join the project.

Non-Development Users won't enjoy it much, currently - as things are quite buggy and not ready
for the public yet. However, due to the concept of using node.js and focussing on a privacy-oriented
audience, the Stealth Browser will initially be released for `MacOS` and `GNU/Linux`.

(Download Links will be inserted here once the Stealth Browser is ready for the public)


## Architecture

The "Browser" in this context is not a Web Browser as you might have it in mind. The Browser is
a completely separated web application and remote control of the actual "Stealth" instance
that is running in the background and is implemented in pure node.js.

When loading and parsing websites, nothing is done in the Browser that is not related to the
presentation of a website and its contents. The Browser and its Rendering Engine are
interchangeable at any time, as its GUI is implemented with HTML, CSS and JS.

The Browser itself is actually just a website which can also be remotely used, for example with
Chrome on Android connecting to a running Stealth instance on an Internet Gateway.

---------------------------------------------------------------------------------------------------

The "Stealth" instance in this context is a Web Browser as a Service (not kidding) that is
running in the background. It is responsible for loading, parsing, filtering and rendering
all assets and downloads (in the sense of generating the HTML and CSS code for the "Browser").

The huge advantage this concept delivers is that the Stealth instance can run completely
headless and can be used as a Web Scraper and Web Proxy in parallel. It also allows flexible
manipulation and blocking of network requests, as the "Browser" itself does not have to have
any kind of DOM API or Web API.

Potentially malicious scripts or instructions never reach the Stealth Browser and are processed
inside the Stealth service only. They are never executed, and there cannot be such a thing like
an "Anti-Anti-Anti-AdBlocker" that prevents the Browser from making the website usable again.

The Browser is connected to the Stealth instance with a peer-to-peer capable Web-Socket network
implementation that allows all Stealth Browsers in the network to share their locally cached
files with other peers in the network.

This automatically saves huge amounts of bandwidth and allows continous offline-usage of every
website that was already visited and archived locally in the network.


## Design Decisions


### Offline First, Online Second

If an asset or file is available in the local cache, it will always be loaded from there. Only if
the User manually tells the Browser to reload the website in `Online` mode, files will be downloaded,
parsed, filtered and optimized again.

This guarantees offline-ready usage of all websites and assets, directly from the local cache. As
all CDNs these days use cache-busting and several Web Browser Extensions tried to fix it and failed,
this is the general behaviour of the Stealth Browser - download as less as possible to make the
website usable, always.


### HTML and CSS only, No JavaScript

The Stealth Browser filters all JavaScript out on purpose in order to guarantee maximum anonymity
and privacy of its users. There are no DOM APIs and no Web APIs accessible by concept. Imagine
the Stealth Browser as some kind of "Reader Mode" on steroids, for every content you consume and
that you want to read later, even while being offline or on an airplane.

If you've visited the website already, it will be in the cache - unless you told the Browser
manually to forget it.


### HTML and CSS Filters (AdBlock, uBlock and Host Filter Lists)

HTML and CSS files are downloaded and filtered by the Stealth service. Files will be stored in
the temporary cache folder until they are processed. Persistent files always are filtered and
do not contain any kind of advertisement or tracking related scripts or instructions.

The Stealth Service will filter out dangerous CSS rules, too, as many advertisement agencies
learned to exploit cache-busting techniques to have `background-image` s transferred by their
analytics backends.

Additionally to that, many things are fixed automatically; things like `overflow:hidden` or
`position:fixed` overlays that are blocking the whole screen are filtered automatically to
ensure a better user experience.


### Temporary Cookies only, No Persistent Tracking Cookies

Cookies are stored temporarily in order to allow websites to load when they require their
"anti-bot anti-haxxor" detections to run through. Cookies are stored only in the trusted
`Online` Mode and they will be deleted after you closed the Tab - always, without exception.


## Stealth/Site Modes

The Stealth Browser embraces user-side control and disregards developer-side control on how
websites behave. You can imagine it as the next-gen screen reader that embraces the Semantic Web
and therefore tries to load as less content as possible in order to make the website readable.

This is achieved using a defaulted Stealth Mode and additional user-configured Site Modes.

**Stealth Modes**

The Stealth Modes are changeable at any time (right next to the address bar) and influence how
websites and their linked or embedded content are loaded.

- `Offline` requests nothing from the internet, never ever. It loads only from the local cache
  in a guaranteed manner.

- `Covert` requests only texts (such as plain texts, pdf or html/css files) from the internet
  and translates them to commonmark and back before it renders them. This can be seen as an
  improved `Reader Mode` in other Web Browsers and it guarantees that malicious content is never
  displayed in the Browser.

- `Stealth` requests only texts and images from the internet, excluding webfonts, background images
  or border images and other bandwidth-consuming content that is not necessary to display the
  website.

- `Online` requests texts, images, audios, videos and other binary files from the internet,
  including web fonts and background images or border images. This can be seen as the default mode
  in other Web Browsers, though it will still filter out all advertisements and other unnecessary
  HTML and CSS.

**Site Modes**

As the defaulted `Stealth Mode` influences all requests that are done in the current session, the
idea behind `Site Modes` is to whitelist specific websites that the user trusts and visits on a
regular basis.

Site-specific Modes override the defaulted `Stealth Mode` incrementally, which means that for
example when the `Stealth Mode` is set to `Covert`, but the domain rule is set to `Stealth`, it will
still load the necessary content incrementally from the website if it would be forbidden by the
`Stealth Mode` alone.

As the `Site Modes` are a whitelist-based concept it means that no requests are done by default,
unless the user tells the Stealth Browser to do so.


## Installation and Usage

The Stealth service is implemented in `node` and is using
ECMAScript Modules (`.mjs`) in order to `export` and `import`
code. This means that `node` version `10` or higher is required.


**Quickstart**

- Install `node` version `10+` for ES6 modules support.
- Install either a Web Browser of your choice or [nw.js](https://nwjs.io/downloads).

Start the Stealth service:

```bash
cd /path/to/stealth-browser;

bash ./bin/stealth.sh;

# Open in Web Browser
gio open http://localhost:65432;
```

Please read the `README.md` of both [Stealth](./stealth) and [Browser](./browser) to get more
insights about their architecture and interaction.


## Developer Guide

The [Stealth Browser Guide](./guide/README.md) contains all documentation
about the Stealth Browser and the Stealth Service.

## License

The license is currently unclear and depends on how to finance this project later.
Therefore assume All Rights Reserved and (c) Cookie Engineer for now.

