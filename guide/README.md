
# Stealth Browser Guide

This Guide is intended as a reference document for both the concept
and architecture, and their documentation of implementations.

The idea is that with this guide developer's can implement their
own Browser Frontend (or Client) that can reuse the Stealth Service
and its provided APIs or Data.


## WebSocket API

These services are available on port `65432` via `WS13` protocol.

The `WebSocket Protocol` has to be set to `stealth` in order to make
a successful connection.

Both the requests and responses have the same `headers` format:

- `service (String)` is the identifier of the equivalent service.
- `method (optional String)` is the name of the method on the service's interface.
- `event (optional String)` is the name of the event that is `emit()`ed on the service's interface.

The `payload` can be either of the following:

- `Object` or `null` when there's a `read()` or `refresh()` operation.
- `true` or `false` when there's a `remove()` or `save()` operation.

Example:

```javascript
let socket = new WebSocket('ws://stealth-service:65432', [ 'stealth' ]);

socket.onmessage = e => {

	let response = null;

	if (typeof e.data === 'string') {
		response = JSON.parse(e.data);
	}

	console.log('received headers', response.headers);
	console.log('received payload', response.payload);

};

socket.onopen = () => {

	let payload = {
		headers: {
			service: 'host',
			method:  'read'
		},
		payload: {
			domain: 'cookie.engineer'
		}
	};

	socket.send(JSON.stringify(payload));

};
```


## Peer-to-Peer Services

These services are available peer-to-peer.

- [Cache](./services/peer-to-peer/Cache.md)
- [Host](./services/peer-to-peer/Host.md)
- [Settings](./services/peer-to-peer/Settings.md)
- [Site](./services/peer-to-peer/Site.md)

## Local Services

These services are available only locally.

- [Error](./services/local/Error.md)
- [File](./services/local/File.md)
- [Redirect](./services/local/Redirect.md)

