
import dgram from 'dgram';

import { console, Buffer, Emitter, isArray, isBoolean, isBuffer, isFunction, isNumber, isObject, isString } from '../../extern/base.mjs';
import { IP                                                                                               } from '../../source/parser/IP.mjs';
import { URL                                                                                              } from '../../source/parser/URL.mjs';



const TYPES = {
	'A':      1,
	'AAAA':  28,
	'CNAME':  5,
	'MX':    15,
	'NS':     2,
	'OPT':   41,
	'PTR':   12,
	'SOA':    6,
	'SRV':   33,
	'TXT':   16
};

const CLASSES = {
	'IN': 1
};

const decode_domain = function(chunk, payload, labels) {

	let bytes = 0;
	let check = payload[bytes];

	if (check !== 0) {

		while (bytes < payload.length) {

			let length = payload[bytes];
			if (length === 0) {

				bytes += 1;

				break;

			} else if (length > 0 && length < 64) {

				let label = payload.slice(bytes + 1, bytes + 1 + length);

				labels.push(label);

				bytes += 1;
				bytes += length;

			} else if (length > 64) {

				let pointer = ((length - 192) << 8) + payload[bytes + 1];
				if (pointer >= 12) {

					let entry = chunk.state.labels[pointer] || [];
					if (entry.length > 0) {
						entry.forEach((label) => labels.push(label));
					} else {

						let tmp_labels = [];
						let tmp_bytes  = decode_domain(chunk, chunk.state.buffer.slice(pointer), tmp_labels);

						if (tmp_bytes > 0 && tmp_labels.length > 0) {
							chunk.state.labels[pointer] = tmp_labels.slice();
							chunk.state.labels[pointer].forEach((label) => labels.push(label));
						}

					}

				}

				bytes += 2;

				break;

			}

		}

	} else {

		bytes += 1;

	}

	return bytes;

};

const decode_question = function(chunk, payload) {

	let labels = [];
	let offset = chunk.state.offset;
	let bytes  = decode_domain(chunk, payload.slice(offset), labels);

	if (bytes > 0) {
		chunk.state.labels[offset] = labels.slice();
		offset += bytes;
	}

	let domain = labels.map((buf) => buf.toString('utf8')).join('.');
	let qtype  = (payload[offset + 0] << 8) + payload[offset + 1] || null;
	let qclass = (payload[offset + 2] << 8) + payload[offset + 3] || null;

	offset += 4;
	chunk.state.offset = offset;


	let type = Object.keys(TYPES).find((key) => TYPES[key] === qtype) || null;
	if (type !== null && qclass === CLASSES['IN']) {

		return {
			domain: domain,
			type:   type
		};

	}


	return null;

};

