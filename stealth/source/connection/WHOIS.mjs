
import net from 'net';

import { Buffer, Emitter, isBuffer, isFunction, isNumber, isObject } from '../../extern/base.mjs';
import { WHOIS as PACKET                                           } from '../../source/packet/WHOIS.mjs';
import { IP                                                        } from '../../source/parser/IP.mjs';
import { URL                                                       } from '../../source/parser/URL.mjs';



const onconnect = function(connection, url) {

	connection.type = 'client';

	connection.socket.on('data', (fragment) => {
		ondata(connection, url, fragment);
	});

	setTimeout(() => {
		connection.emit('@connect');
	}, 0);

};

const ondata = function(connection, url, chunk) {

	connection.fragment = Buffer.concat([ connection.fragment, chunk ]);


	let frame = PACKET.decode(connection, connection.fragment);
	if (frame !== null) {

		url.headers = frame.headers;
		url.payload = frame.payload;

		if (frame.overflow !== null) {
			connection.fragment = frame.overflow;
		} else {
			connection.fragment = Buffer.alloc(0);
		}

		if (frame.headers['@type'] === 'request') {
			connection.emit('request', [ frame ]);
		} else if (frame.headers['@type'] === 'response') {
			connection.emit('response', [ frame ]);
		}


		if (connection.fragment.length > 0) {
			ondata(connection, url, Buffer.alloc(0));
		}

	}

};

const ondisconnect = function(connection /*, url */) {

	let fragment = connection.fragment;
	if (fragment.length > 0) {
		connection.emit('error', [{ type: 'connection', cause: 'socket-stability' }]);
	}


	connection.disconnect();

};

// const onupgrade = function(connection, url) {
//
// 	connection.type = 'server';
//
// 	connection.socket.on('data', (fragment) => {
// 		ondata(connection, url, fragment);
// 	});
//
// 	connection.socket.resume();
//
// 	setTimeout(() => {
// 		connection.emit('@connect');
// 	}, 0);
//
// };



const isConnection = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Connection]';
};

const isSocket = function(obj) {

	if (obj !== null && obj !== undefined) {
		return obj instanceof net.Socket;
	}

	return false;

};

const Connection = function(socket) {

	socket = isSocket(socket) ? socket : null;


	this.fragment = Buffer.alloc(0);
	this.socket   = socket;
	this.type     = null;


	Emitter.call(this);

};


Connection.from = function(json) {

	if (isObject(json) === true) {

		let type = json.type === 'Connection' ? json.type : null;
		let data = isObject(json.data)        ? json.data : null;

		if (type !== null && data !== null) {

			let connection = new Connection();

			return connection;

		}

	} else if (isConnection(json) === true) {

		if ((json instanceof Connection) === true) {

			return json;

		} else {

			let socket     = json.socket || null;
			let connection = new Connection(socket);

			Object.keys(connection).forEach((property) => {

				if (
					json[property] === undefined
					|| json[property] === null
				) {
					json[property] = connection[property];
				}

			});

			return json;

		}

	}


	return null;

};


Connection.isConnection = isConnection;


Connection.prototype = Object.assign({}, Emitter.prototype, {

	[Symbol.toStringTag]: 'Connection',

	toJSON: function() {

		let blob = Emitter.prototype.toJSON.call(this);
		let data = {
			local:   null,
			remote:  null,
			events:  blob.data.events,
			journal: blob.data.journal
		};

		if (this.socket !== null) {

			let local = {
				host: IP.parse(this.socket.localAddress),
				port: this.socket.localPort
			};

			if (
				IP.isIP(local.host) === true
				&& isNumber(local.port) === true
			) {
				data.local = local;
			}

			let remote = {
				host: IP.parse(this.socket.remoteAddress),
				port: this.socket.remotePort
			};

			if (
				IP.isIP(remote.host) === true
				&& isNumber(remote.port) === true
			) {
				data.remote = remote;
			}

		}

		return {
			'type': 'Connection',
			'data': data
		};

	},

	disconnect: function() {

		if (this.socket !== null) {

			this.socket.removeAllListeners('data');
			this.socket.removeAllListeners('timeout');
			this.socket.removeAllListeners('error');
			this.socket.removeAllListeners('end');

			this.socket.destroy();
			this.socket = null;

			this.emit('@disconnect');

		}

	}

});



