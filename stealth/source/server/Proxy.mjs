
import net from 'net';


import { console, isArray, isBuffer } from '../../extern/base.mjs';
import { isStealth                  } from '../../source/Stealth.mjs';
import { SOCKS                      } from '../../source/connection/SOCKS.mjs';
import { SOCKS as PACKET            } from '../../source/packet/SOCKS.mjs';
import { IP                         } from '../../source/parser/IP.mjs';
import { URL                        } from '../../source/parser/URL.mjs';
import { isServices                 } from '../../source/server/Services.mjs';



const isSocket = function(obj) {

	if (obj !== null && obj !== undefined) {
		return obj instanceof net.Socket;
	}

	return false;

};

export const isProxy = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Proxy]';
};



const Proxy = function(services, stealth) {

	services = isServices(services) ? services : null;
	stealth  = isStealth(stealth)   ? stealth  : null;


	this.services = services;
	this.stealth  = stealth;

};


Proxy.prototype = {

	[Symbol.toStringTag]: 'Proxy',

	toJSON: function() {

		let data = {};


		return {
			'type': 'Proxy',
			'data': data
		};

	},

	can: function(buffer) {

		buffer = isBuffer(buffer) ? buffer : null;


		if (buffer !== null) {

			if (PACKET.isPacket(buffer) === true) {

				let packet = PACKET.decode(null, buffer);
				if (packet !== null) {

					if (
						isArray(packet.headers['@auth']) === true
						&& packet.headers['@auth'].includes('none') === true
					) {
						return true;
					}

				}

			}

		}


		return false;

	},

	upgrade: function(buffer, socket) {

		buffer = isBuffer(buffer) ? buffer : null;
		socket = isSocket(socket) ? socket : null;


		let packet = PACKET.decode(null, buffer);
		if (packet !== null) {

			if (this.stealth !== null) {
				packet.headers['@debug'] = this.stealth._settings.debug;
			}

			let connection = SOCKS.upgrade(socket, packet);
			if (connection !== null) {

				let remote = connection.toJSON().data['remote'];

				connection.once('@connect', () => {

					if (this.stealth !== null) {

						connection.session = this.stealth.track(null, remote);

						if (this.stealth._settings.debug === true) {

							if (remote !== null) {
								console.log('Proxy: Client "' + IP.render(remote['host']) + '" connected.');
							}

						}

					}

				});

				connection.once('error', (err) => {

					if (connection.session !== null) {
						connection.session.warn('Proxy:error', err);
					}

					connection.off('@connect-tunnel');
					connection.disconnect();

				});

				connection.once('@disconnect', () => {

					if (this.stealth !== null) {

						if (this.stealth._settings.debug === true) {

							let remote = connection.toJSON().data['remote'];
							if (remote !== null) {
								console.log('Proxy: Client "' + IP.render(remote['host']) + '" disconnected.');
							}

						}

					}

				});


				if (this.services !== null) {

					connection.once('@connect-tunnel', (request, callback) => {

						let url    = request.payload;
						let domain = URL.toDomain(url);
						let host   = URL.toHost(url);

						if (domain !== null) {

							this.services.blocker.read({
								domain: domain
							}, (response) => {

								if (response.payload === null) {

									this.services.host.read({
										domain: domain
									}, (response) => {

										if (response.payload !== null) {

											url.hosts = response.payload.hosts;


											let tunnel = null;

											try {

												tunnel = net.connect({
													host: url.hosts[0].ip,
													port: url.port
												}, () => {

													let host = URL.toHost(url);
													let port = url.port || null;

													if (host !== null && port !== null) {
														callback('success', URL.parse(host + ':' + port), tunnel);
													} else {
														callback('error:host', null);
													}

												});

											} catch (err) {
												tunnel = null;
											}

											if (tunnel === null) {
												callback('error:connection', null);
											}

										} else {
											callback('error:host', null);
										}

									});

								} else {
									callback('error:block', null);
								}

							});

						} else if (host !== null) {

							this.services.blocker.read({
								host: host
							}, (response) => {

								if (response.payload === null) {

									let tunnel = null;

									try {
										tunnel = net.connect({
											host: url.hosts[0].ip,
											port: url.port
										}, () => {

											let host = URL.toHost(url);
											let port = url.port || null;

											if (host !== null && port !== null) {
												callback('success', URL.parse(host + ':' + port), tunnel);
											} else {
												callback('error:host', null);
											}

										});
									} catch (err) {
										tunnel = null;
									}

									if (tunnel === null) {
										callback('error:connection', null);
									}

								} else {
									callback('error:block', null);
								}

							});

						} else {

							callback('error', null);

						}

					});

				} else {

					connection.once('@connect-tunnel', (request, callback) => {
						callback('error:block', null);
					});

				}

				return connection;

			} else {

				socket.end();

			}

		} else {

			socket.end();

		}


		return null;

	}

};


export { Proxy };

