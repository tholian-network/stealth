
import dgram from 'dgram';

import { Buffer, Emitter, isBoolean, isFunction, isNumber, isObject, isString } from '../../extern/base.mjs';
import { IP                                                                   } from '../../source/parser/IP.mjs';
import { URL                                                                  } from '../../source/parser/URL.mjs';



const RECORD_TYPES = {
	'A': 1,
	'AAAA': 1,
	'CNAME': 2,
	'NS': 3, // ???
	'PTR': 3,
	'SOA': 4,
	'TXT': 5
};

const decode_questions = function(amount, payload) {

	amount = isNumber(amount) ? amount : 0;


	let data = {
		bytes: 0,
		value: []
	};


	if (amount >= 1 && amount <= 65535) {


	}


	return data;

};

const decode_name = function(payload) {

	let string = {
		bytes: 0,
		value: null
	};

	let check = payload[0];
	if (check > 0) {

		let chunks = [];
		let length = payload[0];
		let offset = 1;

		while (length !== 0 && offset + length < payload.length) {

			let chunk = payload.slice(offset, offset + length);
			if (chunk.length > 0) {
				chunks.push(chunk.toString('utf8'));
			}

			offset += length;

			length = payload[offset];
			offset += 1;

		}

		string.bytes = offset;
		string.value = chunks.join('.');

	}

	return string;

};

export const decode = function(connection, buffer) {

	// TODO: What is minimum length of a buffer?
	if (buffer.length < 12) {
		return null;
	}

	let chunk = {
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


	let query       = (buffer[2] & 128) === 128;
	let operator    = (buffer[2] & 120);
	let authorative = (buffer[2] & 4) === 4;
	let truncated   = (buffer[2] & 2) === 2;
	// XXX: Recursion is unnecessary for our use-cases
	// let r_desired   = (buffer[2] & 1) === 1;
	// let r_available = (buffer[3] & 128) === 128;
	let status_code = (buffer[3] & 15);
	let questions   = (buffer[4]  << 8) + buffer[5];
	let answers     = (buffer[6]  << 8) + buffer[7];
	let authorities = (buffer[8]  << 8) + buffer[9];
	let additional  = (buffer[10] << 8) + buffer[11];
	let payload     = buffer.slice(12);


	if (query === true) {
		chunk.headers['@type'] = 'response';
	} else if (query === false) {
		chunk.headers['@type'] = 'request';
	}

	console.log('query?',       query ? 'response' : 'request');
	console.log('operator',     operator);
	console.log('authorative?', authorative);
	console.log('truncated?',   truncated);
	console.log('status_code',  status_code);

	console.log('questions:',   questions);
	console.log('answers:',     answers);
	console.log('authorities:', authorities);
	console.log('additional:',  additional);

	console.log('payload:',     payload);


	let offset = 0;

	if (questions > 0) {

		// TODO: let result = decode_questions(questions, payload) would make more sense!?
		let data = decode_questions(questions, payload);

		console.log(data);

		// if (domain.bytes > 0) {

		// 	let type = payload.slice(domain.bytes, domain.bytes + 1);
		// 	console.log(type);

		// 	console.log(domain);

		// }




	}

	// Each question payload contains a variable length octet before the label (name) itself
	// TODO: question_section
	// TODO: answer_section
	// TODO: authorities_section
	// TODO: additional_section


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

