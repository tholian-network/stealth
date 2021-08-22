
import { Buffer, isArray, isBoolean, isBuffer, isNumber, isObject, isString } from '../../extern/base.mjs';
import { DATETIME                                                           } from '../../source/parser/DATETIME.mjs';
import { IP                                                                 } from '../../source/parser/IP.mjs';
import { URL                                                                } from '../../source/parser/URL.mjs';



const OPERATORS = [
	0x00, // Continuation Frame (fragmented)
	0x01, // Text Frame (possibly fragmented)
	0x02, // Binary Frame (possibly fragmented)
	0x08, // Connection Close Frame
	0x09, // Ping Frame
	0x0a  // Pong Frame
];

const STATUSES = {

	1000: 'Normal Closure',
	1001: 'Going Away',
	1002: 'Protocol Error',
	1003: 'Unsupported Data',

	1005: 'No Status Received',
	1006: 'Abnormal Closure',
	1007: 'Invalid Frame Payload Data',
	1008: 'Policy Violation',
	1009: 'Message Too Big',
	1010: 'Mandatory Extension',
	1011: 'Internal Server Error',
	1015: 'TLS Handshake'

};

const isConnection = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Connection]';
};



const WS = {

	decode: function(connection, buffer) {

		connection = isConnection(connection) ? connection : null;
		buffer     = isBuffer(buffer)         ? buffer     : null;


		if (buffer !== null) {

			if (buffer.length < 2) {
				return null;
			}


			let packet = {
				headers: {
					'@operator': null,
					'@status':   null,
					'@transfer': {
						'encoding': null,
						'length':   null,
						'range':    [ 0, Infinity ]
					},
					'@type':     null
				},
				overflow: null,
				payload:  null
			};


			let msg_payload    = null;
			let msg_overflow   = null;
			let fin            = (buffer[0] & 128) === 128;
			// let rsv1           = (buffer[0] &  64) === 64;
			// let rsv2           = (buffer[0] &  32) === 32;
			// let rsv3           = (buffer[0] &  16) === 16;
			let operator       = (buffer[0] &  15);
			let mask           = (buffer[1] & 128) === 128;


			let payload_length = buffer[1] & 127;
			if (payload_length <= 125) {

				if (mask === true && buffer.length >= payload_length + 6) {

					let mask_data = buffer.slice(2, 6);

					msg_payload  = buffer.slice(6, 6 + payload_length).map((value, index) => value ^ mask_data[index % 4]);
					msg_overflow = buffer.slice(6 + payload_length);

				} else if (buffer.length >= payload_length + 2) {

					msg_payload  = buffer.slice(2, 2 + payload_length);
					msg_overflow = buffer.slice(2 + payload_length);

				}

			} else if (payload_length === 126) {

				payload_length = (buffer[2] << 8) + buffer[3];

				if (mask === true && buffer.length >= payload_length + 8) {

					let mask_data = buffer.slice(4, 8);

					msg_payload  = buffer.slice(8, 8 + payload_length).map((value, index) => value ^ mask_data[index % 4]);
					msg_overflow = buffer.slice(8 + payload_length);

				} else if (buffer.length >= payload_length + 4) {

					msg_payload  = buffer.slice(4, 4 + payload_length);
					msg_overflow = buffer.slice(4 + payload_length);

				}

			} else if (payload_length === 127) {

				let hi = (buffer[2] * 0x1000000) + ((buffer[3] << 16) | (buffer[4] << 8) | buffer[5]);
				let lo = (buffer[6] * 0x1000000) + ((buffer[7] << 16) | (buffer[8] << 8) | buffer[9]);

				payload_length = (hi * 4294967296) + lo;

				if (mask === true && buffer.length >= payload_length + 14) {

					let mask_data = buffer.slice(10, 14);

					msg_payload  = buffer.slice(14, 14 + payload_length).map((value, index) => value ^ mask_data[index % 4]);
					msg_overflow = buffer.slice(14 + payload_length);

				} else if (buffer.length >= payload_length + 10) {

					msg_payload  = buffer.slice(10, 10 + payload_length);
					msg_overflow = buffer.slice(10 + payload_length);

				}

			}


			if (msg_overflow !== null && msg_overflow.length > 0) {
				packet.overflow = msg_overflow;
			}


			if (msg_payload !== null) {

				if (operator === 0x00) {

					// 0x00: Continuation Frame (fragmented)

					// XXX: This leads to:
					// connection.fragment.operator = packet.headers['@operator'];
					// connection.fragment.payload  = Buffer.concat([ connection.fragment.payload, msg_payload ]);
					// and if packet.headers['@transfer']['length'] !== Infinity then JSON.parse(concatted_buffer);

					if (fin === true) {

						packet.headers['@operator']           = 0x00;
						packet.headers['@status']             = null;
						packet.headers['@transfer']['length'] = msg_payload.length;
						packet.headers['@transfer']['range']  = [ 0, msg_payload.length ];
						packet.headers['@type']               = mask === true ? 'request' : 'response';
						packet.payload                        = msg_payload;

					} else {

						packet.headers['@operator']           = 0x00;
						packet.headers['@status']             = null;
						packet.headers['@transfer']['length'] = Infinity;
						packet.headers['@transfer']['range']  = [ 0, Infinity ];
						packet.headers['@type']               = mask === true ? 'request' : 'response';
						packet.payload                        = msg_payload;

					}

				} else if (operator === 0x01 || operator === 0x02) {

					// 0x01: Text Frame (possibly fragmented)
					// 0x02: Binary Frame (possibly fragmented)

					if (fin === true) {

						packet.headers['@operator']           = operator;
						packet.headers['@status']             = null;
						packet.headers['@transfer']['length'] = msg_payload.length;
						packet.headers['@transfer']['range']  = [ 0, msg_payload.length ];
						packet.headers['@type']               = mask === true ? 'request' : 'response';
						packet.payload                        = msg_payload;

					} else {

						// XXX: This leads to:
						// connection.fragment.operator = packet.headers['@operator'];
						// connection.fragment.payload  = Buffer.concat([ connection.fragment.payload, msg_payload ]);

						packet.headers['@operator']           = operator;
						packet.headers['@status']             = null;
						packet.headers['@transfer']['length'] = Infinity;
						packet.headers['@transfer']['range']  = [ 0, Infinity ];
						packet.headers['@type']               = mask === true ? 'request' : 'response';
						packet.payload                        = msg_payload;

					}

				} else if (operator === 0x08) {

					// 0x08: Connection Close Frame

					packet.headers['@operator'] = 0x08;
					packet.headers['@status']   = (buffer[2] << 8) + (buffer[3]);
					packet.headers['@type']     = mask === true ? 'request' : 'response';
					packet.payload              = null;

				} else if (operator === 0x09) {

					// 0x09: Ping Frame

					packet.headers['@operator'] = 0x09;
					packet.headers['@status']   = null;
					packet.headers['@type']     = mask === true ? 'request' : 'response';
					packet.payload              = null;

				} else if (operator === 0x0a) {

					// 0x0a: Pong Frame

					packet.headers['@operator'] = 0x0a;
					packet.headers['@status']   = null;
					packet.headers['@type']     = mask === true ? 'request' : 'response';
					packet.payload              = null;

				} else {

					// Connection Close Frame

					packet.headers['@operator'] = 0x08;
					packet.headers['@status']   = 1002;
					packet.headers['@type']     = mask === true ? 'request' : 'response';
					packet.payload              = msg_payload;

				}


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

					if (
						isNumber(packet.headers['@operator']) === true
						&& OPERATORS.includes(packet.headers['@operator']) === true
					) {
						headers['@operator'] = packet.headers['@operator'];
					}

					if (
						packet.headers['@operator'] === 0x08
						&& isNumber(packet.headers['@status']) === true
						&& isString(STATUSES[packet.headers['@status']]) === true
					) {
						headers['@status'] = packet.headers['@status'];
					}

					// TODO: Validate @transfer headers
					// TODO: Validate @type

				}

			} else if (type === 'server') {

				if (
					packet.headers['@operator'] === 0x08
					&& isNumber(packet.headers['@status']) === true
					&& isString(STATUSES[packet.headers['@status']]) === true
				) {
					headers['@status'] = packet.headers['@status'];
				}
				// TODO: Validate headers

			}

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

				// TODO: Implement range based encoding as in HTTP Packet Parser
				// but in WS it's the 0x02 and then 0x00 frames sent separately
				// depending on from and to in [range] header

			}


			// TODO: Encoding of range[ from, to ]
			// - If packet.payload > range[1] then 0x02 Frame, then 0x00 Frame for rest

			// Max frame size seems to be around 128kB, but it's lower down the network
			// stack and actually related to the Operating System and not the Browser's
			// Network Stack (chromium-net has no limitations in the code, but 112kB is the limit)

		}


		return null;

	},

	isPacket: function(buffer) {

		buffer = isBuffer(buffer) ? buffer : null;


		if (buffer !== null) {

			if (buffer.length > 2) {

				let operator = (buffer[0] & 15);

				if (
					operator === 0x00
					|| operator === 0x01
					|| operator === 0x02
					|| operator === 0x08
					|| operator === 0x09
					|| operator === 0x0a
				) {

					let payload_length = (buffer[1] & 127);
					let mask           = (buffer[1] & 128) === 128;

					if (payload_length <= 125) {

						if (
							(mask === true && buffer.length >= payload_length + 6)
							|| (mask === false && buffer.length >= payload_length + 2)
						) {
							return true;
						}

					} else if (payload_length === 126) {

						payload_length = (buffer[2] << 8) + buffer[3];

						if (
							(mask === true && buffer.length >= payload_length + 8)
							|| (mask === false && buffer.length >= payload_length + 4)
						) {
							return true;
						}

					} else if (payload_length === 127) {

						let hi = (buffer[2] * 0x1000000) + ((buffer[3] << 16) | (buffer[4] << 8) | buffer[5]);
						let lo = (buffer[6] * 0x1000000) + ((buffer[7] << 16) | (buffer[8] << 8) | buffer[9]);

						payload_length = (hi * 4294967296) + lo;

						if (
							(mask === true && buffer.length >= payload_length + 14)
							|| (mask === false && buffer.length >= payload_length + 10)
						) {
							return true;
						}

					}

				}

			}

		}


		return false;

	}

};


export { WS };

