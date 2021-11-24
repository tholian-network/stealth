
import { isFunction                      } from '../../base/index.mjs';
import { after, before, describe, finish } from '../../covert/index.mjs';
import { Request, isRequest              } from '../../stealth/source/Request.mjs';
import { DATETIME                        } from '../../stealth/source/parser/DATETIME.mjs';
import { UA                              } from '../../stealth/source/parser/UA.mjs';
import { URL                             } from '../../stealth/source/parser/URL.mjs';
import { connect, disconnect             } from '../../stealth/review/Server.mjs';



before(connect);

describe('new Request()', function(assert) {

	let mode    = { domain: 'example.com', mode: { text: true, image: false, audio: false, video: false, other: false }};
	let request = new Request({
		mode: mode,
		url:  URL.parse('https://example.com/index.html')
	}, this.server.services);

	assert(request.mode,     mode);
	assert(request.url.link, 'https://example.com/index.html');

	assert(Request.isRequest(request), true);
	assert(isRequest(request),         true);

});

describe('Request.from()', function(assert) {

	assert(isFunction(Request.from), true);

	let mode      = { domain: 'example.com', mode: { text: true, image: false, audio: false, video: false, other: false }};
	let useragent = { engine: 'safari', platform: 'browser', system: 'desktop', version: '12.0' };
	let policy    = { domain: 'example.com', policies: [{ path: '/clickbait.html', query: 'ad&tracker' }] };
	let redirect  = { domain: 'example.com', redirects: [{ path: '/redirect', query: 'origin=123', location: 'https://example.com/location.html' }] };
	let refresh   = true;
	let url       = URL.parse('https://example.com/does-not-exist.html');

	let request = Request.from({
		type: 'Request',
		data: {
			mode:      mode,
			policy:    policy,
			redirect:  redirect,
			refresh:   refresh,
			useragent: UA.render(useragent),
			url:       URL.render(url)
		}
	});

	assert(request.mode,     mode);
	assert(request.policy,   policy);
	assert(request.redirect, redirect);
	assert(request.refresh,  refresh);
	assert(request.url.link, 'https://example.com/does-not-exist.html');

});

describe('Request.isRequest()', function(assert) {

	let request = new Request();

	assert(isFunction(Request.isRequest), true);

	assert(Request.isRequest(request), true);

});

describe('isRequest()', function(assert) {

	let request = new Request();

	assert(isFunction(isRequest), true);

	assert(isRequest(request), true);

});

describe('Request.prototype.toJSON()', function(assert) {

	let request = Request.from({
		type: 'Request',
		data: {
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
			policy: {
				domain:   'example.com',
				policies: [{
					path:  '/clickbait.html',
					query: 'ad&tracker'
				}]
			},
			redirect: {
				domain:    'example.com',
				redirects: [{
					path:     '/redirect',
					query:    'origin=123',
					location: 'https://example.com/location.html'
				}]
			},
			refresh: true,
			useragent: UA.render({
				engine:   'safari',
				platform: 'browser',
				system:   'desktop',
				version:  '12.0'
			}),
			url: 'https://example.com/does-not-exist.html'
		}
	});

	let json = request.toJSON();

	assert(json.type, 'Request');
	assert(json.data, {
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
		policy: {
			domain:   'example.com',
			policies: [{
				path:  '/clickbait.html',
				query: 'ad&tracker'
			}]
		},
		redirect: {
			domain:    'example.com',
			redirects: [{
				path:     '/redirect',
				query:    'origin=123',
				location: 'https://example.com/location.html'
			}]
		},
		url: 'https://example.com/does-not-exist.html',
		download: {
			bandwidth:  -1,
			connection: null,
			percentage: '???.??%'
		},
		timeline: [],
		events: [
			'@blocker',
			'@mode',
			'@policy',
			'@cache',
			'@host',
			'@download',
			'@optimize',
			'error',
			'redirect',
			'response'
		],
		journal: []
	});

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
	}, this.server.services);

	request.once('response', (response) => {

		let data   = request.toJSON().data;
		let events = data.timeline.map((e) => e.event);

		assert(events, [
			'@start',
			'@blocker',
			'@mode',
			'@policy',
			'@cache',
			'@host',
			'@download',
			'@optimize',
			'response'
		]);

		assert(response.headers, {
			'@status':        200,
			'content-length': 1256,
			'content-type':   'text/html',
			'last-modified':  DATETIME.parse('2019-10-17 07:18:26')
		});

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
	}, this.server.services);

	request.once('response', (response) => {

		let data   = request.toJSON().data;
		let events = data.timeline.map((e) => e.event);

		assert(events, [
			'@start',
			'@blocker',
			'@mode',
			'@policy',
			'@cache',
			'@optimize',
			'response'
		]);

		assert(response.headers, {
			'@status':        200,
			'content-length': 1256,
			'content-type':   'text/html',
			'last-modified':  DATETIME.parse('2019-10-17 07:18:26')
		});

	});

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
	}, this.server.services);

	request.once('redirect', (response) => {

		let data   = request.toJSON().data;
		let events = data.timeline.map((e) => e.event);

		assert(events, [
			'@start',
			'@blocker',
			'@mode',
			'@policy',
			'redirect'
		]);

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
	}, this.server.services);

	request.once('redirect', (response) => {

		let data   = request.toJSON().data;
		let events = data.timeline.map((e) => e.event);

		assert(events, [
			'@start',
			'redirect'
		]);

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
	}, this.server.services);


	request.once('@download', () => {
		assert(request.stop(), true);
	});

	request.once('error', (err) => {

		let data   = request.toJSON().data;
		let events = data.timeline.map((e) => e.event);

		assert(events, [
			'@start',
			'@blocker',
			'@mode',
			'@policy',
			'@cache',
			'@host',
			'@download',
			'@stop',
			'error'
		]);

		assert(err, {
			type:  'connection',
			cause: 'socket-stability'
		});

	});

	assert(request.start(), true);

});

after(disconnect);


export default finish('stealth/Request', {
	internet: true,
	network:  true
});

