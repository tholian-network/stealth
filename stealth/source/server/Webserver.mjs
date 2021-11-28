
import fs   from 'fs';
import net  from 'net';
import path from 'path';

import { console, Buffer, isArray, isBuffer, isFunction, isNumber, isObject, isString } from '../../extern/base.mjs';
import { ENVIRONMENT                                                                  } from '../../source/ENVIRONMENT.mjs';
import { isStealth                                                                    } from '../../source/Stealth.mjs';
import { HTTP                                                                         } from '../../source/connection/HTTP.mjs';
import { HTTP as PACKET                                                               } from '../../source/packet/HTTP.mjs';
import { isServices                                                                   } from '../../source/server/Services.mjs';
import { DATETIME                                                                     } from '../../source/parser/DATETIME.mjs';
import { IP                                                                           } from '../../source/parser/IP.mjs';
import { URL                                                                          } from '../../source/parser/URL.mjs';



const ENCODINGS = [ 'br', 'chunked', 'deflate', 'gzip', 'identity' ];

const isSocket = function(obj) {

	if (obj !== null && obj !== undefined) {
		return obj instanceof net.Socket;
	}

	return false;

};

export const isWebserver = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Webserver]';
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

const toFile = function(url, callback) {

	url      = URL.isURL(url)       ? url      : null;
	callback = isFunction(callback) ? callback : null;


	if (url !== null) {

		if (callback !== null) {

			fs.readFile(path.resolve(ENVIRONMENT.root + url.path), (err, buffer) => {

				if (err === null) {

					fs.stat(path.resolve(ENVIRONMENT.root + url.path), (err, stat) => {

						let response = {
							headers: {
								'@status':        200,
								'@transfer':      { 'encoding': 'identity' },
								'accept-ranges':  'bytes',
								'content-type':   url.mime.format,
								'content-length': Buffer.byteLength(buffer)
							},
							payload: buffer
						};


						if (err === null) {

							let modified = DATETIME.parse(stat.mtime);
							if (DATETIME.isDATETIME(modified) === true) {
								response.headers['last-modified'] = modified;
							}

						}

						callback(response);

					});

				} else {

					callback({
						headers: {
							'@status':        404,
							'@transfer':      { 'encoding': 'identity' },
							'content-type':   url.mime.format,
							'content-length': 0
						},
						payload: null
					});

				}

			});

		}

	} else {

		if (callback !== null) {

			callback({
				headers: {
					'@status':        403,
					'@transfer':      { 'encoding': 'identity' },
					'content-type':   url.mime.format,
					'content-length': 0
				},
				payload: null
			});

		}

	}

};

const toProxyAutoConfig = function(url, callback) {

	url      = URL.isURL(url)       ? url      : null;
	callback = isFunction(callback) ? callback : null;


	if (url !== null) {

		if (callback !== null) {

			let address  = null;
			let domain   = URL.toDomain(url);
			let host     = URL.toHost(url);
			let hostname = null;
			let port     = url.port;


			if (isString(url.headers['@local']) === true) {
				address = url.headers['@local'];
			}

			if (domain !== null) {
				hostname = domain;
			} else if (host !== null) {
				hostname = host;
			}


			if (hostname !== null) {

				let buffer = Buffer.from([
					'function FindProxyForURL(url, host) {',
					'\tif (host === "' + hostname + '") return "DIRECT";',
					(address !== null ? ('\tif (host === "' + address  + '") return "DIRECT";') : ''),
					'\treturn "PROXY ' + hostname + ':' + port + '; DIRECT;',
					'}'
				].join('\n'), 'utf8');

				callback({
					headers: {
						'@status':   200,
						'@transfer': {
							'encoding': 'identity'
						},
						'content-type':   url.mime.format,
						'content-length': Buffer.byteLength(buffer)
					},
					payload: buffer
				});

			} else {

				callback({
					headers: {
						'@status':   404,
						'@transfer': {
							'encoding': 'identity'
						},
						'content-type':   url.mime.format,
						'content-length': 0
					},
					payload: null
				});

			}

		}

	} else {

		if (callback !== null) {

			callback({
				headers: {
					'@status':   404,
					'@transfer': {
						'encoding': 'identity'
					}
				},
				payload: null
			});

		}

	}

};

