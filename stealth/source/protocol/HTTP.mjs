
import net  from 'net';
import zlib from 'zlib';

import { Buffer, Emitter, isBoolean, isBuffer, isFunction, isObject, isString } from '../../extern/base.mjs';



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



const onconnect = function(connection, ref) {

	let fragment = connection.fragment;

	fragment.encoding = 'identity';
	fragment.headers  = null;
	fragment.length   = null;
	fragment.mode     = 'headers';
	fragment.partial  = false;
	fragment.payload  = Buffer.from('', 'utf8');
	fragment.start    = 0;


	if (ref.headers !== null) {

		let tmp0 = ref.headers['content-length'] || null;
		if (tmp0 !== null) {

			let num = parseInt(tmp0, 10);
			if (Number.isNaN(num) === false) {
				fragment.length = num;
			}

		}


		let tmp1 = ref.headers['@status']       || null;
		let tmp2 = ref.headers['content-range'] || null;
		if (tmp1 === '206 Partial Content' && tmp2 !== null) {

			if (ref.payload !== null) {
				fragment.partial = true;
				fragment.payload = Buffer.from(ref.payload);
				fragment.start   = ref.payload.length;
			} else {
				fragment.partial = true;
				fragment.payload = Buffer.from('', 'utf8');
				fragment.start   = 0;
			}

		}

	}


	let timeout = Date.now() + 1000;

	connection.socket.on('data', (fragment) => {

		ondata(connection, ref, fragment);
		timeout = Date.now();

	});

	connection.interval = setInterval(() => {

		if (fragment.length === null) {

			if ((Date.now() - timeout) > 1000) {
				ondisconnect(connection, ref);
			}

		}

	}, 1000);


	connection.type = 'client';
	setTimeout(() => {
		connection.emit('@connect');
	}, 0);

};

const ondata = function(connection, ref, chunk) {

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
				ref.headers   = frame.headers;


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

						connection.emit('error', [{ type: 'stash' }]);

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
							headers: ref.headers,
							payload: fragment.payload
						}]);

					} else if (fragment.length === null) {

						connection.emit('request', [{
							headers: ref.headers,
							payload: fragment.payload
						}]);

					}

				}

			});

		}

	} else if (fragment.mode === 'payload') {

		fragment.payload = Buffer.concat([ fragment.payload, chunk ]);


		connection.emit('progress', [{
			headers: ref.headers,
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
					headers: ref.headers,
					payload: fragment.payload
				}]);

			} else if (fragment.length === null) {

				connection.emit('request', [{
					headers: ref.headers,
					payload: fragment.payload
				}]);

			}

		}

	}

};

