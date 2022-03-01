
import { isFunction                      } from '../../../../base/index.mjs';
import { after, before, describe, finish } from '../../../../covert/index.mjs';
import { Redirect                        } from '../../../../stealth/source/server/service/Redirect.mjs';
import { connect, disconnect             } from '../../../../stealth/review/Server.mjs';



before(connect);

describe('new Redirect()', function(assert) {

	assert(this.server !== null);
	assert(this.server.services.redirect instanceof Redirect, true);

});

describe('Redirect.prototype.toJSON()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.redirect.toJSON), true);

	assert(this.server.services.redirect.toJSON(), {
		type: 'Redirect Service',
		data: {
			events:  [],
			journal: []
		}
	});

});

describe('Redirect.isRedirect()', function(assert) {

	assert(isFunction(Redirect.isRedirect), true);

	assert(Redirect.isRedirect(null), false);
	assert(Redirect.isRedirect({}),   false);

	assert(Redirect.isRedirect({
		domain:    'example.com',
		redirects: [{
			path:     '/review/server/redirect',
			query:    null,
			location: '/review/server/redirect/location.json'
		}]
	}), false);

	assert(Redirect.isRedirect({
		domain:   'example.com',
		redirects: [{
			path:     '/review/server/redirect',
			query:    'id=123&sid=123abc123',
			location: 'https://example.com/review/server/redirect/location.json'
		}]
	}), true);

});

describe('Redirect.toRedirect()', function(assert) {

	assert(isFunction(Redirect.toRedirect), true);

	assert(Redirect.toRedirect(null), null);
	assert(Redirect.toRedirect({}),   null);

	assert(Redirect.toRedirect({
		domain:    'example.com',
		another:   'property',
		redirects: [{
			path:     '/review/server/redirect',
			query:    'id=123&sid=123abc123',
			location: 'https://example.com/review/server/redirect/location.json',
			another:  'property'
		}]
	}), {
		domain:    'example.com',
		redirects: [{
			path:     '/review/server/redirect',
			query:    'id=123&sid=123abc123',
			location: 'https://example.com/review/server/redirect/location.json',
		}]
	});

});

describe('Redirect.prototype.save()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.redirect.save), true);

	this.server.services.redirect.save({
		domain:   'example.com',
		redirects: [{
			path:     '/review/server/redirect',
			query:    'id=123&sid=123abc123',
			location: 'https://example.com/review/server/redirect/location.json'
		}]
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
				redirects: [{
					path:     '/review/server/redirect',
					query:    'id=123&sid=123abc123',
					location: 'https://example.com/review/server/redirect/location.json'
				}]
			}
		});

	});

});

describe('Redirect.prototype.remove()', function(assert) {

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

after(disconnect);


export default finish('stealth/server/service/Redirect', {
	internet: false,
	network:  true
});

