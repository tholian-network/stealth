
import net from 'net';

import { HTTP     } from './protocol/HTTP.mjs';
import { WS       } from './protocol/WS.mjs';
import { Cache    } from './service/Cache.mjs';
import { Error    } from './service/Error.mjs';
import { File     } from './service/File.mjs';
import { Host     } from './service/Host.mjs';
import { Peer     } from './service/Peer.mjs';
import { Redirect } from './service/Redirect.mjs';
import { Settings } from './service/Settings.mjs';
// import { Site     } from './service/Site.mjs';

const _ROOT = process.env.PWD;



const Server = function(stealth, root) {

	root = typeof root === 'string' ? root : _ROOT;


	this.stealth  = stealth;
	this.services = {
		cache:    new Cache(stealth),
		error:    new Error(stealth),
		file:     new File(stealth),
		host:     new Host(stealth),
		peer:     new Peer(stealth),
		redirect: new Redirect(stealth),
		settings: new Settings(stealth),
//		site:     new Site(stealth)
	};

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

													let service = request.headers.service || null;
													let event   = request.headers.event   || null;
													let method  = request.headers.method  || null;

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

									} else if (ref.path.startsWith('/stealth/')) {

										let tmp     = ref.path.substr(9) + (ref.query !== null ? ('?' + ref.query) : '');
										let url     = 'https://' + tmp;
										let request = this.stealth.open(url);
										if (request !== null) {

											request.on('error', err => {

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

									} else {

										this.services.error.get({
											code: 404
										}, response => HTTP.send(socket, response));

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


