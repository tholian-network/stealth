
import { Buffer } from 'buffer';



const HTTP = {

	receive: function(socket, buffer, callback) {

		buffer   = buffer instanceof Buffer       ? buffer   : null;
		callback = typeof callback === 'function' ? callback : null;


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

		data = data instanceof Object ? data : {};


		let blob    = [];
		let headers = data.headers || {};
		let payload = data.payload || null;


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

			if (typeof payload === 'string') {
				socket.write(payload, 'utf8');
			} else if (payload instanceof Buffer) {
				socket.write(payload);
			} else if (payload instanceof Object) {
				socket.write(JSON.stringify(payload, null, '\t'));
			}

		}

		socket.end();

	}

};


export { HTTP };

