
import { after, before, describe, finish, mktemp, root } from '../../covert/index.mjs';
import { Service                                       } from '../../covert/EXAMPLE.mjs';
import { Stealth                                       } from '../../stealth/source/Stealth.mjs';



export const connect = before('stealth.connect', function(assert) {

	this.server  = null;
	this.stealth = new Stealth({
		profile: mktemp('stealth/Stealth', 8),
		root:    root
	});

	this.stealth.once('connect', () => {

		this.server = this.stealth.server;
		this.server.services['mockup'] = new Service();

		assert(true);

	});

	assert(this.stealth.connect());

});

describe('stealth.destroy', function(assert) {
});

describe('stealth.open', function(assert) {
});

describe('stealth.track', function(assert) {
});

describe('stealth.untrack', function(assert) {
});

export const disconnect = after('stealth.disconnect', function(assert) {

	this.stealth.once('disconnect', () => {

		this.server = null;

		assert(true);

	});

	assert(this.stealth.disconnect());

	this.stealth = null;
	this.server  = null;

});


export default finish('stealth/Stealth');

