
import net  from 'net';
import zlib from 'zlib';

import { Buffer, Emitter, isBoolean, isBuffer, isFunction, isObject, isString } from '../../extern/base.mjs';
import { IP                                                                   } from '../../source/parser/IP.mjs';
import { URL                                                                  } from '../../source/parser/URL.mjs';



const decode_chunked = function(payload) {

	let chunks = payload.toString('utf8').split('\r\n');
	let target = Buffer.from('', 'utf8');

	while (chunks.length > 0) {

		let length = parseInt(chunks.shift(), 16);
		let chunk  = chunks.shift();

		if (chunk.length === length) {
			target = Buffer.concat([ target, Buffer.from(chunk, 'utf8') ]);
		} else {
			target = Buffer.from('', 'utf8');
			break;
		}

		if (chunks.length === 1 && chunks[0] === '') {
			break;
		}

	}

	return target;

};

const decode_gzip = function(payload) {
	return zlib.gunzipSync(payload);
};

const encode_gzip = function(payload) {
	return zlib.gzipSync(payload);
};



const onconnect = function(connection, url) {

	let fragment = connection.fragment;

	fragment.encoding = 'identity';
	fragment.headers  = null;
	fragment.length   = null;
	fragment.mode     = 'headers';
	fragment.partial  = false;
	fragment.payload  = Buffer.from('', 'utf8');
	fragment.start    = 0;


	if (url.headers !== null) {

		let tmp0 = url.headers['content-length'] || null;
		if (tmp0 !== null) {

			let num = parseInt(tmp0, 10);
			if (Number.isNaN(num) === false) {
				fragment.length = num;
			}

		}


		let tmp1 = url.headers['@status']       || null;
		let tmp2 = url.headers['content-range'] || null;
		if (tmp1 === '206 Partial Content' && tmp2 !== null) {

			if (url.payload !== null) {
				fragment.partial = true;
				fragment.payload = Buffer.from(url.payload);
				fragment.start   = url.payload.length;
			} else {
				fragment.partial = true;
				fragment.payload = Buffer.from('', 'utf8');
				fragment.start   = 0;
			}

		}

	}


	let timeout = Date.now() + 1000;

	connection.socket.on('data', (fragment) => {

		ondata(connection, url, fragment);
		timeout = Date.now();

	});

	connection.interval = setInterval(() => {

		if (fragment.length === null) {

			if ((Date.now() - timeout) > 1000) {
				ondisconnect(connection, url);
			}

		}

	}, 1000);


	connection.type = 'client';
	setTimeout(() => {
		connection.emit('@connect');
	}, 0);

};

