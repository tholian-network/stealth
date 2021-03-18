
import { isFunction                      } from '../../base/index.mjs';
import { after, before, describe, finish } from '../../covert/index.mjs';
import { Request, isRequest              } from '../../stealth/source/Request.mjs';
import { DATETIME                        } from '../../stealth/source/parser/DATETIME.mjs';
import { URL                             } from '../../stealth/source/parser/URL.mjs';
import { connect, disconnect             } from './Server.mjs';



const mock_events = (request) => {

	let events = {

		error:    false,
		redirect: false,
		stop:     false,

		start:    false,
		block:    false,
		mode:     false,
		policy:   false,
		cache:    false,
		stash:    false,
		connect:  false,
		download: false,
		optimize: false,
		response: false

	};

	request.once('error',    () => { events.error    = true; });
	request.once('redirect', () => { events.redirect = true; });
	request.once('stop',     () => { events.stop     = true; });

	request.once('start',    () => { events.start    = true; });
	request.once('block',    () => { events.block    = true; });
	request.once('mode',     () => { events.mode     = true; });
	request.once('policy',   () => { events.policy   = true; });
	request.once('cache',    () => { events.cache    = true; });
	request.once('stash',    () => { events.stash    = true; });
	request.once('connect',  () => { events.connect  = true; });
	request.once('download', () => { events.download = true; });
	request.once('optimize', () => { events.optimize = true; });
	request.once('response', () => { events.response = true; });

	return events;

};



before(connect);

describe('new Request()', function(assert) {

	let mode    = { domain: 'example.com', mode: { text: true, image: false, audio: false, video: false, other: false }};
	let request = new Request({
		mode: mode,
		url:  URL.parse('https://example.com/index.html')
	}, this.server);

	assert(request.mode,     mode);
	assert(request.url.link, 'https://example.com/index.html');

	assert(Request.isRequest(request), true);
	assert(isRequest(request),         true);

});

describe('Request.from()', function(assert) {

	let mode    = { domain: 'example.com', mode: { text: true, image: false, audio: false, video: false, other: false }};
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

	let mode     = {
		domain: 'example.com',
		mode: {
			text:  true,
			image: false,
			audio: false,
			video: false,
			other: false
		}
	};
	let policy   = {
		domain:   'example.com',
		policies: [{
			path:  '/clickbait.html',
			query: 'ad&tracker'
		}]
	};
	let redirect = {
		domain:    'example.com',
		redirects: [{
			path:     '/redirect',
			query:    'origin=123',
			location: 'https://example.com/location.html'
		}]
	};
	let request  = Request.from({
		type: 'Request',
		data: {
			mode:     mode,
			policy:   policy,
			redirect: redirect,
			url:      'https://example.com/does-not-exist.html',
			flags: {
				webview: true
			}
		}
	});

	let json = request.toJSON();

	assert(json.type, 'Request');
	assert(json.data, {
		mode:     mode,
		policy:   policy,
		redirect: redirect,
		url:      'https://example.com/does-not-exist.html',
		download: {
			bandwidth:  -1,
			connection: null,
			percentage: '???.??%'
		},
		flags:    {
			connect:   true,
			proxy:     false,
			refresh:   false,
			useragent: null,
			webview:   true
		},
		timeline: {

			error:    null,
			redirect: null,
			stop:     null,

			start:    null,
			block:    null,
			mode:     null,
			policy:   null,
			cache:    null,
			stash:    null,
			connect:  null,
			download: null,
			optimize: null,
			response: null

		},
		events: [

			'start',
			'stop',
			'block',
			'mode',
			'policy',
			'cache',
			'stash',
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
		mode: {
			domain: 'example.com',
			mode: {
				text:  true,
				image: false,
				audio: false,
				video: false,
				other: false
			}
		},
		url: URL.parse('https://example.com/index.html')
	}, this.server);
	let events  = mock_events(request);

	request.once('response', () => {

		setTimeout(() => {

			assert(events, {

				error:    false,
				redirect: false,
				stop:     false,

				start:    true,
				block:    true,
				mode:     true,
				policy:   true,
				cache:    true,
				stash:    true,
				connect:  true,
				download: true,
				optimize: true,
				response: true

			});

			assert(request.timeline.error,                         null);
			assert(request.timeline.redirect,                      null);
			assert(request.timeline.stop,                          null);

			assert(DATETIME.isDATETIME(request.timeline.start),    true);
			assert(DATETIME.isDATETIME(request.timeline.block),    true);
			assert(DATETIME.isDATETIME(request.timeline.mode),     true);
			assert(DATETIME.isDATETIME(request.timeline.policy),   true);
			assert(DATETIME.isDATETIME(request.timeline.cache),    true);
			assert(DATETIME.isDATETIME(request.timeline.stash),    true);
			assert(DATETIME.isDATETIME(request.timeline.connect),  true);
			assert(DATETIME.isDATETIME(request.timeline.download), true);
			assert(DATETIME.isDATETIME(request.timeline.optimize), true);
			assert(DATETIME.isDATETIME(request.timeline.response), true);

		}, 0);

	});

	assert(request.start(), true);

});

describe('Request.prototype.start()/cache', function(assert) {

	let request = new Request({
		mode: {
			domain: 'example.com',
			mode: {
				text:  true,
				image: false,
				audio: false,
				video: false,
				other: false
			}
		},
		url: URL.parse('https://example.com/index.html')
	}, this.server);
	let events  = mock_events(request);

	setTimeout(() => {

		assert(events, {

			error:    false,
			redirect: false,
			stop:     false,

			start:    true,
			block:    true,
			mode:     true,
			policy:   true,
			cache:    true,
			stash:    false,
			connect:  false,
			download: false,
			optimize: true,
			response: true

		});

		assert(request.timeline.error,                         null);
		assert(request.timeline.redirect,                      null);
		assert(request.timeline.stop,                          null);

		assert(DATETIME.isDATETIME(request.timeline.start),    true);
		assert(DATETIME.isDATETIME(request.timeline.block),    true);
		assert(DATETIME.isDATETIME(request.timeline.mode),     true);
		assert(DATETIME.isDATETIME(request.timeline.policy),   true);
		assert(DATETIME.isDATETIME(request.timeline.cache),    true);
		assert(request.timeline.stash,                         null);
		assert(request.timeline.connect,                       null);
		assert(request.timeline.download,                      null);
		assert(DATETIME.isDATETIME(request.timeline.optimize), true);
		assert(DATETIME.isDATETIME(request.timeline.response), true);

	}, 500);

	assert(request.start(), true);

});

describe('Policy.prototype.save()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.policy.save), true);

	this.server.services.policy.save({
		domain: 'example.com',
		policies: [{
			path:  '/policy.html',
			query: 'foo&bar*'
		}]
	}, (response) => {

		assert(response, {
			headers: {
				service: 'policy',
				event:   'save'
			},
			payload: true
		});

	});

});

