
import { Buffer, isArray, isBuffer, isNumber, isObject, isString } from '../../extern/base.mjs';
import { IP                                                      } from '../../source/parser/IP.mjs';
import { URL                                                     } from '../../source/parser/URL.mjs';



const isConnection = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Connection]';
};

const isPayload = function(payload) {

	if (
		isObject(payload) === true
		&& (isString(payload.domain) === true || isString(payload.host) === true)
		&& isNumber(payload.port) === true
		&& isArray(payload.hosts) === true
	) {

		let check = payload.hosts.filter((ip) => IP.isIP(ip) === true);
		if (check.length === payload.hosts.length) {
			return true;
		}

	}


	return false;

};



const AUTH = {
	0x00: 'none',
	0x02: 'login',
	0xff: 'error'
};

const METHODS = {
	0x01: 'connect',  // TCP connect
	0x02: 'bind',     // TCP bind
	0x03: 'associate' // UDP relay
};

const STATUSES = {
	0x00: {},
	0x01: { type: 'connection', cause: 'socket-stability' },
	0x02: { type: 'block'                                 },
	0x03: { type: 'connection', cause: 'socket-stability' },
	0x04: { type: 'host'                                  },
	0x05: { type: 'connection'                            },
	0x06: { type: 'connection', cause: 'socket-stability' },
	0x07: { type: 'connection', cause: 'headers'          },
	0x08: { type: 'connection', cause: 'payload'          }
};



const decode_payload = function(buffer) {

	let payload = null;

	let type = buffer[0];
	if (type === 0x01) {

		let raw_host = buffer.slice(1, 5);
		let raw_port = buffer.slice(5, 7);

		if (raw_host.length === 4 && raw_port.length === 2) {

			let ip = IP.parse([
				raw_host[0],
				raw_host[1],
				raw_host[2],
				raw_host[3]
			].join('.'));
			let port = (raw_port[0] << 8) + (raw_port[1] & 0xff);

			if (IP.isIP(ip) === true && port > 0 && port < 65535) {
				payload = URL.parse(ip.ip + ':' + port);
			}

		}

	} else if (type === 0x03) {

		let length     = buffer[1];
		let raw_domain = buffer.slice(2, 2 + length);
		let raw_port   = buffer.slice(2 + length, 2 + length + 2);

		if (raw_domain.length > 0 && raw_port.length === 2) {

			let domain = Buffer.from(raw_domain).toString('utf8');
			let port   = (raw_port[0] << 8) + (raw_port[1] & 0xff);
			if (domain.length > 0 && port > 0 && port < 65535) {
				payload = URL.parse(domain + ':' + port);
			}

		}

	} else if (type === 0x04) {

		let raw_host = buffer.slice(1, 17);
		let raw_port = buffer.slice(17, 19);

		if (raw_host.length === 16 && raw_port.length === 2) {

			let ip = IP.parse([
				raw_host.slice( 0,  2).toString('hex'),
				raw_host.slice( 2,  4).toString('hex'),
				raw_host.slice( 4,  6).toString('hex'),
				raw_host.slice( 6,  8).toString('hex'),
				raw_host.slice( 8, 10).toString('hex'),
				raw_host.slice(10, 12).toString('hex'),
				raw_host.slice(12, 14).toString('hex'),
				raw_host.slice(14, 16).toString('hex')
			].join(':'));
			let port = (raw_port[0] << 8) + (raw_port[1] & 0xff);

			if (IP.isIP(ip) === true && port > 0 && port < 65535) {
				payload = URL.parse('[' + ip.ip + ']:' + port);
			}

		}

	}

	return payload;

};

