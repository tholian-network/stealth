
import { isFunction                                                   } from '../../../base/index.mjs';
import { after, before, describe, finish                              } from '../../../covert/index.mjs';
import { connect as connect_stealth, disconnect as disconnect_stealth } from '../Stealth.mjs';
import { connect as connect_client, disconnect as disconnect_client   } from '../Client.mjs';



before(connect_stealth);
describe(connect_client);

describe('client.services.filter.save', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.filter.save), true);

	this.client.services.filter.save({
		domain: 'example.com',
		filter: {
			prefix: '/filter-prefix',
			midfix: 'filter-midfix',
			suffix: '/filter-suffix.html'
		}
	}, (response) => {
		assert(response, true);
	});

});

describe('client.services.filter.query', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.filter.query), true);

	this.client.services.filter.query({
		domain: 'example.com'
	}, (response) => {

		assert(response !== null);
		assert(response, [{
			id:     'example.com|/filter-prefix|filter-midfix|/filter-suffix.html',
			domain: 'example.com',
			filter: {
				prefix: '/filter-prefix',
				midfix: 'filter-midfix',
				suffix: '/filter-suffix.html'
			}
		}]);

	});

});

describe('client.services.filter.remove', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.filter.remove), true);

	this.client.services.filter.remove({
		domain: 'example.com',
		filter: {
			prefix: '/filter-prefix',
			midfix: 'filter-midfix',
			suffix: '/filter-suffix.html'
		}
	}, (response) => {
		assert(response, true);
	});

});

describe('client.services.filter.query', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.filter.query), true);

	this.client.services.filter.query({
		domain: 'example.com'
	}, (response) => {

		assert(response !== null);
		assert(response, []);

	});

});

describe(disconnect_client);
after(disconnect_stealth);


export default finish('stealth/client/Filter');