describe('Request.prototype.start()/policy', function(assert) {

	let request = new Request({
		mode: {
			domain: 'example.com',
			mode: {
				text:  true,
				image: false,
				audio: false,
				video: false,
				other: false
			}
		},
		url: URL.parse('https://example.com/policy.html?foo=bar&bar123=456&track=123')
	}, this.server);
	let events  = mock_events(request);

	setTimeout(() => {

		assert(events, {

			error:    false,
			redirect: true,
			stop:     false,

			start:    true,
			block:    true,
			mode:     true,
			policy:   true,
			cache:    false,
			stash:    false,
			connect:  false,
			download: false,
			optimize: false,
			response: false

		});

		assert(request.timeline.error,                         null);
		assert(DATETIME.isDATETIME(request.timeline.redirect), true);
		assert(request.timeline.stop,                          null);

		assert(DATETIME.isDATETIME(request.timeline.start),    true);
		assert(DATETIME.isDATETIME(request.timeline.block),    true);
		assert(DATETIME.isDATETIME(request.timeline.mode),     true);
		assert(DATETIME.isDATETIME(request.timeline.policy),   true);
		assert(request.timeline.cache,                         null);
		assert(request.timeline.stash,                         null);
		assert(request.timeline.connect,                       null);
		assert(request.timeline.download,                      null);
		assert(request.timeline.optimize,                      null);
		assert(request.timeline.response,                      null);

	}, 500);

	request.once('redirect', (response) => {

		assert(response, {
			headers: {
				location: 'https://example.com/policy.html?bar123=456&foo=bar'
			},
			payload: null
		});

	});

	assert(request.start(), true);

});

describe('Redirect.prototype.save()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.redirect.save), true);

	this.server.services.redirect.save({
		domain:    'example.com',
		redirects: [{
			path:     '/redirect',
			query:    null,
			location: 'https://example.com/index.html'
		}]
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
		mode: {
			domain: 'example.com',
			mode: {
				text:  true,
				image: true,
				audio: true,
				video: true,
				other: true
			}
		},
		url: URL.parse('https://example.com/redirect')
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
		mode: {
			domain: 'example.com',
			mode: {
				text:  true,
				image: false,
				audio: false,
				video: false,
				other: false
			}
		},
		url: URL.parse('https://example.com/index.html')
	}, this.server);
	let events  = mock_events(request);


	request.once('connect', () => {
		assert(request.stop(), true);
	});


	setTimeout(() => {

		assert(events, {

			error:    false,
			redirect: false,
			stop:     true,

			start:    true,
			block:    true,
			mode:     true,
			policy:   true,
			cache:    true,
			stash:    true,
			connect:  true,
			download: true,
			optimize: false,
			response: false

		});

		assert(request.timeline.error,                         null);
		assert(request.timeline.redirect,                      null);
		assert(DATETIME.isDATETIME(request.timeline.stop),     true);

		assert(DATETIME.isDATETIME(request.timeline.start),    true);
		assert(DATETIME.isDATETIME(request.timeline.block),    true);
		assert(DATETIME.isDATETIME(request.timeline.mode),     true);
		assert(DATETIME.isDATETIME(request.timeline.policy),   true);
		assert(DATETIME.isDATETIME(request.timeline.cache),    true);
		assert(DATETIME.isDATETIME(request.timeline.stash),    true);
		assert(DATETIME.isDATETIME(request.timeline.connect),  true);
		assert(DATETIME.isDATETIME(request.timeline.download), true);
		assert(request.timeline.optimize,                      null);
		assert(request.timeline.response,                      null);

	}, 500);

	assert(request.start(), true);

});

after(disconnect);


export default finish('stealth/Request', {
	internet: true,
	network:  true
});

