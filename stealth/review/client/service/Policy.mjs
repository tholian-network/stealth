
import { isFunction                                                   } from '../../../../base/index.mjs';
import { after, before, describe, finish                              } from '../../../../covert/index.mjs';
import { Policy                                                       } from '../../../../stealth/source/client/service/Policy.mjs';
import { connect as connect_stealth, disconnect as disconnect_stealth } from '../../../../stealth/review/Stealth.mjs';
import { connect as connect_client, disconnect as disconnect_client   } from '../../../../stealth/review/Client.mjs';



before(connect_stealth);
before(connect_client);

describe('new Policy()', function(assert) {

	assert(this.client !== null);
	assert(this.client.services.policy instanceof Policy, true);

});

describe('Policy.prototype.toJSON()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.policy.toJSON), true);

	assert(this.client.services.policy.toJSON(), {
		type: 'Policy Service',
		data: {
			events:  [],
			journal: []
		}
	});

});

describe('Policy.prototype.read()/success', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.policy.read), true);

	this.client.services.policy.read({
		domain: 'clickserve.dartsearch.net'
	}, (response) => {

		assert(response, {
			domain: 'clickserve.dartsearch.net',
			policies: [{
				path:  '/link/click',
				query: 'ds_dest_url'
			}]
		});

	});

});

describe('Policy.prototype.read()/failure', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.policy.read), true);

	this.client.services.policy.read({
		domain: 'example.com'
	}, (response) => {

		assert(response, null);

	});

});

describe('Policy.prototype.save()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.policy.save), true);

	this.client.services.policy.save({
		domain:   'example.com',
		policies: [{
			path:  '/search',
			query: 'q&type'
		}]
	}, (response) => {

		assert(response, true);

	});

});

describe('Policy.prototype.read()/success', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.policy.read), true);

	this.client.services.policy.read({
		domain: 'example.com'
	}, (response) => {

		assert(response, {
			domain:   'example.com',
			policies: [{
				path:  '/search',
				query: 'q&type'
			}]
		});

	});

});

describe('Policy.prototype.remove()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.policy.remove), true);

	this.client.services.policy.remove({
		domain: 'example.com'
	}, (response) => {

		assert(response, true);

	});

});

describe('Policy.prototype.read()/failure', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.policy.read), true);

	this.client.services.policy.read({
		domain: 'example.com'
	}, (response) => {

		assert(response, null);

	});

});

after(disconnect_client);
after(disconnect_stealth);


export default finish('stealth/client/service/Policy', {
	internet: false,
	network:  true
});

