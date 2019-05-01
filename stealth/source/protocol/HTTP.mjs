
import net        from 'net';
import zlib       from 'zlib';
import { Buffer } from 'buffer';

import { isBuffer, isFunction, isObject, isString } from '../POLYFILLS.mjs';

import { Emitter } from '../Emitter.mjs';



const decode_chunked = function(buffer) {

	let offset = 0;
	let stream = buffer.toString('utf8');
	let target = Buffer.from('', 'utf8');


	let pos = stream.indexOf('\r\n');
	let num = parseInt(stream.substr(0, pos), 16);
	let tmp = stream.substr(pos + 2, num);

	if (pos !== -1) {

		offset = pos + 2 + tmp.length + 2;
		target = Buffer.concat([ target, Buffer.from(tmp, 'utf8') ]);


		pos = stream.indexOf('\r\n', offset);
		num = parseInt(stream.substr(offset, pos), 16);
		tmp = stream.substr(pos + 2, num);


		while (pos !== -1 && Number.isNaN(num) === false && num >= 0) {

			offset = pos + 2 + tmp.length + 2;
			target = Buffer.concat([ target, Buffer.from(tmp, 'utf8') ]);

			pos = stream.indexOf('\r\n', offset);
			num = parseInt(stream.substr(offset, pos), 16);
			tmp = stream.substr(pos + 2, num);

		}

	}

	return target;

};

const decode_gzip = function(buffer) {
	return zlib.gunzipSync(buffer);
};

const encode_gzip = function(buffer) {
	return zlib.gzipSync(buffer);
};



export const onconnect = function(socket, ref, buffer, emitter) {

	if (ref.headers !== null) {

		let tmp0 = ref.headers['content-length'] || null;
		if (tmp0 !== null) {

			let num = parseInt(tmp0, 10);
			if (Number.isNaN(num) === false) {
				buffer.length = num;
			} else {
				buffer.length = null;
			}

		} else {
			buffer.length = null;
		}


		let tmp1 = ref.headers['@status']       || null;
		let tmp2 = ref.headers['content-range'] || null;
		if (tmp1 === '206 Partial Content' && tmp2 !== null) {

			if (ref.payload !== null) {
				buffer.partial = true;
				buffer.payload = Buffer.from(ref.payload);
				buffer.start   = ref.payload.length;
			} else {
				buffer.partial = true;
				buffer.payload = Buffer.from('', 'utf8');
				buffer.start   = 0;
			}

		} else {

			buffer.partial = false;
			buffer.payload = Buffer.from('', 'utf8');
			buffer.start   = 0;

		}

	} else {

		buffer.length  = null;
		buffer.partial = false;
		buffer.payload = Buffer.from('', 'utf8');
		buffer.start   = 0;

	}


	emitter.emit('@connect', [ socket ]);

};

export const ondata = function(socket, ref, buffer, emitter, fragment) {

	if (buffer._mode !== 'payload') {

		let tmp = buffer._temp || null;
		if (tmp !== null) {
			buffer._temp = Buffer.concat([ buffer._temp, fragment ]);
		} else {
			buffer._temp = fragment;
		}


		let check = buffer._temp.toString('utf8').indexOf('\r\n\r\n');
		if (check !== -1) {

			HTTP.receive(socket, buffer._temp, (response) => {

				buffer._mode = 'payload';


				if (ref.headers === null) {
					ref.headers = response.headers;
				}


				let tmp0 = response.headers['content-length'] || null;
				let tmp1 = response.headers['content-range']  || null;
				if (tmp0 !== null && buffer.length === null) {

					let num = parseInt(tmp0, 10);
					if (Number.isNaN(num) === false) {
						buffer.length = num;
					}

				} else if (tmp1 !== null && tmp1.includes('/') && buffer.length === null) {

					let num = parseInt(tmp1.split('/').pop(), 10);
					if (Number.isNaN(num) === false) {
						buffer.length = num;
					}

				} else {

					buffer.length = null;

				}


				let tmp2 = response.headers['content-encoding']  || null;
				let tmp3 = response.headers['transfer-encoding'] || null;
				if (tmp2 === 'gzip' || tmp3 === 'gzip') {
					buffer.encoding = 'gzip';
				} else if (tmp3 === 'chunked') {
					buffer.encoding = 'chunked';
				} else {
					buffer.encoding = 'identity';
				}


				let tmp4 = (response.headers['@status'] || '').split(' ').shift();
				let tmp5 = (response.headers['content-range'] || null);
				if (tmp4 === '206' && tmp5 !== null) {
					buffer.partial = true;
					buffer.payload = Buffer.concat([ buffer.payload, response.payload ]);
				} else if (tmp4 === '200') {
					buffer.partial = false;
					buffer.payload = response.payload;
				} else if (tmp4 === '416') {
					emitter.emit('error', [{ type: 'stash' }]);
				} else {

					buffer.partial = false;
					buffer.payload = response.payload;

					socket.removeAllListeners('data');
					socket.end();

				}


				if (buffer.length === buffer.payload.length) {
					socket.end();
				}

			});

		}

	} else if (buffer._mode === 'payload') {

		buffer.payload = Buffer.concat([ buffer.payload, fragment ]);


		emitter.emit('progress', [{
			headers: ref.headers,
			payload: buffer.payload
		}, {
			bytes:  buffer.payload.length,
			length: buffer.length
		}]);


		if (buffer.length === buffer.payload.length) {
			socket.end();
		}

	}

};

