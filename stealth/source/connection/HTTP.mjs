
import net  from 'net';
import zlib from 'zlib';

import { Buffer, Emitter, isArray, isBoolean, isBuffer, isFunction, isNumber, isObject, isString } from '../../extern/base.mjs';
import { DATETIME                                                                                } from '../../source/parser/DATETIME.mjs';
import { IP                                                                                      } from '../../source/parser/IP.mjs';
import { URL                                                                                     } from '../../source/parser/URL.mjs';



const METHODS = [
	'CONNECT',
	'DELETE',
	'GET',
	'HEAD',
	'OPTIONS',
	'PATCH',
	'POST',
	'PUT',
	'TRACE'
];


const EMPTYLINE = Buffer.from('\r\n\r\n', 'utf8');

const decode_chunked = function(payload) {

	let target = Buffer.from('', 'utf8');
	let chunks = payload.toString('utf8').split('\r\n').map((value) => {
		return Buffer.from(value, 'utf8');
	});


	while (chunks.length >= 2) {

		let length = parseInt(chunks.shift().toString('utf8'), 16);
		let chunk  = chunks.shift();

		if (chunk.length === length) {

			target = Buffer.concat([ target, chunk ]);

		} else {

			// XXX: Specification says nothing about this case, but it happens
			// https://tools.ietf.org/html/rfc2616#section-3.6.1

			target = Buffer.concat([ target, chunk.slice(0, length) ]);
			break;

		}

		if (chunks.length === 1 && chunks[0] === '') {
			break;
		}

	}

	return target;

};

