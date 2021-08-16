
import { Buffer, isBuffer, isObject, isString } from '../../extern/base.mjs';
import { ENVIRONMENT                          } from '../../source/ENVIRONMENT.mjs';
import { isStealth, VERSION                   } from '../../source/Stealth.mjs';
import { MDNS                                 } from '../../source/connection/MDNS.mjs';
import { DNS as PACKET                        } from '../../source/packet/DNS.mjs';
import { URL                                  } from '../../source/parser/URL.mjs';
import { isServices                           } from '../../source/server/Services.mjs';



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
	return Object.prototype.toString.call(obj) === '[object Proxy]';
};



const isServiceDiscovery = function(packet) {

	let check1 = packet.payload.questions.filter((q) => q.type === 'PTR');
	if (check1.length === packet.payload.questions.length) {

		let check2 = check1.filter((q) => (q.value === '_stealth._wss.tholian.local' || q.value === '_stealth._ws.tholian.local'));
		if (check2.length === check1.length) {
			return true;
		}

	}


	return false;

};

const isResolvable = function(packet) {

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


	return false;

};

const toServiceDiscoveryResponse = function(request, callback) {

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


		callback(response);

	} else {

		callback(null);

	}

};



const Router = function(services, stealth) {

	services = isServices(services) ? services : null;
	stealth  = isStealth(stealth)   ? stealth  : null;


	this.services = services;
	this.stealth  = stealth;

};


Router.prototype = {

	can: function(buffer) {

		buffer = isBuffer(buffer) ? buffer : null;


		if (buffer !== null) {

			if (PACKET.isPacket(buffer) === true) {

				let packet = PACKET.decode(null, buffer);
				if (packet !== null) {
					return true;
				}

			}

		}


		return false;

	},

	resolve: function(query, callback) {

		query    = isQuery(query)       ? query    : null;
		callback = isFunction(callback) ? callback : null;

		// TODO: Query can be *.tholian.local
		// TODO: Query can be _stealth._wss.tholian.local and _stealth._ws.tholian.local

	},

	upgrade: function(buffer, socket, rinfo) {

		buffer = isBuffer(buffer) ? buffer : null;
		socket = isSocket(socket) ? socket : null;

		let packet = PACKET.decode(null, buffer);
		if (packet !== null) {

			let A    = packet.payload.questions.filter((q) => q.type === 'A');
			let AAAA = packet.payload.questions.filter((q) => q.type === 'AAAA');
			let SRV  = packet.payload.questions.filter((q) => q.type === 'SRV');

			if (packet.headers['@type'] === 'request') {

				if (isServiceDiscovery(packet) === true) {

					// TODO: Check for QM for multicast response
					// TODO: Check for QU for unicast response

					// TODO: Handle SRV question for "_stealth._wss.tholian.local" and "_stealth.ws.tholian.local"
					//
					// Answer contains PTR for "_stealth._wss.tholian.local" pointing to "username._stealth._wss.tholian.local" on port 65432
					// Answer contains SRV for username._stealth._wss.tholian.local with target set to username.tholian.local
					// Answer contains TXT for username._stealth._wss.tholian.local with "version=X0"
					// Answer contains A for username.tholian.local
					// Answer contains AAAA for username.tholian.local

				} else if (isResolvable(packet) === true) {
				}

			} else {

				// Do Nothing

			}

			// TODO: Send response to remote address (in rinfo)



			// TODO: Handle Question for A or AAAA of online domains (not ending in tholian.local)
			// TODO: Do this dependent on this.stealth._settings.internet
			// - serve from hosts[] cache or do request online via reimplemented DNS ronin mechanism
			//
			// Answer contains A for domain
			// Answer contains AAAA for domain

		} else {

			// Do Nothing

		}


		return null;

	}

};


export { Router };

