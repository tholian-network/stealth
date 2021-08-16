
# Stealth Service API

Stealth's Service API can be accessed via `WS/13` Sockets.


## Request Data and Response Data

Both the requests and responses have the same `headers` format:

- `service (String)` is the identifier of the equivalent Service.
- `method (optional String)` is the name of the method on the Service's instance.
- `event (optional String)` is the name of the event that is `emit()`ed on the Service's instance.

The request `payload` varies from Service to Service, but the API
always aims to be compatible with the `URL.parse()` syntax, and reuses
the otherwise empty `headers` and `payload` property on the reference.

For detailed usage, take a look at the [stealth/client](/stealth/review/client)
Reviews that explain all typical API usage scenarios.

The client-side and server-side Reviews can be run via Covert like this:

```bash
cd ./path/to/stealth;

cd ./stealth;

node ../covert/covert.mjs scan stealth/server/service/*;
node ../covert/covert.mjs scan stealth/client/service/*;
```


## WebSocket API (WS/13)

These services are available on port `65432` via the `WS/13` Protocol. The
`WebSocket Protocol` has to be set to `stealth` in order to make a successful
handshake, other `Upgrade` requests are disconnected immediately.

**IMPORTANT**: Stealth's [WS](/stealth/source/connection/WS.mjs) implementation
does not support Binary Frames (`0x02`) on purpose to reduce the attack surface
of fragmented TCP frames.

The `Buffer` API that is used to transfer `payload`s will be serialized as an `Array`
with Integers (`0-255`), and therefore Text Frames (`0x01`) with encoded `JSON`
as `Payload` can be used.

Note that the `Payload` on `WS/13` Framing level consists of an encoded `JSON.stringify()`
string of an `Object` that contains the `Service Headers` and `Service Payload` which are
delegated respectively on either side. To avoid confusion, the term `Payload` is not used
and the term `Request` and `Response` are used henceforth.


```javascript
// Example inside a Browser VM

let socket = new WebSocket('ws://stealth-service:65432', [ 'stealth' ]);

socket.onmessage = (e) => {

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

