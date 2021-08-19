
import dgram from 'dgram';

import { Emitter, isBuffer, isFunction, isNumber, isObject } from '../../extern/base.mjs';
import { IP                                                } from '../../source/parser/IP.mjs';
import { URL                                               } from '../../source/parser/URL.mjs';
import { DNS as PACKET                                     } from '../../source/packet/DNS.mjs';



const onconnect = function(connection, url) {

	connection.type = 'client';

	try {
		connection.socket.addMembership(connection.remote.host);
	} catch (err) {
		// Do Nothing
	}

	connection.socket.on('message', (message) => {
		onmessage(connection, url, message);
	});

	setTimeout(() => {
		connection.emit('@connect');
	}, 0);

};

const onmessage = function(connection, url, message) {

	MDNS.receive(connection, message, (frame) => {

		if (frame !== null) {

			url.headers = frame.headers;
			url.payload = frame.payload;

			if (frame.headers['@type'] === 'request') {
				connection.emit('request', [ frame ]);
			} else if (frame.headers['@type'] === 'response') {
				connection.emit('response', [ frame ]);
			}

		}

	});

};

const ondisconnect = function(connection, url) {

	if (connection.type === 'client') {

		if (url.headers === null) {
			connection.emit('error', [{ type: 'connection', cause: 'socket-stability' }]);
		}

	}

	connection.disconnect();

};

const onupgrade = function(connection, url) {

	connection.type = 'server';

	try {

		connection.socket.bind(connection.remote.port, () => {
			connection.socket.addMembership(connection.remote.host);
		});

	} catch (err) {

		if (err.code === 'ERR_SOCKET_ALREADY_BOUND') {

			try {
				connection.socket.addMembership(connection.remote.host);
			} catch (err) {
				// Do Nothing
			}

		}

	}

	connection.socket.on('message', (message) => {
		onmessage(connection, url, message);
	});

	setTimeout(() => {
		connection.emit('@connect');
	}, 0);

};



const isConnection = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Connection]';
};

const isSocket = function(obj) {

	if (obj !== null && obj !== undefined) {
		return obj instanceof dgram.Socket;
	}

	return false;

};

const isUpgrade = function(url) {

	if (
		isObject(url) === true
		&& isObject(url.headers) === true
	) {
		return true;
	}

};

const Connection = function(socket) {

	this.socket = socket || null;
	this.remote = null;
	this.type   = null;


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
			data.local = this.socket.address().address + ':' + this.socket.address().port;
		}

		if (this.remote !== null) {
			data.remote = this.remote.host + ':' + this.remote.port;
		}

		return {
			'type': 'Connection',
			'data': data
		};

	},

	disconnect: function() {

		if (this.socket !== null) {

			this.socket.removeAllListeners('listening');
			this.socket.removeAllListeners('message');
			this.socket.removeAllListeners('error');
			this.socket.removeAllListeners('close');

			try {
				this.socket.close();
			} catch (err) {
				// Do nothing
			}

			this.socket = null;

			this.emit('@disconnect');

		}

	}

});



const MDNS = {

	connect: function(url, connection) {

		url        = isObject(url)            ? Object.assign(URL.parse(), url) : null;
		connection = isConnection(connection) ? Connection.from(connection)     : new Connection();


		if (url !== null) {

			let hosts = IP.sort(url.hosts);
			if (hosts.length > 0) {

				if (connection.socket === null) {

					let type = null;

					if (hosts[0].type === 'v4') {
						type = 'udp4';
					} else if (hosts[0].type === 'v6') {
						type = 'udp6';
					}

					try {

						connection.remote = {
							host: hosts[0].ip,
							port: url.port
						};

						connection.socket = dgram.createSocket({
							type:      type,
							reuseAddr: true
						});

						connection.socket.bind(connection.remote.port, () => {
							onconnect(connection, url);
						});

					} catch (err) {
						connection.socket = null;
					}

				} else {

					connection.remote = {
						host: hosts[0].ip,
						port: url.port
					};

					try {
						connection.socket.setTTL(1);
					} catch (err) {
						connection.socket = null;
					}

					setTimeout(() => {
						onconnect(connection, url);
					}, 0);

				}


				if (connection.socket !== null) {

					connection.socket.removeAllListeners('message');
					connection.socket.removeAllListeners('error');
					connection.socket.removeAllListeners('close');

					connection.socket.on('error', () => {

						if (connection.socket !== null) {
							ondisconnect(connection, url);
						}

					});

					connection.socket.on('close', () => {

						if (connection.socket !== null) {
							ondisconnect(connection, url);
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

					connection.socket.send(buffer, connection.remote.port, connection.remote.host, (err) => {

						if (err === null) {

							if (callback !== null) {
								callback(true);
							}

						} else {

							if (callback !== null) {
								callback(false);
							}

						}

					});

					if (callback === null) {
						return true;
					}

				} else if (connection.type === 'server') {

					connection.socket.send(buffer, connection.remote.port, connection.remote.host, (err) => {

						if (err === null) {

							if (callback !== null) {
								callback(true);
							}

						} else {

							if (callback !== null) {
								callback(false);
							}

						}

					});

					if (callback === null) {
						return true;
					}

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

	upgrade: function(tunnel, url) {

		url = isUpgrade(url) ? Object.assign(URL.parse(), url) : Object.assign(URL.parse(), { headers: {} });


		let connection = null;

		if (isSocket(tunnel) === true) {
			connection = new Connection(tunnel);
		} else if (isConnection(tunnel) === true) {
			connection = Connection.from(tunnel);
		}


		if (connection !== null) {

			let hosts = IP.sort(url.hosts);
			if (hosts.length > 0 && isNumber(url.port) === true) {

				connection.remote = {
					host: hosts[0].ip,
					port: url.port
				};

			} else {

				if (connection.socket.type === 'udp4') {

					connection.remote = {
						host: '224.0.0.251',
						port: 5353
					};

				} else if (connection.socket.type === 'udp6') {

					connection.remote = {
						host: 'ff02::fb',
						port: 5353
					};

				}

			}

			try {
				connection.socket.setTTL(1);
			} catch (err) {
				// Do Nothing
			}

			connection.socket.removeAllListeners('listening');
			connection.socket.removeAllListeners('message');
			connection.socket.removeAllListeners('error');
			connection.socket.removeAllListeners('close');

			connection.socket.on('error', () => {

				if (connection.socket !== null) {
					ondisconnect(connection, url);
				}

			});

			connection.socket.on('close', () => {

				if (connection.socket !== null) {
					ondisconnect(connection, url);
				}

			});

			onupgrade(connection, url);

			return connection;

		}


		return null;

	}

};


export { MDNS };

