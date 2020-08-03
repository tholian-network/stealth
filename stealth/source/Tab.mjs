
import { isArray, isBoolean, isNumber, isObject, isString } from '../extern/base.mjs';
import { URL                                              } from './parser/URL.mjs';



// Embedded for Cross-Platform Compatibility
const isMode = function(payload) {

	if (
		isObject(payload) === true
		&& (isString(payload.domain) === true || payload.domain === null)
		&& isObject(payload.mode) === true
		&& isBoolean(payload.mode.text) === true
		&& isBoolean(payload.mode.image) === true
		&& isBoolean(payload.mode.audio) === true
		&& isBoolean(payload.mode.video) === true
		&& isBoolean(payload.mode.other) === true
	) {
		return true;
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

const search = function(link) {

	link = isString(link) ? link : null;


	if (link !== null) {

		let found = null;

		for (let h = this.history.length - 1; h >= 0; h--) {

			let event = this.history[h];
			if (event.link === link) {
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
	this.mode     = {
		domain: 'welcome',
		mode: {
			text:  true,
			image: true,
			audio: true,
			video: true,
			other: true
		}
	};
	this.url      = URL.parse('stealth:welcome');
	this.requests = [];


	let mode = isMode(settings.mode)   ? settings.mode : null;
	let url  = URL.isURL(settings.url) ? settings.url  : null;

	if (URL.isURL(url) === true) {
		this.navigate(url.link, mode);
	}

	if (this.mode.domain === null) {

		let domain = URL.toDomain(url);
		if (domain !== null) {
			this.mode.domain = domain;
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
						isString(event.link) === true
						&& isMode(event.mode) === true
						&& isNumber(event.time) === true
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

			if (isString(data.url) === true && isMode(data.mode) === true) {
				tab.navigate(data.url, data.mode);
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
					isString(event.link) === true
					&& isMode(event.mode) === true
					&& isNumber(event.time) === true
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

		if (isString(source.url) === true && isMode(source.mode) === true) {
			target.navigate(source.url, source.mode);
		}

	}


	return target;

};


Tab.prototype = {

	[Symbol.toStringTag]: 'Tab',

	toJSON: function() {

		let data = {
			id: this.id,
			mode: {
				domain: this.mode.domain,
				mode: {
					text:  this.mode.mode.text,
					image: this.mode.mode.image,
					audio: this.mode.mode.audio,
					video: this.mode.mode.video,
					other: this.mode.mode.other
				}
			},
			history: this.history.map((event) => ({
				link: event.link,
				mode: event.mode,
				time: event.time
			})),
			requests: this.requests.map((request) => request.toJSON()),
			url:      URL.render(this.url)
		};


		return {
			'type': 'Tab',
			'data': data
		};

	},

	back: function() {

		let event = search.call(this, this.url.link);
		if (event !== null) {

			let index = this.history.indexOf(event);
			if (index > 0) {

				let tmp = this.history[index - 1] || null;
				if (tmp !== null) {

					this.mode = tmp.mode;
					this.url  = URL.parse(tmp.link);

					return true;

				}

			}

		}


		return false;

	},

	can: function(action) {

		action = isString(action) ? action : null;


		if (action === 'back') {

			let event = search.call(this, this.url.link);
			if (event !== null) {

				let index = this.history.indexOf(event);
				if (index > 0) {
					return true;
				}

			}

		} else if (action === 'next') {

			let event = search.call(this, this.url.link);
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
					link: this.url.link,
					mode: this.mode,
					time: Date.now()
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

		this.mode = {
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
		this.url      = URL.parse('stealth:welcome');
		this.requests = [];

		this.history.push({
			mode: this.mode,
			time: Date.now(),
			link: this.url.link
		});

	},

	navigate: function(link, mode) {

		link = isString(link) ? link : null;
		mode = isMode(mode)   ? mode : null;


		if (link !== null) {

			if (link.includes('./') || link.includes('../')) {
				link = URL.resolve(this.url, link).link;
			}


			let url = URL.parse(link);
			if (url.link !== this.url.link) {

				if (
					url.domain === this.url.domain
					|| (url.protocol === 'stealth' && this.url.protocol === 'stealth')
					|| this.url.link === 'stealth:welcome'
				) {

					let event1 = search.call(this, this.url.link);
					if (event1 !== null) {

						let index1 = this.history.indexOf(event1);
						if (index1 < this.history.length - 1) {
							this.history.splice(index1 + 1);
						}

					}

					let event2 = search.call(this, url.link);
					if (event2 !== null) {

						let index2 = this.history.indexOf(event2);
						if (index2 !== -1) {
							this.history.splice(index2, 1);
						}

					}


					if (mode !== null) {

						this.mode = mode;

					} else {

						let domain     = null;
						let tmp_domain = URL.toDomain(url);
						let tmp_host   = URL.toHost(url);

						if (tmp_domain !== null) {
							domain = tmp_domain;
						} else if (tmp_host !== null) {
							domain = tmp_host;
						}

						if (domain !== null) {

							if (url.protocol === 'stealth') {

								this.mode = {
									domain: domain,
									mode: {
										text:  true,
										image: true,
										audio: true,
										video: true,
										other: true
									}
								};

							} else if (this.url.link !== 'stealth:welcome') {

								this.mode = {
									domain: domain,
									mode: {
										text:  this.mode.mode.text,
										image: this.mode.mode.image,
										audio: this.mode.mode.audio,
										video: this.mode.mode.video,
										other: this.mode.mode.other
									}
								};

							} else {

								this.mode = {
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

					this.url = url;

					this.history.push({
						link: this.url.link,
						mode: this.mode,
						time: Date.now(),
					});

					return true;

				}

			}

		}


		return false;

	},

	next: function() {

		let event = search.call(this, this.url.link);
		if (event !== null) {

			let index = this.history.indexOf(event);
			if (index < this.history.length - 1) {

				let tmp = this.history[index + 1] || null;
				if (tmp !== null) {

					this.mode = tmp.mode;
					this.url  = URL.parse(tmp.link);

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

