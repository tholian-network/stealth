
import { isFunction, isObject                                         } from '../../../base/index.mjs';
import { after, before, describe, finish                              } from '../../../covert/index.mjs';
import { Mode                                                         } from '../../../stealth/source/client/Mode.mjs';
import { connect as connect_stealth, disconnect as disconnect_stealth } from '../Stealth.mjs';
import { connect as connect_client, disconnect as disconnect_client   } from '../Client.mjs';



before(connect_stealth);
before(connect_client);

describe('new Mode()', function(assert) {

	assert(this.client.services.mode instanceof Mode, true);

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

		assert(response !== null);
		assert(response.domain,         'example.com');
		assert(isObject(response.mode), true);
		assert(response.mode.text,      false);
		assert(response.mode.image,     true);
		assert(response.mode.audio,     false);
		assert(response.mode.video,     true);
		assert(response.mode.other,     false);

	});

});

describe('Mode.prototype.remove()/success', function(assert) {

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

describe('Mode.prototype.remove()/failure', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.mode.remove), true);

	this.client.services.mode.remove({
		domain: 'example.com'
	}, (response) => {
		assert(response, true);
	});

});

after(disconnect_client);
after(disconnect_stealth);


export default finish('stealth/client/Mode');

