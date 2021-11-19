
import zlib from 'zlib';

import { Buffer, isArray, isBoolean, isBuffer, isNumber, isObject, isString } from '../../extern/base.mjs';
import { DATETIME                                                           } from '../../source/parser/DATETIME.mjs';
import { IP                                                                 } from '../../source/parser/IP.mjs';
import { URL                                                                } from '../../source/parser/URL.mjs';



const EMPTYLINE = Buffer.from('\r\n\r\n', 'utf8');
const METHODS   = [ 'CONNECT', 'DELETE', 'GET', 'HEAD', 'OPTIONS', 'PATCH', 'POST', 'PUT', 'TRACE' ];
const STATUSES  = {

	// Official HTTP Status Codes
	100: 'Continue',
	101: 'Switching Protocols',
	200: 'OK',
	201: 'Created',
	202: 'Accepted',
	203: 'Non-Authorative Information',
	204: 'No Content',
	205: 'Reset Content',
	206: 'Partial Content',
	300: 'Multiple Choices',
	301: 'Moved Permanently',
	302: 'Found',
	303: 'See Other',
	304: 'Not Modified',
	305: 'Use Proxy',
	306: 'Switch Proxy',
	307: 'Temporary Redirect',
	308: 'Permanent Redirect',
	400: 'Bad Request',
	401: 'Unauthorized',
	402: 'Payment Required',
	403: 'Forbidden',
	404: 'Not Found',
	405: 'Method Not Allowed',
	406: 'Not Acceptable',
	407: 'Proxy Authentication Required',
	408: 'Request Timeout',
	409: 'Conflict',
	410: 'Gone',
	411: 'Length Required',
	412: 'Precondition Failed',
	413: 'Payload Too Large',
	414: 'URI Too Long',
	415: 'Unsupported Media Type',
	416: 'Range Not Satisfiable',
	417: 'Expectation Failed',
	418: 'I\'m a teapot',
	421: 'Misredirected Request',
	426: 'Upgrade Required',
	428: 'Precondition Required',
	429: 'Too Many Requests',
	431: 'Request Header Fields Too Large',
	451: 'Unavailable For Legal Reasons',
	500: 'Internal Server Error',
	501: 'Not Implemented',
	502: 'Bad Gateway',
	503: 'Service Unavailable',
	504: 'Gateway Timeout',
	505: 'HTTP Version Not Supported',
	506: 'Variant Also Negotiates',
	510: 'Not Extended',
	511: 'Network Authentication Required',

	// WebDAV Status Codes
	102: 'Processing',
	207: 'Multi-Status',
	208: 'Already Reported',
	422: 'Unprocessable Entity',
	423: 'Locked',
	424: 'Failed Dependency',
	507: 'Insufficient Storage',
	508: 'Loop Detected',

	// Microsoft Status Codes
	450: 'Blocked by Windows Parental Controls',

	// Apache Status Codes
	509: 'Bandwidth Limit Exceeded',

	// nginx Status Codes
	444: 'No Response',
	494: 'Request Header Too Large',
	495: 'SSL Certificate Error',
	496: 'SSL Certificate Expired',
	497: 'HTTP Request Sent to HTTPS Port',
	499: 'Client Closed Request',

	// Cloudflare Status Codes
	520: 'Web Server Returned an Unknown Error',
	521: 'Web Server Down',
	522: 'Web Server Timeout',
	523: 'Web Server Unreachable',
	524: 'Web Server Timeout',
	525: 'SSL Handshake Failed',
	526: 'Invalid SSL Certificate',
	527: 'Railgun Error'

};

const isConnection = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Connection]';
};



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

const encode_chunked = function(payload) {

	return Buffer.concat([
		Buffer.from((payload.length).toString(16), 'utf8'),
		Buffer.from('\r\n', 'utf8'),
		payload,
		Buffer.from('\r\n', 'utf8'),
		Buffer.from('\r\n', 'utf8')
	]);

};



