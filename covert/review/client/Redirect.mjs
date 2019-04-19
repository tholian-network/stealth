
import { after, before, describe, finish } from '../../source/Review.mjs';
import { connect as srv_connect, disconnect as srv_disconnect } from '../Server.mjs';
import { connect as cli_connect, disconnect as cli_disconnect } from '../Client.mjs';



before(srv_connect);
describe(cli_connect);

describe('client.services.redirect.save', function(assert) {

	assert(this.client !== null);
	assert(typeof this.client.services.redirect.save === 'function');

	this.client.services.redirect.save({
		domain:   'example.com',
		path:     '/review/client/redirect',
		location: 'https://example.com/review/client/redirect/location.json'
	}, (response) => {
		assert(response === true);
	});

});

describe('client.services.redirect.read', function(assert) {

	assert(this.client !== null);
	assert(typeof this.client.services.redirect.read === 'function');

	this.client.services.redirect.read({
		domain: 'example.com',
		path:   '/review/client/redirect'
	}, (response) => {

		assert(response !== null && response.domain === 'example.com');
		assert(response !== null && response.path === '/review/client/redirect');
		assert(response !== null && response.location === 'https://example.com/review/client/redirect/location.json');

	});

});

describe('client.services.redirect.remove', function(assert) {

	assert(this.client !== null);
	assert(typeof this.client.services.redirect.remove === 'function');

	this.client.services.redirect.remove({
		domain: 'example.com',
		path:   '/review/client/redirect'
	}, (response) => {
		assert(response === true);
	});

});

describe(cli_disconnect);
after(srv_disconnect);


export default finish('client/Redirect');

