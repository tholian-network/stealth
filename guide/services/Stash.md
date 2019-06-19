
# Stash Service

## info()

`info({ domain: String, subdomain: String, path: String }, callback)`

retrieves metadata of a stashed file from the Stealth `profile/stash` folder.

```javascript
// info(payload) example
{
	domain: 'cookie.engineer',
	path:   '/index.html'
}
```

## read()

`read({ domain: String, subdomain: String, path: String }, callback)`

reads a stashed file from the Stealth `profile/stash` folder.

```javascript
// read(payload) example
{
	domain: 'cookie.engineer',
	path:   '/index.html'
}
```

## remove()

`remove({ domain: String, subdomain: String, path: String }, callback)`

removes a stashed file from the Stealth `profile/stash` folder.

```javascript
// remove(payload) example
{
	domain: 'cookie.engineer',
	path:   '/index.html'
}
```

## save()

`save({ domain: String, subdomain: String, path: String, headers: Buffer, payload: Buffer }, callback)`

saves a buffer to the Stealth `profile/stash` folder.

```javascript
// save(payload) example
{
	domain: 'cookie.engineer',
	path:   '/index.html',
	headers: Buffer.from(JSON.stringify({
		X-Server: 'Awesome'
	}, null, '\t'), 'utf8'),
	payload: Buffer.from('<!DOCTYPE html><body>Hello, world!</body>', 'utf8')
}
```

