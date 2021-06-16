
import { Buffer, isBuffer, isFunction, isObject } from '../../base/index.mjs';
import { describe, finish                       } from '../../covert/index.mjs';
import { Download                               } from '../../stealth/source/Download.mjs';
import { IP                                     } from '../../stealth/source/parser/IP.mjs';
import { URL                                    } from '../../stealth/source/parser/URL.mjs';



describe('Download.from()', function(assert) {

	assert(isFunction(Download.from), true);

	let download = Download.from({
		type: 'Download',
		data: {
			ua:  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0 Safari/537.36',
			url: 'http://example.com/does-not-exist.html'
		}
	});

	assert(download.url.link, 'http://example.com/does-not-exist.txt');
	assert(download.ua,       {
		engine:   'chrome',
		platform: 'browser',
		system:   'desktop',
		version:  88.0
	});

	assert(download.payload, Buffer.from('This is the file content...', 'utf8'));

});

describe('Download.prototype.start()', function(assert) {

	let ua       = { engine: 'chrome', platform: 'browser', system: 'desktop', version: 88.0 };
	let url      = Object.assign(URL.parse('http://example.com:80/index.html'), { hosts: [ IP.parse('93.184.216.34'), IP.parse('2606:2800:0220:0001:0248:1893:25c8:1946') ] });
	let download = new Download({ ua: ua, url: url });

	download.once('response', (response) => {

		assert(isObject(response),         true);
		assert(isObject(response.headers), true);

		assert(response.headers['@status'],   '206 Partial Content');
		assert(response.headers['@transfer'], {
			'encoding': 'identity',
			'length':   1256,
			'range':    [ 0, 1255 ]
		});

		assert(response.headers['content-encoding'], 'identity');
		assert(response.headers['content-length'],   1256);
		assert(response.headers['content-type'],     'text/html; charset=UTF-8');
		assert(response.headers['vary'],             'Accept-Encoding');

		assert(isBuffer(response.payload), true);
		assert(response.payload.length,    1256);

	});

	assert(download.start(), true);

});

describe('Download.prototype.start()/partial', function(assert, console) {

	let ua       = { engine: 'chrome', platform: 'browser', system: 'desktop', version: 88.0 };
	let url      = Object.assign(URL.parse('http://mirror.rackspace.com/archlinux/iso/2021.06.01/archlinux-2021.06.01-x86_64.iso'), { hosts: [ IP.parse('94.236.26.35') ] });
	let download = new Download({ ua: ua, url: url });

	download.on('progress', (frame, progress) => {
		// console.log(frame);
		// console.log(progress);
	});

	setTimeout(() => {
		console.log(download.connection);
	}, 5000);

	download.once('response', (response) => {
		console.log(response);
		assert(true);
	});

	assert(download.start(), true);

});

// TODO: Implement Dummy Server for 200 OK and retry of Download
// TODO: Implement Dummy Server for 206 Partial Content and resume of Download
// TODO: Implement Dummy Server for 206 Partial Content and wrong Response Headers (wrong byte range) of Download


export default finish('stealth/Download', {
	internet: true,
	network:  false,
	ports:    [ 80, 443, 1080 ]
});

