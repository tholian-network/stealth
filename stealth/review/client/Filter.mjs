
import { isFunction                                                   } from '../../../base/index.mjs';
import { after, before, describe, finish                              } from '../../../covert/index.mjs';
import { Filter                                                       } from '../../../stealth/source/client/Filter.mjs';
import { connect as connect_stealth, disconnect as disconnect_stealth } from '../Stealth.mjs';
import { connect as connect_client, disconnect as disconnect_client   } from '../Client.mjs';



before(connect_stealth);
before(connect_client);

describe('new Filter()', function(assert) {

	assert(this.client.services.filter instanceof Filter, true);

});

describe('Filter.prototype.save()', function(assert) {

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

describe('Filter.prototype.query()/success', function(assert) {

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

describe('Filter.prototype.remove()/success', function(assert) {

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

describe('Filter.prototype.query()/failure', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.filter.query), true);

	this.client.services.filter.query({
		domain: 'example.com'
	}, (response) => {

		assert(response !== null);
		assert(response, []);

	});

});

after(disconnect_client);
after(disconnect_stealth);


export default finish('stealth/client/Filter');

