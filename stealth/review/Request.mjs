
import { isFunction                               } from '../../base/index.mjs';
import { after, before, describe, finish, EXAMPLE } from '../../covert/index.mjs';
import { Request, isRequest                       } from '../../stealth/source/Request.mjs';
import { DATETIME                                 } from '../../stealth/source/parser/DATETIME.mjs';
import { connect, disconnect                      } from './Server.mjs';


const mock_events = (request) => {

	let events = {
		start:    false,
		stop:     false,
		cache:    false,
		stash:    false,
		block:    false,
		mode:     false,
		connect:  false,
		download: false,
		optimize: false,
		response: false,
		redirect: false,
		error:    false
	};

	request.once('start',    () => { events.start    = true; });
	request.once('stop',     () => { events.stop     = true; });
	request.once('cache',    () => { events.cache    = true; });
	request.once('stash',    () => { events.stash    = true; });
	request.once('block',    () => { events.block    = true; });
	request.once('mode',     () => { events.mode     = true; });
	request.once('connect',  () => { events.connect  = true; });
	request.once('download', () => { events.download = true; });
	request.once('optimize', () => { events.optimize = true; });
	request.once('response', () => { events.response = true; });
	request.once('redirect', () => { events.redirect = true; });
	request.once('error',    () => { events.error    = true; });

	return events;

};

before(connect);

describe('new Request()', function(assert) {

	let mode    = EXAMPLE.toMode('https://example.com/index.html');
	let request = new Request({
		mode: mode,
		url:  EXAMPLE.toURL('https://example.com/index.html')
	}, this.server);

	assert(request.mode,     mode);
	assert(request.url.link, 'https://example.com/index.html');

	assert(Request.isRequest(request), true);
	assert(isRequest(request),         true);

});

describe('Request.from()', function(assert) {

	let mode    = EXAMPLE.toMode('https://example.com/does-not-exist.html');
	let request = Request.from({
		type: 'Request',
		data: {
			mode:  mode,
			url:   'https://example.com/does-not-exist.html',
			flags: {
				connect:   false,
				proxy:     true,
				refresh:   true,
				useragent: 'Some User/Agent 13.37',
				webview:   true
			}
		}
	});

	assert(request.get('connect'),   false);
	assert(request.get('proxy'),     true);
	assert(request.get('refresh'),   true);
	assert(request.get('useragent'), 'Some User/Agent 13.37');
	assert(request.get('webview'),   true);

	assert(request.mode,     mode);
	assert(request.url.link, 'https://example.com/does-not-exist.html');

});

describe('Request.isRequest()', function(assert) {

	let request = new Request();

	assert(typeof Request.isRequest, 'function');

	assert(Request.isRequest(request), true);

});

describe('isRequest()', function(assert) {

	let request = new Request();

	assert(typeof isRequest, 'function');

	assert(isRequest(request), true);

});

describe('Request.prototype.toJSON()', function(assert) {

	let mode    = EXAMPLE.toMode('https://example.com/does-not-exist.html');
	let request = Request.from({
		type: 'Request',
		data: {
			mode:  mode,
			url:   'https://example.com/does-not-exist.html',
			flags: {
				webview: true
			}
		}
	});

	let json = request.toJSON();

	assert(json.type, 'Request');
	assert(json.data, {
		mode:     mode,
		url:      'https://example.com/does-not-exist.html',
		download: null,
		flags:    {
			connect:   true,
			proxy:     false,
			refresh:   false,
			useragent: null,
			webview:   true
		},
		timeline: {
			error:    null,
			stop:     null,
			redirect: null,
			start:    null,
			cache:    null,
			stash:    null,
			block:    null,
			mode:     null,
			connect:  null,
			download: null,
			optimize: null,
			response: null
		},
		events: [
			'start',
			'stop',
			'cache',
			'stash',
			'block',
			'mode',
			'connect',
			'download',
			'optimize',
			'redirect',
			'response'
		],
		journal: []
	});

});

describe('Request.prototype.get()', function(assert) {

	let request = new Request();

	assert(request.get(null),        null);
	assert(request.get('connect'),   true);
	assert(request.get('proxy'),     false);
	assert(request.get('refresh'),   false);
	assert(request.get('useragent'), null);
	assert(request.get('webview'),   false);

	assert(request.get('does-not-exist'), null);

});

describe('Request.prototype.set()', function(assert) {

	let request = new Request();

	assert(request.get('connect'),        true);
	assert(request.set('connect', false), true);
	assert(request.get('connect'),        false);

	assert(request.get('useragent'),                          null);
	assert(request.set('useragent', 'Some User/Agent 13.37'), true);
	assert(request.get('useragent'),                          'Some User/Agent 13.37');

	assert(request.get('does-not-exist'),         null);
	assert(request.set('does-not-exist', '1337'), false);
	assert(request.get('does-not-exist'),         null);
	assert(request.get('does-not-exist'),         null);
	assert(request.set('does-not-exist', true),   false);
	assert(request.get('does-not-exist'),         null);
	assert(request.set('does-not-exist', false),  false);
	assert(request.get('does-not-exist'),         null);

});

