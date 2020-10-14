
# Stealth Service

The Stealth Service is a web daemon that allows to load, parse, filter
and render web sites from both a local cache and the interwebz.

The idea is that the [Browser UI](../browser) is also delivered by
the Stealth Service, so that other platforms (like Android or iOS
tablets and smartphones) can simply access a Stealth instance by
visiting it with any modern Web Browser and to use the Progressive
Web App in fullscreen mode.


## Command-Line Flags

- `--debug` is a boolean flag to toggle loading/debugging of the profile.
  The default value is `false`.

- `--host` is the `host` the Stealth Service is listening on.
  The default value is `null`. The Stealth Service will always
  listen on port `65432`.

- `--profile` is the absolute path to the profile folder.
  The default value is `/home/$USER/Stealth`.


## Quickstart

- Install [node.js](https://nodejs.org/en/download) version `12+`.

```bash
cd /path/to/stealth;

# Example shows default values for optional flags
node ./stealth/stealth.mjs --host=null --profile=/home/$USER/Stealth;
```

