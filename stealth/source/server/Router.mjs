
import { console, isArray, isFunction, isObject, isString } from '../../extern/base.mjs';
import { isStealth                                        } from '../../source/Stealth.mjs';
import { ENVIRONMENT                                      } from '../../source/ENVIRONMENT.mjs';
import { DNS                                              } from '../../source/connection/DNS.mjs';
import { DNSH                                             } from '../../source/connection/DNSH.mjs';
import { DNSS                                             } from '../../source/connection/DNSS.mjs';
import { SOCKS                                            } from '../../source/connection/SOCKS.mjs';
import { isServices                                       } from '../../source/server/Services.mjs';
import { IP                                               } from '../../source/parser/IP.mjs';
import { URL                                              } from '../../source/parser/URL.mjs';



const RESERVED = [

	'beacon',
	'browser',
	'oversight',
	'radar',
	'recon',
	'sonar',
	'stealth',
	'www'

];

const RONIN = [];

const SERVERS = [
	Object.assign(URL.parse('dnsh://cloudflare-dns.com:443/dns-query'), {
		hosts: [
			IP.parse('1.1.1.1'),
			IP.parse('2606:4700:4700::1111'),
			IP.parse('1.0.0.1'),
			IP.parse('2606:4700:4700::1001')
		]
	}),
	Object.assign(URL.parse('dnss://dns.google:853'), {
		hosts: [
			IP.parse('8.8.4.4'),
			IP.parse('2001:4860:4860::8844'),
			IP.parse('8.8.8.8'),
			IP.parse('2001:4860:4860::8888')
		]
	}),
	Object.assign(URL.parse('dnsh://dns.google:443/dns-query'), {
		hosts: [
			IP.parse('8.8.4.4'),
			IP.parse('2001:4860:4860::8844'),
			IP.parse('8.8.8.8'),
			IP.parse('2001:4860:4860::8888')
		]
	}),
	Object.assign(URL.parse('dnss://dns.digitale-gesellschaft.ch:853'), {
		hosts: [
			IP.parse('185.95.218.42'),
			IP.parse('2a05:fc84::42'),
			IP.parse('185.95.218.43'),
			IP.parse('2a05:fc84::43')
		]
	}),
	Object.assign(URL.parse('dnsh://dns.digitale-gesellschaft.ch:443/dns-query'), {
		hosts: [
			IP.parse('185.95.218.42'),
			IP.parse('2a05:fc84::42'),
			IP.parse('185.95.218.43'),
			IP.parse('2a05:fc84::43')
		]
	}),
	Object.assign(URL.parse('dnss://dnsforge.de:853'), {
		hosts: [
			IP.parse('176.9.93.198'),
			IP.parse('2a01:04f8:0151:34aa::0198'),
			IP.parse('176.9.1.117'),
			IP.parse('2a01:04f8:0141:316d::0117')
		]
	}),
	Object.assign(URL.parse('dnsh://doh.au.ahadns.net:443/dns-query'), {
		hosts: [
			IP.parse('103.73.64.132'),
			IP.parse('2406:ef80:0100:0011::0011')
		]
	}),
	Object.assign(URL.parse('dnsh://doh.es.ahadns.net:443/dns-query'), {
		hosts: [
			IP.parse('45.132.74.167'),
			IP.parse('2a0e:0dc0:0009:0017::0017')
		]
	}),
	Object.assign(URL.parse('dnsh://doh.it.ahadns.net:443/dns-query'), {
		hosts: [
			IP.parse('45.91.95.12'),
			IP.parse('2a0e:0dc0:0008:0012::0012')
		]
	}),
	Object.assign(URL.parse('dnsh://doh.la.ahadns.net:443/dns-query'), {
		hosts: [
			IP.parse('45.67.219.208'),
			IP.parse('2a04:bdc7:0100:0070::0070')
		]
	}),
	Object.assign(URL.parse('dnsh://doh.nl.ahadns.net:443/dns-query'), {
		hosts: [
			IP.parse('5.2.75.75'),
			IP.parse('2a04:52c0:0101:0075::0075')
		]
	}),
	Object.assign(URL.parse('dnsh://doh.no.ahadns.net:443/dns-query'), {
		hosts: [
			IP.parse('185.175.56.133'),
			IP.parse('2a0d:5600:0030:0028:0028')
		]
	}),
	Object.assign(URL.parse('dnsh://doh.ny.ahadns.net:443/dns-query'), {
		hosts: [
			IP.parse('185.213.26.187'),
			IP.parse('2a0d:5600:0033:0003::0003')
		]
	}),
	Object.assign(URL.parse('dnsh://doh.pl.ahadns.net:443/dns-query'), {
		hosts: [
			IP.parse('45.132.75.16'),
			IP.parse('2a0e:0dc0:0007:000d::000d')
		]
	}),
	Object.assign(URL.parse('dnss://dot.libredns.gr:854'), {
		hosts: [
			IP.parse('116.202.176.26')
		]
	}),
	Object.assign(URL.parse('dnss://adfree.usableprivacy.net:853'), {
		hosts: [
			IP.parse('149.154.153.153')
		]
	}),
	Object.assign(URL.parse('dnss://dns.sb:853'), {
		hosts: [
			IP.parse('185.222.222.222'),
			IP.parse('2a09::0001'),
			IP.parse('185.184.222.222'),
			IP.parse('2a09::0000')
		]
	}),
	Object.assign(URL.parse('dnsh://doh.dns.sb:443/dns-query'), {
		hosts: [
			IP.parse('104.18.56.150'),
			IP.parse('2606:4700:0030::6812:3896'),
			IP.parse('104.18.57.150'),
			IP.parse('2606:4700:0030::6812:3996')
		]
	}),
	Object.assign(URL.parse('dnsh://dns.quad9.net:5053/dns-query'), {
		hosts: [
			IP.parse('9.9.9.9'),
			IP.parse('2620:00fe::00fe')
		]
	}),
	Object.assign(URL.parse('dnsh://dns.rubyfish.cn:443/dns-query'), {
		hosts: [
			IP.parse('118.89.110.78'),
			IP.parse('47.96.179.163')
		]
	}),
	Object.assign(URL.parse('dnss://dot.ffmuc.net:853'), {
		hosts: [
			IP.parse('5.1.66.255'),
			IP.parse('2001:0678:0e68:f000::'),
			IP.parse('185.150.99.255'),
			IP.parse('2001:0678:0ed0:f000::'),
		]
	})
];

