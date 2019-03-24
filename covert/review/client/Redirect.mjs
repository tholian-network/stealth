
import { after, before, describe, finish } from '../../source/Review.mjs';
import { connect as srv_connect, disconnect as srv_disconnect } from '../Server.mjs';
import { connect as cli_connect, disconnect as cli_disconnect } from '../Client.mjs';



before(srv_connect);
describe(cli_connect);

describe('client.services.redirect.save', function(assert) {

	assert(this.client !== null);
	assert(typeof this.client.services.redirect.save === 'function');

	this.client.services.redirect.save({
		domain:   'stealth.xyz',
		path:     '/test/redirect-absolute',
		location: 'https://stealth.xyz/test/redirect-absolute/location.json'
	}, (response) => {
		assert(response === true);
	});

});

describe('client.services.redirect.read', function(assert) {

	assert(this.client !== null);
	assert(typeof this.client.services.redirect.read === 'function');

	this.client.services.redirect.read({
		domain: 'stealth.xyz',
		path:   '/test/redirect-absolute'
	}, (response) => {

		assert(response !== null && response.domain === 'stealth.xyz');
		assert(response !== null && response.path === '/test/redirect-absolute');
		assert(response !== null && response.location === 'https://stealth.xyz/test/redirect-absolute/location.json');

	});

});

describe('client.services.redirect.remove', function(assert) {

	assert(this.client !== null);
	assert(typeof this.client.services.redirect.remove === 'function');

	this.client.services.redirect.remove({
		domain: 'stealth.xyz',
		path:   '/test/redirect-absolute'
	}, (response) => {
		assert(response === true);
	});

});

describe(cli_disconnect);
after(srv_disconnect);


export default finish('client/Redirect');