const decode = function(connection, buffer) {

	if (buffer.length < 5) {
		return null;
	}


	let chunk = {
		headers: {
			'@encoding': null,
			'@length':   null,
			'@partial':  false,
			'@range':    [ 0, Infinity ]
		},
		payload: null
	};


	let msg_headers      = null;
	let msg_payload      = null;
	let payload_complete = false;


	let msg_index = buffer.indexOf(EMPTYLINE);
	if (msg_index !== -1) {

		msg_headers = buffer.slice(0, msg_index);
		msg_payload = buffer.slice(msg_index + 4);

		if (msg_payload.slice(msg_payload.length - 4).toString('utf8') === EMPTYLINE.toString('utf8')) {
			msg_payload      = msg_payload.slice(0, msg_payload.length - 4);
			payload_complete = true;
		}

	} else {

		msg_headers = buffer;

	}


	if (msg_headers !== null) {

		let fields = msg_headers.toString('utf8').split('\r\n').map((line) => line.trim());
		if (fields.length > 1) {

			let start_line = fields.shift();
			let check      = start_line.split(' ').shift();

			if (METHODS.includes(check) === true) {

				chunk.headers['@method'] = check;

				let url = start_line.split(' ').slice(1).shift();
				if (
					url.startsWith('/') === true
					|| url.startsWith('http://') === true
					|| url.startsWith('https://') === true
				) {
					chunk.headers['@url'] = url;
				}

			} else if (check === 'HTTP/1.1' || check === 'HTTP/1.0' || check === 'HTTP/0.9') {

				let status = start_line.split(' ').slice(1).join(' ').trim();
				if (status !== '') {
					chunk.headers['@status'] = status;
				}

			}


			fields.filter((line) => line !== '').forEach((line) => {

				if (line.includes(':') === true) {

					let key = line.split(':')[0].toLowerCase().trim();
					let val = line.split(':').slice(1).join(':').trim();

					if (key.length > 0 && val.length > 0) {

						let num = parseInt(val, 10);
						let dat = DATETIME.parse(val);

						if (Number.isNaN(num) === false && (num).toString() === val) {
							val = num;
						} else if (val === 'true') {
							val = true;
						} else if (val === 'false') {
							val = false;
						} else if (val === 'null') {
							val = null;
						} else if (DATETIME.isDATETIME(dat) === true) {
							val = dat;
						}

						chunk.headers[key] = val;

					}

				}

			});

		}


		let method         = chunk.headers['@method']        || null;
		let status         = chunk.headers['@status']        || null;
		let content_length = chunk.headers['content-length'] || null;
		let content_range  = chunk.headers['content-range']  || null;
		let range          = chunk.headers['range']          || null;

		if (status === '206 Partial Content' && content_range !== null) {

			let unit  = content_range.split(' ').shift();
			let check = content_range.split('/').pop();

			if (unit === 'bytes' && check !== '*') {

				let tmp    = content_range.split(' ').pop().split('/').shift().split('-');
				let length = parseInt(content_range.split('/').pop(), 10);
				let start  = parseInt(tmp[0], 10);
				let end    = parseInt(tmp[1], 10);

				if (
					Number.isNaN(length) === false
					&& length > 0
					&& Number.isNaN(start) === false
					&& start >= 0
					&& start < length
					&& Number.isNaN(end) === false
					&& end >= 0
					&& end < length
				) {

					chunk.headers['@length']  = length;
					chunk.headers['@partial'] = true;
					chunk.headers['@range']   = [ start, end ];

				}

			} else if (unit === 'bytes' && check === '*') {

				let tmp    = content_range.split(' ').pop().split('/').shift().split('-');
				let start  = parseInt(tmp[0], 10);
				let end    = parseInt(tmp[1], 10);

				if (
					Number.isNaN(start) === false
					&& start >= 0
					&& Number.isNaN(end) === false
					&& end > start
				) {

					chunk.headers['@length']  = Infinity;
					chunk.headers['@partial'] = true;
					chunk.headers['@range']   = [ start, end ];

				}

			}

		} else if (method === 'GET' && range !== null) {

			if (isNumber(content_length) === true && content_length > 0) {
				chunk.headers['@length'] = content_length;
			} else {
				chunk.headers['@length'] = Infinity;
			}

			let unit  = range.split('=').shift();
			let check = range.split('=').pop().split(',').map((r) => r.trim()).filter((r) => r.includes('-'));
			if (unit === 'bytes' && check.length === 1) {

				let tmp   = check[0].split('-');
				let start = null;
				let end   = null;

				if (tmp[0] !== '') {
					start = parseInt(tmp[0], 10);
				} else {
					// XXX: RFC says negative ranges are allowed to note
					// remaining bytes relative from size, but in practice
					// all HTTP servers fallback to responding with 0-(size-1)
					start = 0;
				}

				if (tmp[1] !== '') {
					end = parseInt(tmp[1], 10);
				} else {
					end = Infinity;
				}

				if (
					Number.isNaN(start) === false
					&& start >= 0
					&& (
						Number.isNaN(end) === false
						|| end === Infinity
					)
				) {
					chunk.headers['@partial'] = true;
					chunk.headers['@range']   = [ start, end ];
				}

			} else {

				// TODO: Multiple Ranges are not supported by any publicly
				// used web server software (apache, caddy, nginx etc are
				// all broken)

			}

		} else if (isNumber(content_length) === true && content_length > 0) {

			chunk.headers['@length'] = content_length;

			if (msg_payload !== null && msg_payload.length < content_length) {
				chunk.headers['@partial'] = true;
			} else {
				chunk.headers['@partial'] = false;
			}

			chunk.headers['@range'] = [ 0, content_length - 1 ];

		} else if (payload_complete === true) {

			chunk.headers['@length']  = msg_payload.length;
			chunk.headers['@partial'] = false;
			chunk.headers['@range']   = [ 0, msg_payload.length - 1 ];

		} else {

			chunk.headers['@length']  = Infinity;
			chunk.headers['@partial'] = null;
			chunk.headers['@range']   = [ 0, Infinity ];

		}

		let sorted_headers = {};

		Object.keys(chunk.headers).sort((a, b) => {
			if (a < b) return -1;
			if (b < a) return  1;
			return 0;
		}).forEach((header) => {
			sorted_headers[header] = chunk.headers[header];
		});

		chunk.headers = sorted_headers;

	}


	if (msg_payload !== null) {

		let expected = chunk.headers['@length'];

		let range = chunk.headers['@range'];
		if (range[1] !== Infinity) {
			// XXX: Ranges start with byte 0, so subtraction is off-by-one
			expected = (range[1] + 1) - range[0];
		}

		if (expected === Infinity || expected === msg_payload.length) {

			let content_encoding  = chunk.headers['content-encoding']  || null;
			let transfer_encoding = chunk.headers['transfer-encoding'] || null;

			if (content_encoding === 'gzip' || transfer_encoding === 'gzip') {

				try {
					chunk.payload              = zlib.gunzipSync(msg_payload);
					chunk.headers['@encoding'] = 'identity';
				} catch (err) {
					chunk.payload              = msg_payload;
					chunk.headers['@encoding'] = 'gzip';
				}

			} else if (transfer_encoding === 'chunked') {

				chunk.payload              = decode_chunked(msg_payload);
				chunk.headers['@encoding'] = 'identity';

			} else {

				chunk.payload              = msg_payload;
				chunk.headers['@encoding'] = 'identity';

			}

		} else {

			chunk.payload              = null;
			chunk.headers['@encoding'] = null;

		}

	}


	if (Object.keys(chunk.headers).length > 0) {
		return chunk;
	}


	return null;

};