const isConnection = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Connection]';
};

export const isRouter = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Router]';
};

const isQuery = function(payload) {

	if (
		isObject(payload) === true
		&& isString(payload.domain) === true
		&& (isString(payload.subdomain) === true || payload.subdomain === null)
	) {

		if (
			isString(payload.domain) === true
			&& payload.domain === 'tholian.network'
		) {

			if (isString(payload.subdomain) === true) {

				if (RESERVED.includes(payload.subdomain) === true) {
					return true;
				}

			} else if (payload.subdomain === null) {
				return true;
			}

		} else if (
			isString(payload.domain) === true
			&& payload.domain !== 'tholian.local'
			&& payload.domain !== 'tholian.network'
		) {
			return true;
		}

	}


	return false;

};

const isValid = (record) => {

	if (record.type === 'A' || record.type === 'AAAA') {

		let url    = URL.parse('https://' + record.domain + '/');
		let domain = URL.toDomain(url);
		if (domain !== null) {
			return true;
		}

	}


	return false;

};

const isResolveRequest = function(packet) {

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

		let check1 = packet.payload.questions.filter((q) => isValid(q));
		if (check1.length === packet.payload.questions.length) {
			return true;
		}

	}


	return false;

};

const toDomain = function(payload) {

	let domain = null;

	if (isObject(payload) === true) {

		if (isString(payload.domain) === true) {

			if (isString(payload.subdomain) === true) {
				domain = payload.subdomain + '.' + payload.domain;
			} else {
				domain = payload.domain;
			}

		}

	}

	return domain;

};

