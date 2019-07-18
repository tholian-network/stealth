
# Session Service

The `session` settings are different from other settings as the `Session`
instances are mapped via their remote hosts that were interacting with
them.

The `session.domain` property represents an educated guess on what remote
peer was calling the session, and based on their `IP` ranges and domain
policies the session will be processed based on the local machine's settings
for `connection`, `history` and `useragent`.

Depending on whether the domain policies for the `Session` allows sharing it
via other Peers inside the same domain, Sessions can also be merged together
and reused at a later point in time and/or recombined with other `Session`
instances of matching `subdomain`s.

## query()

`query({ domain: String, subdomain: String }, callback)`

queries and finds matching `session` settings from the local Stealth `profile` folder.

It always responds with an Array of session Objects.

```javascript
// read(payload) example
{
	domain:    'artificial.engineering',
	subdomain: 'intel'
}
```

## read()

`read({}, callback)`

reads the matching `session` setting for the currently connected (or requesting) peer.

```javascript
// read(payload) example
{
	// nothing is necessary, always replies with the valid session instance
}
```

## request()

`request(URL, callback)`

requests a given `URL` object and returns the result on both `redirect` and `response`.

Returns `null` if an error happened.

```javascript
// request(payload) example
URL.parse('https://example.com/index.html')
```
