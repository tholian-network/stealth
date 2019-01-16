
import crypto     from 'crypto';
import { Buffer } from 'buffer';


const _decode = function(socket, buffer) {

	let fragment = socket.__fragment || null;
	if (fragment === null) {
		fragment = socket.__fragment = {
			operator: 0x00,
			payload:  Buffer.alloc(0)
		};
	}

	let chunk = {
		bytes:   -1,
		headers: {},
		payload: null
	};


	if (buffer.length <= 2) {
		return chunk;
	}


	let fin            = (buffer[0] & 128) === 128;
	// let rsv1        = (buffer[0] & 64) === 64;
	// let rsv2        = (buffer[0] & 32) === 32;
	// let rsv3        = (buffer[0] & 16) === 16;
	let operator       = buffer[0] & 15;
	let mask           = (buffer[1] & 128) === 128;
	let mask_data      = Buffer.alloc(4);
	let payload_length = buffer[1] & 127;
	let payload_data   = null;

	if (payload_length <= 125) {

		if (mask === true) {
			mask_data    = buffer.slice(2, 6);
			payload_data = buffer.slice(6, 6 + payload_length);
			chunk.bytes  = 6 + payload_length;
		} else {
			mask_data    = null;
			payload_data = buffer.slice(2, 2 + payload_length);
			chunk.bytes  = 2 + payload_length;
		}

	} else if (payload_length === 126) {

		payload_length = (buffer[2] << 8) + buffer[3];


		if (payload_length > buffer.length) {
			return chunk;
		}


		if (mask === true) {
			mask_data    = buffer.slice(4, 8);
			payload_data = buffer.slice(8, 8 + payload_length);
			chunk.bytes  = 8 + payload_length;
		} else {
			mask_data    = null;
			payload_data = buffer.slice(4, 4 + payload_length);
			chunk.bytes  = 4 + payload_length;
		}

	} else if (payload_length === 127) {

		let hi = (buffer[2] * 0x1000000) + ((buffer[3] << 16) | (buffer[4] << 8) | buffer[5]);
		let lo = (buffer[6] * 0x1000000) + ((buffer[7] << 16) | (buffer[8] << 8) | buffer[9]);


		payload_length = (hi * 4294967296) + lo;


		if (payload_length > buffer.length) {
			return chunk;
		}


		if (mask === true) {
			mask_data    = buffer.slice(10, 14);
			payload_data = buffer.slice(14, 14 + payload_length);
			chunk.bytes  = 14 + payload_length;
		} else {
			mask_data    = null;
			payload_data = buffer.slice(10, 10 + payload_length);
			chunk.bytes  = 10 + payload_length;
		}

	}


	if (mask_data !== null) {
		payload_data = payload_data.map((value, index) => value ^ mask_data[index % 4]);
	}


	// 0: Continuation Frame (Fragmentation)
	if (operator === 0x00) {

		if (payload_data !== null) {

			let payload = Buffer.alloc(fragment.payload.length + payload_length);

			fragment.payload.copy(payload, 0);
			payload_data.copy(payload, fragment.payload.length);

			fragment.payload = payload;

		}


		if (fin === true) {

			let tmp0 = _JSON.decode(fragment.payload);
			if (tmp0 !== null) {
				chunk.headers = tmp0.headers || {};
				chunk.payload = tmp0.payload || null;
			}

			fragment.operator = 0x00;
			fragment.payload  = Buffer.alloc(0);

		}


	// 1: Text Frame
	} else if (operator === 0x01) {

		if (fin === true) {

			let tmp1 = _JSON.decode(payload_data);
			if (tmp1 !== null) {
				chunk.headers = tmp1.headers || {};
				chunk.payload = tmp1.payload || null;
			}

		} else if (payload_data !== null) {

			let payload = Buffer.alloc(fragment.payload.length + payload_length);

			fragment.payload.copy(payload, 0);
			payload_data.copy(payload, fragment.payload.length);

			fragment.payload  = payload;
			fragment.operator = operator;

		}


	// 2: Binary Frame
	} else if (operator === 0x02) {

		chunk.payload = WS.close(1002);

	// 8: Connection Close
	} else if (operator === 0x08) {

		chunk.payload = WS.close(1000);

	// 9: Ping Frame
	} else if (operator === 0x09) {

		chunk.payload = _on_ping_frame.call(this);


	// 10: Pong Frame
	} else if (operator === 0x0a) {

		chunk.payload = _on_pong_frame.call(this);


	// 3-7: Reserved Non-Control Frames, 11-15: Reserved Control Frames
	} else {

		chunk.payload = WS.close(1002);

	}


	return chunk;



};



const WS = {

	upgrade: function(socket, headers, callback) {

		headers  = headers instanceof Object    ? headers  : null;
		callback = callback instanceof Function ? callback : null;


		if (headers !== null) {

			let nonce = headers['sec-websocket-key'] || null;
			if (nonce !== null) {

				let hash   = crypto.createHash('sha1').update(nonce + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('hex');
				let accept = Buffer.from(hash, 'hex').toString('base64');
				let blob   = [];

				blob.push('HTTP/1.1 101 WebSocket Protocol Handshake');
				blob.push('Upgrade: WebSocket');
				blob.push('Connection: Upgrade');
				blob.push('Sec-WebSocket-Accept: ' + accept);
				blob.push('Sec-WebSocket-Protocol: stealth');
				blob.push('Sec-WebSocket-Version: 13');
				blob.push('');
				blob.push('');

				socket.write(blob.join('\r\n'));

				if (callback !== null) {
					callback(true);
				}

				return true;

			}

		} else {

			if (callback !== null) {
				callback(false);
			}

			return false;

		}

	},

	receive: function(socket, blob) {

		// TODO: _decode(socket, blob);

		console.log('WS.receive()', blob);

		// TODO: Implement websocket frame parser,
		// receive data from client.
		// For simplification: JSON data only,
		// -> ignore service flags
		// -> delegate to service/Whatever.mjs

	},

	send: function(socket, data) {
	}

};


export { WS };

