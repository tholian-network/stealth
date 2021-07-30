
import { isBuffer, isFunction, isNumber, isObject, isString           } from '../../../../base/index.mjs';
import { after, before, describe, finish                              } from '../../../../covert/index.mjs';
import { DATETIME                                                     } from '../../../../stealth/source/parser/DATETIME.mjs';
import { Cache                                                        } from '../../../../stealth/source/client/service/Cache.mjs';
import { connect as connect_stealth, disconnect as disconnect_stealth } from '../../../../stealth/review/Stealth.mjs';
import { connect as connect_client, disconnect as disconnect_client   } from '../../../../stealth/review/Client.mjs';



before(connect_stealth);
before(connect_client);

describe('new Cache()', function(assert) {

	assert(this.client !== null);
	assert(this.client.services.cache instanceof Cache, true);

});

describe('Cache.prototype.toJSON()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.cache.toJSON), true);

	assert(this.client.services.cache.toJSON(), {
		type: 'Cache Service',
		data: {
			events:  [],
			journal: []
		}
	});

});

describe('URL #1 - Cache.prototype.save()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.cache.save), true);

	this.client.services.cache.save({
		domain: 'example.com',
		path:   '/review/client/cache.json?foo=bar',
		headers: {
			'x-test': 'save'
		},
		payload: {
			foo: 'bar'
		}
	}, (response) => {

		assert(response, true);

	});

});

describe('URL #2 - Cache.prototype.save()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.cache.save), true);

	this.client.services.cache.save({
		domain: 'example.com',
		path:   '/review/client/cache.json?foo=qux',
		headers: {
			'x-test': 'save'
		},
		payload: {
			foo: 'qux doo'
		}
	}, (response) => {

		assert(response, true);

	});

});

describe('URL #1 - Cache.prototype.info()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.cache.info), true);

	this.client.services.cache.info({
		domain: 'example.com',
		path:   '/review/client/cache.json?foo=bar'
	}, (response) => {

		assert(isObject(response), true);

		assert(isObject(response.headers),             true);
		assert(isNumber(response.headers.size),        true);
		assert(DATETIME.isDate(response.headers.date), true);
		assert(DATETIME.isTime(response.headers.time), true);

		assert(isObject(response.payload),             true);
		assert(isNumber(response.payload.size),        true);
		assert(DATETIME.isDate(response.payload.date), true);
		assert(DATETIME.isTime(response.payload.time), true);

	});

});

describe('URL #2 - Cache.prototype.info()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.cache.info), true);

	this.client.services.cache.info({
		domain: 'example.com',
		path:   '/review/client/cache.json?foo=qux'
	}, (response) => {

		assert(isObject(response), true);

		assert(isObject(response.headers),             true);
		assert(isNumber(response.headers.size),        true);
		assert(DATETIME.isDate(response.headers.date), true);
		assert(DATETIME.isTime(response.headers.time), true);

		assert(isObject(response.payload),             true);
		assert(isNumber(response.payload.size),        true);
		assert(DATETIME.isDate(response.payload.date), true);
		assert(DATETIME.isTime(response.payload.time), true);

	});

});

describe('Cache.prototype.read()/failure', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.cache.read), true);

	this.client.services.cache.read({
		domain: 'example.com',
		path:   '/review/client/cache.json'
	}, (response) => {

		assert(response, null);

	});

});

describe('URL #1 - Cache.prototype.read()/success', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.cache.read), true);

	this.client.services.cache.read({
		domain: 'example.com',
		path:   '/review/client/cache.json?foo=bar'
	}, (response) => {

		assert(isObject(response),         true);
		assert(isObject(response.headers), true);
		assert(isBuffer(response.payload), true);

		assert(response.headers['x-test'],                  'save');
		assert(response.headers['content-type'],            'application/json');
		assert(response.headers['content-length'],          17);
		assert(isString(response.headers['last-modified']), true);

		let data = null;
		try {
			data = JSON.parse(response.payload.toString('utf8'));
		} catch (err) {
			data = null;
		}

		assert(data, { foo: 'bar' });

	});

});

describe('URL #2 - Cache.prototype.read()/success', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.cache.read), true);

	this.client.services.cache.read({
		domain: 'example.com',
		path:   '/review/client/cache.json?foo=qux'
	}, (response) => {

		assert(isObject(response),         true);
		assert(isObject(response.headers), true);
		assert(isBuffer(response.payload), true);

		assert(response.headers['x-test'],                  'save');
		assert(response.headers['content-type'],            'application/json');
		assert(response.headers['content-length'],          21);
		assert(isString(response.headers['last-modified']), true);

		let data = null;
		try {
			data = JSON.parse(response.payload.toString('utf8'));
		} catch (err) {
			data = null;
		}

		assert(data, { foo: 'qux doo' });

	});

});

describe('URL #1 - Cache.prototype.remove()/success', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.cache.remove), true);

	this.client.services.cache.remove({
		domain: 'example.com',
		path:   '/review/client/cache.json?foo=bar'
	}, (response) => {

		assert(response, true);

	});

});

describe('URL #1 - Cache.prototype.read()/failure', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.cache.read), true);

	this.client.services.cache.read({
		domain: 'example.com',
		path:   '/review/client/cache.json?foo=bar'
	}, (response) => {

		assert(response, null);

	});

});

describe('URL #1 - Cache.prototype.remove()/failure', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.cache.remove), true);

	this.client.services.cache.remove({
		domain: 'example.com',
		path:   '/review/client/cache.json?foo=bar'
	}, (response) => {

		assert(response, false);

	});

});

describe('URL #2 - Cache.prototype.info()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.cache.info), true);

	this.client.services.cache.info({
		domain: 'example.com',
		path:   '/review/client/cache.json?foo=qux'
	}, (response) => {

		assert(isObject(response), true);

		assert(isObject(response.headers),             true);
		assert(isNumber(response.headers.size),        true);
		assert(DATETIME.isDate(response.headers.date), true);
		assert(DATETIME.isTime(response.headers.time), true);

		assert(isObject(response.payload),             true);
		assert(isNumber(response.payload.size),        true);
		assert(DATETIME.isDate(response.payload.date), true);
		assert(DATETIME.isTime(response.payload.time), true);

	});

});

describe('URL #2 - Cache.prototype.remove()/success', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.cache.remove), true);

	this.client.services.cache.remove({
		domain: 'example.com',
		path:   '/review/client/cache.json?foo=qux'
	}, (response) => {

		assert(response, true);

	});

});

describe('URL #2 - Cache.prototype.remove()/failure', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.cache.remove), true);

	this.client.services.cache.remove({
		domain: 'example.com',
		path:   '/review/client/cache.json?foo=qux'
	}, (response) => {

		assert(response, false);

	});

});

after(disconnect_client);
after(disconnect_stealth);


export default finish('stealth/client/service/Cache', {
	internet: false,
	network:  true
});

