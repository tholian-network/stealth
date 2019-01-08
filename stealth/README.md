
# Stealth Service


## Command-Line Flags

- `--port` is the port the Stealth Service is listening on.
  The default value is `65432`.

- `--profile` is the absolute path to the profile folder.
  The default value is `/home/$USER/Stealth'.


## API

A WebSocket handshake and upgrade happens automatically when there's the
`Connection: Upgrade` and `Upgrade: WebSocket` header set.

A HTTP request sent to `/api/<service>` with a JSON body will be treated
the same as a WebSocket data frame containing the same JSON payload.


## API Parameters

- `url` is the url of a file. If requested via `HTTP GET`, the url must
  be correctly url-encoded.

- `mode` is the mode that is used to operate on the file. The mode can
  be either of `offline`, `covert`, `stealth` or `online`.


## Services

`service/settings.mjs` reads and writes the Browser Settings and stores
the settings in the `--profile/browser.json` file.

`service/render.mjs` returns a rendered optimized version of a given `url`
with the correct `Content-Type` header. The `url` is equivalent to the
file path inside the `--profile/cache` folder.

`service/request.mjs` returns statistics of a given `url` and allows the
the "Browser" to identify security-violating domains quickly.

`service/mode.mjs` reads and writes modes of a given `url` and stores the
settings in the `--profile/stealth.json` file.

`service/resolve.mjs` returns a list of IPv4/IPv6 of a given `url` and
their timestamps and allows the "Browser" to identify compromised
domains quickly.

