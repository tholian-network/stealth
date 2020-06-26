
import { isArray, isBoolean, isNumber, isObject, isString } from '../extern/base.mjs';
import { URL                                              } from './parser/URL.mjs';



// Embedded for Cross-Platform Compatibility
const isConfig = function(config) {

	if (isObject(config) === true) {

		if (
			(isString(config.domain) === true || config.domain === null)
			&& isObject(config.mode) === true
		) {

			if (
				isBoolean(config.mode.text) === true
				&& isBoolean(config.mode.image) === true
				&& isBoolean(config.mode.audio) === true
				&& isBoolean(config.mode.video) === true
				&& isBoolean(config.mode.other) === true
			) {
				return true;
			}

		}

	}


	return false;

};

// Embedded for Cross-Platform Compatibility
const isRequest = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Request]';
};

export const isTab = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Tab]';
};

const search = function(url) {

	url = isString(url) ? url : null;


	if (url !== null) {

		let found = null;

		for (let h = 0, hl = this.history.length; h < hl; h++) {

			let event = this.history[h];
			if (event.url === url) {
				found = event;
				break;
			}

		}

		return found;

	}


	return null;

};



let CURRENT_ID = 0;

const Tab = function(data) {

	let settings = Object.assign({}, data);


	this.id       = settings.id || ('' + CURRENT_ID++);
	this.history  = [];
	this.config   = {
		domain: 'welcome',
		mode: {
			text:  true,
			image: true,
			audio: true,
			video: true,
			other: true
		}
	};
	this.ref      = URL.parse('stealth:welcome');
	this.requests = [];
	this.url      = 'stealth:welcome';


	let cfg = isConfig(settings.config) ? settings.config : null;
	let ref = URL.isURL(settings.ref)   ? settings.ref    : null;
	if (ref === null && isString(settings.url) === true) {
		ref = URL.parse(settings.url);
	}

	if (URL.isURL(ref) === true) {
		this.navigate(ref.url, cfg);
	}

	if (this.config.domain === null) {

		if (this.ref.domain !== null) {

			if (this.ref.subdomain !== null) {
				this.config.domain = this.ref.subdomain + '.' + this.ref.domain;
			} else {
				this.config.domain = this.ref.domain;
			}

		} else if (this.ref.host !== null) {
			this.config.domain = this.ref.host;
		}

	}

};


Tab.from = function(json) {

	json = isObject(json) ? json : null;


	if (json !== null) {

		let type = json.type === 'Tab' ? json.type : null;
		let data = isObject(json.data) ? json.data : null;

		if (type !== null && data !== null) {

			let tab = new Tab();

			if (isString(data.id) === true) {
				tab.id = data.id;
			}

			if (isArray(data.history) === true) {

				let filtered = [];

				data.history.forEach((event) => {

					if (
						isConfig(event.config) === true
						&& isNumber(event.time) === true
						&& isString(event.url) === true
					) {
						filtered.push(event);
					}

				});

				filtered.sort((a, b) => {
					if (a.time < b.time) return -1;
					if (b.time < a.time) return  1;
					return 0;
				}).forEach((event) => {
					tab.history.push(event);
				});

			}

			if (isArray(data.requests) === true) {
				// Do nothing
			}

			if (isString(data.url) === true && isConfig(data.config) === true) {
				tab.navigate(data.url, data.config);
			}

			return tab;

		}

	}


	return null;

};


Tab.isTab = isTab;


Tab.merge = function(target, source) {

	target = isTab(target) ? target : null;
	source = isTab(source) ? source : null;


	if (target !== null && source !== null) {

		if (isString(source.id) === true) {
			target.id = source.id;
		}

		if (isArray(source.history) === true) {

			source.history.forEach((event) => {

				if (
					isConfig(event.config) === true
					&& isNumber(event.time) === true
					&& isString(event.url) === true
				) {
					target.history.push(event);
				}

			});

		}

		if (isArray(source.requests) === true) {

			source.requests.forEach((request) => {

				if (isRequest(request) === true) {
					target.track(request);
				}

			});

		}

		if (isString(source.url) === true && isConfig(source.config) === true) {
			target.navigate(source.url, source.config);
		}

	}


	return target;

};


