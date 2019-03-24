
import net from 'net';

import { console  } from './console.mjs';
import { ERROR    } from './other/ERROR.mjs';
import { FILE     } from './other/FILE.mjs';
import { PAC      } from './other/PAC.mjs';
import { REDIRECT } from './other/REDIRECT.mjs';
import { IP       } from './parser/IP.mjs';
import { HTTP     } from './protocol/HTTP.mjs';
import { WS       } from './protocol/WS.mjs';
import { Cache    } from './server/Cache.mjs';
import { Filter   } from './server/Filter.mjs';
import { Host     } from './server/Host.mjs';
import { Mode     } from './server/Mode.mjs';
import { Peer     } from './server/Peer.mjs';
import { Redirect } from './server/Redirect.mjs';
import { Session  } from './Session.mjs';
import { Settings } from './server/Settings.mjs';
import { Stash    } from './server/Stash.mjs';



const _get_peer = function(address) {

	if (address.startsWith('::ffff:')) {
		address = address.substr(7);
	}

	let ip = IP.parse(address);
	if (ip.type !== null) {

		let peer1 = this.stealth.settings.peers.find((p) => p.domain === ip.ip) || null;
		if (peer1 !== null) {
			return peer1;
		}

		// TODO: Resolve host and check peers for domain==host

	}

	return null;

};

const _get_useragent = function(agent) {

	let browser = null;
	let system  = null;

	if (/crios/.test(agent)) {
		browser = 'Chrome for iOS';
	} else if (/edge/.test(agent)) {
		browser = 'Edge';
	} else if (/android/.test(agent) && /silk\//.test(agent)) {
		browser = 'Silk';
	} else if (/chrome/.test(agent)) {
		browser = 'Chrome';
	} else if (/firefox/.test(agent)) {
		browser = 'Firefox';
	} else if (/android/.test(agent)) {
		browser = 'AOSP';
	} else if (/msie|trident/.test(agent)) {
		browser = 'IE';
	} else if (/safari\//.test(agent)) {
		browser = 'Safari';
	} else if (/applewebkit/.test(agent)) {
		browser = 'WebKit';
	}

	if (/android/.test(agent)) {
		system = 'Android';
	} else if (/iphone|ipad|ipod/.test(agent)) {
		system = 'iOS';
	} else if (/windows/.test(agent)) {
		system = 'Windows';
	} else if (/mac os x/.test(agent)) {
		system = 'Mac OS';
	} else if (/cros/.test(agent)) {
		system = 'Chrome OS';
	} else if (/linux/.test(agent)) {
		system = 'Linux';
	} else if (/firefox/.test(agent)) {
		system = 'Firefox OS';
	}


	return {
		browser: browser || 'Unknown',
		system:  system  || 'Unknown'
	};

};

const _get_session_from_cookie = function(cookie) {

	let session = null;

	let tmp = cookie.split(';').map((c) => c.trim()).find((c) => c.startsWith('session=')) || '';
	if (tmp !== '' && tmp.includes('=')) {

		let val = tmp.split('=')[1] || '';
		if (val.startsWith('"')) val = val.substr(1);
		if (val.endsWith('"'))   val = val.substr(0, val.length - 1);

		session = this.stealth.sessions.find((s) => s.id === val) || null;

	}

	return session;

};



const Server = function(stealth) {

	this.stealth  = stealth;
	this.services = {
		cache:    new Cache(stealth),
		filter:   new Filter(stealth),
		host:     new Host(stealth),
		mode:     new Mode(stealth),
		peer:     new Peer(stealth),
		redirect: new Redirect(stealth),
		settings: new Settings(stealth),
		stash:    new Stash(stealth)
	};

	this.__server = null;

};


