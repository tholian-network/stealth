
import process from 'process';
import { before, after } from './TESTSUITE.mjs';

import { Emitter } from '../../stealth/source/Emitter.mjs';
import { Stealth } from '../../stealth/source/Stealth.mjs';



export const Service = function() {

	Emitter.call(this);

	this.on('event', (payload) => {

		return {
			headers: {
				service: 'mockup',
				event:   'event'
			},
			payload: payload
		};

	});

};

Service.prototype = Object.assign({}, Emitter.prototype, {

	'method': function(payload, callback) {

		callback({
			headers: {
				service: 'mockup',
				method:  'method'
			},
			payload: payload
		});

	}

});



export const connect = before('stealth.connect', (assert, expect) => {

	this.stealth = new Stealth({
		profile: '/tmp/covert-server',
		root:    process.env.PWD
	});

	expect((done) => {

		this.stealth.connect(null, 13337, (result) => {
			this.stealth.server.services['mockup'] = new Service();
			done(result);
		});

	});

});

export const disconnect = after('stealth.disconnect', (assert, expect) => {

	assert(this.stealth.disconnect());
	this.stealth = null;

});

