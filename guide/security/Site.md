
# Web Security Guide


## Attack Vector: JavaScript

While Stealth itself is written in ECMAScript (in node.js), it does not feature
a client-side ECMAScript engine on purpose.

As there's no way to guarantee the privacy or security in a failsafe manner, the
execution of client-side ECMAScript is disabled.

As of now (Q4 2021), not a single ECMAScript VM offers reliable permission
management in its sandboxes that would allow the end-user which features and APIs
would be enabled (and which would be stub APIs to avoid fingerprinting).

This lack of permission management is highly invasive from a privacy perspective,
and therefore the current option is to not enable client-side JavaScript at all.

**Attack Scenario: Canvas API**

Web Fonts (and natively installed Fonts) can be abused by the Canvas API in order
to identify the Font Rendering Engine that's unique per Operating System (version).

Stealth does not support client-side ECMAScript, therefore this attack scenario
has no effect.

**Attack Scenario: WebRTC API**

The WebRTC API can be abused to identify the local area networks (LAN) IP of the
machine. This was already abused in the past to identify specific network
configuration setups. In combination with a custom `TURN` server that relays
crafted UDP traffic to a victim's network it can be also used to penetrate a
network's firewall.

Stealth does not support client-side ECMAScript, therefore this attack scenario
has no effect.

**Attack Scenario: CSRF + Fetch API**

The `fetch` or `XMLHttpRequest` API were being abused to fingerprint a local
network's router infrastructure. There are multiple client-side running frameworks
(like `routersploit` or variations of the `low orbit ion cannon`) that effectively
try out defaulted or vendor-specific passwords and/or actively craft requests to
exploit the outdated router's firmware.

Stealth does not support client-side ECMAScript, therefore this attack scenario
has no effect.


## Attack Vector: CSS

There are a lot of potential attack vectors regarding CSS, which are all disabled
in Stealth on purpose. Stealth's own CSS Parser aims to filter out all malicious
parts of CSS, and therefore works on an `allowlist`-based concept for CSS functions,
properties and values in order to avoid otherwise necessary future updates of a
`blocklist`.

**Attack Scenario: @media**

Conditional checks via `@media` can be abused to identify specific display resolutions
and other hardware details that might be unique to the network the end-user is in.

The CSS Parser of Stealth has only limited support for `@media` on purpose and uses
a `whitelist` for properties that are allowed to be checked against. Therefore this
attack scenario has no effect.

**Attack Scenario: @supports**

Conditional checks via `@supports` can be abused to identify specific Web Browser
engines and versions, and even specific native Operating System versions which might
be unique to the network the end-user is in.

This has already been done, and the people behind [fingerprintjs](https://github.com/fingerprintjs/fingerprintjs)
are already working on a [fingerprintcss](https://fingerprintjs.com/blog/disabling-javascript-wont-stop-fingerprinting/)
library that abuses CSS behaviours to uniquely identify end-users.

The CSS Parser of Stealth does not support `@supports`, therefore this attack scenario
has no effect.

**Attack Scenario: Uncached Background Images**

Another tracking mechanism is to abuse the `:hover`, `:focus` and `:active`
pseudo-classes combined with a `pointer-events` masked property as an overlay over
the whole website with `position: fixed || absolute` and set a `background-image`,
which in response is served by a backend with HTTP headers that disable caching
mechanisms on the Browser side. A variation of that is a neverending GIF socket
that allows to track the specific time frame of a session (and whether or not a
Tab/Session was closed by the end-user).

All network requests done by Stealth are cached by default, and therefore this
attack scenario has no effect. Only a manual refresh of the Site and the new Site
including different URLs for its assets would lead to another network request.

**Attack Scenario: Webfonts**

Web Fonts can be abused to identify Font Rendering Engine issues, and to uniquely
identify the native Operating System (version), given enough overhead work. For
example, the font-rendering mechanism switched a lot between different font hinting
methods (combined with antialiasing updates). This is already abused to uniquely
identify end-users via the `Canvas API` (which isn't supported), but can be used
in theory with only CSS and a combination of `pointer-events` and `background-images`
on the text elements.

The Stealth Parser does only support `Web Fonts` when the `Other` media type is
enabled manually. Therefore this attack scenario has only an effect when the
end-user enables Web Fonts for a specific Domain manually.

