
# Stealth Concept Design

## Offline First, Online Second

If an asset or file is available in the local cache, it will always be
loaded from there. Only if the User manually tells the Browser to reload
the website in `Online` mode, files will be downloaded, parsed, filtered
and optimized again.

This guarantees offline-ready usage of all websites and assets, directly
from the local cache. As all CDNs these days use cache-busting and several
Web Browser Extensions tried to fix it and failed, this is the general
behaviour of the Stealth Browser - download as less as possible to make
the website usable, always.


## HTML and CSS only, No JavaScript

The Stealth Browser filters all JavaScript out on purpose in order to
guarantee maximum anonymity and privacy of its users. There are no DOM APIs
and no Web APIs accessible by concept. Imagine the Stealth Browser as some
kind of "Reader Mode" on steroids, for every content you consume and that
you want to read later, even while being offline or on an airplane.

If you've visited the website already, it will be in the cache - unless you
told the Browser manually to forget it.


## HTML and CSS Filters (AdBlock, uBlock and Host Filter Lists)

HTML and CSS files are downloaded and filtered by the Stealth service. Files
will be stored in the temporary cache folder until they are processed.
Persistent files always are filtered and do not contain any kind of
advertisement or tracking related scripts or instructions.

The Stealth Service will filter out dangerous CSS rules, too, as many
advertisement agencies learned to exploit cache-busting techniques to have
`background-image` s transferred by their analytics backends.

Additionally to that, many things are fixed automatically; things like
`overflow:hidden` or `position:fixed` overlays that are blocking the whole
screen are filtered automatically to ensure a better user experience.


## Temporary Cookies only, No Persistent Tracking Cookies

Cookies are stored temporarily in order to allow websites to load when they
require their "anti-bot anti-haxxor" detections to run through. Cookies are
stored only in the trusted `Online` Mode and they will be deleted after you
closed the Tab - always, without exception.

