
# Peer Service

## read()

`read({ domain: String, subdomain: String, host: String }, callback)`

reads a `peer` setting from the local Stealth `profile` folder.

```javascript
// read(payload) example
{
	domain: 'local-laptop'
}
```

## remove()

`remove({ domain: String, subdomain: String, host: String }, callback)`

removes a `peer` setting from the local Stealth `profile` folder.

```javascript
// remove(payload) example
{
	domain: 'local-laptop',
	host:   '192.168.0.123'
}
```

## save()

`save({ domain: String, subdomain: String, host: String, capacity: String, mode: String }, callback)`

saves a `peer` setting to the local Stealth `profile` folder.

If there's already a configured peer with the same domain or host, it will be changed.
`capacity` can be either of `offline`, `covert`, `stealth`, `online`.
`mode` can be either of `offline`, `covert`, `stealth`, `online`.

```javascript
// save() example
{
	domain:   'local-laptop',
	capacity: 'online',
	mode:     'stealth'
}
```

