
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
	this.config   = settings.config || null;
	this.prefix   = settings.prefix || '/stealth/';
	this.ref      = null;
	this.response = null;
	this.stealth  = stealth;
	this.url      = null;
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
		let allowed  = this.config.mime[mime.type] === true;
		let blockers = this.stealth.settings.blockers;


		Blocker.check(blockers, this.ref, blocked => {

			if (blocked === true) {

				this.config.mode       = 'offline';
				this.config.mime.text  = false;
				this.config.mime.image = false;
				this.config.mime.video = false;
				this.config.mime.other = false;

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

			this.stealth.server.services.host.read(this.ref, response => {

				this.timeline.connect = Date.now();

				if (response.payload !== null) {

					if (response.ipv6 !== null) {
						this.ref.host = response.ipv6;
					} else if (response.ipv4 !== null) {
						this.ref.host = response.ipv4;
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