const decode_record = function(chunk, payload) {

	let labels = [];
	let offset = chunk.state.offset;
	let bytes  = decode_domain(chunk, payload.slice(offset), labels);

	if (bytes > 0) {
		chunk.state.labels[offset] = labels.slice();
		offset += bytes;
	}

	let domain   = labels.map((buf) => buf.toString('utf8')).join('.');
	let rtype    = (payload[offset + 0] << 8) + payload[offset + 1];
	let rclass   = (payload[offset + 2] << 8) + payload[offset + 3];
	let rttl_hi  = (payload[offset + 4] << 8) + payload[offset + 5];
	let rttl_lo  = (payload[offset + 6] << 8) + payload[offset + 7];
	let rdlength = (payload[offset + 8] << 8) + payload[offset + 9];

	offset            += 10;
	chunk.state.offset = offset + rdlength;


	let type = Object.keys(TYPES).find((key) => TYPES[key] === rtype) || null;
	if (type !== null && rdlength > 0) {

		if (type === 'A') {

			let ip = [
				payload[offset + 0],
				payload[offset + 1],
				payload[offset + 2],
				payload[offset + 3]
			].join('.');

			return {
				domain: domain,
				type:   type,
				value:  IP.parse(ip)
			};

		} else if (type === 'AAAA') {

			let toHex = (num) => {

				let val = (num).toString(16);
				if (val.length < 2) {
					val = '0' + val;
				}

				return val;
			};

			let ip = [
				toHex(payload[offset +  0]) + toHex(payload[offset +  1]),
				toHex(payload[offset +  2]) + toHex(payload[offset +  3]),
				toHex(payload[offset +  4]) + toHex(payload[offset +  5]),
				toHex(payload[offset +  6]) + toHex(payload[offset +  7]),
				toHex(payload[offset +  8]) + toHex(payload[offset +  9]),
				toHex(payload[offset + 10]) + toHex(payload[offset + 11]),
				toHex(payload[offset + 12]) + toHex(payload[offset + 13]),
				toHex(payload[offset + 14]) + toHex(payload[offset + 15])
			].join(':');

			return {
				domain: domain,
				type:   type,
				value:  IP.parse(ip)
			};

		} else if (type === 'CNAME') {

			let value = [];
			let bytes = decode_domain(chunk, payload.slice(offset, offset + rdlength), value);

			if (bytes > 0) {
				chunk.state.labels[offset] = value.slice();
			}

			return {
				domain: domain,
				type:   type,
				value:  value.join('.')
			};

		} else if (type === 'MX') {

			let value  = [];
			let weight = (payload[offset + 0] << 8) + payload[offset + 1];
			let bytes  = decode_domain(chunk, payload.slice(offset + 2, offset + rdlength), value);

			if (bytes > 0) {
				chunk.state.labels[offset] = value.slice();
			}

			return {
				domain: domain,
				type:   type,
				value:  value.join('.'),
				weight: weight
			};

		} else if (type === 'NS') {

			let value = [];
			let bytes = decode_domain(chunk, payload.slice(offset, offset + rdlength), value);

			if (bytes > 0) {
				chunk.state.labels[offset] = value.slice();
			}

			return {
				domain: domain,
				type:   type,
				value:  value.join('.')
			};

		} else if (type === 'OPT') {

			// TODO: EDNS RFC #6891

		} else if (type === 'PTR') {

			let value = [];
			let bytes = decode_domain(chunk, payload.slice(offset, offset + rdlength), value);

			if (bytes > 0) {
				chunk.state.labels[offset] = value.slice();
			}

			return {
				domain: domain,
				type:   type,
				value:  value.join('.')
			};

		} else if (type === 'SOA') {

			// TODO: Complicated

		} else if (type === 'SRV') {

			let priority = (payload[offset + 0] << 8) + payload[offset + 1];
			// let weight   = (payload[offset + 2] << 8) + payload[offset + 3];
			let port     = (payload[offset + 4] << 8) + payload[offset + 5];
			let value    = [];
			let bytes    = decode_domain(chunk, payload.slice(offset + 6, offset + rdlength), value);

			// XXX: RFC2782 is unclear.
			// - sort by priority, then if same priority sort by weight
			// - but always prefer priority=0
			// = therefore priority is actually the weight

			return {
				domain: domain,
				type:   type,
				value:  value.join('.'),
				weight: priority,
				port:   port
			};

		} else if (type === 'TXT') {

			let values = [];
			let bytes  = decode_string(payload.slice(offset, offset + rdlength), values);

			return {
				domain: domain,
				type:   type,
				value:  values
			};

		}

	}


	return null;

};

const decode_string = function(payload, texts) {

	let bytes = 0;
	let check = payload[bytes];

	if (check !== 0) {

		while (bytes < payload.length) {

			let length = payload[bytes];
			let text   = payload.slice(bytes + 1, bytes + 1 + length);

			texts.push(text);

			bytes += 1;
			bytes += length;

		}

	}

	return bytes;

};

const decode = function(connection, buffer) {

	if (buffer.length < 12) {
		return null;
	}


	let chunk = {
		state: {
			buffer: buffer,
			labels: {},
			offset: 12
		},
		headers: {
			'@type': null
		},
		payload: {
			questions:   [],
			answers:     [],
			authorities: [], // XXX: Are authority/additional section really necessary?
			additionals: []
		}
	};


	// let id          = (buffer[0] << 8) + buffer[1];
	let query       = (buffer[2] & 128) === 128;
	let operator    = (buffer[2] & 120);
	// let authorative = (buffer[2] & 4) === 4;
	// let truncated   = (buffer[2] & 2) === 2;
	// XXX: Recursion is unnecessary for our use-cases
	// let r_desired   = (buffer[2] & 1) === 1;
	// let r_available = (buffer[3] & 128) === 128;
	// let status_code = (buffer[3] & 15);
	let questions   = (buffer[4]  << 8) + buffer[5];
	let answers     = (buffer[6]  << 8) + buffer[7];
	let authorities = (buffer[8]  << 8) + buffer[9];
	let additional  = (buffer[10] << 8) + buffer[11];


	if (query === true) {
		chunk.headers['@type'] = 'response';
	} else if (query === false) {
		chunk.headers['@type'] = 'request';
	}

	if (operator === 0) {
		chunk.headers['@kind'] = 'query';
	} else if (operator === 1) {
		chunk.headers['@kind'] = 'iquery';
	} else if (operator === 2) {
		chunk.headers['@kind'] = 'status';
	}


	if (questions > 0) {

		for (let q = 0; q < questions; q++) {

			let question = decode_question(chunk, buffer);
			if (question !== null) {
				chunk.payload.questions.push(question);
			} else {
				break;
			}

		}

	}

	if (answers > 0) {

		for (let a = 0; a < answers; a++) {

			let record = decode_record(chunk, buffer);
			if (record !== null) {
				chunk.payload.answers.push(record);
			} else {
				break;
			}

		}

	}

	if (authorities > 0) {

		for (let a = 0; a < authorities; a++) {

			let record = decode_record(chunk, buffer);
			if (record !== null) {
				chunk.payload.authorities.push(record);
			} else {
				break;
			}

		}

	}

	// TODO: Support OPT records
	// if (additional > 0) {

	// 	for (let a = 0; a < additional; a++) {

	// 		console.error('PARSE ADDITIONAL #' + a);

	// 		let record = decode_record(chunk, buffer);
	// 		if (record !== null) {
	// 			chunk.payload.additionals.push(record);
	// 		} else {
	// 			break;
	// 		}

	// 	}

	// }


	return chunk;

};

