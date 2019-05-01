
import { isFunction, isObject, isString } from './POLYFILLS.mjs';
import { Emitter                        } from './Emitter.mjs';
import { Cache                          } from './client/Cache.mjs';
import { Filter                         } from './client/Filter.mjs';
import { Host                           } from './client/Host.mjs';
import { Mode                           } from './client/Mode.mjs';
import { Peer                           } from './client/Peer.mjs';
import { Redirect                       } from './client/Redirect.mjs';
import { Settings                       } from './client/Settings.mjs';
import { Stash                          } from './client/Stash.mjs';
import { URL                            } from './parser/URL.mjs';
import { WS                             } from './protocol/WS.mjs';
import { WSS                            } from './protocol/WSS.mjs';



const Client = function(stealth) {

	this.stealth = stealth;
	Emitter.call(this);


	this.address    = null;
	this.connection = null;
	this.ref        = null;
	this.services   = {
		cache:    new Cache(this),
		filter:   new Filter(this),
		host:     new Host(this),
		mode:     new Mode(this),
		peer:     new Peer(this),
		redirect: new Redirect(this),
		settings: new Settings(this),
		stash:    new Stash(this)
	};

};


Client.prototype = Object.assign({}, Emitter.prototype, {

	connect: function(host, callback) {

		host     = isString(host)       ? host     : 'localhost';
		callback = isFunction(callback) ? callback : null;


		if (this.connection !== null) {

			if (callback !== null) {
				callback(true);
			}

			return true;

		}


		if (host !== null) {

			let ref   = URL.parse('ws://' + host + ':65432');
			let hosts = ref.hosts.sort((a, b) => {

				if (a.scope === 'private' && b.scope === 'private') {

					if (a.type === 'v4' && b.type === 'v4') return 0;
					if (a.type === 'v4') return -1;
					if (b.type === 'v4') return  1;

				}

				if (a.scope === 'private') return -1;
				if (b.scope === 'private') return  1;

				if (a.type === 'v4' && b.type === 'v4') return 0;
				if (a.type === 'v4') return -1;
				if (b.type === 'v4') return  1;

				return 0;

			});

			if (hosts.length > 0) {

				let check = hosts.find((ip) => ip.scope === 'private') || null;
				if (check === null) {
					ref = URL.parse('wss://' + host + ':65432');
				}

				this.ref = ref;

				if (ref.protocol === 'wss') {
					this.connection = WSS.connect(this.ref, null);
				} else if (ref.protocol === 'ws') {
					this.connection = WS.connect(this.ref, null);
				}


				this.connection.on('@connect', (socket) => {

					this.address = socket.remoteAddress || null;

					if (callback !== null) {
						callback(true);
						callback = null;
					}

				});

				this.connection.on('response', (response) => {

					if (response !== null) {

						let event   = response.headers.event   || null;
						let method  = response.headers.method  || null;
						let session = response.headers.session || null;
						let service = response.headers.service || null;

						if (session !== null) {
							this.emit('session', [ session ]);
						}

						if (service !== null && event !== null) {

							let instance = this.services[service] || null;
							if (instance !== null) {

								let socket  = this.connection.socket || null;
								let request = instance.emit(event, [ response.payload ]);

								if (socket !== null && request !== null) {

									if (ref.protocol === 'wss') {
										WSS.send(socket, request);
									} else if (ref.protocol === 'ws') {
										WS.send(socket, request);
									}

								}

							} else {

								let socket  = this.connection.socket || null;
								let request = this.emit('response', [ response ]);

								if (socket !== null && request !== null) {

									if (ref.protocol === 'wss') {
										WSS.send(socket, request);
									} else if (ref.protocol === 'ws') {
										WS.send(socket, request);
									}

								}

							}

						} else if (service !== null && method !== null) {

							let instance = this.services[service] || null;
							if (instance !== null && Function.isFunction(instance[method])) {

								instance[method](response.payload, (request) => {

									let socket = this.connection.socket || null;
									if (socket !== null && request !== null) {

										if (ref.protocol === 'wss') {
											WSS.send(socket, request);
										} else if (ref.protocol === 'ws') {
											WS.send(socket, request);
										}

									}

								});

							} else {

								let request = this.emit('response', [ response ]);
								if (request !== null) {

									let socket = this.connection.socket || null;
									if (socket !== null && request !== null) {

										if (ref.protocol === 'wss') {
											WSS.send(socket, request);
										} else if (ref.protocol === 'ws') {
											WS.send(socket, request);
										}

									}

								}

							}

						}

					}

				});

				this.connection.on('timeout', () => {

					this.disconnect();

					if (callback !== null) {
						callback(false);
						callback = null;
					}

				});

				this.connection.on('@disconnect', () => {

					this.disconnect();
					this.emit('session', [ null ]);

				});

				return true;

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

	disconnect: function(callback) {

		callback = isFunction(callback) ? callback : null;


		let connection = this.connection;
		if (connection !== null) {

			this.connection = null;


			let socket = connection.socket || null;
			if (socket !== null) {
				socket.end();
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

	},

	send: function(data) {

		data = isObject(data) ? data : null;


		if (data !== null) {

			if (this.connection !== null && this.ref !== null) {

				let socket = this.connection.socket || null;
				if (socket !== null) {

					if (this.ref.protocol === 'wss') {
						WSS.send(socket, data);
					} else if (this.ref.protocol === 'ws') {
						WS.send(socket, data);
					}

				}

				return true;

			}

		}


		return false;

	}

});


export { Client };

