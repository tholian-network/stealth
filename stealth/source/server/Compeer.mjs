
import dgram from 'dgram';

import { console, Buffer, isBuffer, isObject, isString } from '../../extern/base.mjs';
import { ENVIRONMENT                                   } from '../../source/ENVIRONMENT.mjs';
import { isStealth, VERSION                            } from '../../source/Stealth.mjs';
import { MDNS                                          } from '../../source/connection/MDNS.mjs';
import { DNS as PACKET                                 } from '../../source/packet/DNS.mjs';
import { isServices                                    } from '../../source/server/Services.mjs';



export const isCompeer = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Compeer]';
};

const isSocket = function(obj) {

	if (obj !== null && obj !== undefined) {
		return obj instanceof dgram.Socket;
	}

	return false;

};



const isServiceDiscoveryRequest = function(packet) {

	if (packet.headers['@type'] === 'request') {

		if (packet.payload.questions.length === 2 && packet.payload.answers.length === 0) {

			let check1 = packet.payload.questions.filter((q) => q.type === 'PTR');
			if (check1.length === packet.payload.questions.length) {

				let check2 = check1.filter((q) => (q.value === '_stealth._wss.tholian.local' || q.value === '_stealth._ws.tholian.local'));
				if (check2.length === check1.length) {
					return true;
				}

			}

		}

	}


	return false;

};

const isServiceDiscoveryResponse = function(packet) {

	if (packet.headers['@type'] === 'response') {

		if (packet.payload.questions.length === 2 && packet.payload.answers.length > 3) {

			let ptr = packet.payload.answers.find((a) => a.type === 'PTR') || null;
			let srv = packet.payload.answers.find((a) => a.type === 'SRV') || null;
			let txt = packet.payload.answers.find((a) => a.type === 'TXT') || null;


			if (
				ptr !== null
				&& (
					ptr.value === '_stealth._ws.tholian.local'
					|| ptr.value === '_stealth._ws.tholian.local'
				)
				&& srv !== null
				&& srv.port === 65432
				&& srv.weight === 0
				&& txt !== null
				&& isBuffer(txt.value[0]) === true
				&& txt.value[0].toString('utf8') === 'version=' + VERSION
			) {

				let has_ipv4 = ENVIRONMENT.ips.filter((ip) => ip.type === 'v4').length > 0;
				let ipv4s    = packet.payload.answers.filter((a) => a.type === 'A');

				// TODO: IPv4 have to be verified in terms of subnet masks

				if (has_ipv4 === true && ipv4s.length > 0) {
					return true;
				}

				let has_ipv6 = ENVIRONMENT.ips.filter((ip) => ip.type === 'v6').length > 0;
				let ipv6s    = packet.payload.answers.filter((a) => a.type === 'AAAA');

				if (has_ipv6 === true && ipv6s.length > 0) {
					return true;
				}

			}

		}

	}


	return false;

};

const toServiceDiscoveryRequest = function() {

	return {
		headers: {
			'@id':   (Math.random() * 0xff) | 0,
			'@type': 'request'
		},
		payload: {
			questions: [{
				type:   'PTR',
				domain: null,
				value:  '_stealth._wss.tholian.local'
			}, {
				type:   'PTR',
				domain: null,
				value:  '_stealth._ws.tholian.local'
			}],
			answers: []
		}
	};

};

