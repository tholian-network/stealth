
import { console } from './console.mjs';
import { Request } from './Request.mjs';
import { WS      } from './protocol/WS.mjs';



let _id = 1;

const Session = function(data) {

	let settings = Object.assign({
		headers: {}
	}, data);

	// settings.headers
	// settings.socket

	this.id       = _id++;
	this.browser  = 'Unknown';
	this.system   = 'Unknown';
	this.peer     = settings.peer   || null;
	this.socket   = settings.socket || null;
	this.tabs     = {};
	this.warnings = 0;


	let agent = settings.headers['user-agent'] || null;
	if (agent !== null) {

		if (/crios/.test(agent)) {
			this.browser = 'Chrome for iOS';
		} else if (/edge/.test(agent)) {
			this.browser = 'Edge';
		} else if (/android/.test(agent) && /silk\//.test(agent)) {
			this.browser = 'Silk';
		} else if (/chrome/.test(agent)) {
			this.browser = 'Chrome';
		} else if (/firefox/.test(agent)) {
			this.browser = 'Firefox';
		} else if (/android/.test(agent)) {
			this.browser = 'AOSP';
		} else if (/msie|trident/.test(agent)) {
			this.browser = 'IE';
		} else if (/safari\//.test(agent)) {
			this.browser = 'Safari';
		} else if (/applewebkit/.test(agent)) {
			this.browser = 'WebKit';
		}

		if (/android/.test(agent)) {
			this.system = 'Android';
		} else if (/iphone|ipad|ipod/.test(agent)) {
			this.system = 'iOS';
		} else if (/windows/.test(agent)) {
			this.system = 'Windows';
		} else if (/mac os x/.test(agent)) {
			this.system = 'Mac OS';
		} else if (/cros/.test(agent)) {
			this.system = 'Chrome OS';
		} else if (/linux/.test(agent)) {
			this.system = 'Linux';
		} else if (/firefox/.test(agent)) {
			this.system = 'Firefox OS';
		}

	}

};


Session.prototype = {

	get: function(url) {

		url = typeof url === 'string' ? url : null;


		if (url !== null) {

			let found = null;

			for (let id in this.tabs) {

				let requests = this.tabs[id];

				for (let r = 0, rl = requests.length; r < rl; r++) {

					let request = requests[r];
					if (request.url === url) {
						found = request;
						break;
					}

				}

				if (found !== null) {
					break;
				}

			}

			return found;

		}


		return null;

	},

	init: function() {

		let socket = this.socket || null;
		if (socket !== null) {

			WS.send(socket, {
				headers: {
					session: this.id
				},
				payload: null
			});

			console.log('session #' + this.id + ' connected.');

		}

	},

	track: function(request, tab) {

		request = request instanceof Request ? request : null;
		tab     = typeof tab === 'string'    ? tab     : 'default';


		if (request !== null && tab !== null) {

			let cache = this.tabs[tab] || null;
			if (cache === null) {
				cache = this.tabs[tab] = [];
			}

			if (cache.includes(request) === false) {

				request.on('connect', () => {
					console.log('session #' + this.id + ' tab #' + tab + ' requests ' + request.url);
				});

				request.on('progress', (response, progress) => {
					console.step('session #' + this.id + ' tab #' + tab + ' requests ' + request.url + ' (' + progress.bytes + '/' + progress.length + ')');
				});

				request.on('error', () => {

					let index = cache.indexOf(request);
					if (index !== -1) {
						cache.splice(index, 1);
					}

				});

				request.on('response', () => {

					let index = cache.indexOf(request);
					if (index !== -1) {
						cache.splice(index, 1);
					}

				});


				cache.push(request);

			}

		}

	},

	warn: function(service, method, event) {

		service = typeof service === 'string' ? service : null;
		method  = typeof method === 'string'  ? method  : null;
		event   = typeof event === 'string'   ? event   : null;


		this.warnings++;


		if (service !== null) {

			if (method !== null) {
				console.warn('session #' + this.id + ' received warning #' + this.warnings + ' for ' + service + '.' + method + '() call.');
			} else if (event !== null) {
				console.warn('session #' + this.id + ' received warning #' + this.warnings + ' for ' + service + '@' + event + ' call.');
			} else {
				console.warn('session #' + this.id + ' received warning #' + this.warnings + ' for ' + service + ' abuse.');
			}

		} else {
			console.warn('session #' + this.id + ' received warning #' + this.warnings + '.');
		}


		if (this.warnings >= 3) {
			this.kill();
		}

	},

	kill: function() {

		if (this.socket !== null) {

			this.socket.end();
			this.socket = null;


			for (let tab in this.tabs) {

				this.tabs[tab].forEach((request) => {
					console.log('session #' + this.id + ' tab #' + tab + ' remains ' + request.url);
				});

			}

			console.log('session #' + this.id + ' disconnected.');

		}

	}

};


export { Session };