export const encode = function(connection, data) {

	let buffer       = null;
	let header_data  = null;
	let payload_data = null;

	if (connection.type === 'server') {

		// TODO: data.headers['@type'];

	} else {


	}

	return buffer;

};

const onconnect = function(connection, url) {

	connection.type = 'client';

	connection.socket.on('message', (message) => {
		onmessage(connection, url, message);
	});

	setTimeout(() => {
		connection.emit('@connect');
	}, 0);

};

const onmessage = function(connection, url, message) {

	// if connection.type === 'server' emit('request')
	// if connection.type === 'client' emit('response')

};

const ondisconnect = function(connection, url) {

	if (connection.type === 'client') {

		if (url.headers !== null) {

			// TODO: Handle url.headers, url.payload
			// If empty then emit('timeout');
			// If not empty then emit('response');

		} else {
			connection.emit('timeout', [ null ]);
		}

	}

	connection.disconnect();

};

const onupgrade = function(connection, url) {

	connection.type = 'server';

	connection.socket.on('message', (message) => {
		onmessage(connection, url, message);
	});

	setTimeout(() => {
		connection.emit('@connect');
	}, 0);

};



const isConnection = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Connection]';
};

const isSocket = function(obj) {

	if (obj !== null && obj !== undefined) {
		return obj instanceof dgram.Socket;
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

	this.socket = socket || null;
	this.type   = null;


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
			local: null
		};

		if (this.socket !== null) {
			data.local = this.socket.localAddress + ':' + this.socket.localPort;
		}

		return {
			'type': 'Connection',
			'data': data
		};

	},

	disconnect: function() {

		if (this.socket !== null) {

			this.socket.removeAllListeners('listening');
			this.socket.removeAllListeners('message');
			this.socket.removeAllListeners('error');
			this.socket.removeAllListeners('close');

			this.socket.close();
			this.socket = null;

			this.emit('@disconnect');

		}

	}

});



const DNS = {

	connect: function(url, connection) {

		url        = isObject(url)            ? Object.assign(URL.parse(), url) : null;
		connection = isConnection(connection) ? Connection.from(connection)     : new Connection();


		if (url !== null) {

			let hosts = IP.sort(url.hosts);
			if (hosts.length > 0) {

				if (connection.socket === null) {

					let type = null;

					if (hosts[0].type === 'v4') {
						type = 'udp4';
					} else if (hosts[0].type === 'v6') {
						type = 'udp6';
					}

					try {

						connection.socket = dgram.createSocket(type);

						connection.socket.connect(
							url.port || 53,
							hosts[0].ip
						);

						connection.socket.once('connect', () => {
							onconnect(connection, url);
						});

					} catch (err) {
						connection.socket = null;
					}

				} else {

					setTimeout(() => {
						onconnect(connection, url);
					}, 0);

				}


				if (connection.socket !== null) {

					connection.socket.on('error', () => {

						if (connection.socket !== null) {

							ondisconnect(connection, url);
							connection.socket = null;

						}

					});

					connection.socket.on('close', () => {

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
		buffer     = isBuffer(buffer)         ? buffer     : null;
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
			let blob    = [ 0x00, 0x00 ];
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

			if (connection.type === 'client') {

				//   0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15
				// +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
				// |                 Message ID                    |
				// |QR|   Opcode  |AA|TC|RD|RA|    Z   |   RCODE   |

				// QR is query (0) or response(1)
				// OPCODE is four bit, 0 query
				// AA is authorative answer (1) or not
				// TC means if (1) message was truncated due to max length
				// RD means if (1) Recursion is desired, (OPTIONAL)
				// RA means if (1) Recursion is available (OPTIONAL)
				// Z is reserved and must be 0

				// RCODE is Response Code (4 bits)
				// 0 no error condition
				// 1 Format Error - the name server was unable to interpret the query
				// 2 Server failure - the name server was unable to process
				// 3 Name error - domain does not exist
				// 4 Not implemented
				// 5 Refused

			} else if (connection.type === 'server') {
			}
			// TODO: Encode headers
			// TODO: Encode payload

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

			connection.socket.setTTL(64);

			connection.socket.removeAllListeners('listening');
			connection.socket.removeAllListeners('message');
			connection.socket.removeAllListeners('error');
			connection.socket.removeAllListeners('close');

			connection.socket.on('error', () => {

				if (connection.socket !== null) {

					ondisconnect(connection, url);
					connection.socket = null;

				}

			});

			connection.socket.on('close', () => {

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


export { DNS };

