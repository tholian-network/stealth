
import fs   from 'fs';
import net  from 'net';
import path from 'path';

import { Buffer, isBuffer } from '../../extern/base.mjs';
import { ENVIRONMENT      } from '../../source/ENVIRONMENT.mjs';
import { isStealth        } from '../../source/Stealth.mjs';
import { DNS              } from '../../source/packet/DNS.mjs';
import { HTTP             } from '../../source/packet/HTTP.mjs';
import { isServices       } from '../../source/server/Services.mjs';



const BOMB = (() => {

	let url    = path.resolve(ENVIRONMENT.root + '/stealth/source/server/Defender.gz');
	let buffer = null;

	try {
		buffer = fs.readFileSync(url);
	} catch (err) {
		buffer = null;
	}

	if (isBuffer(buffer) === true) {
		return buffer;
	}

	return Buffer.alloc(0);

})();

const toNamewreckResponse = function() {

	return Buffer.from([
		0x00, 0x00, 0x81, 0x00, 0x00, 0x01, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00,

		// example.com (with NULL terminator)
		0x07, 0x65, 0x78, 0x61, 0x6d, 0x70, 0x6c, 0x65, 0x03, 0x63, 0x6f, 0x6d, 0x00,
		0x00, 0x01, 0x00, 0x01,

		// answer: example.com (without NULL terminator)
		0x07, 0x65, 0x78, 0x61, 0x6d, 0x70, 0x6c, 0x65, 0x03, 0x63, 0x6f, 0x6d,
		0xc0, 12 + 17 + 26, // recursive pointer
		0x00, 0x01, 0x00, 0x01,
		0x00, 0x00, 0x00, 0x00,
		0x01, 0x03, 0x03, 0x07,

		// answer: example.com (without NULL terminator)
		0x07, 0x65, 0x78, 0x61, 0x6d, 0x70, 0x6c, 0x65, 0x03, 0x63, 0x6f, 0x6d,
		0xc0, 12 + 17, // recursive pointer
		0x00, 0x01, 0x00, 0x01,
		0x00, 0x00, 0x00, 0x00,
		0x01, 0x03, 0x03, 0x07
	]);

};

const toBombResponse = function() {

	let headers = Buffer.from([
		'HTTP/1.1 200 OK',
		'Content-Type: text/html',
		'Content-Length: ' + Buffer.byteLength(BOMB),
		'Content-Encoding: gzip',
		'Transfer-Encoding: gzip'
	].join('\r\n'), 'utf8');

	return Buffer.from([
		headers,
		Buffer.from('\r\n\r\n', 'utf8'),
		BOMB
	]);

};



const isSocket = function(obj) {

	if (obj !== null && obj !== undefined) {
		return obj instanceof net.Socket;
	}

	return false;

};

export const isDefender = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Defender]';
};



const Defender = function(services, stealth) {

	services = isServices(services) ? services : null;
	stealth  = isStealth(stealth)   ? stealth  : null;


	this.services = services;
	this.stealth  = stealth;

};


Defender.prototype = {

	[Symbol.toStringTag]: 'Defender',

	toJSON: function() {

		let data = {};


		return {
			'type': 'Defender',
			'data': data
		};

	},

	can: function(buffer) {

		buffer = isBuffer(buffer) ? buffer : null;


		if (buffer !== null) {

			if (
				HTTP.isPacket(buffer) === true
				|| DNS.isPacket(buffer) === true
			) {

				return true;

			}

		}


		return false;

	},

	upgrade: function(buffer, socket) {

		buffer = isBuffer(buffer) ? buffer : null;
		socket = isSocket(socket) ? socket : null;


		if (socket !== null) {

			if (HTTP.isPacket(buffer) === true) {

				socket.send(toBombResponse());

			} else if (DNS.isPacket(buffer) === true) {

				socket.send(toNamewreckResponse());

			}

		}

	}

};


export { Defender };

