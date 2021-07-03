import tls from 'tls';

import { Buffer, Emitter, isArray, isBuffer, isFunction, isNumber, isObject, isString } from '../../extern/base.mjs';
// import { HTTP                                                                         } from '../../source/connection/HTTPS.mjs';
import { IP                                                                           } from '../../source/parser/IP.mjs';
import { URL                                                                          } from '../../source/parser/URL.mjs';



const TYPES = {
	'A':      1,
	'AAAA':  28,
	'CNAME':  5,
	'MX':    15,
	'NS':     2,
	'PTR':   12,
	'SRV':   33,
	'TXT':   16
};

const CLASSES = {
	'INTERNET': 1
};



const isDomain = function(domain) {

	if (isString(domain) === true) {

		let tmp   = domain.split('.');
		let check = domain.split('.').filter((label) => {
			return label.length > 0 && label.length < 64;
		});

		return check.length === tmp.length;

	}


	return false;

};

const isAnswer = function(answer) {

	if (
		isObject(answer) === true
		&& isDomain(answer.domain) === true
		&& isString(answer.type) === true
		&& Object.keys(TYPES).includes(answer.type) === true
	) {

		if (answer.type === 'A') {
			return IP.isIP(answer.value) === true && answer.value.type === 'v4';
		} else if (answer.type === 'AAAA') {
			return IP.isIP(answer.value) === true && answer.value.type === 'v6';
		} else if (answer.type === 'CNAME') {
			return isDomain(answer.value) === true;
		} else if (answer.type === 'MX') {

			if (
				isDomain(answer.value) === true
				&& isNumber(answer.weight) === true
			) {
				return true;
			}

		} else if (answer.type === 'NS') {
			return isDomain(answer.value) === true;
		} else if (answer.type === 'PTR') {
			return IP.isIP(answer.value) === true;
		} else if (answer.type === 'SRV') {

			if (
				isDomain(answer.value) === true
				&& isNumber(answer.weight) === true
				&& isNumber(answer.port) === true
				&& answer.port > 0
				&& answer.port < 65535
			) {
				return true;
			}

		} else if (answer.type === 'TXT') {

			if (isArray(answer.value) === true) {

				let check = answer.value.filter((v) => isBuffer(v) === true);
				if (check.length === answer.value.length) {
					return true;
				}

			}

		}

	}


	return false;

};

const isQuestion = function(question) {

	if (
		isObject(question) === true
		&& isString(question.type) === true
		&& Object.keys(TYPES).includes(question.type) === true
	) {

		if (
			question.type === 'A'
			|| question.type === 'AAAA'
			|| question.type === 'CNAME'
			|| question.type === 'MX'
			|| question.type === 'NS'
			|| question.type === 'SRV'
			|| question.type === 'TXT'
		) {
			return isDomain(question.domain) === true;
		} else if (question.type === 'PTR') {
			return question.domain === null && IP.isIP(question.value) === true;
		}

	}


	return false;

};



const decode_json = function(payload) {
	// TODO: Implement DNS over HTTPS JSON decoder
};

const decode_message = function(dictionary, payload, labels, stack) {
	// TODO: Port DNS wireformat decoder
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
	let format  = url.mime.format;

	if (format === 'application/dns-message') {
		connection.format = format;
	} else if (format === 'application/dns-json') {
		connection.format = format;
	}

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

					if (frame.headers['@length'] !== Infinity) {

						if (frame.payload !== null) {

							connection.socket.end();

						} else {

							// Still downloading payload, wait for timeout

						}

					} else {

						// Unknown payload size, wait for timeout

					}

				} else if (connection.type === 'server') {

					if (frame.headers['@length'] !== Infinity) {

						if (frame.payload !== null) {

							connection.emit('request', [{
								headers: frame.headers,
								payload: frame.payload
							}]);

						} else {

							// Still downloading payload, wait for timeout

						}

					} else {

						// Unknown payload size, wait for timeout

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
			&& url.headers['@length'] === Infinity
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

		let code = (url.headers['@status'] || '500').split(' ').shift();
		if (code === '200' || code === '204' || code === '205' || code === '206') {

			if (url.payload !== null) {

				connection.emit('response', [{
					headers: url.headers,
					payload: url.payload
				}]);

			} else {

				connection.emit('error', [{ type: 'connection', cause: 'headers-payload' }]);

			}

		} else if (code === '301' || code === '307' || code === '308') {

			let tmp = url.headers['location'] || null;
			if (tmp !== null) {
				connection.emit('redirect', [{ headers: url.headers }]);
			} else {
				connection.emit('error', [{ code: code, type: 'connection', cause: 'headers-status' }]);
			}

		} else if (code.startsWith('4') === true && code.length === 3) {
			connection.emit('error', [{ code: code, type: 'connection', cause: 'headers-status' }]);
		} else if (code.startsWith('5') === true && code.length === 3) {
			connection.emit('error', [{ code: code, type: 'connection', cause: 'headers-status' }]);
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
	this.format   = 'application/dns-message';
	this.interval = null;
	this.socket   = socket || null;
	this.type     = null;


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

		let data = {
			local:  null,
			remote: null
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

			let frame = null;

			if (connection.format === 'application/dns-message') {
				frame = decode_message(connection, buffer);
			} else if (connection.format === 'application/dns-json') {
				frame = decode_json(connection, buffer);
			}

			if (frame !== null) {

				if (callback !== null) {

					callback({
						headers: frame.headers,
						payload: frame.payload
					});

				} else {

					return {
						headers: frame.headers,
						payload: frame.payload
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

			let buffer  = null;
			let headers = {};
			let payload = null;

			if (isObject(data.headers) === true) {

				if (isNumber(data.headers['@id']) === true) {
					headers['@id'] = data.headers['@id'] | 0;
				}

				if (data.headers['@type'] === 'request' || data.headers['@type'] === 'response') {
					headers['@type'] = data.headers['@type'];
				}

			}

			if (connection.type === 'client') {

				if (
					isObject(data.payload) === true
					&& isArray(data.payload.questions) === true
					&& data.payload.questions.length > 0
				) {
					payload = {
						questions: data.payload.questions.filter((q) => isQuestion(q))
					};
				}

			} else if (connection.type === 'server') {

				if (
					isObject(data.payload) === true
					&& isArray(data.payload.questions) === true
					&& data.payload.questions.length > 0
					&& isArray(data.payload.answers) === true
					&& data.payload.answers.length > 0
				) {

					if (data.payload.questions.length > 0 && data.payload.answers.length > 0) {
						payload = {
							questions: data.payload.questions.filter((q) => isQuestion(q)),
							answers:   data.payload.answers.filter((a) => isAnswer(a))
						};
					}

				}

			}


			if (headers !== null && payload !== null) {

				if (connection.format === 'application/dns-message') {

					buffer = encode_message(connection, {
						headers: headers,
						payload: payload
					});

				} else if (connection.format === 'application/dns-json') {

					buffer = encode_json(connection, {
						headers: headers,
						payload: payload
					});

				}

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

