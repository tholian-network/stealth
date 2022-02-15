
import { Emitter, isArray, isFunction, isObject, isString } from '../../../extern/base.mjs';
import { DATETIME                                         } from '../../../source/parser/DATETIME.mjs';
import { URL                                              } from '../../../source/parser/URL.mjs';
import { isBeacon                                         } from '../../../source/server/service/Beacon.mjs';
import { isEcho                                           } from '../../../source/server/service/Echo.mjs';



const REPEAT = [ 'minutely', 'hourly', 'daily', 'weekly', 'monthly' ];
const TYPE   = [ 'download', 'request', 'beacon', 'echo' ];

const toDomain = function(payload) {

	let domain = null;

	if (isObject(payload) === true) {

		if (isString(payload.domain) === true) {

			if (isString(payload.subdomain) === true) {
				domain = payload.subdomain + '.' + payload.domain;
			} else {
				domain = payload.domain;
			}

		} else if (isString(payload.host) === true) {
			domain = payload.host;
		}

	}

	return domain;

};



const Task = function(stealth) {

	this.stealth = stealth;
	Emitter.call(this);

};


/*
 * {
 *   "domain": "example.com",
 *   "tasks": [{
 *     "url":    "https://example.com/index.html",
 *     "type":   "download" || "request" || "beacon" || "echo",
 *     "beacon": null || {},
 *     "echo":   null || {},
 *     "start":  "2021-12-31 12:00:00",
 *     "stop":   "2021-12-31 23:59:59",
 *     "repeat": "minutely" || "hourly" || "daily" || "weekly" || "monthly" || null
 *   }]
 * }
 */

Task.isTask = function(payload) {

	if (
		isObject(payload) === true
		&& isString(payload.domain) === true
		&& isArray(payload.tasks) === true
	) {

		let check = payload.tasks.filter((task) => {

			if (
				isObject(task) === true
				&& isString(task.url) === true
				&& (isBeacon(task.beacon) === true || task.beacon === null)
				&& (isEcho(task.echo) === true || task.echo === null)
				&& ((isString(task.repeat) === true && REPEAT.includes(task.repeat) === true) || task.repeat === null)
				&& isString(task.start) === true
				&& isString(task.stop) === true
				&& (isString(task.type) === true && TYPE.includes(task.type) === true)
			) {

				let url   = URL.parse(task.url);
				let start = DATETIME.parse(task.start);
				let stop  = DATETIME.parse(task.stop);

				if (
					URL.isURL(url) === true
					&& (url.protocol === 'https' || url.protocol === 'http')
					&& DATETIME.isDATETIME(start) === true
					&& DATETIME.isDATETIME(stop) === true
					&& DATETIME.compare(start, stop) === -1
				) {
					return true;
				}

			}

			return false;

		});

		if (check.length === payload.tasks.length) {
			return true;
		}

	}


	return false;

};

Task.toTask = function(payload) {

	if (isObject(payload) === true) {

		let domain = null;

		if (isString(payload.domain) === true) {

			if (isString(payload.subdomain) === true) {
				domain = payload.subdomain + '.' + payload.domain;
			} else {
				domain = payload.domain;
			}

		} else if (isString(payload.host) === true) {
			domain = payload.host;
		}

		if (domain !== null && isArray(payload.tasks) === true) {

			let check = payload.tasks.filter((task) => {

				if (
					isObject(task) === true
					&& isString(task.url) === true
					&& (isBeacon(task.beacon) === true || task.beacon === null)
					&& (isEcho(task.echo) === true || task.echo === null)
					&& ((isString(task.repeat) === true && REPEAT.includes(task.repeat) === true) || task.repeat === null)
					&& isString(task.start) === true
					&& isString(task.stop) === true
					&& (isString(task.type) === true && TYPE.includes(task.type) === true)
				) {

					let url   = URL.parse(task.url);
					let start = DATETIME.parse(task.start);
					let stop  = DATETIME.parse(task.stop);

					if (
						URL.isURL(url) === true
						&& (url.protocol === 'https' || url.protocol === 'http')
						&& DATETIME.isDATETIME(start) === true
						&& DATETIME.isDATETIME(stop) === true
						&& DATETIME.compare(start, stop) === -1
					) {
						return true;
					}

				}

				return false;

			});

			if (check.length === payload.tasks.length) {

				return {
					domain: domain,
					tasks:  payload.tasks.map((task) => ({
						url:    task.url,
						beacon: isBeacon(task.beacon) ? task.beacon : null,
						echo:   isEcho(task.echo)     ? task.echo   : null,
						repeat: isString(task.repeat) ? task.repeat : null,
						start:  task.start,
						stop:   task.stop,
						type:   task.type
					}))
				};

			}

		}

	}


	return null;

};


Task.prototype = Object.assign({}, Emitter.prototype, {

	toJSON: function() {

		let blob = Emitter.prototype.toJSON.call(this);
		let data = {
			events:  blob.data.events,
			journal: blob.data.journal
		};

		return {
			'type': 'Task Service',
			'data': data
		};

	},

	read: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		let task   = null;
		let domain = toDomain(payload);
		if (domain !== null) {
			task = this.stealth.settings.tasks.find((t) => t.domain === domain) || null;
		}


		if (callback !== null) {

			callback({
				headers: {
					service: 'task',
					event:   'read'
				},
				payload: task
			});

		}

	},

	remove: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		let task   = null;
		let domain = toDomain(payload);
		if (domain !== null) {
			task = this.stealth.settings.tasks.find((t) => t.domain === domain) || null;
		}

		if (task !== null) {
			this.stealth.settings.tasks.remove(task);
			this.stealth.settings.save();
		}


		if (callback !== null) {

			callback({
				headers: {
					service: 'task',
					event:   'remove'
				},
				payload: (task !== null)
			});

		}

	},

	save: function(payload, callback) {

		callback = isFunction(callback) ? callback : null;


		let task_old = null;
		let task_new = Task.toTask(payload);

		let domain = toDomain(payload);
		if (domain !== null) {
			task_old = this.stealth.settings.tasks.find((t) => t.domain === domain) || null;
		}

		if (task_new !== null) {

			if (task_old !== null) {
				task_old.tasks = task_new.tasks;
			} else {
				this.stealth.settings.tasks.push(task_new);
			}

			this.stealth.settings.save();

		}


		if (callback !== null) {

			callback({
				headers: {
					service: 'task',
					event:   'save'
				},
				payload: (task_new !== null)
			});

		}

	}

});


export { Task };