const ondata = function(connection, url, chunk) {

	let fragment = connection.fragment;
	if (fragment.mode === 'headers') {

		if (fragment.headers !== null) {
			fragment.headers = Buffer.concat([ fragment.headers, chunk ]);
		} else {
			fragment.headers = chunk;
		}


		let check = fragment.headers.indexOf(Buffer.from('\r\n\r\n', 'utf8'));
		if (check !== -1) {

			HTTP.receive(connection, fragment.headers, (frame) => {

				fragment.mode = 'payload';
				url.headers   = frame.headers;


				let tmp0 = frame.headers['content-length'] || null;
				let tmp1 = frame.headers['content-range']  || null;
				if (tmp0 !== null && fragment.length === null) {

					let num = parseInt(tmp0, 10);
					if (Number.isNaN(num) === false) {
						fragment.length = num;
					}

				} else if (tmp1 !== null && tmp1.includes('/') && fragment.length === null) {

					let num = parseInt(tmp1.split('/').pop(), 10);
					if (Number.isNaN(num) === false) {
						fragment.length = num;
					}

				} else {

					fragment.length = null;

				}


				let tmp2 = frame.headers['content-encoding']  || null;
				let tmp3 = frame.headers['transfer-encoding'] || null;
				if (tmp2 === 'gzip' || tmp3 === 'gzip') {
					fragment.encoding = 'gzip';
				} else if (tmp3 === 'chunked') {
					fragment.encoding = 'chunked';
				} else {
					fragment.encoding = 'identity';
				}


				if (connection.type === 'client') {

					let tmp4 = (frame.headers['@status'] || '').split(' ').shift();
					let tmp5 = (frame.headers['content-range'] || null);
					if (tmp4 === '206' && tmp5 !== null) {

						fragment.partial = true;

						if (frame.payload !== null) {

							if (fragment.payload !== null) {
								fragment.payload = Buffer.concat([ fragment.payload, frame.payload ]);
							} else {
								fragment.payload = frame.payload;
							}

						}

					} else if (tmp4 === '200') {

						fragment.partial = false;

						if (frame.payload !== null) {
							fragment.payload = frame.payload;
						}

					} else if (tmp4 === '416') {

						connection.emit('error', [{ type: 'request', cause: 'headers-payload' }]);

					} else {

						fragment.partial = false;

						if (frame.payload !== null) {
							fragment.payload = frame.payload;
						}

						connection.socket.removeAllListeners('data');
						connection.socket.end();

					}


					if (fragment.length !== null && fragment.length === fragment.payload.length) {
						connection.socket.end();
					}

				} else if (connection.type === 'server') {

					if (fragment.length !== null && fragment.length === fragment.payload.length) {

						connection.emit('request', [{
							headers: url.headers,
							payload: fragment.payload
						}]);

					} else if (fragment.length === null) {

						connection.emit('request', [{
							headers: url.headers,
							payload: fragment.payload
						}]);

					}

				}

			});

		}

	} else if (fragment.mode === 'payload') {

		fragment.payload = Buffer.concat([ fragment.payload, chunk ]);


		connection.emit('progress', [{
			headers: url.headers,
			payload: fragment.payload
		}, {
			bytes:  fragment.payload.length,
			length: fragment.length
		}]);


		if (connection.type === 'client') {

			if (fragment.length !== null && fragment.length === fragment.payload.length) {
				connection.socket.end();
			}

		} else if (connection.type === 'server') {

			if (fragment.length !== null && fragment.length === fragment.payload.length) {

				connection.emit('request', [{
					headers: url.headers,
					payload: fragment.payload
				}]);

			} else if (fragment.length === null) {

				connection.emit('request', [{
					headers: url.headers,
					payload: fragment.payload
				}]);

			}

		}

	}

};

const ondisconnect = function(connection, url) {

	let fragment = connection.fragment;

	if (fragment.length !== null && fragment.length !== fragment.payload.length && isBuffer(fragment.headers) === true) {

		let check = fragment.headers.indexOf(Buffer.from('\r\n\r\n', 'utf8'));
		if (check !== -1) {

			HTTP.receive(connection, fragment.headers, (frame) => {

				url.headers = frame.headers;

				if (frame.payload !== null) {

					if (frame.payload.length === fragment.length) {
						fragment.payload = frame.payload;
					}

				}

			});

		}

	}


	if (connection.type === 'client') {

		if (url.headers !== null) {

			let code = (url.headers['@status'] || '500').split(' ').shift();
			if (code === '200' || code === '204' || code === '205' || code === '206') {

				if (fragment.length === null || fragment.length === fragment.payload.length) {

					if (fragment.encoding === 'chunked') {
						fragment.payload  = decode_chunked(fragment.payload);
						fragment.encoding = 'identity';
					} else if (fragment.encoding === 'gzip') {
						fragment.payload  = decode_gzip(fragment.payload);
						fragment.encoding = 'identity';
					}


					connection.emit('response', [{
						headers: url.headers,
						payload: fragment.payload
					}]);

				} else if (fragment.length < fragment.payload.length) {

					if (fragment.partial === true) {

						connection.emit('timeout', [{
							headers: url.headers,
							payload: fragment.payload
						}]);

					} else {
						connection.emit('timeout', [ null ]);
					}

				} else {
					connection.emit('error', [{ type: 'request', cause: 'headers-payload' }]);
				}

			} else if (code === '301' || code === '307' || code === '308') {

				let tmp = url.headers['location'] || null;
				if (tmp !== null) {
					connection.emit('redirect', [{ headers: url.headers }]);
				} else {
					connection.emit('error', [{ code: code, type: 'request', cause: 'headers-status' }]);
				}

			} else if (code.startsWith('4') && code.length === 3) {
				connection.emit('error', [{ code: code, type: 'request', cause: 'headers-status' }]);
			} else if (code.startsWith('5') && code.length === 3) {
				connection.emit('error', [{ code: code, type: 'request', cause: 'headers-status' }]);
			} else {
				connection.emit('error', [{ code: code, type: 'request', cause: 'headers-status' }]);
			}

		} else {
			connection.emit('timeout', [ null ]);
		}

	}


	connection.disconnect();

};

