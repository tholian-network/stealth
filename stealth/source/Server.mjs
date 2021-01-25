
import net from 'net';

import { console, Buffer, Emitter, isFunction, isObject, isString } from '../extern/base.mjs';
import { ENVIRONMENT                                              } from '../source/ENVIRONMENT.mjs';
import { isStealth                                                } from '../source/Stealth.mjs';
import { Request                                                  } from '../source/Request.mjs';
import { IP                                                       } from '../source/parser/IP.mjs';
import { URL                                                      } from '../source/parser/URL.mjs';
import { HTTP                                                     } from '../source/connection/HTTP.mjs';
import { SOCKS                                                    } from '../source/connection/SOCKS.mjs';
import { WS                                                       } from '../source/connection/WS.mjs';
import { ROUTER                                                   } from '../source/server/ROUTER.mjs';
import { Beacon                                                   } from '../source/server/Beacon.mjs';
import { Blocker                                                  } from '../source/server/Blocker.mjs';
import { Cache                                                    } from '../source/server/Cache.mjs';
import { Host                                                     } from '../source/server/Host.mjs';
import { Mode                                                     } from '../source/server/Mode.mjs';
import { Peer                                                     } from '../source/server/Peer.mjs';
import { Policy                                                   } from '../source/server/Policy.mjs';
import { Redirect                                                 } from '../source/server/Redirect.mjs';
import { Session                                                  } from '../source/server/Session.mjs';
import { Settings                                                 } from '../source/server/Settings.mjs';
import { Stash                                                    } from '../source/server/Stash.mjs';



export const isServer = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Server]';
};

const encode_http_status = function(status) {

	status = isString(status) ? status : '500 Internal Server Error';


	return Buffer.from([
		'HTTP/1.1 ' + status,
		'Connection: close',
		'',
		''
	].join('\r\n'), 'utf8');

};

