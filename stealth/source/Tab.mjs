
import { isArray, isBoolean, isObject, isString } from '../extern/base.mjs';
import { DATETIME                               } from '../source/parser/DATETIME.mjs';
import { URL                                    } from '../source/parser/URL.mjs';
import { isMode                                 } from '../source/Browser.mjs';



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

const Tab = function(settings) {

	settings = isObject(settings) ? settings : {};


	settings = Object.freeze({
		id:   isString(settings.id)   ? settings.id   : ('' + CURRENT_ID++),
		mode: isMode(settings.mode)   ? settings.mode : null,
		url:  URL.isURL(settings.url) ? settings.url  : null
	});


	this.id       = settings.id;
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


	if (URL.isURL(settings.url) === true) {
		this.navigate(settings.url.link, settings.mode);
	}

	if (this.mode.domain === null) {

		let domain = URL.toDomain(settings.url);
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

				data.history.map((event) => {

					if (
						isObject(event) === true
						&& isString(event.date) === true
						&& isString(event.link) === true
						&& isString(event.time) === true
					) {

						let date = DATETIME.parse(event.date);
						let time = DATETIME.parse(event.time);
						let url  = URL.parse(event.link);

						if (
							DATETIME.isDate(date) === true
							&& DATETIME.isTime(time) === true
							&& URL.isURL(url) === true
						) {

							if (isMode(event.mode) === false) {

								let mode = {
									domain: URL.toDomain(url),
									mode: {
										text:  false,
										image: false,
										audio: false,
										video: false,
										other: false
									}
								};

								mode[url.mime.type] = true;

								event.mode = mode;

							}

							return {
								date: date,
								link: event.link,
								mode: event.mode,
								time: time
							};

						}

					}


					return null;

				}).filter((event) => {
					return event !== null;
				}).sort((a, b) => {

					let by_date = DATETIME.compare(a.date, b.date);
					if (by_date === 0) {
						return DATETIME.compare(a.time, b.time);
					} else {
						return by_date;
					}

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
					DATETIME.isDate(event.date) === true
					&& isString(event.link) === true
					&& isMode(event.mode) === true
					&& DATETIME.isTime(event.time) === true
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
				date: DATETIME.render(event.date),
				link: event.link,
				mode: event.mode,
				time: DATETIME.render(event.time)
			})),
			requests: this.requests.map((request) => request.toJSON()),
			url: URL.render(this.url)
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

	forget: function(until, force) {

		until = isString(until)  ? until : null;
		force = isBoolean(force) ? force : false;


		let limit = null;

		if (until === 'stealth') {
			limit = DATETIME.parse(new Date());
		} else if (until === 'day') {
			limit = DATETIME.parse(new Date(Date.now() - (1000 * 60 * 60 * 24)));
		} else if (until === 'week') {
			limit = DATETIME.parse(new Date(Date.now() - (1000 * 60 * 60 * 24 * 7)));
		} else if (until === 'month') {
			limit = DATETIME.parse(new Date(Date.now() - (1000 * 60 * 60 * 24 * 31)));
		} else if (until === 'forever') {
			limit = DATETIME.parse('1582-01-01 00:00:00');
		}

		if (limit !== null) {

			for (let h = 0, hl = this.history.length; h < hl; h++) {

				let clear = false;
				let event = this.history[h];

				let cmp_date = DATETIME.compare(event.date, DATETIME.toDate(limit));
				if (cmp_date === -1) {

					clear = true;

				} else if (cmp_date === 0) {

					let cmp_time = DATETIME.compare(event.time, DATETIME.toTime(limit));
					if (cmp_time === -1) {
						clear = true;
					}

				}

				if (clear === true) {
					this.history.splice(h, 1);
					hl--;
					h--;
				}

			}

			if (force === false && this.history.length === 0 && this.url !== null) {

				let datetime = DATETIME.parse(new Date());

				this.history.push({
					date: DATETIME.toDate(datetime),
					link: this.url.link,
					mode: this.mode,
					time: DATETIME.toTime(datetime)
				});

			}

			return true;

		}


		return false;

	},

	includes: function(request) {

		request = isRequest(request) ? request : null;


		if (request !== null) {

			if (this.requests.includes(request) === true) {
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


		let datetime = DATETIME.parse(new Date());

		this.history.push({
			date: DATETIME.toDate(datetime),
			link: this.url.link,
			mode: this.mode,
			time: DATETIME.toTime(datetime)
		});

	},

	navigate: function(link, mode) {

		link = isString(link) ? link : null;
		mode = isMode(mode)   ? mode : null;


		if (link !== null) {

			if (link.includes('./') === true || link.includes('../') === true) {
				link = URL.resolve(this.url, link).link;
			}


			let url = URL.parse(link);
			if (url.link !== this.url.link) {

				if (
					url.domain === this.url.domain
					|| (url.protocol === 'stealth' && this.url.protocol === 'stealth')
					|| this.url.protocol === 'stealth'
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

							} else if (this.url.protocol !== 'stealth') {

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


					let datetime = DATETIME.parse(new Date());

					this.history.push({
						date: DATETIME.toDate(datetime),
						link: this.url.link,
						mode: this.mode,
						time: DATETIME.toTime(datetime)
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

