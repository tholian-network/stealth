
import { isFunction, isObject            } from '../../../base/index.mjs';
import { after, before, describe, finish } from '../../../covert/index.mjs';
import { Blocker                         } from '../../../stealth/source/server/Blocker.mjs';
import { connect, disconnect             } from '../Server.mjs';



before(connect);

describe('new Blocker()', function(assert) {

	assert(this.server !== null);
	assert(this.server.services.blocker instanceof Blocker, true);

});

describe('Blocker.isBlocker()', function(assert) {

	assert(isFunction(Blocker.isBlocker), true);

	assert(Blocker.isBlocker(null), false);
	assert(Blocker.isBlocker({}),   false);

	assert(Blocker.isBlocker({
		domain: 'example.com'
	}), true);

});

describe('Blocker.prototype.read()/success', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.blocker.read), true);

	this.server.services.blocker.read({
		domain: 'ads.quantserve.com'
	}, (response) => {

		assert(isObject(response), true);
		assert(isObject(response.headers), true);
		assert(response.headers['service'], 'blocker');
		assert(response.headers['event'],   'read');

		assert(isObject(response.payload), true);
		assert(response.payload.domain,    'ads.quantserve.com');

	});

	this.server.services.blocker.read({
		domain: 'subdomain.ads.quantserve.com'
	}, (response) => {

		assert(isObject(response), true);
		assert(isObject(response.headers), true);
		assert(response.headers['service'], 'blocker');
		assert(response.headers['event'],   'read');

		assert(isObject(response.payload), true);
		assert(response.payload.domain,    'ads.quantserve.com');

	});

});

describe('Blocker.prototype.read()/failure', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.blocker.read), true);

	this.server.services.blocker.read({
		domain: 'quantserve.com'
	}, (response) => {

		assert(isObject(response), true);
		assert(isObject(response.headers), true);
		assert(response.headers['service'], 'blocker');
		assert(response.headers['event'],   'read');

		assert(response.payload, null);

	});

});

after(disconnect);


export default finish('stealth/server/Blocker');