const upgrade_http = function(socket, url) {

	let connection = HTTP.upgrade(socket, url);
	if (connection !== null) {

		connection.once('@connect', () => {

			if (this.__state.connections.includes(connection) === false) {
				this.__state.connections.push(connection);
			}

		});

		connection.once('@disconnect', () => {

			if (this.__state.connections.includes(connection) === true) {
				this.__state.connections.remove(connection);
			}

		});


		let link  = (url.headers['@url'] || '');
		let flags = [];
		let tab   = null;

		if (link.startsWith('https://') === true || link.startsWith('http://') === true) {

			flags.push('proxy');

		} else if (link.startsWith('/stealth/') === true) {

			if (link.startsWith('/stealth/:') === true) {

				let tmp = link.substr(9).split('/').shift();
				if (tmp.startsWith(':') === true && tmp.endsWith(':') === true) {

					tmp = tmp.substr(1, tmp.length - 2);

					if (tmp.includes(',') === true) {
						tab   = tmp.split(',').shift();
						flags = tmp.split(',').slice(1);
						link  = link.substr(9).split('/').slice(1).join('/');
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

			} else if (link.startsWith('/stealth/') === true) {
				link = link.substr(9);
			}

		}


		let session = null;
		let request = null;

		if (this.stealth !== null) {

			session = this.stealth.track(null, url.headers);
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
			}, this);

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

					ROUTER.error({ code: 403 }, (response) => {
						HTTP.send(connection, response);
					});

				} else if (request.get('webview') === true) {

					if (
						err.type === 'host'
						|| err.type === 'mode'
						|| err.type === 'request'
					) {

						ROUTER.error(Object.assign(err, {
							url: link
						}), (response) => {
							HTTP.send(connection, response);
						});

					} else {

						ROUTER.error({ code: 403 }, (response) => {
							HTTP.send(connection, response);
						});

					}

				} else {

					ROUTER.error({ code: 403 }, (response) => {
						HTTP.send(connection, response);
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
						console.warn('Server: "' + url.link + '": Redirect to "' + redirect.link + '".');
					}

					HTTP.send(connection, {
						headers: {
							'@code':    307,
							'@status':  '307 Temporary Redirect',
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
						console.warn('Server: "' + url.link + '": Redirect to "' + redirect.link + '".');
					}

					ROUTER.send(redirect, (response) => {
						HTTP.send(connection, response);
					});

				} else {

					if (tab !== null) {
						redirect = URL.parse('http://' + hostname + ':65432/stealth/:' + tab + ':/' + response.headers['location']);
					} else {
						redirect = URL.parse('http://' + hostname + ':65432/stealth/' + response.headers['location']);
					}

					if (this.stealth._settings.debug === true) {
						console.warn('Server: "' + url.link + '": Redirect to "' + redirect.link + '".');
					}

					ROUTER.send(redirect, (response) => {
						HTTP.send(connection, response);
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

					ROUTER.error({ code: 404 }, (response) => {
						HTTP.send(connection, response);
					});

				}

			});

			if (session !== null) {
				session.track(request, tab);
			}

			request.start();

		} else {

			ROUTER.error({ code: 404 }, (response) => {
				HTTP.send(connection, response);
			});

		}

	} else {

		socket.end();

	}

};

const upgrade_https = function(socket, url) {

	url = URL.parse('https://' + url.headers['host']);


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

								socket.write(encode_http_status('200 Connection Established'));

							});
						} catch (err) {
							tunnel = null;
						}

						if (tunnel === null) {

							socket.write(encode_http_status('504 Gateway Timeout'));
							socket.end();

						}

					} else {

						socket.write(encode_http_status('504 Gateway Timeout'));
						socket.end();

					}

				});

			} else {

				socket.write(encode_http_status('403 Forbidden'));
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

						socket.write(encode_http_status('200 Connection Established'));

					});
				} catch (err) {
					tunnel = null;
				}

				if (tunnel === null) {

					socket.write(encode_http_status('504 Gateway Timeout'));
					socket.end();

				}

			} else {

				socket.write(encode_http_status('403 Forbidden'));
				socket.end();

			}

		});

	} else {

		socket.end();

	}

};

const upgrade_socks = function(socket, url) {

	let connection = SOCKS.upgrade(socket, url);
	if (connection !== null) {

		connection.once('@connect', () => {

			if (this.__state.connections.includes(connection) === false) {
				this.__state.connections.push(connection);
			}

		});

		connection.once('@disconnect', () => {

			if (this.__state.connections.includes(connection) === true) {
				this.__state.connections.remove(connection);
			}

		});

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
											callback('error-host', null);
										}

									});
								} catch (err) {
									tunnel = null;
								}

								if (tunnel === null) {
									callback('error-connection', null);
								}

							} else {
								callback('error-host', null);
							}

						});

					} else {
						callback('error-blocked', null);
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
									callback('error-host', null);
								}

							});
						} catch (err) {
							tunnel = null;
						}

						if (tunnel === null) {
							callback('error-connection', null);
						}

					} else {
						callback('error-blocked', null);
					}

				});

			} else {
				callback('error', null);
			}

		});

	} else {

		socket.end();

	}

};