// XXX: Most DNS resolvers don't support multiple DNS questions :(
const resolve = function(url, domain, type, callback) {

	let connection = null;
	let internet   = this.stealth.settings.internet;
	let request    = {
		headers: {
			'@type': 'request'
		},
		payload: {
			questions: [{
				domain: domain,
				type:   type,
				value:  null
			}],
			answers: []
		}
	};

	if (
		internet.connection === 'mobile'
		|| internet.connection === 'broadband'
	) {

		if (url.protocol === 'dnsh') {
			connection = DNSH.connect(url);
		} else if (url.protocol === 'dnss') {
			connection = DNSS.connect(url);
		} else if (url.protocol === 'dns') {
			connection = DNS.connect(url);
		}

	} else if (internet.connection === 'tor') {

		url.proxy  = { host: '127.0.0.1', port: 9050 };
		connection = SOCKS.connect(url);

	}

	if (connection !== null) {

		connection.once('@connect', () => {

			if (url.protocol === 'dnsh') {
				DNSH.send(connection, request);
			} else if (url.protocol === 'dnss') {
				DNSS.send(connection, request);
			} else if (url.protocol === 'dns') {
				DNS.send(connection, request);
			}

		});

		connection.once('response', (response) => {

			callback(response);

			connection.disconnect();

		});

		connection.once('error', () => {
			callback(null);
		});

	} else {

		callback(null);

	}

};

const toHost = function(response, domain) {

	let cnames = response.payload.answers.filter((a) => {
		return (a.type === 'CNAME' && a.domain === domain);
	});

	if (cnames.length > 0) {

		let is_blocked = false;

		cnames.forEach((cname) => {

			response.payload.answers.remove(cname);

			if (this.services !== null) {

				this.services.blocker.read({
					domain: cname.value
				}, (response) => {

					if (response !== null) {

						is_blocked = true;

					} else {

						response.payload.answers.filter((a) => a.type !== 'CNAME').forEach((answer) => {

							if (answer.type === 'PTR') {

								if (answer.value === cname.value) {
									answer.value = domain;
								}

							} else {

								if (answer.domain === cname.value) {
									answer.domain = domain;
								}

							}

						});

					}

				});

			}

		});

		if (is_blocked === true) {
			response.payload.answers = [];
		}

	}


	let hosts = [];

	response.payload.answers.filter((a) => a.type === 'A').forEach((answer) => {

		if (IP.isIP(answer.value) === true) {
			hosts.push(answer.value);
		}

	});

	response.payload.answers.filter((a) => a.type === 'AAAA').forEach((answer) => {

		if (IP.isIP(answer.value) === true) {
			hosts.push(answer.value);
		}

	});


	return {
		domain: domain,
		hosts:  hosts
	};

};



