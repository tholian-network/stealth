
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

`remove({ domain: String, subdomain: String }, callback)`

removes all matching `filter` settings from the local Stealth `profile` folder.

```javascript
// remove(payload) example
{
	domain: 'reddit.com'
}
```

## save()

`save([{ domain: String, subdomain: String, prefix: String, midfix: String, suffix: String }], callback)`

saves `filter` settings to the local Stealth `profile` folder.

It will always create non-existing filter Objects. In case of an overwrite
scenario, it is recommended to do a `remove()` call before a `save()` call.

```javascript
// save(payloads) example
[{
	domain: 'reddit.com',
	prefix: '/chat',
	midfix: null,
	suffix: null
}]
```

