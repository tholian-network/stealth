
import { after, before, describe, finish                              } from '../../covert/index.mjs';
import { Client                                                       } from '../../stealth/source/Client.mjs';
import { connect as connect_stealth, disconnect as disconnect_stealth } from './Stealth.mjs';



before(connect_stealth);

export const connect = describe('client.connect', function(assert) {

	this.client = new Client();

	this.client.connect('127.0.0.1', (result) => {

		this.client.services['mockup'] = null;

		assert(result);

	});

});

describe('client.send/event', function(assert) {

	this.client.once('response', (response) => {
		assert(response.headers.service, 'mockup');
		assert(response.headers.event,   'event');
		assert(response.payload,         'payload');
	});

	this.client.send({
		headers: {
			service: 'mockup',
			event:   'event'
		},
		payload: 'payload'
	});

});

describe('client.send/method', function(assert) {

	this.client.once('response', (response) => {
		assert(response.headers.service, 'mockup');
		assert(response.headers.method,  'method');
		assert(response.payload,         'payload');
	});

	this.client.send({
		headers: {
			service: 'mockup',
			method:  'method'
		},
		payload: 'payload'
	});

});

export const disconnect = describe('client.disconnect', function(assert) {

	assert(this.client.disconnect());

	this.client = null;

});

after(disconnect_stealth);


export default finish('stealth/Client');