export const onend = function(socket, ref, buffer, emitter) {

	if (ref.headers !== null) {

		let code = (ref.headers['@status'] || '500').split(' ').shift();
		if (code === '200' || code === '204' || code === '205' || code === '206') {

			if (buffer.length === buffer.payload.length) {

				if (buffer.encoding === 'chunked') {
					buffer.payload = decode_chunked(buffer.payload);
					delete buffer.encoding;
				} else if (buffer.encoding === 'gzip') {
					buffer.payload = decode_gzip(buffer.payload);
					delete buffer.encoding;
				}


				let raw_payload = buffer.payload || null;
				if (raw_payload !== null) {

					// Check for potential JSON "{" (123) or "[" (91)
					if (raw_payload[0] === 123 || raw_payload[0] === 91) {

						try {
							buffer.payload = JSON.parse(raw_payload.toString('utf8'));
						} catch (err) {
							buffer.payload = raw_payload;
						}

					} else {

						buffer.payload = raw_payload;

					}

				}

				emitter.emit('response', [{
					headers: ref.headers,
					payload: buffer.payload
				}]);

			} else if (buffer.length < buffer.payload.length) {

				if (buffer.partial === true) {

					emitter.emit('timeout', [{
						headers: ref.headers,
						payload: buffer.payload
					}]);

				} else {
					emitter.emit('timeout', [ null ]);
				}

			} else {
				emitter.emit('error', [{ type: 'stash' }]);
			}

		} else if (code === '301' || code === '307' || code === '308') {

			let tmp = ref.headers['location'] || null;
			if (tmp !== null) {
				emitter.emit('redirect', [{ headers: ref.headers }]);
			} else {
				emitter.emit('error', [{ code: code, type: 'request', cause: 'headers-location' }]);
			}

		} else if (code.startsWith('4') && code.length === 3) {
			emitter.emit('error', [{ code: code, type: 'request', cause: 'headers-status' }]);
		} else if (code.startsWith('5') && code.length === 3) {
			emitter.emit('error', [{ code: code, type: 'request', cause: 'headers-status' }]);
		} else {
			emitter.emit('error', [{ code: code, type: 'request', cause: 'headers-status' }]);
		}

	} else {
		emitter.emit('timeout', [ null ]);
	}


	emitter.emit('@disconnect', [ socket ]);

};