Server.prototype = {

	connect: function(host, port, callback) {

		host     = String.isString(host)         ? host     : null;
		port     = Number.isNumber(port)         ? port     : 65432;
		callback = Function.isFunction(callback) ? callback : null;


		if (this.__server !== null) {

			if (callback !== null) {
				callback(true);
			}

			return true;

		}


		if (port !== null) {

			this.__server = new net.Server({
				allowHalfOpen:  true,
				pauseOnConnect: true
			});

			this.__server.on('connection', (socket) => {

				socket.on('data', (blob) => {

					let req = blob.toString('utf8');
					let raw = req.split('\n').map((line) => line.trim());

					if (raw[0].includes('HTTP/1.1')) {

						let tmp    = raw[0].split(' ');
						let method = null;
						let url    = null;
						let proxy  = false;

						if (/^(OPTIONS|GET|HEAD|POST|PUT|DELETE|TRACE|CONNECT|PATCH)$/g.test(tmp[0])) {
							method = tmp[0];
						}

						if (tmp[1].startsWith('/')) {
							url = tmp[1];
						} else if (tmp[1].startsWith('http://') || tmp[1].startsWith('https://')) {
							url   = tmp[1];
							proxy = true;
						}


						if (method !== null && url !== null) {

							let headers = {};

							raw.slice(1).filter((line) => line.trim() !== '').forEach((line) => {

								let key = line.split(':')[0].trim().toLowerCase();
								let val = line.split(':').slice(1).join(':').trim();
								if (key === 'sec-websocket-key') {
									headers[key] = val;
								} else {
									headers[key] = val.toLowerCase();
								}

							});

							if (
								(headers['connection'] || '').includes('upgrade')
								&& (headers['upgrade'] || '').includes('websocket')
								&& (headers['sec-websocket-protocol'] || '').includes('stealth')
							) {

								WS.upgrade(socket, headers, (result) => {

									if (result === true) {

										let { browser, system } = _get_useragent(headers['user-agent'] || '');
										let peer    = _get_peer.call(this, socket.remoteAddress);
										let session = new Session({
											browser: browser,
											socket:  socket,
											system:  system
										});

										socket.__ws_server = true;
										socket.allowHalfOpen = true;
										socket.setTimeout(0);
										socket.setNoDelay(true);
										socket.setKeepAlive(true, 0);
										socket.removeAllListeners('timeout');

										socket.removeAllListeners('data');
										socket.on('data', (blob) => {

											WS.receive(socket, blob, (request) => {

												if (request !== null) {

													let event   = request.headers.event   || null;
													let method  = request.headers.method  || null;
													let service = request.headers.service || null;

													if (service !== null && event !== null) {

														let instance = this.services[service] || null;
														if (instance !== null) {

															let response = instance.emit(event, [ request.payload ]);
															if (response !== null) {

																WS.send(socket, response);

																if (response._warn_ === true) {
																	session.warn(service, method, null);
																}

															}

														}

													} else if (service !== null && method !== null) {

														let instance = this.services[service] || null;
														if (instance !== null && typeof instance[method] === 'function') {
															instance[method](request.payload, (response) => {

																if (response !== null) {

																	WS.send(socket, response);

																	if (response._warn_ === true) {
																		session.warn(service, method, null);
																	}

																}

															});
														}

													}

												} else {
													WS.close(null, (response) => WS.send(response));
												}

											});

										});

										socket.on('end', () => {

											let index = this.stealth.sessions.indexOf(session);
											if (index !== -1) {
												this.stealth.sessions.splice(index, 1);
											}

											session.kill();

										});

										this.stealth.sessions.push(session);
										session.init();

									} else {
										socket.close();
									}

								});

							} else {

								socket.allowHalfOpen = true;
								socket.setTimeout(0);
								socket.setNoDelay(true);
								socket.setKeepAlive(true, 0);
								socket.removeAllListeners('timeout');

								HTTP.receive(socket, blob, (origin) => {

									let session = _get_session_from_cookie.call(this, origin.headers['cookie'] || '');
									let url     = origin.headers['@url'];

									if (proxy === true || url.startsWith('/stealth/')) {

										let tab   = null;
										let flags = [];

										if (url.startsWith('/stealth/:')) {

											let tmp = url.substr(9).split('/').shift();
											if (tmp.startsWith(':') && tmp.endsWith(':')) {

												tmp = tmp.substr(1, tmp.length - 2);

												if (tmp.includes(',')) {
													tab   = tmp.split(',').shift();
													flags = tmp.split(',').slice(1);
													url   = url.substr(9).split('/').slice(1).join('/');
												} else {

													let num = parseInt(tmp, 10);
													if (Number.isNaN(num) === false) {
														tab = tmp;
														url = url.substr(9).split('/').slice(1).join('/');
													} else {
														flags.push(tmp);
														url = url.substr(9).split('/').slice(1).join('/');
													}

												}

											}

										} else if (url.startsWith('/stealth/')) {
											url = url.substr(9);
										}


										let request = this.stealth.open(url);
										if (request !== null) {

											if (session !== null) {
												session.track(request, tab);
											}

											request.on('error', (err) => {

												let type = err.type || null;
												if (type !== null) {

													REDIRECT.error({
														address: socket.localAddress,
														url:     url,
														err:     err,
														flags:   {
															webview: request.flags.webview,
															proxy:   proxy
														}
													}, (response) => HTTP.send(socket, response));

												} else if (typeof err.code === 'number') {

													ERROR.send({
														code: err.code
													}, (response) => HTTP.send(socket, response));

												} else {

													ERROR.send({
														code: 500
													}, (response) => HTTP.send(socket, response));

												}

											});

											request.on('redirect', (response) => {

												let url = response.headers['location'] || null;
												if (url !== null && request.flags.webview === true) {

													let path = '/stealth/' + url;
													if (tab !== null) {
														path = '/stealth/:' + tab + ',webview:/' + url;
													}

													REDIRECT.send({
														code: 301,
														path: path
													}, (response) => HTTP.send(socket, response));

												} else if (url !== null) {

													let path = '/stealth/' + url;
													if (tab !== null) {
														path = '/stealth/:' + tab + ':/' + url;
													}

													REDIRECT.send({
														code: 301,
														path: path
													}, (response) => HTTP.send(socket, response));

												} else {

													ERROR.send({
														code: 500
													}, (response) => HTTP.send(socket, response));

												}

											});

											request.on('response', (response) => {

												// TODO: How to replace the URLs in
												// HTML and CSS files correctly with
												// the '/stealth/tab:' + tab prefix?

												if (response !== null && response.payload !== null) {

													let headers = {};

													[
														'content-length',
														'content-type'
													].forEach((key) => {
														headers[key] = response.headers[key];
													});

													response.headers = headers;

													HTTP.send(socket, response);

												} else {

													ERROR.send({
														code: 404
													}, (response) => HTTP.send(socket, response));

												}

											});


											if (flags.includes('refresh')) {
												request.set('refresh', true);
											}

											if (flags.includes('webview')) {
												request.set('webview', true);
											}

											request.init();

										} else {

											ERROR.send({
												code: 404
											}, (response) => HTTP.send(socket, response));

										}

									} else {

										let ref = this.stealth.parse(origin.headers['@url']);
										if (ref.path === '/') {

											REDIRECT.send({
												code: 301,
												path: '/browser/index.html'
											}, (response) => {
												HTTP.send(socket, response);
											});

										} else if (ref.path === '/favicon.ico') {

											REDIRECT.send({
												code: 301,
												path: '/browser/favicon.ico'
											}, (response) => {

												if (response !== null) {
													HTTP.send(socket, response);
												} else {
													ERROR.send({
														code: 404
													}, (response) => HTTP.send(socket, response));
												}

											});

										} else if (ref.path === '/proxy.pac') {

											PAC.send({
												url:     'http://' + (origin.headers['host'] || (host + ':' + port)) + '/proxy.pac',
												address: socket.localAddress
											}, (response) => {

												if (response !== null) {
													HTTP.send(socket, response);
												} else {
													ERROR.send({
														code: 404
													}, (response) => HTTP.send(socket, response));
												}

											});

										} else if (ref.path === '/browser/index.html') {

											FILE.read(ref, (response) => {

												if (response !== null && response.payload !== null) {
													response.headers['Service-Worker-Allowed'] = '/browser';
													HTTP.send(socket, response);
												} else {
													ERROR.send({
														code: 404
													}, (response) => HTTP.send(socket, response));
												}

											});

										} else if (ref.path.startsWith('/browser')) {

											FILE.read(ref, (response) => {

												if (response !== null && response.payload !== null) {
													HTTP.send(socket, response);
												} else {
													ERROR.send({
														code: 404
													}, (response) => HTTP.send(socket, response));
												}

											});

										} else {

											ERROR.send({
												code: 500
											}, (response) => HTTP.send(socket, response));

										}

									}

								});

							}

						} else {

							socket.write('Sorry, telnet is not allowed.');
							socket.end();

						}

					}

				});

				socket.on('error',   () => {});
				socket.on('close',   () => {});
				socket.on('timeout', () => socket.close());

				socket.resume();

			});

			this.__server.on('error', (err) => {

				if (err.code === 'EADDRINUSE') {
					console.warn('Stealth Service stopped because it is already running.');
				} else {
					console.warn('Stealth Service stopped.');
				}

				this.__server.close();

			});

			this.__server.on('close', () => {
				this.__server = null;
			});


			if (host !== null && host !== 'localhost') {
				console.info('Stealth Service started on http://' + host + ':' + port + '.');
				this.__server.listen(port, host);
			} else {
				console.info('Stealth Service started on http://localhost:' + port + '.');
				this.__server.listen(port, null);
			}


			if (callback !== null) {
				callback(true);
			}

			return true;

		}


		if (callback !== null) {
			callback(true);
		}

		return false;

	},

	disconnect: function(callback) {

		callback = Function.isFunction(callback) ? callback : null;


		if (this.__server !== null) {

			console.warn('Stealth Service stopped.');

			this.__server.close();
			this.__server = null;

			if (callback !== null) {
				callback(true);
			}

			return true;

		} else {

			if (callback !== null) {
				callback(false);
			}

			return false;

		}

	}

};


export { Server };


