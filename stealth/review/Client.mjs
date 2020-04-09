
import { after, before, describe, finish                      } from '../../covert/index.mjs';
import { connect as srv_connect, disconnect as srv_disconnect } from './Server.mjs';
import { Client                                               } from '../source/Client.mjs';



before(srv_connect);

export const connect = describe('client.connect', function(assert) {

	this.client = new Client();

	this.client.connect('127.0.0.1', (result) => {

		this.client.services['mockup'] = null;

		assert(result);

	});

});

describe('client.send/event', function(assert) {

	this.client.once('response', (response) => {
		assert(response.headers.service === 'mockup');
		assert(response.headers.event === 'event');
		assert(response.payload === 'payload');
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
		assert(response.headers.service === 'mockup');
		assert(response.headers.method === 'method');
		assert(response.payload === 'payload');
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

after(srv_disconnect);


export default finish('stealth/Client');