const WHOIS = {

	connect: function(url, connection) {

		url        = isObject(url)            ? Object.assign(URL.parse(), url) : null;
		connection = isConnection(connection) ? Connection.from(connection)     : new Connection();


		if (url !== null) {

			let hosts = IP.sort(url.hosts);
			if (hosts.length > 0) {

				if (connection.socket === null) {

					try {

						connection.socket = net.connect({
							host:          hosts[0].ip,
							port:          url.port || 80,
							allowHalfOpen: true
						}, () => {

							connection.socket.setNoDelay(true);
							connection.socket.setKeepAlive(true, 0);
							connection.socket.allowHalfOpen = true;

							onconnect(connection, url);

						});

					} catch (err) {
						connection.socket = null;
					}

				} else {

					connection.socket.setNoDelay(true);
					connection.socket.setKeepAlive(true, 0);
					connection.socket.allowHalfOpen = true;

					setTimeout(() => {
						onconnect(connection, url);
					}, 0);

				}


				if (connection.socket !== null) {

					connection.socket.removeAllListeners('data');
					connection.socket.removeAllListeners('timeout');
					connection.socket.removeAllListeners('error');
					connection.socket.removeAllListeners('end');

					connection.socket.on('timeout', () => {

						if (connection.socket !== null) {

							connection.socket = null;
							connection.emit('timeout', [ null ]);

						}

					});

					connection.socket.on('error', (err) => {

						if (connection.socket !== null) {

							let code  = (err.code || '');
							let error = { type: 'connection' };

							if (code === 'ECONNREFUSED') {
								error = { type: 'connection', cause: 'socket-stability' };
							}

							connection.emit('error', [ error ]);

							ondisconnect(connection, url);
							connection.socket = null;

						}

					});

					connection.socket.on('end', () => {

						if (connection.socket !== null) {

							ondisconnect(connection, url);
							connection.socket = null;

						}

					});

					return connection;

				} else {

					connection.socket = null;
					connection.emit('error', [{ type: 'connection' }]);

					return null;

				}

			} else {

				connection.socket = null;
				connection.emit('error', [{ type: 'host' }]);

				return null;

			}

		} else {

			connection.socket = null;
			connection.emit('error', [{ type: 'connection' }]);

			return null;

		}

	},

	disconnect: function(connection) {

		connection = isConnection(connection) ? connection : null;


		if (connection !== null) {

			connection.disconnect();

			return true;

		}


		return false;

	},

	receive: function(connection, buffer, callback) {

		connection = isConnection(connection) ? connection : null;
		buffer     = isBuffer(buffer)         ? buffer     : null;
		callback   = isFunction(callback)     ? callback   : null;


		if (buffer !== null) {

			let data = PACKET.decode(connection, buffer);
			if (data !== null) {

				if (callback !== null) {

					callback({
						headers: data.headers,
						payload: data.payload
					});

				} else {

					return {
						headers: data.headers,
						payload: data.payload
					};

				}

			} else {

				if (callback !== null) {
					callback(null);
				} else {
					return null;
				}

			}

		} else {

			if (callback !== null) {
				callback(null);
			} else {
				return null;
			}

		}

	},

	send: function(connection, data, callback) {

		connection = isConnection(connection) ? connection : null;
		data       = isObject(data)           ? data       : { headers: {}, payload: null };
		callback   = isFunction(callback)     ? callback   : null;


		if (connection !== null && connection.socket !== null) {

			let buffer = PACKET.encode(connection, {
				headers: data.headers || {},
				payload: data.payload || null
			});

			if (buffer !== null) {

				if (connection.type === 'client') {
					connection.socket.write(buffer);
				} else if (connection.type === 'server') {
					connection.socket.write(buffer);
				}

				if (callback !== null) {
					callback(true);
				} else {
					return true;
				}

			} else {

				if (callback !== null) {
					callback(false);
				} else {
					return false;
				}

			}

		} else {

			if (callback !== null) {
				callback(false);
			} else {
				return false;
			}

		}

	},

	upgrade: function() {

		// TODO: WHOIS.upgrade()

	}

};


export { WHOIS };