export const onerror = function(socket, ref, buffer, emitter) {

	if (ref.headers !== null) {

		let code = (ref.headers['@status'] || '500').split(' ').shift();
		if (code === '200' || code === '204' || code === '205' || code === '206') {

			if (buffer.length === buffer.payload.length) {

				if (buffer.encoding === 'chunked') {
					buffer.payload = decode_chunked(buffer.payload);
					delete buffer.encoding;
				} else if (buffer.encoding === 'gzip') {
					buffer.payload = decode_gzip(buffer.payload);
					delete buffer.encoding;
				}


				let raw_payload = buffer.payload || null;
				if (raw_payload !== null) {

					// Check for potential JSON "{" (123) or "[" (91)
					if (raw_payload[0] === 123 || raw_payload[0] === 91) {

						try {
							buffer.payload = JSON.parse(raw_payload.toString('utf8'));
						} catch (err) {
							buffer.payload = raw_payload;
						}

					} else {

						buffer.payload = raw_payload;

					}

				}

			} else if (buffer.length < buffer.payload.length) {

				if (buffer.partial === true) {

					emitter.emit('timeout', [{
						headers: ref.headers,
						payload: buffer.payload
					}]);

				} else {
					emitter.emit('timeout', [ null ]);
				}

			} else {
				emitter.emit('error', [{ type: 'stash' }]);
			}

		} else if (code === '301' || code === '307' || code === '308') {

			let tmp = ref.headers['location'] || null;
			if (tmp !== null) {
				emitter.emit('redirect', [{ headers: ref.headers }]);
			} else {
				emitter.emit('error', [{ code: code, type: 'request', cause: 'headers-location' }]);
			}

		} else if (code.startsWith('4') && code.length === 3) {
			emitter.emit('error', [{ code: code, type: 'request', cause: 'headers-status' }]);
		} else if (code.startsWith('5') && code.length === 3) {
			emitter.emit('error', [{ code: code, type: 'request', cause: 'headers-status' }]);
		} else {
			emitter.emit('error', [{ code: code, type: 'request', cause: 'headers-status' }]);
		}

	} else {
		emitter.emit('timeout', [ null ]);
	}

};



