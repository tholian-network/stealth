
import process from 'process';

import { after, before, finish } from '../source/Review.mjs';
import { Service               } from '../source/Service.mjs';
import { Stealth               } from '../../stealth/source/Stealth.mjs';



const random = () => {

	return [
		((Math.random() * 0xffff) | 0).toString(16),
		((Math.random() * 0xffff) | 0).toString(16)
	].map((v) => '0000'.substr(0, 4 - v.length) + v).join('');

};


export const connect = before('stealth.connect', function(assert) {

	this.server  = null;
	this.stealth = new Stealth({
		profile: '/tmp/covert' + '.' + random(),
		root:    process.env.PWD
	});

	this.stealth.connect(null, (result) => {

		this.server = this.stealth.server;
		this.server.services['mockup'] = new Service();

		assert(result);

	});

});

export const disconnect = after('stealth.disconnect', function(assert) {

	assert(this.stealth.disconnect());

	this.stealth = null;
	this.server  = null;

});


export default finish('Server');

