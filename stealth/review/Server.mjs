
import { isFunction                      } from '../../base/index.mjs';
import { after, before, describe, finish } from '../../covert/index.mjs';
import { ENVIRONMENT as SANDBOX          } from '../../covert/index.mjs';
import { Server, isServer                } from '../../stealth/source/Server.mjs';
import { Stealth                         } from '../../stealth/source/Stealth.mjs';



export const connect = before('Server.prototype.connect()', function(assert) {

	this.server  = null;
	this.stealth = new Stealth({
		profile: SANDBOX.mktemp('stealth/Server', 8),
		action:  'serve'
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

	assert(isFunction(Server.isServer), true);

	assert(Server.isServer(this.server), true);

});

describe('isServer()', function(assert) {

	assert(isFunction(isServer), true);

	assert(isServer(this.server), true);

});

describe('Server.prototype.toJSON()', function(assert) {

	let server = new Server({
		host: '127.0.0.4'
	}, this.stealth);

	let json = server.toJSON();

	assert(json.type, 'Server');
	assert(json.data, {
		events: [],
		journal: [],
		services: {
			beacon: {
				type: 'Beacon Service',
				data: {
					events: [],
					journal: []
				}
			},
			blocker: {
				type: 'Blocker Service',
				data: {
					events: [],
					journal: []
				}
			},
			cache: {
				type: 'Cache Service',
				data: {
					events: [],
					journal: []
				}
			},
			host: {
				type: 'Host Service',
				data: {
					events: [],
					journal: []
				}
			},
			mode: {
				type: 'Mode Service',
				data: {
					events: [],
					journal: []
				}
			},
			peer: {
				type: 'Peer Service',
				data: {
					events: [],
					journal: []
				}
			},
			policy: {
				type: 'Policy Service',
				data: {
					events: [],
					journal: []
				}
			},
			redirect: {
				type: 'Redirect Service',
				data: {
					events: [],
					journal: []
				}
			},
			session: {
				type: 'Session Service',
				data: {
					events: [],
					journal: []
				}
			},
			settings: {
				type: 'Settings Service',
				data: {
					events: [],
					journal: []
				}
			},
			stash: {
				type: 'Stash Service',
				data: {
					events: [],
					journal: []
				}
			}
		},
		settings: {
			host: '127.0.0.4'
		},
		stealth: null,
		state: {
			connected: false,
			connections: []
		}
	});

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


export default finish('stealth/Server', {
	internet: false,
	network:  true
});

