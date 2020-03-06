
import { after, before, describe, finish } from '../../source/Review.mjs';
import { connect as srv_connect, disconnect as srv_disconnect } from '../Server.mjs';
import { connect as cli_connect, disconnect as cli_disconnect } from '../Client.mjs';



before(srv_connect);
describe(cli_connect);

describe('client.services.mode.save', function(assert) {

	assert(this.client !== null);
	assert(typeof this.client.services.mode.save === 'function');

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
		assert(response === true);
	});

});

describe('client.services.mode.read', function(assert) {

	assert(this.client !== null);
	assert(typeof this.client.services.mode.read === 'function');

	this.client.services.mode.read({
		domain: 'example.com'
	}, (response) => {

		assert(response !== null && response.domain === 'example.com');
		assert(response !== null && response.mode.text === false);
		assert(response !== null && response.mode.image === true);
		assert(response !== null && response.mode.audio === false);
		assert(response !== null && response.mode.video === true);
		assert(response !== null && response.mode.other === false);

	});

});

describe('client.services.mode.remove', function(assert) {

	assert(this.client !== null);
	assert(typeof this.client.services.mode.remove === 'function');

	this.client.services.mode.remove({
		domain: 'example.com'
	}, (response) => {
		assert(response === true);
	});

});

describe('client.services.mode.read', function(assert) {

	assert(this.client !== null);
	assert(typeof this.client.services.mode.read === 'function');

	this.client.services.mode.read({
		domain: 'example.com'
	}, (response) => {
		assert(response === null);
	});

});

describe(cli_disconnect);
after(srv_disconnect);



export default finish('client/Mode');

