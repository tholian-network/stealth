
import { Buffer, Emitter, isBuffer, isObject, isString } from '../extern/base.mjs';
import { HTTP                                          } from '../source/connection/HTTP.mjs';
import { HTTPS                                         } from '../source/connection/HTTPS.mjs';
import { SOCKS                                         } from '../source/connection/SOCKS.mjs';
import { UA                                            } from '../source/parser/UA.mjs';
import { URL                                           } from '../source/parser/URL.mjs';



export const isDownload = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Download]';
};



const ondisconnect = function() {

	let has_fired = this.__journal.filter((e) => e.event === 'error' || e.event === 'redirect' || e.event === 'response').length > 0;
	if (has_fired === false) {

		let frame = this.__state.frame || null;
		if (frame !== null) {

			if (
				isObject(frame.headers) === true
				&& isBuffer(frame.payload) === true
			) {

				if (frame.headers['@status'] === 206) {

					let from = frame.headers['@transfer']['range'][0];
					if (
						from > 0
						&& isBuffer(this.url.payload) === true
						&& from === this.url.payload.length
					) {

						frame.payload                   = Buffer.concat([ this.url.payload, frame.payload ]);
						frame.headers['content-length'] = frame.payload.length;

						if (frame.headers['@status'] === 206) {

							if (frame.payload.length > 0) {
								frame.headers['@transfer']['range'] = [ 0, frame.payload.length - 1];
							} else {
								frame.headers['@transfer']['range'] = [ 0, 0 ];
							}

						}

					} else if (from > 0) {

						// Invalid Response
						frame.headers = null;
						frame.payload = null;

					} else if (from === 0) {

						// Do Nothing

					}

				}


				if (frame.headers !== null && frame.payload !== null) {

					let expect = frame.headers['@transfer']['length'];

					if (frame.payload.length === expect) {

						this.url.headers = frame.headers;
						this.url.payload = frame.payload;

						this.emit('response', [{
							headers: frame.headers,
							payload: frame.payload
						}]);

					} else if (frame.payload.length < expect) {

						this.url.headers = frame.headers;
						this.url.payload = frame.payload;

						this.emit('error', [{ type: 'connection', cause: 'socket-stability' }]);

					}

				} else {
					this.emit('error', [{ type: 'connection', cause: 'socket-stability' }]);
				}

			} else {

				this.url.headers = null;
				this.url.payload = null;

				this.emit('error', [{ type: 'connection', cause: 'socket-stability' }]);

			}

		} else {
			this.emit('error', [{ type: 'connection', cause: 'socket-stability' }]);
		}

	}

};



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


Download.from = function(json) {

	json = isObject(json) ? json : null;


	if (json !== null) {

		let type = json.type === 'Download' ? json.type : null;
		let data = isObject(json.data)      ? json.data : null;

		if (type !== null && data !== null) {

			if (isString(data.url) === true) {

				let download = new Download({
					ua:  isString(data.ua)  ? UA.parse(data.ua)   : null,
					url: isString(data.url) ? URL.parse(data.url) : null
				});

				return download;

			}

		}

	}


	return null;

};


Download.isDownload = isDownload;


Download.prototype = Object.assign({}, Emitter.prototype, {

	[Symbol.toStringTag]: 'Download',

	toJSON: function() {

		let blob = Emitter.prototype.toJSON.call(this);
		let data = {
			bandwidth:  this.bandwidth(),
			connection: null,
			percentage: '???.??%',
			events:     blob.data.events,
			journal:    blob.data.journal
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
			if (proxy !== null) {
				this.connection = SOCKS.connect(this.url);
			} else if (this.url.protocol === 'https') {
				this.connection = HTTPS.connect(this.url);
			} else if (this.url.protocol === 'http') {
				this.connection = HTTP.connect(this.url);
			}


			if (this.connection !== null) {

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

						if (this.url.headers['@status'] === 206) {

							if (isBuffer(this.url.payload) === true) {
								headers['range'] = 'bytes=' + this.url.payload.length + '-';
							}

						}

						let content_encoding = this.url.headers['content-encoding'] || null;
						if (content_encoding !== null) {
							headers['accept-encoding'] = content_encoding;
						}

					}

					let user_agent = UA.render(this.ua);
					if (user_agent !== null) {
						headers['user-agent'] = user_agent;
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

				this.connection.once('error', (err) => {
					this.emit('error', [ err ]);
				});

				this.connection.on('progress', (frame, progress) => {

					this.__state.frame    = frame;
					this.__state.progress = progress;

					this.emit('progress', [ frame, progress ]);

				});

				this.connection.once('redirect', (frame) => {
					this.emit('redirect', [ frame ]);
				});

				this.connection.once('response', (frame) => {

					let bytes = 0;
					let total = Infinity;

					if (isObject(frame.headers['@transfer']) === true) {

						if (frame.headers['@transfer']['length'] !== Infinity) {
							bytes = frame.headers['@transfer']['length'];
							total = frame.headers['@transfer']['length'];
						}

					}

					this.__state.frame    = frame;
					this.__state.progress = { bytes: bytes, total: total };

					this.connection.disconnect();

				});

				this.connection.once('@disconnect', () => {

					if (this.__state.interval !== null) {
						clearInterval(this.__state.interval);
						this.__state.interval = null;
					}

					ondisconnect.call(this);
					this.connection = null;

				});

				return true;

			} else {

				if (this.url.hosts.length === 0) {
					this.emit('error', [{ type: 'host' }]);
				} else {
					this.emit('error', [{ type: 'blocker' }]);
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