const ondisconnect = function(connection, ref) {

	let fragment = connection.fragment;

	if (fragment.length !== null && fragment.length !== fragment.payload.length && isBuffer(fragment.headers) === true) {

		let check = fragment.headers.indexOf(Buffer.from('\r\n\r\n', 'utf8'));
		if (check !== -1) {

			HTTP.receive(connection, fragment.headers, (frame) => {

				ref.headers = frame.headers;

				if (frame.payload !== null) {

					if (frame.payload.length === fragment.length) {
						fragment.payload = frame.payload;
					}

				}

			});

		}

	}


	if (connection.type === 'client') {

		if (ref.headers !== null) {

			let code = (ref.headers['@status'] || '500').split(' ').shift();
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
						headers: ref.headers,
						payload: fragment.payload
					}]);

				} else if (fragment.length < fragment.payload.length) {

					if (fragment.partial === true) {

						connection.emit('timeout', [{
							headers: ref.headers,
							payload: fragment.payload
						}]);

					} else {
						connection.emit('timeout', [ null ]);
					}

				} else {
					connection.emit('error', [{ type: 'stash' }]);
				}

			} else if (code === '301' || code === '307' || code === '308') {

				let tmp = ref.headers['location'] || null;
				if (tmp !== null) {
					connection.emit('redirect', [{ headers: ref.headers }]);
				} else {
					connection.emit('error', [{ code: code, type: 'request', cause: 'headers-location' }]);
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

const onupgrade = function(connection /*, ref */) {

	connection.type = 'server';
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

	connect: function(ref, connection) {

		ref        = isObject(ref)            ? ref                         : null;
		connection = isConnection(connection) ? Connection.from(connection) : new Connection();


		if (ref !== null) {

			let hosts = ref.hosts.sort((a, b) => {

				if (a.scope === 'private' && b.scope === 'private') {

					if (a.type === 'v4' && b.type === 'v4') return 0;
					if (a.type === 'v4') return -1;
					if (b.type === 'v4') return  1;

				}

				if (a.scope === 'private') return -1;
				if (b.scope === 'private') return  1;

				if (a.type === 'v4' && b.type === 'v4') return 0;
				if (a.type === 'v4') return -1;
				if (b.type === 'v4') return  1;

				return 0;

			});

			if (hosts.length > 0) {

				if (connection.socket === null) {

					try {

						connection.socket = net.connect({
							host: hosts[0].ip,
							port: ref.port || 80,
						}, () => {

							connection.socket.setNoDelay(true);
							connection.socket.setKeepAlive(false, 0);
							connection.socket.allowHalfOpen = false;

							onconnect(connection, ref);

						});

					} catch (err) {
						connection.socket = null;
					}

				} else {

					connection.socket.setNoDelay(true);
					connection.socket.setKeepAlive(false, 0);
					connection.socket.allowHalfOpen = false;

					setTimeout(() => {
						onconnect(connection, ref);
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
									headers: ref.headers,
									payload: fragment.payload
								}]);

							} else {
								connection.emit('timeout', [ null ]);
							}

						}

					});

					connection.socket.on('error', () => {

						if (connection.socket !== null) {

							ondisconnect(connection, ref);
							connection.socket = null;

						}

					});

					connection.socket.on('end', () => {

						if (connection.socket !== null) {

							ondisconnect(connection, ref);
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

			} else {

				return {
					headers: headers,
					payload: payload
				};

			}

		} else {

			if (callback !== null) {
				callback(null);
			} else {
				return null;
			}

		}

	},

	send: function(connection, data) {

		connection = isConnection(connection) ? connection : null;
		data       = isObject(data)           ? data       : { headers: {}, payload: null };


		if (connection !== null) {

			if (connection.socket !== null) {

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

					if (isBuffer(payload)) {
						// Do nothing
					} else if (isString(payload)) {
						payload = Buffer.from(payload, 'utf8');
					} else if (isObject(payload)) {
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

				connection.socket.write(blob.join('\r\n'));


				if (connection.type === 'server') {

					if (payload !== null) {
						connection.socket.end(payload);
					} else {
						connection.socket.end();
					}

				}


				return true;

			}

		}


		return false;

	},

	upgrade: function(tunnel, ref) {

		ref = isObject(ref) ? ref : { headers: {} };


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

			connection.socket.on('data', (fragment) => {
				ondata(connection, ref, fragment);
			});

			connection.socket.on('timeout', () => {

				if (connection.socket !== null) {

					connection.socket = null;

					let fragment = connection.fragment;
					if (fragment.partial === true) {

						connection.emit('timeout', [{
							headers: ref.headers,
							payload: fragment.payload
						}]);

					} else {
						connection.emit('timeout', [ null ]);
					}

				}

			});

			connection.socket.on('error', () => {

				if (connection.socket !== null) {

					ondisconnect(connection, ref);
					connection.socket = null;

				}

			});

			connection.socket.on('end', () => {

				if (connection.socket !== null) {

					ondisconnect(connection, ref);
					connection.socket = null;

				}

			});

			onupgrade(connection, ref);

			return connection;

		}


		return null;

	}

};


export { HTTP };

