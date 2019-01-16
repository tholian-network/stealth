
import net from 'net';

import { HTTP     } from './protocol/HTTP.mjs';
import { WS       } from './protocol/WS.mjs';
import { Error    } from './service/Error.mjs';
import { File     } from './service/File.mjs';
import { Redirect } from './service/Redirect.mjs';



const Server = function(stealth) {

	this.stealth  = stealth;
	this.services = {
		file:     new File(stealth),
		error:    new Error(stealth),
		redirect: new Redirect(stealth)
	};

	this.__server = null;

};


Server.prototype = {

	connect: function(host, port) {

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

								headers[key] = val;

							});

							if (
								headers['connection'] === 'Upgrade'
								&& headers['upgrade'] === 'websocket'
								&& headers['sec-websocket-protocol'] === 'stealth'
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

												let service = this.services[request.headers.service] || null;
												let method  = request.headers.method || null;

												if (service !== null && method !== null) {

													if (typeof service[method] === 'function') {

														service[method](request.payload, response => {
															if (response !== null) {
																WS.send(socket, response);
															}
														});

													}

												} else if (request.headers['@status'] === 'ping') {
													WS.pong(socket);
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

										ref.path = '/browser/index.html';

										this.services.redirect.get(ref, response => {
											HTTP.send(socket, response);
										});

									} else if (ref.path === '/favicon.ico') {

										ref.path = '/browser/favicon.ico';

										this.services.redirect.get(ref, response => {

											if (response !== null) {
												HTTP.send(socket, response);
											} else {
												this.services.error.get({
													code: 404
												}, response => HTTP.send(socket, response));
											}

										});

									} else if (ref.path.startsWith('/browser')) {

										this.services.file.get(ref, response => {

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


