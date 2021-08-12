
import net from 'net';

import { console, Buffer, isBuffer, isNumber, isString } from '../../extern/base.mjs';
import { isStealth                                     } from '../../source/Stealth.mjs';
import { HTTP                                          } from '../../source/connection/HTTP.mjs';
import { HTTP as PACKET                                } from '../../source/packet/HTTP.mjs';
import { isServices                                    } from '../../source/server/Services.mjs';
import { URL                                           } from '../../source/parser/URL.mjs';


const isSocket = function(obj) {

	if (obj !== null && obj !== undefined) {
		return obj instanceof net.Socket;
	}

	return false;

};

export const isWebserver = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Webserver]';
};



const process_http_request = function(request) {

	// TODO: Redirect / to /browser/index.html
	// TODO: Redirect /favicon to /browser/design/common/tholian.ico
	// TODO: Generate /proxy.pac file
	// TODO: Inject security/service worker headers for /browser/index.html
	// TODO: Support 206 Partial Content requests
	// TODO: Return HTTP response

};



const Webserver = function(stealth) {

	stealth = isStealth(stealth) ? stealth : null;


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


						let response = process_http_request.call(this, request);
						if (response !== null) {

							HTTP.send(connection, response);

						} else {

							HTTP.send(connection, {
								headers: {
									'@status': 404
								},
								payload: null
							});

						}

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

		// TODO: Serve Redirects if / or /favicon.ico
		// TODO: Serve /proxy.pac file (generate based on headers)
		// TODO: Serve files from filesystem directly if /browser/...

		// TODO: Support and integrate request.headers['accept-encoding']
		// TODO: Support and integrate 206 Partial Content requests (request.headers['@transfer']['range'])

	}

};


export { Webserver };

