
import { isFunction                      } from '../../../base/index.mjs';
import { after, before, describe, finish } from '../../../covert/index.mjs';
import { Policy                          } from '../../../stealth/source/server/Policy.mjs';
import { connect, disconnect             } from '../Server.mjs';



before(connect);

describe('new Policy()', function(assert) {

	assert(this.server !== null);
	assert(this.server.services.policy instanceof Policy, true);

});

describe('Policy.prototype.toJSON()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.policy.toJSON), true);

	assert(this.server.services.policy.toJSON(), {
		type: 'Policy Service',
		data: {
			events:  [],
			journal: []
		}
	});

});

describe('Policy.isPolicy()', function(assert) {

	assert(isFunction(Policy.isPolicy), true);

	assert(Policy.isPolicy(null), false);
	assert(Policy.isPolicy({}),   false);

	assert(Policy.isPolicy({
		domain:   'example.com',
		policies: [{
			path:  null,
			query: null
		}]
	}), false);

	assert(Policy.isPolicy({
		domain:   'example.com',
		policies: [{
			path:  '/track.php',
			query: null
		}]
	}), true);

	assert(Policy.isPolicy({
		domain:   'example.com',
		policies: [{
			path:  '/clickbait.html',
			query: 'ad&tracker'
		}]
	}), true);

	assert(Policy.isPolicy({
		domain:   'example.com',
		policies: [{
			path:  '/search',
			query: 'q&type'
		}]
	}), true);

});

describe('Policy.prototype.read()/success', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.policy.read), true);

	this.server.services.policy.read({
		domain: 'clickserve.dartsearch.net'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'policy',
				event:   'read'
			},
			payload: {
				domain: 'clickserve.dartsearch.net',
				policies: [{
					path:  '/link/click',
					query: 'ds_dest_url'
				}]
			}
		});

	});

});

describe('Policy.prototype.read()/failure', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.policy.read), true);

	this.server.services.policy.read({
		domain: 'radar.tholian.network'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'policy',
				event:   'read'
			},
			payload: null
		});

	});

});

after(disconnect);


export default finish('stealth/server/Policy');

