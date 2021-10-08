
import { Buffer, isBuffer, isFunction, isObject } from '../../base/index.mjs';
import { describe, finish                       } from '../../covert/index.mjs';
import { Download                               } from '../../stealth/source/Download.mjs';
import { IP                                     } from '../../stealth/source/parser/IP.mjs';
import { UA                                     } from '../../stealth/source/parser/UA.mjs';
import { URL                                    } from '../../stealth/source/parser/URL.mjs';



describe('Download.from()', function(assert) {

	assert(isFunction(Download.from), true);

	let download = Download.from({
		type: 'Download',
		data: {
			ua:  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0 Safari/537.36',
			url: 'https://example.com/index.html'
		}
	});

	assert(download.connection, null);
	assert(download.url.link,   'https://example.com/index.html');
	assert(download.ua,         {
		engine:   'chrome',
		platform: 'browser',
		system:   'desktop',
		version:  '88.0'
	});


});

describe('Download.prototype.start()', function(assert) {

	let ua       = { engine: 'chrome', platform: 'browser', system: 'desktop', version: 88.0 };
	let url      = Object.assign(URL.parse('https://example.com/index.html'), { hosts: [ IP.parse('93.184.216.34'), IP.parse('2606:2800:0220:0001:0248:1893:25c8:1946') ] });
	let download = new Download({ ua: ua, url: url });

	download.once('response', (response) => {

		assert(download.toJSON().data.events, [
			'response'
		]);

		assert(isObject(response),         true);
		assert(isObject(response.headers), true);

		assert(response.headers['@status'],   206);
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

describe('Download.prototype.stop()', function(assert) {

	let ua       = { engine: 'chrome', platform: 'browser', system: 'desktop', version: 88.0 };
	let url      = Object.assign(URL.parse('https://ia802609.us.archive.org/35/items/pdfy-RtCf3CYEbjKrXgFe/A%20Hacker%20Manifesto%20-%20McKenzie%20Wark.pdf'), { hosts: [ IP.parse('207.241.228.229') ] });
	let download = new Download({ ua: ua, url: url });

	download.once('error', (error) => {

		assert(error, {
			type:  'connection',
			cause: 'socket-stability'
		});

		setTimeout(() => {
			assert(download.start(), true);
		}, 0);

	});

	download.once('progress', () => {

		setTimeout(() => {
			assert(download.stop(), true);
		}, 0);

	});

	download.once('response', (response) => {

		assert(isObject(response),         true);
		assert(isObject(response.headers), true);

		assert(response.headers['@status'],   206);
		assert(response.headers['@transfer'], {
			'encoding': 'identity',
			'length':   3498824,
			'range':    [ 0, 3498823 ]
		});

		assert(response.headers['content-encoding'], 'identity');
		assert(response.headers['content-length'],   3498824);
		assert(response.headers['content-type'],     'application/pdf');

		assert(isBuffer(response.payload), true);
		assert(response.payload.length,    3498824);

	});

	assert(download.start(), true);

});

describe('Download.prototype.start()/206', function(assert, console) {

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

