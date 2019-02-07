
import { Emitter    } from './Emitter.mjs';
import { URL        } from './parser/URL.mjs';
import { Blocker    } from './request/Blocker.mjs';
import { Downloader } from './request/Downloader.mjs';
import { Optimizer  } from './request/Optimizer.mjs';



let _id = 0;

const Request = function(data, stealth) {

	let settings = Object.assign({}, data);


	Emitter.call(this);


	this.id       = 'request-' + _id++;
	this.config   = settings.config || {
		domain: null,
		mode: {
			text:  false,
			image: false,
			audio: false,
			video: false,
			other: false
		}
	};
	this.prefix   = settings.prefix || '/stealth/';
	this.ref      = null;
	this.response = null;
	this.stealth  = stealth;
	this.timeline = {
		init:     null,
		error:    null,
		kill:     null,
		cache:    null,
		block:    null,
		connect:  null,
		request:  null,
		optimize: null,
		response: null
	};
	this.url      = null;


	let ref = settings.ref || null;
	let url = settings.url || null;

	if (ref !== null) {

		this.ref = ref;
		this.url = this.ref.url;

	} else if (url !== null) {

		this.ref = URL.parse(url);
		this.url = this.ref.url;

	}


	this.on('cache', () => {

		return this.emit('error', [{ type: 'site' }]);

		this.stealth.server.services.cache.read(this.ref, response => {

			this.timeline.cache = Date.now();

			if (response.payload !== null) {
				this.response = response;
				this.emit('response', [ this.response ]);
			} else {
				this.emit('block');
			}

		});

	});

	this.on('block', () => {

		let mime     = this.ref.mime;
		let allowed  = this.config.mode[mime.type] === true;
		let blockers = this.stealth.settings.blockers;


		Blocker.check(blockers, this.ref, blocked => {

			if (blocked === true) {

				this.config.mode.text  = false;
				this.config.mode.image = false;
				this.config.mode.audio = false;
				this.config.mode.video = false;
				this.config.mode.other = false;

				this.emit('error', [{ code: 403 }]);

			} else if (allowed === true) {
				this.emit('connect');
			} else if (mime.ext === 'html') {
				this.emit('error', [{ type: 'site' }]);
			} else {
				this.emit('error', [{ code: 403 }]);
			}

		});

	});

	this.on('connect', () => {

		if (this.ref.host !== null) {

			this.timeline.connect = Date.now();
			this.emit('request');

		} else {

			this.stealth.server.services.host.read(Object.assign({}, this.ref), response => {

				console.log('dns response?', response);

				this.timeline.connect = Date.now();

				if (response.payload !== null) {

					if (response.payload.ipv6 !== null) {
						this.ref.host = response.payload.ipv6;
					} else if (response.payload.ipv4 !== null) {
						this.ref.host = response.payload.ipv4;
					}

				}

				if (this.ref.host !== null) {
					this.emit('request');
				} else {
					this.emit('error', [{ type: 'host' }]);
				}

			});

		}

	});

	this.on('request', () => {

		Downloader.check(this.ref, this.config, result => {

			if (result === true) {

				Downloader.download(this.ref, this.config, request => {

					if (request !== null) {

						request.on('error', error => {
							// error.status = 404
							this.emit('error', [ error ]);
						});

						request.on('response', response => {
							console.log(response);
						});

					} else {
						this.emit('error', [{ type: 'request' }]);
					}

				});

			} else {
				this.emit('error', [{ code: 403 }]);
			}

		});

	});

	this.on('optimize', () => {

		Optimizer.check(this.ref, this.config, result => {

			if (result === true) {

				Optimizer.optimize(this.ref, this.config, this.response, response => {

					console.log('optimize()', response);

				});

			} else {
				this.emit('response', [ this.response ]);
			}

		});

	});

	this.on('render', () => {
		// TODO: render stuff with different URLs
		// and prefix everything to /stealth
	});

	this.on('response', () => {

		// TODO: write to cache

	});

};


Request.prototype = Object.assign({}, Emitter.prototype, {

	init: function() {

		if (this.timeline.init === null) {
			this.timeline.init = Date.now();
			this.emit('cache');
		}

	},

	kill: function() {

		if (this.timeline.kill === null) {
			this.timeline.kill = Date.now();

		}

		// TODO: Stop download(s)

	}

});


export { Request };

