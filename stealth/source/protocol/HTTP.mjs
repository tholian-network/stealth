
import { Buffer } from 'buffer';



const HTTP = {

	receive: function(socket, buffer, callback) {

		buffer   = buffer instanceof Buffer       ? buffer   : null;
		callback = typeof callback === 'function' ? callback : null;


		if (buffer !== null) {

			let headers = {};
			let payload = null;
			let raw_headers = '';
			let raw_payload = '';

			let raw = buffer.toString('utf8');
			if (raw.includes('\r\n\r\n')) {
				raw_headers = raw.split('\r\n\r\n')[0];
				raw_payload = raw.split('\r\n\r\n').slice(1).join('\r\n\r\n');
			} else {
				raw_headers = raw;
				raw_payload = '';
			}


			let tmp1 = raw_headers.split('\n').map(line => line.trim());
			let tmp2 = tmp1.shift().split(' ');

			if (/^(OPTIONS|GET|HEAD|POST|PUT|DELETE|TRACE|CONNECT|PATCH)$/g.test(tmp2[0])) {
				headers['method'] = tmp2[0];
			}

			if (tmp2[1].startsWith('/')) {
				headers['url'] = tmp2[1];
			}


			tmp1.filter(line => line !== '').forEach(line => {

				if (line.includes(':')) {

					let key = line.split(':')[0].trim().toLowerCase();
					let val = line.split(':').slice(1).join(':').trim();

					headers[key] = val;

				}

			});

			if (raw_payload.startsWith('{') || raw_payload.startsWith('[')) {

				try {
					payload = JSON.parse(raw_payload);
				} catch (err) {
					payload = null;
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
			blob.push(headers['@method'] + ' ' + headers['@path'] + ' HTTP/1.1');
		} else if (typeof headers['@status'] === 'string') {
			blob.push(headers['@status']);
		} else {
			blob.push('HTTP/1.1 200 OK');
		}


		Object.keys(headers).filter(h => h.startsWith('@') === false).forEach(key => {
			blob.push(key + ': ' + headers[key]);
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