const HTTP = {

	decode: function(connection, buffer) {

		connection = isConnection(connection) ? connection : null;
		buffer     = isBuffer(buffer)         ? buffer     : null;


		if (buffer !== null) {

			if (buffer.length < 5) {
				return null;
			}


			let packet = {
				headers: {
					'@transfer': {
						'encoding': null,
						'length':   null,
						'range':    [ 0, Infinity ]
					}
				},
				overflow: null,
				payload:  null
			};


			let msg_headers  = null;
			let msg_payload  = null;
			let msg_overflow = null;


			let msg_headers_index = buffer.indexOf(EMPTYLINE);
			if (msg_headers_index !== -1) {
				msg_headers = buffer.slice(0, msg_headers_index);
				msg_payload = buffer.slice(msg_headers_index + 4);
			} else {
				msg_headers = buffer;
				msg_payload = null;
			}


			if (msg_headers !== null) {

				let fields = msg_headers.toString('utf8').split('\r\n').map((line) => line.trim());
				if (fields.length > 0) {

					let start_line = fields.shift();
					let check      = start_line.split(' ').shift();

					if (METHODS.includes(check) === true) {

						packet.headers['@method'] = check;

						let url = start_line.split(' ').slice(1).shift();
						if (
							url.startsWith('/') === true
							|| url.startsWith('http://') === true
							|| url.startsWith('https://') === true
						) {
							// TODO: Use URL.parse()
							packet.headers['@url'] = url;
						}

					} else if (check === 'HTTP/1.1' || check === 'HTTP/1.0' || check === 'HTTP/0.9') {

						let status = parseInt(start_line.split(' ').slice(1).shift(), 10);
						if (
							Number.isNaN(status) === false
							&& isString(STATUSES[status]) === true
						) {
							packet.headers['@status'] = status;
						}

					}


					fields.filter((line) => line !== '').forEach((line) => {

						if (line.includes(':') === true) {

							let key = line.split(':')[0].toLowerCase().trim();
							let val = line.split(':').slice(1).join(':').trim();

							if (key.length > 0 && val.length > 0) {

								let num = parseInt(val, 10);
								let dat = DATETIME.parse(val);

								// TODO: Support for IP.parse()
								// TODO: Support for URL.parse()

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

								packet.headers[key] = val;

							}

						}

					});

				}


				let method         = isString(packet.headers['@method'])        ? packet.headers['@method']        : null;
				let status         = isNumber(packet.headers['@status'])        ? packet.headers['@status']        : null;
				let content_length = isNumber(packet.headers['content-length']) ? packet.headers['content-length'] : null;
				let content_range  = isString(packet.headers['content-range'])  ? packet.headers['content-range']  : null;
				let range          = isString(packet.headers['range'])          ? packet.headers['range']          : null;

				if (status === 206 && content_range !== null) {

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

							packet.headers['@transfer']['length'] = length;
							packet.headers['@transfer']['range']  = [ start, end ];

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

							packet.headers['@transfer']['length'] = Infinity;
							packet.headers['@transfer']['range']  = [ start, end ];

						}

					}

				} else if (method === 'GET' && range !== null) {

					if (isNumber(content_length) === true && content_length > 0) {

						packet.headers['@transfer']['length'] = content_length;

					} else {

						packet.headers['@transfer']['length'] = Infinity;

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

							packet.headers['@transfer']['range'] = [ start, end ];

						}

					} else {

						// TODO: Multiple Ranges are not supported by any public web server
						// or proxy software (apache, caddy, nginx and squid are all broken)

					}

				} else if (isNumber(content_length) === true) {

					if (content_length > 0) {
						packet.headers['@transfer']['length'] = content_length;
						packet.headers['@transfer']['range']  = [ 0, content_length - 1 ];
					} else {
						packet.headers['@transfer']['length'] = 0;
						packet.headers['@transfer']['range']  = [ 0, 0 ];
					}

				} else {

					packet.headers['@transfer']['length'] = Infinity;
					packet.headers['@transfer']['range']  = [ 0, Infinity ];

				}

				let sorted_headers = {};

				Object.keys(packet.headers).sort((a, b) => {
					if (a < b) return -1;
					if (b < a) return  1;
					return 0;
				}).forEach((header) => {
					sorted_headers[header] = packet.headers[header];
				});

				packet.headers = sorted_headers;

			}

			if (msg_payload !== null) {

				let content_length = packet.headers['@transfer']['length'];
				if (content_length !== Infinity) {

					if (msg_payload.length > content_length) {
						msg_overflow = msg_payload.slice(content_length);
						msg_payload  = msg_payload.slice(0, content_length);
					}

				}

			}

			if (msg_overflow !== null) {

				if (msg_overflow.length > 0) {
					packet.overflow = msg_overflow;
				}

			}

			if (msg_payload !== null) {

				let expected = packet.headers['@transfer']['length'];
				let range    = packet.headers['@transfer']['range'];

				if (range[1] !== Infinity) {

					if (range[1] > range[0]) {
						// XXX: Ranges start with byte 0, so subtraction is off-by-one
						expected = (range[1] + 1) - range[0];
					}

				}

				if (expected === Infinity || expected === msg_payload.length) {

					let content_encoding  = packet.headers['content-encoding']  || null;
					let transfer_encoding = packet.headers['transfer-encoding'] || null;

					if (content_encoding === 'gzip' || transfer_encoding === 'gzip') {

						try {

							packet.payload                          = zlib.gunzipSync(msg_payload);
							packet.headers['content-encoding']      = 'identity';
							packet.headers['@transfer']['encoding'] = 'gzip';

						} catch (err) {

							packet.payload                          = msg_payload;
							packet.headers['content-encoding']      = 'gzip';
							packet.headers['@transfer']['encoding'] = 'gzip';

						}

					} else if (content_encoding === 'deflate' || transfer_encoding === 'deflate') {

						try {

							packet.payload                          = zlib.deflateSync(msg_payload);
							packet.headers['content-encoding']      = 'identity';
							packet.headers['@transfer']['encoding'] = 'deflate';

						} catch (err) {

							packet.payload                          = msg_payload;
							packet.headers['content-encoding']      = 'deflate';
							packet.headers['@transfer']['encoding'] = 'deflate';

						}

					} else if (content_encoding === 'br' || transfer_encoding === 'br') {

						try {

							packet.payload                          = zlib.brotliDecompressSync(msg_payload);
							packet.headers['content-encoding']      = 'identity';
							packet.headers['@transfer']['encoding'] = 'br';

						} catch (err) {

							packet.payload                          = msg_payload;
							packet.headers['content-encoding']      = 'br';
							packet.headers['@transfer']['encoding'] = 'br';

						}

					} else if (transfer_encoding === 'chunked') {

						packet.payload                          = decode_chunked(msg_payload);
						packet.headers['content-encoding']      = 'identity';
						packet.headers['@transfer']['encoding'] = 'chunked';

					} else {

						packet.payload                          = msg_payload;
						packet.headers['content-encoding']      = 'identity';
						packet.headers['@transfer']['encoding'] = 'identity';

					}

					if (expected === msg_payload.length && packet.payload !== null) {
						packet.headers['content-length'] = packet.payload.length;
					}

				} else {

					packet.payload                          = null;
					packet.headers['@transfer']['encoding'] = null;

				}

			}


			if (Object.keys(packet.headers).length > 0) {
				return packet;
			}

		}


		return null;

	},

	encode: function(connection, packet) {

		connection = isConnection(connection) ? connection : null;
		packet     = isObject(packet)         ? packet     : null;


		let type = 'server';

		if (connection !== null) {
			type = connection.type;
		}

		if (packet !== null) {

			let headers = {};
			let payload = null;

			if (type === 'client') {

				if (isObject(packet.headers) === true) {

					if (isString(packet.headers['@method']) === true) {

						if (
							packet.headers['@method'] === 'CONNECT'
							&& isString(packet.headers['host']) === true
						) {
							headers['@method'] = packet.headers['@method'];
							headers['@url']    = packet.headers['host'];
						} else if (
							METHODS.includes(packet.headers['@method']) === true
							&& isString(packet.headers['@url']) === true
							// TODO: Validate @url header string and characters ([A-Za-z etc])
						) {
							headers['@method'] = packet.headers['@method'];
							headers['@url']    = packet.headers['@url'];
						}

					}

				}

			} else if (type === 'server') {

				if (isObject(packet.headers) === true) {

					if (
						isNumber(packet.headers['@status']) === true
						&& isString(STATUSES[packet.headers['@status']]) === true
					) {
						headers['@status'] = packet.headers['@status'];
					}

				}

			}

			Object.keys(packet.headers).filter((h) => h.startsWith('@') === false).sort().forEach((header) => {
				headers[header] = packet.headers[header];
			});

			if (isBuffer(packet.payload) === true) {
				payload = packet.payload;
			} else if (isObject(packet.payload) === true) {
				payload = Buffer.from(JSON.stringify(packet.payload, null, '\t'), 'utf8');
			}

			if (payload !== null) {

				headers['@transfer'] = {
					'encoding': 'identity',
					'length':   payload.length
				};

			} else {

				headers['@transfer'] = {
					'encoding': 'identity'
				};

			}

			if (isObject(packet.headers['@transfer']) === true) {

				if (isString(packet.headers['@transfer']['encoding']) === true) {
					headers['@transfer']['encoding'] = packet.headers['@transfer']['encoding'];
				}

				if (isArray(packet.headers['@transfer']['range']) === true) {

					if (payload !== null) {

						headers['@transfer']['range'] = [ 0, payload.length ];


						let from = packet.headers['@transfer']['range'][0] || 0;
						let to   = packet.headers['@transfer']['range'][1] || null;

						if (
							isNumber(from) === true
							&& from >= 0
							&& from < payload.length
							&& from !== -Infinity
							&& from !== Infinity
						) {
							headers['@transfer']['range'][0] = from;
						}

						if (
							isNumber(to) === true
							&& to > from
							&& to < payload.length
							&& to !== -Infinity
							&& to !== Infinity
						) {
							headers['@transfer']['range'][1] = to;
						}

					}

				}

			}


			if (Object.keys(headers).length === 0) {
				return null;
			}


			let msg_payload = Buffer.alloc(0);

			if (payload !== null) {

				if (isArray(headers['@transfer']['range']) === true) {

					if (type === 'client') {

						if (headers['@transfer']['range'][1] !== Infinity) {
							headers['range'] = 'bytes=' + headers['@transfer']['range'][0] + '-' + headers['@transfer']['range'][1];
						} else {
							headers['range'] = 'bytes=' + headers['@transfer']['range'][0] + '-';
						}

					} else if (type === 'server') {

						if (isNumber(headers['@transfer']['length']) === true) {
							headers['content-range'] = 'bytes ' + headers['@transfer']['range'][0] + '-' + (headers['@transfer']['range'][1] || '*') + '/' + headers['@transfer']['length'];
							delete headers['content-length'];
						} else {
							headers['content-range'] = 'bytes ' + headers['@transfer']['range'][0] + '-' + (headers['@transfer']['range'][1] || '*') + '/*';
							delete headers['content-length'];
						}

					}

				} else if (isNumber(headers['@transfer']['length']) === true) {

					headers['content-length'] = headers['@transfer']['length'];

				}


				if (isString(headers['@transfer']['encoding']) === true) {

					if (headers['@transfer']['encoding'] === 'gzip') {

						try {

							msg_payload                      = zlib.gzipSync(payload);
							headers['@transfer']['encoding'] = 'gzip';
							headers['content-encoding']      = 'gzip';

							delete headers['transfer-encoding'];

						} catch (err) {

							msg_payload                      = payload;
							headers['@transfer']['encoding'] = 'identity';
							headers['content-encoding']      = 'identity';

							delete headers['transfer-encoding'];

						}

					} else if (headers['@transfer']['encoding'] === 'deflate') {

						try {

							msg_payload                      = zlib.deflateSync(payload);
							headers['@transfer']['encoding'] = 'deflate';
							headers['content-encoding']      = 'deflate';

							delete headers['transfer-encoding'];

						} catch (err) {

							msg_payload                      = payload;
							headers['@transfer']['encoding'] = 'identity';
							headers['content-encoding']      = 'identity';

							delete headers['transfer-encoding'];

						}

					} else if (headers['@transfer']['encoding'] === 'br') {

						try {

							msg_payload                      = zlib.brotliCompressSync(payload);
							headers['@transfer']['encoding'] = 'br';
							headers['content-encoding']      = 'br';

							delete headers['transfer-encoding'];

						} catch (err) {

							msg_payload                      = payload;
							headers['@transfer']['encoding'] = 'identity';
							headers['content-encoding']      = 'identity';

							delete headers['transfer-encoding'];

						}

					} else if (headers['@transfer']['encoding'] === 'chunked') {

						msg_payload                      = encode_chunked(payload);
						headers['@transfer']['encoding'] = 'chunked';
						headers['transfer-encoding']     = 'chunked';

						delete headers['content-encoding'];
						delete headers['content-length'];

					} else {

						msg_payload                      = payload;
						headers['@transfer']['encoding'] = 'identity';
						headers['content-encoding']      = 'identity';

						delete headers['transfer-encoding'];

					}

				} else {

					headers['@transfer']['encoding'] = 'identity';
					headers['content-encoding']      = 'identity';

					delete headers['transfer-encoding'];

				}


				if (isString(headers['content-range']) === true) {

					let content_range = headers['content-range'].split('/').shift().split(' ').pop().split('-').map((v) => parseInt(v, 10));
					if (Number.isNaN(content_range[0]) === false && Number.isNaN(content_range[1]) === false) {

						headers['content-range'] = headers['content-range'].split('/').shift() + '/' + msg_payload.length;
						msg_payload = msg_payload.slice(content_range[0], content_range[1] + 1);
						headers['content-length'] = msg_payload.length;

					} else {

						if (headers['@transfer']['encoding'] !== 'chunked') {
							headers['content-length'] = msg_payload.length;
						}

						delete headers['content-range'];

					}

				} else {

					if (headers['@transfer']['encoding'] !== 'chunked') {
						headers['content-length'] = msg_payload.length;
					}

				}

			}


			let fields = [];

			if (type === 'client') {

				let method = headers['@method'] || null;
				if (METHODS.includes(method) === true && isString(headers['@url']) === true) {
					fields.push(method + ' ' + headers['@url'] + ' HTTP/1.1');
				} else if (METHODS.includes(method) === true) {
					fields.push(method + ' / HTTP/1.1');
				} else if (isString(headers['@url']) === true) {
					fields.push('GET ' + headers['@url'] + ' HTTP/1.1');
				} else {
					fields.push('GET / HTTP/1.1');
				}

				// RFC2616 forbids request message body for these methods
				if (method === 'HEAD' || method === 'OPTIONS') {
					msg_payload = null;
				}

			} else if (type === 'server') {

				if (isNumber(headers['@status']) === true) {

					let message = 'Internal Server Error';
					let code    = 500;

					if (isString(STATUSES[headers['@status']]) === true) {
						code    = headers['@status'];
						message = STATUSES[headers['@status']];
					}

					fields.push('HTTP/1.1 ' + code + ' ' + message);

					// RFC2616 forbids response payloads for these status codes
					if (
						code === 100
						|| code === 101
						|| code === 204
						|| code === 304
					) {
						msg_payload = null;
					}

				} else {
					fields.push('HTTP/1.1 200 OK');
				}

			}

			Object.keys(headers).filter((h) => h.startsWith('@') === false).sort().forEach((header) => {

				let key = header.split('-').map((v) => v.charAt(0).toUpperCase() + v.substr(1).toLowerCase()).join('-');
				let val = headers[header];

				if (isNumber(val) === true) {
					fields.push(key + ': ' + val);
				} else if (isBoolean(val) === true) {
					fields.push(key + ': ' + val);
				} else if (val === null) {
					fields.push(key + ': ' + val);
				} else if (IP.isIP(val) === true) {
					fields.push(key + ':' + IP.render(val));
				} else if (URL.isURL(val) === true) {
					fields.push(key + ':' + URL.render(val));
				} else if (DATETIME.isDATETIME(val) === true) {
					fields.push(key + ': ' + DATETIME.toIMF(val));
				} else if (isString(val) === true) {
					fields.push(key + ': ' + val);
				}

			});


			let msg_headers = Buffer.from(fields.join('\r\n'), 'utf8');

			if (msg_payload !== null) {

				return Buffer.concat([
					msg_headers,
					EMPTYLINE,
					msg_payload
				]);

			} else {

				return Buffer.concat([
					msg_headers,
					EMPTYLINE
				]);

			}

		}


		return null;

	},

	isPacket: function(buffer) {

		buffer = isBuffer(buffer) ? buffer : null;


		if (buffer !== null) {

			let fields = buffer.toString('utf8').split('\r\n').map((line) => line.trim());
			if (fields.length > 1) {

				let start_line = fields.shift();
				let check      = start_line.split(' ').shift();

				if (check === 'CONNECT') {

					let host     = start_line.split(' ').slice(1).shift();
					let protocol = start_line.split(' ').pop();

					if (
						(
							protocol === 'HTTP/1.1'
							|| protocol === 'HTTP/1.0'
							|| protocol === 'HTTP/0.9'
						) && (
							host.includes(':') === true
						)
					) {
						return true;
					}

				} else if (METHODS.includes(check) === true) {

					let url      = start_line.split(' ').slice(1).shift();
					let protocol = start_line.split(' ').pop();
					if (
						(
							protocol === 'HTTP/1.1'
							|| protocol === 'HTTP/1.0'
							|| protocol === 'HTTP/0.9'
						) && (
							url.startsWith('/') === true
							|| url.startsWith('http://') === true
							|| url.startsWith('https://') === true
						)
					) {
						return true;
					}

				} else if (check === 'HTTP/1.1' || check === 'HTTP/1.0' || check === 'HTTP/0.9') {

					let status = parseInt(start_line.split(' ').slice(1).shift(), 10);
					if (
						Number.isNaN(status) === false
						&& isString(STATUSES[status]) === true
					) {
						return true;
					}

				}

			}

		}


		return false;

	}

};


export { HTTP };