const upgrade_ws = function(socket, url) {

	let connection = WS.upgrade(socket, url);
	if (connection !== null) {

		connection.once('@connect', () => {

			if (this.stealth !== null) {
				connection.session = this.stealth.track(null, url.headers);
			}

			if (this.__state.connections.includes(connection) === false) {
				this.__state.connections.push(connection);
			}

		});

		connection.once('@disconnect', () => {

			if (this.__state.connections.includes(connection) === false) {
				this.__state.connections.remove(connection);
			}

			if (this.stealth !== null) {
				this.stealth.untrack(connection.session);
				connection.session = null;
			}

		});

		connection.on('error', () => {

			if (this.stealth !== null) {
				this.stealth.untrack(connection.session);
				connection.session = null;
			}

		});

		connection.on('timeout', () => {

			if (this.stealth !== null) {
				this.stealth.untrack(connection.session);
				connection.session = null;
			}

		});

		connection.on('request', (request) => {

			let event   = request.headers.event   || null;
			let method  = request.headers.method  || null;
			let service = request.headers.service || null;

			if (service !== null && event !== null) {

				let instance = this.services[service] || null;
				if (instance !== null && instance.has(event) === true) {

					let response = instance.emit(event, [ request.payload, connection.session ]);
					if (response !== null) {
						WS.send(connection, response);
					}

					if (response !== null && response._warn_ === true) {

						let session = connection.session || null;
						if (session !== null) {
							session.warn(service, method, null);
						}

					}

				}

			} else if (service !== null && method !== null) {

				let instance = this.services[service] || null;
				if (instance !== null && isFunction(instance[method]) === true) {

					instance[method](request.payload, (response) => {

						if (response !== null) {
							WS.send(connection, response);
						}

						if (response !== null && response._warn_ === true) {

							let session = connection.session || null;
							if (session !== null) {
								session.warn(service, method, null);
							}

						}

					}, connection.session);

				}

			}

		});

	} else {

		socket.end();

	}

};



const Server = function(settings, stealth) {

	settings = isObject(settings) ? settings : {};
	stealth  = isStealth(stealth) ? stealth  : null;


	this._settings = Object.freeze(Object.assign({
		host: null
	}, settings));


	this.services = {};
	this.stealth  = stealth;

	this.__state = {
		connected:   false,
		connections: [],
		server:      null
	};


	if (this.stealth !== null) {

		this.services['beacon']   = new Beacon(this.stealth);
		this.services['blocker']  = new Blocker(this.stealth);
		this.services['cache']    = new Cache(this.stealth);
		this.services['host']     = new Host(this.stealth);
		this.services['mode']     = new Mode(this.stealth);
		this.services['peer']     = new Peer(this.stealth);
		this.services['policy']   = new Policy(this.stealth);
		this.services['redirect'] = new Redirect(this.stealth);
		this.services['session']  = new Session(this.stealth);
		this.services['settings'] = new Settings(this.stealth);
		this.services['stash']    = new Stash(this.stealth);

	}


	Emitter.call(this);

};


Server.isServer = isServer;


