
import { isBuffer, isFunction, isNumber, isObject, isString           } from '../../../base/index.mjs';
import { after, before, describe, finish                              } from '../../../covert/index.mjs';
import { Stash                                                        } from '../../../stealth/source/client/Stash.mjs';
import { connect as connect_stealth, disconnect as disconnect_stealth } from '../Stealth.mjs';
import { connect as connect_client, disconnect as disconnect_client   } from '../Client.mjs';



before(connect_stealth);
before(connect_client);

describe('new Stash()', function(assert) {

	assert(this.client.services.stash instanceof Stash, true);

});

describe('Stash.prototype.save()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.stash.save), true);

	this.client.services.stash.save({
		domain: 'example.com',
		path:   '/review/client/stash.json',
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

describe('Stash.prototype.info()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.stash.info), true);

	this.client.services.stash.info({
		domain: 'example.com',
		path:   '/review/client/stash.json'
	}, (response) => {

		assert(response !== null);
		assert(isObject(response), true);

		assert(isObject(response.headers),      true);
		assert(isNumber(response.headers.size), true);
		assert(isString(response.headers.time), true);

		assert(isObject(response.payload),      true);
		assert(isNumber(response.payload.size), true);
		assert(isString(response.payload.time), true);

	});

});

describe('Stash.prototype.read()/success', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.stash.read), true);

	this.client.services.stash.read({
		domain: 'example.com',
		path:   '/review/client/stash.json'
	}, (response) => {

		assert(response !== null);
		assert(isObject(response.headers), true);
		assert(response.headers['x-test'], 'save');
		assert(isBuffer(response.payload), true);

		let data = null;
		try {
			data = JSON.parse(response.payload.toString('utf8'));
		} catch (err) {
			data = null;
		}

		assert(isObject(data), true);
		assert(data, { foo: 'bar' });

	});

});

describe('Stash.prototype.remove()/success', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.stash.remove), true);

	this.client.services.stash.remove({
		domain: 'example.com',
		path:   '/review/client/stash.json'
	}, (response) => {
		assert(response, true);
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

describe('Stash.prototype.remove()/failure', function(assert) {

	assert(this.client!== null);
	assert(isFunction(this.client.services.stash.remove), true);

	this.client.services.stash.remove({
		domain: 'example.com',
		path:   '/review/client/stash.json'
	}, (response) => {
		assert(response, false);
	});

});

after(disconnect_client);
after(disconnect_stealth);


export default finish('stealth/client/Stash');

