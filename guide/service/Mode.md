
# Mode Service

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

`save({ domain: String, subdomain: String, mode: Object }, callback)`

saves a `site` setting to the local Stealth `profile` folder.

If there's already a configured site with the same domain or host, it will be changed.

`mode` is an Object consisting of Boolean values for the following keys:

- `text` that represents text mime types.
- `image` that represents image mime types.
- `audio` that represents audio mime types.
- `video` that represents video mime types.
- `other` that represents other (uncategorized or binary-formatted) mime types.


```javascript
// save(payload) example
{
	domain:    'imgur.com',
	subdomain: 'i',
	mode:      {
		text:  false,
		image: true,
		audio: false,
		video: true,
		other: false
	}
}
```