const HTTP = {

	connect: function(ref, buffer, emitter) {

		ref     = isObject(ref)     ? ref     : null;
		buffer  = isObject(buffer)  ? buffer  : {};
		emitter = isObject(emitter) ? emitter : new Emitter();


		if (ref !== null) {

			let hosts = ref.hosts.sort((a, b) => {

				if (a.scope === 'private' && b.scope === 'private') {

					if (a.type === 'v4' && b.type === 'v4') return 0;
					if (a.type === 'v4') return -1;
					if (b.type === 'v4') return  1;

				}

				if (a.scope === 'private') return -1;
				if (b.scope === 'private') return  1;

				if (a.type === 'v4' && b.type === 'v4') return 0;
				if (a.type === 'v4') return -1;
				if (b.type === 'v4') return  1;

				return 0;

			});

			if (hosts.length > 0) {

				let socket = emitter.socket || null;
				if (socket === null) {

					socket = net.connect({
						host: hosts[0].ip,
						port: ref.port || 80,
					}, () => {

						onconnect(socket, ref, buffer, emitter);
						emitter.socket = socket;

					});

				}

				socket.on('data', (fragment) => {
					ondata(socket, ref, buffer, emitter, fragment);
				});

				socket.on('timeout', () => {

					if (emitter.socket !== null) {

						emitter.socket = null;

						if (buffer !== null && buffer.partial === true) {
							emitter.emit('timeout', [{
								headers: ref.headers,
								payload: buffer.payload
							}]);
						} else {
							emitter.emit('timeout', [ null ]);
						}

					}

				});

				socket.on('error', () => {

					if (emitter.socket !== null) {

						onerror(socket, ref, buffer, emitter);
						emitter.socket = null;

					}

				});

				socket.on('end', () => {

					if (emitter.socket !== null) {

						onend(socket, ref, buffer, emitter);
						emitter.socket = null;

					}

				});

				return emitter;

			} else {

				emitter.socket = null;
				emitter.emit('error', [{ type: 'host' }]);

				return null;

			}

		} else {

			emitter.socket = null;
			emitter.emit('error', [{ type: 'request' }]);

			return null;

		}

	},

	receive: function(socket, buffer, callback) {

		buffer   = Buffer.isBuffer(buffer) ? buffer   : null;
		callback = isFunction(callback)    ? callback : null;


		if (buffer !== null) {

			let headers     = {};
			let payload     = null;
			let raw_headers = '';
			let raw_payload = null;

			let raw   = buffer.toString('utf8');
			let index = raw.indexOf('\r\n\r\n');
			if (index !== -1) {

				if (raw.endsWith('\r\n\r\n')) {
					raw_headers = raw.substr(0, index);
					raw_payload = buffer.slice(index + 4, buffer.length - 4);
				} else {
					raw_headers = raw.substr(0, index);
					raw_payload = buffer.slice(index + 4);
				}

			} else {
				raw_headers = raw;
			}


			let tmp1 = raw_headers.split('\r\n').map((line) => line.trim());
			let tmp2 = tmp1.shift().split(' ');


			if (/^(OPTIONS|GET|HEAD|POST|PUT|DELETE|TRACE|CONNECT|PATCH)$/g.test(tmp2[0])) {

				headers['@method'] = tmp2[0];

				if (tmp2[1].startsWith('/')) {
					headers['@url'] = tmp2[1];
				} else if (tmp2[1].startsWith('http://') || tmp2[1].startsWith('https://')) {
					headers['@url'] = tmp2[1];
				}

			} else if (tmp2[0] === 'HTTP/1.1' || tmp2[0] === 'HTTP/1.0') {
				headers['@status'] = tmp2.slice(1).join(' ');
			}


			tmp1.filter((line) => line !== '').forEach((line) => {

				if (line.includes(':')) {

					let key = line.split(':')[0].trim().toLowerCase();
					let val = line.split(':').slice(1).join(':').trim();

					headers[key] = val;

				}

			});


			if (raw_payload !== null) {

				// Check for potential JSON "{" (123) or "[" (91)
				if (raw_payload[0] === 123 || raw_payload[0] === 91) {

					try {
						payload = JSON.parse(raw_payload.toString('utf8'));
					} catch (err) {
						payload = raw_payload;
					}

				} else {

					payload = raw_payload;

				}

			}


			if (callback !== null) {

				callback({
					headers: headers,
					payload: payload
				});

			} else {

				return {
					headers: headers,
					payload: payload
				};

			}

		} else {

			if (callback !== null) {
				callback(null);
			} else {
				return null;
			}

		}

	},

	send: function(socket, data) {

		data = isObject(data) ? data : { headers: {}, payload: null };


		let blob    = [];
		let headers = data.headers || {};
		let payload = data.payload || null;


		if (payload !== null) {

			if (isBuffer(payload)) {
				// Do nothing
			} else if (isString(payload)) {
				payload = Buffer.from(payload, 'utf8');
			} else if (isObject(payload)) {
				payload = Buffer.from(JSON.stringify(payload, null, '\t'), 'utf8');
			}


			let tmp1 = headers['content-encoding']  || null;
			let tmp2 = headers['transfer-encoding'] || null;

			if (tmp1 === 'gzip' || tmp2 === 'gzip') {

				payload = encode_gzip(payload);

			} else if (tmp2 === 'chunked') {

				// Don't embrace Legacy Encoding
				delete headers['transfer-encoding'];

			}

		}


		if (typeof headers['@method'] === 'string' && typeof headers['@path'] === 'string') {

			if (typeof headers['@query'] === 'string') {
				blob.push(headers['@method'] + ' ' + headers['@path'] + '?' + headers['@query'] + ' HTTP/1.1');
			} else {
				blob.push(headers['@method'] + ' ' + headers['@path'] + ' HTTP/1.1');
			}

		} else if (typeof headers['@method'] === 'string' && typeof headers['@url'] === 'string') {
			blob.push(headers['@method'] + ' ' + headers['@url'] + ' HTTP/1.1');
		} else if (typeof headers['@status'] === 'string') {
			blob.push('HTTP/1.1 ' + headers['@status']);
		} else {
			blob.push('HTTP/1.1 200 OK');
		}


		Object.keys(headers).filter((h) => h.startsWith('@') === false).forEach((name) => {

			let key = name.split('-').map((v) => v.charAt(0).toUpperCase() + v.substr(1).toLowerCase()).join('-');
			let val = headers[name];

			blob.push(key + ': ' + val);

		});


		blob.push('');
		blob.push('');


		socket.write(blob.join('\r\n'));

		if (payload !== null) {
			socket.end(payload);
		} else {
			socket.end();
		}

	}

};


export { HTTP };

