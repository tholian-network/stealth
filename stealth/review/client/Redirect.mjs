
import { after, before, describe, finish                              } from '../../../covert/index.mjs';
import { connect as connect_stealth, disconnect as disconnect_stealth } from '../Stealth.mjs';
import { connect as connect_client, disconnect as disconnect_client   } from '../Client.mjs';



before(connect_stealth);
describe(connect_client);

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

describe(disconnect_client);
after(disconnect_stealth);


export default finish('stealth/client/Redirect');