const encode_chunked = function(payload) {

	return Buffer.concat([
		Buffer.from((payload.length).toString(16), 'utf8'),
		Buffer.from('\r\n', 'utf8'),
		payload,
		Buffer.from('\r\n', 'utf8'),
		Buffer.from('\r\n', 'utf8')
	]);

};

const encode = function(connection, data) {

	if (Object.keys(data.headers).length === 0) {
		return null;
	}


	let msg_payload = Buffer.alloc(0);

	if (data.payload !== null) {

		if (isArray(data.headers['@range']) === true) {

			if (connection.type === 'client') {

				if (data.headers['@range'][1] !== Infinity) {
					data.headers['range'] = 'bytes=' + data.headers['@range'][0] + '-' + data.headers['@range'][1];
				} else {
					data.headers['range'] = 'bytes=' + data.headers['@range'][0] + '-';
				}

			} else if (connection.type === 'server') {

				if (isNumber(data.headers['@length']) === true) {
					data.headers['content-range'] = 'bytes ' + data.headers['@range'][0] + '-' + (data.headers['@range'][1] || '*') + '/' + data.headers['@length'];
					delete data.headers['content-length'];
				} else {
					data.headers['content-range'] = 'bytes ' + data.headers['@range'][0] + '-' + (data.headers['@range'][1] || '*') + '/*';
					delete data.headers['content-length'];
				}

			}

		} else if (isNumber(data.headers['@length']) === true) {

			data.headers['content-length'] = data.headers['@length'];

		}


		if (data.headers['@encoding'] === 'gzip') {

			try {

				msg_payload                      = zlib.gzipSync(data.payload);
				data.headers['@encoding']        = 'gzip';
				data.headers['content-encoding'] = 'gzip';

				if (isString(data.headers['content-range']) === true) {
					data.headers['content-range'] = data.headers['content-range'].split('/').shift() + '/' + msg_payload.length;
				} else {
					data.headers['content-length'] = msg_payload.length;
				}

				delete data.headers['transfer-encoding'];

			} catch (err) {

				msg_payload                      = data.payload;
				data.headers['@encoding']        = 'identity';
				data.headers['content-encoding'] = 'identity';

				if (isString(data.headers['content-range']) === true) {
					data.headers['content-range'] = data.headers['content-range'].split('/').shift() + '/' + msg_payload.length;
				} else {
					data.headers['content-length'] = msg_payload.length;
				}

				delete data.headers['transfer-encoding'];

			}

		} else if (data.headers['@encoding'] === 'chunked') {

			msg_payload                       = encode_chunked(data.payload);
			data.headers['@encoding']         = 'chunked';
			data.headers['transfer-encoding'] = 'chunked';
			delete data.headers['content-encoding'];
			delete data.headers['content-length'];

		} else {

			msg_payload                      = data.payload;
			data.headers['content-encoding'] = 'identity';
			data.headers['content-length']   = msg_payload.length;
			delete data.headers['transfer-encoding'];

		}

	}


	let fields = [];

	if (connection.type === 'client') {

		let method = data.headers['@method'] || null;
		if (METHODS.includes(method) === true && isString(data.headers['@url']) === true) {
			fields.push(method + ' ' + data.headers['@url'] + ' HTTP/1.1');
		} else if (METHODS.includes(method) === true) {
			fields.push(method + ' / HTTP/1.1');
		} else if (isString(data.headers['@url']) === true) {
			fields.push('GET ' + data.headers['@url'] + ' HTTP/1.1');
		} else {
			fields.push('GET / HTTP/1.1');
		}

	} else if (connection.type === 'server') {

		if (isString(data.headers['@status']) === true) {
			fields.push('HTTP/1.1 ' + data.headers['@status']);
		} else {
			fields.push('HTTP/1.1 200 OK');
		}

	}

	Object.keys(data.headers).filter((h) => h.startsWith('@') === false).sort().forEach((header) => {

		let key = header.split('-').map((v) => v.charAt(0).toUpperCase() + v.substr(1).toLowerCase()).join('-');
		let val = data.headers[header];

		if (isNumber(val) === true) {
			fields.push(key + ': ' + val);
		} else if (isBoolean(val) === true) {
			fields.push(key + ': ' + val);
		} else if (val === null) {
			fields.push(key + ': ' + val);
		} else if (DATETIME.isDATETIME(val) === true) {
			fields.push(key + ': ' + DATETIME.toIMF(val));
		} else if (isString(val) === true) {
			fields.push(key + ': ' + val);
		}

	});


	let msg_headers = Buffer.from(fields.join('\r\n'), 'utf8');


	return Buffer.concat([
		msg_headers,
		EMPTYLINE,
		msg_payload,
		data.headers['@encoding'] === 'chunked' ? Buffer.alloc(0) : EMPTYLINE
	]);

};



