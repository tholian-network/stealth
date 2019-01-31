
import net from 'net';

import { HTTP     } from './protocol/HTTP.mjs';
import { WS       } from './protocol/WS.mjs';
import { Cache    } from './service/Cache.mjs';
import { Error    } from './service/Error.mjs';
import { File     } from './service/File.mjs';
// import { Filter   } from './service/Filter.mjs';
import { Host     } from './service/Host.mjs';
import { Peer     } from './service/Peer.mjs';
import { Redirect } from './service/Redirect.mjs';
import { Settings } from './service/Settings.mjs';
import { Site     } from './service/Site.mjs';

const _ROOT = process.env.PWD;



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

	let id = null;


	let tmp = cookie.split(';').map(c => c.trim()).find(c => c.startsWith('session=')) || '';
	if (tmp !== '' && tmp.includes('=')) {

		let val = tmp.split('=')[1] || '';
		if (val.startsWith('"')) val = val.substr(1);
		if (val.endsWith('"'))   val = val.substr(0, val.length - 1);

		let num = parseInt(val, 10);
		if (Number.isNaN(num) === false) {
			id = num;
		}

	}

	if (id !== null) {
		return this.sessions.find(s => s.id === id) || null;
	}


	return null;

};


let _session = 1;

const Server = function(stealth, root) {

	root = typeof root === 'string' ? root : _ROOT;


	this.stealth  = stealth;
	this.services = {
		cache:    new Cache(stealth),
		error:    new Error(stealth),
		file:     new File(stealth),
//		filter:   new Filter(stealth),
		host:     new Host(stealth),
		peer:     new Peer(stealth),
		redirect: new Redirect(stealth),
		settings: new Settings(stealth),
		site:     new Site(stealth)
	};
	this.sessions = [];

	this.__root   = root;
	this.__server = null;

};


