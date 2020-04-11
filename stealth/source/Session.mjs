
import { console, isNumber, isObject, isString } from './BASE.mjs';
import { IP                                    } from './parser/IP.mjs';
import { UA                                    } from './parser/UA.mjs';
import { Request                               } from './Request.mjs';



const randomize_useragent = function(platform) {

	let useragent = null;

	if (platform === 'stealth') {

		useragent = null;

	} else if (platform === 'browser-desktop') {

		useragent = UA.render({
			platform: 'browser',
			system:   'desktop'
		});

	} else if (platform === 'browser-mobile') {

		useragent = UA.render({
			platform: 'browser',
			system:   'mobile'
		});

	} else if (platform === 'spider-desktop') {

		useragent = UA.render({
			platform: 'spider',
			system:   'desktop'
		});

	} else if (platform === 'spider-mobile') {

		useragent = UA.render({
			platform: 'spider',
			system:   'mobile'
		});

	} else {

		useragent = UA.render({});

	}

	return useragent;

};

const remove_request = function(request) {

	let history = {};

	for (let tid in this.tabs) {

		let tab = this.tabs[tid];

		for (let t = 0; t < tab.length; t++) {

			if (tab[t] === request) {

				if (request.flags.webview === true) {

					let entries = history[tid] || null;
					if (entries === null) {
						entries = history[tid] = [];
					}

					entries.push(request.toJSON());

				}

				tab.splice(t, 1);
				t--;

			}

		}

	}

	Object.keys(history).forEach((tab) => {

		history[tab].forEach((request) => {

			let entries = this.history[tab] || null;
			if (entries === null) {
				entries = this.history[tab] = [];
			}

			entries.push(request);

		});

	});

};



const Session = function(data, stealth) {

	let settings = Object.assign({}, data);


	this.domain = Date.now() + '.artificial.engineering';
	this.agent  = {
		engine:  null,
		system:  null,
		version: null
	};
	this.history = {};
	this.stealth = stealth;
	this.tabs    = {};
	this.warning = 0;

	this.set(settings);

};


Session.from = function(json) {

	json = isObject(json) ? json : null;


	if (json !== null) {

		let type = json.type === 'Session' ? json.type : null;
		let data = isObject(json.data)     ? json.data : null;

		if (type !== null && data !== null) {

			let session = new Session();

			if (isString(data.domain))  session.domain  = data.domain;
			if (isObject(data.agent))   session.agent   = data.agent;
			if (isNumber(data.warning)) session.warning = data.warning;

			if (isObject(data.history)) {

				for (let tab in data.history) {
					session.history[tab] = Array.from(data.history[tab]);
				}

			}

			return session;

		}

	}


	return null;

};


Session.merge = function(target, source) {

	target = target instanceof Session ? target : null;
	source = source instanceof Session ? source : null;


	if (target !== null && source !== null) {

		if (source.domain !== null) target.domain = source.domain;
		if (source.agent  !== null) target.agent  = source.agent;

		if (isObject(source.history)) {

			for (let tab in source.history) {

				let entries = target.history[tab] || null;
				if (entries === null) {
					entries = target.history[tab] = [];
				}

				source.history[tab].forEach((request) => {

					let found = target.history[tab].find((other) => other.id === request.id) || null;
					if (found === null) {
						target.history[tab].push(request);
					}

				});

			}

		}

	}


	return target;

};


Session.prototype = {

	toJSON: function() {

		let data = {
			domain:  this.domain,
			agent:   this.agent,
			history: {},
			tabs:    {},
			warning: this.warning
		};

		Object.keys(this.history).forEach((tab) => {
			data.history[tab] = this.history[tab];
		});

		Object.keys(this.tabs).forEach((tab) => {

			let requests = this.tabs[tab].filter((req) => req.flags.webview === true);
			if (requests.length > 0) {
				data.tabs[tab] = requests.map((req) => req.toJSON());
			}

		});

		return {
			type: 'Session',
			data: data
		};

	},

	get: function(url) {

		url = isString(url) ? url : null;


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

	init: function(request, tab) {

		request = request instanceof Request ? request : null;
		tab     = isString(tab)              ? tab     : '0';


		if (request !== null && tab !== null) {

			let cache = this.tabs[tab] || null;
			if (cache === null) {
				cache = this.tabs[tab] = [];
			}

			if (cache.includes(request) === false) {

				request.on('init', () => {

					let useragent = this.useragents[tab] || null;
					if (useragent === null) {
						useragent = this.useragents[tab] = randomize_useragent(this.stealth.settings.useragent);
					}

					request.set('useragent', useragent);

				});

				request.on('connect', () => {
					console.log('Session "' + this.domain + '" tab #' + tab + ' requests "' + request.url + '".');
				});

				request.on('progress', (response, progress) => {
					console.log('Session "' + this.domain + '" tab #' + tab + ' requests "' + request.url + '" (' + progress.bytes + '/' + progress.length + ').');
				});

				request.on('error',    () => remove_request.call(this, request));
				request.on('redirect', () => remove_request.call(this, request));
				request.on('response', () => remove_request.call(this, request));

				cache.push(request);

			}

		}

	},

	set: function(settings) {

		settings = isObject(settings) ? settings : {};


		let domain = settings['domain'] || null;
		if (domain !== null) {
			this.domain = domain;
		}

		if (this.domain.endsWith('.artificial.engineering')) {

			let address = settings['@remote'] || null;
			if (address !== null) {

				let ip = IP.parse(address);
				if (ip.type !== null) {
					this.domain = IP.render(ip);
				}

			}

		}

		if (this.agent.engine === null) {

			let agent = settings['user-agent'] || null;
			if (agent !== null) {
				this.agent = UA.parse(agent);
			}

		}

	},

	warn: function(service, method, event) {

		service = isString(service) ? service : null;
		method  = isString(method)  ? method  : null;
		event   = isString(event)   ? event   : null;


		this.warning++;


		if (service !== null) {

			if (method !== null) {
				console.warn('Session "' + this.domain + '" received warning #' + this.warning + ' for ' + service + '.' + method + '() call.');
			} else if (event !== null) {
				console.warn('Session "' + this.domain + '" received warning #' + this.warning + ' for ' + service + '@' + event + ' call.');
			} else {
				console.warn('Session "' + this.domain + '" received warning #' + this.warning + ' for ' + service + ' abuse.');
			}

		} else {
			console.warn('Session "' + this.domain + '" received warning #' + this.warning + '.');
		}


		if (this.warning >= 3) {
			this.kill();
		}

	},

	kill: function() {

		for (let tab in this.tabs) {

			this.tabs[tab].forEach((request) => {
				console.log('Session "' + this.domain + '" tab #' + tab + ' remains "' + request.url + '".');
			});

		}

		console.log('Session "' + this.domain + '" disconnected.');

	}

};


export { Session };

