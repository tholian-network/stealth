
import { after, before, describe, finish } from '../../source/Review.mjs';
import { connect as srv_connect, disconnect as srv_disconnect } from '../Server.mjs';
import { connect as cli_connect, disconnect as cli_disconnect } from '../Client.mjs';



before(srv_connect);
describe(cli_connect);

describe('client.services.filter.save', function(assert) {

	assert(this.client !== null);
	assert(typeof this.client.services.filter.save === 'function');

	this.client.services.filter.save({
		domain: 'example.com',
		filter: {
			prefix: '/filter-prefix',
			midfix: 'filter-midfix',
			suffix: '/filter-suffix.html'
		}
	}, (response) => {
		assert(response === true);
	});

});

describe('client.services.filter.query', function(assert) {

	assert(this.client !== null);
	assert(typeof this.client.services.filter.query === 'function');

	this.client.services.filter.query({
		domain: 'example.com'
	}, (response) => {

		assert(response !== null && response instanceof Array);
		assert(response !== null && response.length > 0);
		assert(response !== null && response[0].domain === 'example.com');
		assert(response !== null && response[0].filter.prefix === '/filter-prefix');
		assert(response !== null && response[0].filter.midfix === 'filter-midfix');
		assert(response !== null && response[0].filter.suffix === '/filter-suffix.html');

	});

});

describe('client.services.filter.remove', function(assert) {

	assert(this.client !== null);
	assert(typeof this.client.services.filter.remove === 'function');

	this.client.services.filter.remove({
		domain: 'example.com',
		filter: {
			prefix: '/filter-prefix',
			midfix: 'filter-midfix',
			suffix: '/filter-suffix.html'
		}
	}, (response) => {
		assert(response === true);
	});

});

describe('client.services.filter.query', function(assert) {

	assert(this.client !== null);
	assert(typeof this.client.services.filter.query === 'function');

	this.client.services.filter.query({
		domain: 'example.com'
	}, (response) => {

		assert(response !== null && response instanceof Array);
		assert(response !== null && response.length === 0);

	});

});

describe(cli_disconnect);
after(srv_disconnect);



export default finish('client/Filter');