Server.prototype = Object.assign({}, Emitter.prototype, {

	[Symbol.toStringTag]: 'Server',

	toJSON: function() {

		let blob = Emitter.prototype.toJSON.call(this);
		let data = {
			events:   blob.data.events,
			journal:  blob.data.journal,
			services: {},
			settings: Object.assign({}, this._settings),
			stealth:  null,
			state:    {
				connected:   false,
				connections: []
			}
		};

		Object.keys(this.services).forEach((service) => {
			data.services[service] = this.services[service].toJSON();
		});

		if (this.__state.connected === true) {
			data.state.connected = this.__state.connected;
		}

		if (this.__state.connections.length > 0) {

			this.__state.connections.forEach((connection) => {
				data.state.connections.push(connection.toJSON());
			});

		}

		return {
			'type': 'Server',
			'data': data
		};

	},

	connect: function() {

		if (this.__state.connected === false) {

			this.__state.server = new net.Server({
				allowHalfOpen:  true,
				pauseOnConnect: true
			});

			this.__state.server.on('connection', (socket) => {

				socket.once('data', (data) => {

					if (data[0] === 0x05) {

						SOCKS.receive(null, data, (request) => {

							if (this.stealth !== null) {
								request.headers['@debug'] = this.stealth._settings.debug;
							}

							upgrade_socks.call(this, socket, request);

						});

					} else if (data.indexOf('\r\n') !== -1) {

						HTTP.receive(null, data, (request) => {

							if (this.stealth !== null) {
								request.headers['@debug'] = this.stealth._settings.debug;
							}

							request.headers['@local']  = socket.localAddress  || null;
							request.headers['@remote'] = socket.remoteAddress || null;


							let method     = (request.headers['@method'] || '');
							let link       = (request.headers['@url'] || '');
							let connection = (request.headers['connection'] || '').toLowerCase();
							let upgrade    = (request.headers['upgrade'] || '').toLowerCase();

							if (method === 'CONNECT' && isString(request.headers['host']) === true && request.headers['host'].endsWith(':443') === true) {

								upgrade_https.call(this, socket, request);

							} else if (method === 'GET' && connection === 'upgrade' && upgrade === 'websocket') {

								upgrade_ws.call(this, socket, request);

							} else if (method === 'GET') {

								if (
									link.startsWith('https://') === true
									|| link.startsWith('http://') === true
									|| link.startsWith('/stealth/') === true
								) {

									upgrade_http.call(this, socket, request);

								} else if (link.startsWith('/') === true) {

									if (isString(request.headers['host']) === false) {
										request.headers['host'] = ENVIRONMENT.hostname + ':65432';
									}

									ROUTER.send(Object.assign(URL.parse('http://' + request.headers['host'] + request.headers['@url']), {
										headers: {
											'@debug':  ENVIRONMENT.flags.debug,
											'@local':  request.headers['@local'],
											'@remote': request.headers['@remote']
										}
									}), (response) => {

										let connection = HTTP.upgrade(socket);
										if (connection !== null) {
											HTTP.send(connection, response);
										} else {
											socket.end();
										}

									});

								} else {

									if (this.stealth._settings.debug === true) {
										console.error('Server: "' + link + '": Forbidden.');
									}

									ROUTER.error({ code: 403 }, (response) => {

										let connection = HTTP.upgrade(socket);
										if (connection !== null) {
											HTTP.send(connection, response);
										} else {
											socket.end();
										}

									});

								}

							} else {

								socket.end();

							}

						});

					} else {

						socket.end();

					}

				});

				socket.on('error',   () => socket.end());
				socket.on('close',   () => {});
				socket.on('timeout', () => socket.end());

				socket.resume();

			});

			this.__state.server.on('error', (err) => {

				if (err.code === 'EADDRINUSE') {
					console.error('Server: Another Server is already running!');
				}

				this.disconnect();

			});

			this.__state.server.on('close', () => {

				console.warn('Server: Service stopped.');

				this.disconnect();

			});


			let host = isString(this._settings.host) ? this._settings.host : 'localhost';
			if (host !== 'localhost') {

				console.info('');
				console.info('Server: Service started on http+socks+ws://' + host + ':65432.');
				console.info('Server: > http://' + host + ':65432.');
				console.info('');

				this.__state.connected = true;
				this.emit('connect');

				this.__state.server.listen(65432, host);

			} else {

				console.info('');
				console.info('Server: Service started on http+socks+ws://localhost:65432.');

				if (ENVIRONMENT.ips.length > 0) {

					ENVIRONMENT.ips.forEach((ip) => {

						let hostname = null;

						if (ip.type === 'v4') {
							hostname = IP.render(ip);
						} else if (ip.type === 'v6') {
							hostname = '[' + IP.render(ip) + ']';
						}

						if (hostname !== null) {
							console.info('Server: > http://' + hostname + ':65432.');
						}

					});

				}

				console.info('');

				this.__state.connected = true;
				this.emit('connect');

				this.__state.server.listen(65432, null);

			}


			return true;

		}


		return false;

	},

	disconnect: function() {

		if (this.__state.connections.length > 0) {

			for (let c = 0, cl = this.__state.connections.length; c < cl; c++) {

				let connection = this.__state.connections[c] || null;
				if (connection !== null) {
					connection.disconnect();
				}

				this.__state.connections.splice(c, 1);
				cl--;
				c--;

			}

		}

		if (this.__state.connected === true) {

			this.__state.connected = false;

			if (this.__state.server !== null) {
				this.__state.server.close();
			}

			this.emit('disconnect');

			return true;

		}


		return false;

	}

});


export { Server };


