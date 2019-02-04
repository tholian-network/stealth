
# Site Service

## read()

`read({ domain: String, subdomain: String }, callback)`

reads a `site` setting from the local Stealth `profile` folder.

```javascript
// read(payload) example
{
	domain:    'reddit.com'
	subdomain: 'old'
}
```

## remove()

`remove({ domain: String, subdomain: String }, callback)`

removes a `site` setting from the local Stealth `profile` folder.

```javascript
// remove(payload) example
{
	domain:    'reddit.com'
	subdomain: 'old'
}
```

## save()

`save({ domain: String, subdomain: String, mime: Object }, callback)`

`save({ domain: String, subdomain: String, mode: String }, callback)`

saves a `site` setting to the local Stealth `profile` folder.

If there's already a configured site with the same domain or host, it will be changed.

The API has two different signatures, where both require either a
preferred `mime` Object or a `mode` String.

`mode` can be either of `offline`, `covert`, `stealth`, `online`.

```javascript
// save(payload) example
{
	domain:    'reddit.com',
	subdomain: 'old'
	mode:      'stealth'
}
```

```javascript
// save(payload) example
{
	domain:    'imgur.com',
	subdomain: 'i',
	mime:      {
		text:  false,
		image: true,
		video: true,
		other: false
	}
}
```

