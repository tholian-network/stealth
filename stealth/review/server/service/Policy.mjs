
import { isFunction                      } from '../../../../base/index.mjs';
import { after, before, describe, finish } from '../../../../covert/index.mjs';
import { Policy                          } from '../../../../stealth/source/server/service/Policy.mjs';
import { connect, disconnect             } from '../../../../stealth/review/Server.mjs';



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
	}), false);

	assert(Policy.isPolicy({
		domain:   'example.com',
		policies: [{
			path:  null,
			query: 'ad&tracker'
		}]
	}), false);

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

describe('Policy.toPolicy()', function(assert) {

	assert(isFunction(Policy.toPolicy), true);

	assert(Policy.toPolicy(null), null);
	assert(Policy.toPolicy({}),   null);

	assert(Policy.toPolicy({
		domain:   'example.com',
		another:  'property',
		policies: [{
			path:    '/what/ever',
			query:   'param1&param2',
			another: 'property'
		}]
	}), {
		domain:   'example.com',
		policies: [{
			path:  '/what/ever',
			query: 'param1&param2'
		}]
	});

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
		domain: 'example.com'
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

describe('Policy.prototype.save()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.policy.save), true);

	this.server.services.policy.save({
		domain:   'example.com',
		policies: [{
			path:  '/search',
			query: 'q&type'
		}]
	}, (response) => {

		assert(response, {
			headers: {
				service: 'policy',
				event:   'save'
			},
			payload: true
		});

	});

});

describe('Policy.prototype.read()/success', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.policy.read), true);

	this.server.services.policy.read({
		domain: 'example.com'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'policy',
				event:   'read'
			},
			payload: {
				domain:   'example.com',
				policies: [{
					path:  '/search',
					query: 'q&type'
				}]
			}
		});

	});

});

describe('Policy.prototype.remove()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.policy.remove), true);

	this.server.services.policy.remove({
		domain: 'example.com'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'policy',
				event:   'remove'
			},
			payload: true
		});

	});

});

describe('Policy.prototype.read()/failure', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.policy.read), true);

	this.server.services.policy.read({
		domain: 'example.com'
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


export default finish('stealth/server/service/Policy', {
	internet: false,
	network:  true
});

