
import { isArray, isNumber, isObject, isString } from '../extern/base.mjs';
import { UA                                    } from '../source/parser/UA.mjs';
import { Tab                                   } from '../source/Tab.mjs';



export const isSession = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Session]';
};



const Session = function() {

	this.agent   = null;
	this.domain  = Date.now() + '.tholian.network';
	this.stealth = null;
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


Session.isSession = isSession;


Session.merge = function(target, source) {

	target = isSession(target) ? target : null;
	source = isSession(source) ? source : null;


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
			'type': 'Session',
			'data': data
		};

	},

	destroy: function() {

		this.tabs.forEach((tab) => {
			tab.destroy();
		});


		this.agent   = null;
		this.domain  = Date.now() + '.tholian.network';
		this.stealth = null;
		this.tabs    = [];
		this.warning = 0;


		return true;

	}

};


export { Session };

