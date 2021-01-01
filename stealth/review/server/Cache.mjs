
import { isBuffer, isFunction, isNumber, isObject, isString } from '../../../base/index.mjs';
import { after, before, describe, finish                    } from '../../../covert/index.mjs';
import { Cache                                              } from '../../../stealth/source/server/Cache.mjs';
import { DATETIME                                           } from '../../../stealth/source/parser/DATETIME.mjs';
import { connect, disconnect                                } from '../Server.mjs';



before(connect);

describe('new Cache()', function(assert) {

	assert(this.server !== null);
	assert(this.server.services.cache instanceof Cache, true);

});

describe('Cache.prototype.toJSON()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.cache.toJSON), true);

	assert(this.server.services.cache.toJSON(), {
		type: 'Cache Service',
		data: {
			events:  [],
			journal: []
		}
	});

});

describe('Cache.prototype.save()/1', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.cache.save), true);

	this.server.services.cache.save({
		domain: 'example.com',
		path:   '/review/server/cache.json?foo=bar',
		headers: {
			'x-test': 'save'
		},
		payload: {
			foo: 'bar'
		}
	}, (response) => {

		assert(response, {
			headers: {
				service: 'cache',
				event:   'save'
			},
			payload: true
		});

	});

});

describe('Cache.prototype.save()/2', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.cache.save), true);

	this.server.services.cache.save({
		domain: 'example.com',
		path:   '/review/server/cache.json?foo=qux',
		headers: {
			'x-test': 'save'
		},
		payload: {
			foo: 'qux doo'
		}
	}, (response) => {

		assert(response, {
			headers: {
				service: 'cache',
				event:   'save'
			},
			payload: true
		});

	});

});

describe('Cache.prototype.info()/1', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.cache.info), true);

	this.server.services.cache.info({
		domain: 'example.com',
		path:   '/review/server/cache.json?foo=bar'
	}, (response) => {

		assert(isObject(response), true);
		assert(response.headers, {
			'service': 'cache',
			'event':   'info'
		});

		assert(isObject(response.payload), true);

		assert(isObject(response.payload.headers),             true);
		assert(isNumber(response.payload.headers.size),        true);
		assert(DATETIME.isDate(response.payload.headers.date), true);
		assert(DATETIME.isTime(response.payload.headers.time), true);

		assert(isObject(response.payload.payload),             true);
		assert(isNumber(response.payload.payload.size),        true);
		assert(DATETIME.isDate(response.payload.payload.date), true);
		assert(DATETIME.isTime(response.payload.payload.time), true);

	});

});

describe('Cache.prototype.info()/2', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.cache.info), true);

	this.server.services.cache.info({
		domain: 'example.com',
		path:   '/review/server/cache.json?foo=qux'
	}, (response) => {

		assert(isObject(response), true);
		assert(response.headers, {
			'service': 'cache',
			'event':   'info'
		});

		assert(isObject(response.payload), true);

		assert(isObject(response.payload.headers),             true);
		assert(isNumber(response.payload.headers.size),        true);
		assert(DATETIME.isDate(response.payload.headers.date), true);
		assert(DATETIME.isTime(response.payload.headers.time), true);

		assert(isObject(response.payload.payload),             true);
		assert(isNumber(response.payload.payload.size),        true);
		assert(DATETIME.isDate(response.payload.payload.date), true);
		assert(DATETIME.isTime(response.payload.payload.time), true);

	});

});

describe('Cache.prototype.read()/3/failure', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.cache.read), true);

	this.server.services.cache.read({
		domain: 'example.com',
		path:   '/review/server/cache.json'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'cache',
				event:   'read'
			},
			payload: null
		});

	});

});

describe('Cache.prototype.read()/1/success', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.cache.read), true);

	this.server.services.cache.read({
		domain: 'example.com',
		path:   '/review/server/cache.json?foo=bar'
	}, (response) => {

		assert(isObject(response), true);
		assert(response.headers, {
			'service': 'cache',
			'event':   'read'
		});

		assert(isObject(response.payload),         true);
		assert(isObject(response.payload.headers), true);
		assert(isBuffer(response.payload.payload), true);

		assert(response.payload.headers['x-test'],                  'save');
		assert(response.payload.headers['content-type'],            'application/json');
		assert(response.payload.headers['content-length'],          17);
		assert(isString(response.payload.headers['last-modified']), true);

		let data = null;
		try {
			data = JSON.parse(response.payload.payload.toString('utf8'));
		} catch (err) {
			data = null;
		}

		assert(data, { foo: 'bar' });

	});

});

describe('Cache.prototype.read()/2/success', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.cache.read), true);

	this.server.services.cache.read({
		domain: 'example.com',
		path:   '/review/server/cache.json?foo=qux'
	}, (response) => {

		assert(isObject(response), true);
		assert(response.headers, {
			'service': 'cache',
			'event':   'read'
		});

		assert(isObject(response.payload),         true);
		assert(isObject(response.payload.headers), true);
		assert(isBuffer(response.payload.payload), true);

		assert(response.payload.headers['x-test'],                  'save');
		assert(response.payload.headers['content-type'],            'application/json');
		assert(response.payload.headers['content-length'],          21);
		assert(isString(response.payload.headers['last-modified']), true);

		let data = null;
		try {
			data = JSON.parse(response.payload.payload.toString('utf8'));
		} catch (err) {
			data = null;
		}

		assert(data, { foo: 'qux doo' });

	});

});

describe('Cache.prototype.remove()/1/success', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.cache.remove), true);

	this.server.services.cache.remove({
		domain: 'example.com',
		path:   '/review/server/cache.json?foo=bar'
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

describe('Cache.prototype.read()/1/failure', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.cache.read), true);

	this.server.services.cache.read({
		domain: 'example.com',
		path:   '/review/server/cache.json?foo=bar'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'cache',
				event:   'read'
			},
			payload: null
		});

	});

});

describe('Cache.prototype.remove()/1/failure', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.cache.remove), true);

	this.server.services.cache.remove({
		domain: 'example.com',
		path:   '/review/server/cache.json?foo=bar'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'cache',
				event:   'remove'
			},
			payload: false
		});

	});

});

describe('Cache.prototype.info()/2', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.cache.read), true);

	this.server.services.cache.info({
		domain: 'example.com',
		path:   '/review/server/cache.json?foo=qux'
	}, (response) => {

		assert(isObject(response), true);
		assert(response.headers, {
			'service': 'cache',
			'event':   'info'
		});

		assert(isObject(response.payload), true);

		assert(isObject(response.payload.headers),             true);
		assert(isNumber(response.payload.headers.size),        true);
		assert(DATETIME.isDate(response.payload.headers.date), true);
		assert(DATETIME.isTime(response.payload.headers.time), true);

		assert(isObject(response.payload.payload),             true);
		assert(isNumber(response.payload.payload.size),        true);
		assert(DATETIME.isDate(response.payload.payload.date), true);
		assert(DATETIME.isTime(response.payload.payload.time), true);

	});

});

describe('Cache.prototype.remove()/2/success', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.cache.remove), true);

	this.server.services.cache.remove({
		domain: 'example.com',
		path:   '/review/server/cache.json?foo=qux'
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

describe('Cache.prototype.remove()/2/failure', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.cache.remove), true);

	this.server.services.cache.remove({
		domain: 'example.com',
		path:   '/review/server/cache.json?foo=qux'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'cache',
				event:   'remove'
			},
			payload: false
		});

	});

});

after(disconnect);


export default finish('stealth/server/Cache');

