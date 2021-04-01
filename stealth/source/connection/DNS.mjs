
import dgram from 'dgram';

import { Buffer, Emitter, isBoolean, isBuffer, isFunction, isNumber, isObject, isString } from '../../extern/base.mjs';
import { IP                                                                             } from '../../source/parser/IP.mjs';
import { URL                                                                            } from '../../source/parser/URL.mjs';



const QTYPE = {
	'A':      1,
	'AAAA':  28,
	'CNAME':  5,
	'MX':    15,
	'NS':     2,
	'PTR':   12,
	'SOA':    6,
	'TXT':   16
};

const QCLASS = {
	'IN': 1
};

const decode_question = function(chunk, payload) {

	let offset = chunk.state.offset;
	let length = payload[offset];
	if (length > 0 && length < 64) {

		offset += 1;


		let labels = [];

		while (offset + length + 1 < payload.length) {

			let label = payload.slice(offset, offset + length);

			offset += length;
			length  = payload[offset];
			offset += 1;

			labels.push(label);

			if (Number.isNaN(length) === true || length === 0) {
				break;
			}

		}

		let domain = labels.join('.');
		let qtype  = (payload[offset + 0] << 8) + payload[offset + 1] || null;
		let qclass = (payload[offset + 2] << 8) + payload[offset + 3] || null;

		offset += 4;

		chunk.state.offset = offset;


		let type = Object.keys(QTYPE).find((key) => QTYPE[key] === qtype) || null;
		if (type !== null && qclass === QCLASS['IN']) {

			return {
				domain: domain,
				type:   type
			};

		}

	} else if (length & 0b11000000 === 0b11000000) {

		// XXX: What to do here? QNAME cannot be part of database

	}


	return null;

};

const decode_record = function(chunk, payload, type) {

	let offset = chunk.state.offset;
	let length = payload[offset];
	if (length > 0 && length < 64) {

		let labels = [];

		while (offset + 1 < payload.length) {

			let length = payload[offset];
			if (length === 0) {

				offset += 1;

				break;

			} else if (length > 0 && length < 64) {

				let label = payload.slice(offset + 1, offset + 1 + length);

				labels.push(label);

				offset += 1;
				offset += length;

			} else if (length > 64) {

				let pointer = (length - 192);
				if (pointer >= 12) {

					let entry = chunk.state.database[pointer] || [];
					if (entry.length > 0) {
						entry.forEach((label) => labels.push(label));
					}

				}

				offset += 1;

			}

		}

		// TODO: Assumption about pointers is wrong.
		// Pointers can also point to the length byte before a PARTIAL of a domain
		// (and needs to be injected until the null byte is seen again)
		//
		// --------
		// 3 foo
		// 3 bar
		// 3 com
		// --------
		// 3 bar
		// 192 + 4 (+ offset to header)
		//

		if (labels.length > 0) {
			chunk.state.database[chunk.state.offset] = labels.slice();
		}


		// TODO
		// 2 bytes TYPE
		// 2 bytes CLASS
		// 4 bytes TTL 32bit in seconds
		// 2 bytes RDLENGTH
		// variable bytes RDATA (dependent on type)

		let qtype  = (payload[offset + 0] << 8) + payload[offset + 1] || null;
		let qclass = (payload[offset + 2] << 8) + payload[offset + 3] || null;

		// XXX: TTL is a 32 bit integer which cannot be represented in JS
		let ttl_hi = (payload[offset + 4] << 8) + payload[offset + 5] || 0;
		let ttl_lo = (payload[offset + 6] << 8) + payload[offset + 7] || 0;

		offset += 8;

		// TODO: Parse RDATA specific format (RFC1035 3.3.1 following)

		chunk.state.offset = offset;

	} else if (length > 64) {

		// TODO?

	}


	return null;

};

const decode = function(connection, buffer) {

	if (buffer.length < 12) {
		return null;
	}


	let chunk = {
		state: {
			database: {},
			offset:   12
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

	if (additional > 0) {

		for (let a = 0; a < additional; a++) {

			let record = decode_record(chunk, buffer);
			if (record !== null) {
				chunk.payload.additionals.push(record);
			} else {
				break;
			}

		}

	}


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

