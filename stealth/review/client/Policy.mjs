
import { isFunction                                                   } from '../../../base/index.mjs';
import { after, before, describe, finish                              } from '../../../covert/index.mjs';
import { Policy                                                       } from '../../../stealth/source/client/Policy.mjs';
import { connect as connect_stealth, disconnect as disconnect_stealth } from '../Stealth.mjs';
import { connect as connect_client, disconnect as disconnect_client   } from '../Client.mjs';



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
		domain: 'radar.tholian.network'
	}, (response) => {

		assert(response, null);

	});

});

after(disconnect_client);
after(disconnect_stealth);


export default finish('stealth/client/Policy');

