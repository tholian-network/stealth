
# Filter Service

## query()

`query({ domain: String, subdomain: String }, callback)`

queries and finds matching `filter` settings from the local Stealth `profile` folder.

It always responds with an Array of filter Objects.

```javascript
// read(payload) example
{
	domain:    'adclick.net',
	subdomain: 'awesome-poker'
}
```

## remove()

`remove({ domain: String, subdomain: String, filter: { prefix: String, midfix: String, suffix: String }}, callback)`

removes a `filter` setting from the local Stealth `profile` folder.

```javascript
// remove(payload) example
{
	domain: 'reddit.com'
	filter: {
		prefix: '/chat',
		midfix: null,
		suffix: null
	}
}
```

## save()

`save({ domain: String, subdomain: String, filter: { prefix: String, midfix: String, suffix: String }}, callback)`

saves a `filter` setting to the local Stealth `profile` folder.

It creates a non-existing `filter` setting.

It is recommended to do a `remove()` call with the old filter setting before a `save()`
call with the new filter setting.

```javascript
// save(payloads) example
{
	domain: 'reddit.com',
	filter: {
		prefix: '/chat',
		midfix: null,
		suffix: null
	}
}
```

