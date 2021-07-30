
import { isBuffer, isFunction, isObject  } from '../../../../base/index.mjs';
import { after, before, describe, finish } from '../../../../covert/index.mjs';
import { ENVIRONMENT                     } from '../../../../stealth/source/ENVIRONMENT.mjs';
import { Session                         } from '../../../../stealth/source/server/service/Session.mjs';
import { Session as Instance             } from '../../../../stealth/source/Session.mjs';
import { URL                             } from '../../../../stealth/source/parser/URL.mjs';
import { connect, disconnect             } from '../../../../stealth/review/Server.mjs';



before(connect);

describe('new Session()', function(assert) {

	assert(this.server !== null);
	assert(this.server.services.session instanceof Session, true);

});

describe('Session.prototype.toJSON()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.session.toJSON), true);

	assert(this.server.services.session.toJSON(), {
		type: 'Session Service',
		data: {
			events:  [],
			journal: []
		}
	});

});

describe('Session.isSession()', function(assert) {

	assert(isFunction(Session.isSession), true);

	assert(Session.isSession(null), false);
	assert(Session.isSession({}),   false);

	assert(Session.isSession(new Instance()), true);

});

describe('Session.prototype.download()/failure', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.session.download), true);

	this.server.services.session.download(URL.parse('https://example.com/index.html'), (response) => {

		assert(response, {
			headers: {
				service: 'session',
				event:   'download'
			},
			payload: null
		});

	});

});

describe('Mode.prototype.save()/success', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.mode.save), true);

	this.server.services.mode.save({
		domain: 'example.com',
		mode: {
			text:  true,
			image: false,
			audio: false,
			video: false,
			other: false
		}
	}, (response) => {

		assert(response, {
			headers: {
				service: 'mode',
				event:   'save'
			},
			payload: true
		});

	});

});

describe('Session.prototype.download()/success', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.session.download), true);

	this.server.services.session.download(URL.parse('https://example.com/index.html'), (response) => {

		assert(isObject(response), true);
		assert(response.headers,   {
			service: 'session',
			event:   'download'
		});

		assert(isObject(response.payload), true);
		assert(isObject(response.payload.headers), true);
		assert(isBuffer(response.payload.payload), true);

		assert(response.payload.payload.toString('utf8').includes('<html>'));
		assert(response.payload.payload.toString('utf8').includes('<title>Example Domain</title>'));
		assert(response.payload.payload.toString('utf8').includes('</html>'));

	});


});

describe('Session.prototype.query()/all', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.session.query), true);

	this.server.services.session.query({
		domain: '*'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'session',
				event:   'query'
			},
			payload: [{
				type: 'Session',
				data: {
					agent:   null,
					domain:  ENVIRONMENT.hostname,
					tabs:    [],
					warning: 0
				}
			}]
		});

	});

});

describe('Session.prototype.query()/domain/success', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.session.query), true);

	this.server.services.session.query({
		domain: ENVIRONMENT.hostname
	}, (response) => {

		assert(response, {
			headers: {
				service: 'session',
				event:   'query'
			},
			payload: [{
				type: 'Session',
				data: {
					agent:   null,
					domain:  ENVIRONMENT.hostname,
					tabs:    [],
					warning: 0
				}
			}]
		});

	});

});

describe('Session.prototype.query()/domain/failure', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.session.query), true);

	this.server.services.session.query({
		domain: 'does-not-exist'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'session',
				event:   'query'
			},
			payload: []
		});

	});

});

describe('Session.prototype.read()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.session.read), true);

	this.server.services.session.read({}, (response) => {

		assert(response, {
			headers: {
				service: 'session',
				event:   'read'
			},
			payload: {
				type: 'Session',
				data: {
					agent:   null,
					domain:  ENVIRONMENT.hostname,
					tabs:    [],
					warning: 0
				}
			}
		});

	});

});

describe('Session.prototype.remove()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.session.remove), true);

	this.server.services.session.remove({
		domain: ENVIRONMENT.hostname
	}, (response) => {

		assert(response, {
			headers: {
				service: 'session',
				event:   'remove'
			},
			payload: true
		});

	});

});

after(disconnect);


export default finish('stealth/server/service/Session', {
	internet: true,
	network:  true
});

