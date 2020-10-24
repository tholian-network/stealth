
# Stealth Service

The Stealth Service is a web daemon that allows to load, parse, filter
and render web sites from both a local cache and the interwebz.

The idea is that the [Browser UI](../browser) is also delivered by
the Stealth Service, so that other platforms (like Android or iOS
tablets and smartphones) can simply access a Stealth instance by
visiting it with any modern Web Browser and to use the Progressive
Web App in fullscreen mode.


## Quickstart

- Install [node.js](https://nodejs.org/en/download) version `12+`.

```bash
cd /path/to/stealth;

# Build Stealth (and Browser and Base)
node ./stealth/make.mjs;

# Show Help
node ./stealth/stealth.mjs;
```