const onupgrade = function(connection, url) {

	connection.type = 'server';

	connection.socket.on('data', (fragment) => {
		ondata(connection, url, fragment);
	});

	connection.socket.resume();


	setTimeout(() => {
		connection.emit('@connect');
	}, 0);

};



const isConnection = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Connection]';
};

const isSocket = function(obj) {

	if (obj !== null && obj !== undefined) {
		return obj instanceof net.Socket;
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

};

const Connection = function(socket) {

	this.socket   = socket || null;
	this.fragment = {
		encoding: 'identity',
		headers:  null,
		length:   null,
		mode:     'headers',
		partial:  false,
		payload:  Buffer.from('', 'utf8'),
		start:    0
	};
	this.interval = null;
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

			for (let prop in json) {

				if (prop !== 'socket') {
					connection[prop] = json[prop];
				}

			}

			return connection;

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

		let socket = this.socket;
		if (socket !== null) {
			data.local  = socket.localAddress  + ':' + socket.localPort;
			data.remote = socket.remoteAddress + ':' + socket.remotePort;
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



const HTTP = {

	connect: function(url, connection) {

		url        = isObject(url)            ? Object.assign(URL.parse(), url) : null;
		connection = isConnection(connection) ? Connection.from(connection)     : new Connection();


		if (url !== null) {

			let hosts = IP.sort(url.hosts);
			if (hosts.length > 0) {

				if (connection.socket === null) {

					try {

						connection.socket = net.connect({
							host: hosts[0].ip,
							port: url.port || 80,
						}, () => {

							connection.socket.setNoDelay(true);
							connection.socket.setKeepAlive(false, 0);
							connection.socket.allowHalfOpen = false;

							onconnect(connection, url);

						});

					} catch (err) {
						connection.socket = null;
					}

				} else {

					connection.socket.setNoDelay(true);
					connection.socket.setKeepAlive(false, 0);
					connection.socket.allowHalfOpen = false;

					setTimeout(() => {
						onconnect(connection, url);
					}, 0);

				}


				if (connection.socket !== null) {

					connection.socket.removeAllListeners('data');
					connection.socket.removeAllListeners('timeout');
					connection.socket.removeAllListeners('error');
					connection.socket.removeAllListeners('end');

					connection.socket.on('timeout', () => {

						if (connection.socket !== null) {

							connection.socket = null;

							let fragment = connection.fragment;
							if (fragment.partial === true) {

								connection.emit('timeout', [{
									headers: url.headers,
									payload: fragment.payload
								}]);

							} else {
								connection.emit('timeout', [ null ]);
							}

						}

					});

					connection.socket.on('error', () => {

						if (connection.socket !== null) {

							ondisconnect(connection, url);
							connection.socket = null;

						}

					});

					connection.socket.on('end', () => {

						if (connection.socket !== null) {

							ondisconnect(connection, url);
							connection.socket = null;

						}

					});

					return connection;

				} else {

					connection.socket = null;
					connection.emit('error', [{ type: 'request' }]);

					return null;

				}

			} else {

				connection.socket = null;
				connection.emit('error', [{ type: 'host' }]);

				return null;

			}

		} else {

			connection.socket = null;
			connection.emit('error', [{ type: 'request' }]);

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

			let headers     = {};
			let payload     = null;
			let raw_headers = '';
			let raw_payload = null;

			let raw   = buffer.toString('utf8');
			let index = raw.indexOf('\r\n\r\n');
			if (index !== -1) {

				if (raw.endsWith('\r\n\r\n')) {
					raw_headers = raw.substr(0, index);
					raw_payload = buffer.slice(index + 4, buffer.length - 4);
				} else {
					raw_headers = raw.substr(0, index);
					raw_payload = buffer.slice(index + 4);
				}

			} else {
				raw_headers = raw;
			}


			let tmp1 = raw_headers.split('\r\n').map((line) => line.trim());
			if (tmp1.length > 1) {

				let tmp2 = tmp1.shift().split(' ');
				if (/^(OPTIONS|GET|HEAD|POST|PUT|DELETE|TRACE|CONNECT|PATCH)$/g.test(tmp2[0])) {

					headers['@method'] = tmp2[0];

					if (tmp2[1].startsWith('/')) {
						headers['@url'] = tmp2[1];
					} else if (tmp2[1].startsWith('http://') || tmp2[1].startsWith('https://')) {
						headers['@url'] = tmp2[1];
					}

				} else if (tmp2[0] === 'HTTP/1.1' || tmp2[0] === 'HTTP/1.0') {
					headers['@status'] = tmp2.slice(1).join(' ');
				}


				tmp1.filter((line) => line !== '').forEach((line) => {

					if (line.includes(':')) {

						let key = line.split(':')[0].trim().toLowerCase();
						let val = line.split(':').slice(1).join(':').trim();

						headers[key] = val;

					}

				});

			}

			if (raw_payload !== null) {
				payload = raw_payload;
			}


			if (callback !== null) {

				callback({
					headers: headers,
					payload: payload
				});

			}

		} else {

			if (callback !== null) {
				callback(null);
			}

		}

	},

	send: function(connection, data, callback) {

		connection = isConnection(connection) ? connection : null;
		data       = isObject(data)           ? data       : { headers: {}, payload: null };
		callback   = isFunction(callback)     ? callback   : null;


		if (connection !== null && connection.socket !== null) {

			let buffer  = null;
			let blob    = [];
			let headers = {};
			let payload = null;

			if (isObject(data.headers) === true) {
				headers = data.headers;
			}

			if (isBoolean(data.payload) === true) {
				payload = data.payload;
			} else {
				payload = data.payload || null;
			}


			if (payload !== null) {

				if (isBuffer(payload) === true) {
					// Do nothing
				} else if (isString(payload) === true) {
					payload = Buffer.from(payload, 'utf8');
				} else if (isObject(payload) === true) {
					payload = Buffer.from(JSON.stringify(payload, null, '\t'), 'utf8');
				}


				let tmp1 = headers['content-encoding']  || null;
				let tmp2 = headers['transfer-encoding'] || null;

				if (tmp1 === 'gzip' || tmp2 === 'gzip') {

					payload = encode_gzip(payload);

				} else if (tmp2 === 'chunked') {

					// Don't embrace Legacy Encoding
					delete headers['transfer-encoding'];

				}

			}


			if (isString(headers['@method']) === true && isString(headers['@url']) === true) {
				blob.push(headers['@method'] + ' ' + headers['@url'] + ' HTTP/1.1');
			} else if (isString(headers['@status']) === true) {
				blob.push('HTTP/1.1 ' + headers['@status']);
			} else {
				blob.push('HTTP/1.1 200 OK');
			}


			Object.keys(headers).filter((h) => h.startsWith('@') === false).forEach((name) => {

				let key = name.split('-').map((v) => v.charAt(0).toUpperCase() + v.substr(1).toLowerCase()).join('-');
				let val = headers[name];

				blob.push(key + ': ' + val);

			});


			blob.push('');
			blob.push('');

			buffer = Buffer.from(blob.join('\r\n'), 'utf8');


			if (buffer !== null) {

				connection.socket.write(buffer);

				if (connection.type === 'server') {

					if (payload !== null) {
						connection.socket.end(payload);
					} else {
						connection.socket.end();
					}

				}

				if (callback !== null) {
					callback(true);
				}

			} else {

				if (callback !== null) {
					callback(false);
				}

			}

		} else {

			if (callback !== null) {
				callback(false);
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

			connection.socket.setNoDelay(true);
			connection.socket.setKeepAlive(false, 0);
			connection.socket.allowHalfOpen = false;

			connection.socket.removeAllListeners('data');
			connection.socket.removeAllListeners('timeout');
			connection.socket.removeAllListeners('error');
			connection.socket.removeAllListeners('end');

			connection.socket.on('timeout', () => {

				if (connection.socket !== null) {

					connection.socket = null;

					let fragment = connection.fragment;
					if (fragment.partial === true) {

						connection.emit('timeout', [{
							headers: url.headers,
							payload: fragment.payload
						}]);

					} else {
						connection.emit('timeout', [ null ]);
					}

				}

			});

			connection.socket.on('error', () => {

				if (connection.socket !== null) {

					ondisconnect(connection, url);
					connection.socket = null;

				}

			});

			connection.socket.on('end', () => {

				if (connection.socket !== null) {

					ondisconnect(connection, url);
					connection.socket = null;

				}

			});

			onupgrade(connection, url);

			return connection;

		}


		return null;

	}

};


export { HTTP };