const toServiceDiscoveryResponse = function(request) {

	let hostname = ENVIRONMENT.hostname;

	if (this.stealth !== null) {

		if (isObject(this.stealth._settings.account) === true) {
			hostname = this.stealth._settings.account.username + '.tholian.local';
		}

	}

	if (isString(hostname) === true && ENVIRONMENT.ips.length > 0) {

		let response = {
			headers: {
				'@id':   request.headers['@id'] || 0,
				'@type': 'response'
			},
			payload: {
				questions: [],
				answers:   []
			}
		};


		request.payload.questions.filter((question) => {

			if (
				question.type === 'PTR'
				&& (
					question.value === '_stealth._wss.tholian.local'
					|| question.value === '_stealth._ws.tholian.local'
				)
			) {

				response.payload.questions.push(question);

			}

		});


		if (hostname.endsWith('.tholian.local') === true) {

			response.payload.answers.push({
				type:   'PTR',
				domain: hostname,
				value:  '_stealth._wss.tholian.local'
			});

			response.payload.answers.push({
				type:   'SRV',
				domain: hostname,
				port:   65432,
				weight: 0
			});

			response.payload.answers.push({
				type:   'TXT',
				domain: hostname,
				value:  [
					Buffer.from('version=' + VERSION)
				]
			});

		} else {

			response.payload.answers.push({
				type:   'PTR',
				domain: hostname,
				value:  '_stealth._ws.tholian.local'
			});

			response.payload.answers.push({
				type:   'SRV',
				domain: hostname,
				port:   65432,
				weight: 0
			});

			response.payload.answers.push({
				type:   'TXT',
				domain: hostname,
				value:  [
					Buffer.from('version=' + VERSION)
				]
			});

		}

		ENVIRONMENT.ips.forEach((ip) => {

			if (ip.type === 'v4') {

				response.payload.answers.push({
					type:   'A',
					domain: hostname,
					value:  ip
				});

			} else if (ip.type === 'v6') {

				response.payload.answers.push({
					type:   'AAAA',
					domain: hostname,
					value:  ip
				});

			}

		});


		return response;

	}


	return null;

};



const Compeer = function(services, stealth) {

	services = isServices(services) ? services : null;
	stealth  = isStealth(stealth)   ? stealth  : null;


	this.services = services;
	this.stealth  = stealth;

};


Compeer.prototype = {

	[Symbol.toStringTag]: 'Compeer',

	toJSON: function() {

		let data = {};


		return {
			'type': 'Compeer',
			'data': data
		};

	},

	announce: function() {

		let has_ipv4 = ENVIRONMENT.ips.filter((ip) => ip.type === 'v4').length > 0;
		if (has_ipv4 === true) {

			let connection = MDNS.connect('mdns://224.0.0.251:5353');
			let request    = toServiceDiscoveryRequest.call(this);

			if (connection !== null && request !== null) {

				MDNS.send(connection, request, (result) => {

					if (result === true) {
						console.warn('Compeer: Announced this machine as Local IPv4 Peer.');
					}

				});

			}

		}

		let has_ipv6 = ENVIRONMENT.ips.filter((ip) => ip.type === 'v6').length > 0;
		if (has_ipv6 === true) {

			let connection = MDNS.connect('mdns://[ff02::fb]:5353');
			let request    = toServiceDiscoveryRequest.call(this);

			if (connection !== null && request !== null) {

				MDNS.send(connection, request, (result) => {

					if (result === true) {
						console.warn('Compeer: Announced this machine as Local IPv6 Peer.');
					}

				});

			}

		}

	},

	can: function(buffer) {

		buffer = isBuffer(buffer) ? buffer : null;


		if (buffer !== null) {

			if (PACKET.isPacket(buffer) === true) {

				let packet = PACKET.decode(null, buffer);
				if (packet !== null) {

					if (packet.headers['@type'] === 'request') {

						if (isServiceDiscoveryRequest(packet) === true) {
							return true;
						} else if (isServiceDiscoveryResponse(packet) === true) {
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

			if (isServiceDiscoveryRequest(packet) === true) {

				let connection = MDNS.upgrade(socket);
				if (connection !== null) {

					let response = toServiceDiscoveryResponse.call(this, packet);
					if (response !== null) {

						MDNS.send(connection, response, (result) => {

							if (result === true) {
								console.warn('Compeer: Discovered a Peer at "' + remote.host + '".');
							}

						});

					}

				}

			} else if (isServiceDiscoveryResponse(packet) === true) {

				if (this.stealth !== null) {

					// TODO: Verify A entries in terms of subnet (and reachability)
					// TODO: Add Peers to this.stealth

					console.log('TODO: Add peers to this.stealth', packet);

				}

			}

		} else {

			// Do Nothing

		}


		return null;

	}

};


export { Compeer };

