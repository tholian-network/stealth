
import { isFunction                      } from '../../../../base/index.mjs';
import { after, before, describe, finish } from '../../../../covert/index.mjs';
import { ENVIRONMENT                     } from '../../../../stealth/source/ENVIRONMENT.mjs';
import { Peer                            } from '../../../../stealth/source/server/service/Peer.mjs';
import { connect, disconnect             } from '../../../../stealth/review/Server.mjs';



before(connect);

describe('new Peer()', function(assert) {

	assert(this.server !== null);
	assert(this.server.services.peer instanceof Peer, true);

});

describe('Peer.prototype.toJSON()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.peer.toJSON), true);

	assert(this.server.services.peer.toJSON(), {
		type: 'Peer Service',
		data: {
			events:  [],
			journal: []
		}
	});

});

describe('Peer.isPeer()', function(assert) {

	assert(isFunction(Peer.isPeer), true);

	assert(Peer.isPeer(null), false);
	assert(Peer.isPeer({}),   false);

	assert(Peer.isPeer({
		domain: '1.3.3.7',
		peer:   {
			connection: 'invalid'
		}
	}), false);

	assert(Peer.isPeer({
		domain: '127.0.0.3',
		peer:   {
			connection: 'offline'
		}
	}), true);

});

describe('Peer.toPeer()', function(assert) {

	assert(isFunction(Peer.toPeer), true);

	assert(Peer.toPeer(null), null);
	assert(Peer.toPeer({}),   null);

	assert(Peer.toPeer({
		domain: '1.3.3.7',
		peer:   {
			connection: 'invalid'
		}
	}), {
		domain: '1.3.3.7',
		peer:   {
			connection: 'offline'
		}
	});

	assert(Peer.toPeer({
		domain: '127.0.0.3',
		peer:   {
			connection: 'mobile'
		}
	}), {
		domain: '127.0.0.3',
		peer:   {
			connection: 'mobile'
		}
	});

});

describe('Peer.prototype.save()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.peer.save), true);

	this.server.services.peer.save({
		host: '127.0.0.3',
		peer: {
			connection: 'mobile'
		}
	}, (response) => {

		assert(response, {
			headers: {
				service: 'peer',
				event:   'save'
			},
			payload: true
		});

	});

});

describe('Peer.prototype.info()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.peer.info), true);

	this.server.services.peer.info({
		host: '127.0.0.3'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'peer',
				event:   'info'
			},
			payload: {
				domain: ENVIRONMENT.hostname,
				peer:   {
					connection: 'mobile'
				}
			}
		});

	});

});

describe('Peer.prototype.read()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.peer.read), true);

	this.server.services.peer.read({
		host: '127.0.0.3'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'peer',
				event:   'read'
			},
			payload: {
				domain: '127.0.0.3',
				peer:   {
					connection: 'mobile'
				}
			}
		});

	});

});

describe('Peer.prototype.proxy()/success', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.peer.proxy), true);

	this.server.services.peer.proxy({
		host: '127.0.0.3',
		headers: {
			service: 'settings',
			method:  'read'
		},
		payload: {
			internet: true
		}
	}, (response) => {

		assert(response.headers, {
			service: 'peer',
			event:   'proxy'
		});

		assert(response.payload.internet, {
			connection: 'mobile',
			history:    'stealth',
			useragent:  'stealth'
		});

	});

});

describe('Peer.prototype.refresh()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.peer.refresh), true);

	this.server.services.peer.refresh({
		host: '127.0.0.3'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'peer',
				event:   'refresh'
			},
			payload: {
				domain: '127.0.0.3',
				peer:   {
					connection: 'mobile'
				}
			}
		});

	});

});

describe('Peer.prototype.remove()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.peer.remove), true);

	this.server.services.peer.remove({
		host: '127.0.0.3'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'peer',
				event:   'remove'
			},
			payload: true
		});

	});

});

describe('Peer.prototype.proxy()/failure', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.peer.proxy), true);

	this.server.services.peer.proxy({
		host: '127.0.0.3',
		headers: {
			service: 'settings',
			method:  'read'
		},
		payload: {
			internet: true
		}
	}, (response) => {

		assert(response, {
			_warn_: true,
			headers: {
				service: 'peer',
				event:   'proxy'
			},
			payload: null
		});

	});

});

after(disconnect);


export default finish('stealth/server/service/Peer', {
	internet: false,
	network:  true
});

