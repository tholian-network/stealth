
# Usage as Web Proxy

Stealth can be used as a Web Proxy in `Firefox` or other Browsers that allow using an
HTTP Proxy for all network protocols by using the `Proxy Auto-Configuration` format.

The downside is that you have to enter the URLs as `http://` URLs in the address bar;
otherwise Stealth cannot process the URLs. Don't worry, behind the scenes Stealth will
always use `https://` by default.

Technically, you can still use the [Browser](/browser) as a web page in the current Web
Browser; even when you are using Stealth as a Web Proxy. The downside is that the
`Ctrl` + `T` keybinding won't work then, so you have to stick to the `F_` keybindings.

**IMPORTANT**: `Chromium` won't work via Web Proxy due to their recent changes on how URLs
are requested via `https://` by default. Stealth cannot intercept and filter those requests.


## Firefox Settings

Open Firefox and do the following:

- Open `about:preferences` via the address bar.
- Scroll down to `Network Settings`, click on `Settings...`.
- Select `Manual proxy configuration`.
- Enter `HTTP Proxy` as Host `localhost` with Port `65432`.
- Select `Use this proxy for all protocols`.
- Double-check that the `No Proxy for ...` field contains the same Host as the `HTTP Proxy` field.
- Confirm with click on the `OK` button.


### PAC / Proxy Auto-Configuration

Stealth can be used as a Corporate Web Proxy by using the Proxy Auto-Configuration format.
The PAC file is generated at the `http://localhost:65432/proxy.pac` URL.

If the user-facing machine is inside an `IPv6-only` environment, you have to map the
Stealth machine to a hostname via `/etc/hosts`, as the `PAC` format cannot return proxy
configurations for IPv6 addresses (technically it can and will use the `[::ip]:port`
scheme, but all other PAC implementations are broken so it won't work).

**IMPORTANT**: Change host and port accordingly when Stealth is not running with default
settings. Always use an `IPv4` as Host if possible, otherwise the user-friendly
configuration interface won't work due to limitations of how Proxies receive HTTP/HTTPS
requests.

**SECURITY NOTE**: Redirecting to the user-friendly web-based configuration interface with
a `hostname` as Host would require a potentially unencrypted and broadcasted DNS request.
If you want to use a `hostname`, configure it in the user-facing machine's `/etc/hosts` file.


## Force-Refresh Site

As the normal `Reload` button of the Web Browser won't work (as Web Browsers in general are
too stupid to cache properly, and Stealth will cache everything correctly.) the Refresh can
be triggered with a Bookmarklet.

The Bookmarklet takes the current URL in the address bar and redirects to the Stealth Service's
`/stealth/:refresh:/<URL>` API, which overwrites the Cache after it reloads the Page.

### Force-Refresh Bookmarklet

```javascript
// Bookmark as "Force-Refresh"
javascript:(() => (location.href = 'http://localhost:65432/stealth/:refresh:/' + location.href))();
```


## Site Mode and Site Filters

Site Mode and Site Filters can not be automatically redirected to in order to prevent a
potential endless loop when the Web Browser tries to detect an internet connection or
when a Plugin or Web Extension tries to do an analytics request (which Stealth will
intercept and prevent, too).

Therefore it is recommended to configure the current Site with Bookmarklets that automatically
redirect your Browser to the correct Browser UI's Internal Page.


### Site Mode Bookmarklet

The Site Mode can be configured with a Bookmarklet after you've visited it.
The Bookmarklet takes the current URL in the address bar and redirects to the Browser UI
for the `stealth:fix-mode` Page.

```javascript
// Bookmark as "Fix Site Mode"
javascript:(() => (location.href = 'http://localhost:65432/browser/internal/fix-mode.html?url=' + encodeURIComponent(location.href)))();
```


### Site Filters Bookmarklet

The Site Filters can be configured with a Bookmarklet after you've visited it.
The Bookmarklet takes the current URL in the address bar and redirects to the Browser UI
for the `stealth:fix-filter` Page.

```javascript
// Bookmark as "Fix Site Filters"
javascript:(() => (location.href = 'http://localhost:65432/browser/internal/fix-filter.html?url=' + encodeURIComponent(location.href)))();
```

