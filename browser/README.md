
# Stealth Browser

The Stealth Browser is a Browser User Interface that is
implemented using Web Technologies, so that it is possible
to change the Browser Engine (to render everything) without
problems.


## URL-Parameter Flags

- `/index.html?debug` is a parameter to toggle loading/debugging
   of the UI by disabling the Service Worker.
   The default value is `false`.


## Quickstart

- Install [node.js](https://nodejs.org/en/download) version `10+`.
- Install [Ungoogled Chromium](https://github.com/Eloston/ungoogled-chromium/releases) version `70+`
  or [Firefox](https://www.mozilla.org/en-US/firefox) version `65+`.

```bash
cd /path/to/stealth;
bash ./bin/stealth.sh;

# Open as Progressive Web App
bash ./bin/stealth-browser.sh;

# Open in other Web Browser
# gio open http://localhost:65432;
```

