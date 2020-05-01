
# Settings Service

Some settings cannot be modified to avoid potential malicious usage.

- The `blockers` settings are unavailable for `read()` or `save()`.
- The `redirects` settings are unavailable for `save()`.
- The `sessions` settings are unavailable for `save()`.

## read()

`read(null, callback)`

reads the `settings` from the local Stealth `profile` folder.

```javascript
// read(payload) example
null
```

`read({ internet: Boolean, filters: Boolean, hosts: Boolean, modes: Boolean, peers: Boolean, redirects: Boolean, sessions: Boolean }, callback)`

reads the `settings` from the local Stealth `profile` folder, and
responds only with the selected `type`.

```javascript
// read(payload) example
{
	internet: true,
	hosts:    false, // not necessary, as it is defaulted
	peers:    true
}
```

By default, it assumes `false` for all types.

```javascript
// read(payload) example
null // responds with all settings
```

## save()

`save({ internet: Object, filters: Array, hosts: Array, modes: Array, peers: Array }, callback)`

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
		history:    'stealth',
		useragent:  'stealth'
	},

	// stored in profile/filters.json
	// managed by Filter Service
	filters: [{
		domain: 'cookie.engineer',
		filter: {
			prefix: '/bad',
			midfix: null,
			suffix: '.advert.png'
		}
	}],

	// stored in profile/hosts.json
	// managed by Host Service
	hosts: [{
		domain: 'cookie.engineer',
		hosts: [{
			ip:    '185.199.109.153'
			scope: 'public',
			type:  'v4'
		}]
	}],

	// stored in profile/modes.json
	// managed by Mode Service
	modes: [{
		domain: 'old.reddit.com',
		mode:   {
			text:  true,
			image: true,
			audio: false,
			video: false,
			other: false
		}
	}],

	// stored in profile/peers.json
	// managed by Peer Service
	peers: [{
		domain:     'local-laptop', // can be either of domain, hostname, ipv4, ipv6
		connection: 'mobile'
	}]

}
```

