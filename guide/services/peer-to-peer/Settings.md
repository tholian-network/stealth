
# Settings Service

## read()

`read({}, callback)`

reads the `settings` from the local Stealth `profile` folder.

```javascript
// read(payload) example
{
	// no keys/values necessary
}
```

## save()

`save({ internet: Object, filters: Array, hosts: Array, peers: Array, sites: Array }, callback)`

saves the `settings` to the local Stealth `profile` folder.

All nested Arrays and Objects are applied incrementally to their
existing settings. If there's already a configured setting with
the same identifiers, it will be changed.

```javascript
// save(payload) example
{
	// stored in profile/internet.json
	internet: {
		connection: 'mobile',
		torify: false
	},

	// stored in profile/hosts.json
	// managed by Host Service
	hosts: [{
		domain: 'cookie.engineer',
		ipv4:   '185.199.109.153'
		ipv6:   null
	}],

	// stored in profile/filters.json
	// managed by Filter Service
	filters: [{
		domain: 'cookie.engineer',
		prefix: '/bad',
		suffix: '.ad.png'
	}],

	// stored in profile/peers.json
	// managed by Peer Service
	peers: [{
		domain:   'local-laptop', // can be either of domain, hostname, ipv4, ipv6
		capacity: 'online',
		mode:     'stealth'
	}],

	// stored in profile/sites.json
	// managed by Site Service
	sites: [{
		domain: 'old.reddit.com',
		mode:   'stealth',
		mime:   {
			text:   true,
			image:  true,
			video:  false,
			other:  false
		}
	}]

}
```

## set()

`set({ mode: String }, callback)`

`mode` sets the `Stealth Mode` of the running Stealth Service.

`mode` can be either of `offline`, `covert`, `stealth`, `online`.

```javascript
// set(payload) example
{
	mode: 'stealth'
}
```

