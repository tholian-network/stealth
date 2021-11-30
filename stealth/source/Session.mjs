
import { console, isArray, isBoolean, isObject, isString } from '../extern/base.mjs';
import { isStealth                                       } from '../source/Stealth.mjs';
import { Tab                                             } from '../source/Tab.mjs';
import { DATETIME                                        } from '../source/parser/DATETIME.mjs';
import { IP                                              } from '../source/parser/IP.mjs';
import { UA                                              } from '../source/parser/UA.mjs';



export const isSession = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Session]';
};



const Session = function(stealth) {

	stealth = isStealth(stealth) ? stealth : null;


	this.domain   = 'session-' + Date.now() + '.tholian.local';
	this.hosts    = [];
	this.stealth  = stealth;
	this.tabs     = [];
	this.ua       = null;
	this.warnings = [];

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

			if (isArray(data.hosts) === true) {
				session.hosts = data.hosts.map((host) => {
					return IP.parse(host);
				}).filter((ip) => {
					return IP.isIP(ip) === true;
				});
			}

			if (isArray(data.tabs) === true) {
				session.tabs = data.tabs.map((data) => {
					return Tab.from(data);
				}).filter((tab) => tab !== null);
			}

			if (UA.isUA(data.ua) === true) {
				session.ua = data.ua;
			}

			if (isArray(data.warnings) === true) {
				session.warnings = data.warnings.map((warning) => {
					return {
						date:   DATETIME.parse(warning.date),
						time:   DATETIME.parse(warning.time),
						origin: warning.origin,
						reason: warning.reason
					};
				}).filter((warning) => {

					if (
						DATETIME.isDate(warning.date) === true
						&& DATETIME.isTime(warning.time) === true
						&& isString(warning.origin) === true
						&& (isObject(warning.reason) === true || warning.reason === null)
					) {
						return true;
					}

					return false;

				});
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

		if (
			(
				isString(target.domain) === true
				&& target.domain.startsWith('session-') === true
				&& target.domain.endsWith('.tholian.local') === true
			) && (
				isString(source.domain) === true
				&& source.domain.startsWith('session-') === false
			)
		) {
			target.domain = source.domain;
		}

		if (isArray(source.hosts) === true) {

			source.hosts.forEach((host) => {

				let found = target.hosts.find((h) => h.ip === host.ip) || null;
				if (found === null) {
					target.hosts.push(host);
				}

			});

			target.hosts.sort((a, b) => {
				return IP.compare(a, b);
			});

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

			target.tabs.sort((a, b) => {

				if (a.id < b.id) return -1;
				if (b.id < a.id) return  1;

				return 0;

			});

		}

		if (target.ua === null && UA.isUA(source.ua) === true) {
			target.ua = source.ua;
		}

		if (isArray(source.warnings) === true) {

			source.warnings.forEach((warning) => {
				target.warnings.push(warning);
			});

			target.warnings.sort((a, b) => {

				let cmp_date = DATETIME.compare(a.date, b.date);
				if (cmp_date === 0) {

					let cmp_time = DATETIME.compare(a.time, b.time);
					if (cmp_time === 0) {

						if (a.origin < b.origin) return -1;
						if (b.origin < a.origin) return  1;

						return 0;

					} else {
						return cmp_time;
					}

				} else {
					return cmp_date;
				}

			});

		}

	}


	return target;

};


Session.prototype = {

	[Symbol.toStringTag]: 'Session',

	toJSON: function() {

		let data = {
			domain:   this.domain,
			hosts:    [],
			tabs:     [],
			ua:       this.ua,
			warnings: []
		};

		if (this.hosts.length > 0) {
			this.hosts.forEach((ip) => {
				data.hosts.push(IP.render(ip));
			});
		}

		if (this.tabs.length > 0) {
			this.tabs.forEach((tab) => {
				data.tabs.push(tab.toJSON());
			});
		}

		if (this.warnings.length > 0) {
			this.warnings.forEach((warning) => {
				data.warnings.push({
					date:   DATETIME.render(warning.date),
					time:   DATETIME.render(warning.time),
					origin: warning.origin,
					reason: warning.reason
				});
			});
		}

		return {
			'type': 'Session',
			'data': data
		};

	},

	forget: function(until, force) {

		until = isString(until)  ? until : null;
		force = isBoolean(force) ? force : false;


		if (until !== null) {

			if (this.tabs.length > 0) {

				for (let t = 0, tl = this.tabs.length; t < tl; t++) {

					let tab = this.tabs[t];

					tab.forget(until, force);

					if (tab.history.length === 0) {

						this.tabs.splice(t, 1);
						tl--;
						t--;

					}

				}

			}


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

				for (let w = 0, wl = this.warnings.length; w < wl; w++) {

					let clear = false;
					let event = this.warnings[w];

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
						this.warnings.splice(w, 1);
						wl--;
						w--;
					}

				}

				return true;

			}

		}


		return false;

	},

	warn: function(origin, reason) {

		origin = isString(origin) ? origin : null;
		reason = isObject(reason) ? reason : null;


		if (origin !== null) {

			let datetime = DATETIME.parse(new Date());

			this.warnings.push({
				date:   DATETIME.toDate(datetime),
				time:   DATETIME.toTime(datetime),
				origin: origin,
				reason: reason
			});

			if (this.stealth !== null && this.stealth._settings.debug === true) {
				console.warn('Session: "' + this.domain + '" received warning #' + this.warnings.length + ' from "' + origin + '".');
			}

		}

	}

};


export { Session };

