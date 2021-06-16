
import { Buffer, Emitter, isBuffer, isObject } from '../extern/base.mjs';
import { HTTP                                } from '../source/connection/HTTP.mjs';
import { HTTPS                               } from '../source/connection/HTTPS.mjs';
import { SOCKS                               } from '../source/connection/SOCKS.mjs';
import { UA                                  } from '../source/parser/UA.mjs';
import { URL                                 } from '../source/parser/URL.mjs';



const Download = function(settings) {

	settings = isObject(settings) ? settings : {};


	settings = Object.freeze({
		ua:  UA.isUA(settings.ua)    ? settings.ua  : null,
		url: URL.isURL(settings.url) ? settings.url : null
	});


	this.connection = null;
	this.ua         = settings.ua;
	this.url        = settings.url;

	this.__state = {
		bandwidth: [],
		frame:     null,
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

			let proxy = this.url.proxy || null;

			console.log(this.url);

			if (proxy !== null) {
				this.connection = SOCKS.connect(this.url);
			} else if (this.url.protocol === 'https') {
				this.connection = HTTPS.connect(this.url);
			} else if (this.url.protocol === 'http') {
				this.connection = HTTP.connect(this.url);
			}


			if (this.connection !== null) {

				this.connection.once('error', (err) => {
					this.emit('error', [ err ]);
				});

				this.connection.on('progress', (frame, progress) => {

					if (frame.headers['@status'] === '206 Partial Content') {
						this.__state.partial = true;
					}

					this.__state.frame    = frame;
					this.__state.progress = progress;

					this.emit('progress', [ frame, progress ]);

				});

				this.connection.once('redirect', (...args) => {
					this.emit('redirect', args);
				});

				this.connection.once('response', (response) => {
					this.emit('response', [ response ]);
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
					let domain   = URL.toDomain(this.url);
					let host     = URL.toHost(this.url);

					if (domain !== null) {
						hostname = domain;
					} else if (host !== null) {
						hostname = host;
					}

					let headers = {
						'@method':         'GET',
						'@url':            URL.render(this.url),
						'accept':          this.url.mime.format,
						'accept-encoding': 'gzip, deflate, br',
						'host':            hostname,
						'range':           'bytes=0-'
					};

					if (this.url.headers !== null) {

						if (this.url.headers['@status'] === '206 Partial Content') {

							if (isBuffer(this.url.payload) === true) {
								headers['range'] = 'bytes=' + this.url.payload.length + '-';
							}

						}

						let user_agent = UA.render(this.ua);
						if (user_agent !== null) {
							headers['user-agent'] = user_agent;
						}

						let content_encoding = this.url.headers['content-encoding'] || null;
						if (content_encoding !== null) {
							headers['accept-encoding'] = content_encoding;
						}

					}


					if (this.url.protocol === 'https') {

						HTTPS.send(this.connection, {
							headers: headers
						});

					} else if (this.url.protocol === 'http') {

						HTTP.send(this.connection, {
							headers: headers
						});

					}

				});

				this.connection.once('@disconnect', () => {

					let valid = false;

					if (this.__state.frame !== null) {

						this.url.headers = this.__state.frame.headers;


						let from = this.url.headers['@range'][0];
						if (from > 0) {

							// If payload.length = 13, then from = payload.length
							// because first range byte is 0, not 1

							if (this.url.payload === null) {
								this.url.payload = this.__state.frame.payload;
								valid = true;
							} else if (isBuffer(this.url.payload) === true && from === this.url.payload.length) {
								this.url.payload = Buffer.concat([ this.url.payload, this.__state.frame.payload ]);
								valid = true;
							} else {
								this.emit('error', [{ type: 'connection', cause: 'headers-payload' }]);
								valid = false;
							}

						} else {
							this.url.payload = this.__state.frame.payload;
							valid = true;
						}

					}


					if (this.__state.interval !== null) {
						clearInterval(this.__state.interval);
						this.__state.interval = null;
					}

					// XXX: Reset every state
					this.__state.frame    = { headers: null, payload: null };
					this.__state.progress = { bytes: 0, total: Infinity };


					if (valid === true) {

						if (this.url.headers['@transfer']['length'] === this.url.payload.length) {

							this.connection.emit('response', [{
								headers: this.url.headers,
								payload: this.url.payload
							}]);

						} else {

							this.connection.emit('error', [{ type: 'connection', cause: 'socket-stability' }]);

						}

					}

				});

				return true;

			} else {

				if (this.url.hosts.length === 0) {
					this.emit('error', [{ type: 'host' }]);
				} else {
					this.emit('error', [{ type: 'block' }]);
				}

			}

		}


		return false;

	},

	stop: function() {

		if (this.connection !== null) {

			this.connection.disconnect();
			this.connection = null;

			return true;

		}


		return false;

	}

});


export { Download };

