
import { isFunction                                                   } from '../../../base/index.mjs';
import { after, before, describe, finish                              } from '../../../covert/index.mjs';
import { connect as connect_stealth, disconnect as disconnect_stealth } from '../Stealth.mjs';
import { connect as connect_client, disconnect as disconnect_client   } from '../Client.mjs';



before(connect_stealth);
describe(connect_client);

describe('client.services.stash.save', function(assert) {

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

describe('client.services.stash.info', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.stash.info), true);

	this.client.services.stash.info({
		domain: 'example.com',
		path:   '/review/client/stash.json'
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

describe('client.services.stash.read', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.stash.read), true);

	this.client.services.stash.read({
		domain: 'example.com',
		path:   '/review/client/stash.json'
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

describe('client.services.stash.remove', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.stash.remove), true);

	this.client.services.stash.remove({
		domain: 'example.com',
		path:   '/review/client/stash.json'
	}, (response) => {
		assert(response, true);
	});

});

describe('client.services.stash.read', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.stash.read), true);

	this.client.services.stash.read({
		domain: 'example.com',
		path:   '/review/client/stash.json'
	}, (response) => {
		assert(response, null);
	});

});

describe('client.services.stash.remove', function(assert) {

	assert(this.client!== null);
	assert(isFunction(this.client.services.stash.remove), true);

	this.client.services.stash.remove({
		domain: 'example.com',
		path:   '/review/client/stash.json'
	}, (response) => {
		assert(response, false);
	});

});

describe('server.services.stash.remove', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.stash.remove), true);

	this.server.services.stash.remove({
		domain: 'example.com',
		path:   '/review/client/stash.json'
	}, (response) => {

		assert(response !== null);
		assert(response.payload, false);

	});

});

describe(disconnect_client);
after(disconnect_stealth);


export default finish('stealth/client/Stash');

