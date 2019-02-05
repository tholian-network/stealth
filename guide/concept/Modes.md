
# Stealth/Site Modes

The Stealth Browser embraces user-side control and disregards developer-side
control on how websites behave. You can imagine it as the next-gen screen
reader that embraces the Semantic Web and therefore tries to load as less
content as possible in order to make the website readable.

This is achieved using a defaulted Stealth Mode and additional whitelist-based
user-configured Site Modes.

## Stealth Mode

The Stealth Modes are changeable at any time (right next to the address bar)
and influence how websites and their linked or embedded content are loaded.

- `Offline` requests nothing from the internet, never ever. It loads only from
  the local cache or locally connected peers cache in a guaranteed manner.

- `Covert` requests only texts (such as plain texts, pdf or html/css files)
  from the internet. This can be seen as an improved `Reader Mode` in other
  Web Browsers and it guarantees that malicious content is never displayed
  in the Browser.

- `Stealth` requests only texts and images from the internet, excluding
  webfonts, background images or border images and other bandwidth-consuming
  content that is not necessary to read the contents of the website.

- `Online` requests texts, images, audios, videos and other binary files or
  downloads from the internet.

## Site Modes

As the defaulted `Stealth Mode` influences all requests that are done in the
current session, the idea behind `Site Modes` is to whitelist specific websites
that the user trusts and visits on a regular basis.

Site-specific Modes override the defaulted `Stealth Mode` incrementally, which
means that for example when the `Stealth Mode` is set to `Covert`, but the domain
rule is set to `Stealth`, it will still load the necessary content incrementally
from the website if it would be forbidden by the `Stealth Mode` alone.

As the `Site Modes` are a whitelist-based concept it means that no requests are
done by default, unless the user tells the Stealth Browser to do so.

