
import { Buffer } from 'buffer';

import { Emitter } from '../Emitter.mjs';
import { HTTP    } from '../protocol/HTTP.mjs';
import { TLS     } from '../protocol/TLS.mjs';



const _concat_buffer = function(buf1, buf2) {

	let buffer = Buffer.alloc(buf1.length + buf2.length);

	buf1.copy(buffer, 0);
	buf2.copy(buffer, buf1.length);

	return buffer;

};

const _get_bandwidth = function() {

	let timeline = this.__bandwidth.timeline;
	let index    = timeline.findIndex((v) => v === null);

	if (index !== -1 && index > 0) {
		return timeline.slice(0, index).reduce((a, b) => a + b, 0) / (index + 1);
	} else if (index !== -1) {
		return timeline[0];
	} else if (index === -1) {
		return timeline.reduce((a, b) => a + b, 0) / timeline.length;
	}

};

const _measure_bandwidth = function() {

	let old_length = this.__bandwidth.length;
	let new_length = this.buffer.payload.length;
	let new_index  = this.__bandwidth.index;

	this.__bandwidth.timeline[new_index] = new_length - old_length;


	this.__bandwidth.length = this.buffer.payload.length;
	this.__bandwidth.index += 1;
	this.__bandwidth.index %= this.__bandwidth.timeline.length;


	let bandwidth = _get_bandwidth.call(this);
	if (bandwidth !== null && bandwidth < 0.01) {

		if (this.__socket !== null) {
			this.__socket.end();
		}

	}

};

const _on_connect = function(socket) {

	if (this.ref.headers !== null) {

		let tmp0 = this.ref.headers['content-length'] || null;
		let tmp1 = this.ref.headers['@status']        || null;
		let tmp2 = this.ref.headers['content-range']  || null;

		if (tmp0 !== null) {

			let num = parseInt(tmp0, 10);
			if (Number.isNaN(num) === false) {
				this.buffer.length = num;
			}

		}

		if (tmp1 === '206 Partial Content' && tmp2 !== null) {

			if (this.ref.payload !== null) {
				this.buffer.partial = true;
				this.buffer.payload = Buffer.from(this.ref.payload);
				this.buffer.start   = this.ref.payload.length;
			} else {
				this.buffer.partial = true;
				this.buffer.payload = Buffer.from('', 'utf8');
				this.buffer.start   = 0;
			}

		} else {

			this.buffer.partial = false;
			this.buffer.payload = Buffer.from('', 'utf8');
			this.buffer.start   = 0;

		}

	} else {

		this.buffer.partial = false;
		this.buffer.payload = Buffer.from('', 'utf8');
		this.buffer.start   = 0;

	}


	let is_payload = false;
	let temporary  = Buffer.from('', 'utf8');

	socket.on('data', (fragment) => {

		if (is_payload === true) {

			this.buffer.payload = _concat_buffer(this.buffer.payload, fragment);

			this.emit('progress', [{
				headers: this.ref.headers,
				payload: this.buffer.payload
			}, {
				bytes:  this.buffer.payload.length,
				length: this.buffer.length
			}]);

		} else {

			temporary = _concat_buffer(temporary, fragment);

			let index = temporary.toString('utf8').indexOf('\r\n\r\n');
			if (index !== -1) {

				is_payload = true;


				HTTP.receive(socket, temporary, (response) => {

					let tmp0 = response.headers['content-length'] || null;
					if (tmp0 !== null && this.buffer.length === null) {

						let num = parseInt(tmp0, 10);
						if (Number.isNaN(num) === false) {
							this.buffer.length = num;
						}

					}


					if (this.ref.headers === null) {
						this.ref.headers = response.headers;
					}


					let status = response.headers['@status']       || '';
					let range  = response.headers['content-range'] || null;
					let code   = status.split(' ').shift();

					if (code === '206' && range !== null) {
						this.buffer.partial = true;
						this.buffer.payload = _concat_buffer(this.buffer.payload, response.payload);
					} else if (code === '200') {
						this.buffer.partial = false;
						this.buffer.payload = response.payload;
					} else if (code === '416') {
						this.emit('error', [{ type: 'stash' }]);
					} else {

						this.buffer.partial = false;
						this.buffer.payload = response.payload;

						socket.removeAllListeners('data');
						socket.end();

					}

				});

			}

		}

	});


	let host = null;

	if (this.ref.hosts.length > 0) {
		host = this.ref.hosts[0].ip;
	}

	if (this.ref.domain !== null) {

		if (this.ref.subdomain !== null) {
			host = this.ref.subdomain + '.' + this.ref.domain;
		} else {
			host = this.ref.domain;
		}

	}


	let range = 'bytes=' + this.buffer.start + '-';

	// XXX: Technically, this is the correct way.
	// But apparently not a single server supports this.
	// if (buffer.length !== null) {
	// 	range = 'bytes=' + buffer.start + '-' + buffer.length;
	// }

	HTTP.send(socket, {
		headers: {
			'@method': 'GET',
			'@path':   this.ref.path,
			'@query':  this.ref.query,
			'host':    host,
			'range':   range
		}
	});

};