const encode_payload = function(payload) {

	payload = isPayload(payload) ? payload : null;


	if (payload !== null) {

		if (IP.isIP(payload.hosts[0]) === true) {

			let host = IP.sort(payload.hosts)[0];
			if (host.type === 'v4') {

				let digits = [];

				host.ip.split('.').forEach((v) => {
					digits.push(parseInt(v, 10));
				});

				return Buffer.concat([
					Buffer.from([
						0x01
					]),
					Buffer.from(digits),
					Buffer.from([
						payload.port >>> 8,
						payload.port & 0xff
					])
				]);

			} else if (host.type === 'v6') {

				let digits = [];

				host.ip.split(':').forEach((v) => {
					digits.push(parseInt(v.substr(0, 2), 16));
					digits.push(parseInt(v.substr(2, 2), 16));
				});

				return Buffer.concat([
					Buffer.from([
						0x04
					]),
					Buffer.from(digits),
					Buffer.from([
						payload.port >>> 8,
						payload.port & 0xff
					])
				]);

			}

		} else if (payload.domain !== null) {

			if (payload.subdomain !== null) {

				let domain = Buffer.from(payload.subdomain + '.' + payload.domain, 'utf8');

				return Buffer.concat([
					Buffer.from([
						0x03,
						domain.length
					]),
					domain,
					Buffer.from([
						payload.port >>> 8,
						payload.port & 0xff
					])
				]);

			} else {

				let domain = Buffer.from(payload.domain, 'utf8');

				return Buffer.concat([
					Buffer.from([
						0x03,
						domain.length
					]),
					domain,
					Buffer.from([
						payload.port >>> 8,
						payload.port & 0xff
					])
				]);

			}

		}

	}


	return null;

};



