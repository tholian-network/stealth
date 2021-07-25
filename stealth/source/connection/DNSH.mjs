
import tls  from 'tls';

import { console, Buffer, Emitter, isFunction, isObject } from '../../extern/base.mjs';
// import { HTTP                                          } from '../../source/connection/HTTPS.mjs';
import { IP                                             } from '../../source/parser/IP.mjs';
import { URL                                            } from '../../source/parser/URL.mjs';
import { DNS  as PACKET                                 } from '../../source/packet/DNS.mjs';
import { HTTP as WIREFORMAT                             } from '../../source/packet/HTTP.mjs';



const EMPTYLINE = Buffer.from('\r\n\r\n', 'utf8');

const MIME = {
	'dns':  { ext: 'dns',  type: 'other', binary: true,  format: 'application/dns-message' },
	'json': { ext: 'json', type: 'text',  binary: false, format: 'application/dns-json'    }
};



const decode_dns_json = function(connection, buffer) {
	// TODO: Implement DNS over HTTPS JSON decoder
};

const decode_dns_message = function(connection, buffer) {

	let frame = WIREFORMAT.decode(connection, buffer);
	if (frame !== null && frame.payload !== null) {

		let data = null;

		if (frame.headers['@method'] === 'GET') {

			let url = URL.parse(frame.headers['@url']);
			if (url.query.startsWith('dns=') === true) {
				data = PACKET.decode(connection, Buffer.from(url.substr(4).split('&').shift(), 'base64url'));
			}

		} else if (frame.headers['@method'] === 'POST' && frame.headers['content-type'] === 'application/dns-message') {
			data = PACKET.decode(connection, frame.payload);
		} else if (frame.headers['@status'] === 200 && frame.headers['content-type'] === 'application/dns-message') {
			data = PACKET.decode(connection, frame.payload);
		}

		return data;

	}


	return null;

};



const encode_dns_json = function(connection, data) {
	// TODO: encode_json() for DNS via HTTPS JSON API
};

const encode_dns_message = function(connection, data) {

	let payload = PACKET.encode(connection, {
		headers: data.headers || {},
		payload: data.payload || null
	});


	if (connection.type === 'client') {

		let hostname = null;
		let domain   = URL.toDomain(connection.url);
		let host     = URL.toHost(connection.url);

		if (domain !== null) {
			hostname = domain;
		} else if (host !== null) {
			hostname = host;
		}

		if (data.headers['@method'] === 'GET') {

			return WIREFORMAT.encode(connection, {
				headers: {
					'@method':         'GET',
					'@url':            connection.url.path + '?dns=' + payload.toString('base64url'),
					'accept':          'application/dns-message',
					'accept-encoding': 'identity',
					'host':            hostname,
				},
				payload: null
			});

		} else if (data.headers['@method'] === 'POST') {

			return WIREFORMAT.encode(connection, {
				headers: {
					'@method':   'POST',
					'@url':      connection.url.path,
					'@transfer': {
						'encoding': 'identity',
						'length':   payload.length
					},
					'accept':          'application/dns-message',
					'accept-encoding': 'identity',
					'content-type':    'application/dns-message',
					'host':            hostname,
				},
				payload: payload
			});

		}

	} else if (connection.type === 'server') {

		return WIREFORMAT.encode(connection, {
			headers: {
				'@status':   200,
				'@transfer': {
					'encoding': 'identity',
					'length':   payload.length
				},
				'content-type': 'application/dns-message'
			},
			payload: payload
		});

	}


	return null;

};

const lookup = function(host, options, callback) {

	options  = isObject(options)    ? options  : {};
	callback = isFunction(callback) ? callback : function() {};


	let results = IP.sort(this.hosts).filter((ip) => {

		if (options.family === 4) {
			return ip.type === 'v4';
		} else if (options.family === 6) {
			return ip.type === 'v6';
		} else {
			return ip.type !== null;
		}

	}).map((ip) => ({
		address: ip.ip,
		family:  parseInt(ip.type.substr(1), 10)
	}));


	// SNI TLS extension can fire ENETUNREACH errors
	// setTimeout() delegates errors to socket listeners
	// Please don't ask why.

	setTimeout(() => {

		if (options.all === true) {
			callback(null, results);
		} else {
			callback(null, results[0].address, results[0].family);
		}

	}, 0);

};