Server.prototype = {

	connect: function(host, port) {

		host = typeof host === 'string' ? host : null;
		port = typeof port === 'number' ? port : 65432;


		if (this.__server === null) {

			this.__server = new net.Server({
				allowHalfOpen:  true,
				pauseOnConnect: true
			});

			this.__server.on('connection', socket => {

				socket.on('data', blob => {

					let req = blob.toString('utf8');
					let raw = req.split('\n').map(line => line.trim());

					if (raw[0].includes('HTTP/1.1')) {

						let tmp    = raw[0].split(' ');
						let method = null;
						let url    = null;

						if (/^(OPTIONS|GET|HEAD|POST|PUT|DELETE|TRACE|CONNECT|PATCH)$/g.test(tmp[0])) {
							method = tmp[0];
						}

						if (tmp[1].startsWith('/')) {
							url = tmp[1];
						}

						if (method !== null && url !== null) {

							let headers = {};

							raw.slice(1).filter(line => line.trim() !== '').forEach(line => {

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

								WS.upgrade(socket, headers, result => {

									if (result === true) {

										socket.allowHalfOpen = true;
										socket.setTimeout(0);
										socket.setNoDelay(true);
										socket.setKeepAlive(true, 0);
										socket.removeAllListeners('timeout');

										socket.removeAllListeners('data');
										socket.on('data', blob => {

											WS.receive(socket, blob, request => {

												if (request !== null) {

													let event   = request.headers.event   || null;
													let method  = request.headers.method  || null;
													let service = request.headers.service || null;

													if (service !== null && event !== null) {

														let instance = this.services[service] || null;
														if (instance !== null) {
															instance.emit(event, [ request.payload ]);
														}

													} else if (service !== null && method !== null) {

														let instance = this.services[service] || null;
														if (instance !== null && typeof instance[method] === 'function') {
															instance[method](request.payload, response => {
																if (response !== null) {
																	WS.send(socket, response);
																}
															});
														}

													}

												} else {
													WS.close(null, response => WS.send(response));
												}

											});

										});


										let id = _session++;

										socket.id = id;
										socket.on('end', _ => {

											let session = this.sessions.find(s => s.id === socket.id) || null;
											if (session !== null) {
												session.requests.forEach(r => r.kill());
												this.sessions.splice(this.sessions.indexOf(session), 1);
											}

											console.log('> peer #' + session.id + ' disconnected.');

										});


										WS.send(socket, {
											headers: {
												session: socket.id
											},
											payload: null
										});


										let { browser, system } = _get_useragent(headers['user-agent'] || '');

										if (browser !== 'Unknown' && system !== 'Unknown') {
											console.log('> peer #' + id + ' (' + browser + ' on ' + system + ') connected.');
										} else {
											console.log('> peer #' + id + ' connected.');
										}

										this.sessions.push({
											id:       id,
											browser:  browser,
											mode:     this.stealth.mode,
											requests: [],
											socket:   socket,
											system:   system
										});

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

								HTTP.receive(socket, blob, request => {

									let session = _get_session_from_cookie.call(this, request.headers['cookie'] || '');
									let url     = request.headers['url'];
									if (session !== null && url.startsWith('/stealth/')) {

										url = url.substr('/stealth/'.length);

										console.log('> peer #' + session.id + ' requests ' + url + '.');

										let request = this.stealth.open(url, session);
										if (request !== null) {

											request.on('error', err => {

												let index = session.requests.indexOf(request);
												if (index !== -1) {
													session.requests.splice(index, 1);
												}

												if (err.type === 'url') {

													this.services.redirect.get({
														code: 307,
														path: '/browser/internal/fix-url.html?url=' + tmp
													}, response => HTTP.send(socket, response));

												} else if (err.type === 'connect') {

													this.services.redirect.get({
														code: 307,
														path: '/browser/internal/fix-connect.html?url=' + tmp
													}, response => HTTP.send(socket, response));

												} else if (err.type === 'download') {

													this.services.redirect.get({
														code: 307,
														path: '/browser/internal/fix-download.html?url=' + tmp
													}, response => HTTP.send(socket, response));

												}

											});

											request.on('ready', response => {

												let index = session.requests.indexOf(request);
												if (index !== -1) {
													session.requests.splice(index, 1);
												}

												if (response !== null && response.payload !== null) {
													HTTP.send(socket, response);
												} else {
													this.services.error.get({
														code: 404
													}, response => HTTP.send(socket, response));
												}

											});

											session.requests.push(request);

											request.init();

										} else {

											this.services.error.get({
												code: 404
											}, response => HTTP.send(socket, response));

										}

									} else {

										let ref = this.stealth.parse(request.headers['url']);
										if (ref.path === '/') {

											this.services.redirect.get({
												code: 301,
												path: '/browser/index.html'
											}, response => {
												HTTP.send(socket, response);
											});

										} else if (ref.path === '/favicon.ico') {

											this.services.redirect.get({
												code: 301,
												path: '/browser/favicon.ico'
											}, response => {

												if (response !== null) {
													HTTP.send(socket, response);
												} else {
													this.services.error.get({
														code: 404
													}, response => HTTP.send(socket, response));
												}

											});

										} else if (ref.path.startsWith('/browser')) {

											this.services.file.read(ref, response => {

												if (response !== null && response.payload !== null) {
													HTTP.send(socket, response);
												} else {
													this.services.error.get({
														code: 404
													}, response => HTTP.send(socket, response));
												}

											});

										} else {

											this.services.error.get({
												code: 500
											}, response => HTTP.send(socket, response));

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

				socket.on('error',   _ => {});
				socket.on('close',   _ => {});
				socket.on('timeout', _ => socket.close());

				socket.resume();

			});

			this.__server.on('error', _ => this.server.close());
			this.__server.on('close', _ => {
				this.__server = null;
			});


			console.log('Stealth Service listening on http://' + host + ':' + port);
			this.__server.listen(port, host === 'localhost' ? null : host);

		}

	}

};


export { Server };


