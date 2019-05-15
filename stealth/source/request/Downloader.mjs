
import { Buffer } from 'buffer';

import { Emitter } from '../Emitter.mjs';
import { HTTP    } from '../protocol/HTTP.mjs';
import { HTTPS   } from '../protocol/HTTPS.mjs';
import { SOCKS   } from '../protocol/SOCKS.mjs';



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

			let socket = this.connection.socket || null;
			if (socket !== null) {
				socket.end();
			}

		}

	}

};



const Download = function(ref) {

	Emitter.call(this);


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

};


Download.prototype = Object.assign({}, Emitter.prototype, {

	toJSON: function() {

		let data = {
			bandwidth: this.bandwidth(),
			buffer: {
				start:   this.buffer.start,
				length:  this.buffer.length,
				partial: this.buffer.partial,
				payload: null
			}
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

	init: function() {

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

				this.connection.on('@connect', (socket) => {

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

						HTTPS.send(socket, {
							headers: headers
						});

					} else if (this.ref.protocol === 'http') {

						HTTP.send(socket, {
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

	kill: function() {

		if (this.connection !== null) {

			let socket = this.connection.socket || null;
			if (socket !== null) {

				try {
					socket.destroy();
				} catch (err) {
					// Do nothing
				}

			}

		}

	}

});



const Downloader = {

	check: function(ref, config, callback) {

		ref      = ref instanceof Object          ? ref      : null;
		config   = config instanceof Object       ? config   : null;
		callback = typeof callback === 'function' ? callback : null;


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

		ref      = ref instanceof Object          ? ref      : null;
		config   = config instanceof Object       ? config   : null;
		callback = typeof callback === 'function' ? callback : null;


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

