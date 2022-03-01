
import { isFunction                                                   } from '../../../../base/index.mjs';
import { after, before, describe, finish                              } from '../../../../covert/index.mjs';
import { Redirect                                                     } from '../../../../stealth/source/client/service/Redirect.mjs';
import { connect as connect_stealth, disconnect as disconnect_stealth } from '../../../../stealth/review/Stealth.mjs';
import { connect as connect_client, disconnect as disconnect_client   } from '../../../../stealth/review/Client.mjs';



before(connect_stealth);
before(connect_client);

describe('new Redirect()', function(assert) {

	assert(this.client !== null);
	assert(this.client.services.redirect instanceof Redirect, true);

});

describe('Redirect.prototype.toJSON()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.redirect.toJSON), true);

	assert(this.client.services.redirect.toJSON(), {
		type: 'Redirect Service',
		data: {
			events:  [],
			journal: []
		}
	});

});

describe('Redirect.prototype.save()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.redirect.save), true);

	this.client.services.redirect.save({
		domain:   'example.com',
		redirects: [{
			path:     '/review/client/redirect',
			query:    'id=123&sid=123abc123',
			location: 'https://example.com/review/client/redirect/location.json'
		}]
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

		assert(response, {
			domain:   'example.com',
			redirects: [{
				path:     '/review/client/redirect',
				query:    'id=123&sid=123abc123',
				location: 'https://example.com/review/client/redirect/location.json'
			}]
		});

	});

});

describe('Redirect.prototype.remove()', function(assert) {

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

after(disconnect_client);
after(disconnect_stealth);


export default finish('stealth/client/service/Redirect', {
	internet: false,
	network:  true
});

