
# Stealth Service

The Stealth Service is a web daemon that allows to load, parse, filter
and render web sites from both a local cache and the interwebz.

The idea is that it can be used as both a web proxy (for your custom
web browser interface) and a web browser if there's no other way to
deliver a platform (e.g. you can use Android for Chrome and bookmark
the Stealth Service `/browser/index.html` URL as a Web App).


## Command-Line Flags

- `--port` is the port the Stealth Service is listening on.
  The default value is `65432`.

- `--profile` is the absolute path to the profile folder.
  The default value is `/home/$USER/Stealth'.


## Services

A WebSocket handshake and upgrade happens automatically when there's the
`Connection: Upgrade` and `Upgrade: WebSocket` header set.

A HTTP request sent to `/api/<service>/method` with a JSON body will be
treated the same as a WebSocket data frame containing the same JSON
payload.

The `request` object must be compatible with the [URL](./source/parser/URL.mjs)
parser's reference object.

The reference object allows an optional `payload` property, which is `null`
by default and which is used for peer-to-peer exchange of data. As the format
of data can vary, it can be either of `Buffer`, `Object` or `null`.

```javascript
// Example request object
{
	domain:  'cookie.engineer',
	path:    '/example.txt',
	payload: Buffer.from('Hello world!', 'utf8')
}
```


All `callback` functions receive the following format to transparently allow
cross-protocol (`HTTP`, `WS` and `DNS`) transfer of the `response` object.

```javascript
// Example response object
{
	headers: {},
	payload: {
		result: true
	}
}
```


## Local Services

### Error

- `get({ code: Number }, callback)`
  creates the headers and payload for an error page according to
  [RFC 7231](https://tools.ietf.org/html/rfc7231.html).

### File

- `read({ path: String }, callback)`
  reads a local file from the Stealth `root` folder, where root is
  the working directory of the stealth binary.

### Redirect

- `get({ code: Number, path: String }, callback)`
  creates the headers and payload for a redirect according to
  [RFC 7231](https://tools.ietf.org/html/rfc7231.html).


## Peer-to-Peer Services

### Cache

- `read({ domain: String, path: String /* , mime: Object */ }, callback)`
  reads a cached file from the Stealth `profile/cache` folder.

```javascript
// read() example
{
	domain: 'cookie.engineer',
	path:   '/index.html'
}
```

- `save({ domain: String, path: String, payload: Buffer }, callback)`
  saves a buffer to the Stealth `profile/cache` folder.

```javascript
// save() example
{
	domain: 'cookie.engineer',
	path:   '/index.html',
	payload: Buffer.from('<!DOCTYPE html><body>Hello, world!</body>', 'utf8')
}
```

### Host

- `read({ domain: String }, callback)`
  reads a `host` setting from the local Stealth `profile` folder.
  If there's no DNS cache entry given, it transparently queries the host via
  `DNS over HTTPS` and caches it for future use.

```javascript
// read() example
{
	domain: 'cookie.engineer'
}
```

- `save({ domain: String, payload: { ipv4: String, ipv6: String } }, callback)`
  saves a `host` setting to the local Stealth `profile` folder.
  If there's already a configured host with the same domain, it will be changed.

```javascript
// save() example
{
	domain: 'cookie.engineer',
	ipv4:   '185.199.109.153'
	ipv6:   null
}
```

### Peer

- `read({ domain: String }, callback)`
  reads a `peer` setting from the local Stealth `profile` folder.

```javascript
// read() example
{
	domain: 'local-laptop'
}
```

- `save({ domain: String, payload: { capacity: String, mode: String } }, callback)`
  saves a `peer` setting to the local Stealth `profile` folder.
  If there's already a configured peer with the same domain, it will be changed.

```javascript
// save() example
{
	domain: 'local-laptop',
	payload: {
		capacity: 'online',
		mode: 'stealth'
	}
}
```

### Settings

- `read({}, callback)`
  reads the `settings` from the Stealth `profile` folder and returns with
  the merged settings object of each settings' filename.

```javascript
// read() example
{
	// empty object
}
```

- `save({ /* settings object */ }, callback)`
  saves the settings object to the Stealth `profile` folder and each settings'
  filename.

```javascript
// save() example
{
	// stored in profile/internet.json
	internet: {
		connection: 'mobile',
		torify: false
	},

	// stored in profile/hosts.json
	// managed by Host Service
	hosts: [{
		domain: 'cookie.engineer',
		ipv4:   '185.199.109.153'
		ipv6:   null
	}],

	// stored in profile/peers.json
	// managed by Peer Service
	peers: [{
		domain:   'local-laptop', // can be either of domain, hostname, ipv4, ipv6
		capacity: 'online',
		mode:     'stealth'
	}],

	// stored in profile/sites.json
	// managed by Site Service
	sites: [{
		domain: 'old.reddit.com',
		text:   true,
		image:  true,
		video:  false,
		other:  false
	}]

}
```

### Site

- `read({ domain: String }, callback)`
  reads a `site` setting from the local Stealth `profile` folder.

```javascript
// read() example
{
	domain: 'old.reddit.com'
}
```

- `save({ domain: String, payload: { text: Boolean, image: Boolean, video: Boolean, other: Boolean } }, callback)`
  saves a `site` setting to the local Stealth `profile` folder.
  If there's already a configured site with the same domain, it will be changed.

```javascript
// save() example
{
	domain: 'old.reddit.com',
	payload: {
		text:   true,
		image:  true,
		video:  false,
		other:  false
	}
}
```


## Installation and Usage

Quickstart:

- Install `node` version `10+` for ES6 Module support.

```bash
cd /path/to/stealth-browser;

# Example shows default values for optional flags
bash ./bin/stealth.sh --port=65432 --profile=/home/$USER/Stealth;
```

