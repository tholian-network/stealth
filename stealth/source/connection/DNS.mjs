
import dgram from 'dgram';

import { console, Buffer, Emitter, isArray, isBoolean, isBuffer, isFunction, isNumber, isObject, isString } from '../../extern/base.mjs';
import { IP                                                                                      } from '../../source/parser/IP.mjs';
import { URL                                                                                     } from '../../source/parser/URL.mjs';



const isAnswer = function(answer) {

	if (
		isObject(answer) === true
		&& isString(answer.domain) === true
		&& isString(answer.type) === true
		&& Object.keys(TYPES).includes(answer.type) === true
		&& (
			isArray(answer.value) === true
			|| isString(answer.value) === true
		)
	) {

		let check1 = answer.domain.split('.');
		let check2 = answer.domain.split('.').filter((label) => {
			return label.length > 0 && label.length < 64;
		});

		if (check1.length === check2.length) {
			return true;
		}

	}


	return false;

};

const isQuestion = function(question) {

	if (
		isObject(question) === true
		&& isString(question.domain) === true
		&& isString(question.type) === true
		&& Object.keys(TYPES).includes(question.type) === true
	) {

		let check1 = question.domain.split('.');
		let check2 = question.domain.split('.').filter((label) => {
			return label.length > 0 && label.length < 64;
		});

		if (check1.length === check2.length) {
			return true;
		}

	}


	return false;

};



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

