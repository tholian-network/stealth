
import { console, Buffer, isArray, isBuffer, isFunction, isObject, isString } from '../../extern/base.mjs';
import { ENVIRONMENT                                               } from '../../source/ENVIRONMENT.mjs';
import { isStealth, VERSION                                        } from '../../source/Stealth.mjs';
import { MDNS                                                      } from '../../source/connection/MDNS.mjs';
import { URL                                                       } from '../../source/parser/URL.mjs';
import { isServices                                                } from '../../source/server/Services.mjs';



const RESERVED = [

	'beacon',
	'browser',
	'intel',
	'radar',
	'recon',
	'sonar',
	'stealth',
	'www'

];

const isConnection = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Connection]';
};

export const isPeerer = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Peerer]';
};

const isQuery = function(payload) {

	if (
		isObject(payload) === true
		&& isString(payload.domain) === true
		&& (isString(payload.subdomain) === true || payload.subdomain === null)
	) {

		if (
			(payload.domain === 'tholian.local' || payload.domain === 'tholian.network')
			&& isString(payload.subdomain) === true
			&& payload.subdomain.includes('.') === false
		) {

			if (RESERVED.includes(payload.subdomain) === false) {
				return true;
			}

		} else {

			let domain1 = isString(payload.subdomain) ? (payload.subdomain + '.' + payload.domain) : payload.domain;
			let url     = URL.parse('https://' + domain1 + '/');
			let domain2 = URL.toDomain(url);

			if (domain1 === domain2) {
				return true;
			}

		}

	}

	return false;

};

const isServiceDiscoveryRequest = function(packet) {

	if (
		isObject(packet) === true
		&& isObject(packet.headers) === true
		&& packet.headers['@type'] === 'request'
		&& isObject(packet.payload) === true
		&& isArray(packet.payload.questions) === true
		&& isArray(packet.payload.answers) === true
		&& packet.payload.questions.length > 0
		&& packet.payload.answers.length === 0
	) {

		let ptr1 = packet.payload.questions.find((q) => (q.type === 'PTR' && q.value === '_stealth._wss.tholian.local')) || null;
		let ptr2 = packet.payload.questions.find((q) => (q.type === 'PTR' && q.value === '_stealth._ws.tholian.local'))  || null;
		if (ptr1 !== null || ptr2 !== null) {

			let rest = packet.payload.questions.filter((q) => (q !== ptr1 && q !== ptr2));
			if (rest.length === 0) {
				return true;
			}

		}

	}


	return false;

};

const isServiceDiscoveryResponse = function(packet) {

	if (
		isObject(packet) === true
		&& isObject(packet.headers) === true
		&& packet.headers['@type'] === 'response'
		&& isObject(packet.payload) === true
		&& isArray(packet.payload.questions) === true
		&& isArray(packet.payload.answers) === true
		&& packet.payload.questions.length === 2
		&& packet.payload.answers.length > 3
	) {

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


	return false;

};

const toDomain = function(payload) {

	let domain = null;

	if (isObject(payload) === true) {

		if (isString(payload.domain) === true) {
			domain = payload.domain;
		}

	}

	return domain;

};

const toUsername = function(payload) {

	let username = null;

	if (isObject(payload) === true) {

		if (
			isString(payload.domain) === true
			&& (
				payload.domain === 'tholian.local'
				|| payload.domain === 'tholian.network'
			)
			&& isString(payload.subdomain) === true
			&& payload.subdomain.includes('.') === false
			&& RESERVED.includes(payload.subdomain) === false
		) {
			username = payload.subdomain;
		}

	}

	return username;

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
				domain: hostname,
				type:   'PTR',
				value:  '_stealth._wss.tholian.local'
			});

			response.payload.answers.push({
				domain: hostname,
				type:   'SRV',
				port:   65432,
				weight: 0
			});

			response.payload.answers.push({
				domain: hostname,
				type:   'TXT',
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



const Peerer = function(services, stealth) {

	services = isServices(services) ? services : null;
	stealth  = isStealth(stealth)   ? stealth  : null;


	this.services = services;
	this.stealth  = stealth;

};


Peerer.prototype = {

	[Symbol.toStringTag]: 'Peerer',

	toJSON: function() {

		let data = {};


		return {
			'type': 'Peerer',
			'data': data
		};

	},

	discover: function() {

		let has_ipv4 = ENVIRONMENT.ips.filter((ip) => ip.type === 'v4').length > 0;
		if (has_ipv4 === true) {

			let connection = MDNS.connect('mdns://224.0.0.251:5353');
			let request    = toServiceDiscoveryRequest.call(this);

			if (connection !== null && request !== null) {
				MDNS.send(connection, request);
			}

		}

		let has_ipv6 = ENVIRONMENT.ips.filter((ip) => ip.type === 'v6').length > 0;
		if (has_ipv6 === true) {

			let connection = MDNS.connect('mdns://[ff02::fb]:5353');
			let request    = toServiceDiscoveryRequest.call(this);

			if (connection !== null && request !== null) {
				MDNS.send(connection, request);
			}

		}

	},

	can: function(packet) {

		packet = isObject(packet) ? packet : null;


		if (isServiceDiscoveryRequest(packet) === true) {
			return true;
		} else if (isServiceDiscoveryResponse(packet) === true) {
			return true;
		}


		return false;

	},

	receive: function(connection, packet) {

		connection = isConnection(connection) ? connection : null;


		if (isServiceDiscoveryRequest(packet) === true) {

			let response = toServiceDiscoveryResponse.call(this, packet);
			if (response !== null) {

				MDNS.send(connection, response, (result) => {

					if (result === true) {
						console.warn('Peerer: A Stealth Browser asked for local Peers.');
					}

				});

			}

		} else if (isServiceDiscoveryResponse(packet) === true) {

			if (this.stealth !== null) {

				// TODO: Verify A entries in terms of subnet (and reachability)

				// TODO: Add peer to this.stealth.settings.peers
				// TODO: Add host to this.stealth.settings.hosts

				console.warn('TODO: Process Peer', packet);

			}

		}


		return null;

	},

	resolve: function(query, callback) {

		query    = isQuery(query)       ? query    : null;
		callback = isFunction(callback) ? callback : null;


		if (
			query !== null
			&& ENVIRONMENT.ips.length > 0
		) {

			let domain   = toDomain(query);
			let username = toUsername(query);

			if (domain !== null && username !== null) {

				if (domain === 'tholian.local') {

					// TODO: Remove per-connection resolving mechanism
					// and move it to a resolver that is passive and
					// processes incoming responses automatically

					// TODO: Use cached peers settings to resolve an
					// (at the time already) resolved Peer

				} else if (domain === 'tholian.network') {

					// TODO: Use Radar Service API to resolve username.tholian.network

				} else {

					// XXX: Currently it never goes there due to isQuery()
					// filtering it out


					// TODO: Use Multicast DNS request to other Peers
					// to resolve cached host entry for domains

				}

				if (callback !== null) {
					callback(null);
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


		// TODO: Iterate via settings.peers
		// else announce this host and wait 3 seconds for replies.
		// If no reply has arrived by then, then callback(null);
		// If a reply has arrived by then, then callback({ domain, hosts })

	}

};


export { Peerer };