const toResponse = function(request, callback) {

	let url = URL.parse(request.headers['@url']);
	if (url.path === '/') {

		let debug = false;

		if (this.stealth !== null && this.stealth._settings.debug === true) {
			debug = true;
		}

		callback({
			headers: {
				'@status':  301,
				'location': '/browser/index.html' + (debug === true ? '?debug=true': '')
			},
			payload: null
		});

	} else if (url.path === '/browser/index.html') {

		toFile(url, (response) => {

			response.headers['Content-Security-Policy'] = 'worker-src \'self\'; script-src \'self\' \'unsafe-inline\'; frame-src \'self\'';
			response.headers['Service-Worker-Allowed']  = '/browser';

			callback(response);

		});

	} else if (url.path.startsWith('/browser/') === true) {

		toFile(url, (response) => {
			callback(response);
		});

	} else if (url.path === '/favicon.ico') {

		callback({
			headers: {
				'@status':  301,
				'location': '/browser/design/common/tholian.ico'
			},
			payload: null
		});

	} else if (url.path === '/proxy.pac') {

		let domain  = URL.toDomain(url);
		let host    = URL.toHost(url);
		let pac_url = null;

		if (domain !== null) {
			pac_url = URL.parse('http://' + domain + ':65432/proxy.pac');
		} else if (host !== null) {
			pac_url = URL.parse('http://' + host + ':65432/proxy.pac');
		} else {
			pac_url = URL.parse('http://' + ENVIRONMENT.hostname + ':65432/proxy.pac');
		}


		if (isObject(request.headers) === true) {

			pac_url.headers = {};

			if (isString(request.headers['@local']) === true) {
				pac_url.headers['@local'] = request.headers['@local'];
			}

			if (isString(request.headers['@remote']) === true) {
				pac_url.headers['@remote'] = request.headers['@remote'];
			}

		}


		if (pac_url !== null) {

			toProxyAutoConfig(pac_url, (response) => {
				callback(response);
			});

		} else {

			callback({
				headers: {
					'@status':        403,
					'@transfer':      { 'encoding': 'identity' },
					'connection':     'close',
					'content-type':   url.mime.format,
					'content-length': 0
				},
				payload: null
			});

		}

	} else {

		callback({
			headers: {
				'@status':        403,
				'@transfer':      { 'encoding': 'identity' },
				'connection':     'close',
				'content-type':   url.mime.format,
				'content-length': 0
			},
			payload: null,
			_warn_:  true
		});

	}

};



const Webserver = function(services, stealth) {

	services = isServices(services) ? services : null;
	stealth  = isStealth(stealth)   ? stealth  : null;


	this.stealth = stealth;

	this.__state = {
		connections: {}
	};

};


Webserver.prototype = {

	[Symbol.toStringTag]: 'Webserver',

	toJSON: function() {

		let data = {};


		return {
			'type': 'Webserver',
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
						packet.headers['@method'] === 'GET'
						&& (packet.headers['connection'] || '').toLowerCase() !== 'upgrade'
						&& (
							packet.headers['@url'] === '/'
							|| packet.headers['@url'] === '/favicon.ico'
							|| packet.headers['@url'] === '/proxy.pac'
							|| (packet.headers['@url'] || '').startsWith('/browser')
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
				packet.headers['@method'] === 'GET'
				&& (packet.headers['connection'] || '').toLowerCase() !== 'upgrade'
			) {

				let connection = HTTP.upgrade(socket, packet);
				if (connection !== null) {

					let remote = connection.toJSON().data['remote'];

					connection.once('@connect', () => {

						if (this.stealth !== null) {

							connection.session = this.stealth.track(null, remote);

							if (this.stealth._settings.debug === true) {

								let host = IP.render(remote['host']);
								if (host !== null) {

									if (this.__state.connections[host] === undefined) {
										console.log('Webserver: Client "' + host + '" connected.');
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
							connection.session.warn('Webserver:error', err);
						}

						connection.off('request');
						connection.disconnect();

					});

					connection.on('request', (request) => {

						request.headers['@local']  = socket.localAddress  || null;
						request.headers['@remote'] = socket.remoteAddress || null;

						if (isString(request.headers['@local']) === true) {

							if (request.headers['@local'].startsWith('::ffff:') === true) {
								request.headers['@local'] = request.headers['@local'].substr(7);
							}

						}

						if (isString(request.headers['@remote']) === true) {

							if (request.headers['@remote'].startsWith('::ffff:') === true) {
								request.headers['@remote'] = request.headers['@remote'].substr(7);
							}

						}

						toResponse.call(this, request, (response) => {

							if (response._warn_ === true) {

								if (connection.session !== null) {
									connection.session.warn('Webserver:request', {
										'@method': request.headers['@method'],
										'@url':    request.headers['@url']
									});
								}

							}


							HTTP.send(connection, encodeResponse(request, response));

							if (response.headers['connection'] === 'close') {

								setTimeout(() => {
									connection.disconnect();
								}, 0);

							}

						});

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
											console.log('Webserver: Client "' + host + '" disconnected.');
											delete this.__state.connections[host];
										}

									}, 60000);

								}

							}

						}

					});

					return connection;

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


		return null;

	}

};


export { Webserver };

