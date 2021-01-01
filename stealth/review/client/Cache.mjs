
import { isBuffer, isFunction, isNumber, isObject, isString           } from '../../../base/index.mjs';
import { after, before, describe, finish                              } from '../../../covert/index.mjs';
import { Cache                                                        } from '../../../stealth/source/client/Cache.mjs';
import { DATETIME                                                     } from '../../../stealth/source/parser/DATETIME.mjs';
import { connect as connect_stealth, disconnect as disconnect_stealth } from '../Stealth.mjs';
import { connect as connect_client, disconnect as disconnect_client   } from '../Client.mjs';



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

describe('Cache.prototype.save()/1', function(assert) {

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

describe('Cache.prototype.save()/2', function(assert) {

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

describe('Cache.prototype.info()/1', function(assert) {

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

describe('Cache.prototype.info()/2', function(assert) {

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

describe('Cache.prototype.read()/3/failure', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.cache.read), true);

	this.client.services.cache.read({
		domain: 'example.com',
		path:   '/review/client/cache.json'
	}, (response) => {

		assert(response, null);

	});

});

describe('Cache.prototype.read()/1/success', function(assert) {

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

describe('Cache.prototype.read()/2/success', function(assert) {

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

describe('Cache.prototype.remove()/1/success', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.cache.remove), true);

	this.client.services.cache.remove({
		domain: 'example.com',
		path:   '/review/client/cache.json?foo=bar'
	}, (response) => {

		assert(response, true);

	});

});

describe('Cache.prototype.read()/1/failure', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.cache.read), true);

	this.client.services.cache.read({
		domain: 'example.com',
		path:   '/review/client/cache.json?foo=bar'
	}, (response) => {

		assert(response, null);

	});

});

describe('Cache.prototype.remove()/1/failure', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.cache.remove), true);

	this.client.services.cache.remove({
		domain: 'example.com',
		path:   '/review/client/cache.json?foo=bar'
	}, (response) => {

		assert(response, false);

	});

});

describe('Cache.prototype.info()/2', function(assert) {

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

describe('Cache.prototype.remove()/2/success', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.cache.remove), true);

	this.client.services.cache.remove({
		domain: 'example.com',
		path:   '/review/client/cache.json?foo=qux'
	}, (response) => {

		assert(response, true);

	});

});

describe('Cache.prototype.remove()/2/failure', function(assert) {

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


export default finish('stealth/client/Cache');

