
import { isFunction                                                   } from '../../../base/index.mjs';
import { after, before, describe, finish                              } from '../../../covert/index.mjs';
import { Cache                                                        } from '../../../stealth/source/client/Cache.mjs';
import { connect as connect_stealth, disconnect as disconnect_stealth } from '../Stealth.mjs';
import { connect as connect_client, disconnect as disconnect_client   } from '../Client.mjs';



before(connect_stealth);
before(connect_client);

describe('new Cache()', function(assert) {

	assert(this.client.services.cache instanceof Cache, true);

});

describe('Cache.prototype.save()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.cache.save), true);

	this.client.services.cache.save({
		domain: 'example.com',
		path:   '/review/client/cache.json',
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

describe('Cache.prototype.info()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.cache.info), true);

	this.client.services.cache.info({
		domain: 'example.com',
		path:   '/review/client/cache.json'
	}, (response) => {

		assert(response !== null);

		assert(response.headers !== null);
		assert(response.headers.size > 0);
		assert(response.headers.time !== null);

		assert(response.payload !== null);
		assert(response.payload.size > 0);
		assert(response.payload.time !== null);

	});

});

describe('Cache.prototype.read()/success', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.cache.read), true);

	this.client.services.cache.read({
		domain: 'example.com',
		path:   '/review/client/cache.json'
	}, (response) => {

		assert(response !== null);
		assert(response.headers !== null);
		assert(response.headers['x-test'], 'save');
		assert(response.payload !== null);

		let data = null;
		let temp = response.payload || null;
		if (temp !== null) {

			try {
				data = JSON.parse(temp.toString('utf8'));
			} catch (err) {
				data = null;
			}

		}

		assert(data !== null);
		assert(data, { foo: 'bar' });

	});

});

describe('Cache.prototype.remove()/success', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.cache.remove), true);

	this.client.services.cache.remove({
		domain: 'example.com',
		path:   '/review/client/cache.json'
	}, (response) => {
		assert(response, true);
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

describe('Cache.prototype.remove()/failure', function(assert) {

	assert(this.client!== null);
	assert(isFunction(this.client.services.cache.remove), true);

	this.client.services.cache.remove({
		domain: 'example.com',
		path:   '/review/client/cache.json'
	}, (response) => {
		assert(response, false);
	});

});

after(disconnect_client);
after(disconnect_stealth);


export default finish('stealth/client/Cache');