const onconnect = function(connection, url) {

	let timeout = Date.now() + 5000;


	connection.type = 'client';

	connection.socket.on('data', (fragment) => {

		ondata(connection, url, fragment);
		timeout = Date.now();

	});

	connection.interval = setInterval(() => {

		if (url.payload === null && (Date.now() - timeout) > 1000) {
			ondisconnect(connection, url);
		}

	}, 1000);

	setTimeout(() => {
		connection.emit('@connect');
	}, 0);

};

const ondata = function(connection, url, chunk) {

	connection.fragment = Buffer.concat([ connection.fragment, chunk ]);


	let header_index = connection.fragment.indexOf(EMPTYLINE);
	if (header_index !== -1) {

		DNSH.receive(connection, connection.fragment, (frame) => {

			if (frame !== null) {

				url.headers = frame.headers;
				url.payload = frame.payload;


				console.log(url.headers, url.payload);

				// if (connection.type === 'client') {

				// 	if (frame.headers['@transfer']['length'] !== Infinity) {

				// 		if (frame.payload !== null) {

				// 			connection.socket.end();

				// 		} else {

				// 			// Still downloading payload, wait for timeout

				// 		}

				// 	} else {

				// 		// Unknown payload size, wait for timeout

				// 	}

				// } else if (connection.type === 'server') {

				// 	if (frame.headers['@transfer']['length'] !== Infinity) {

				// 		if (frame.payload !== null) {

				// 			connection.emit('request', [{
				// 				headers: frame.headers,
				// 				payload: frame.payload
				// 			}]);

				// 		} else {

				// 			// Still downloading payload, wait for timeout

				// 		}

				// 	} else {

				// 		// Unknown payload size, wait for timeout

				// 	}

				// }

			}

		});

	}

};

const ondisconnect = function(connection, url) {

	if (
		url.headers === null
		|| (
			url.headers !== null
			&& url.headers['@transfer']['length'] === Infinity
			&& url.payload === null
		)
	) {

		DNSH.receive(connection, connection.fragment, (frame) => {

			if (frame !== null) {

				url.headers = frame.headers;
				url.payload = frame.payload;

			} else {

				url.headers = {};
				url.payload = null;

			}

		});

	}


	if (connection.type === 'client') {

		let code = url.headers['@status'] || 500;
		if (code === 200) {

			if (url.payload !== null) {

				connection.emit('response', [{
					headers: url.headers,
					payload: url.payload
				}]);

			} else {

				connection.emit('error', [{ type: 'connection', cause: 'payload' }]);

			}

		} else if (code === 204 || code === 205) {

			connection.emit('error', [{ type: 'connection', cause: 'headers' }]);

		} else if (code === 206) {

			connection.emit('error', [{ type: 'connection', cause: 'headers' }]);

		} else if (code === 301 || code === 302 || code === 307 || code === 308) {

			let tmp = url.headers['location'] || null;
			if (tmp !== null) {
				connection.emit('redirect', [{ headers: url.headers }]);
			} else {
				connection.emit('error', [{ code: code, type: 'connection', cause: 'headers' }]);
			}

		} else if (code >= 100 && code <= 599) {
			connection.emit('error', [{ code: code, type: 'connection', cause: 'headers' }]);
		} else {
			connection.emit('error', [{ type: 'connection', cause: 'socket-stability' }]);
		}

	} else if (connection.type === 'server') {

		let check = (url.headers['@url'] || '');
		if (check !== '') {
			// Do Nothing
		} else {
			connection.emit('error', [{ type: 'connection', cause: 'socket-stability' }]);
		}

	}


	connection.disconnect();

};



const isConnection = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Connection]';
};

const Connection = function(socket) {

	this.fragment = Buffer.alloc(0);
	this.interval = null;
	this.socket   = socket || null;
	this.type     = null;
	this.url      = null;


	Emitter.call(this);

};


