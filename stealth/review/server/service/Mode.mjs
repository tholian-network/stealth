
import { isFunction                      } from '../../../../base/index.mjs';
import { after, before, describe, finish } from '../../../../covert/index.mjs';
import { Mode                            } from '../../../../stealth/source/server/service/Mode.mjs';
import { connect, disconnect             } from '../../../../stealth/review/Server.mjs';



before(connect);

describe('new Mode()', function(assert) {

	assert(this.server !== null);
	assert(this.server.services.mode instanceof Mode, true);

});

describe('Mode.prototype.toJSON()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.mode.toJSON), true);

	assert(this.server.services.mode.toJSON(), {
		type: 'Mode Service',
		data: {
			events:  [],
			journal: []
		}
	});

});

describe('Mode.isMode()', function(assert) {

	assert(isFunction(Mode.isMode), true);

	assert(Mode.isMode(null), false);
	assert(Mode.isMode({}),   false);

	assert(Mode.isMode({
		domain: 'example.com',
		mode: {
			text:  false,
			image: true,
			audio: false,
			video: true,
			other: false
		}
	}), true);

});

describe('Mode.toMode()', function(assert) {

	assert(isFunction(Mode.toMode), true);

	assert(Mode.toMode(null), null);
	assert(Mode.toMode({}),   null);

	assert(Mode.toMode({
		domain: 'example.com',
		mode:   {}
	}), {
		domain: 'example.com',
		mode: {
			text:  false,
			image: false,
			audio: false,
			video: false,
			other: false
		}
	});

	assert(Mode.toMode({
		domain: 'example.com',
		mode:   {
			text:  true,
			image: false,
			audio: true
		}
	}), {
		domain: 'example.com',
		mode: {
			text:  true,
			image: false,
			audio: true,
			video: false,
			other: false
		}
	});

});

describe('Mode.prototype.save()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.mode.save), true);

	this.server.services.mode.save({
		domain: 'example.com',
		mode: {
			text:  false,
			image: true,
			audio: false,
			video: true,
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

describe('Mode.prototype.read()/success', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.mode.read), true);

	this.server.services.mode.read({
		domain: 'example.com'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'mode',
				event:   'read'
			},
			payload: {
				domain: 'example.com',
				mode: {
					text:  false,
					image: true,
					audio: false,
					video: true,
					other: false
				}
			}
		});

	});

});

describe('Mode.prototype.remove()', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.mode.remove), true);

	this.server.services.mode.remove({
		domain: 'example.com'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'mode',
				event:   'remove'
			},
			payload: true
		});

	});

});

describe('Mode.prototype.read()/failure', function(assert) {

	assert(this.server !== null);
	assert(isFunction(this.server.services.mode.read), true);

	this.server.services.mode.read({
		domain: 'example.com'
	}, (response) => {

		assert(response, {
			headers: {
				service: 'mode',
				event:   'read'
			},
			payload: null
		});

	});

});

after(disconnect);


export default finish('stealth/server/service/Mode', {
	internet: false,
	network:  true
});

