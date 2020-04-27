
import { Buffer, Emitter, isBoolean, isFunction, isNumber, isObject } from '../../extern/base.mjs';
import { HTTP                                                       } from '../protocol/HTTP.mjs';
import { HTTPS                                                      } from '../protocol/HTTPS.mjs';
import { SOCKS                                                      } from '../protocol/SOCKS.mjs';
import { URL                                                        } from '../parser/URL.mjs';



const compute = function() {

	let timeline = this.__bandwidth.timeline;
	let filtered = timeline.filter((v) => v !== null);

	if (filtered.length === timeline.length) {
		return timeline.reduce((a, b) => a + b, 0) / timeline.length;
	} else {
		return null;
	}

};

const measure = function() {

	let old_length = this.__bandwidth.length;
	let new_length = this.buffer.payload.length;
	let new_index  = this.__bandwidth.index;

	this.__bandwidth.timeline[new_index] = new_length - old_length;


	this.__bandwidth.length = this.buffer.payload.length;
	this.__bandwidth.index += 1;
	this.__bandwidth.index %= this.__bandwidth.timeline.length;


	let bandwidth = compute.call(this);
	if (bandwidth !== null && bandwidth < 0.01) {

		if (this.connection !== null) {
			this.connection.disconnect();
		}

	}

};



export const Download = function(ref) {

	ref = URL.isURL(ref) ? ref : null;


	this.buffer = {
		start:   0,
		length:  null,
		partial: false,
		payload: Buffer.from('', 'utf8')
	};

	this.connection = null;
	this.ref        = ref;

	this.__bandwidth = {
		index:    0,
		length:   0,
		timeline: new Array(30).fill(null)
	};
	this.__interval  = null;


	Emitter.call(this);

};


Download.from = function(json) {

	json = isObject(json) ? json : null;


	if (json !== null) {

		let type = json.type === 'Download' ? json.type : null;
		let data = isObject(json.data)      ? json.data : null;

		if (type !== null && data !== null) {

			if (URL.isURL(data.ref) === true) {

				let download = new Download(data.ref);

				if (
					isObject(data.buffer) === true
					&& isNumber(data.buffer.start) === true
					&& isNumber(data.buffer.length) === true
					&& isBoolean(data.buffer.partial) === true
				) {

					if (isObject(data.buffer.payload) === true) {

						let tmp_payload = data.buffer.payload || null;
						if (tmp_payload.type === 'Buffer') {

							data.buffer.payload = Buffer.from(tmp_payload.data);

							download.buffer.start   = data.buffer.start;
							download.buffer.length  = data.buffer.length;
							download.buffer.partial = data.buffer.partial;
							download.buffer.payload = data.buffer.payload;

						}

					}

				}

				return download;

			}


		}


	}


	return null;

};


Download.prototype = Object.assign({}, Emitter.prototype, {

	[Symbol.toStringTag]: 'Download',

	toJSON: function() {

		let data = {
			bandwidth: this.bandwidth(),
			buffer: {
				start:   this.buffer.start,
				length:  this.buffer.length,
				partial: this.buffer.partial,
				payload: this.buffer.payload.toJSON()
			},
			ref: this.ref
		};

		return {
			type: 'Download',
			data: data
		};

	},

	bandwidth: function() {

		if (this.connection !== null) {
			return compute.call(this);
		}

		return null;

	},

	start: function() {

		if (this.ref.headers !== null && this.ref.payload !== null) {

			let tmp = this.ref.headers['content-length'] || null;
			if (tmp !== null) {

				let num = parseInt(tmp, 10);
				if (Number.isNaN(num) === false) {

					let length = num;
					if (length === this.ref.payload.length) {

						this.buffer.length  = num;
						this.buffer.payload = this.ref.payload;

						if (this.__interval !== null) {
							clearInterval(this.__interval);
							this.__interval = null;
						}

						return true;

					}

				}

			}

		}


		if (this.connection === null) {

			let proxy = this.ref.proxy || null;
			if (proxy !== null) {

				this.__interval = setInterval(() => measure.call(this), 1000);
				this.connection = SOCKS.connect(this.ref, this.buffer);

			} else if (this.ref.protocol === 'https') {

				this.__interval = setInterval(() => measure.call(this), 1000);
				this.connection = HTTPS.connect(this.ref, this.buffer);

			} else if (this.ref.protocol === 'http') {

				this.__interval = setInterval(() => measure.call(this), 1000);
				this.connection = HTTP.connect(this.ref, this.buffer);

			}


			if (this.connection !== null) {

				this.connection.on('error',    (...args) => this.emit('error',    args));
				this.connection.on('progress', (...args) => this.emit('progress', args));
				this.connection.on('redirect', (...args) => this.emit('redirect', args));
				this.connection.on('response', (...args) => this.emit('response', args));
				this.connection.on('timeout',  (...args) => this.emit('timeout',  args));

				this.connection.on('@connect', () => {

					let hostname = null;

					if (this.ref.hosts.length > 0) {
						hostname = this.ref.hosts[0].ip;
					}

					if (this.ref.domain !== null) {

						if (this.ref.subdomain !== null) {
							hostname = this.ref.subdomain + '.' + this.ref.domain;
						} else {
							hostname = this.ref.domain;
						}

					}


					let headers = {
						'@method': 'GET',
						'@path':   this.ref.path,
						'@query':  this.ref.query,
						'host':    hostname,
						'range':   'bytes=' + this.buffer.start + '-'
					};

					if (this.ref.headers !== null) {

						let accept = this.ref.headers['accept'] || null;
						if (accept !== null) {
							headers['accept'] = accept;
						}

						let useragent = this.ref.headers['user-agent'] || null;
						if (useragent !== null) {
							headers['user-agent'] = useragent;
						}

					}

					if (this.ref.protocol === 'https') {

						HTTPS.send(this.connection, {
							headers: headers
						});

					} else if (this.ref.protocol === 'http') {

						HTTP.send(this.connection, {
							headers: headers
						});

					}

				});

				this.connection.on('@disconnect', () => {

					if (this.__interval !== null) {
						clearInterval(this.__interval);
						this.__interval = null;
					}

				});

				return true;

			}

		}


		return false;

	},

	stop: function() {

		if (this.connection !== null) {
			this.connection.disconnect();
		}

	}

});



const Downloader = {

	check: function(ref, config, callback) {

		ref      = URL.isURL(ref)       ? ref      : null;
		config   = isObject(config)     ? config   : null;
		callback = isFunction(callback) ? callback : null;


		if (ref !== null && config !== null && callback !== null) {

			let protocol = ref.protocol;
			let type     = ref.mime.type;

			if (protocol === 'https' || protocol === 'http') {
				callback(config.mode[type] === true);
			} else {
				callback(false);
			}

		} else if (callback !== null) {
			callback(false);
		}

	},

	download: function(ref, config, callback) {

		ref      = URL.isURL(ref)       ? ref      : null;
		config   = isObject(config)     ? config   : null;
		callback = isFunction(callback) ? callback : null;


		if (ref !== null && config !== null && callback !== null) {

			let allowed = config.mode[ref.mime.type] === true;
			if (allowed === true) {
				callback(new Download(ref));
			} else {
				callback(null);
			}

		} else if (callback !== null) {
			callback(null);
		}

	}

};


export { Downloader };

