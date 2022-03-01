
import { isFunction                                                   } from '../../../../base/index.mjs';
import { after, before, describe, finish                              } from '../../../../covert/index.mjs';
import { Mode                                                         } from '../../../../stealth/source/client/service/Mode.mjs';
import { connect as connect_stealth, disconnect as disconnect_stealth } from '../../../../stealth/review/Stealth.mjs';
import { connect as connect_client, disconnect as disconnect_client   } from '../../../../stealth/review/Client.mjs';



before(connect_stealth);
before(connect_client);

describe('new Mode()', function(assert) {

	assert(this.client !== null);
	assert(this.client.services.mode instanceof Mode, true);

});

describe('Mode.prototype.toJSON()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.mode.toJSON), true);

	assert(this.client.services.mode.toJSON(), {
		type: 'Mode Service',
		data: {
			events:  [],
			journal: []
		}
	});

});

describe('Mode.prototype.save()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.mode.save), true);

	this.client.services.mode.save({
		domain: 'example.com',
		mode: {
			text:  false,
			image: true,
			audio: false,
			video: true,
			other: false
		}
	}, (response) => {

		assert(response, true);

	});

});

describe('Mode.prototype.read()/success', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.mode.read), true);

	this.client.services.mode.read({
		domain: 'example.com'
	}, (response) => {

		assert(response, {
			domain: 'example.com',
			mode: {
				text:  false,
				image: true,
				audio: false,
				video: true,
				other: false
			}
		});

	});

});

describe('Mode.prototype.remove()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.mode.remove), true);

	this.client.services.mode.remove({
		domain: 'example.com'
	}, (response) => {

		assert(response, true);

	});

});

describe('Mode.prototype.read()/failure', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.mode.read), true);

	this.client.services.mode.read({
		domain: 'example.com'
	}, (response) => {

		assert(response, null);

	});

});

after(disconnect_client);
after(disconnect_stealth);


export default finish('stealth/client/service/Mode', {
	internet: false,
	network:  true
});

