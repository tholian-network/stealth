
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

const _validate_payload = function(payload) {

	if (payload instanceof Object && payload.mime instanceof Object) {

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

			// XXX: Always enforce correct mode
			payload.mode = _get_mode(text, image, video, other);

			return payload;

		}

	} else if (payload instanceof Object && typeof payload.mode === 'string') {

		let mode = payload.mode;
		if (MODES.includes(mode)) {

			// XXX: Always enforce correct mime
			payload.mime = _get_mime(mode);

			return payload;

		}

	}

	return null;

};



const Site = function(stealth) {

	Emitter.call(this);


	this.stealth = stealth;

};


Site.prototype = Object.assign({}, Emitter.prototype, {

	read: function(ref, callback) {

		ref      = ref instanceof Object          ? ref      : null;
		callback = typeof callback === 'function' ? callback : null;


		if (ref !== null && callback !== null) {

			let site     = null;
			let settings = this.stealth.settings;

			let rdomain = ref.domain || null;
			if (rdomain !== null) {

				let rsubdomain = ref.subdomain || null;
				if (rsubdomain !== null) {
					rdomain = rsubdomain + '.' + rdomain;
				}

				site = settings.sites.find(s => s.domain === rdomain) || null;

			}


			if (site !== null) {

				callback({
					headers: {
						service: 'site',
						event:   'read'
					},
					payload: site
				});

			} else {

				callback({
					headers: {
						service: 'site',
						event:   'read'
					},
					payload: null
				});

			}

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

	save: function(ref, callback) {

		ref      = ref instanceof Object          ? ref      : null;
		callback = typeof callback === 'function' ? callback : null;


		if (ref !== null && callback !== null) {

			let site     = null;
			let settings = this.stealth.settings;

			let rdomain  = ref.domain || null;
			let rpayload = _validate_payload(ref.payload || null);

			if (rdomain !== null) {

				let rsubdomain = ref.subdomain || null;
				if (rsubdomain !== null) {
					rdomain = rsubdomain + '.' + rdomain;
				}

				site = settings.sites.find(s => s.domain === rdomain) || null;

			}


			if (site !== null && rpayload !== null) {

				site.mode       = rpayload.mode       || 'offline';
				site.mime.text  = rpayload.mime.text  || false;
				site.mime.image = rpayload.mime.image || false;
				site.mime.video = rpayload.mime.video || false;
				site.mime.other = rpayload.mime.other || false;

			} else if (rdomain !== null) {

				settings.sites.push({
					domain: rdomain,
					mode:   rpayload.mode || 'offline',
					mime:   {
						text:  rpayload.mime.text  || false,
						image: rpayload.mime.image || false,
						video: rpayload.mime.video || false,
						other: rpayload.mime.other || false
					}
				});

			}


			settings.save(result => {

				callback({
					headers: {
						service: 'site',
						event:   'save'
					},
					payload: {
						result: result
					}
				});

			});

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'site',
					event:   'save'
				},
				payload: {
					result: false
				}
			});

		}

	}

});


export { Site };

