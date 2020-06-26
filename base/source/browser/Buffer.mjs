
const _coerce = function(num) {
	num = ~~Math.ceil(+num);
	return num < 0 ? 0 : num;
};

const _clean_base64 = function(str) {

	str = str.trim().replace(/[^+/0-9A-z]/g, '');

	while (str.length % 4 !== 0) {
		str = str + '=';
	}

	return str;

};

const _utf8_to_bytes = function(str) {

	let bytes = [];

	for (let s = 0; s < str.length; s++) {

		let byt = str.charCodeAt(s);
		if (byt <= 0x7F) {
			bytes.push(byt);
		} else {

			let start = s;
			if (byt >= 0xD800 && byt <= 0xDFF) s++;

			let tmp = encodeURIComponent(str.slice(start, s + 1)).substr(1).split('%');
			for (let t = 0; t < tmp.length; t++) {
				bytes.push(parseInt(tmp[t], 16));
			}

		}

	}

	return bytes;

};

const _decode_utf8_char = function(str) {

	try {
		return decodeURIComponent(str);
	} catch (err) {
		return String.fromCharCode(0xFFFD);
	}

};

const _utf8_to_string = function(buffer, start, end) {

	end = Math.min(buffer.length, end);


	let str = '';
	let tmp = '';

	for (let b = start; b < end; b++) {

		if (buffer[b] <= 0x7F) {
			str += _decode_utf8_char(tmp) + String.fromCharCode(buffer[b]);
			tmp = '';
		} else {
			tmp += '%' + buffer[b].toString(16);
		}

	}

	return str + _decode_utf8_char(tmp);

};

const _decode_base64 = function(elt) {

	let code = elt.charCodeAt(0);

	if (code === 43)      return 62;
	if (code === 47)      return 63;
	if (code  <  48)      return -1;
	if (code  <  48 + 10) return code - 48 + 26 + 26;
	if (code  <  65 + 26) return code - 65;
	if (code  <  97 + 26) return code - 97 + 26;

	return -1;

};

const _encode_base64 = function(num) {
	return 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.charAt(num);
};

const _ascii_to_bytes = function(str) {

	let bytes = [];

	for (let s = 0; s < str.length; s++) {
		bytes.push(str.charCodeAt(s) & 0xFF);
	}

	return bytes;

};

const _ascii_to_string = function(buffer, start, end) {

	end = Math.min(buffer.length, end);


	let str = '';

	for (let b = start; b < end; b++) {
		str += String.fromCharCode(buffer[b] & 0x7F);
	}

	return str;

};

const _base64_to_bytes = function(str) {

	if (str.length % 4 === 0) {

		let length       = str.length;
		let placeholders = '=' === str.charAt(length - 2) ? 2 : '=' === str.charAt(length - 1) ? 1 : 0;

		let bytes = new Array(length * 3 / 4 - placeholders);
		let l     = placeholders > 0 ? str.length - 4 : str.length;

		let tmp;
		let b = 0;
		let i = 0;

		while (i < l) {

			tmp = (_decode_base64(str.charAt(i)) << 18) | (_decode_base64(str.charAt(i + 1)) << 12) | (_decode_base64(str.charAt(i + 2)) << 6) | (_decode_base64(str.charAt(i + 3)));

			bytes[b++] = (tmp & 0xFF0000) >> 16;
			bytes[b++] = (tmp & 0xFF00)   >>  8;
			bytes[b++] =  tmp & 0xFF;

			i += 4;

		}


		if (placeholders === 2) {

			tmp = (_decode_base64(str.charAt(i)) << 2)  | (_decode_base64(str.charAt(i + 1)) >> 4);

			bytes[b++] = tmp        & 0xFF;

		} else if (placeholders === 1) {

			tmp = (_decode_base64(str.charAt(i)) << 10) | (_decode_base64(str.charAt(i + 1)) << 4) | (_decode_base64(str.charAt(i + 2)) >> 2);

			bytes[b++] = (tmp >> 8) & 0xFF;
			bytes[b++] =  tmp       & 0xFF;

		}


		return bytes;

	}


	return [];

};