const SOCKS = {

	decode: function(connection, buffer) {

		connection = isConnection(connection) ? connection : null;
		buffer     = isBuffer(buffer)         ? buffer     : null;


		let type = 'server';

		if (connection !== null) {
			type = connection.type;
		}

		if (buffer !== null) {

			if (buffer[0] !== 0x05) {
				return null;
			}


			let packet = {
				headers: {},
				payload: null
			};


			if (type === 'client') {

				if (buffer.length === 2) {

					let auth = buffer[1];
					if (auth === 0x00) {
						packet.headers['@auth'] = 'none';
					} else if (auth === 0x02) {
						packet.headers['@auth'] = 'login';
					} else if (auth === 0xff) {
						packet.headers['@auth'] = 'error';
					} else {
						packet.headers['@auth'] = 'error';
					}

					return packet;

				} else if (buffer.length > 2) {

					let status = buffer[1];
					if (status === 0x00) {
						packet.headers['@status'] = 0x00;
					} else if (isObject(STATUSES[status]) === true) {
						packet.headers['@error']  = STATUSES[status];
						packet.headers['@status'] = status;
					}

					if (buffer.length > 3) {

						let payload = decode_payload(buffer.slice(3));
						if (payload !== null) {
							packet.payload = payload;
						}

					}

					return packet;

				}

			} else if (type === 'server') {

				let is_auth = false;

				if (
					buffer.length >= 3
					&& buffer[1] + 2 === buffer.length
				) {
					is_auth = true;
				}

				if (is_auth === true) {

					let length  = buffer[1];
					let methods = buffer.slice(2, 2 + length);

					if (methods.length === length) {

						packet.headers['@auth'] = Array.from(methods).map((v) => {

							if (v === 0x00) {
								return 'none';
							} else if (v === 0x02) {
								return 'login';
							} else if (v === 0xff) {
								return 'error';
							}

							return null;

						}).filter((method) => method !== null);

					}

					return packet;

				} else if (buffer.length > 3) {

					let method = buffer[1];
					if (method === 0x01) {
						packet.headers['@method'] = 'connect';
					} else if (method === 0x02) {
						packet.headers['@method'] = 'bind';
					} else if (method === 0x03) {
						packet.headers['@method'] = 'associate';
					}

					let payload = decode_payload(buffer.slice(3));
					if (payload !== null) {
						packet.payload = payload;
					}

					return packet;

				}

			}


			return null;

		}

	},

	encode: function(connection, packet) {

		connection = isConnection(connection) ? connection : null;
		packet     = isObject(packet)         ? packet     : null;


		if (connection !== null && packet !== null) {

			let headers = {};
			let payload = null;

			if (connection.type === 'client') {

				if (isObject(packet.headers) === true) {

					if (isArray(packet.headers['@auth']) === true) {

						headers['@auth'] = packet.headers['@auth'].filter((val) => (isString(val) === true && Object.values(AUTH).includes(val) === true));

					} else if (
						isString(packet.headers['@method']) === true
						&& Object.values(METHODS).includes(packet.headers['@method']) === true
					) {

						headers['@method'] = packet.headers['@method'];

					}

				}


				if (isPayload(packet.payload) === true) {
					payload = packet.payload;
				} else {
					payload = Object.assign(URL.parse('0.0.0.0:0'), {
						host:  '0.0.0.0',
						hosts: [ IP.parse('0.0.0.0') ],
						port:  0
					});
				}


				if (isArray(headers['@auth']) === true) {

					let methods = headers['@auth'].map((v) => {

						if (v === 'none') {
							return 0x00;
						} else if (v === 'login') {
							return 0x02;
						}

						return null;

					}).filter((method) => method !== null);

					return Buffer.concat([
						Buffer.from([
							0x05,
							methods.length
						]),
						Buffer.from(methods)
					]);

				} else if (headers['@method'] === 'connect') {

					let buffer = encode_payload(payload);
					if (buffer !== null) {

						return Buffer.concat([
							Buffer.from([
								0x05,
								0x01,
								0x00
							]),
							buffer
						]);

					}

				} else if (headers['@method'] === 'bind') {

					let buffer = encode_payload(payload);
					if (buffer !== null) {

						return Buffer.concat([
							Buffer.from([
								0x05,
								0x02,
								0x00
							]),
							buffer
						]);

					}

				} else if (headers['@method'] === 'associate') {

					let buffer = encode_payload(payload);
					if (buffer !== null) {

						return Buffer.concat([
							Buffer.from([
								0x05,
								0x03,
								0x00
							]),
							buffer
						]);

					}

				}

			} else if (connection.type === 'server') {

				if (
					isString(packet.headers['@auth']) === true
					&& Object.values(AUTH).includes(packet.headers['@auth']) === true
				) {

					headers['@auth'] = packet.headers['@auth'];

				} else if (
					isNumber(packet.headers['@status']) === true
					&& isObject(STATUSES[packet.headers['@status']]) === true
				) {

					headers['@status'] = packet.headers['@status'];

				}


				if (isPayload(packet.payload) === true) {
					payload = packet.payload;
				} else {
					payload = Object.assign(URL.parse('0.0.0.0:0'), {
						host:  '0.0.0.0',
						hosts: [ IP.parse('0.0.0.0') ],
						port:  0
					});
				}


				if (isString(headers['@auth']) === true) {

					let code = Object.keys(AUTH)[Object.values(AUTH).indexOf(headers['@auth'])] || null;
					if (code === null) {
						code = (0xff).toString();
					}

					let auth = parseInt(code, 10);

					if (Number.isNaN(auth) === false) {

						return Buffer.from([
							0x05,
							auth
						]);

					}

				} else if (isNumber(headers['@status']) === true) {

					let buffer = encode_payload(payload);
					if (buffer !== null) {

						return Buffer.concat([
							Buffer.from([
								0x05,
								headers['@status'],
								0x00
							]),
							buffer
						]);

					}

				}

			}

		}


		return null;

	},

	isPacket: function(buffer) {

		buffer = isBuffer(buffer) ? buffer : null;


		if (buffer !== null) {

			if (buffer.length === 2) {

				if (
					buffer[0] === 0x05
					&& (
						buffer[1] === 0x00
						|| buffer[1] === 0x02
						|| buffer[1] === 0xff
					)
				) {
					return true;
				}

			} else if (buffer.length > 2) {

				if (
					buffer.length >= 3
					&& buffer[0] === 0x05
					&& buffer[1] === buffer.slice(2).length
				) {

					return true;

				} else if (
					buffer.length > 4
					&& buffer[0] === 0x05
					&& buffer[1] >= 0x00
					&& buffer[1] <= 0x10
					&& buffer[2] === 0x00
					&& (
						buffer[3] === 0x01
						|| buffer[3] === 0x03
						|| buffer[3] === 0x04
					)
				) {

					return true;

				}

			}

		}


		return false;

	}

};


export { SOCKS };

