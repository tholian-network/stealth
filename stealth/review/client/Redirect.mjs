
import { isFunction                                                   } from '../../../base/index.mjs';
import { after, before, describe, finish                              } from '../../../covert/index.mjs';
import { Redirect                                                     } from '../../../stealth/source/client/Redirect.mjs';
import { connect as connect_stealth, disconnect as disconnect_stealth } from '../Stealth.mjs';
import { connect as connect_client, disconnect as disconnect_client   } from '../Client.mjs';



before(connect_stealth);
before(connect_client);

describe('new Redirect()', function(assert) {

	assert(this.client.services.redirect instanceof Redirect, true);

});

describe('Redirect.prototype.save()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.redirect.save), true);

	this.client.services.redirect.save({
		domain:   'example.com',
		path:     '/review/client/redirect',
		location: 'https://example.com/review/client/redirect/location.json'
	}, (response) => {
		assert(response, true);
	});

});

describe('Redirect.prototype.read()/success', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.redirect.read), true);

	this.client.services.redirect.read({
		domain: 'example.com',
		path:   '/review/client/redirect'
	}, (response) => {

		assert(response !== null);
		assert(response, {
			domain:   'example.com',
			path:     '/review/client/redirect',
			location: 'https://example.com/review/client/redirect/location.json'
		});

	});

});

describe('Redirect.prototype.remove()/success', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.redirect.remove), true);

	this.client.services.redirect.remove({
		domain: 'example.com',
		path:   '/review/client/redirect'
	}, (response) => {
		assert(response, true);
	});

});

describe('Redirect.prototype.read()/failure', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.redirect.read), true);

	this.client.services.redirect.read({
		domain: 'example.com',
		path:   '/review/client/redirect'
	}, (response) => {
		assert(response, null);
	});

});

describe('Redirect.prototype.remove()/success', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.redirect.remove), true);

	this.client.services.redirect.remove({
		domain: 'example.com',
		path:   '/review/client/redirect'
	}, (response) => {
		assert(response, true);
	});

});

after(disconnect_client);
after(disconnect_stealth);


export default finish('stealth/client/Redirect');

