
import { Emitter, isBoolean, isObject, isString } from '../extern/base.mjs';
import { HTTP                                   } from '../source/connection/HTTP.mjs';
import { HTTPS                                  } from '../source/connection/HTTPS.mjs';
import { SOCKS                                  } from '../source/connection/SOCKS.mjs';
import { URL                                    } from '../source/parser/URL.mjs';



const Download = function(url) {

	url = URL.isURL(url) ? url : null;


	this.connection = null;
	this.url        = url;

	this.__state = {
		bandwidth: [],
		fragment:  Buffer.alloc(0),
		frame:     { headers: null, payload: null },
		interval:  null,
		progress:  { bytes: 0, total: Infinity }
	};


	Emitter.call(this);

};


Download.prototype = Object.assign({}, Emitter.prototype, {

	[Symbol.toStringTag]: 'Download',

	toJSON: function() {

		let data = {
			bandwidth:  this.bandwidth(),
			connection: null,
			percentage: '???.??%'
		};

		if (this.connection !== null) {
			data.connection = this.connection.toJSON();
		}

		if (this.connection !== null && this.url !== null && this.url.headers !== null) {

			if (this.__state.progress.total !== Infinity) {
				data.percentage = ((this.__state.progress.bytes / this.__state.progress.total) * 100).toFixed(2) + '%';
			}

		}

		return {
			'type': 'Download',
			'data': data
		};

	},

	bandwidth: function() {

		if (this.connection !== null) {

			let bandwidth = this.__state.bandwidth;
			if (bandwidth.length > 0) {
				return bandwidth.reduce((a, b) => a + b, 0) / bandwidth.length;
			} else {
				return Infinity;
			}

		}


		return -1;

	},

	start: function() {

		if (this.connection === null && this.url !== null) {

			if (this.url.proxy !== null) {
				this.connection = SOCKS.connect(this.url);
			} else if (this.url.protocol === 'https') {
				this.connection = HTTPS.connect(this.url);
			} else if (this.url.protocol === 'http') {
				this.connection = HTTP.connect(this.url);
			}


			if (this.connection !== null) {

				this.connection.on('error', (...args) => {

					// TODO: ondisconnect() like frame caching

					this.emit('error', args);

				});

				this.connection.on('progress', (frame, progress) => {

					this.__state.fragment = this.connection.fragment;
					this.__state.frame    = frame;
					this.__state.progress = progress;

					this.emit('progress', [ frame, progress ]);

				});

				this.connection.on('redirect', (...args) => {
					this.emit('redirect', args);
				});

				this.connection.on('response', (...args) => {
					this.emit('response', args);
				});

				this.connection.once('@connect', () => {

					let old_bytes = 0;
					let new_bytes = 0;

					this.__state.interval = setInterval(() => {

						new_bytes = this.__state.progress.bytes;

						this.__state.bandwidth.push(new_bytes - old_bytes);

						if (this.__state.bandwidth.length > 10) {
							this.__state.bandwidth.splice(0, 1);
						}

						old_bytes = new_bytes;


						let bandwidth = this.bandwidth();
						if (bandwidth >= 0 && bandwidth < 0.01) {
							this.connection.disconnect();
						}

					}, 1000);


					let hostname = null;
					let domain   = URL.toDomain(url);
					let host     = URL.toHost(url);

					if (domain !== null) {
						hostname = domain;
					} else if (host !== null) {
						hostname = host;
					}

					let headers = {
						'@method': 'GET',
						'@url':    URL.render(this.url),
						'accept':  this.url.mime.format,
						'host':    hostname,
						'range':   'bytes=0-'
					};

					if (this.__state.frame.headers !== null && this.__state.frame.payload !== null) {


						if (this.__state.frame.headers['@status'] === '206 Partial Content') {

							if (this.__state.fragment.length > 0) {
								this.connection.fragment = this.__state.fragment;
								headers['range']         = 'bytes=' + this.__state.frame.payload.length + '-';
							}

						}

						let user_agent = this.url.headers['user-agent'] || null;
						if (user_agent !== null) {
							headers['user-agent'] = user_agent;
						}

						let content_encoding = this.url.headers['content-encoding'] || null;
						if (content_encoding !== null) {
							headers['content-encoding'] = content_encoding;
						}

					}


				});

				this.connection.once('@disconnect', () => {

					if (this.__state.interval !== null) {
						clearInterval(this.__state.interval);
						this.__state.interval = null;
					}

				});


				return true;


				// TODO: How to bind ondisconnect() handler of HTTP which will lead to updated
				// url.headers and url.payload properties?

				// TODO: Then verify url.headers, if it is resumable, cache it
				// as this.__state.payload

			} else {

				this.emit('error', [{ type: 'block' }]);

			}

		}


		return false;

	},

	stop: function() {

		if (this.connection !== null) {

			// TODO: If not done with download, cache parsed fragment as
			// this.__state.payload
			this.connection.disconnect();
			this.connection = null;

			return true;

		}


		return false;

	}

});


export { Download };

