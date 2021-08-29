
import dgram from 'dgram';

import { console, Buffer, isBuffer, isObject, isString } from '../../extern/base.mjs';
import { isStealth                                     } from '../../source/Stealth.mjs';
import { DNS                                           } from '../../source/connection/DNS.mjs';
import { DNS as PACKET                                 } from '../../source/packet/DNS.mjs';
import { isServices                                    } from '../../source/server/Services.mjs';
import { URL                                           } from '../../source/parser/URL.mjs';



const RESERVED_TLDS = [
	'domain',
	'example',
	'invalid',
	'local',
	'localhost',
	'test'
];

const HIGHRISK_TLDS = [
	'belkin',
	'corp',
	'home',
	'lan',
	'localdomain',
	'mail',
	'wpad'
];

export const isRouter = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Router]';
};

const isSocket = function(obj) {

	if (obj !== null && obj !== undefined) {
		return obj instanceof dgram.Socket;
	}

	return false;

};



const isResolveRequest = function(packet) {

	if (packet.headers['@type'] === 'request') {

		if (packet.payload.questions.length > 0 && packet.payload.answers.length === 0) {

			let check1 = packet.payload.questions.filter((q) => (q.type === 'A' || q.type === 'AAAA'));
			if (check1.length === packet.payload.questions.length) {

				let check2 = packet.payload.questions.filter((q) => {

					let url    = URL.parse(q.domain);
					let domain = URL.toDomain(url);
					if (domain !== null) {

						let valid  = true;

						RESERVED_TLDS.forEach((tld) => {

							if (domain === tld || domain.endsWith('.' + tld)) {
								valid = false;
							}

						});

						HIGHRISK_TLDS.forEach((tld) => {

							if (domain === tld || domain.endsWith('.' + tld)) {
								valid = false;
							}

						});

						return valid;

					}


					return false;

				});

				if (check1.length === check2.length) {
					return true;
				}

			}

		}

	}


	return false;

};

const isResolveResponse = function(packet) {

	// TODO: Check whether packet is a valid response
	// and has only A and AAAA questions and only A and AAAA responses

	return false;

};



const Router = function(services, stealth) {

	services = isServices(services) ? services : null;
	stealth  = isStealth(stealth)   ? stealth  : null;


	this.services = services;
	this.stealth  = stealth;

};


Router.prototype = {

	[Symbol.toStringTag]: 'Router',

	toJSON: function() {

		let data = {
		};


		return {
			'type': 'Router',
			'data': data
		};

	},

	can: function(buffer) {

		buffer = isBuffer(buffer) ? buffer : null;


		if (buffer !== null) {

			if (PACKET.isPacket(buffer) === true) {

				let packet = PACKET.decode(null, buffer);
				if (packet !== null) {

					if (packet.headers['@type'] === 'request') {

						if (isResolveRequest(packet) === true) {
							return true;
						}

					}

				}

			}

		}


		return false;

	},

	upgrade: function(buffer, socket, remote) {

		buffer = isBuffer(buffer) ? buffer : null;
		socket = isSocket(socket) ? socket : null;


		let packet = PACKET.decode(null, buffer);
		if (packet !== null) {

			if (isResolveRequest(packet) === true) {

				// TODO: Only resolve hosts if internet settings
				// allow to do so (broadband, mobile)

			} else if (isResolveResponse(packet) === true) {

				// TODO: Verify A and AAAA entries
				// TODO: Add hosts to settings.hosts[]

			}

		} else {

			// Do Nothing

		}


		return null;

	}

};


export { Router };

