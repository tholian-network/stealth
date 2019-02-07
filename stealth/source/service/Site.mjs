
import { Emitter } from '../Emitter.mjs';



const _payloadify = function(payload) {

	if (payload instanceof Object) {

		payload.domain    = typeof payload.domain === 'string'    ? payload.domain    : null;
		payload.subdomain = typeof payload.subdomain === 'string' ? payload.subdomain : null;
		payload.host      = typeof payload.host === 'string'      ? payload.host      : null;

		if (payload.mode instanceof Object) {

			payload.mode.text  = typeof payload.mode.text === 'boolean'  ? payload.mode.text  : false;
			payload.mode.image = typeof payload.mode.image === 'boolean' ? payload.mode.image : false;
			payload.mode.audio = typeof payload.mode.audio === 'boolean' ? payload.mode.audio : false;
			payload.mode.video = typeof payload.mode.video === 'boolean' ? payload.mode.video : false;
			payload.mode.other = typeof payload.mode.other === 'boolean' ? payload.mode.other : false;

		}

		return payload;

	}


	return null;

};



const Site = function(stealth) {

	Emitter.call(this);


	this.stealth = stealth;

};


Site.prototype = Object.assign({}, Emitter.prototype, {

	read: function(payload, callback) {

		payload  = payload instanceof Object      ? _payloadify(payload) : null;
		callback = typeof callback === 'function' ? callback             : null;


		if (payload !== null && callback !== null) {

			let site     = null;
			let settings = this.stealth.settings;

			if (payload.domain !== null) {

				let subdomain = payload.subdomain || null;
				if (subdomain !== null) {
					site = settings.sites.find(s => s.domain === payload.subdomain + '.' + payload.domain) || null;
				} else{
					site = settings.sites.find(s => s.domain === payload.domain) || null;
				}

			}


			callback({
				headers: {
					service: 'site',
					event:   'read'
				},
				payload: site
			});

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'site',
					event:   'read'
				},
				payload: null
			});

		}

	},

	remove: function(payload, callback) {

		payload  = payload instanceof Object      ? _payloadify(payload) : null;
		callback = typeof callback === 'function' ? callback             : null;


		if (payload !== null && callback !== null) {

			let site     = null;
			let settings = this.stealth.settings;

			if (payload.domain !== null) {

				let subdomain = payload.subdomain || null;
				if (subdomain !== null) {
					site = settings.sites.find(s => s.domain === payload.subdomain + '.' + payload.domain) || null;
				} else{
					site = settings.sites.find(s => s.domain === payload.domain) || null;
				}

			}


			if (site !== null) {

				let index = settings.sites.indexOf(site);
				if (index !== -1) {
					settings.sites.splice(index, 1);
				}

				settings.save();

			}

			callback({
				headers: {
					service: 'site',
					event:   'remove'
				},
				payload: true
			});

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'site',
					event:   'remove'
				},
				payload: false
			});

		}

	},

	save: function(payload, callback) {

		payload  = payload instanceof Object      ? _payloadify(payload) : null;
		callback = typeof callback === 'function' ? callback             : null;


		if (payload !== null && callback !== null) {

			let site     = null;
			let settings = this.stealth.settings;


			if (payload.domain !== null) {

				let subdomain = payload.subdomain || null;
				if (subdomain !== null) {
					site = settings.sites.find(s => s.domain === payload.subdomain + '.' + payload.domain) || null;
				} else{
					site = settings.sites.find(s => s.domain === payload.domain) || null;
				}

			}


			if (site !== null) {

				site.mode.text  = payload.mode.text  || false;
				site.mode.image = payload.mode.image || false;
				site.mode.audio = payload.mode.audio || false;
				site.mode.video = payload.mode.video || false;
				site.mode.other = payload.mode.other || false;

				settings.save();

			} else if (payload.domain !== null) {

				if (payload.subdomain !== null) {
					payload.domain    = payload.subdomain + '.' + payload.domain;
					payload.subdomain = null;
				}

				site = {
					domain: payload.domain,
					mode:   {
						text:  payload.mode.text  || false,
						image: payload.mode.image || false,
						audio: payload.mode.audio || false,
						video: payload.mode.video || false,
						other: payload.mode.other || false
					}
				};

				settings.sites.push(site);
				settings.save();

			}


			callback({
				headers: {
					service: 'site',
					event:   'save'
				},
				payload: true
			});

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'site',
					event:   'save'
				},
				payload: false
			});

		}

	}

});


export { Site };

