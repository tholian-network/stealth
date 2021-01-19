
import { isBuffer, isFunction, isNumber, isObject, isString           } from '../../../base/index.mjs';
import { after, before, describe, finish                              } from '../../../covert/index.mjs';
import { DATETIME                                                     } from '../../../stealth/source/parser/DATETIME.mjs';
import { Stash                                                        } from '../../../stealth/source/client/Stash.mjs';
import { connect as connect_stealth, disconnect as disconnect_stealth } from '../Stealth.mjs';
import { connect as connect_client, disconnect as disconnect_client   } from '../Client.mjs';



before(connect_stealth);
before(connect_client);

describe('new Stash()', function(assert) {

	assert(this.client !== null);
	assert(this.client.services.stash instanceof Stash, true);

});

describe('Stash.prototype.toJSON()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.stash.toJSON), true);

	assert(this.client.services.stash.toJSON(), {
		type: 'Stash Service',
		data: {
			events:  [],
			journal: []
		}
	});

});

describe('URL #1 - Stash.prototype.save()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.stash.save), true);

	this.client.services.stash.save({
		domain: 'example.com',
		path:   '/review/client/stash.json?foo=bar',
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

describe('URL #2 - Stash.prototype.save()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.stash.save), true);

	this.client.services.stash.save({
		domain: 'example.com',
		path:   '/review/client/stash.json?foo=qux',
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

describe('URL #1 - Stash.prototype.info()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.stash.info), true);

	this.client.services.stash.info({
		domain: 'example.com',
		path:   '/review/client/stash.json?foo=bar'
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

describe('URL #2 - Stash.prototype.info()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.stash.info), true);

	this.client.services.stash.info({
		domain: 'example.com',
		path:   '/review/client/stash.json?foo=qux'
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

describe('Stash.prototype.read()/failure', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.stash.read), true);

	this.client.services.stash.read({
		domain: 'example.com',
		path:   '/review/client/stash.json'
	}, (response) => {

		assert(response, null);

	});

});

describe('URL #1 - Stash.prototype.read()/success', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.stash.read), true);

	this.client.services.stash.read({
		domain: 'example.com',
		path:   '/review/client/stash.json?foo=bar'
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

describe('URL #2 - Stash.prototype.read()/success', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.stash.read), true);

	this.client.services.stash.read({
		domain: 'example.com',
		path:   '/review/client/stash.json?foo=qux'
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

describe('URL #1 - Stash.prototype.remove()/success', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.stash.remove), true);

	this.client.services.stash.remove({
		domain: 'example.com',
		path:   '/review/client/stash.json?foo=bar'
	}, (response) => {

		assert(response, true);

	});

});

describe('URL #1 - Stash.prototype.read()/failure', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.stash.read), true);

	this.client.services.stash.read({
		domain: 'example.com',
		path:   '/review/client/stash.json?foo=bar'
	}, (response) => {

		assert(response, null);

	});

});

describe('URL #1 - Stash.prototype.remove()/failure', function(assert) {

	assert(this.client!== null);
	assert(isFunction(this.client.services.stash.remove), true);

	this.client.services.stash.remove({
		domain: 'example.com',
		path:   '/review/client/stash.json?foo=bar'
	}, (response) => {

		assert(response, false);

	});

});

describe('URL #2 - Stash.prototype.info()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.stash.info), true);

	this.client.services.stash.info({
		domain: 'example.com',
		path:   '/review/client/stash.json?foo=qux'
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

describe('URL #2 - Stash.prototype.remove()/success', function(assert) {

	assert(this.client!== null);
	assert(isFunction(this.client.services.stash.remove), true);

	this.client.services.stash.remove({
		domain: 'example.com',
		path:   '/review/client/stash.json?foo=qux'
	}, (response) => {

		assert(response, true);

	});

});

describe('URL #2 - Stash.prototype.remove()/failure', function(assert) {

	assert(this.client!== null);
	assert(isFunction(this.client.services.stash.remove), true);

	this.client.services.stash.remove({
		domain: 'example.com',
		path:   '/review/client/stash.json?foo=qux'
	}, (response) => {

		assert(response, false);

	});

});

after(disconnect_client);
after(disconnect_stealth);


export default finish('stealth/client/Stash', {
	internet: false,
	network:  true
});