Connection.from = function(json) {

	if (isObject(json) === true) {

		let type = json.type === 'Connection' ? json.type : null;
		let data = isObject(json.data)        ? json.data : null;

		if (type !== null && data !== null) {

			let connection = new Connection();

			return connection;

		}

	} else if (isConnection(json) === true) {

		if ((json instanceof Connection) === true) {

			return json;

		} else {

			let socket     = json.socket || null;
			let connection = new Connection(socket);

			Object.keys(connection).forEach((property) => {

				if (
					json[property] === undefined
					|| json[property] === null
				) {
					json[property] = connection[property];
				}

			});

			return json;

		}

	}


	return null;

};


Connection.isConnection = isConnection;


Connection.prototype = Object.assign({}, Emitter.prototype, {

	[Symbol.toStringTag]: 'Connection',

	toJSON: function() {

		let blob = Emitter.prototype.toJSON.call(this);
		let data = {
			local:   null,
			remote:  null,
			events:  blob.data.events,
			journal: blob.data.journal
		};

		if (this.socket !== null) {
			data.local  = this.socket.localAddress  + ':' + this.socket.localPort;
			data.remote = this.socket.remoteAddress + ':' + this.socket.remotePort;
		}

		return {
			'type': 'Connection',
			'data': data
		};

	},

	disconnect: function() {

		if (this.interval !== null) {
			clearInterval(this.interval);
			this.interval = null;
		}

		if (this.socket !== null) {

			this.socket.destroy();
			this.socket = null;

			this.emit('@disconnect');

		}

	}

});



