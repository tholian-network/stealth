
import { console, Buffer, isArray, isBuffer, isFunction, isObject, isString } from '../../extern/base.mjs';
import { ENVIRONMENT                                                        } from '../../source/ENVIRONMENT.mjs';
import { isStealth, VERSION                                                 } from '../../source/Stealth.mjs';
import { MDNS                                                               } from '../../source/connection/MDNS.mjs';
import { IP                                                                 } from '../../source/parser/IP.mjs';
import { URL                                                                } from '../../source/parser/URL.mjs';
import { isServices                                                         } from '../../source/server/Services.mjs';



const CONNECTION = [ 'mobile', 'broadband', 'peer', 'tor' ];

const RESERVED = [

	'beacon',
	'browser',
	'intel',
	'oversight',
	'radar',
	'recon',
	'sonar',
	'stealth',
	'www'

];

const toOptionValue = (packet, key) => {

	let txt = packet.payload.answers.find((record) => {

		if (
			record.type === 'TXT'
			&& isArray(record.value) === true
			&& isBuffer(record.value[0]) === true
			&& record.value[0].toString('utf8').startsWith(key + '=') === true
		) {
			return true;
		}

		return false;

	}) || null;

	if (txt !== null) {

		let str = txt.value[0].toString('utf8');
		let val = str.substr((key + '=').length);

		let num = parseInt(val, 10);
		if (Number.isNaN(num) === false && (num).toString() === val) {
			val = num;
		}

		if (val === 'true')  val = true;
		if (val === 'false') val = false;
		if (val === 'null')  val = null;

		return val;

	}

	return null;

};

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

		let ptr         = packet.payload.answers.find((a) => a.type === 'PTR') || null;
		let srv         = packet.payload.answers.find((a) => a.type === 'SRV') || null;
		let version     = toOptionValue(packet, 'version');
		let certificate = toOptionValue(packet, 'certificate');
		let connection  = toOptionValue(packet, 'connection');

		if (
			ptr !== null
			&& (
				ptr.value === '_stealth._wss.tholian.local'
				|| ptr.value === '_stealth._ws.tholian.local'
			)
			&& srv !== null
			&& (
				srv.domain === '_stealth._wss.tholian.local'
				|| srv.domain === '_stealth._ws.tholian.local'
			)
			&& (
				(
					isString(srv.value) === true
					&& srv.value.endsWith('.tholian.local') === true
					&& srv.port === 65432
					&& srv.weight === 0
					&& isString(certificate) === true
				) || (
					isString(srv.value) === true
					&& srv.port === 65432
					&& srv.weight === 0
					&& certificate === null
				)
			)
			&& isString(connection) === true
			&& isString(version) === true
			&& version === VERSION
			&& CONNECTION.includes(connection) === true
		) {

			let has_ipv4 = ENVIRONMENT.ips.filter((ip) => ip.type === 'v4').length > 0;
			let ipv4s    = packet.payload.answers.filter((a) => a.type === 'A');

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

		if (
			isString(payload.domain) === true
			&& (
				payload.domain === 'tholian.local'
				|| payload.domain === 'tholian.network'
			)
		) {
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
			'@id':   (Math.random() * 0xffff) | 0,
			'@type': 'request'
		},
		payload: {
			questions: [{
				domain: null,
				type:   'PTR',
				value:  '_stealth._wss.tholian.local'
			}, {
				domain: null,
				type:   'PTR',
				value:  '_stealth._ws.tholian.local'
			}],
			answers: []
		}
	};

};