const onconnect = function(connection, url) {

	if (url.payload !== null) {

		if (
			isString(url.headers['@status']) === true
			&& url.headers['@status'] === '206 Partial Content'
		) {

			connection.fragment = url.payload;

			url.headers = {
				'@encoding':       url.headers['@encoding'],
				'@length':         null,
				'@method':         'GET',
				'@partial':        true,
				'@range':          [ connection.fragment.length, Infinity ],
				'@url':            URL.render(url),
				'accept-encoding': url.headers['@encoding']
			};
			url.payload = null;

		}

	}


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

		HTTP.receive(connection, connection.fragment, (frame) => {

			if (frame !== null) {

				url.headers = frame.headers;
				url.payload = frame.payload;


				if (connection.type === 'client') {

					if (frame.headers['@length'] !== Infinity) {

						if (frame.payload !== null) {

							connection.socket.end();

						} else {

							connection.emit('progress', [{
								headers: frame.headers,
								payload: frame.payload
							}, {
								bytes: connection.fragment.length - header_index - 4,
								total: frame.headers['@length']
							}]);

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

							connection.emit('progress', [{
								headers: frame.headers,
								payload: frame.payload
							}, {
								bytes: connection.fragment.buffer.length - header_index - 4,
								total: frame.headers['@length']
							}]);

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

		HTTP.receive(connection, connection.fragment, (frame) => {

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

	return false;

};

const Connection = function(socket) {

	this.fragment = Buffer.alloc(0);
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

			this.socket.removeAllListeners('data');
			this.socket.removeAllListeners('timeout');
			this.socket.removeAllListeners('error');
			this.socket.removeAllListeners('end');

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
							ondisconnect(connection, url);
						}

					});

					connection.socket.on('error', () => {

						if (connection.socket !== null) {
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

			let data = decode(connection, buffer);
			if (data !== null) {

				if (callback !== null) {

					callback({
						headers: data.headers,
						payload: data.payload
					});

				}

			} else {

				if (callback !== null) {
					callback(null);
				}

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
			let headers = {};
			let payload = null;

			if (isObject(data.headers) === true) {
				headers = data.headers;
			}

			if (isBoolean(data.payload) === true) {
				payload = data.payload;
			} else if (isBuffer(data.payload) === true) {
				payload = data.payload;
			} else if (isObject(data.payload) === true) {
				payload = Buffer.from(JSON.stringify(payload, null, '\t'), 'utf8');
			}


			if (headers !== null) {

				buffer = encode(connection, {
					headers: headers,
					payload: payload
				});

			}


			if (buffer !== null) {

				if (connection.type === 'client') {
					connection.socket.write(buffer);
				} else if (connection.type === 'server') {
					connection.socket.end(buffer);
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
					ondisconnect(connection, url);
				}

			});

			connection.socket.on('error', () => {

				if (connection.socket !== null) {
					ondisconnect(connection, url);
				}

			});

			connection.socket.on('end', () => {

				if (connection.socket !== null) {
					ondisconnect(connection, url);
				}

			});

			onupgrade(connection, url);

			return connection;

		}


		return null;

	}

};


export { HTTP };