const DNSH = {

	connect: function(url, connection) {

		url        = isObject(url)            ? Object.assign(URL.parse(), url) : null;
		connection = isConnection(connection) ? Connection.from(connection)     : new Connection();


		if (url !== null && url.protocol === 'https') {

			let hosts = IP.sort(url.hosts);
			if (hosts.length > 0) {

				let hostname = hosts[0].ip;
				let domain   = URL.toDomain(url);
				let host     = URL.toHost(url);

				if (domain !== null) {
					hostname = domain;
				} else if (host !== null) {
					hostname = host;
				}


				try {

					connection.socket = tls.connect({
						host:           hostname,
						port:           url.port || 443,
						ALPNProtocols:  [ 'http/1.1', 'http/1.0' ],
						secureProtocol: 'TLS_method',
						servername:     hostname,
						lookup:         lookup.bind(url)
					}, () => {

						if (connection.socket.authorized === true) {

							onconnect(connection, url);

						} else {

							connection.socket = null;
							connection.emit('error', [{ type: 'connection', cause: 'socket-trust' }]);

						}

					});

				} catch (err) {
					connection.socket = null;
				}


				if (connection.socket !== null) {

					if (url.path === '/dns-query') {
						url.mime = Object.assign({}, MIME['dns']);
					} else if (url.path === '/resolve') {
						url.mime = Object.assign({}, MIME['json']);
					} else {
						url.mime = Object.assign({}, MIME['dns']);
					}

					connection.url = url;

					connection.socket.removeAllListeners('data');
					connection.socket.removeAllListeners('timeout');
					connection.socket.removeAllListeners('error');
					connection.socket.removeAllListeners('end');

					connection.socket.on('timeout', () => {

						if (connection.socket !== null) {
							ondisconnect(connection, url);
						}

					});

					connection.socket.on('error', (err) => {

						if (connection.socket !== null) {
							ondisconnect(connection, url);
						}

						// let code  = (err.code || '');
						// let error = { type: 'connection' };
                        //
						// if (code === 'ECONNREFUSED') {
						// 	error = { type: 'connection', cause: 'socket-stability' };
						// } else if (code.startsWith('ERR_TLS') === true) {
						// 	error = { type: 'connection', cause: 'socket-trust' };
						// }
                        //
						// connection.emit('error', [ error ]);
						// DNSH.disconnect(connection);

					});

					connection.socket.on('end', () => {

						if (connection.socket !== null) {
							ondisconnect(connection, url);
						}

					});

					// TODO: Migrate socket creation from HTTPS.connect()
					// and implement custom HTTP.receive() workflow, because
					// we need to prevent request and response events from firing

					// TODO: request and response events
					// TODO: ondata might be necessary, to prevent request/response from being
					// fired too early!?

					return connection;

				} else {

					connection.socket = null;
					connection.emit('error', [{ type: 'connection' }]);

					return null;

				}

			} else {

				connection.socket = null;
				connection.emit('error', [{ type: 'host' }]);

				return null;

			}

		} else {

			connection.socket = null;
			connection.emit('error', [{ type: 'connection' }]);

			return null;

		}

	},

	disconnect: function(connection) {

		connection = isConnection(connection) ? connection : null;


		if (connection !== null) {

			connection.disconnect();

			return true;

		}


		return false;

	},

	receive: function(connection, buffer, callback) {

		connection = isConnection(connection) ? connection : null;
		buffer     = Buffer.isBuffer(buffer)  ? buffer     : null;
		callback   = isFunction(callback)     ? callback   : null;


		if (buffer !== null) {

			let data = null;

			if (connection.url.mime.format === 'application/dns-message') {
				data = decode_dns_message(connection, buffer);
			} else if (connection.url.mime.format === 'application/dns-json') {
				data = decode_dns_json(connection, buffer);
			}

			if (data !== null) {

				if (callback !== null) {

					callback({
						headers: data.headers,
						payload: data.payload
					});

				} else {

					return {
						headers: data.headers,
						payload: data.payload
					};

				}

			} else {

				if (callback !== null) {
					callback(null);
				} else {
					return null;
				}

			}

		} else {

			if (callback !== null) {
				callback(null);
			} else {
				return null;
			}

		}

	},

	send: function(connection, data, callback) {

		connection = isConnection(connection) ? connection : null;
		data       = isObject(data)           ? data       : { headers: {}, payload: null };
		callback   = isFunction(callback)     ? callback   : null;


		if (connection !== null && connection.socket !== null) {

			let buffer = null;

			if (connection.url.mime.format === 'application/dns-message') {
				buffer = encode_dns_message(connection, data);
			} else if (connection.url.mime.format === 'application/dns-json') {
				buffer = encode_dns_json(connection, data);
			}

			if (buffer !== null) {

				if (connection.type === 'client') {
					connection.socket.write(buffer);
				} else if (connection.type === 'server') {
					connection.socket.end(buffer);
				}

				if (callback !== null) {
					callback(true);
				} else {
					return true;
				}

			} else {

				if (callback !== null) {
					callback(false);
				} else {
					return false;
				}

			}

		} else {

			if (callback !== null) {
				callback(false);
			} else {
				return false;
			}

		}

	},

	upgrade: function(tunnel, url) {

		// TODO: Implement upgrade()

	},



	__OLD_resolve: function(query, callback) {

		query    = isQuery(query)       ? query    : null;
		callback = isFunction(callback) ? callback : null;


		if (query !== null && callback !== null) {

			let domain     = toDomain(query);
			let server_url = null;

			if (DNS.SERVER === null) {

				server_url = DNS.SERVERS[DNS_RONIN];

				DNS_RONIN += 1;
				DNS_RONIN %= DNS.SERVERS.length;

			} else if (DNS.SERVERS.includes(DNS.SERVER) === true) {

				server_url = DNS.SERVER;

			} else {

				DNS.SERVER = null;
				server_url = DNS.SERVERS[DNS_RONIN];

				DNS_RONIN += 1;
				DNS_RONIN %= DNS.SERVERS.length;

			}


			if (domain !== null && server_url !== null) {

				resolve(server_url, domain, 'A', (hosts_v4) => {

					resolve(server_url, domain, 'AAAA', (hosts_v6) => {

						let hosts = [];

						if (hosts_v4 !== null) {
							hosts_v4.forEach((h) => hosts.push(h));
						}

						if (hosts_v6 !== null) {
							hosts_v6.forEach((h) => hosts.push(h));
						}


						if (hosts.length > 0) {

							callback({
								headers: {},
								payload: {
									domain: domain,
									hosts:  hosts
								}
							});

						} else {

							callback({
								headers: {},
								payload: null
							});

						}

					});

				});

			} else {

				callback({
					headers: {},
					payload: null
				});

			}

		} else if (callback !== null) {

			callback({
				headers: {},
				payload: null
			});

		}

	}

};


export { DNSH };

