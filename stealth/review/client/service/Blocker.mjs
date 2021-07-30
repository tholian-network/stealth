
import { isFunction                                                   } from '../../../../base/index.mjs';
import { after, before, describe, finish                              } from '../../../../covert/index.mjs';
import { Blocker                                                      } from '../../../../stealth/source/client/service/Blocker.mjs';
import { connect as connect_stealth, disconnect as disconnect_stealth } from '../../../../stealth/review/Stealth.mjs';
import { connect as connect_client, disconnect as disconnect_client   } from '../../../../stealth/review/Client.mjs';



before(connect_stealth);
before(connect_client);

describe('new Blocker()', function(assert) {

	assert(this.client !== null);
	assert(this.client.services.blocker instanceof Blocker, true);

});

describe('Blocker.prototype.toJSON()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.blocker.toJSON), true);

	assert(this.client.services.blocker.toJSON(), {
		type: 'Blocker Service',
		data: {
			events:  [],
			journal: []
		}
	});

});

describe('Blocker.prototype.read()/success', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.blocker.read), true);

	this.client.services.blocker.read({
		domain: 'ads.quantserve.com'
	}, (response) => {

		assert(response, {
			domain: 'ads.quantserve.com'
		});

	});

	this.client.services.blocker.read({
		domain: 'subdomain.ads.quantserve.com'
	}, (response) => {

		assert(response, {
			domain: 'ads.quantserve.com'
		});

	});

});

describe('Blocker.prototype.read()/failure', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.blocker.read), true);

	this.client.services.blocker.read({
		domain: 'quantserve.com'
	}, (response) => {

		assert(response, null);

	});

});

after(disconnect_client);
after(disconnect_stealth);


export default finish('stealth/client/service/Blocker', {
	internet: false,
	network:  true
});

