
import net from 'net';

import { console, Buffer, isArray, isBuffer, isNumber, isObject, isString } from '../../extern/base.mjs';
import { isStealth                                                        } from '../../source/Stealth.mjs';
import { HTTP                                                             } from '../../source/connection/HTTP.mjs';
import { HTTP as PACKET                                                   } from '../../source/packet/HTTP.mjs';
import { DATETIME                                                         } from '../../source/parser/DATETIME.mjs';
import { IP                                                               } from '../../source/parser/IP.mjs';
import { URL                                                              } from '../../source/parser/URL.mjs';
import { isServices                                                       } from '../../source/server/Services.mjs';
import { isRequest                                                        } from '../../source/Request.mjs';



const ENCODINGS = [ 'br', 'chunked', 'deflate', 'gzip', 'identity' ];

const isSocket = function(obj) {

	if (obj !== null && obj !== undefined) {
		return obj instanceof net.Socket;
	}

	return false;

};

export const isWebproxy = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Webproxy]';
};



const encodeResponse = function(request, response) {

	if (
		DATETIME.isDATETIME(request.headers['if-modified-since']) === true
		&& DATETIME.isDATETIME(response.headers['last-modified']) === true
	) {

		let not_modified = DATETIME.compare(request.headers['if-modified-since'], response.headers['last-modified']) === 0;
		if (not_modified === true) {
			response.headers['@status'] = 204;
		}

	}


	if (
		response.headers['@status'] === 100
		|| response.headers['@status'] === 101
		|| response.headers['@status'] === 204
		|| response.headers['@status'] === 304
	) {

		response.payload = null;

	} else {

		if (request.headers['@method'] === 'HEAD' || request.headers['@method'] === 'OPTIONS') {
			response.payload = null;
		} else if (response.payload === null) {
			response.payload = Buffer.from('', 'utf8');
		}


		if (isObject(response.headers['@transfer']) === false) {
			response.headers['@transfer'] = {};
		}

		if (isString(request.headers['accept-encoding']) === true) {

			if (request.headers['accept-encoding'].includes(',') === true) {

				let candidates = request.headers['accept-encoding'].split(',').map((v) => v.trim());

				for (let c = 0, cl = candidates.length; c < cl; c++) {

					if (ENCODINGS.includes(candidates[c]) === true) {
						response.headers['@transfer']['encoding'] = candidates[c];
						break;
					}

				}

			} else {

				if (ENCODINGS.includes(request.headers['accept-encoding']) === true) {
					response.headers['@transfer']['encoding'] = request.headers['accept-encoding'];
				}

			}

		}

		if (isArray(request.headers['@transfer']['range']) === true) {

			if (
				isString(request.headers['range']) === true
				&& request.headers['@transfer']['range'] !== Infinity
			) {

				response.headers['@transfer']['range'] = request.headers['@transfer']['range'];

				if (response.headers['@status'] === 200) {
					response.headers['@status'] = 206;
				}

			} else {

				response.headers['accept-ranges'] = 'bytes';

			}

		}

	}

	if (isString(response.headers['content-type']) === true) {

		if (
			response.headers['content-type'].startsWith('audio/')
			|| response.headers['content-type'].startsWith('video/')
		) {
			response.headers['access-control-allow-origin'] = '*';
		}

	}

	return response;

};

