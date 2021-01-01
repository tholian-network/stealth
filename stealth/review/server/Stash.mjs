
import { isBuffer, isFunction, isNumber, isObject, isString } from '../../../base/index.mjs';
import { after, before, describe, finish                    } from '../../../covert/index.mjs';
import { DATETIME                                           } from '../../../stealth/source/parser/DATETIME.mjs';
import { Stash                                              } from '../../../stealth/source/server/Stash.mjs';
import { connect, disconnect                                } from '../Server.mjs';



before(connect);

describe('new Stash()', function(assert) {

	assert(this.server !== null);
	assert(this.server.services.stash instanceof Stash, true);

});

describe('Stash.prototype.toJSON()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.stash.toJSON), true);

	assert(this.server.services.stash.toJSON(), {
		type: 'Stash Service',
		data: {
			events:  [],
			journal: []
		}
	});

});

describe('URL #1 - Stash.prototype.save()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.stash.save), true);

	this.server.services.stash.save({
		domain: 'example.com',
		path:   '/review/server/stash.json?foo=bar',
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

describe('URL #2 - Stash.prototype.save()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.stash.save), true);

	this.server.services.stash.save({
		domain: 'example.com',
		path:   '/review/server/stash.json?foo=qux',
		headers: {
			'x-test': 'save'
		},
		payload: {
			foo: 'qux doo'
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

describe('URL #1 - Stash.prototype.info()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.stash.info), true);

	this.server.services.stash.info({
		domain: 'example.com',
		path:   '/review/server/stash.json?foo=bar'
	}, (response) => {

		assert(isObject(response), true);
		assert(response.headers, {
			'service': 'stash',
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

describe('URL #2 - Stash.prototype.info()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.stash.info), true);

	this.server.services.stash.info({
		domain: 'example.com',
		path:   '/review/server/stash.json?foo=qux'
	}, (response) => {

		assert(isObject(response), true);
		assert(response.headers, {
			'service': 'stash',
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

describe('URL #1 - Stash.prototype.read()/success', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.stash.read), true);

	this.server.services.stash.read({
		domain: 'example.com',
		path:   '/review/server/stash.json?foo=bar'
	}, (response) => {

		assert(isObject(response), true);
		assert(response.headers, {
			'service': 'stash',
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

describe('URL #2 - Stash.prototype.read()/success', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.stash.read), true);

	this.server.services.stash.read({
		domain: 'example.com',
		path:   '/review/server/stash.json?foo=qux'
	}, (response) => {

		assert(isObject(response), true);
		assert(response.headers, {
			'service': 'stash',
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

describe('URL #1 - Stash.prototype.remove()/success', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.stash.remove), true);

	this.server.services.stash.remove({
		domain: 'example.com',
		path:   '/review/server/stash.json?foo=bar'
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

describe('URL #1 - Stash.prototype.read()/failure', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.stash.read), true);

	this.server.services.stash.read({
		domain: 'example.com',
		path:   '/review/server/stash.json?foo=bar'
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

describe('URL #1 - Stash.prototype.remove()/failure', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.stash.remove), true);

	this.server.services.stash.remove({
		domain: 'example.com',
		path:   '/review/server/stash.json?foo=bar'
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

describe('URL #2 - Stash.prototype.info()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.stash.info), true);

	this.server.services.stash.info({
		domain: 'example.com',
		path:   '/review/server/stash.json?foo=qux'
	}, (response) => {

		assert(isObject(response), true);
		assert(response.headers, {
			'service': 'stash',
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

describe('URL #2 - Stash.prototype.remove()/success', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.stash.remove), true);

	this.server.services.stash.remove({
		domain: 'example.com',
		path:   '/review/server/stash.json?foo=qux'
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

describe('URL #2 - Stash.prototype.remove()/failure', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.stash.remove), true);

	this.server.services.stash.remove({
		domain: 'example.com',
		path:   '/review/server/stash.json?foo=qux'
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