const decode_domain = function(dictionary, payload, labels) {

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

					let entry = dictionary.labels[pointer] || [];
					if (entry.length > 0) {
						entry.forEach((label) => labels.push(label));
					} else {

						let tmp_labels = [];
						let tmp_bytes  = decode_domain(dictionary, dictionary.buffer.slice(pointer), tmp_labels);

						if (tmp_bytes > 0 && tmp_labels.length > 0) {
							dictionary.labels[pointer] = tmp_labels.slice();
							dictionary.labels[pointer].forEach((label) => labels.push(label));
							dictionary.pointers[tmp_labels.join('.')] = pointer;
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

const decode_question = function(dictionary, payload) {

	let labels = [];
	let offset = dictionary.offset;
	let bytes  = decode_domain(dictionary, payload.slice(offset), labels);

	if (bytes > 0) {
		dictionary.labels[offset] = labels.slice();
		offset += bytes;
	}

	let domain = labels.map((buf) => buf.toString('utf8')).join('.');
	let qtype  = (payload[offset + 0] << 8) + payload[offset + 1] || null;
	let qclass = (payload[offset + 2] << 8) + payload[offset + 3] || null;

	offset += 4;
	dictionary.offset = offset;


	let type = Object.keys(TYPES).find((key) => TYPES[key] === qtype) || null;
	if (type !== null && qclass === CLASSES['INTERNET']) {

		if (
			type === 'A'
			|| type === 'AAAA'
			|| type === 'CNAME'
			|| type === 'MX'
			|| type === 'NS'
			|| type === 'SRV'
			|| type === 'TXT'
		) {

			return {
				domain: domain,
				type:   type,
				value:  null
			};

		} else if (type === 'PTR') {

			let ip = null;

			if (domain.endsWith('.in-addr.arpa') === true) {

				let tmp = domain.split('.').slice(0, 4).reverse();

				ip = IP.parse(tmp.join('.'));

			} else if (domain.endsWith('.ip6.arpa') === true) {

				let tmp = domain.split('.').slice(0, 32).reverse();

				ip = IP.parse([
					tmp.slice( 0,  4).join(''),
					tmp.slice( 4,  8).join(''),
					tmp.slice( 8, 12).join(''),
					tmp.slice(12, 16).join(''),
					tmp.slice(16, 20).join(''),
					tmp.slice(20, 24).join(''),
					tmp.slice(24, 28).join(''),
					tmp.slice(28, 32).join('')
				].join(':'));

			}

			return {
				domain: null,
				type:   type,
				value:  ip
			};

		}

	}


	return null;

};

const decode_record = function(dictionary, payload) {

	let labels = [];
	let offset = dictionary.offset;
	let bytes  = decode_domain(dictionary, payload.slice(offset), labels);

	if (bytes > 0) {
		dictionary.labels[offset] = labels.slice();
		offset += bytes;
	}

	let domain   = labels.map((buf) => buf.toString('utf8')).join('.');
	let rtype    = (payload[offset + 0] << 8) + payload[offset + 1];
	let rclass   = (payload[offset + 2] << 8) + payload[offset + 3];
	// let rttl_hi  = (payload[offset + 4] << 8) + payload[offset + 5];
	// let rttl_lo  = (payload[offset + 6] << 8) + payload[offset + 7];
	let rdlength = (payload[offset + 8] << 8) + payload[offset + 9];

	offset += 10;
	dictionary.offset = offset + rdlength;


	let type = Object.keys(TYPES).find((key) => TYPES[key] === rtype) || null;
	if (type !== null && rdlength > 0 && rclass === CLASSES['INTERNET']) {

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
			let bytes = decode_domain(dictionary, payload.slice(offset, offset + rdlength), value);

			if (bytes > 0) {
				dictionary.labels[offset] = value.slice();
			}

			return {
				domain: domain,
				type:   type,
				value:  value.join('.')
			};

		} else if (type === 'MX') {

			let value  = [];
			let weight = (payload[offset + 0] << 8) + payload[offset + 1];
			let bytes  = decode_domain(dictionary, payload.slice(offset + 2, offset + rdlength), value);

			if (bytes > 0) {
				dictionary.labels[offset] = value.slice();
			}

			return {
				domain: domain,
				type:   type,
				value:  value.join('.'),
				weight: weight
			};

		} else if (type === 'NS') {

			let value = [];
			let bytes = decode_domain(dictionary, payload.slice(offset, offset + rdlength), value);

			if (bytes > 0) {
				dictionary.labels[offset] = value.slice();
			}

			return {
				domain: domain,
				type:   type,
				value:  value.join('.')
			};

		} else if (type === 'PTR') {

			let value = [];
			let bytes = decode_domain(dictionary, payload.slice(offset, offset + rdlength), value);

			if (bytes > 0) {
				dictionary.labels[offset] = value.slice();
			}

			let ip = null;

			if (domain.endsWith('.in-addr.arpa') === true) {

				let tmp = domain.split('.').slice(0, 4).reverse();

				ip = IP.parse(tmp.join('.'));

			} else if (domain.endsWith('.ip6.arpa') === true) {

				let tmp = domain.split('.').slice(0, 32).reverse();

				ip = IP.parse([
					tmp.slice( 0,  4).join(''),
					tmp.slice( 4,  8).join(''),
					tmp.slice( 8, 12).join(''),
					tmp.slice(12, 16).join(''),
					tmp.slice(16, 20).join(''),
					tmp.slice(20, 24).join(''),
					tmp.slice(24, 28).join(''),
					tmp.slice(28, 32).join('')
				].join(':'));

			}

			return {
				domain: value.join('.'),
				type:   type,
				value:  ip
			};

		} else if (type === 'SRV') {

			let priority = (payload[offset + 0] << 8) + payload[offset + 1];
			// let weight   = (payload[offset + 2] << 8) + payload[offset + 3];
			let port     = (payload[offset + 4] << 8) + payload[offset + 5];
			let value    = [];
			let bytes    = decode_domain(dictionary, payload.slice(offset + 6, offset + rdlength), value);

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
			let bytes  = decode_string(dictionary, payload.slice(offset, offset + rdlength), values);

			return {
				domain: domain,
				type:   type,
				value:  values
			};

		}

	}


	return null;

};

const decode_string = function(dictionary, payload, texts) {

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
		headers: {
			'@id':   0,
			'@type': null
		},
		payload: {
			questions: [],
			answers:   [],
		}
	};

	let dictionary = {
		buffer:   buffer,
		labels:   {},
		pointers: {},
		offset:   12
	};


	let id          = (buffer[0] << 8) + buffer[1];
	let query       = (buffer[2] & 0b10000000) !== 0b10000000;
	let operator    = (buffer[2] & 0b01111000);
	// let authorative = (buffer[2] & 4) === 4;
	// let truncated   = (buffer[2] & 2) === 2;
	// XXX: Recursion is unnecessary for our use-cases
	// let r_desired   = (buffer[2] & 1) === 1;
	// let r_available = (buffer[3] & 128) === 128;
	// let status_code = (buffer[3] & 15);
	let qdcount = (buffer[4]  << 8) + buffer[5];
	let ancount = (buffer[6]  << 8) + buffer[7];
	// let nscount = (buffer[8]  << 8) + buffer[9];
	// let arcount = (buffer[10] << 8) + buffer[11];


	if (id !== 0) {
		chunk.headers['@id'] = id;
	} else {
		chunk.headers['@id'] = 0;
	}

	if (query === true) {
		chunk.headers['@type'] = 'request';
	} else if (query === false) {
		chunk.headers['@type'] = 'response';
	}

	if (operator === 0) {

		if (qdcount > 0) {

			for (let q = 0; q < qdcount; q++) {

				let question = decode_question(dictionary, buffer);
				if (question !== null) {
					chunk.payload.questions.push(question);
				} else {
					break;
				}

			}

		}

		if (ancount > 0) {

			for (let a = 0; a < ancount; a++) {

				let record = decode_record(dictionary, buffer);
				if (record !== null) {
					chunk.payload.answers.push(record);
				} else {
					break;
				}

			}

		}

	}

	if (chunk.payload.answers.length > 0) {

		chunk.payload.answers.sort((a, b) => {

			let result = URL.compare(URL.parse(a.domain), URL.parse(b.domain));
			if (result === 0) {

				if (a.weight !== undefined && b.weight !== undefined) {

					if (a.weight < b.weight) return -1;
					if (b.weight < a.weight) return  1;

				} else {

					if (a.weight !== undefined) return  1;
					if (b.weight !== undefined) return -1;

				}

				return 0;

			} else {
				return result;
			}

		});

	}


	return chunk;

};

const encode_domain = function(dictionary, domain) {

	let check = domain.split('.').find((label) => label.length >= 64) || null;
	if (check !== null) {
		return null;
	}


	let buffer = null;

	let pointer = dictionary.pointers[domain] || null;
	if (pointer !== null) {
		// TODO: Encode as Pointer
	} else {

		let chunks = [];

		domain.split('.').forEach((label) => {

			chunks.push(Buffer.from([ label.length ]));
			chunks.push(Buffer.from(label, 'utf8'));

		});

		chunks.push(Buffer.from([ 0x00 ]));

		buffer = Buffer.concat(chunks);

	}

	return buffer;

};

const encode_question = function(dictionary, question) {

	let buffer = null;
	let offset = dictionary.offset;

	let domain = question.domain;
	let qtype  = TYPES[question.type];
	let qclass = CLASSES['INTERNET'];
	let domain_data = encode_domain(dictionary, domain);
	if (domain_data !== null) {

		buffer = Buffer.concat([
			domain_data,
			Buffer.from([
				(qtype >> 8)  & 0xff, qtype  & 0xff,
				(qclass >> 8) & 0xff, qclass & 0xff
			])
		]);

	}

	if (buffer !== null) {
		dictionary.labels[offset]   = domain.split('.');
		dictionary.pointers[domain] = offset;
		dictionary.offset          += buffer.length;
	}

	return buffer;

};

const encode_record = function(dictionary, record) {

	let buffer = null;


	console.log(record);

	let domain_data = encode_domain(dictionary, record.domain);
	if (domain_data !== null) {

		console.log(domain_data);

		// TODO: Huh?
	}

	let type  = record.type;
	let rtype = TYPES[type] || null;
	if (rtype !== null) {

		buffer = Buffer.from([
		]);

		// TODO: Encode domain
		// TODO: Encode rtype (2 bytes)
		// TODO: Encode rclass (2 bytes)
		// TODO: Encode TTL (2 bytes)
		// TODO: Encode rdlength (2 bytes)

		if (type === 'A') {
		} else if (type === 'AAAA') {
		} else if (type === 'CNAME') {
		} else if (type === 'MX') {
		} else if (type === 'NS') {
		} else if (type === 'PTR') {
		} else if (type === 'SRV') {
		} else if (type === 'TXT') {
		}

	}

	return buffer;

	// TODO: Encode Record{domain, type, value}
};

const encode_string = function(dictionary, values) {
	// TODO: Encode Buffer values[]
};

const encode = function(connection, data) {

	let id         = data.headers['@id'] || 0;
	let query      = connection.type === 'server' ? false : true;
	let questions  = data.payload.questions || [];
	let answers    = data.payload.answers   || [];
	let dictionary = {
		buffer:   Buffer.from([]),
		labels:   {},
		pointers: {},
		offset:   12
	};

	if (data.headers['@type'] === 'request') {
		query = true;
	} else if (data.headers['@type'] === 'response') {
		query = false;
	}

	let header_data  = Buffer.from([
		(id >> 8) & 0xff, id & 0xff,
		query === true ? 0b00000001 : 0b10000001, 0x00,
		0x00, 0x00, // questions
		0x00, 0x00, // answers
		0x00, 0x00, // authorative
		0x00, 0x00  // additional
	]);
	let payload_data = Buffer.from('', 'utf8');


	let qdcount = questions.length;
	let ancount = answers.length;

	if (connection.type === 'server') {

		if (qdcount > 0) {

			questions.forEach((data) => {

				let question = encode_question(dictionary, data);
				if (question !== null) {
					payload_data = Buffer.concat([ payload_data, question ]);
				} else {
					qdcount--;
				}

			});

		}

		if (ancount > 0) {

			answers.forEach((data) => {

				let answer = encode_record(dictionary, data);
				if (answer !== null) {
					payload_data = Buffer.concat([ payload_data, answer ]);
				} else {
					ancount--;
				}

			});

		}

	} else {

		if (qdcount > 0) {

			questions.forEach((data) => {

				let question = encode_question(dictionary, data);
				if (question !== null) {
					payload_data = Buffer.concat([ payload_data, question ]);
				} else {
					qdcount--;
				}

			});

		}

	}


	if (qdcount > 0) {
		header_data[4] = (qdcount >> 8) & 0xff;
		header_data[5] = qdcount        & 0xff;
	}

	if (ancount > 0) {
		header_data[6] = (ancount >> 8) & 0xff;
		header_data[7] = ancount        & 0xff;
	}

	if (payload_data.length > 0) {
		return Buffer.concat([ header_data, payload_data ]);
	}


	return null;

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

	DNS.receive(connection, message, (frame) => {

		if (frame !== null) {

			if (frame.headers['@type'] === 'request') {
				connection.emit('request', [ frame ]);
			} else if (frame.headers['@type'] === 'response') {
				connection.emit('response', [ frame ]);
			}

		}

	});

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
	this.remote = null;
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
			local:  null,
			remote: null
		};

		if (this.socket !== null) {
			data.local = this.socket.address().address + ':' + this.socket.address().port;
		}

		if (this.remote !== null) {
			data.remote = this.remote.host + ':' + this.remote.port;
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

						connection.socket.connect(url.port, hosts[0].ip, () => {

							connection.remote = {
								host: hosts[0].ip,
								port: url.port
							};

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

					// connection.socket.removeAllListeners('message');
					// connection.socket.removeAllListeners('error');
					// connection.socket.removeAllListeners('close');

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

					if (data.payload.questions.length === data.payload.answers.length) {
						payload = {
							questions: data.payload.questions.filter((q) => isQuestion(q)),
							answers:   data.payload.answers.filter((a) => isAnswer(a))
						};
					}

				}

			}


			if (headers !== null && payload !== null) {

				buffer = encode(connection, {
					headers: headers,
					payload: payload
				});

			}


			if (buffer !== null) {

				connection.socket.send(buffer, 0, buffer.length, (err) => {

					if (err === null) {

						connection.socket.setTTL(64);

						if (callback !== null) {
							callback(true);
						}

					} else {

						if (callback !== null) {
							callback(false);
						}

					}

				});

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