const _base64_to_string = function(buffer, start, end) {

	let bytes      = buffer.slice(start, end);
	let extrabytes = bytes.length % 3;
	let l          = bytes.length - extrabytes;
	let str        = '';


	let tmp;

	for (let i = 0; i < l; i += 3) {

		tmp = (bytes[i] << 16) + (bytes[i + 1] << 8) + (bytes[i + 2]);

		str += (_encode_base64(tmp >> 18 & 0x3F) + _encode_base64(tmp >> 12 & 0x3F) + _encode_base64(tmp >> 6 & 0x3F) + _encode_base64(tmp & 0x3F));

	}


	if (extrabytes === 2) {

		tmp = (bytes[bytes.length - 2] << 8) + (bytes[bytes.length - 1]);

		str += _encode_base64(tmp >> 10);
		str += _encode_base64((tmp >> 4) & 0x3F);
		str += _encode_base64((tmp << 2) & 0x3F);
		str += '=';

	} else if (extrabytes === 1) {

		tmp = bytes[bytes.length - 1];

		str += _encode_base64(tmp >> 2);
		str += _encode_base64((tmp << 4) & 0x3F);
		str += '==';

	}


	return str;

};

const _binary_to_bytes = function(str) {

	let bytes = [];

	for (let s = 0; s < str.length; s++) {
		bytes.push(str.charCodeAt(s) & 0xFF);
	}

	return bytes;

};

const _binary_to_string = function(buffer, start, end) {

	end = Math.min(buffer.length, end);


	let str = '';

	for (let b = start; b < end; b++) {
		str += String.fromCharCode(buffer[b]);
	}

	return str;

};

const _hex_to_string = function(buffer, start, end) {

	end = Math.min(buffer.length, end);


	let str = '';

	for (let b = start; b < end; b++) {
		str += String.fromCharCode(buffer[b]);
	}

	let hex = '';

	for (let s = 0; s < str.length; s++) {

		let val = str.charCodeAt(s).toString(16);
		if (val.length < 2) {
			val = '0' + val;
		}

		hex += val;

	}

	return hex;

};

const _copy_buffer = function(source, target, offset, length) {

	let i = 0;

	for (i = 0; i < length; i++) {

		if (i + offset >= target.length) break;
		if (i >= source.length)          break;

		target[i + offset] = source[i];

	}

	return i;

};

const _copy_hexadecimal = function(source, target, offset, length) {

	let strlen = source.length;
	if (strlen % 2 !== 0) {
		throw new Error('Invalid hex string');
	}

	if (length > strlen / 2) {
		length = strlen / 2;
	}


	let i = 0;

	for (i = 0; i < length; i++) {

		let num = parseInt(source.substr(i * 2, 2), 16);
		if (isNaN(num) === true) {
			return i;
		}

		target[i + offset] = num;

	}


	return i;

};



