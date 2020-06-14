
import { isFunction                      } from '../../../base/index.mjs';
import { after, before, describe, finish } from '../../../covert/index.mjs';
import { Redirect                        } from '../../../stealth/source/server/Redirect.mjs';
import { connect, disconnect             } from '../Server.mjs';



before(connect);

describe('new Redirect()', function(assert) {

	assert(this.server !== null);
	assert(this.server.services.redirect instanceof Redirect, true);

});

describe('Redirect.isRedirect()', function(assert) {

	assert(isFunction(Redirect.isRedirect), true);

	assert(Redirect.isRedirect(null), false);
	assert(Redirect.isRedirect({}),   false);

	assert(Redirect.isRedirect({
		domain:   'example.com',
		path:     '/review/server/redirect',
		location: '/review/server/redirect/location.json'
	}), false);

	assert(Redirect.isRedirect({
		domain:   'example.com',
		path:     '/review/server/redirect',
		location: 'https://example.com/review/server/redirect/location.json'
	}), true);

});

describe('Redirect.prototype.save()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.redirect.save), true);

	this.server.services.redirect.save({
		domain:   'example.com',
		path:     '/review/server/redirect',
		location: 'https://example.com/review/server/redirect/location.json'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'redirect',
				event:   'save'
			},
			payload: true
		});

	});

});

describe('Redirect.prototype.read()/success', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.redirect.read), true);

	this.server.services.redirect.read({
		domain: 'example.com',
		path:   '/review/server/redirect'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'redirect',
				event:   'read'
			},
			payload: {
				domain:   'example.com',
				path:     '/review/server/redirect',
				location: 'https://example.com/review/server/redirect/location.json'
			}
		});

	});

});

describe('Redirect.prototype.remove()/success', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.redirect.remove), true);

	this.server.services.redirect.remove({
		domain: 'example.com',
		path:   '/review/server/redirect'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'redirect',
				event:   'remove'
			},
			payload: true
		});

	});

});

describe('Redirect.prototype.read()/failure', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.redirect.read), true);

	this.server.services.redirect.read({
		domain: 'example.com',
		path:   '/review/server/redirect'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'redirect',
				event:   'read'
			},
			payload: null
		});

	});

});

describe('Redirect.prototype.remove()/success', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.redirect.remove), true);

	this.server.services.redirect.remove({
		domain: 'example.com',
		path:   '/review/server/redirect'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'redirect',
				event:   'remove'
			},
			payload: true
		});

	});

});

after(disconnect);


export default finish('stealth/server/Redirect');