const Router = function(services, stealth) {

	services = isServices(services) ? services : null;
	stealth  = isStealth(stealth)   ? stealth  : null;


	this.connections = { ipv4: null, ipv6: null };
	this.services    = services;
	this.stealth     = stealth;

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

	can: function(packet) {

		packet = isObject(packet) ? packet : null;


		if (isResolveRequest(packet) === true) {
			return true;
		}


		return false;

	},

	connect: function() {

		let has_ipv4 = ENVIRONMENT.ips.filter((ip) => ip.type === 'v4').length > 0;
		if (has_ipv4 === true) {

			let connection = this.connections.ipv4 || null;
			if (connection === null) {

				connection = DNS.upgrade(null, URL.parse('dns://127.0.0.1:65432'));

				connection.once('@connect', () => {
					console.info('Router: UDP Service for dns://127.0.0.1:65432 started.');
				});

				connection.once('disconnect', () => {
					console.warn('Router: UDP Service for dns://127.0.0.1:65432 stopped.');
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

				connection = DNS.upgrade(null, URL.parse('dns://[::1]:65432'));

				connection.once('@connect', () => {
					console.info('Router: UDP Service for dns://[::1]:65432 started.');
				});

				connection.once('disconnect', () => {
					console.warn('Router: UDP Service for dns://[::1]:65432 stopped.');
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

	receive: function(connection, packet) {

		connection = isConnection(connection) ? connection : null;
		packet     = isObject(packet)         ? packet     : null;


		if (packet !== null) {

			if (isResolveRequest(packet) === true) {

				let remote     = connection.remote;
				let unresolved = [];


				packet.payload.questions.forEach((question) => {

					let domain = question.domain;
					let type   = question.type;

					if (this.services !== null) {

						this.services.blocker.read({
							domain: domain
						}, (response) => {

							let blocker = response.payload;
							if (blocker !== null) {

								if (type === 'A') {

									packet.payload.answers.push({
										domain: domain,
										type:   'A',
										value:  IP.parse('0.0.0.0')
									});

								} else if (type === 'AAAA') {

									packet.payload.answers.push({
										domain: domain,
										type:   'A',
										value:  IP.parse('::')
									});

								}

							} else {

								this.services.host.read({
									domain: domain
								}, (response) => {

									let host = response.payload;
									if (host !== null) {

										if (type === 'A') {

											host.hosts.filter((ip) => ip.type === 'v4').forEach((ip) => {
												packet.payload.answers.push({
													domain: domain,
													type:   'A',
													value:  ip
												});
											});

										} else if (type === 'AAAA') {

											host.hosts.filter((ip) => ip.type === 'v6').forEach((ip) => {
												packet.payload.answers.push({
													domain: domain,
													type:   'AAAA',
													value:  ip
												});
											});

										}

									} else {
										unresolved.push(question);
									}

								});

							}

						});

					} else {
						unresolved.push(question);
					}

				});


				setTimeout(() => {

					if (unresolved.length > 0) {

						let remaining = unresolved.length;

						unresolved.forEach((question) => {

							let domain = question.domain;
							let type   = question.type;
							let url    = URL.parse('https://' + domain + '/');

							this.resolve({
								domain:    url.domain,
								subdomain: url.subdomain
							}, (host) => {

								if (host !== null) {

									if (type === 'A') {

										host.hosts.filter((ip) => ip.type === 'v4').forEach((ip) => {
											packet.payload.answers.push({
												domain: domain,
												type:   'A',
												value:  ip
											});
										});

									} else if (type === 'AAAA') {

										host.hosts.filter((ip) => ip.type === 'v6').forEach((ip) => {
											packet.payload.answers.push({
												domain: domain,
												type:   'AAAA',
												value:  ip
											});
										});

									}

									if (this.services !== null) {
										this.services.host.save(host);
									}

								}

								remaining--;

							});

						});

						let interval = setInterval(() => {

							if (remaining === 0) {

								clearInterval(interval);
								interval = null;

								connection.remote = remote;

								DNS.send(connection, {
									headers: {
										'@id':   packet.headers['@id'],
										'@type': 'response'
									},
									payload: packet.payload
								});

							}

						}, 100);

					} else {

						connection.remote = remote;


						DNS.send(connection, {
							headers: {
								'@id':   packet.headers['@id'],
								'@type': 'response'
							},
							payload: packet.payload
						});

					}

				}, 1000);

			}

		} else {

			// Do Nothing

		}


		return null;

	},

	resolve: function(query, callback) {

		query    = isQuery(query)       ? query    : null;
		callback = isFunction(callback) ? callback : null;


		let internet = this.stealth.settings.internet;

		if (
			query !== null
			&& ENVIRONMENT.ips.length > 0
			&& (
				internet.connection === 'mobile'
				|| internet.connection === 'broadband'
				|| internet.connection === 'tor'
			)
		) {

			let domain      = toDomain(query);
			let supports_v4 = ENVIRONMENT.ips.filter((ip) => ip.type === 'v4').length > 0;
			let supports_v6 = ENVIRONMENT.ips.filter((ip) => ip.type === 'v6').length > 0;

			if (RONIN.length === 0) {

				SERVERS.forEach((server) => RONIN.push(server));

				if (supports_v4 === false) {

					RONIN.forEach((server) => {
						server['hosts'] = server['hosts'].filter((ip) => ip.type !== 'v4');
					});

				}

				if (supports_v6 === false) {

					RONIN.forEach((server) => {
						server['hosts'] = server['hosts'].filter((ip) => ip.type !== 'v6');
					});

				}

			}


			let url = RONIN.shift();

			resolve.call(this, Object.clone({}, url), domain, 'A', (response_v4) => {

				resolve.call(this, Object.clone({}, url), domain, 'AAAA', (response_v6) => {

					let response = {
						headers: {
							'@type': 'response',
						},
						payload: {
							questions: [],
							answers:   []
						}
					};

					if (response_v4 !== null) {
						response_v4.payload.questions.forEach((q) => response.payload.questions.push(q));
						response_v4.payload.answers.forEach((a) => response.payload.answers.push(a));
					}

					if (response_v6 !== null) {
						response_v6.payload.questions.forEach((q) => response.payload.questions.push(q));
						response_v6.payload.answers.forEach((a) => response.payload.answers.push(a));
					}


					if (callback !== null) {
						callback(toHost.call(this, response, domain));
					}

				});

			});

		} else {

			if (callback !== null) {
				callback(null);
			}

		}

	}

};


export { Router };