const proxy_http_connect = function(socket, request) {

	let url    = URL.parse('https://' + request.headers['host']);
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
						let remote = {
							host: IP.parse(socket.remoteAddress),
							port: socket.remotePort
						};

						try {

							tunnel = net.connect({
								host: url.hosts[0].ip,
								port: url.port
							}, () => {

								socket.pipe(tunnel);
								tunnel.pipe(socket);

								if (this.stealth !== null && this.stealth._settings.debug === true) {

									let host = IP.render(remote['host']);
									if (host !== null) {

										if (this.__state.connections[host] === undefined) {
											console.log('Webproxy: Client "' + host + '" connected.');
											this.__state.connections[host] = 1;
										} else if (isNumber(this.__state.connections[host]) === true) {
											this.__state.connections[host]++;
										}

									}

								}

								socket.write(PACKET.encode(null, {
									headers: {
										'@status': 200
									},
									payload: Buffer.from('', 'utf8')
								}));

							});

							tunnel.on('close', () => {

								let host = IP.render(remote['host']);
								if (host !== null) {

									if (isNumber(this.__state.connections[host]) === true) {
										this.__state.connections[host]--;
									}

									setTimeout(() => {

										if (this.__state.connections[host] === 0) {
											console.log('Webserver: Client "' + host + '" disconnected.');
											delete this.__state.connections[host];
										}

									}, 60000);

								}

							});

						} catch (err) {
							tunnel = null;
						}

						if (tunnel === null) {

							socket.write(PACKET.encode(null, {
								headers: {
									'@status':    504,
									'connection': 'close'
								},
								payload: null
							}));

							socket.end();

						}

					} else {

						socket.write(PACKET.encode(null, {
							headers: {
								'@status':    504,
								'connection': 'close'
							},
							payload: null
						}));

						socket.end();

					}

				});

			} else {

				socket.write(PACKET.encode(null, {
					headers: {
						'@status':    403,
						'connection': 'close'
					},
					payload: null
				}));

				socket.end();

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

						socket.pipe(tunnel);
						tunnel.pipe(socket);

						socket.write(PACKET.encode(null, {
							headers: {
								'@status': 200
							},
							payload: null
						}));

					});

				} catch (err) {
					tunnel = null;
				}

				if (tunnel === null) {

					socket.write(PACKET.encode(null, {
						headers: {
							'@status':    504,
							'connection': 'close'
						},
						payload: null
					}));

					socket.end();

				}

			} else {

				socket.write(PACKET.encode(null, {
					headers: {
						'@status':    403,
						'connection': 'close'
					},
					payload: null
				}));

				socket.end();

			}

		});

	} else {

		socket.end();

	}

};

const proxy_http_request = function(socket, packet) {

	let connection = HTTP.upgrade(socket, packet);
	if (connection !== null) {

		let remote = connection.toJSON().data['remote'];
		let url    = null;

		if (
			packet.headers['@url'].startsWith('http://') === true
			|| packet.headers['@url'].startsWith('https://') === true
		) {
			url = URL.parse(packet.headers['@url']);
		}


		connection.once('@connect', () => {

			if (this.stealth !== null) {

				connection.session = this.stealth.track(null, remote);

				if (this.stealth._settings.debug === true) {

					let host = IP.render(remote['host']);
					if (host !== null) {

						if (this.__state.connections[host] === undefined) {
							console.log('Webproxy: Client "' + host + '" connected.');
							this.__state.connections[host] = 1;
						} else if (isNumber(this.__state.connections[host]) === true) {
							this.__state.connections[host]++;
						}

					}

				}

			}

		});

		connection.once('error', (err) => {

			if (connection.session !== null) {
				connection.session.warn('Webproxy:error', err);
			}

			connection.off('request');
			connection.disconnect();

		});

		connection.once('@disconnect', () => {

			if (this.stealth !== null) {

				if (this.stealth._settings.debug === true) {

					let host = IP.render(remote['host']);
					if (host !== null) {

						if (isNumber(this.__state.connections[host]) === true) {
							this.__state.connections[host]--;
						}

						setTimeout(() => {

							if (this.__state.connections[host] === 0) {
								console.log('Webproxy: Client "' + host + '" disconnected.');
								delete this.__state.connections[host];
							}

						}, 60000);

					}

				}

			}

		});


		if (
			this.stealth !== null
			&& URL.isURL(url) === true
		) {

			let request = this.stealth.request(url);

			if (isRequest(request) === true) {

				request.once('error', () => {

					request.off('error');
					request.off('redirect');
					request.off('response');
					request.stop();

					if (connection.session !== null) {
						connection.session.warn('Webproxy:request', {
							'@method': 'GET',
							'@url':    packet.headers['@url']
						});
					}

					HTTP.send(connection, {
						headers: {
							'@status': 403
						},
						payload: Buffer.from('403: Forbidden', 'utf8')
					});

				});

				request.once('redirect', (response) => {

					request.off('error');
					request.off('redirect');
					request.off('response');
					request.stop();


					let redirect = URL.parse(response.headers['location']);

					if (this.stealth._settings.debug === true) {
						console.warn('Webproxy: "' + url.link + '" redirected to "' + redirect.link + '".');
					}

					HTTP.send(connection, {
						headers: {
							'@status':  307,
							'location': redirect.link
						},
						payload: null
					});

				});

				request.once('response', (response) => {

					request.off('error');
					request.off('redirect');
					request.off('response');
					request.stop();


					if (response !== null && response.payload !== null) {

						HTTP.send(connection, encodeResponse(packet, {
							headers: response.headers,
							payload: response.payload
						}));

					} else {

						HTTP.send(connection, {
							headers: {
								'@status': 404
							},
							payload: Buffer.from('404: Not Found', 'utf8')
						});

					}

				});

				return connection;

			} else {

				if (connection.session !== null) {
					connection.session.warn('Webproxy:request', {
						'@method': 'GET',
						'@url':    packet.headers['@url']
					});
				}

				HTTP.send(connection, {
					headers: {
						'@status': 400
					},
					payload: Buffer.from('400: Bad Request', 'utf8')
				});

				connection.disconnect();

			}

		} else {

			if (connection.session !== null) {
				connection.session.warn('Webproxy:request', {
					'@method': 'GET',
					'@url':    packet.headers['@url']
				});
			}

			HTTP.send(connection, {
				headers: {
					'@status': 500
				},
				payload: Buffer.from('500: Internal Server Error', 'utf8')
			});

			connection.disconnect();

		}

	} else {

		socket.end();

	}


	return null;

};