const toServiceDiscoveryResponse = function(request) {

	let certificate = null;
	let connection  = 'offline';
	let hostname    = ENVIRONMENT.hostname;

	if (this.stealth !== null) {

		if (
			isObject(this.stealth.settings.account) === true
			&& isObject(this.stealth.settings.account['certificate']) === true
			&& isBuffer(this.stealth.settings.account['certificate']['private']) === true
			&& isBuffer(this.stealth.settings.account['certificate']['public']) === true
			&& isString(this.stealth.settings.account['username']) === true
		) {
			certificate = this.stealth.settings.account['certificate']['public'].toString('base64');
			hostname    = this.stealth.settings.account['username'] + '.tholian.local';
		}

		if (isObject(this.stealth.settings.internet) === true) {
			connection = this.stealth.settings.internet.connection;
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
				domain: '_stealth._wss.tholian.local',
				type:   'SRV',
				value:  hostname,
				port:   65432,
				weight: 0
			});

		} else {

			response.payload.answers.push({
				type:   'PTR',
				domain: hostname,
				value:  '_stealth._ws.tholian.local'
			});

			response.payload.answers.push({
				domain: '_stealth._ws.tholian.local',
				type:   'SRV',
				value:  hostname,
				port:   65432,
				weight: 0
			});

		}

		response.payload.answers.push({
			type:   'TXT',
			domain: hostname,
			value:  [
				Buffer.from('version=' + VERSION, 'utf8')
			]
		});

		response.payload.answers.push({
			domain: hostname,
			type:   'TXT',
			value:  [
				Buffer.from('certificate=' + certificate, 'utf8')
			]
		});

		response.payload.answers.push({
			domain: hostname,
			type:   'TXT',
			value:  [
				Buffer.from('connection=' + connection, 'utf8')
			]
		});

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


	this.connections = { ipv4: null, ipv6: null };
	this.services    = services;
	this.stealth     = stealth;

};


