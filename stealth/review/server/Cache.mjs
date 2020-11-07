
import { isBuffer, isFunction, isNumber, isObject, isString } from '../../../base/index.mjs';
import { after, before, describe, finish                    } from '../../../covert/index.mjs';
import { Cache                                              } from '../../../stealth/source/server/Cache.mjs';
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

describe('Cache.prototype.save()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.cache.save), true);

	this.server.services.cache.save({
		domain: 'example.com',
		path:   '/review/server/cache.json',
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

describe('Cache.prototype.info()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.cache.info), true);

	this.server.services.cache.info({
		domain: 'example.com',
		path:   '/review/server/cache.json'
	}, (response) => {

		assert(isObject(response), true);
		assert(response.headers, {
			'service': 'cache',
			'event':   'info'
		});

		assert(isObject(response.payload),              true);
		assert(isObject(response.payload.headers),      true);
		assert(isNumber(response.payload.headers.size), true);
		assert(isString(response.payload.headers.time), true);
		assert(isObject(response.payload.payload),      true);
		assert(isNumber(response.payload.payload.size), true);
		assert(isString(response.payload.payload.time), true);

	});

});

describe('Cache.prototype.read()/success', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.cache.read), true);

	this.server.services.cache.read({
		domain: 'example.com',
		path:   '/review/server/cache.json'
	}, (response) => {

		assert(isObject(response), true);
		assert(response.headers, {
			'service': 'cache',
			'event':   'read'
		});

		assert(isObject(response.payload),         true);
		assert(isObject(response.payload.headers), true);
		assert(isBuffer(response.payload.payload), true);

		assert(response.payload.headers, {
			'x-test':         'save',
			'content-type':   'application/json',
			'content-length': 17
		});

		let data = null;
		try {
			data = JSON.parse(response.payload.payload.toString('utf8'));
		} catch (err) {
			data = null;
		}

		assert(data, { foo: 'bar' });

	});

});

describe('Cache.prototype.remove()/success', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.cache.remove), true);

	this.server.services.cache.remove({
		domain: 'example.com',
		path:   '/review/server/cache.json'
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

describe('Cache.prototype.read()/failure', function(assert) {

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

describe('Cache.prototype.remove()/failure', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.cache.remove), true);

	this.server.services.cache.remove({
		domain: 'example.com',
		path:   '/review/server/cache.json'
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

after(disconnect);


export default finish('stealth/server/Cache');