const proxy_webview_request = function(socket, packet) {

	let connection = HTTP.upgrade(socket, packet);
	if (connection !== null) {

		let remote = connection.toJSON().data['remote'];
		let url    = null;

		if (packet.headers['@url'].startsWith('/stealth/') === true) {
			url = URL.parse(packet.headers['@url'].substr(9));
		}


		connection.once('@connect', () => {

			if (this.stealth !== null) {

				connection.session = this.stealth.track(null, remote);

				if (this.stealth._settings.debug === true) {

					let host = IP.render(remote['host']);
					if (host !== null) {

						if (this.__state.connections[host] === undefined) {
							console.log('Webproxy: Client "' + host + '" connected.');
							this.__state.connections[host] = 1;
						} else if (isNumber(this.__state.connections[host]) === true) {
							this.__state.connections[host]++;
						}

					}

				}

			}

		});

		connection.once('error', (err) => {

			if (connection.session !== null) {
				connection.session.warn('Webproxy:error', err);
			}

			connection.off('request');
			connection.disconnect();

		});

		connection.once('@disconnect', () => {

			if (this.stealth !== null) {

				if (this.stealth._settings.debug === true) {

					let host = IP.render(remote['host']);
					if (host !== null) {

						if (isNumber(this.__state.connections[host]) === true) {
							this.__state.connections[host]--;
						}

						setTimeout(() => {

							if (this.__state.connections[host] === 0) {
								console.log('Webproxy: Client "' + host + '" disconnected.');
								delete this.__state.connections[host];
							}

						}, 60000);

					}

				}

			}

		});


		if (
			this.stealth !== null
			&& URL.isURL(url) === true
		) {

			let request = this.stealth.request(url);

			if (isRequest(request) === true) {

				request.once('error', (err) => {

					request.off('error');
					request.off('redirect');
					request.off('response');
					request.stop();


					if (
						err.type === 'connection'
						|| err.type === 'host'
						|| err.type === 'mode'
					) {

						let redirect = '/browser/internal/fix-' + err.type + '.html';
						let params   = [];

						if (isString(err.cause) === true) {
							params.push('cause=' + encodeURIComponent(err.cause));
						}

						if (isString(url) === true) {
							params.push('url=' + encodeURIComponent(url));
						}

						if (params.length > 0) {
							redirect += '?' + params.join('&');
						}

						HTTP.send(connection, {
							headers: {
								'@status':  307,
								'location': redirect
							},
							payload: null
						});

					} else {

						HTTP.send(connection, {
							headers: {
								'@status': 500
							},
							payload: Buffer.from('500: Internal Server Error', 'utf8')
						});

					}

				});

				request.once('redirect', (response) => {

					request.off('error');
					request.off('redirect');
					request.off('response');
					request.stop();


					let hostname = 'localhost';
					let domain   = URL.toDomain(url);
					let host     = URL.toHost(url);

					if (domain !== null) {
						hostname = domain;
					} else if (host !== null) {
						hostname = host;
					}

					let redirect = URL.parse('http://' + hostname + ':65432/stealth/' + response.headers['location']);

					if (this.stealth._settings.debug === true) {
						console.warn('Webproxy: "' + url.link + '" redirected to "' + redirect.link + '".');
					}

					HTTP.send(connection, {
						headers: {
							'@status':  307,
							'location': redirect.link
						},
						payload: null
					});

				});

				request.once('response', (response) => {

					request.off('error');
					request.off('redirect');
					request.off('response');
					request.stop();


					if (response !== null && response.payload !== null) {

						if (url.mime.ext === 'css') {

							// TODO: Replace URLs inside response payload with "/stealth/" prefix

						} else if (url.mime.ext === 'html') {

							// TODO: Replace <a href> inside response payload with "/stealth/" prefix

						}


						HTTP.send(connection, encodeResponse(packet, {
							headers: response.headers,
							payload: response.payload
						}));

					} else {

						HTTP.send(connection, {
							headers: {
								'@status': 404
							},
							payload: Buffer.from('404: Not Found', 'utf8')
						});

					}

				});

				return connection;

			} else {

				if (connection.session !== null) {
					connection.session.warn('Webproxy:request', {
						'@method': 'GET',
						'@url':    packet.headers['@url']
					});
				}

				HTTP.send(connection, {
					headers: {
						'@status': 400
					},
					payload: Buffer.from('400: Bad Request', 'utf8')
				});

				connection.disconnect();

			}

		} else {

			if (connection.session !== null) {
				connection.session.warn('Webproxy:request', {
					'@method': 'GET',
					'@url':    packet.headers['@url']
				});
			}

			HTTP.send(connection, {
				headers: {
					'@status': 500
				},
				payload: Buffer.from('500: Internal Server Error', 'utf8')
			});

			connection.disconnect();

		}

	} else {

		socket.end();

	}


	return null;

};