const _on_disconnect = function() {

	if (this.ref.headers !== null) {

		let status = this.ref.headers['@status'] || '';
		let code   = status.split(' ').shift();

		if (/^(200|204|205|206)$/g.test(code)) {

			if (this.buffer.length === this.buffer.payload.length) {

				this.emit('response', [{
					headers: this.ref.headers,
					payload: this.buffer.payload
				}]);

			} else if (this.buffer.length < this.buffer.payload.length) {

				if (this.buffer.partial === true) {
					this.emit('timeout', [{
						headers: this.ref.headers,
						payload: this.buffer.payload
					}]);
				} else {
					this.emit('timeout', [ null ]);
				}

			} else {
				this.emit('error', [{ type: 'stash' }]);
			}

		} else if (/^(301|307|308)$/g.test(code)) {

			let url = this.ref.headers['location'] || null;
			if (url !== null) {
				this.emit('redirect', [{
					headers: this.ref.headers
				}]);
			} else {
				this.emit('error', [{ code: code, type: 'request', cause: 'headers-location' }]);
			}

		} else if (/^(4([0-9]{2}))$/g.test(code)) {
			this.emit('error', [{ code: code, type: 'request', cause: 'headers-status' }]);
		} else if (/^(5([0-9]{2}))$/g.test(code)) {
			this.emit('error', [{ code: code, type: 'request', cause: 'headers-status' }]);
		} else {
			this.emit('error', [{ code: code, type: 'request', cause: 'headers-status' }]);
		}

	} else {
		this.emit('timeout', [ null ]);
	}


	if (this.__interval !== null) {
		clearInterval(this.__interval);
		this.__interval = null;
	}

};



const _Request = function(ref) {

	Emitter.call(this);


	this.ref = ref;

	this.buffer = {
		start:   0,
		length:  null,
		partial: false,
		payload: Buffer.from('', 'utf8')
	};

	this.__bandwidth = {
		index:    0,
		length:   0,
		timeline: new Array(30).fill(null)
	};
	this.__interval  = null;
	this.__socket    = null;

};


_Request.prototype = Object.assign({}, Emitter.prototype, {

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
						_on_disconnect.call(this);

						return true;

					}

				}

			}

		}


		if (this.__socket === null) {

			if (this.ref.protocol === 'https') {

				this.__interval = setInterval(() => _measure_bandwidth.call(this), 1000);

				let socket = TLS.connect(this.ref, this.buffer, this);
				if (socket !== null) {
					this.on('@connect',    (socket) => _on_connect.call(this, socket));
					this.on('@disconnect', (socket) => _on_disconnect.call(this, socket));
				} else {
					this.emit('error', [{ type: 'request' }]);
				}

				return true;

			} else if (this.ref.protocol === 'http') {

				this.__interval = setInterval(() => _measure_bandwidth.call(this), 1000);

				let socket = HTTP.connect(this.ref, this.buffer, this);
				if (socket !== null) {
					this.on('@connect',    (socket) => _on_connect.call(this, socket));
					this.on('@disconnect', (socket) => _on_disconnect.call(this, socket));
				} else {
					this.emit('error', [{ type: 'request' }]);
				}

				return true;

			}

		}


		return false;

	},

	bandwidth: function() {

		if (this.__socket !== null) {
			return _get_bandwidth.call(this);
		}

		return null;

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
				callback(new _Request(ref));
			} else {
				callback(null);
			}

		} else if (callback !== null) {
			callback(null);
		}

	}

};


export { Downloader };

