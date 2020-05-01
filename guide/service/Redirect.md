
# Redirect Service

## read()

`read({ domain: String, subdomain: String, host: String, path: String }, callback)`

reads a `redirect` setting from the local Stealth `profile` folder.

```javascript
// read(payload) example
{
	domain: 'cookie.engineer',
	path:   '/example'
}
```


## remove()

`remove({ domain: String, subdomain: String }, callback)`

removes a `redirect` setting from the local Stealth `profile` folder.

```javascript
// remove(payload) example
{
	domain: 'cookie.engineer',
	path:   '/example'
}
```

## save()

`save({ domain: String, subdomain: String, host: String, path: String, location: String }, callback)`

saves a `redirect` setting to the local Stealth `profile` folder.

If there's already a configured redirect with the same domain and path, it will be changed.

```javascript
// save(payload) example
{
	// https://projects.cookie.engineer/github
	domain:    'cookie.engineer',
	subdomain: 'projects',
	path:      '/github',
	location:  'https://github.com/cookiengineer'
}
```

