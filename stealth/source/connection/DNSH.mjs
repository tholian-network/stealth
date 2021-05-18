
import tls  from 'tls';
import zlib from 'zlib';

import { console, Buffer, Emitter, isArray, isBuffer, isFunction, isNumber, isObject, isString } from '../../extern/base.mjs';
// import { HTTP                                                                         } from '../../source/connection/HTTPS.mjs';
import { IP                                                                           } from '../../source/parser/IP.mjs';
import { URL                                                                          } from '../../source/parser/URL.mjs';

import { DNS as TEST } from './DNS.mjs';


const EMPTYLINE = Buffer.from('\r\n\r\n', 'utf8');

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

const METHODS = [
	'GET',
	'POST'
];

const MIME = {
	'dns':  { ext: 'dns',  type: 'other', binary: true,  format: 'application/dns-message' },
	'json': { ext: 'json', type: 'text',  binary: false, format: 'application/dns-json'    }
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

const decode_message = function(connection, buffer) {

	let chunk = {
		headers: {
			'@id':   0,
			'@type': null
		},
		payload: {
			questions: [],
			answers:   []
		}
	};

	let frame = {
		headers: {
			'@transfer': {
				'encoding': null,
				'length':   null
			}
		},
		payload: null
	};


	let msg_headers = null;
	let msg_payload = null;


	let msg_index = buffer.indexOf(EMPTYLINE);
	if (msg_index !== -1) {

		msg_headers = buffer.slice(0, msg_index);
		msg_payload = buffer.slice(msg_index + 4);

		if (msg_payload.slice(msg_payload.length - 4).toString('utf8') === EMPTYLINE.toString('utf8')) {
			msg_payload = msg_payload.slice(0, msg_payload.length - 4);
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

				frame.headers['@method'] = check;

				let url = start_line.split(' ').slice(1).shift();
				if (url.startsWith('/') === true) {
					frame.headers['@url'] = url;
				}

			} else if (check === 'HTTP/1.1' || check === 'HTTP/1.0' || check === 'HTTP/0.9') {

				let status = start_line.split(' ').slice(1).join(' ').trim();
				if (status !== '') {
					frame.headers['@status'] = status;
				}

			}


			fields.filter((line) => line !== '').forEach((line) => {

				if (line.includes(':') === true) {

					let key = line.split(':')[0].toLowerCase().trim();
					let val = line.split(':').slice(1).join(':').trim();

					if (key.length > 0 && val.length > 0) {

						let num = parseInt(val, 10);

						if (Number.isNaN(num) === false && (num).toString() === val) {
							val = num;
						} else if (val === 'true') {
							val = true;
						} else if (val === 'false') {
							val = false;
						} else if (val === 'null') {
							val = null;
						}

						frame.headers[key] = val;

					}

				}

			});

		}


		let content_length = frame.headers['content-length'] || null;

		if (isNumber(content_length) === true && content_length > 0) {

			frame.headers['@transfer']['length'] = content_length;

		} else {

			frame.headers['@transfer']['length'] = Infinity;

		}

		let sorted_headers = {};

		Object.keys(frame.headers).sort((a, b) => {
			if (a < b) return -1;
			if (b < a) return  1;
			return 0;
		}).forEach((header) => {
			sorted_headers[header] = frame.headers[header];
		});

		frame.headers = sorted_headers;

	}


	if (msg_payload !== null) {

		let expected = frame.headers['@transfer']['length'];

		if (expected === Infinity || expected === msg_payload.length) {

			let content_encoding  = frame.headers['content-encoding']  || null;
			let transfer_encoding = frame.headers['transfer-encoding'] || null;

			if (content_encoding === 'gzip' || transfer_encoding === 'gzip') {

				try {

					frame.payload                          = zlib.gunzipSync(msg_payload);
					frame.headers['content-encoding']      = 'identity';
					frame.headers['@transfer']['encoding'] = 'gzip';

				} catch (err) {

					frame.payload                          = msg_payload;
					frame.headers['content-encoding']      = 'gzip';
					frame.headers['@transfer']['encoding'] = 'gzip';

				}

			} else if (content_encoding === 'deflate' || transfer_encoding === 'deflate') {

				try {

					frame.payload                          = zlib.deflateSync(msg_payload);
					frame.headers['content-encoding']      = 'identity';
					frame.headers['@transfer']['encoding'] = 'deflate';

				} catch (err) {

					frame.payload                          = msg_payload;
					frame.headers['content-encoding']      = 'deflate';
					frame.headers['@transfer']['encoding'] = 'deflate';

				}

			} else if (content_encoding === 'br' || transfer_encoding === 'br') {

				try {

					frame.payload                          = zlib.brotliDecompressSync(msg_payload);
					frame.headers['content-encoding']      = 'identity';
					frame.headers['@transfer']['encoding'] = 'br';

				} catch (err) {

					frame.payload                          = msg_payload;
					frame.headers['content-encoding']      = 'br';
					frame.headers['@transfer']['encoding'] = 'br';

				}

			} else if (transfer_encoding === 'chunked') {

				frame.payload                          = decode_chunked(msg_payload);
				frame.headers['content-encoding']      = 'identity';
				frame.headers['@transfer']['encoding'] = 'chunked';

			} else {

				frame.payload                          = msg_payload;
				frame.headers['content-encoding']      = 'identity';
				frame.headers['@transfer']['encoding'] = 'identity';

			}

			if (expected === msg_payload.length && frame.payload !== null) {
				frame.headers['content-length'] = frame.payload.length;
			}

		} else {

			frame.payload                          = null;
			frame.headers['@transfer']['encoding'] = null;

		}

	}


	if (frame.payload !== null && frame.payload.length > 12) {

		// TODO: Parse out DNS message payload correctly, embed DNS decode() method here

		console.log('decode_message() DNS payload');
		console.log(frame.payload);

		TEST.receive(null, frame.payload, (data) => {
			console.log(data);
		});

	}



	// FIXME: This is from HTTP, but actual chunk is from DNS message parser that's missing
	// if (Object.keys(chunk.headers).length > 0) {
	// 	return chunk;
	// }

	// TODO: decode base64url encoded buffer to DNS buffer (for dictionary)

	// let dictionary = {
	// 	buffer:   buffer,
	// 	labels:   {},
	// 	pointers: {},
	// 	offset:   12
	// };

	// console.info('decode_message()');
	// console.log(buffer.toString('utf8'));

	// TODO: Port DNS wireformat decoder

	// return { headers: {}, payload: {} };

	return null;

};