export const Buffer = (function(global) {

	const Buffer = function(subject, encoding) {

		let type = typeof subject;
		if (type === 'string' && encoding === 'base64') {
			subject = _clean_base64(subject);
		}


		this.length = 0;


		if (type === 'string') {

			this.length = Buffer.byteLength(subject, encoding);

			this.write(subject, 0, encoding);

		} else if (type === 'number') {

			this.length = _coerce(subject);

			for (let n = 0; n < this.length; n++) {
				this[n] = 0;
			}

		} else if (Buffer.isBuffer(subject) === true) {

			this.length = subject.length;

			for (let b = 0; b < this.length; b++) {
				this[b] = subject[b];
			}

		}


		return this;

	};


	Buffer.alloc = function(size, fill, encoding) {

		size     = typeof size === 'number'     ? size     : 0;
		encoding = typeof encoding === 'string' ? encoding : 'utf8';


		let buffer = new Buffer(size);


		if (typeof fill === 'string') {

			let other = Buffer.from(fill, encoding);
			let ol    = other.length;

			for (let b = 0, bl = buffer.length; b < bl; b++) {
				buffer[b] = other[b % ol];
			}

		} else if (typeof fill === 'number') {

			for (let b = 0, bl = buffer.length; b < bl; b++) {
				buffer[b] = fill & 0xff;
			}

		} else if (fill instanceof Buffer) {

			let fl = fill.length;

			for (let b = 0, bl = buffer.length; b < bl; b++) {
				buffer[b] = fill[b % fl];
			}

		} else {

			for (let b = 0, bl = buffer.length; b < bl; b++) {
				buffer[b] = 0;
			}

		}


		return buffer;

	};


	Buffer.byteLength = function(str, encoding) {

		str      = typeof str === 'string'      ? str      : '';
		encoding = typeof encoding === 'string' ? encoding : 'utf8';


		let length = 0;

		if (encoding === 'ascii') {
			length = str.length;
		} else if (encoding === 'base64') {
			length = _base64_to_bytes(str).length;
		} else if (encoding === 'binary') {
			length = str.length;
		} else if (encoding === 'hex') {
			length = str.length >>> 1;
		} else if (encoding === 'latin1') {
			length = str.length;
		} else if (encoding === 'utf8' || encoding === 'utf-8') {
			length = _utf8_to_bytes(str).length;
		}

		return length;

	};


	Buffer.compare = function(a_buffer, b_buffer) {

		a_buffer = Buffer.isBuffer(a_buffer) ? a_buffer : null;
		b_buffer = Buffer.isBuffer(b_buffer) ? b_buffer : null;


		if (a_buffer !== null && b_buffer !== null) {

			if (a_buffer === b_buffer) {
				return 0;
			}


			let a_value = a_buffer.length;
			let b_value = b_buffer.length;

			for (let b = 0, bl = Math.min(a_buffer.length, b_buffer.length); b < bl; b++) {

				if (a_buffer[b] !== b_buffer[b]) {
					a_value = a_buffer[b];
					b_value = b_buffer[b];
					break;
				}

			}

			if (a_value < b_value) return -1;
			if (b_value < a_value) return  1;

		}

		return 0;

	};


	Buffer.concat = function(list, length) {

		list   = list instanceof Array      ? list         : null;
		length = typeof length === 'number' ? (length | 0) : null;


		if (list === null) {

			throw new TypeError('The "list" argument must be an instance of Array.');

		} else {

			if (length === null) {

				length = 0;

				for (let l = 0, ll = list.length; l < ll; l++) {
					length += list[l].length;
				}

			}

			let buffer = Buffer.alloc(length);
			let offset = 0;

			for (let l = 0, ll = list.length; l < ll; l++) {

				let other = list[l];

				other.copy(buffer, offset);

				offset += other.length;

			}

			if (offset < length) {
				buffer.fill(0, offset, length);
			}

			return buffer;

		}

	};


	Buffer.from = function(subject, encoding) {

		encoding = typeof encoding === 'string' ? encoding : 'utf8';


		if (subject instanceof ArrayBuffer) {

			let tmp    = new Uint8Array(subject);
			let length = tmp.length;
			let buffer = new Buffer(length);

			for (let b = 0; b < length; b++) {
				buffer[b] = tmp[b];
			}

			return buffer;

		} else if (subject instanceof Buffer) {

			let length = subject.length;
			let buffer = new Buffer(length);

			for (let b = 0; b < length; b++) {
				buffer[b] = subject[b];
			}

			return buffer;

		} else if (subject instanceof Array || subject instanceof Uint8Array || subject instanceof Int8Array) {

			let length = typeof subject.length === 'number' ? (subject.length | 0) : 0;
			let buffer = new Buffer(length);

			for (let b = 0; b < length; b++) {
				buffer[b] = subject[b] & 0xff;
			}

			return buffer;

		} else if (typeof subject === 'string' && encoding !== null) {

			let length = Buffer.byteLength(subject, encoding);
			let buffer = new Buffer(length);

			buffer.write(subject, 0, encoding);

			return buffer;

		}


		return null;

	};


	Buffer.isBuffer = function(buffer) {

		if (buffer instanceof Buffer) {
			return true;
		} else if (Object.prototype.toString.call(buffer) === '[object Buffer]') {
			return true;
		} else if (Object.prototype.toString.call(buffer) === '[object Uint8Array]') {
			return true;
		}


		return false;

	};


	Buffer.prototype = {

		[Symbol.toStringTag]: 'Buffer',

		toJSON: function() {

			let data = [];

			for (let b = 0; b < this.length; b++) {
				data[b] = this[b];
			}

			return {
				type: 'Buffer',
				data: data
			};

		},

		copy: function(target, target_start, start, end) {

			target_start = typeof target_start === 'number' ? (target_start | 0) : 0;
			start        = typeof start === 'number'        ? (start | 0)        : 0;
			end          = typeof end === 'number'          ? (end   | 0)        : this.length;


			if (start === end)       return 0;
			if (target.length === 0) return 0;
			if (this.length === 0)   return 0;


			end = Math.min(end, this.length);

			let diff        = end - start;
			let target_diff = target.length - target_start;
			if (target_diff < diff) {
				end = target_diff + start;
			}


			for (let b = 0; b < diff; b++) {
				target[b + target_start] = this[b + start];
			}

			return diff;

		},

		fill: function(value, start, end) {

			let val  = typeof value === 'number' ? ([ value | 0 ]) : [ 0 ];
			start    = typeof start === 'number' ? (start | 0)     : 0;
			end      = typeof end === 'number'   ? (end   | 0)     : this.length;


			if (typeof value === 'string') {

				if (value.length > 1) {

					val = [];

					for (let v = 0; v < value.length; v++) {
						val.push(value.charCodeAt(v) & 0xff);
					}

				} else if (value.length === 1) {
					val = [ value.charCodeAt(0) & 0xff ];
				}

			}


			if (start === end)     return this;
			if (this.length === 0) return this;


			if (start < end && start < this.length && end <= this.length) {

				if (val.length > 1) {

					for (let b = start, v = 0; b < end; b++) {

						this[b] = val[v];

						v++;
						v %= val.length;

					}

				} else {

					for (let b = start; b < end; b++) {
						this[b] = val[0];
					}

				}

			}


			return this;

		},

		includes: function(value, start, encoding) {
			return this.indexOf(value, start, encoding) !== -1;
		},

		indexOf: function(value, start, encoding) {

			let val  = Buffer.isBuffer(value)       ? value       : null;
			start    = typeof start === 'number'    ? (start | 0) : 0;
			encoding = typeof encoding === 'string' ? encoding    : 'utf8';


			if (val === null) {
				val = Buffer.from(value, encoding);
			}


			let index = -1;

			for (let b = start; b < this.length; b++) {

				let found = 0;

				for (let v = 0; v < val.length; v++) {

					if (this[b + v] === val[v]) {

						found++;

						if (found === val.length) {
							index = b;
							break;
						}

					} else {
						break;
					}

				}

				if (index !== -1) {
					break;
				} else if (index === -1) {
					found = 0;
				}

			}

			return index;

		},

		lastIndexOf: function(value, start, encoding) {

			let length = this.length;

			let val  = Buffer.isBuffer(value)       ? value       : null;
			start    = typeof start === 'number'    ? (start | 0) : length;
			encoding = typeof encoding === 'string' ? encoding    : 'utf8';

			if (val === null) {
				val = Buffer.from(value, encoding);
			}

			start = Math.min(start, length);
			start = Math.max(start, val.length);


			let index = -1;

			if (length > val.length) {

				for (let b = start; b >= 0; b--) {

					let found = 0;

					for (let v = 0; v < val.length; v++) {

						if (this[b + v] === val[v]) {

							found++;

							if (found === val.length) {
								index = b;
								break;
							}

						} else {
							break;
						}

					}

					if (index !== -1) {
						break;
					} else if (index === -1) {
						found = 0;
					}

				}

			}

			return index;

		},

		map: function(callback) {

			callback = typeof callback === 'function' ? callback : null;


			if (callback === null) {
				throw new TypeError('The "callback" argument must be a function.');
			}


			let clone = Buffer.alloc(this.length);

			for (let b = 0; b < this.length; b++) {
				clone[b] = callback(this[b], b) & 0xff;
			}

			return clone;

		},

		slice: function(start, end) {

			let length = this.length;

			if (typeof start === 'number') {

				if (start < 0) {
					start += length;
					start  = start > 0 ? start : 0;
				}

				if (end === undefined) {
					end = length;
				}

			}

			start = typeof start === 'number' ? (start | 0) : 0;
			end   = typeof end === 'number'   ? (end   | 0) : length;

			start = Math.min(start, length);
			start = Math.max(start, 0);
			end   = Math.min(end,   length);
			end   = Math.max(end,   0);


			let diff  = end - start;
			let clone = Buffer.alloc(diff);

			for (let b = 0; b < diff; b++) {
				clone[b] = this[b + start];
			}

			return clone;

		},

		write: function(str, offset, length, encoding) {

			offset   = typeof offset === 'number'   ? offset   : 0;
			encoding = typeof encoding === 'string' ? encoding : 'utf8';

			if (offset < 0 || offset > this.length) {
				throw new RangeError('The "offset" argument is out of range. It must be >= 0 && <= ' + this.length + '.');
			}


			let remaining = this.length - offset;

			if (length === undefined) {

				length = remaining;

			} else if (typeof length === 'string') {

				encoding = length;
				length   = remaining;

			} else {

				if (length > remaining) {
					length = remaining;
				}

			}


			let diff = 0;

			if (encoding === 'ascii') {
				diff = _copy_buffer(_ascii_to_bytes(str), this, offset, length);
			} else if (encoding === 'base64') {
				diff = _copy_buffer(_base64_to_bytes(str), this, offset, length);
			} else if (encoding === 'binary') {
				diff = _copy_buffer(_binary_to_bytes(str), this, offset, length);
			} else if (encoding === 'hex') {
				diff = _copy_hexadecimal(str, this, offset, length);
			} else if (encoding === 'latin1') {
				diff = _copy_buffer(_binary_to_bytes(str), this, offset, length);
			} else if (encoding === 'utf8' || encoding === 'utf-8') {
				diff = _copy_buffer(_utf8_to_bytes(str),   this, offset, length);
			}

			return diff;

		},

		toString: function(encoding, start, end) {

			encoding = typeof encoding === 'string' ? encoding : 'utf8';
			start    = typeof start === 'number'    ? start    : 0;
			end      = typeof end === 'number'      ? end      : this.length;

			start = Math.min(start, this.length);
			start = Math.max(start, 0);

			if (start === end)        return '';
			if (start >= this.length) return '';
			if (end <= start)         return '';


			let str = '';

			if (encoding === 'ascii') {
				str = _ascii_to_string(this, start, end);
			} else if (encoding === 'base64') {
				str = _base64_to_string(this, start, end);
			} else if (encoding === 'binary') {
				str = _binary_to_string(this, start, end);
			} else if (encoding === 'hex') {
				str = _hex_to_string(this, start, end);
			} else if (encoding === 'latin1') {
				str = _binary_to_string(this, start, end);
			} else if (encoding === 'utf8' || encoding === 'utf-8') {
				str = _utf8_to_string(this,   start, end);
			}

			return str;

		}

	};

	if (typeof global.Buffer === 'undefined') {
		global.Buffer = Buffer;
	}

	return Buffer;

})(typeof global !== 'undefined' ? global : (typeof window !== 'undefined' ? window : this));

export const isBuffer = Buffer.isBuffer;

