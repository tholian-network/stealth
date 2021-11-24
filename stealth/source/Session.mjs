
import { console, isArray, isNumber, isObject, isString } from '../extern/base.mjs';
import { isRequest                                      } from '../source/Request.mjs';
import { isStealth                                      } from '../source/Stealth.mjs';
import { Tab                                            } from '../source/Tab.mjs';
import { IP                                             } from '../source/parser/IP.mjs';
import { UA                                             } from '../source/parser/UA.mjs';



export const isSession = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Session]';
};

const toUserAgent = function(platform) {

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

		useragent = null;

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


	this.domain  = Date.now() + '.tholian.network';
	this.stealth = stealth;
	this.tabs    = [];
	this.ua      = null;
	this.warning = 0;

};


Session.from = function(json) {

	json = isObject(json) ? json : null;


	if (json !== null) {

		let type = json.type === 'Session' ? json.type : null;
		let data = isObject(json.data)     ? json.data : null;

		if (type !== null && data !== null) {

			let session = new Session();

			if (isString(data.domain) === true) {
				session.domain = data.domain;
			}

			if (isArray(data.tabs) === true) {
				session.tabs = data.tabs.map((data) => Tab.from(data)).filter((tab) => tab !== null);
			}

			if (UA.isUA(data.ua) === true) {
				session.ua = data.ua;
			}

			if (isNumber(data.warning) === true) {
				session.warning = data.warning;
			}

			return session;

		}

	}


	return null;

};


Session.isSession = isSession;


Session.merge = function(target, source) {

	target = isSession(target) ? target : null;
	source = isSession(source) ? source : null;


	if (target !== null && source !== null) {

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

		if (UA.isUA(source.ua) === true) {
			target.ua = source.ua;
		}

	}


	return target;

};


Session.prototype = {

	[Symbol.toStringTag]: 'Session',

	toJSON: function() {

		let data = {
			domain:  this.domain,
			tabs:    this.tabs.map((tab) => tab.toJSON()),
			ua:      this.ua,
			warning: this.warning
		};

		return {
			'type': 'Session',
			'data': data
		};

	},

	destroy: function() {

		this.tabs.forEach((tab) => {

			tab.requests.forEach((request) => {

				console.log('Session "' + this.domain + '" tab #' + tab.id + ' remains "' + request.url.link + '".');
				request.off('progress');

			});

			tab.destroy();

		});


		this.domain  = Date.now() + '.tholian.network';
		this.stealth = null;
		this.tabs    = [];
		this.ua      = null;
		this.warning = 0;


		return true;

	},

	dispatch: function(headers) {

		headers = isObject(headers) ? headers : null;


		if (headers !== null) {

			let domain = headers['domain'] || null;
			if (domain !== null) {
				this.domain = domain;
			}

			if (this.domain.endsWith('.tholian.network') === true) {

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
				this.ua = UA.parse(headers['user-agent']);
			}

			return true;

		}


		return false;

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

			if (tab.includes(request) === false) {

				request.once('start', () => {

					if (request.ua === null) {

						let useragent = null;

						if (this.stealth !== null) {
							useragent = toUserAgent(this.stealth.settings.useragent || 'stealth');
						}

						request.ua = useragent;

					}

				});

				request.on('progress', (frame, progress) => {
					console.log('Session "' + this.domain + '" tab #' + tab.id + ' requests "' + request.url.link + '" (' + progress.bytes + '/' + progress.total + ').');
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

		if (this.warning > 3) {
			this.destroy();
		}


		return true;

	}

};


export { Session };

