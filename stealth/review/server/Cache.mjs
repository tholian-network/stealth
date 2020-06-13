
import { isFunction, isObject            } from '../../../base/index.mjs';
import { after, before, describe, finish } from '../../../covert/index.mjs';
import { Cache                           } from '../../../stealth/source/server/Cache.mjs';
import { connect, disconnect             } from '../Server.mjs';



before(connect);

describe('new Cache()', function(assert) {

	assert(this.server.services.cache instanceof Cache, true);

});

describe('Cache.prototype.save()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.cache.save), true);

	this.server.services.cache.save({
		domain: 'example.com',
		path:   '/review/client/cache.json',
		headers: {
			'x-test': 'save'
		},
		payload: {
			foo: 'bar'
		}
	}, (response) => {

		assert(response !== null);
		assert(isObject(response.headers), true);
		assert(response.headers['service'], 'cache');
		assert(response.headers['event'],   'save');
		assert(response.payload, true);

	});

});

after(disconnect);


export default finish('stealth/server/Cache');