const Webproxy = function(services, stealth) {

	services = isServices(services) ? services : null;
	stealth  = isStealth(stealth)   ? stealth  : null;


	this.services = services;
	this.stealth  = stealth;

	this.__state = {
		connections: {}
	};

};


Webproxy.prototype = {

	[Symbol.toStringTag]: 'Webproxy',

	toJSON: function() {

		let data = {};


		return {
			'type': 'Webproxy',
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
						(
							packet.headers['@method'] === 'CONNECT'
							&& isString(packet.headers['host']) === true
							&& (
								packet.headers['host'].endsWith(':80') === true
								|| packet.headers['host'].endsWith(':443') === true
							)
						) || (
							packet.headers['@method'] === 'GET'
							&& isString(packet.headers['@url']) === true
							&& packet.headers['@url'].startsWith('/stealth/') === true
						) || (
							packet.headers['@method'] === 'GET'
							&& isString(packet.headers['@url']) === true
							&& (
								packet.headers['@url'].startsWith('http://') === true
								|| packet.headers['@url'].startsWith('https://') === true
							)
						)
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

			if (
				packet.headers['@method'] === 'CONNECT'
				&& isString(packet.headers['host']) === true
				&& (
					packet.headers['host'].endsWith(':80') === true
					|| packet.headers['host'].endsWith(':443') === true
				)
			) {

				if (this.services !== null) {

					return proxy_http_connect.call(this, socket, packet);

				} else {

					socket.write(PACKET.encode(null, {
						headers: {
							'@status':    403,
							'connection': 'close'
						},
						payload: null
					}));

					socket.end();

				}

			} else if (
				packet.headers['@method'] === 'GET'
				&& isString(packet.headers['@url']) === true
				&& packet.headers['@url'].startsWith('/stealth/') === true
			) {

				if (this.services !== null) {

					return proxy_webview_request.call(this, socket, packet);

				} else {

					socket.write(PACKET.encode(null, {
						headers: {
							'@status':    403,
							'connection': 'close'
						},
						payload: null
					}));

					socket.end();

				}

			} else if (
				packet.headers['@method'] === 'GET'
				&& isString(packet.headers['@url']) === true
				&& (
					packet.headers['@url'].startsWith('http://') === true
					|| packet.headers['@url'].startsWith('https://') === true
				)
			) {

				if (this.services !== null) {

					return proxy_http_request.call(this, socket, packet);

				} else {

					socket.write(PACKET.encode(null, {
						headers: {
							'@status':    403,
							'connection': 'close'
						},
						payload: null
					}));

					socket.end();

				}

			} else {

				socket.end();

			}

		} else {

			socket.end();

		}


		return null;

	}

};


export { Webproxy };

