
import { isBuffer, isFunction, isNumber, isObject, isString } from '../../../base/index.mjs';
import { after, before, describe, finish                    } from '../../../covert/index.mjs';
import { Stash                                              } from '../../../stealth/source/server/Stash.mjs';
import { connect, disconnect                                } from '../Server.mjs';



before(connect);

describe('new Stash()', function(assert) {

	assert(this.server !== null);
	assert(this.server.services.stash instanceof Stash, true);

});

describe('Stash.prototype.save()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.stash.save), true);

	this.server.services.stash.save({
		domain: 'example.com',
		path:   '/review/server/stash.json',
		headers: {
			'x-test': 'save'
		},
		payload: {
			foo: 'bar'
		}
	}, (response) => {

		assert(response, {
			headers: {
				service: 'stash',
				event:   'save'
			},
			payload: true
		});

	});

});

describe('Stash.prototype.info()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.stash.info), true);

	this.server.services.stash.info({
		domain: 'example.com',
		path:   '/review/server/stash.json'
	}, (response) => {

		assert(isObject(response), true);
		assert(response.headers, {
			'service': 'stash',
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

describe('Stash.prototype.read()/success', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.stash.read), true);

	this.server.services.stash.read({
		domain: 'example.com',
		path:   '/review/server/stash.json'
	}, (response) => {

		assert(isObject(response), true);
		assert(response.headers, {
			'service': 'stash',
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

describe('Stash.prototype.remove()/success', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.stash.remove), true);

	this.server.services.stash.remove({
		domain: 'example.com',
		path:   '/review/server/stash.json'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'stash',
				event:   'remove'
			},
			payload: true
		});

	});

});

describe('Stash.prototype.read()/failure', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.stash.read), true);

	this.server.services.stash.read({
		domain: 'example.com',
		path:   '/review/server/stash.json'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'stash',
				event:   'read'
			},
			payload: null
		});

	});

});

describe('Stash.prototype.remove()/failure', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.stash.remove), true);

	this.server.services.stash.remove({
		domain: 'example.com',
		path:   '/review/server/stash.json'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'stash',
				event:   'remove'
			},
			payload: false
		});

	});

});

after(disconnect);


export default finish('stealth/server/Stash');

