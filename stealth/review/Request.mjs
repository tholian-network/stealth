
import { isFunction, isObject                     } from '../../base/index.mjs';
import { after, before, describe, finish, EXAMPLE } from '../../covert/index.mjs';
import { Request, isRequest                       } from '../../stealth/source/Request.mjs';
import { connect, disconnect                      } from './Server.mjs';



before(connect);

describe('new Request()', function(assert) {

	let request = new Request({
		ref:    EXAMPLE.ref('https://example.com/index.html'),
		config: EXAMPLE.config('https://example.com/index.html')
	}, this.server);

	assert(request.ref.url, 'https://example.com/index.html');

	assert(Request.isRequest(request), true);
	assert(isRequest(request),         true);

});

describe('Request.from()', function(assert) {

	let config  = EXAMPLE.config('https://example.com/does-not-exist.html');
	let request = Request.from({
		type: 'Request',
		data: {
			url: 'https://example.com/does-not-exist.html',
			config: config,
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

	assert(request.url, 'https://example.com/does-not-exist.html');

	assert(request._settings.config, config);

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

	let config  = EXAMPLE.config('https://example.com/does-not-exist.html');
	let request = Request.from({
		type: 'Request',
		data: {
			url: 'https://example.com/does-not-exist.html',
			config: config,
			flags: {
				webview: true
			}
		}
	});

	let json = request.toJSON();

	assert(json.type, 'Request');
	assert(json.data, {
		url: 'https://example.com/does-not-exist.html',
		config: config,
		download: null,
		flags: {
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
		ref:    EXAMPLE.ref('https://example.com/index.html'),
		config: EXAMPLE.config('https://example.com/index.html')
	}, this.server);

	request.once('start', () => {
		assert(true);
	});

	request.once('cache', () => {
		assert(true);
	});

	request.once('stash', () => {
		assert(true);
	});

	request.once('block', () => {
		assert(true);
	});

	request.once('mode', () => {
		assert(true);
	});

	request.once('connect', () => {
		assert(true);
	});

	request.once('download', () => {
		assert(true);
	});

	request.once('optimize', () => {
		assert(true);
	});

	request.once('response', () => {
		assert(true);
	});

	assert(request.start(), true);

});

describe('Request.prototype.start()/cache', function(assert) {

	let request = new Request({
		ref:    EXAMPLE.ref('https://example.com/index.html'),
		config: EXAMPLE.config('https://example.com/index.html')
	}, this.server);


	let events = {
		cache:    false,
		stash:    false,
		connect:  false,
		download: false
	};

	request.once('cache', () => {
		events.cache = true;
	});

	request.once('stash', () => {
		events.stash = true;
	});

	request.once('connect', () => {
		events.connect = true;
	});

	request.once('download', () => {
		events.download = true;
	});

	request.once('response', () => {

		assert(events.cache,    true);
		assert(events.stash,    false);
		assert(events.connect,  false);
		assert(events.download, false);

		assert(request.timeline.cache !== null);
		assert(request.timeline.stash,    null);
		assert(request.timeline.connect,  null);
		assert(request.timeline.download, null);

	});

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

		assert(response !== null);
		assert(response.payload, true);

	});

});

describe('Request.prototype.start()/redirect', function(assert) {

	let request = new Request({
		ref:    EXAMPLE.ref('https://example.com/redirect'),
		config: EXAMPLE.config('https://example.com/redirect')
	}, this.server);


	request.once('redirect', (response) => {

		assert(response !== null);
		assert(isObject(response.headers), true);
		assert(response.headers.location, 'https://example.com/index.html');
		assert(response.payload, null);

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

		assert(response !== null);
		assert(response.payload, true);

	});

});

describe('Request.prototype.stop()', function(assert) {

	let request = new Request({
		ref:    EXAMPLE.ref('https://example.com/index.html'),
		config: EXAMPLE.config('https://example.com/index.html')
	}, this.server);


	let events = {
		cache:    false,
		stash:    false,
		connect:  false,
		download: false,
		error:    false,
		redirect: false,
		response: false
	};

	request.once('cache', () => {
		events.cache = true;
	});

	request.once('stash', () => {
		events.stash = true;
	});

	request.once('connect', () => {
		events.connect = true;
		assert(request.stop(), true);
	});

	request.once('download', () => {
		events.download = true;
	});

	request.once('error', () => {
		events.error = true;
	});

	request.once('redirect', () => {
		events.redirect = true;
	});

	request.once('response', () => {
		events.response = true;
	});

	setTimeout(() => {

		assert(events.cache,    true);
		assert(events.stash,    true);
		assert(events.connect,  true);
		assert(events.download, true);

		assert(events.error,    false);
		assert(events.redirect, false);
		assert(events.response, false);

	}, 500);

	assert(request.start(), true);

});

after(disconnect);


export default finish('stealth/Request', {
	internet: true
});

