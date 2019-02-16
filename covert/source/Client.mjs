
import process from 'process';
import { after, attach, before, describe } from './TESTSUITE.mjs';

import { Client  } from '../../stealth/source/Client.mjs';
import { Stealth } from '../../stealth/source/Stealth.mjs';
import { Service } from '../../covert/source/Server.mjs';
import { connect, disconnect } from './Server.mjs';



attach(before, connect);

describe('connect', (assert, expect) => {

	this.client = new Client();

	expect((done) => {
		this.client.connect('localhost', 13337, (result) => {
			this.client.services['mockup'] = null;
			done(result);
		});
	});

});

describe('send event', (assert, expect) => {

	expect((done) => {

		this.client.once('request', (request) => {
			done(
				request.headers.service === 'mockup'
				&& request.headers.event === 'event'
				&& request.payload === 'payload'
			);
		});

	});

	this.client.send({
		headers: {
			service: 'mockup',
			event:   'event'
		},
		payload: 'payload'
	});

});

describe('send method', (assert, expect) => {

	expect((done) => {

		this.client.once('request', (request) => {
			done(
				request.headers.service === 'mockup'
				&& request.headers.event === 'event'
				&& request.payload === 'payload'
			);
		});

	});

	this.client.send({
		headers: {
			service: 'mockup',
			method:  'method'
		},
		payload: 'payload'
	});

});

attach(after, disconnect);

