
# Filter Service

The `filter` settings are different from other settings as there can
be *multiple* Site Filters per `domain`, which means that the `domain`
key does not ensure uniqueness.

In order to have a failsafe storage, each Site Filter has a unique
`id` which changes every time it is modified.

Assume that the `id` represents a hash and always use `query()`
before modifications, as `remove()` and `save()` will change the `id`
and therefore are not idempotent.

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

## read()

`remove({ id: String }, callback)`

reads a `filter` setting from the local Stealth `profile` folder.

```javascript
// read(payload) example
{
	// id can be obtained via query()
	id: 'reddit.com|/chat|null|null'
}
```

## remove()

`remove({ [ id: String, ] domain: String, subdomain: String, filter: { prefix: String, midfix: String, suffix: String }}, callback)`

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

`save({ [ id: String, ] domain: String, subdomain: String, filter: { prefix: String, midfix: String, suffix: String }}, callback)`

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

