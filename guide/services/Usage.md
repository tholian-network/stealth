
# Stealth API

The Stealth Instance's API can be accessed via both `HTTP/1.1` and `WS/13`
sockets. HTTP sockets have to do requests to `/api`, otherwise they will
be redirected to the self-served Browser UI.


## Request Data and Response Data

Both the requests and responses have the same `headers` format:

- `service (String)` is the identifier of the equivalent service.
- `method (optional String)` is the name of the method on the service's interface.
- `event (optional String)` is the name of the event that is `emit()`ed on the service's interface.

The `payload request` can be either of the following:

- `Object` when there's a `query()`, `read()`, `refresh()`, `remove()` or `save()` operation.
- `Array` of `Object`s when there's a `save()` operation (only in the `Filters` API).

The `payload response` can be either of the following:

- `Array` or `null` when there's a `query()` operation.
- `Object` or `null` when there's a `read()` or `refresh()` operation.
- `true` or `false` when there's a `remove()` or `save()` operation.


## WebSocket API (WS/13)

These services are available on port `65432` via the `WS/13` protocol.

The `WebSocket Protocol` has to be set to `stealth` in order to make
a successful connection.

Example:

```javascript
let socket = new WebSocket('ws://stealth-service:65432', [ 'stealth' ]);

socket.onmessage = e => {

	let response = null;

	if (typeof e.data === 'string') {
		response = JSON.parse(e.data);
	}

	if (response !== null) {
		console.log('received headers', response.headers);
		console.log('received payload', response.payload);
	}

};

socket.onopen = () => {

	let request = {
		headers: {
			service: 'host',
			method:  'read'
		},
		payload: {
			domain: 'cookie.engineer'
		}
	};

	socket.send(JSON.stringify(request));

};
```


## HTTP API (HTTP/1.1)

These services are available on port `65432` and the path `/api` via the `HTTP/1.1` protocol.

Note: The example is using `XMLHttpRequest`, but it's also possible to use `fetch`.

Example:

```javascript
let socket = new XMLHttpRequest();

socket.open('POST', 'http://stealth-service:65432/api', true);

socket.setRequestHeader('Content-Type', 'application/json');
socket.responseType = 'json';

socket.onload = () => {

	let response = socket.response || null;
	if (response !== null) {
		console.log('received headers', response.headers);
		console.log('received payload', response.payload);
	}

};

let request = {
	headers: {
		service: 'host',
		method:  'read'
	},
	payload: {
		domain: 'cookie.engineer'
	}
};

socket.send(JSON.stringify(request));
```