Tab.prototype = {

	[Symbol.toStringTag]: 'Tab',

	toJSON: function() {

		let data = {
			id: this.id,
			config: {
				domain: this.config.domain,
				mode: {
					text:  this.config.mode.text,
					image: this.config.mode.image,
					audio: this.config.mode.audio,
					video: this.config.mode.video,
					other: this.config.mode.other
				}
			},
			history: this.history.map((event) => ({
				config: event.config,
				time:   event.time,
				url:    event.url
			})),
			requests: this.requests.map((request) => request.toJSON()),
			url:      this.url
		};


		return {
			type: 'Tab',
			data: data
		};

	},

	back: function() {

		let event = search.call(this, this.url);
		if (event !== null) {

			let index = this.history.indexOf(event);
			if (index > 0) {

				let tmp = this.history[index - 1] || null;
				if (tmp !== null) {

					this.config = tmp.config;
					this.ref    = URL.parse(tmp.url);
					this.url    = this.ref.url;

					return true;

				}

			}

		}


		return false;

	},

	can: function(action) {

		action = isString(action) ? action : null;


		if (action === 'back') {

			let event = search.call(this, this.url);
			if (event !== null) {

				let index = this.history.indexOf(event);
				if (index > 0) {
					return true;
				}

			}

		} else if (action === 'next') {

			let event = search.call(this, this.url);
			if (event !== null) {

				let index = this.history.indexOf(event);
				if (index < this.history.length - 1) {
					return true;
				}

			}

		} else if (action === 'pause') {

			let loading = this.requests.find((request) => {

				if (
					request.timeline.start !== null
					&& request.timeline.error === null
					&& request.timeline.redirect === null
					&& request.timeline.response === null
				) {
					return true;
				}

				return false;

			}) || null;
			if (loading !== null) {
				return true;
			}

		}


		return false;

	},

	forget: function(until) {

		until = isString(until) ? until : null;


		let limit = null;

		if (until === 'stealth') {
			limit = Date.now();
		} else if (until === 'day') {
			limit = Date.now() - (1000 * 60 * 60 * 24);
		} else if (until === 'week') {
			limit = Date.now() - (1000 * 60 * 60 * 24 * 7);
		} else if (until === 'forever') {
			limit = 0;
		}

		if (limit !== null) {

			for (let h = 0, hl = this.history.length; h < hl; h++) {

				let event = this.history[h];
				if (event.time <= limit) {
					this.history.splice(h, 1);
					hl--;
					h--;
				}

			}

			if (this.history.length === 0 && this.url !== null) {
				this.history.push({
					config: this.config,
					time:   Date.now(),
					url:    this.url
				});
			}

			return true;

		}


		return false;

	},

	includes: function(request) {

		request = isRequest(request) ? request : null;


		if (request !== null) {

			if (this.requests.includes(request)) {
				return true;
			}

		}


		return false;

	},

	destroy: function() {

		this.requests.forEach((request) => {
			request.stop();
		});

		this.config = {
			domain: 'welcome',
			mode: {
				text:  true,
				image: true,
				audio: true,
				video: true,
				other: true
			}
		};

		this.history  = [];
		this.ref      = URL.parse('stealth:welcome');
		this.requests = [];
		this.url      = 'stealth:welcome';

		this.history.push({
			config: this.config,
			time:   Date.now(),
			url:    this.url
		});

	},

	navigate: function(url, config) {

		url    = isString(url)    ? url    : null;
		config = isConfig(config) ? config : null;


		if (url !== null) {

			if (url.includes('./') || url.includes('../')) {
				url = URL.resolve(this.url, url).url;
			}


			if (this.url !== url) {

				let ref = URL.parse(url);
				if (
					ref.domain === this.ref.domain
					|| (ref.protocol === 'stealth' && this.ref.protocol === 'stealth')
					|| this.url === 'stealth:welcome'
				) {

					let event1 = search.call(this, this.url);
					if (event1 !== null) {

						let index1 = this.history.indexOf(event1);
						if (index1 < this.history.length - 1) {
							this.history.splice(index1 + 1);
						}

					}

					let event2 = search.call(this, url);
					if (event2 !== null) {

						let index2 = this.history.indexOf(event2);
						if (index2 !== -1) {
							this.history.splice(index2, 1);
						}

					}


					if (config !== null) {

						this.config = config;

					} else {

						let domain = null;

						if (ref.domain !== null) {

							if (ref.subdomain !== null) {
								domain = ref.subdomain + '.' + ref.domain;
							} else {
								domain = ref.domain;
							}

						} else if (ref.host !== null) {
							domain = ref.host;
						}

						if (domain !== null) {

							if (ref.protocol === 'stealth') {

								this.config = {
									domain: domain,
									mode: {
										text:  true,
										image: true,
										audio: true,
										video: true,
										other: true
									}
								};

							} else if (this.url !== 'stealth:welcome') {

								this.config = {
									domain: domain,
									mode: {
										text:  this.config.mode.text,
										image: this.config.mode.image,
										audio: this.config.mode.audio,
										video: this.config.mode.video,
										other: this.config.mode.other
									}
								};

							} else {

								this.config = {
									domain: domain,
									mode: {
										text:  false,
										image: false,
										audio: false,
										video: false,
										other: false
									}
								};

							}

						} else {

							return false;

						}

					}

					this.ref = ref;
					this.url = this.ref.url;

					this.history.push({
						config: this.config,
						time:   Date.now(),
						url:    this.ref.url
					});

					return true;

				}

			}

		}


		return false;

	},

	next: function() {

		let event = search.call(this, this.url);
		if (event !== null) {

			let index = this.history.indexOf(event);
			if (index < this.history.length - 1) {

				let tmp = this.history[index + 1] || null;
				if (tmp !== null) {

					this.config = tmp.config;
					this.ref    = URL.parse(tmp.url);
					this.url    = this.ref.url;

					return true;

				}

			}

		}


		return false;

	},

	pause: function() {

		let requests = this.requests.filter((request) => {

			if (
				request.timeline.start !== null
				&& request.timeline.error === null
				&& request.timeline.redirect === null
				&& request.timeline.response === null
			) {

				return true;

			}

			return false;

		});


		if (requests.length > 0) {

			requests.forEach((request) => {
				request.stop();
			});

			return true;

		}


		return false;

	},

	track: function(request) {

		request = isRequest(request) ? request : null;


		if (request !== null) {

			if (this.requests.includes(request) === false) {
				this.requests.push(request);
			}

			return true;

		}


		return false;

	},

	untrack: function(request) {

		request = isRequest(request) ? request : null;


		if (request !== null) {

			for (let r = 0, rl = this.requests.length; r < rl; r++) {

				if (this.requests[r] === request) {
					this.requests.splice(r, 1);
					rl--;
					r--;
				}

			}

			return true;

		}


		return false;

	}

};


export { Tab };

