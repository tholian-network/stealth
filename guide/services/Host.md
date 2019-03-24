
# Host Service

## read()

`read({ domain: String, subdomain: String }, callback)`

reads a `host` setting from the local Stealth `profile` folder.

If there's no DNS cache entry given, it transparently queries the host via
`DNS over HTTPS` and caches it for future use.

```javascript
// read(payload) example
{
	domain: 'cookie.engineer'
}
```

## refresh()

`refresh({ domain: String, subdomain: String }, callback)`

refreshes a `host` setting in the local Stealth `profile` folder.

It queries the host via `DNS over HTTPS` and caches it for future use.

```javascript
// refresh(payload) example
{
	domain: 'cookie.engineer'
}
```

## remove()

`remove({ domain: String, subdomain: String }, callback)`

removes a `host` setting from the local Stealth `profile` folder.

```javascript
// remove(payload) example
{
	domain: 'cookie.engineer'
}
```

## save()

`save({ domain: String, subdomain: String, ipv4: String, ipv6: String }, callback)`

saves a `host` setting to the local Stealth `profile` folder.

If there's already a configured host with the same domain, it will be changed.

```javascript
// save(payload) example
{
	// foo.bar.cookie.engineer
	domain:    'cookie.engineer',
	subdomain: 'foo.bar',
	ipv4:      '185.199.109.153'
	ipv6:      null
}
```

