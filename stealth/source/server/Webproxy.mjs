
import net from 'net';

import { console, Buffer, isBuffer, isNumber, isString } from '../../extern/base.mjs';
import { isStealth                                     } from '../../source/Stealth.mjs';
import { HTTP                                          } from '../../source/connection/HTTP.mjs';
import { HTTP as PACKET                                } from '../../source/packet/HTTP.mjs';
import { isServices                                    } from '../../source/server/Services.mjs';
import { URL                                           } from '../../source/parser/URL.mjs';
import { Request                                       } from '../../source/Request.mjs';



const isSocket = function(obj) {

	if (obj !== null && obj !== undefined) {
		return obj instanceof net.Socket;
	}

	return false;

};

export const isWebproxy = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Webproxy]';
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

const proxy_http_request = function(socket, request) {

	let connection = HTTP.upgrade(socket, request);
	if (connection !== null) {

		let link  = (request.headers['@url'] || '');
		let flags = [];
		let tab   = null;

		if (link.startsWith('https://') === true || link.startsWith('http://') === true) {

			flags.push('proxy');

		} else if (link.startsWith('/stealth/') === true) {

			if (link.startsWith('/stealth/:') === true) {

				let tmp = link.substr(9).split('/').shift();
				if (tmp.startsWith(':') === true && tmp.endsWith(':') === true) {

					tmp = tmp.substr(1, tmp.length - 2);

					// /stealth/:tab-id,flag1,flag2:/https://domain.tld/path
					if (tmp.includes(',') === true) {

						tab   = tmp.split(',').shift();
						flags = tmp.split(',').slice(1);
						link  = link.substr(9).split('/').slice(1).join('/');

					// /stealth/:tab-id:/https://domain.tld/path
					} else {

						let num = parseInt(tmp, 10);
						if (Number.isNaN(num) === false) {
							tab  = tmp;
							link = link.substr(9).split('/').slice(1).join('/');
						} else {
							flags.push(tmp);
							link = link.substr(9).split('/').slice(1).join('/');
						}

					}

				}

			// /stealth/https://domain.tld/path
			} else if (link.startsWith('/stealth/') === true) {
				link = link.substr(9);
			}

		}


		let session = null;
		let request = null;

		if (this.stealth !== null) {

			session = this.stealth.track(null, request.headers);
			request = this.stealth.open(link);

		} else {

			request = new Request({
				mode: {
					mode: {
						text:  true,
						image: true,
						audio: true,
						video: true,
						other: true
					}
				},
				url: URL.parse(link)
			}, this.services);

		}


		if (request !== null) {

			if (flags.includes('proxy') === true) {
				request.set('proxy', true);
			}

			if (flags.includes('refresh') === true) {
				request.set('refresh', true);
			}

			if (flags.includes('webview') === true) {
				request.set('webview', true);
			}


			request.once('error', (err) => {

				request.off('redirect');
				request.off('response');
				request.stop();


				if (request.get('proxy') === true) {

					HTTP.send(connection, {
						headers: {
							'@status': 403
						},
						payload: Buffer.from('403: Forbidden', 'utf8')
					});

				} else if (request.get('webview') === true) {

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

						if (isNumber(err.code) === true) {
							params.push('code=' + encodeURIComponent(err.code));
						}

						if (isString(link) === true) {
							params.push('url=' + encodeURIComponent(link));
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
								'@status': 403
							},
							payload: Buffer.from('403: Forbidden', 'utf8')
						});

					}

				} else {

					HTTP.send(connection, {
						headers: {
							'@status': 403
						},
						payload: Buffer.from('403: Forbidden', 'utf8')
					});

				}

			});

			request.once('redirect', (response) => {

				request.off('error');
				request.off('response');
				request.stop();


				let hostname = null;
				let redirect = null;

				let url    = URL.parse(link);
				let domain = URL.toDomain(url);
				let host   = URL.toHost(url);

				if (domain !== null) {
					hostname = domain;
				} else if (host !== null) {
					hostname = host;
				}


				if (request.get('proxy') === true) {

					redirect = URL.parse(response.headers['location']);

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

				} else if (request.get('webview') === true) {

					if (tab !== null) {
						redirect = URL.parse('http://' + hostname + ':65432/stealth/:' + tab + ',webview:/' + response.headers['location']);
					} else {
						redirect = URL.parse('http://' + hostname + ':65432/stealth/' + response.headers['location']);
					}

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

				} else {

					if (tab !== null) {
						redirect = URL.parse('http://' + hostname + ':65432/stealth/:' + tab + ':/' + response.headers['location']);
					} else {
						redirect = URL.parse('http://' + hostname + ':65432/stealth/' + response.headers['location']);
					}

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

				}

			});

			request.once('response', (response) => {

				request.off('error');
				request.off('redirect');
				request.stop();


				let url = URL.parse(link);
				if (url.mime.ext === 'css') {

					if (request.get('webview') === true) {
						// TODO: Replace URLs inside response payload with "/stealth/" prefix
					}

				} else if (url.mime.ext === 'html') {

					if (request.get('webview') === true) {

						if (tab !== null) {
							// TODO: Replace CSS and asset URLs in response payload with "/stealth/:" + tab + ":/" prefix
							// TODO: Replace href with "/stealth/:" + tab + ",webview:/" prefix
						} else {
							// TODO: Replace CSS and asset URLs in response payload with "/stealth/" prefix
							// TODO: Replace href with "/stealth/" prefix
						}

					}

				}


				if (response !== null && response.payload !== null) {

					// Strip out all unnecessary HTTP headers
					response.headers = {
						'content-length': response.payload.length,
						'content-type':   url.mime.format,
						'last-modified':  response.headers['last-modified'] || null
					};

					HTTP.send(connection, response);

				} else {

					HTTP.send(connection, {
						headers: {
							'@status': 404
						},
						payload: Buffer.from('404: Not Found', 'utf8')
					});

				}

			});

			if (session !== null) {
				session.track(request, tab);
			}

			connection.once('@connect', () => {

				if (this.stealth !== null && this.stealth._settings.debug === true) {
					console.log('Webproxy: Client "' + connection.toJSON().remote + '" connected.');
				}

			});

			connection.once('@disconnect', () => {

				if (this.stealth !== null && this.stealth._settings.debug === true) {
					console.log('Webproxy: Client "' + connection.toJSON().remote + '" disconnected.');
				}

			});

			request.start();


			return connection;

		} else {

			HTTP.send(connection, {
				headers: {
					'@status': 404
				},
				payload: Buffer.from('404: Not Found', 'utf8')
			});

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

				let request = PACKET.decode(null, buffer);
				if (request !== null) {

					if (
						(
							request.headers['@method'] === 'CONNECT'
							&& isString(request.headers['host']) === true
							&& (
								request.headers['host'].endsWith(':80') === true
								|| request.headers['host'].endsWith(':443') === true
							)
						) || (
							request.headers['@method'] === 'GET'
							&& isString(request.headers['@url']) === true
							&& (
								request.headers['@url'].startsWith('http://') === true
								|| request.headers['@url'].startsWith('https://') === true
								|| request.headers['@url'].startsWith('/stealth/') === true
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


		let request = PACKET.decode(null, buffer);
		if (request !== null) {

			if (
				request.headers['@method'] === 'CONNECT'
				&& isString(request.headers['host']) === true
				&& (
					request.headers['host'].endsWith(':80') === true
					|| request.headers['host'].endsWith(':443') === true
				)
			) {

				if (this.services !== null) {

					proxy_http_connect.call(this, socket, request);

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
				request.headers['@method'] === 'GET'
				&& isString(request.headers['@url']) === true
				&& (
					request.headers['@url'].startsWith('http://') === true
					|| request.headers['@url'].startsWith('https://') === true
					|| request.headers['@url'].startsWith('/stealth/') === true
				)
			) {

				if (this.services !== null) {

					return proxy_http_request.call(this, socket, request);

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

			}

		} else {

			socket.end();

		}


		return null;

	}

};


export { Webproxy };

