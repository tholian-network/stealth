
import { console, isArray, isNumber, isObject, isString } from '../extern/base.mjs';
import { IP                                             } from './parser/IP.mjs';
import { UA                                             } from './parser/UA.mjs';
import { isRequest                                      } from './Request.mjs';
import { isStealth                                      } from './Stealth.mjs';
import { Tab                                            } from './Tab.mjs';



export const isSession = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Session]';
};

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

	this.tabs.forEach((tab) => {

		if (tab.includes(request) === true) {
			tab.untrack(request);
		}

	});

};



const Session = function(stealth) {

	stealth = isStealth(stealth) ? stealth : null;


	this.agent   = null;
	this.domain  = Date.now() + '.tholian.network';
	this.stealth = stealth;
	this.tabs    = [];
	this.warning = 0;

};


Session.from = function(json) {

	json = isObject(json) ? json : null;


	if (json !== null) {

		let type = json.type === 'Session' ? json.type : null;
		let data = isObject(json.data)     ? json.data : null;

		if (type !== null && data !== null) {

			let session = new Session();

			if (UA.isUA(data.agent) === true) {
				session.agent = data.agent;
			}

			if (isString(data.domain) === true) {
				session.domain = data.domain;
			}

			if (isNumber(data.warning) === true) {
				session.warning = data.warning;
			}

			if (isArray(data.tabs) === true) {
				session.tabs = data.tabs.map((data) => Tab.from(data)).filter((tab) => tab !== null);
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

		if (UA.isUA(source.agent) === true) {
			target.agent = source.agent;
		}

		if (isString(source.domain) === true) {
			target.domain = source.domain;
		}

		if (isArray(source.tabs) === true) {

			source.tabs.forEach((tab) => {

				let other = target.tabs.find((t) => t.id === tab.id) || null;
				if (other !== null) {
					Tab.merge(other, tab);
				} else {
					target.tabs.push(tab);
				}

			});

		}

	}


	return target;

};


Session.isSession = isSession;


Session.prototype = {

	[Symbol.toStringTag]: 'Session',

	toJSON: function() {

		let data = {
			agent:   this.agent,
			domain:  this.domain,
			tabs:    this.tabs.map((tab) => tab.toJSON()),
			warning: this.warning
		};

		return {
			type: 'Session',
			data: data
		};

	},

	destroy: function() {

		this.tabs.forEach((tab) => {

			tab.requests.forEach((request) => {

				console.log('Session "' + this.domain + '" tab #' + tab.id + ' remains "' + request.url + '".');
				request.off('progress');

			});

			tab.destroy();

		});


		this.agent   = null;
		this.domain  = null;
		this.stealth = null;
		this.tabs    = [];
		this.warning = 0;

	},

	dispatch: function(headers) {

		headers = isObject(headers) ? headers : {};


		let domain = headers['domain'] || null;
		if (domain !== null) {
			this.domain = domain;
		}

		if (this.domain.endsWith('.tholian.network')) {

			let address = headers['@remote'] || null;
			if (address !== null) {

				let ip = IP.parse(address);
				if (ip.type !== null) {
					this.domain = IP.render(ip);
				}

			}

		}

		let useragent = headers['user-agent'] || null;
		if (useragent !== null) {
			this.agent = UA.parse(headers['user-agent']);
		}

	},

	get: function(url) {

		url = isString(url) ? url : null;


		if (url !== null) {

			let found = null;

			for (let t = 0, tl = this.tabs.length; t < tl; t++) {

				let tab = this.tabs[t];
				let req = tab.requests.find((request) => request.url === url) || null;
				if (req !== null) {
					found = req;
					break;
				}

			}

			return found;

		}


		return null;

	},

	track: function(request, tid) {

		request = isRequest(request) ? request : null;
		tid     = isString(tid)      ? tid     : '0';


		if (request !== null && tid !== null) {

			let tab = this.tabs.find((t) => t.id === tid) || null;
			if (tab === null) {
				tab = new Tab({ id: tid });
				this.tabs.push(tab);
			}

			if (request.get('webview') === true) {
				tab.navigate(request.url);
			}

			if (tab.includes(request) === false) {

				request.once('start', () => {

					if (request.get('useragent') === null) {

						let useragent = 'stealth';
						if (this.stealth !== null) {
							useragent = this.stealth.settings.useragent || 'stealth';
						}

						request.set('useragent', randomize_useragent(useragent));

					}

				});

				request.once('connect', () => {
					console.log('Session "' + this.domain + '" tab #' + tab.id + ' requests "' + request.url + '".');
				});

				request.on('progress', (response, progress) => {
					console.log('Session "' + this.domain + '" tab #' + tab.id + ' requests "' + request.url + '" (' + progress.bytes + '/' + progress.length + ').');
				});

				request.once('error',    () => remove_request.call(this, request));
				request.once('redirect', () => remove_request.call(this, request));
				request.once('response', () => remove_request.call(this, request));

				tab.track(request);


				return true;

			}

		}


		return false;

	},

	untrack: function(request, tid) {

		request = isRequest(request) ? request : null;
		tid     = isString(tid)      ? tid     : null;


		if (request !== null) {

			if (tid !== null) {

				let tab = this.tabs.find((t) => t.id === tid) || null;
				if (tab !== null) {

					if (tab.includes(request) === true) {
						request.off('progress');
						tab.untrack(request);
					}

				}

			} else {

				request.off('progress');

				this.tabs.forEach((tab) => {

					if (tab.includes(request) === true) {
						tab.untrack(request);
					}

				});

			}

			return true;

		}


		return false;

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
			this.destroy();
		}

	}

};


export { Session };

