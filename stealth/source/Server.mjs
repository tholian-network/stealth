
import net from 'net';

import { isFunction, isString } from './POLYFILLS.mjs';

import { console  } from './console.mjs';
import { REDIRECT } from './other/REDIRECT.mjs';
import { ROUTER   } from './other/ROUTER.mjs';
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



export const handle_request = function(socket, ref) {

	let cookie = (ref.headers['cookie'] || '');
	let url    = (ref.headers['@url'] || '');
	let flags  = [];
	let tab    = null;

	if (url.startsWith('https://') || url.startsWith('http://')) {

		flags.push('proxy');

	} else if (url.startsWith('/stealth')) {

		if (url.startsWith('/stealth:')) {

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

	}


	let session = get_session_from_cookie.call(this, cookie);
	let request = this.stealth.open(url);
	if (request !== null) {

		if (session !== null) {
			session.track(request, tab);
		}

		request.on('error', (err) => {

			let type = err.type || null;
			if (type !== null) {

				ROUTER.error({
					address: socket.localAddress || null,
					url:     url,
					code:    err.code  || null,
					type:    err.type  || null,
					cause:   err.cause || null,
					flags:   request.flags
				}, (response) => HTTP.send(socket, response));

			} else {

				ROUTER.error({
					code: err.code || null
				}, (response) => HTTP.send(socket, response));

			}

		});

		request.on('redirect', (response) => {

			let url = response.headers['location'] || '';

			if (request.flags.webview === true) {

				let path = '/stealth/' + url;
				if (tab !== null) {
					path = '/stealth/:' + tab + ',webview:/' + url;
				}

				REDIRECT.send({
					code: 301,
					path: path
				}, (response) => HTTP.send(socket, response));

			} else {

				let path = '/stealth/' + url;
				if (tab !== null) {
					path = '/stealth/:' + tab + ':/' + url;
				}

				REDIRECT.send({
					code: 301,
					path: path
				}, (response) => HTTP.send(socket, response));

			}

		});

		request.on('response', (response) => {

			// TODO: Replace URLs inside HTML and CSS with "/stealth/tab:" prefix

			if (response !== null && response.payload !== null) {

				// Strip out all unnecessary HTTP headers
				response.headers = {
					'content-length': response.headers['content-length'],
					'content-type':   response.headers['content-type']
				};

				HTTP.send(socket, response);

			} else {

				ROUTER.error({
					code: 404
				}, (response) => HTTP.send(socket, response));

			}

		});

		if (flags.includes('proxy')) {
			request.set('proxy', true);
		}

		if (flags.includes('refresh')) {
			request.set('refresh', true);
		}

		if (flags.includes('webview')) {
			request.set('webview', true);
		}


		// TODO: request.init();

	} else {
		ROUTER.error({ code: 404 }, (response) => HTTP.send(socket, response));
	}

};


export const handle_websocket = function(socket, ref) {

	let connection = WS.upgrade(socket, ref);
	if (connection !== null) {

		connection.on('@connect', () => {

			let session = new Session({
				headers: ref.headers,
				socket:  socket
			});

			this.stealth.sessions.push(session);

			session.init();

		});

		connection.on('error', () => {

			let session = connection.session || null;
			if (session !== null) {

				let index = this.stealth.sessions.indexOf(session);
				if (index !== -1) {
					this.stealth.sessions.splice(index, 1);
				}

				connection.session = null;
				session.kill();

			}

		});

		connection.on('timeout', () => {

			let session = connection.session || null;
			if (session !== null) {

				let index = this.stealth.sessions.indexOf(session);
				if (index !== -1) {
					this.stealth.sessions.splice(index, 1);
				}

				connection.session = null;
				session.kill();

			}

		});

		connection.on('request', (request) => {

			let event   = request.headers.event   || null;
			let method  = request.headers.method  || null;
			let service = request.headers.service || null;

			if (service !== null && event !== null) {

				let instance = this.services[service] || null;
				if (instance !== null) {

					let response = instance.emit(event, [ request.payload ]);
					if (response !== null) {
						WS.send(socket, response);
					}

					if (response !== null && response._warn_ === true) {

						let session = connection.session || null;
						if (session !== null) {
							session.warn(service, method, null);
						}

					}

				}

			} else if (service !== null && method !== null) {

				let instance = this.services[service] || null;
				if (instance !== null && isFunction(instance[method])) {

					instance[method](request.payload, (response) => {

						if (response !== null) {
							WS.send(socket, response);
						}

						if (response !== null && response._warn_ === true) {

							let session = connection.session || null;
							if (session !== null) {
								session.warn(service, method, null);
							}

						}

					});

				}

			}

		});

		connection.on('@disconnect', () => {

			let session = connection.session || null;
			if (session !== null) {

				let index = this.stealth.sessions.indexOf(session);
				if (index !== -1) {
					this.stealth.sessions.splice(index, 1);
				}

				connection.session = null;
				session.kill();

			}

		});

	} else {

		socket.end();

	}

};



const get_session_from_cookie = function(cookie) {

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

	connect: function(host, callback) {

		host     = isString(host)       ? host     : null;
		callback = isFunction(callback) ? callback : null;


		if (this.__server !== null) {

			if (callback !== null) {
				callback(true);
			}

			return true;

		}


		this.__server = new net.Server({
			allowHalfOpen:  true,
			pauseOnConnect: true
		});

		this.__server.on('connection', (socket) => {

			socket.once('data', (data) => {

				HTTP.receive(socket, data, (request) => {

					request.headers['@address'] = socket.localAddress || null;


					let url  = (request.headers['@url'] || '');
					let tmp1 = (request.headers['connection'] || '').toLowerCase();
					let tmp2 = (request.headers['upgrade'] || '').toLowerCase();

					if (tmp1 === 'upgrade' && tmp2 === 'websocket') {
						handle_websocket.call(this, socket, request);
					} else if (url.startsWith('https://') || url.startsWith('http://') || url.startsWith('/stealth')) {
						handle_request.call(this, socket, request);
					} else {
						ROUTER.send(request, (response) => HTTP.send(socket, response));
					}

				});

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
			console.info('Stealth Service started on http+ws://' + host + ':65432' + '.');
			this.__server.listen(65432, host);
		} else {
			console.info('Stealth Service started on http+ws://localhost:65432' + '.');
			this.__server.listen(65432, null);
		}


		if (callback !== null) {
			callback(true);
		}

		return true;

	},

	disconnect: function(callback) {

		callback = isFunction(callback) ? callback : null;


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


