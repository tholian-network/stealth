
import process from 'process';

import { before, after, finish } from '../source/Review.mjs';
import { Service               } from './Service.mjs';

import { Stealth } from '../../stealth/source/Stealth.mjs';



export const connect = before('stealth.connect', function(assert) {

	this.server  = null;
	this.stealth = new Stealth({
		profile: '/tmp/covert-server',
		root:    process.env.PWD
	});

	this.stealth.connect(null, 13337, (result) => {

		this.server = this.stealth.server;
		this.stealth.server.services['mockup'] = new Service();

		assert(result);

	});

});

export const disconnect = after('stealth.disconnect', function(assert) {

	assert(this.stealth.disconnect());

	this.stealth = null;
	this.server  = null;

});


export default finish('Server');

