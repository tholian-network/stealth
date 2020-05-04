
import { after, before, describe, finish, mktemp, root } from '../../covert/index.mjs';
import { Server, isServer                              } from '../../stealth/source/Server.mjs';
import { Stealth                                       } from '../../stealth/source/Stealth.mjs';



export const connect = before('Server.prototype.connect()', function(assert) {

	this.server  = null;
	this.stealth = new Stealth({
		profile: mktemp('stealth/Server', 8),
		root:    root
	});

	this.stealth.once('connect', () => {

		this.server = this.stealth.server;

		assert(true);

	});

	assert(this.stealth.connect());

});

describe('new Server()', function(assert) {

	let server = new Server({
		host: '127.0.0.4'
	});

	assert(server._settings.host, '127.0.0.4');

	assert(Server.isServer(server), true);
	assert(isServer(server),        true);

});

describe('Server.isServer()', function(assert) {

	assert(typeof Server.isServer, 'function');

	assert(Server.isServer(this.server), true);

});

describe('isServer()', function(assert) {

	assert(typeof isServer, 'function');

	assert(isServer(this.server), true);

});

export const disconnect = after('Server.prototype.disconnect()', function(assert) {

	this.stealth.once('disconnect', () => {

		this.server = null;

		assert(true);

	});

	assert(this.stealth.disconnect());

	this.stealth = null;
	this.server  = null;

});


export default finish('stealth/Server');

