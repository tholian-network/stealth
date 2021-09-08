
import tls from 'tls';

import { Buffer, Emitter, isFunction, isNumber, isObject, isString } from '../../extern/base.mjs';
import { IP                                                        } from '../../source/parser/IP.mjs';
import { URL                                                       } from '../../source/parser/URL.mjs';
import { DNS  as PACKET                                            } from '../../source/packet/DNS.mjs';
import { HTTP as WIREFORMAT                                        } from '../../source/packet/HTTP.mjs';



const EMPTYLINE = Buffer.from('\r\n\r\n', 'utf8');
const MIME      = { ext: 'dns', type: 'other',  binary: true, format: 'application/dns-message' };



const decode = function(connection, buffer) {

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

		if (data === null) {

			data = {
				headers: {},
				payload: null
			};

		}

		if (isString(frame.headers['@method']) === true) {
			data.headers['@method'] = frame.headers['@method'];
		}

		if (isNumber(frame.headers['@status']) === true) {
			data.headers['@status'] = frame.headers['@status'];
		}

		if (isObject(frame.headers['@transfer']) === true) {
			data.headers['@transfer'] = frame.headers['@transfer'];
		}

		if (isString(frame.headers['content-type']) === true) {
			data.headers['content-type'] = frame.headers['content-type'];
		}

		return data;

	}


	return null;

};

const encode = function(connection, data) {

	let payload = PACKET.encode(connection, {
		headers: data.headers || {},
		payload: data.payload || null
	});


	if (connection.type === 'client') {

		let hostname = null;
		let domain   = URL.toDomain(connection.url);
		let host     = URL.toHost(connection.url);
		let encoding = 'identity';
		let method   = 'POST';

		if (domain !== null) {
			hostname = domain;
		} else if (host !== null) {
			hostname = host;
		}

		if (isString(data.headers['@method']) === true) {
			method = data.headers['@method'];
		}

		if (isObject(data.headers['@transfer']) === true) {

			if (isString(data.headers['@transfer']['encoding']) === true) {
				encoding = data.headers['@transfer']['encoding'];
			}

		}

		if (method === 'GET') {

			return WIREFORMAT.encode(connection, {
				headers: {
					'@method':         'GET',
					'@url':            connection.url.path + '?dns=' + payload.toString('base64url'),
					'accept':          'application/dns-message',
					'accept-encoding': encoding,
					'host':            hostname,
				},
				payload: null
			});

		} else if (method === 'POST') {

			return WIREFORMAT.encode(connection, {
				headers: {
					'@method':   'POST',
					'@url':      connection.url.path,
					'@transfer': {
						'encoding': encoding,
						'length':   payload.length
					},
					'accept':          'application/dns-message',
					'accept-encoding': encoding,
					'content-type':    'application/dns-message',
					'host':            hostname,
				},
				payload: payload
			});

		}

	} else if (connection.type === 'server') {

		let encoding = 'identity';

		if (isObject(data.headers['@transfer']) === true) {

			if (isString(data.headers['@transfer']['encoding']) === true) {
				encoding = data.headers['@transfer']['encoding'];
			}

		}

		return WIREFORMAT.encode(connection, {
			headers: {
				'@status':   200,
				'@transfer': {
					'encoding': encoding,
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


				if (connection.type === 'client') {

					if (frame.headers['@status'] >= 400 && frame.headers['@status'] <= 599) {

						connection.socket.end();

					} else if (frame.headers['content-type'] !== 'application/dns-message') {

						connection.socket.end();

					} else if (frame.headers['@transfer']['length'] !== Infinity) {

						if (frame.payload !== null) {

							connection.socket.end();

						}

					} else {

						// Unknown payload size, wait for timeout

					}

				} else if (connection.type === 'server') {

					if (frame.headers['@transfer']['length'] !== Infinity) {

						if (frame.payload !== null) {

							connection.emit('request', [{
								headers: frame.headers,
								payload: frame.payload
							}]);

						}

					} else {

						connection.emit('request', [{
							headers: frame.headers,
							payload: frame.payload
						}]);

					}

				}

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
				connection.emit('error', [{ type: 'connection', cause: 'headers' }]);
			}

		} else if (code >= 100 && code <= 599) {
			connection.emit('error', [{ type: 'connection', cause: 'headers' }]);
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

const isSocket = function(obj) {

	if (obj !== null && obj !== undefined) {
		return obj instanceof tls.TLSSocket;
	}

	return false;

};

const isUpgrade = function(url) {

	if (
		isObject(url) === true
		&& isObject(url.headers) === true
	) {
		return true;
	}

	return false;

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

			let local = {
				host: IP.parse(this.socket.localAddress),
				port: this.socket.localPort
			};

			if (
				IP.isIP(local.host) === true
				&& isNumber(local.port) === true
			) {
				data.local = local;
			}

			let remote = {
				host: IP.parse(this.socket.remoteAddress),
				port: this.socket.remotePort
			};

			if (
				IP.isIP(remote.host) === true
				&& isNumber(remote.port) === true
			) {
				data.remote = remote;
			}

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


		if (
			url !== null
			&& (url.protocol === 'https' || url.protocol === 'dnsh')
		) {

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
						ALPNProtocols:  [ 'http/1.1' ],
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

					connection.url      = url;
					connection.url.mime = Object.assign({}, MIME);

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

							let code  = (err.code || '');
							let error = { type: 'connection' };

							if (code === 'ECONNREFUSED') {
								error = { type: 'connection', cause: 'socket-stability' };
							} else if (code.startsWith('ERR_TLS') === true) {
								error = { type: 'connection', cause: 'socket-trust' };
							}

							connection.emit('error', [ error ]);
							ondisconnect(connection, url);

						}

					});

					connection.socket.on('end', () => {

						if (connection.socket !== null) {
							ondisconnect(connection, url);
						}

					});

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
				data = decode(connection, buffer);
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
				buffer = encode(connection, data);
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

		url = isUpgrade(url) ? Object.assign(URL.parse(), url) : Object.assign(URL.parse(), { headers: {} });


		let connection = null;

		if (isSocket(tunnel) === true) {
			connection = new Connection(tunnel);
		} else if (isConnection(tunnel) === true) {
			connection = Connection.from(tunnel);
		}


		if (connection !== null) {

			// TODO: Implement upgrade() for HTTPS socket

			return connection;

		}


		return null;

	}

};


export { DNSH };