Peerer.prototype = {

	[Symbol.toStringTag]: 'Peerer',

	toJSON: function() {

		let data = {
			connections: {
				ipv4: null,
				ipv6: null
			}
		};

		if (this.connections.ipv4 !== null) {
			data.connections.ipv4 = this.connections.ipv4.toJSON();
		}

		if (this.connections.ipv6 !== null) {
			data.connections.ipv6 = this.connections.ipv6.toJSON();
		}

		return {
			'type': 'Peerer',
			'data': data
		};

	},

	connect: function() {

		let has_ipv4 = ENVIRONMENT.ips.filter((ip) => ip.type === 'v4').length > 0;
		if (has_ipv4 === true) {

			let connection = this.connections.ipv4 || null;
			if (connection === null) {

				connection = MDNS.upgrade(null, URL.parse('mdns://224.0.0.251:5353'));

				connection.once('@connect', () => {

					console.info('Peerer: UDP Service for mdns://224.0.0.251:5353 started.');

					let request = toServiceDiscoveryRequest.call(this);
					if (connection !== null && request !== null) {
						MDNS.send(connection, request);
					}

				});

				connection.once('disconnect', () => {
					console.warn('Peerer: UDP Service for mdns://224.0.0.251:5353 stopped.');
				});

				connection.on('request', (packet) => {

					if (this.can(packet) === true) {
						this.receive(connection, packet);
					}

				});

				connection.on('response', (packet) => {

					if (this.can(packet) === true) {
						this.receive(connection, packet);
					}

				});

				this.connections.ipv4 = connection;

			}

		}

		let has_ipv6 = ENVIRONMENT.ips.filter((ip) => ip.type === 'v6').length > 0;
		if (has_ipv6 === true) {

			let connection = this.connections.ipv6 || null;
			if (connection === null) {
				connection = MDNS.upgrade(null, URL.parse('mdns://[ff02::fb]:5353'));

				connection.once('@connect', () => {

					console.info('Peerer: UDP Service for mdns://[ff02::fb]:5353 started.');

					let request = toServiceDiscoveryRequest.call(this);
					if (connection !== null && request !== null) {
						MDNS.send(connection, request);
					}

				});

				connection.once('disconnect', () => {
					console.warn('Peerer: UDP Service for mdns://[ff02::fb]:5353 stopped.');
				});

				connection.on('request', (packet) => {

					if (this.can(packet) === true) {
						this.receive(connection, packet);
					}

				});

				connection.on('response', (packet) => {

					if (this.can(packet) === true) {
						this.receive(connection, packet);
					}

				});

				this.connections.ipv6 = connection;

			}

		}


		if (has_ipv4 === true || has_ipv6 === true) {
			return true;
		}


		return false;

	},

	disconnect: function() {

		let connection_ipv4 = this.connections.ipv4 || null;
		if (connection_ipv4 !== null) {
			connection_ipv4.disconnect();
			this.connections.ipv4 = null;
		}

		let connection_ipv6 = this.connections.ipv6 || null;
		if (connection_ipv6 !== null) {
			connection_ipv6.disconnect();
			this.connections.ipv6 = null;
		}


		return true;

	},

	discover: function() {

		let has_ipv4 = ENVIRONMENT.ips.filter((ip) => ip.type === 'v4').length > 0;
		if (has_ipv4 === true) {

			let connection = this.connections.ipv4 || null;
			if (connection !== null) {

				let request = toServiceDiscoveryRequest.call(this);
				if (connection !== null && request !== null) {
					MDNS.send(connection, request);
				}

			}

		}

		let has_ipv6 = ENVIRONMENT.ips.filter((ip) => ip.type === 'v6').length > 0;
		if (has_ipv6 === true) {

			let connection = this.connections.ipv6 || null;
			if (connection !== null) {

				let request = toServiceDiscoveryRequest.call(this);
				if (connection !== null && request !== null) {
					MDNS.send(connection, request);
				}

			}

		}


		if (has_ipv4 === true || has_ipv6 === true) {
			return true;
		}


		return false;

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

			if (this.stealth !== null && this.stealth._settings.debug === true) {

				let remote = connection.toJSON().data['remote'];
				if (remote !== null) {
					console.log('Peerer: Client "' + IP.render(remote['host']) + '" sent a Multicast DNS-SD Request.');
				}

			}

			let response = toServiceDiscoveryResponse.call(this, packet);
			if (response !== null) {
				MDNS.send(connection, response);
			}

		} else if (isServiceDiscoveryResponse(packet) === true) {

			if (this.stealth !== null && this.stealth._settings.debug === true) {

				let remote = connection.toJSON().data['remote'];
				if (remote !== null) {
					console.log('Peerer: Client "' + IP.render(remote['host']) + '" sent a Multicast DNS-SD Response.');
				}

			}

			if (this.stealth !== null) {

				if (this.services !== null) {

					let host = {
						domain: null,
						hosts: []
					};

					let peer = {
						domain: null,
						peer: {
							connection:  null,
							certificate: null,
							version:     null
						}
					};

					let srv = packet.payload.answers.find((a) => a.type === 'SRV') || null;
					if (srv !== null) {

						if (srv.value.endsWith('.tholian.local') === true) {
							host.domain = srv.value;
							peer.domain = srv.value;
						} else {
							host.domain = srv.value;
							peer.domain = srv.value;
						}

					}

					let version = toOptionValue(packet, 'version');
					if (version === VERSION) {
						peer.peer.version = version;
					}

					let certificate = toOptionValue(packet, 'certificate');
					if (certificate !== null) {
						peer.peer.certificate = certificate;
					}

					let connection = toOptionValue(packet, 'connection');
					if (CONNECTION.includes(connection) === true) {
						peer.peer.connection = connection;
					}

					let ipv4s = packet.payload.answers.filter((a) => a.type === 'A').map((a) => a.value);
					if (ipv4s.length > 0) {

						// TODO: Verify A entries in terms of subnet (and reachability)
						ipv4s.forEach((ip) => {

							if (IP.isIP(ip) === true) {
								host.hosts.push(ip);
							}

						});

					}

					let ipv6s = packet.payload.answers.filter((a) => a.type === 'AAAA').map((a) => a.value);
					if (ipv6s.length > 0) {

						// TODO: Verify AAAA entries in terms of subnet (and reachability)
						ipv6s.forEach((ip) => {

							if (IP.isIP(ip) === true) {
								host.hosts.push(ip);
							}

						});

					}


					if (
						host.domain !== null
						&& peer.domain !== null
					) {

						if (
							peer.domain.endsWith('.tholian.local')
							&& peer.peer.certificate !== null
						) {
							console.info('Peerer: Trusted Peer "' + peer.domain + '" updated.');
						} else {
							console.warn('Peerer: Untrusted Peer "' + peer.domain + '" updated.');
						}

						this.services.host.read({
							domain: host.domain
						}, (response) => {

							if (response === null) {

								this.services.peer.read({
									domain: peer.domain
								}, (response) => {

									if (response.payload !== null) {

										if (response.payload.peer.certificate === peer.peer.certificate) {
											this.services.host.save(host);
											this.services.peer.save(peer);
										}

									} else if (response.payload === null) {

										this.services.host.save(host);
										this.services.peer.save(peer);

									}

								});

							}

						});

					}

				}

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

			let username = toUsername(query);
			if (username !== null) {

				let domain = toDomain(query);
				if (domain === 'tholian.local') {

					if (this.stealth !== null) {

						let host = this.stealth.settings.hosts.find((h) => h.domain === username + '.tholian.local') || null;
						if (host !== null) {

							if (callback !== null) {
								callback(host);
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

				} else if (domain === 'tholian.network') {

					// TODO: Use Radar Service API to resolve username.tholian.network

					if (callback !== null) {
						callback(null);
					}

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

	}

};


export { Peerer };

