
import fs   from 'fs';
import net  from 'net';
import path from 'path';

import { console, Buffer, isBuffer, isFunction, isObject, isString } from '../../extern/base.mjs';
import { ENVIRONMENT                                               } from '../../source/ENVIRONMENT.mjs';
import { isStealth                                                 } from '../../source/Stealth.mjs';
import { HTTP                                                      } from '../../source/connection/HTTP.mjs';
import { HTTP as PACKET                                            } from '../../source/packet/HTTP.mjs';
import { isServices                                                } from '../../source/server/Services.mjs';
import { URL                                                       } from '../../source/parser/URL.mjs';



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



const toFile = function(url, callback) {

	url      = URL.isURL(url)       ? url      : null;
	callback = isFunction(callback) ? callback : null;


	if (url !== null) {

		if (callback !== null) {

			fs.readFile(path.resolve(ENVIRONMENT.root + url.path), (err, buffer) => {

				if (err === null) {

					callback(Object.assign(url, {
						headers: {
							'@status':        200,
							'@transfer':      {
								'encoding': 'identity'
							},
							'content-type':   url.mime.format,
							'content-length': Buffer.byteLength(buffer)
						},
						payload: buffer
					}));

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

			});

		}

	} else {

		if (callback !== null) {

			callback({
				headers: {
					'@status':   403,
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

	let encoding = 'identity';

	if (isString(request.headers['accept-encoding']) === true) {

		if (ENCODINGS.includes(request.headers['accept-encoding']) === true) {
			encoding = request.headers['accept-encoding'];
		}

	}


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

			response.headers['@transfer']['encoding']   = encoding;
			response.headers['Content-Security-Policy'] = 'worker-src \'self\'; script-src \'self\' \'unsafe-inline\'; frame-src \'self\'';
			response.headers['Service-Worker-Allowed']  = '/browser';

			callback(response);

		});

	} else if (url.path.startsWith('/browser/') === true) {

		toFile(url, (response) => {

			response.headers['@transfer']['encoding'] = encoding;

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

				response.headers['@transfer']['encoding'] = encoding;

				callback(response);

			});

		} else {

			callback({
				headers: {
					'@status':   403,
					'@transfer': {
						'encoding': encoding
					},
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
				'@status':   403,
				'@transfer': {
					'encoding': encoding
				},
				'connection':     'close',
				'content-type':   url.mime.format,
				'content-length': 0
			},
			payload: null
		});

	}

	// TODO: Support 206 Partial Content requests

};



const Webserver = function(services, stealth) {

	services = isServices(services) ? services : null;
	stealth  = isStealth(stealth)   ? stealth  : null;


	this.stealth = stealth;

};


Webserver.prototype = {

	[Symbol.toStringTag]: 'Webserver',

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
						request.headers['@method'] === 'GET'
						&& (request.headers['connection'] || '').toLowerCase() !== 'upgrade'
						&& (
							request.headers['@url'] === '/'
							|| request.headers['@url'] === '/favicon.ico'
							|| request.headers['@url'] === '/proxy.pac'
							|| (request.headers['@url'] || '').startsWith('/browser')
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
				request.headers['@method'] === 'GET'
				&& (request.headers['connection'] || '').toLowerCase() !== 'upgrade'
			) {

				let connection = HTTP.upgrade(socket, request);
				if (connection !== null) {

					connection.once('@connect', () => {

						if (this.stealth !== null && this.stealth._settings.debug === true) {
							console.log('Webserver: Client "' + connection.toJSON().remote + '" connected.');
						}

					});

					connection.once('error', () => {

						connection.off('request');
						connection.close();

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

							HTTP.send(connection, response);


							if (response.headers['connection'] === 'close') {

								setTimeout(() => {
									connection.disconnect();
								}, 0);

							}

						});

					});

					connection.once('@disconnect', () => {

						if (this.stealth !== null && this.stealth._settings.debug === true) {
							console.log('Webserver: Client "' + connection.toJSON().remote + '" disconnected.');
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

