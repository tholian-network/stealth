
import fs         from 'fs';
import { Buffer } from 'buffer';
import { MIME   } from './MIME.mjs';



const _redirect = function(socket, url) {

	let blob = [];

	blob.push('HTTP/1.1 301 Moved Permanently');
	blob.push('Location: ' + url);
	blob.push('');

	socket.write(blob.join('\r\n'));

};

const _serve_404 = function(socket, url) {

	console.log(url + ' -> 404');

	let blob = [];

	blob.push('HTTP/1.1 404 Not Found');
	blob.push('');
	blob.push('');

	socket.write(blob.join('\r\n'));
	socket.end();

};

const _serve = function(socket, url) {

	let mime = MIME.get(url);
	let root = this.root;


	if (mime.binary === true) {

		fs.readFile(root + url, (err, buffer) => {

			if (!err) {

				let blob = [];

				blob.push('HTTP/1.1 200 OK');
				blob.push('Content-Type: '   + mime.type);
				blob.push('Content-Length: ' + Buffer.byteLength(buffer));
				blob.push('');
				blob.push('');

				socket.write(blob.join('\r\n'));
				socket.write(buffer);
				socket.end();

			} else {

				_serve_404.call(this, socket, url);

			}

		});

	} else {

		fs.readFile(root + url, 'utf8', (err, buffer) => {

			if (!err) {

				let blob = [];

				blob.push('HTTP/1.1 200 OK');
				blob.push('Content-Type: '   + mime.type);
				blob.push('Content-Length: ' + buffer.length);
				blob.push('');
				blob.push('');

				socket.write(blob.join('\r\n'));
				socket.write(buffer, 'utf8');
				socket.end();

			} else {

				_serve_404.call(this, socket, url);

			}

		});

	}

};


const HTTP = function(stealth) {

	this.root = stealth.root;

};


HTTP.prototype = {

	receive: function(socket, blob) {

		let raw     = blob.toString('utf8').split('\n').map(line => line.trim());
		let tmp     = raw[0].split(' ');
		let headers = {};

		if (/^(OPTIONS|GET|HEAD|POST|PUT|DELETE|TRACE|CONNECT|PATCH)$/g.test(tmp[0])) {
			headers['method'] = tmp[0];
		}

		if (tmp[1].startsWith('/')) {
			headers['url'] = tmp[1];
		}

		raw.slice(1).filter(line => line.trim() !== '').forEach(line => {

			let key = line.split(':')[0].trim().toLowerCase();
			let val = line.split(':').slice(1).join(':').trim();

			headers[key] = val;

		});


		if (headers['url'] === '/') {

			_redirect.call(this, socket, '/browser/index.html');

		} else if (headers['url'].startsWith('/browser')) {

			_serve.call(this, socket, headers['url']);

		} else if (headers['url'] === '/favicon.ico') {

			_serve.call(this, socket, '/browser/favicon.ico');

		} else {

			_serve_404.call(this, socket, headers['url']);

		}

	}

};


export { HTTP };

