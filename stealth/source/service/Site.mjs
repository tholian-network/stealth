
import { MODES   } from '../Stealth.mjs';
import { Emitter } from '../Emitter.mjs';



const _get_mime = function(mode) {

	let mime = {
		text:  false,
		image: false,
		video: false,
		other: false
	};

	if (mode === 'online') {
		mime.text  = true;
		mime.image = true;
		mime.video = true;
		mime.other = true;
	} else if (mode === 'stealth') {
		mime.text  = true;
		mime.image = true;
		mime.video = true;
		mime.other = false;
	} else if (mode === 'covert') {
		mime.text  = true;
		mime.image = false;
		mime.video = false;
		mime.other = false;
	} else if (mode === 'offline') {
		mime.text  = false;
		mime.image = false;
		mime.video = false;
		mime.other = false;
	}

	return mime;

};

const _get_mode = function(text, image, video, other) {

	let mode = 'offline';

	if (other === true) {
		mode = 'online';
	} else if (image === true || video === true) {
		mode = 'stealth';
	} else if (text === true) {
		mode = 'covert';
	}

	return mode;

};

const _payloadify = function(payload) {

	if (payload instanceof Object) {

		payload.domain    = typeof payload.domain === 'string'    ? payload.domain    : null;
		payload.subdomain = typeof payload.subdomain === 'string' ? payload.subdomain : null;
		payload.host      = typeof payload.host === 'string'      ? payload.host      : null;

		if (payload.mime instanceof Object) {

			let text  = payload.mime.text  || false;
			let image = payload.mime.image || false;
			let video = payload.mime.video || false;
			let other = payload.mime.other || false;

			if (
				typeof text === 'boolean'
				&& typeof image === 'boolean'
				&& typeof video === 'boolean'
				&& typeof other === 'boolean'
			) {
				payload.mode = _get_mode(text, image, video, other);
			}

		} else if (typeof payload.mode === 'string') {

			let mode = payload.mode;
			if (MODES.includes(mode)) {
				payload.mime = _get_mime(mode);
			}

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

				site.mode       = payload.mode       || 'offline';
				site.mime.text  = payload.mime.text  || false;
				site.mime.image = payload.mime.image || false;
				site.mime.video = payload.mime.video || false;
				site.mime.other = payload.mime.other || false;

				settings.save();

			} else if (payload.domain !== null) {

				if (payload.subdomain !== null) {
					payload.domain    = payload.subdomain + '.' + payload.domain;
					payload.subdomain = null;
				}

				site = {
					domain: payload.domain,
					mode:   payload.mode || 'offline',
					mime:   {
						text:  payload.mime.text  || false,
						image: payload.mime.image || false,
						video: payload.mime.video || false,
						other: payload.mime.other || false
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

