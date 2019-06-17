
# Peer Service

Usage of `domain` and `subdomain` require a valid [Host](./Host.md)
cache entry in order to work successfully.

## info()

`proxy({ domain: String, subdomain, String, host: String })`

returns a Peer object without the need for a `peer` setting.

This method is used to quickly check for Peer activity, so it
can be seen as a `multicast` handshake.

It does not need any setting, and will cause the called Stealth
Service to create a Client connection to the targeted Peer, while
returning back its `internet.connection` setting as the `connection`
value.

```javascript
// info(payload) example
{
	host: '192.168.0.123'
}
```

## proxy()

`proxy({ domain: String, subdomain, String, host: String, headers: Object, payload: Object })`

proxies a network service call through and executes it locally.

Proxying proxied network service calls is prohibited, as it would open up a potential
denial-of-service attack surface.

```javascript
// proxy(payload) example
{
	domain:  'laptop',
	headers: {
		service: 'cache',
		method:  'info'
	},
	payload: {
		domain: 'cookie.engineer',
		path:   '/index.html'
	}
}
```

## read()

`read({ domain: String, subdomain: String, host: String }, callback)`

reads a `peer` setting from the local Stealth `profile` folder.

```javascript
// read(payload) example
{
	domain: 'laptop'
}
```

## refresh()

`refresh({ domain: String, subdomain: String, host: String }, callback)`

refreshes a `peer` setting from the local Stealth `profile` folder.

``javascript
// refresh(payload) example
{
	domain: 'laptop'
}
```

## remove()

`remove({ domain: String, subdomain: String, host: String }, callback)`

removes a `peer` setting from the local Stealth `profile` folder.

```javascript
// remove(payload) example
{
	domain: 'laptop'
}
```

## save()

`save({ domain: String, subdomain: String, host: String, connection: String }, callback)`

saves a `peer` setting to the local Stealth `profile` folder.

If there's already a configured peer with the same domain or host, it will be changed.
`connection` can be either of `offline`, `mobile`, `broadband`, `peer`, `i2p` or `tor`.

```javascript
// save() example
{
	domain:     'laptop',
	connection: 'broadband'
}
```

