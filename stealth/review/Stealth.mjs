
import { after, before, describe, finish, mktemp, root } from '../../covert/index.mjs';
import { Service                                       } from '../../covert/EXAMPLE.mjs';
import { hostname                                      } from '../../stealth/source/ENVIRONMENT.mjs';
import { Stealth, isStealth                            } from '../../stealth/source/Stealth.mjs';
import { isRequest                                     } from '../../stealth/source/Request.mjs';
import { Session, isSession                            } from '../../stealth/source/Session.mjs';



export const connect = before('Stealth.prototype.connect()', function(assert) {

	this.server  = null;
	this.stealth = new Stealth({
		profile: mktemp('stealth/Stealth', 8),
		root:    root
	});

	assert(this.stealth._settings.debug,   false);
	assert(this.stealth._settings.host,    null);
	assert(this.stealth._settings.root,    root);

	this.stealth.once('connect', () => {

		this.server = this.stealth.server;
		this.server.services['mockup'] = new Service();

		assert(true);

	});

	assert(this.stealth.connect());

});

describe('new Stealth()', function(assert) {

	let stealth = new Stealth({
		host: '127.0.0.3'
	});

	assert(stealth._settings.debug,    false);
	assert(stealth._settings.host,     '127.0.0.3');
	assert(stealth._settings.profile,  null);
	assert(stealth._settings.root,     root);

	assert(Stealth.isStealth(stealth), true);
	assert(isStealth(stealth),         true);

});

describe('Stealth.isStealth()', function(assert) {

	assert(typeof Stealth.isStealth, 'function');

	assert(Stealth.isStealth(this.stealth), true);

});

describe('isStealth()', function(assert) {

	assert(typeof isStealth, 'function');

	assert(isStealth(this.stealth), true);

});

describe('Stealth.prototype.destroy()', function(assert) {

	this.stealth.once('disconnect', () => {

		assert(this.stealth.is('connected'), false);
		assert(this.stealth.connect(),       true);

	});

	assert(this.stealth.is('connected'), true);
	assert(this.stealth.destroy(),       true);

});

describe('Stealth.prototype.open()', function(assert) {

	let request1 = this.stealth.open(null);
	let request2 = this.stealth.open('https://example.com/index.html');
	let request3 = this.stealth.open('https://example.com/index.html');

	assert(isRequest(request1), false);
	assert(isRequest(request2), true);
	assert(isRequest(request3), true);

	assert(request1,     null);
	assert(request2.url, 'https://example.com/index.html');
	assert(request3.url, 'https://example.com/index.html');

	assert(request2, request3);

});

describe('Stealth.prototype.track()', function(assert) {

	let session1 = new Session();
	let session2 = this.stealth.track(null, {
		'@remote': '127.0.0.2',
	});
	let session3 = this.stealth.track(null, {
		'@remote': '127.0.0.2',
	});

	assert(this.stealth.track(session1), session1);
	assert(this.stealth.track(session2), session2);
	assert(this.stealth.track(session3), session3);

	assert(isSession(session1), true);
	assert(isSession(session2), true);
	assert(isSession(session3), true);

	assert(session2, session3);

	assert(session1.domain.endsWith('.tholian.network'), true);
	assert(session2.domain, hostname);
	assert(session3.domain, hostname);

});

describe('Stealth.prototype.untrack()', function(assert) {

	let session1 = new Session();
	let session2 = this.stealth.track(null, {
		'@remote': '127.0.0.2',
	});

	assert(this.stealth.track(session1), session1);
	assert(this.stealth.track(session2), session2);

	assert(this.stealth.untrack(session1), true);
	assert(this.stealth.untrack(session2), true);

	assert(session1.tabs.length, 0);
	assert(session2.tabs.length, 0);

	assert(this.stealth.untrack(session1), false);
	assert(this.stealth.untrack(session2), false);

});

describe('Stealth.prototype.is()', function(assert) {

	assert(this.stealth.is('connected'), true);

});

export const disconnect = after('Stealth.prototype.disconnect()', function(assert) {

	this.stealth.once('disconnect', () => {

		this.stealth = null;
		this.server  = null;

		assert(true);

	});

	assert(this.stealth.disconnect(), true);

});


export default finish('stealth/Stealth');