const encode_json = function(connection, data) {

	// TODO: encode_json() for DNS via HTTPS JSON API

};

const encode_domain = function(dictionary, domain) {

	let check = domain.split('.').find((label) => label.length >= 64) || null;
	if (check !== null) {
		return null;
	}


	let buffer = null;

	let index = dictionary.pointers[domain] || null;
	if (index !== null) {

		buffer = Buffer.from([
			0b11000000 | (index >> 8),
			index      & 0xff
		]);

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

	let offset = dictionary.offset;

	let domain = null;
	let qname  = null;
	let type   = question.type;
	let qtype  = TYPES[question.type] || null;
	let qclass = CLASSES['INTERNET'];

	if (type !== null && qtype !== null) {

		if (
			type === 'A'
			|| type === 'AAAA'
			|| type === 'CNAME'
			|| type === 'MX'
			|| type === 'NS'
			|| type === 'SRV'
			|| type === 'TXT'
		) {

			domain = question.domain;
			qname  = encode_domain(dictionary, domain);

		} else if (type === 'PTR') {

			if (question.value.type === 'v4') {

				domain = question.value.ip.split('.').slice(0, 4).reverse().join('.') + '.in-addr.arpa';
				qname  = encode_domain(dictionary, domain);

			} else if (question.value.type === 'v6') {

				domain = question.value.ip.split(':').join('').split('').slice(0, 32).reverse().join('.') + '.ip6.arpa';
				qname  = encode_domain(dictionary, domain);

			}

		}

	}


	if (domain !== null && qname !== null && qtype !== null && qclass !== null) {

		let buffer = Buffer.concat([
			qname,
			Buffer.from([
				(qtype >> 8)  & 0xff, qtype  & 0xff,
				(qclass >> 8) & 0xff, qclass & 0xff
			])
		]);

		dictionary.labels[offset]   = domain.split('.');
		dictionary.pointers[domain] = offset;
		dictionary.offset          += buffer.length;

		return buffer;

	}


	return null;

};

const encode_record = function(dictionary, record) {

	let type   = record.type;
	let rtype  = TYPES[record.type] || null;
	let rclass = CLASSES['INTERNET'];

	if (type !== null && rtype !== null) {

		let rhead = null;
		let rdata = null;

		if (type === 'A') {

			rhead = encode_domain(dictionary, record.domain);
			rdata = Buffer.from(record.value.ip.split('.').slice(0, 4).map((v) => {
				return parseInt(v, 10);
			}));

		} else if (type === 'AAAA') {

			let ip  = record.value.ip.split(':').join('').split('');
			let tmp = [];

			for (let i = 0; i < ip.length; i += 2) {
				tmp.push(parseInt(ip[i + 0] + ip[i + 1], 16));
			}

			rhead = encode_domain(dictionary, record.domain);
			rdata = Buffer.from(tmp);

		} else if (type === 'CNAME') {

			rhead = encode_domain(dictionary, record.domain);
			rdata = encode_domain(dictionary, record.value);

		} else if (type === 'MX') {

			rhead = encode_domain(dictionary, record.domain);
			rdata = Buffer.concat([
				Buffer.from([
					(record.weight >> 8) & 0xff,
					record.weight        & 0xff
				]),
				encode_domain(dictionary, record.value)
			]);

		} else if (type === 'NS') {

			rhead = encode_domain(dictionary, record.domain);
			rdata = encode_domain(dictionary, record.value);

		} else if (type === 'PTR') {

			if (record.value.type === 'v4') {

				rhead = encode_domain(dictionary, record.value.ip.split('.').slice(0, 4).reverse().join('.') + '.in-addr.arpa');
				rdata = encode_domain(dictionary, record.domain);

			} else if (record.value.type === 'v6') {

				rhead = encode_domain(dictionary, record.value.ip.split(':').join('').split('').slice(0, 32).reverse().join('.') + '.ip6.arpa');
				rdata = encode_domain(dictionary, record.domain);

			}

		} else if (type === 'SRV') {

			rhead = encode_domain(dictionary, record.domain);
			rdata = Buffer.concat([
				Buffer.from([
					(record.weight >> 8) & 0xff,
					record.weight        & 0xff,
					0x00,
					0x00,
					(record.port >> 8) & 0xff,
					record.port        & 0xff
				]),
				encode_domain(dictionary, record.value)
			]);

		} else if (type === 'TXT') {

			rhead = encode_domain(dictionary, record.domain);
			rdata = encode_string(dictionary, record.value);

		}


		if (rhead !== null && rdata !== null) {

			return Buffer.concat([
				rhead,
				Buffer.from([
					(rtype >> 8)  & 0xff, rtype  & 0xff,
					(rclass >> 8) & 0xff, rclass & 0xff,
					0x00, 0x00, 0x00, 0x00 // TTL
				]),
				Buffer.from([
					(rdata.length >> 8) & 0xff,
					rdata.length        & 0xff
				]),
				rdata
			]);

		}

	}

	return null;

};

const encode_string = function(dictionary, values) {

	let buffers = [];

	for (let v = 0, vl = values.length; v < vl; v++) {

		let value = values[v];

		if (isBuffer(value) === true && value.length <= 255) {

			let buffer = Buffer.alloc(value.length + 1);

			buffer[0] = value.length;
			value.copy(buffer, 1, 0, value.length);

			buffers.push(buffer);

		}

	}

	if (buffers.length > 0) {
		return Buffer.concat(buffers);
	}


	return null;

};

const encode_message = function(connection, data) {

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

		if (connection.type === 'server') {

			let payload = Buffer.concat([ header_data, payload_data ]);

			return Buffer.concat([
				Buffer.from([
					'HTTP/1.1 200 OK',
					'Content-Encoding: identity',
					'Content-Type: application/dns-message',
					'Content-Length: ' + payload.length,
					'',
					''
				].join('\r\n'), 'utf8'),
				payload
			]);

		} else {

			let hostname = null;
			let domain   = URL.toDomain(connection.url);
			let host     = URL.toHost(connection.url);
			let payload  = Buffer.concat([ header_data, payload_data ]);

			if (domain !== null) {
				hostname = domain;
			} else if (host !== null) {
				hostname = host;
			}

			return Buffer.concat([
				Buffer.from([
					'POST ' + connection.url.path + ' HTTP/1.1',
					'Accept: application/dns-message',
					'Accept-Encoding: identity',
					'Content-Type: application/dns-message',
					'Content-Length: ' + payload.length,
					'Host: ' + hostname,
					'',
					''
				].join('\r\n'), 'utf8'),
				payload
			]);

		}

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

		let code = (url.headers['@status'] || '500').split(' ').shift();
		if (code === '200') {

			if (url.payload !== null) {

				connection.emit('response', [{
					headers: url.headers,
					payload: url.payload
				}]);

			} else {

				connection.emit('error', [{ type: 'connection', cause: 'payload' }]);

			}

		} else if (code === '204' || code === '205') {

			connection.emit('error', [{ type: 'connection', cause: 'headers' }]);

		} else if (code === '206') {

			connection.emit('error', [{ type: 'connection', cause: 'headers' }]);

		} else if (code === '301' || code === '302' || code === '307' || code === '308') {

			let tmp = url.headers['location'] || null;
			if (tmp !== null) {
				connection.emit('redirect', [{ headers: url.headers }]);
			} else {
				connection.emit('error', [{ code: code, type: 'connection', cause: 'headers' }]);
			}

		} else if (code.startsWith('4') === true && code.length === 3) {
			connection.emit('error', [{ code: code, type: 'connection', cause: 'headers' }]);
		} else if (code.startsWith('5') === true && code.length === 3) {
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

			let frame = null;

			if (connection.url.mime.format === 'application/dns-message') {
				frame = decode_message(connection, buffer);
			} else if (connection.url.mime.format === 'application/dns-json') {
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

				if (connection.url.mime.format === 'application/dns-message') {

					buffer = encode_message(connection, {
						headers: headers,
						payload: payload
					});

				} else if (connection.url.mime.format === 'application/dns-json') {

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