describe('Request.prototype.start()', function(assert) {

	let request = new Request({
		mode: EXAMPLE.toMode('https://example.com/index.html'),
		url:  EXAMPLE.toURL('https://example.com/index.html')
	}, this.server);
	let events  = mock_events(request);

	request.once('response', () => {

		setTimeout(() => {

			assert(events, {
				start:    true,
				stop:     false,
				cache:    true,
				stash:    true,
				block:    true,
				mode:     true,
				connect:  true,
				download: true,
				optimize: true,
				response: true,
				redirect: false,
				error:    false
			});

			assert(DATETIME.isDATETIME(request.timeline.start),    true);
			assert(DATETIME.isDATETIME(request.timeline.cache),    true);
			assert(DATETIME.isDATETIME(request.timeline.stash),    true);
			assert(DATETIME.isDATETIME(request.timeline.block),    true);
			assert(DATETIME.isDATETIME(request.timeline.mode),     true);
			assert(DATETIME.isDATETIME(request.timeline.connect),  true);
			assert(DATETIME.isDATETIME(request.timeline.download), true);
			assert(DATETIME.isDATETIME(request.timeline.optimize), true);
			assert(DATETIME.isDATETIME(request.timeline.response), true);
			assert(request.timeline.redirect,                      null);
			assert(request.timeline.error,                         null);

		}, 0);

	});

	assert(request.start(), true);

});

describe('Request.prototype.start()/cache', function(assert) {

	let request = new Request({
		mode: EXAMPLE.toMode('https://example.com/index.html'),
		url:  EXAMPLE.toURL('https://example.com/index.html')
	}, this.server);
	let events  = mock_events(request);

	setTimeout(() => {

		assert(events, {
			start:    true,
			stop:     false,
			cache:    true,
			stash:    false,
			block:    false,
			mode:     false,
			connect:  false,
			download: false,
			optimize: true,
			response: true,
			redirect: false,
			error:    false
		});

		assert(DATETIME.isDATETIME(request.timeline.start),    true);
		assert(DATETIME.isDATETIME(request.timeline.cache),    true);
		assert(request.timeline.stash,                         null);
		assert(request.timeline.block,                         null);
		assert(request.timeline.mode,                          null);
		assert(request.timeline.connect,                       null);
		assert(request.timeline.download,                      null);
		assert(DATETIME.isDATETIME(request.timeline.optimize), true);
		assert(DATETIME.isDATETIME(request.timeline.response), true);
		assert(request.timeline.redirect,                      null);
		assert(request.timeline.error,                         null);

	}, 500);

	assert(request.start(), true);

});

describe('Redirect.prototype.save()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.redirect.save), true);

	this.server.services.redirect.save({
		domain:   'example.com',
		path:     '/redirect',
		location: 'https://example.com/index.html'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'redirect',
				event:   'save'
			},
			payload: true
		});

	});

});

describe('Request.prototype.start()/redirect', function(assert) {

	let request = new Request({
		mode: EXAMPLE.toMode('https://example.com/redirect'),
		url:  EXAMPLE.toURL('https://example.com/redirect')
	}, this.server);


	request.once('redirect', (response) => {

		assert(response, {
			headers: {
				location: 'https://example.com/index.html'
			},
			payload: null
		});

	});

	assert(request.start(), true);

});

describe('Cache.prototype.remove()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.cache.remove), true);

	this.server.services.cache.remove({
		domain: 'example.com',
		path:   '/index.html'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'cache',
				event:   'remove'
			},
			payload: true
		});

	});

});

describe('Request.prototype.stop()', function(assert) {

	let request = new Request({
		mode: EXAMPLE.toMode('https://example.com/index.html'),
		url:  EXAMPLE.toURL('https://example.com/index.html')
	}, this.server);
	let events  = mock_events(request);


	request.once('connect', () => {
		assert(request.stop(), true);
	});


	setTimeout(() => {

		assert(events, {
			start:    true,
			stop:     true,
			cache:    true,
			stash:    true,
			block:    true,
			mode:     true,
			connect:  true,
			download: true,
			optimize: false,
			response: false,
			redirect: false,
			error:    false
		});

		assert(DATETIME.isDATETIME(request.timeline.start),    true);
		assert(DATETIME.isDATETIME(request.timeline.cache),    true);
		assert(DATETIME.isDATETIME(request.timeline.stash),    true);
		assert(DATETIME.isDATETIME(request.timeline.block),    true);
		assert(DATETIME.isDATETIME(request.timeline.mode),     true);
		assert(DATETIME.isDATETIME(request.timeline.connect),  true);
		assert(DATETIME.isDATETIME(request.timeline.download), true);
		assert(request.timeline.optimize,                      null);
		assert(request.timeline.response,                      null);
		assert(request.timeline.redirect,                      null);
		assert(request.timeline.error,                         null);

	}, 500);

	assert(request.start(), true);

});

after(disconnect);


export default finish('stealth/Request', {
	internet: true
});

